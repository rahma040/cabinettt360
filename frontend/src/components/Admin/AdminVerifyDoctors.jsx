import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome, 
  FaUsers, 
  FaCog,
  FaSignOutAlt, 
  FaStethoscope,
  FaBars, 
  FaTimes, 
  FaCheckCircle, 
  FaSpinner, 
  FaEnvelope,
  FaUserMd, 
  FaEye, 
  FaDownload, 
  FaFilePdf,
  FaTimesCircle, 
  FaInbox, 
  FaSync,
  FaKey,
} from "react-icons/fa";

const API_BASE_URL = "http://127.0.0.1:8000";
const API_URL = "http://127.0.0.1:8000/api";

const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userIntegrityHash");
      window.location.href = "/accessdenied";
    }
    return Promise.reject(error);
  }
);

const OBFUSCATION_KEY = "MediCareSecure2025!";

function obfuscate(str) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result);
}

function deobfuscate(obfuscatedStr) {
  const decoded = atob(obfuscatedStr);
  let result = "";
  for (let i = 0; i < decoded.length; i++) {
    const charCode = decoded.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length);
    result += String.fromCharCode(charCode);
  }
  return result;
}

const FontInjector = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);
  return null;
};

const globalStyles = `
  * { font-family: 'Sora', sans-serif; box-sizing: border-box; }
  :root {
    --navy: #060D1F; --navy-mid: #0C1A3A; --navy-light: #122048;
    --accent: #3B7EF8; --accent-glow: rgba(59,126,248,0.20);
    --teal: #0ECDB5; --amber: #F59E0B; --rose: #F43F5E; --emerald: #10B981;
    --violet: #8B5CF6; --surface: #F4F7FF; --text-1: #0A0F1E; --text-2: #5B6B8A;
    --border: rgba(59,126,248,0.13);
  }
  .db-sidebar { background: linear-gradient(180deg,var(--navy) 0%,var(--navy-mid) 60%,var(--navy-light) 100%); }
  .db-logo-ring { background: linear-gradient(135deg,var(--accent),#2563EB); }
  .db-nav-link { transition:all .2s ease; border-left:3px solid transparent; color:rgba(255,255,255,.48); font-size:14px; }
  .db-nav-link:hover { background:rgba(59,126,248,.14); border-left-color:var(--accent); color:#fff; }
  .db-nav-link.active { background:rgba(59,126,248,.22); border-left-color:var(--accent); color:#fff; }
  .db-toggle { background:linear-gradient(135deg,var(--accent),#2563EB); box-shadow:0 4px 14px rgba(59,126,248,.4); }
  .btn-accent { background:linear-gradient(135deg,var(--accent),#2563EB); color:#fff; box-shadow:0 4px 14px rgba(59,126,248,.32); transition:all .2s ease; }
  .btn-accent:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(59,126,248,.42); }
  .btn-emerald { background:linear-gradient(135deg,var(--emerald),#059669); color:#fff; }
  .btn-ghost { border:1.5px solid #E2E8F0; color:#64748B; background:#fff; transition:all .18s ease; }
  .btn-ghost:hover { background:#F8FAFF; border-color:rgba(59,126,248,.3); color:var(--accent); }
  .doctor-card { background:#fff; border:1.5px solid #E8EEFF; border-radius:20px; transition:all .2s ease; cursor:pointer; }
  .doctor-card:hover { border-color:rgba(59,126,248,.28); box-shadow:0 8px 24px rgba(59,126,248,.1); transform:translateY(-2px); }
  .modal-overlay { background:rgba(6,13,31,.62); backdrop-filter:blur(7px); }
  .modal-box { animation:mIn .24s cubic-bezier(.4,0,.2,1); }
  @keyframes mIn { from{opacity:0;transform:scale(.95) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);} }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(59,126,248,.25); border-radius: 99px; }
  .chip-amber { background:#FFFBEB; border:1px solid #FDE68A; color:#92400E; }
`;

const clearAndRedirect = (navigate) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userIntegrityHash");
  navigate("/accessdenied");
};

const performIntegrityCheck = async (navigate, setError, isInitial = false) => {
  const token = localStorage.getItem("token");
  const storedUserRaw = localStorage.getItem("user");
  const storedObfuscatedHash = localStorage.getItem("userIntegrityHash");

  if (!token || !storedUserRaw) return;

  try {
    const response = await api.get("/current-user");
    const { data } = response;

    const storedUser = JSON.parse(storedUserRaw);
    if (
      storedUser.id !== data.id ||
      storedUser.email !== data.email ||
      storedUser.role !== data.role
    ) {
      console.warn("Tampering detected: user data mismatch");
      clearAndRedirect(navigate);
      return;
    }

    if (isInitial && !storedObfuscatedHash && data.integrity_hash) {
      const obfuscated = obfuscate(data.integrity_hash);
      localStorage.setItem("userIntegrityHash", obfuscated);
      return;
    }

    if (storedObfuscatedHash) {
      const storedHash = deobfuscate(storedObfuscatedHash);
      if (data.integrity_hash !== storedHash) {
        console.warn("Tampering detected: integrity hash mismatch");
        clearAndRedirect(navigate);
        return;
      }
    }
  } catch (err) {
    console.error("Integrity check failed", err);
    clearAndRedirect(navigate);
  }
};

const AdminVerifyDoctors = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const integrityInterval = useRef(null);

  const navItems = [
    { to: "/admindb", icon: <FaHome />, label: "Tableau de bord" },
    { to: "/adminusers", icon: <FaUsers />, label: "Utilisateurs" },
    { to: "/adminpass", icon: <FaKey />, label: "Réinitialisation MDP" },
    { to: "/adminverify", icon: <FaUserMd />, label: "Vérifier Médecins", active: true },
    { to: "/admincoms", icon: <FaEnvelope />, label: "Communications" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { navigate("/login"); return; }
    const parsed = JSON.parse(userData);
    if (parsed.role !== "admin") { navigate("/dashboard"); return; }
    setUser(parsed);

    performIntegrityCheck(navigate, setError, true)
      .then(() => {
        fetchUnverifiedDoctors();
        setLoading(false);
      })
      .catch(() => setLoading(false));

    integrityInterval.current = setInterval(() => {
      performIntegrityCheck(navigate, setError, false);
    }, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        performIntegrityCheck(navigate, setError, false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (integrityInterval.current) clearInterval(integrityInterval.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [navigate]);

  const fetchUnverifiedDoctors = async () => {
    setLoadingDoctors(true);
    setError("");
    try {
      const res = await api.get("/admin/unverified-doctors");
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les médecins non vérifiés.");
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const handleVerify = async () => {
    if (!selectedDoctor) return;
    setVerifying(true);
    setError("");
    try {
      const response = await api.put(`/admin/verify-doctor/${selectedDoctor.id}`);
      if (response.status === 200) {
        alert(`Dr. ${selectedDoctor.name} a été vérifié avec succès.`);
        setShowModal(false);
        setSelectedDoctor(null);
        await fetchUnverifiedDoctors();
      } else {
        throw new Error("Réponse inattendue du serveur");
      }
    } catch (err) {
      console.error("Verification error:", err);
      let errorMsg = "Erreur lors de la vérification.";
      if (err.response) {
        errorMsg = err.response.data?.error || err.response.data?.message || errorMsg;
      } else if (err.request) {
        errorMsg = "Pas de réponse du serveur. Vérifiez votre connexion.";
      }
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    if (integrityInterval.current) clearInterval(integrityInterval.current);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userIntegrityHash");
    navigate("/login");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric"
    });
  };

  const getDocumentUrl = (doctorId) => {
    const token = localStorage.getItem("token");
    return `${API_URL}/admin/doctor-document/${doctorId}?token=${encodeURIComponent(token)}`;
  };

  const openDocument = (doctorId, action = "view") => {
    const url = getDocumentUrl(doctorId);
    if (action === "view") {
      window.open(url, "_blank");
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.download = `licence_${doctorId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isImage = (filename) => {
    if (!filename) return false;
    const ext = filename.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "linear-gradient(135deg,#060D1F,#0C1A3A)" }}>
        <style>{globalStyles}</style><FontInjector />
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 db-logo-ring">
            <FaUserMd className="text-white text-2xl" />
          </div>
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-sm" style={{ color: "#94A3B8" }}>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface)" }}>
      <style>{globalStyles}</style><FontInjector />

      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center text-white rounded-r-xl db-toggle">
        {sidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
      </button>

      <aside className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 transition-transform duration-300 z-40 w-64 flex flex-col db-sidebar`}>
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center db-logo-ring flex-shrink-0">
              <FaStethoscope className="text-white text-base" />
            </div>
            <div>
              <h1 className="text-white text-lg" style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Cabi Doc</h1>
              <p className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>Espace admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className={`db-nav-link flex items-center gap-3 px-4 py-3 rounded-xl ${item.active ? "active" : ""}`}
              style={{ fontWeight: item.active ? 600 : 500 }}>
              <span style={{ opacity: item.active ? 1 : 0.65 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 m-3 rounded-2xl" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0 db-logo-ring" style={{ fontWeight: 700 }}>
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate" style={{ fontWeight: 600 }}>{user?.name || "Admin"}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>Administrateur</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all hover:bg-red-500/20" style={{ color: "rgba(255,255,255,.5)", fontWeight: 500 }}>
            <FaSignOutAlt size={12} /> Déconnexion
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 lg:hidden" style={{ background: "rgba(6,13,31,.5)", backdropFilter: "blur(4px)" }} onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 pt-14 lg:pt-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,var(--accent),#2563EB)", boxShadow: "0 4px 14px rgba(59,126,248,.35)" }}>
                  <FaUserMd size={14} />
                </div>
                <h2 className="text-2xl" style={{ fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.03em" }}>Vérification des médecins</h2>
              </div>
              <p className="text-sm ml-11" style={{ color: "var(--text-2)" }}>
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <button onClick={fetchUnverifiedDoctors} className="btn-ghost px-4 py-2 rounded-xl text-sm flex items-center gap-2">
              <FaSync size={12} /> Actualiser
            </button>
          </div>

          {error && (
            <div className="error-banner px-5 py-4 mb-6 flex items-center gap-3" style={{ background: "#FFF1F2", border: "1.5px solid #FECDD3", borderRadius: 14 }}>
              <FaTimesCircle size={16} style={{ color: "#F43F5E" }} />
              <span className="text-sm" style={{ fontWeight: 600 }}>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-6">
            <div className="chip-amber px-3.5 py-2 rounded-xl flex items-center gap-2" style={{ fontWeight: 600, fontSize: 12 }}>
              <FaUserMd size={11} /> En attente de vérification
              <span className="mono" style={{ fontWeight: 800 }}>{doctors.length}</span>
            </div>
          </div>

          {loadingDoctors ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-20" style={{ border: "1.5px dashed #DBEAFE" }}>
              <FaInbox size={28} style={{ color: "#BFDBFE", marginBottom: 10 }} />
              <p className="font-700 text-base mb-1" style={{ fontWeight: 700, color: "var(--text-1)" }}>Aucun médecin en attente</p>
              <p className="text-sm" style={{ color: "var(--text-2)" }}>Tous les médecins sont vérifiés.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="doctor-card p-5" onClick={() => handleViewDoctor(doctor)}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg db-logo-ring">
                      {doctor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base" style={{ fontWeight: 700, color: "var(--text-1)" }}>{doctor.name}</h3>
                      <p className="text-xs" style={{ color: "var(--text-2)" }}>{doctor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: "#E8EEFF" }}>
                    <span className="text-xs" style={{ color: "var(--text-2)" }}>Inscrit le {formatDate(doctor.created_at)}</span>
                    <span className="chip-amber px-2 py-0.5 rounded-lg text-xs flex items-center gap-1">
                      <FaTimesCircle size={9} /> En attente
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && selectedDoctor && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-8 py-6" style={{ background: "linear-gradient(135deg,var(--accent),#2563EB)" }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white text-xl" style={{ fontWeight: 800 }}>Dossier médecin</h3>
                  <p className="text-white/70 text-sm mt-1">Vérification de la licence</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-all">
                  <FaTimes size={14} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: "#E8EEFF" }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl db-logo-ring">
                  {selectedDoctor.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg" style={{ fontWeight: 800, color: "var(--text-1)" }}>{selectedDoctor.name}</h4>
                  <p className="text-sm" style={{ color: "var(--text-2)" }}>{selectedDoctor.email}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-2)" }}>Inscrit le {formatDate(selectedDoctor.created_at)}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-600 mb-2 uppercase tracking-wider" style={{ color: "var(--text-2)", fontWeight: 700 }}>Document de licence</label>
                {selectedDoctor.licence_document ? (
                  <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#E8EEFF" }}>
                    {isImage(selectedDoctor.licence_document) ? (
                      <img 
                        src={getDocumentUrl(selectedDoctor.id)} 
                        alt="Licence" 
                        className="w-full max-h-96 object-contain" 
                        onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="2" y="2" width="20" height="20" rx="2.18"%3E%3C/rect%3E%3Cpath d="M8 2v20M16 2v20M2 8h20M2 16h20"%3E%3C/path%3E%3C/svg%3E'; }}
                      />
                    ) : (
                      <div className="p-8 text-center bg-gray-50">
                        <FaFilePdf size={48} className="mx-auto mb-3" style={{ color: "#F43F5E" }} />
                        <p className="text-sm mb-3">Document PDF</p>
                        <button 
                          onClick={() => openDocument(selectedDoctor.id, "view")}
                          className="btn-accent inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                        >
                          <FaEye size={12} /> Voir le PDF
                        </button>
                      </div>
                    )}
                    <div className="p-3 bg-gray-50 border-t flex justify-end" style={{ borderColor: "#E8EEFF" }}>
                      <button 
                        onClick={() => openDocument(selectedDoctor.id, "download")}
                        className="btn-ghost inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                      >
                        <FaDownload size={10} /> Télécharger
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center rounded-xl" style={{ background: "#FFF1F2", border: "1.5px solid #FECDD3" }}>
                    <p className="text-sm text-rose-600">Aucun document fourni</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "#E8EEFF" }}>
                <button onClick={() => setShowModal(false)} className="btn-ghost px-5 py-2.5 rounded-xl text-sm">Fermer</button>
                <button onClick={handleVerify} disabled={verifying} className="btn-emerald px-6 py-2.5 rounded-xl text-sm flex items-center gap-2">
                  {verifying ? <><FaSpinner className="animate-spin" size={12} /> Vérification...</> : <><FaCheckCircle size={12} /> Vérifier le compte</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerifyDoctors;