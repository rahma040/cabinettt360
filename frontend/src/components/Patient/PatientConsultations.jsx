import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaCalendarCheck,
  FaCalendarPlus,
  FaClock,
  FaPaperPlane,
  FaHistory,
  FaSpinner,
  FaStickyNote,
  FaUserMd,
} from "react-icons/fa";

const api = axios.create({ baseURL: "http://127.0.0.1:8000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const PatientConsultations = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [patient, setPatient] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");
  const [formData, setFormData] = useState({
    appointment_date: "",
    start_time: "",
    end_time: "",
    notes: "",
  });

  const loadData = async () => {
    try {
      const response = await api.get("/patient/appointments");
      setAppointments(Array.isArray(response.data?.appointments) ? response.data.appointments : []);
      setPatient(response.data?.patient || null);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      setError(err.response?.data?.error || "Impossible de charger vos consultations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    loadData();
  }, [navigate]);

  const { upcomingAppointments, pastAppointments, pendingRequests } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = [];
    const past = [];
    const pendingRequests = [];

    appointments.forEach((appointment) => {
      const appointmentDate = new Date(appointment.appointment_date);
      appointmentDate.setHours(0, 0, 0, 0);
      const isPendingRequest = appointment.request_status === "pending";

      if (isPendingRequest) {
        pendingRequests.push(appointment);
      } else if (appointmentDate >= today && appointment.status === "scheduled") {
        upcoming.push(appointment);
      } else {
        past.push(appointment);
      }
    });

    const sortByDate = (a, b) => {
      const dateA = `${a.appointment_date} ${a.start_time || "00:00"}`;
      const dateB = `${b.appointment_date} ${b.start_time || "00:00"}`;
      return new Date(dateA) - new Date(dateB);
    };

    return {
      upcomingAppointments: upcoming.sort(sortByDate),
      pastAppointments: past.sort(sortByDate).reverse(),
      pendingRequests: pendingRequests.sort(sortByDate),
    };
  }, [appointments]);

  const resetForm = () => {
    setFormData({ appointment_date: "", start_time: "", end_time: "", notes: "" });
    setRequestError("");
    setRequestSuccess("");
  };

  const openRequestModal = () => {
    resetForm();
    setShowRequestModal(true);
  };

  const handleRequestAppointment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setRequestError("");
    setRequestSuccess("");

    try {
      await api.post("/patient/appointments", formData);
      setRequestSuccess("Votre demande de rendez-vous a été envoyée.");
      setShowRequestModal(false);
      resetForm();
      await loadData();
    } catch (err) {
      setRequestError(err.response?.data?.error || "Impossible de créer la demande.");
    } finally {
      setSubmitting(false);
    }
  };

  const appointmentCard = (appointment) => {
    const getStatusColor = (status) => {
      if (status === 'accepted') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      if (status === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
      if (status === 'denied') return 'bg-rose-50 text-rose-700 border-rose-200';
      return 'bg-slate-50 text-slate-700 border-slate-200';
    };

    const getStatusLabel = (status) => {
      if (status === 'accepted') return 'Accepté';
      if (status === 'pending') return 'En attente';
      if (status === 'denied') return 'Refusé';
      return status;
    };

    return (
      <div key={appointment.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sky-600 text-sm font-semibold">
              <FaCalendarCheck />
              {new Date(appointment.appointment_date).toLocaleDateString("fr-FR", {
                weekday: "short",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </div>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              {appointment.doctor?.name || "Médecin"}
            </h3>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="flex items-center gap-1"><FaClock /> {appointment.start_time?.substring(0, 5)} - {appointment.end_time?.substring(0, 5)}</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs capitalize text-slate-700">{appointment.status}</span>
              {appointment.request_status && (
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(appointment.request_status)}`}>
                  {getStatusLabel(appointment.request_status)}
                </span>
              )}
            </div>
          </div>
          {appointment.notes && (
            <div className="max-w-lg rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <div className="mb-1 flex items-center gap-2 text-slate-800 font-semibold"><FaStickyNote /> Notes</div>
              {appointment.notes}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-white text-slate-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Mes consultations</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Rendez-vous et historique</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/patientdb")}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition-all hover:bg-slate-100"
          >
            <FaArrowLeft className="inline-block mr-2" />
            Retour
          </button>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Chargement des consultations...</div>
        )}

        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>}
        {requestSuccess && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">{requestSuccess}</div>}

        {!loading && !error && (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm">
                  <FaCalendarPlus className="text-sky-600" />
                  <p className="mt-4 text-sm text-sky-700 font-semibold">À venir</p>
                  <p className="mt-1 text-3xl font-bold">{upcomingAppointments.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <FaHistory className="text-emerald-600" />
                  <p className="mt-4 text-sm text-slate-500 font-semibold">Passés</p>
                  <p className="mt-1 text-3xl font-bold">{pastAppointments.length}</p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                  <FaClock className="text-amber-600" />
                  <p className="mt-4 text-sm text-amber-700 font-semibold">Mes demandes de rendez-vous</p>
                  <p className="mt-1 text-3xl font-bold">{pendingRequests.length}</p>
                </div>
              </div>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-slate-900">Prochains rendez-vous</h2>
                  <span className="text-xs uppercase tracking-[0.25em] text-sky-600">{upcomingAppointments.length}</span>
                </div>
                <div className="mt-5 space-y-3">
                  {upcomingAppointments.length > 0 ? upcomingAppointments.map(appointmentCard) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-600">Aucun rendez-vous à venir.</div>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-slate-900">Historique</h2>
                  <span className="text-xs uppercase tracking-[0.25em] text-slate-500">{pastAppointments.length}</span>
                </div>
                <div className="mt-5 space-y-3">
                  {pastAppointments.length > 0 ? pastAppointments.map(appointmentCard) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-600">Aucun rendez-vous passé.</div>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-slate-900">Mes demandes de rendez-vous</h2>
                  <span className="text-xs uppercase tracking-[0.25em] text-amber-600">{pendingRequests.length}</span>
                </div>
                <div className="mt-5 space-y-3">
                  {pendingRequests.length > 0 ? pendingRequests.map(appointmentCard) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-600">Aucune demande de rendez-vous pour le moment.</div>
                  )}
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Actions rapides</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Demander un rendez-vous</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Le formulaire reprend les champs de rendez-vous classiques, sans le nom du patient puisque votre dossier est déjà lié à votre compte.
                </p>
                <button
                  type="button"
                  onClick={openRequestModal}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition-all hover:scale-[1.01]"
                >
                  <FaCalendarCheck />
                  Demander rendez-vous
                </button>
              </div>

              {patient?.doctor && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <FaUserMd className="text-emerald-600" />
                    <div>
                      <p className="text-sm text-slate-500">Médecin associé</p>
                      <p className="text-lg font-semibold text-slate-900">{patient.doctor.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-sky-600">Nouveau rendez-vous</p>
                <h3 className="mt-1 text-2xl font-semibold">Demander un rendez-vous</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-all hover:bg-slate-100"
              >
                Fermer
              </button>
            </div>

            {requestError && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-700">{requestError}</div>}

            <form onSubmit={handleRequestAppointment} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-500">Date</label>
                <input
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-500">Heure début</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-500">Heure fin</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-500">Notes</label>
                <textarea
                  rows="4"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
                  placeholder="Informations complémentaires…"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition-all disabled:opacity-50"
                >
                  {submitting ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientConsultations;