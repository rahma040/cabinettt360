import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaCheck, FaBan, FaCalendarAlt, FaClock, FaUser, FaSpinner, FaSync } from "react-icons/fa";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AppointmentRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const allowed = ["medecin", "doctor", "secretaire", "secretary"];

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/appointments");
      const pending = (Array.isArray(response.data) ? response.data : []).filter((item) => item.request_status === "pending");
      pending.sort((a, b) => {
        const dateA = `${a.appointment_date} ${a.start_time || "00:00"}`;
        const dateB = `${b.appointment_date} ${b.start_time || "00:00"}`;
        return new Date(dateB) - new Date(dateA);
      });
      setRequests(pending);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      setError(err.response?.data?.error || "Impossible de charger les demandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user || !allowed.includes(user.role)) {
      navigate("/accessdenied");
      return;
    }
    loadRequests();
  }, [navigate, user]);

  const handleAction = async (requestId, action) => {
    setActionLoading(requestId);
    try {
      await api.post(`/appointments/${requestId}/${action}-request`);
      setRequests((prev) => prev.filter((item) => item.id !== requestId));
    } catch (err) {
      setError(err.response?.data?.error || `Impossible de ${action === "accept" ? "valider" : "supprimer"} la demande.`);
    } finally {
      setActionLoading(null);
    }
  };

  const renderRequestCard = (request) => (
    <div key={request.id} className="rounded-2xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl shadow-lg shadow-slate-950/10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-cyan-200 text-sm font-semibold">
            <FaCalendarAlt />
            {new Date(request.appointment_date).toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </div>

          <h3 className="mt-3 text-xl font-semibold text-white">
            {request.patient?.prenom} {request.patient?.nom}
          </h3>
          <p className="mt-1 text-sm text-slate-300">
            {request.patient?.email || "Email non disponible"}
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <FaClock /> {request.start_time?.substring(0, 5)} - {request.end_time?.substring(0, 5)}
            </span>
            <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 capitalize">
              <FaUser /> {request.status}
            </span>
          </div>

          {request.notes && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
              {request.notes}
            </div>
          )}
        </div>

        <div className="flex gap-3 lg:flex-col lg:w-44">
          <button
            type="button"
            onClick={() => handleAction(request.id, "accept")}
            disabled={actionLoading === request.id}
            className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
          >
            {actionLoading === request.id ? <FaSpinner className="inline-block animate-spin" /> : <FaCheck className="inline-block" />} Accepter
          </button>
          <button
            type="button"
            onClick={() => handleAction(request.id, "deny")}
            disabled={actionLoading === request.id}
            className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}
          >
            {actionLoading === request.id ? <FaSpinner className="inline-block animate-spin" /> : <FaBan className="inline-block" />} Supprimer
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#12325f_0%,#07111f_45%,#050b14_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/8 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Demandes des rendez-vous</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Liste des demandes des patients</h1>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={loadRequests}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              <FaSync className="inline-block mr-2" /> Actualiser
            </button>
            <button
              type="button"
              onClick={() => navigate(user?.role === "secretaire" || user?.role === "secretary" ? "/secretaryRendezvous" : "/rendezvous")}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              <FaArrowLeft className="inline-block mr-2" /> Retour
            </button>
          </div>
        </div>

        {error && <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">{error}</div>}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">Chargement des demandes...</div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">Aucune demande de rendez-vous en attente.</div>
        ) : (
          <div className="grid gap-4">
            {requests.map(renderRequestCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentRequestsPage;