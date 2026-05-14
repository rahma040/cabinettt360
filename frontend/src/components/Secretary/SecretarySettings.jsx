import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FaHome,
  FaUserInjured,
  FaCalendarCheck,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaUserClock,
  FaMoneyBillWave,
  FaClipboardList,
  FaUser,
  FaEnvelope,
  FaLock,
  FaSave,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaBars,
  FaTimes,
  FaStethoscope,
} from "react-icons/fa";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const api = axios.create({ baseURL: API_BASE_URL });
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
    link.href =
      "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);
  return null;
};

const G = `
  * { font-family: 'Sora', sans-serif; box-sizing: border-box; }
  :root {
    --navy:        #060D1F;
    --navy-mid:    #0C1A3A;
    --navy-light:  #122048;
    --accent:      #3B7EF8;
    --violet:      #8B5CF6;
    --violet-glow: rgba(139,92,246,0.20);
    --teal:        #0ECDB5;
    --amber:       #F59E0B;
    --rose:        #F43F5E;
    --emerald:     #10B981;
    --surface:     #F4F7FF;
    --text-1:      #0A0F1E;
    --text-2:      #5B6B8A;
    --border:      rgba(59,126,248,0.13);
  }

  .st-sidebar { background: linear-gradient(180deg,var(--navy) 0%,var(--navy-mid) 60%,var(--navy-light) 100%); }
  .st-logo-ring { background: linear-gradient(135deg,var(--violet),#6D28D9); }
  .st-nav-link { transition:all .2s ease; border-left:3px solid transparent; color:rgba(255,255,255,.48); font-size:14px; }
  .st-nav-link:hover { background:rgba(139,92,246,.14); border-left-color:var(--violet); color:#fff; }
  .st-nav-link.active { background:rgba(139,92,246,.22); border-left-color:var(--violet); color:#fff; }
  .st-toggle { background:linear-gradient(135deg,var(--violet),#6D28D9); box-shadow:0 4px 14px rgba(139,92,246,.4); }

  .btn-violet { background:linear-gradient(135deg,var(--violet),#6D28D9); color:#fff; box-shadow:0 4px 14px rgba(139,92,246,.32); transition:all .2s ease; }
  .btn-violet:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(139,92,246,.42); }
  .btn-violet:disabled { opacity:.5; transform:none; box-shadow:none; cursor:not-allowed; }
  .btn-ghost { border:1.5px solid #E2E8F0; color:#64748B; background:#fff; transition:all .18s ease; }
  .btn-ghost:hover { background:#F8FAFF; border-color:rgba(139,92,246,.3); color:var(--violet); }

  .st-input { border:1.5px solid #E2E8F0; background:#fff; transition:all .2s ease; font-size:14px; }
  .st-input:focus { outline:none; border-color:var(--violet); box-shadow:0 0 0 3px var(--violet-glow); }

  .sec-card { background:#fff; border-radius:20px; border:1.5px solid var(--border); transition:all .2s ease; }
  .sec-card:hover { border-color:rgba(139,92,246,.22); box-shadow:0 8px 28px rgba(139,92,246,.07); }

  .err-banner { background:#FFF1F2; border:1.5px solid #FECDD3; color:#9F1239; border-radius:14px; }

  .toast-success { background:linear-gradient(135deg,#10B981,#059669); }
  .toast-error   { background:linear-gradient(135deg,#F43F5E,#BE123C); }
  .toast-item { animation:toastIn .28s cubic-bezier(.4,0,.2,1); box-shadow:0 8px 24px rgba(6,13,31,.18); }
  @keyframes toastIn { from{opacity:0;transform:translateX(60px);}to{opacity:1;transform:translateX(0);} }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(139,92,246,.25); border-radius:99px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(139,92,246,.45); }
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

function SecretarySettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const integrityInterval = useRef(null);

  const navItems = [
    { to: "/secretariatdb", icon: <FaHome />, label: "Tableau de bord" },
    { to: "/secpatients", icon: <FaUserInjured />, label: "Patients" },
    { to: "/secretaryRendezvous", icon: <FaCalendarCheck />, label: "Rendez-vous" },
    { to: "/sectasks", icon: <FaClipboardList />, label: "Tâches" },
    { to: "/secwaiting", icon: <FaUserClock />, label: "Salle d'attente" },
    { to: "/secpay", icon: <FaMoneyBillWave />, label: "Paiements" },
    { to: "/secsettings", icon: <FaCog />, label: "Paramètres", active: true },
  ];

  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: "ease-out-cubic" });
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { navigate("/login"); return; }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "secretaire") { navigate("/dashboard"); return; }
    setUser(parsedUser);
    setFormData(prev => ({ ...prev, name: parsedUser.name || "", email: parsedUser.email || "" }));

    performIntegrityCheck(navigate, setError, true)
      .then(() => {
        fetchCurrentUser();
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

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/auth/me");
      const currentUser = res.data;
      setUser(currentUser);
      setFormData(prev => ({ ...prev, name: currentUser.name || "", email: currentUser.email || "" }));
    } catch (err) {
      console.error("Failed to fetch user", err);
    }
  };

  const addToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    if (formData.password && formData.password !== formData.password_confirmation) {
      addToast("Les nouveaux mots de passe ne correspondent pas.", "error");
      setSaving(false);
      return;
    }
    if (formData.password && !formData.current_password) {
      addToast("Veuillez entrer votre mot de passe actuel pour le modifier.", "error");
      setSaving(false);
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
    };
    if (formData.current_password) {
      payload.current_password = formData.current_password;
      if (formData.password) {
        payload.password = formData.password;
        payload.password_confirmation = formData.password_confirmation;
      }
    }

    try {
      await api.put("/auth/update", payload);
      addToast("Profil mis à jour avec succès !", "success");
      setSuccess(true);
      setFormData(prev => ({ ...prev, current_password: "", password: "", password_confirmation: "" }));
      const meRes = await api.get("/auth/me");
      localStorage.setItem("user", JSON.stringify(meRes.data));
      setUser(meRes.data);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || "Erreur lors de la mise à jour du profil.";
      addToast(msg, "error");
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (integrityInterval.current) clearInterval(integrityInterval.current);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userIntegrityHash");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "linear-gradient(135deg,#060D1F,#0C1A3A)" }}>
        <style>{G}</style><FontInjector />
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 st-logo-ring">
            <FaCog className="text-white text-2xl" />
          </div>
          <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-sm" style={{ color: "#94A3B8" }}>Chargement des paramètres…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface)" }}>
      <style>{G}</style><FontInjector />

      <div className="fixed top-5 right-5 z-[60] space-y-2 w-80">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item rounded-2xl px-4 py-3 flex items-center justify-between text-white ${t.type === "success" ? "toast-success" : "toast-error"}`}>
            <div className="flex items-center gap-2.5 text-sm" style={{ fontWeight: 600 }}>
              {t.type === "success" ? <FaCheckCircle size={14} /> : <FaExclamationCircle size={14} />}
              {t.message}
            </div>
            <button onClick={() => setToasts(prev => prev.filter(t2 => t2.id !== t.id))} className="ml-3 hover:opacity-70"><FaTimes size={13} /></button>
          </div>
        ))}
      </div>

      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center text-white rounded-r-xl st-toggle">
        {sidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
      </button>

      <aside className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 transition-transform duration-300 z-40 w-64 flex flex-col st-sidebar`}>
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center st-logo-ring flex-shrink-0">
              <FaStethoscope className="text-white text-base" />
            </div>
            <div>
              <h1 className="text-white text-lg" style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Cabi Doc</h1>
              <p className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>Espace secrétariat</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className={`st-nav-link flex items-center gap-3 px-4 py-3 rounded-xl ${item.active ? "active" : ""}`}
              style={{ fontWeight: item.active ? 600 : 500 }}>
              <span style={{ opacity: item.active ? 1 : 0.65 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 m-3 rounded-2xl" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0 st-logo-ring" style={{ fontWeight: 700 }}>
              {user?.name?.charAt(0) || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate" style={{ fontWeight: 600 }}>{user?.name || "Secrétaire"}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>Secrétaire</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all hover:bg-red-500/20" style={{ color: "rgba(255,255,255,.5)", fontWeight: 500 }}>
            <FaSignOutAlt size={12} /> Déconnexion
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 lg:hidden" style={{ background: "rgba(6,13,31,.5)", backdropFilter: "blur(4px)" }} onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 pt-14 lg:pt-8 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8 gap-4" data-aos="fade-down">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,var(--violet),#6D28D9)", boxShadow: "0 4px 14px rgba(139,92,246,.35)" }}>
                  <FaCog size={14} />
                </div>
                <h2 className="text-2xl" style={{ fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.03em" }}>
                  Paramètres du compte
                </h2>
              </div>
              <p className="text-sm ml-11" style={{ color: "var(--text-2)" }}>
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: "#fff", border: "1.5px solid var(--border)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs st-logo-ring" style={{ fontWeight: 700 }}>
                  {user?.name?.charAt(0) || "S"}
                </div>
                <span className="hidden sm:inline text-sm" style={{ fontWeight: 600, color: "var(--text-1)" }}>{user?.name || "Secrétaire"}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="err-banner px-5 py-3 mb-6 flex items-center gap-3">
              <FaExclamationCircle size={15} style={{ color: "#F43F5E" }} />
              <span className="text-sm" style={{ fontWeight: 600 }}>{error}</span>
            </div>
          )}

          <div className="sec-card p-6" data-aos="fade-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-600 mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-2)", fontWeight: 600, letterSpacing: "0.07em" }}>
                  Nom complet
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2" size={14} style={{ color: "#94A3B8" }} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm st-input"
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-600 mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-2)", fontWeight: 600, letterSpacing: "0.07em" }}>
                  Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2" size={14} style={{ color: "#94A3B8" }} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm st-input"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: "#E8EEFF" }} />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white" style={{ color: "var(--text-2)", fontWeight: 600 }}>Modification du mot de passe (optionnel)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-600 mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-2)", fontWeight: 600, letterSpacing: "0.07em" }}>
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={14} style={{ color: "#94A3B8" }} />
                  <input
                    type="password"
                    name="current_password"
                    value={formData.current_password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm st-input"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-600 mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-2)", fontWeight: 600, letterSpacing: "0.07em" }}>
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={14} style={{ color: "#94A3B8" }} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm st-input"
                    placeholder="Laissez vide pour ne pas changer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-600 mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-2)", fontWeight: 600, letterSpacing: "0.07em" }}>
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={14} style={{ color: "#94A3B8" }} />
                  <input
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm st-input"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-violet px-6 py-3 rounded-xl text-sm flex items-center gap-2"
                  style={{ fontWeight: 600 }}
                >
                  {saving ? <FaSpinner className="animate-spin" size={14} /> : <FaSave size={14} />}
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SecretarySettings;