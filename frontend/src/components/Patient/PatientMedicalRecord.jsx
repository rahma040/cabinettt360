import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaFileMedicalAlt, FaNotesMedical, FaCalendarCheck, FaEye, FaTimes } from "react-icons/fa";

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
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState("");
  const [viewerUrl, setViewerUrl] = useState("");
  const [viewerDocument, setViewerDocument] = useState(null);
  const viewerUrlRef = useRef("");

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

  useEffect(() => {
    return () => {
      if (viewerUrlRef.current) {
        URL.revokeObjectURL(viewerUrlRef.current);
      }
    };
  }, []);

  const openDocument = async (doc) => {
    setViewerOpen(true);
    setViewerLoading(true);
    setViewerError("");
    setViewerDocument(doc);

    try {
      const response = await api.get(`/patient/documents/${doc.id}/view`, { responseType: "blob" });
      const objectUrl = URL.createObjectURL(response.data);

      if (viewerUrlRef.current) {
        URL.revokeObjectURL(viewerUrlRef.current);
      }

      viewerUrlRef.current = objectUrl;
      setViewerUrl(objectUrl);
    } catch (err) {
      setViewerError(err.response?.data?.error || "Impossible d'ouvrir ce document.");
    } finally {
      setViewerLoading(false);
    }
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerLoading(false);
    setViewerError("");
    setViewerDocument(null);
    if (viewerUrlRef.current) {
      URL.revokeObjectURL(viewerUrlRef.current);
      viewerUrlRef.current = "";
    }
    setViewerUrl("");
  };

  const patient = profile?.patient;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-white text-slate-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Dossier médical</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Documents et suivi</h1>
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

        {loading && <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Chargement du dossier médical...</div>}
        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>}

        {!loading && !error && patient && (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <FaFileMedicalAlt className="text-sky-600" />
                <h2 className="text-xl font-semibold">Documents médicaux</h2>
              </div>
              <div className="mt-5 space-y-3">
                {patient.documents?.length > 0 ? patient.documents.map((doc) => (
                  <div key={doc.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{doc.titre || "Sans titre"}</p>
                        <p className="mt-1 text-sm text-slate-600">{doc.type} {doc.date_document ? `· ${new Date(doc.date_document).toLocaleDateString("fr-FR")}` : ""}</p>
                        {doc.notes && <p className="mt-2 text-sm text-slate-500">{doc.notes}</p>}
                      </div>
                      {doc.fichier_path && (
                        <button
                          type="button"
                          onClick={() => openDocument(doc)}
                          className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700"
                        >
                          <FaEye />
                          Ouvrir
                        </button>
                      )}
                    </div>
                  </div>
                )) : <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600">Aucun document médical.</div>}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <FaNotesMedical className="text-emerald-600" />
                <h2 className="text-xl font-semibold">Consultations / visites</h2>
              </div>
              <div className="mt-5 space-y-3">
                {patient.visites?.length > 0 ? patient.visites.map((visite) => (
                  <div key={visite.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900 flex items-center gap-2"><FaCalendarCheck className="text-sky-600" />{visite.date_visite ? new Date(visite.date_visite).toLocaleDateString("fr-FR") : "Date inconnue"}</p>
                        <p className="mt-1 text-sm text-slate-600">{visite.motif || "Consultation"}</p>
                        {visite.medecin && <p className="mt-1 text-sm text-slate-500">Médecin: {visite.medecin}</p>}
                        {visite.notes && <p className="mt-2 text-sm text-slate-500">{visite.notes}</p>}
                      </div>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs capitalize text-slate-700">{visite.statut || "planifié"}</span>
                    </div>
                  </div>
                )) : <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600">Aucune visite enregistrée.</div>}
              </div>
            </section>
          </div>
        )}

        {viewerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.22)", backdropFilter: "blur(6px)" }}>
            <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-sky-600">Aperçu du document</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{viewerDocument?.titre || viewerDocument?.fichier_nom || "Document médical"}</h3>
                </div>
                <button
                  type="button"
                  onClick={closeViewer}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-all hover:bg-slate-100"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="max-h-[80vh] min-h-[60vh] bg-slate-50 p-4">
                {viewerLoading ? (
                  <div className="flex h-[60vh] items-center justify-center text-slate-600">Chargement du document...</div>
                ) : viewerError ? (
                  <div className="flex h-[60vh] items-center justify-center text-rose-700">{viewerError}</div>
                ) : viewerUrl ? (
                  <iframe
                    title="Aperçu document médical"
                    src={viewerUrl}
                    className="h-[72vh] w-full rounded-2xl border border-slate-200 bg-white"
                  />
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientMedicalRecord;