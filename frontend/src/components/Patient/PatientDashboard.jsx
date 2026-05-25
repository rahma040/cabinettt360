import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle, FaFileMedicalAlt, FaPhoneAlt, FaCalendarCheck, FaNotesMedical, FaFileMedical } from "react-icons/fa";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const PatientDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await api.get("/patient/profile");
        setProfile(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        setError(err.response?.data?.error || "Impossible de charger votre espace patient.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const user = profile?.user;
  const patient = profile?.patient;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-white text-slate-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Espace patient</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Bienvenue sur votre tableau de bord</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Consultez vos coordonnées, votre dossier médical et les informations essentielles liées à votre compte.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            Chargement de votre profil patient...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && profile && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                      <FaUserCircle size={34} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Compte connecté</p>
                      <h2 className="text-2xl font-semibold">{user?.name || "Patient"}</h2>
                      <p className="text-sm text-slate-500">{user?.email}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Connexion active
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <button
                  type="button"
                  onClick={() => navigate("/patient-consultations")}
                  className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-left transition-all hover:-translate-y-0.5 hover:bg-sky-100"
                >
                  <FaNotesMedical className="text-sky-600" />
                  <p className="mt-4 text-sm text-sky-700 font-semibold">Mes consultations</p>
                  <p className="mt-1 text-sm text-slate-600">Voir vos rendez-vous à venir et passés</p>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/patient-medical-record")}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left transition-all hover:-translate-y-0.5 hover:bg-emerald-100"
                >
                  <FaFileMedical className="text-emerald-600" />
                  <p className="mt-4 text-sm text-emerald-700 font-semibold">Dossier médical</p>
                  <p className="mt-1 text-sm text-slate-600">Accéder aux documents et au suivi médical</p>
                </button>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <FaFileMedicalAlt className="text-amber-500" />
                  <p className="mt-4 text-sm text-slate-500">Documents</p>
                  <p className="mt-1 font-medium text-slate-900">{patient?.documents?.length || 0}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <FaCalendarCheck className="text-rose-500" />
                  <p className="mt-4 text-sm text-slate-500">Visites</p>
                  <p className="mt-1 font-medium text-slate-900">{patient?.visites?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">Vos coordonnées</h3>
                <div className="mt-5 space-y-4 text-sm text-slate-600">
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <FaUserCircle className="text-cyan-300" />
                    <div>
                      <p className="text-slate-500">Nom complet</p>
                      <p className="font-medium text-slate-900">
                        {[patient?.nom, patient?.prenom].filter(Boolean).join(" ") || user?.name || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <FaPhoneAlt className="text-emerald-300" />
                    <div>
                      <p className="text-slate-500">Téléphone</p>
                      <p className="font-medium text-slate-900">{patient?.telephone || "Non renseigné"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <FaFileMedicalAlt className="text-amber-300" />
                    <div>
                      <p className="text-slate-500">Dossier médical</p>
                      <p className="font-medium text-slate-900">
                        {patient ? "Disponible" : "Aucun dossier lié à ce compte"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-sky-200 bg-sky-50 p-6 text-sky-900">
                <h3 className="text-lg font-semibold">Accès rapide</h3>
                <p className="mt-3 text-sm leading-6 text-sky-800">
                  Ce compte est prêt pour l’espace patient. Vous pouvez maintenant étendre cette page avec vos rendez-vous, vos documents et vos résultats.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;