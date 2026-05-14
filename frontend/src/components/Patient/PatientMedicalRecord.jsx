import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaFileMedicalAlt, FaNotesMedical, FaCalendarCheck, FaDownload } from "react-icons/fa";

const api = axios.create({ baseURL: "http://127.0.0.1:8000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const PatientMedicalRecord = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const load = async () => {
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
        setError(err.response?.data?.error || "Impossible de charger votre dossier médical.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const patient = profile?.patient;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#12325f_0%,#07111f_45%,#050b14_100%)] text-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/8 backdrop-blur-xl p-6 shadow-2xl shadow-cyan-950/20">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Dossier médical</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Documents et suivi</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/patientdb")}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
          >
            <FaArrowLeft className="inline-block mr-2" />
            Retour
          </button>
        </div>

        {loading && <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">Chargement du dossier médical...</div>}
        {error && <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">{error}</div>}

        {!loading && !error && patient && (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <FaFileMedicalAlt className="text-cyan-300" />
                <h2 className="text-xl font-semibold">Documents médicaux</h2>
              </div>
              <div className="mt-5 space-y-3">
                {patient.documents?.length > 0 ? patient.documents.map((doc) => (
                  <div key={doc.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">{doc.titre || "Sans titre"}</p>
                        <p className="mt-1 text-sm text-slate-300">{doc.type} {doc.date_document ? `· ${new Date(doc.date_document).toLocaleDateString("fr-FR")}` : ""}</p>
                        {doc.notes && <p className="mt-2 text-sm text-slate-400">{doc.notes}</p>}
                      </div>
                      {doc.fichier_path && (
                        <a
                          href={`http://127.0.0.1:8000/storage/${doc.fichier_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100"
                        >
                          <FaDownload />
                          Ouvrir
                        </a>
                      )}
                    </div>
                  </div>
                )) : <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300">Aucun document médical.</div>}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <FaNotesMedical className="text-emerald-300" />
                <h2 className="text-xl font-semibold">Consultations / visites</h2>
              </div>
              <div className="mt-5 space-y-3">
                {patient.visites?.length > 0 ? patient.visites.map((visite) => (
                  <div key={visite.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white flex items-center gap-2"><FaCalendarCheck className="text-cyan-300" />{visite.date_visite ? new Date(visite.date_visite).toLocaleDateString("fr-FR") : "Date inconnue"}</p>
                        <p className="mt-1 text-sm text-slate-300">{visite.motif || "Consultation"}</p>
                        {visite.medecin && <p className="mt-1 text-sm text-slate-400">Médecin: {visite.medecin}</p>}
                        {visite.notes && <p className="mt-2 text-sm text-slate-400">{visite.notes}</p>}
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs capitalize">{visite.statut || "planifié"}</span>
                    </div>
                  </div>
                )) : <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300">Aucune visite enregistrée.</div>}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientMedicalRecord;