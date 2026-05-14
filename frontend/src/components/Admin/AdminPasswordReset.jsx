import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome, 
  FaUsers, 
  FaCog,
  FaSignOutAlt, 
  FaBars, 
  FaTimes, 
  FaStethoscope, 
  FaEnvelope, 
  FaKey, 
  FaEye, 
  FaEyeSlash,
  FaExclamationCircle, 
  FaInbox, 
  FaCheckCircle, 
  FaClock, 
  FaPhone, 
  FaEnvelope as FaEnvelopeIcon,
  FaSpinner,
  FaUserMd,
} from "react-icons/fa";

const API_BASE = "http://127.0.0.1:8000/api";

const api = axios.create({ baseURL: API_BASE });
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
  .dt-sidebar { background: linear-gradient(180deg,var(--navy) 0%,var(--navy-mid) 60%,var(--navy-light) 100%); }
  .dt-logo-ring { background: linear-gradient(135deg,var(--accent),#2563EB); }
  .dt-nav-link { transition:all .2s ease; border-left:3px solid transparent; color:rgba(255,255,255,.48); font-size:14px; }
  .dt-nav-link:hover { background:rgba(59,126,248,.14); border-left-color:var(--accent); color:#fff; }
  .dt-nav-link.active { background:rgba(59,126,248,.22); border-left-color:var(--accent); color:#fff; }
  .dt-toggle { background:linear-gradient(135deg,var(--accent),#2563EB); box-shadow:0 4px 14px rgba(59,126,248,.4); }
  .btn-accent { background:linear-gradient(135deg,var(--accent),#2563EB); color:#fff; box-shadow:0 4px 14px rgba(59,126,248,.32); transition:all .2s ease; }
  .btn-accent:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(59,126,248,.42); }
  .btn-emerald { background:linear-gradient(135deg,var(--emerald),#059669); color:#fff; }
  .btn-ghost { border:1.5px solid #E2E8F0; color:#64748B; background:#fff; transition:all .18s ease; }
  .btn-ghost:hover { background:#F8FAFF; border-color:rgba(59,126,248,.3); color:var(--accent); }
  .dt-input { border:1.5px solid #E2E8F0; background:#fff; transition:all .2s ease; font-size:14px; }
  .dt-input:focus { outline:none; border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-glow); }
  .chip-blue { background:#EEF4FF; border:1px solid #BFDBFE; color:#1E40AF; }
  .chip-green { background:#ECFDF5; border:1px solid #A7F3D0; color:#065F46; }
  .chip-amber { background:#FFFBEB; border:1px solid #FDE68A; color:#92400E; }
  .chip-rose { background:#FFF1F2; border:1px solid #FECDD3; color:#9F1239; }
  .chip-gray { background:#F8FAFF; border:1px solid #E2E8F0; color:#64748B; }
  .request-card { background:#fff; border:1.5px solid #E8EEFF; border-radius:20px; transition:all .2s ease; }
  .request-card:hover { border-color:rgba(59,126,248,.28); box-shadow:0 8px 24px rgba(59,126,248,.1); transform:translateY(-2px); }
  .modal-overlay { background:rgba(6,13,31,.62); backdrop-filter:blur(7px); }
  .modal-box { animation:mIn .24s cubic-bezier(.4,0,.2,1); }
  @keyframes mIn { from{opacity:0;transform:scale(.95) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);} }
  .error-banner { background:#FFF1F2; border:1.5px solid #FECDD3; color:#9F1239; border-radius:14px; }
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(59,126,248,.25); border-radius:99px; }
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

const AdminPasswordReset = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);

  const integrityInterval = useRef(null);

  const navItems = [
    { to: "/admindb", icon: <FaHome />, label: "Tableau de bord" },
    { to: "/adminusers", icon: <FaUsers />, label: "Utilisateurs" },
    { to: "/adminpass", icon: <FaKey />, label: "Réinitialisation MDP", active: true },
    { to: "/adminverify", icon: <FaUserMd />, label: "Vérifier Médecins" },
    { to: "/admincoms", icon: <FaEnvelope />, label: "Communications" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { navigate("/login"); return; }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") { navigate("/dashboard"); return; }
    setUser(parsedUser);

    performIntegrityCheck(navigate, setError, true)
      .then(() => {
        fetchRequests();
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

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/password-reset-requests");
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les demandes.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async (requestId, loginEmail) => {
    setFetchingUser(true);
    try {
      const res = await api.get(`/admin/get-user-by-email?login_email=${encodeURIComponent(loginEmail)}`);
      if (res.data && res.data.id) {
        setSelectedUser(res.data);
        setSelectedRequestId(requestId);
        setShowResetModal(true);
        setNewPassword("");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Utilisateur non trouvé avec cet email");
    } finally {
      setFetchingUser(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      alert("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    setResetting(true);
    try {
      await api.post("/admin/reset-password", {
        user_id: selectedUser.id,
        new_password: newPassword,
        request_id: selectedRequestId
      });
      alert("Mot de passe réinitialisé et notification envoyée à l'utilisateur");
      setShowResetModal(false);
      setSelectedUser(null);
      setSelectedRequestId(null);
      setNewPassword("");
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Erreur lors de la réinitialisation");
    } finally {
      setResetting(false);
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
    const d = new Date(dateStr);
    return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const processedCount = requests.filter(r => r.status === "processed").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "linear-gradient(135deg,#060D1F,#0C1A3A)" }}>
        <style>{globalStyles}</style><FontInjector />
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 dt-logo-ring">
            <FaKey className="text-white text-2xl" />
          </div>
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-sm" style={{ color: "#94A3B8" }}>Chargement des demandes…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface)" }}>
      <style>{globalStyles}</style><FontInjector />

      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center text-white rounded-r-xl dt-toggle">
        {sidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
      </button>

      <aside className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 transition-transform duration-300 z-40 w-64 flex flex-col dt-sidebar`}>
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center dt-logo-ring flex-shrink-0">
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
              className={`dt-nav-link flex items-center gap-3 px-4 py-3 rounded-xl ${item.active ? "active" : ""}`}
              style={{ fontWeight: item.active ? 600 : 500 }}>
              <span style={{ opacity: item.active ? 1 : 0.65 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 m-3 rounded-2xl" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0 dt-logo-ring" style={{ fontWeight: 700 }}>
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
                  <FaKey size={14} />
                </div>
                <h2 className="text-2xl" style={{ fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.03em" }}>Réinitialisation des mots de passe</h2>
              </div>
              <p className="text-sm ml-11" style={{ color: "var(--text-2)" }}>
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          {error && (
            <div className="error-banner px-5 py-4 mb-6 flex items-center gap-3">
              <FaExclamationCircle size={16} style={{ color: "#F43F5E" }} />
              <span className="text-sm" style={{ fontWeight: 600 }}>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-6">
            <div className="chip-blue px-3.5 py-2 rounded-xl flex items-center gap-2" style={{ fontWeight: 600, fontSize: 12 }}>
              <FaClock size={11} /> En attente
              <span className="mono" style={{ fontWeight: 800 }}>{pendingCount}</span>
            </div>
            <div className="chip-green px-3.5 py-2 rounded-xl flex items-center gap-2" style={{ fontWeight: 600, fontSize: 12 }}>
              <FaCheckCircle size={11} /> Traitées
              <span className="mono" style={{ fontWeight: 800 }}>{processedCount}</span>
            </div>
          </div>

          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-20" style={{ border: "1.5px dashed #DBEAFE" }}>
                <FaInbox size={28} style={{ color: "#BFDBFE", marginBottom: 10 }} />
                <p className="font-700 text-base mb-1" style={{ fontWeight: 700, color: "var(--text-1)" }}>Aucune demande de réinitialisation</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="request-card p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${req.status === 'pending' ? 'chip-amber' : 'chip-green'}`} style={{ fontWeight: 600 }}>
                          {req.status === 'pending' ? 'En attente' : 'Traité'}
                        </span>
                        <span className="text-xs mono" style={{ color: "var(--text-2)" }}>ID: {req.id}</span>
                      </div>
                      <p className="text-sm font-600 mb-1" style={{ fontWeight: 700, color: "var(--text-1)" }}>
                        Email de connexion: {req.login_email}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--text-2)" }}>
                        <span className="flex items-center gap-1">
                          {req.contact_method === 'email' ? <FaEnvelopeIcon size={10} /> : <FaPhone size={10} />}
                          {req.contact_method === 'email' ? req.contact_email : req.contact_phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock size={10} /> {formatDate(req.created_at)}
                        </span>
                      </div>
                      {req.message && (
                        <p className="text-xs mt-2 p-2 rounded-lg" style={{ background: "#F8FAFF", color: "var(--text-2)" }}>
                          {req.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleResetRequest(req.id, req.login_email)}
                          disabled={fetchingUser}
                          className="btn-accent px-4 py-2 rounded-xl text-xs flex items-center gap-2"
                          style={{ fontWeight: 600 }}
                        >
                          {fetchingUser ? <FaSpinner className="animate-spin" size={11} /> : <FaKey size={11} />}
                          Réinitialiser
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {showResetModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-md w-full shadow-2xl">
            <div className="px-8 py-6" style={{ background: "linear-gradient(135deg,var(--accent),#2563EB)" }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white text-lg" style={{ fontWeight: 800 }}>Réinitialiser le mot de passe</h3>
                  <p className="text-white/60 text-xs mt-0.5">Nouveau mot de passe pour {selectedUser.name}</p>
                </div>
                <button onClick={() => setShowResetModal(false)} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-all">
                  <FaTimes size={14} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 p-3 rounded-xl" style={{ background: "#F8FAFF", border: "1px solid #E8EEFF" }}>
                <p className="text-xs" style={{ color: "var(--text-2)" }}>Email de l'utilisateur</p>
                <p className="text-sm" style={{ fontWeight: 600, color: "var(--text-1)" }}>{selectedUser.email}</p>
              </div>
              <div className="relative">
                <label className="block text-xs font-600 mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-2)" }}>Nouveau mot de passe</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="dt-input w-full p-3 rounded-xl text-sm pr-10"
                  placeholder="Min 8 caractères"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-gray-400"
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowResetModal(false)} className="btn-ghost px-5 py-2.5 rounded-xl text-sm">Annuler</button>
                <button onClick={handleResetPassword} disabled={resetting} className="btn-accent px-6 py-2.5 rounded-xl text-sm flex items-center gap-2">
                  {resetting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FaKey size={12} /> Réinitialiser</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPasswordReset;