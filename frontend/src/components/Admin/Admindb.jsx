import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  FaHome, FaUsers, FaCog, FaSignOutAlt, FaBell, FaUserPlus,
  FaChartLine, FaStethoscope, FaBars, FaTimes, FaUserMd,
  FaEnvelope, FaKey, FaSync, FaArrowRight, FaExclamationCircle,
  FaCheckCircle, FaUserGraduate, FaHospitalUser, FaUser,
} from "react-icons/fa";

const API_BASE = "http://127.0.0.1:8000/api";

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


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

const CHART_COLORS = ["#3B7EF8", "#10B981", "#F59E0B", "#F43F5E", "#8B5CF6"];

const FontInjector = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);
  return null;
};

const G = `
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
  .kpi-blue   { background:linear-gradient(135deg,#EEF4FF,#DBEAFE); border:1.5px solid #BFDBFE; }
  .kpi-green  { background:linear-gradient(135deg,#ECFDF5,#D1FAE5); border:1.5px solid #A7F3D0; }
  .kpi-amber  { background:linear-gradient(135deg,#FFFBEB,#FEF3C7); border:1.5px solid #FDE68A; }
  .kpi-violet { background:linear-gradient(135deg,#EEE8FF,#DDD6FE); border:1.5px solid #DDD6FE; }
  .kpi-card { border-radius:20px; padding:20px; transition:all .22s cubic-bezier(.4,0,.2,1); }
  .kpi-card:hover { transform:translateY(-3px); box-shadow:0 12px 36px rgba(6,13,31,.1); }
  .sec-card { background:#fff; border-radius:20px; border:1.5px solid var(--border); transition:all .2s ease; }
  .sec-card:hover { border-color:rgba(59,126,248,.22); box-shadow:0 8px 28px rgba(59,126,248,.07); }
  .data-row { border:1.5px solid #E8EEFF; border-radius:14px; background:#FAFBFF; transition:all .2s ease; }
  .data-row:hover { border-color:rgba(59,126,248,.22); background:#F0F4FF; transform:translateX(3px); }
  .badge-pending { background:#FFFBEB; color:#92400E; border:1px solid #FDE68A; }
  .badge-processed { background:#ECFDF5; color:#065F46; border:1px solid #A7F3D0; }
  .badge-unverified { background:#FFF1F2; color:#9F1239; border:1px solid #FECDD3; }
  .qa-card { border:1.5px solid var(--border); border-radius:16px; background:#fff; transition:all .22s ease; cursor:pointer; }
  .qa-card:hover { border-color:rgba(59,126,248,.3); box-shadow:0 8px 24px rgba(59,126,248,.1); transform:translateY(-2px); }
  .recharts-tooltip-wrapper { font-family:'Sora',sans-serif !important; }
  .mono { font-family:'JetBrains Mono',monospace; }
  .err-banner { background:#FFF1F2; border:1.5px solid #FECDD3; color:#9F1239; border-radius:14px; }
  .sec-divider { border:none; border-top:1.5px solid #F0EEFF; margin:0 0 16px 0; }
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(59,126,248,.25); border-radius:99px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(59,126,248,.45); }
`;

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1.5px solid #E8EEFF", borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(6,13,31,.1)", fontFamily: "Sora,sans-serif" }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: "#0A0F1E" }}>{payload[0].name}</p>
      <p style={{ fontSize: 12, fontWeight: 600, color: payload[0].payload.fill }}>{payload[0].value}</p>
    </div>
  );
};

const RoleBadge = ({ role }) => {
  const map = {
    admin: { label: "Admin", cls: "badge-pending", icon: <FaUserGraduate size={9} /> },
    medecin: { label: "Médecin", cls: "badge-processed", icon: <FaUserMd size={9} /> },
    secretaire: { label: "Secrétaire", cls: "badge-unverified", icon: <FaHospitalUser size={9} /> },
    patient: { label: "Patient", cls: "badge-pending", icon: <FaUser size={9} /> },
  };
  const cfg = map[role] || map.patient;
  return (
    <span className={`${cfg.cls} px-2 py-0.5 rounded-full text-xs flex items-center gap-1`} style={{ fontWeight: 600 }}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  if (status === "pending") {
    return <span className="badge-pending px-2 py-0.5 rounded-full text-xs" style={{ fontWeight: 600 }}>En attente</span>;
  }
  return <span className="badge-processed px-2 py-0.5 rounded-full text-xs" style={{ fontWeight: 600 }}>Traité</span>;
};

const EmptyState = ({ icon, label, small = false }) => (
  <div className={`flex flex-col items-center justify-center text-center ${small ? "py-6" : "py-10"}`}>
    <div className={`mb-2 ${small ? "" : "mb-3"}`}>{icon}</div>
    <p className="text-xs" style={{ color: "var(--text-2)", fontWeight: 500 }}>{label}</p>
  </div>
);

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

    // First time: store the obfuscated hash
    if (isInitial && !storedObfuscatedHash && data.integrity_hash) {
      const obfuscated = obfuscate(data.integrity_hash);
      localStorage.setItem("userIntegrityHash", obfuscated);
      return;
    }

    // Subsequent checks: deobfuscate and compare
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [messageNotifications, setMessageNotifications] = useState([]);

  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0, totalPatients: 0, totalMedecins: 0, totalSecretaires: 0, totalAdmins: 0,
    unverifiedDoctors: 0, totalAppointments: 0, totalCommunications: 0, pendingResetRequests: 0,
    recentUsers: [], recentPasswordResets: [], recentCommunications: [], userRoleDistribution: []
  });

  const integrityInterval = useRef(null);

  const navItems = [
    { to: "/admindb", icon: <FaHome />, label: "Tableau de bord", active: true },
    { to: "/adminusers", icon: <FaUsers />, label: "Utilisateurs" },
    { to: "/adminpass", icon: <FaKey />, label: "Réinitialisation MDP" },
    { to: "/adminverify", icon: <FaUserMd />, label: "Vérifier Médecins" },
    { to: "/admincoms", icon: <FaEnvelope />, label: "Communications" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    setUser(parsed);

    performIntegrityCheck(navigate, setError, true)
      .then(() => {
        fetchDashboardData();
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

  const fetchDashboardData = async () => {
    setError(null);
    try {
      const [dashboardRes, unreadRes, notifRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/communications/unread-count"),
        api.get("/communications/notifications"),
      ]);

      setDashboardData(dashboardRes.data);
      setUnreadMessageCount(unreadRes.data?.count || 0);
      setMessageNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données du tableau de bord.");
    }
  };

  const handleLogout = () => {
    if (integrityInterval.current) clearInterval(integrityInterval.current);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userIntegrityHash");
    navigate("/login");
  };

  const kpis = [
    { cls: "kpi-blue", icon: <FaUsers size={20} style={{ color: "#1E40AF" }} />, label: "Total utilisateurs", val: dashboardData.totalUsers, sub: "tous rôles confondus", mono: true },
    { cls: "kpi-green", icon: <FaUserMd size={20} style={{ color: "#059669" }} />, label: "Médecins", val: dashboardData.totalMedecins, sub: "dont non vérifiés: " + dashboardData.unverifiedDoctors, mono: true },
    { cls: "kpi-violet", icon: <FaEnvelope size={20} style={{ color: "#5B21B6" }} />, label: "Messages", val: dashboardData.totalCommunications, sub: "échangés sur la plateforme", mono: true },
  ];

  const quickActions = [
    { to: "/adminusers", icon: <FaUserPlus size={18} style={{ color: "#1E40AF" }} />, bg: "#EEF4FF", label: "Nouvel utilisateur" },
    { to: "/adminverify", icon: <FaUserMd size={18} style={{ color: "#D97706" }} />, bg: "#FFFBEB", label: "Vérifier médecins" },
    { to: "/adminpass", icon: <FaKey size={18} style={{ color: "#059669" }} />, bg: "#ECFDF5", label: "Réinitialisations" },
    { to: "/admincoms", icon: <FaEnvelope size={18} style={{ color: "#5B21B6" }} />, bg: "#EEE8FF", label: "Messages" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "linear-gradient(135deg,#060D1F,#0C1A3A)" }}>
        <style>{G}</style><FontInjector />
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 db-logo-ring">
            <FaStethoscope className="text-white text-2xl" />
          </div>
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-sm" style={{ color: "#94A3B8" }}>Chargement du tableau de bord…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface)" }}>
      <style>{G}</style><FontInjector />

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

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,var(--accent),#2563EB)", boxShadow: "0 4px 14px rgba(59,126,248,.35)" }}>
                  <FaHome size={14} />
                </div>
                <h2 className="text-2xl" style={{ fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.03em" }}>Tableau de bord</h2>
              </div>
              <p className="text-sm ml-11 capitalize" style={{ color: "var(--text-2)" }}>
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            <div className="mt-4 sm:mt-0 flex items-center gap-3">
              <button onClick={fetchDashboardData} className="w-10 h-10 rounded-xl flex items-center justify-center btn-ghost" title="Actualiser">
                <FaSync size={13} style={{ color: "#64748B" }} />
              </button>
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center btn-ghost"
              >
                <FaBell size={15} style={{ color: "#64748B" }} />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center" style={{ background: "var(--rose)", fontSize: 9, fontWeight: 700 }}>
                  {dashboardData.pendingResetRequests + dashboardData.unverifiedDoctors + unreadMessageCount}
                </span>
              </button>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: "#fff", border: "1.5px solid var(--border)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs db-logo-ring" style={{ fontWeight: 700 }}>{user?.name?.charAt(0) || "A"}</div>
                <span className="hidden sm:inline text-sm" style={{ fontWeight: 600, color: "var(--text-1)" }}>{user?.name || "Admin"}</span>
              </div>
            </div>

            {showNotifications && (
              <div className="mt-3 p-3 rounded-xl" style={{ background: "#fff", border: "1.5px solid var(--border)", minWidth: 300 }}>
                <p className="text-xs mb-2" style={{ color: "var(--text-2)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Notifications
                </p>
                <div className="space-y-2 text-xs" style={{ color: "var(--text-1)" }}>
                  <div className="flex items-center justify-between">
                    <span>Demandes de réinitialisation</span>
                    <span style={{ fontWeight: 700 }}>{dashboardData.pendingResetRequests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Médecins à vérifier</span>
                    <span style={{ fontWeight: 700 }}>{dashboardData.unverifiedDoctors}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Messages non lus</span>
                    <span style={{ fontWeight: 700 }}>{unreadMessageCount}</span>
                  </div>
                </div>

                {messageNotifications.length > 0 && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid #E8EEFF" }}>
                    <p className="text-xs mb-2" style={{ color: "var(--text-2)", fontWeight: 700 }}>Derniers messages</p>
                    <div className="space-y-2">
                      {messageNotifications.slice(0, 3).map((item) => (
                        <div key={item.id} className="p-2 rounded-lg" style={{ background: "#F8FAFF" }}>
                          <p className="text-xs" style={{ fontWeight: 700 }}>{item.sender_name || item.sender_email || "Expéditeur"}</p>
                          <p className="text-xs truncate" style={{ color: "var(--text-2)" }}>{item.message_preview}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="err-banner px-5 py-4 mb-6 flex items-center gap-3">
              <FaExclamationCircle size={16} style={{ color: "#F43F5E" }} />
              <span className="text-sm" style={{ fontWeight: 600 }}>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {kpis.map((k, i) => (
              <div key={i} className={`kpi-card ${k.cls}`} style={{ flex: "1 1 280px", maxWidth: "320px" }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.7)" }}>
                    {k.icon}
                  </div>
                </div>
                <p className="text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text-2)", fontWeight: 600, letterSpacing: "0.08em" }}>{k.label}</p>
                <p className={`${k.mono ? "mono" : ""} mb-1`} style={{ fontSize: k.mono ? 26 : 18, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em" }}>{k.val}</p>
                <p className="text-xs" style={{ color: "var(--text-2)", fontWeight: 500 }}>{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {quickActions.map((qa, i) => (
              <Link key={i} to={qa.to} className="qa-card p-4 flex items-center gap-3 no-underline">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: qa.bg }}>
                  {qa.icon}
                </div>
                <span className="text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>{qa.label}</span>
                <FaArrowRight size={10} style={{ color: "var(--text-2)", marginLeft: "auto" }} />
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 sec-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#EEF4FF" }}>
                    <FaUsers size={14} style={{ color: "var(--accent)" }} />
                  </div>
                  <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>Derniers utilisateurs inscrits</p>
                </div>
                <Link to="/adminusers" className="text-xs flex items-center gap-1" style={{ color: "var(--accent)", fontWeight: 600 }}>
                  Voir tout <FaArrowRight size={9} />
                </Link>
              </div>
              <hr className="sec-divider" />
              {dashboardData.recentUsers.length === 0 ? (
                <EmptyState icon={<FaUsers size={22} style={{ color: "#DDD6FE" }} />} label="Aucun utilisateur récent" />
              ) : (
                <div className="space-y-2">
                  {dashboardData.recentUsers.map((u, i) => (
                    <div key={i} className="data-row px-4 py-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs flex-shrink-0 db-logo-ring" style={{ fontWeight: 700 }}>
                        {u.name?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ fontWeight: 700, color: "var(--text-1)" }}>{u.name}</p>
                        <p className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color: "var(--text-2)" }}>
                          <FaEnvelope size={9} /> {u.email}
                        </p>
                      </div>
                      <RoleBadge role={u.role} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sec-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#FFFBEB" }}>
                    <FaKey size={14} style={{ color: "#D97706" }} />
                  </div>
                  <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>Demandes de réinitialisation</p>
                </div>
                <Link to="/adminpass" className="text-xs flex items-center gap-1" style={{ color: "var(--accent)", fontWeight: 600 }}>
                  Voir tout <FaArrowRight size={9} />
                </Link>
              </div>
              <hr className="sec-divider" />
              {dashboardData.recentPasswordResets.length === 0 ? (
                <EmptyState icon={<FaKey size={22} style={{ color: "#DDD6FE" }} />} label="Aucune demande récente" />
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {dashboardData.recentPasswordResets.map((req, i) => (
                    <div key={i} className="data-row px-3 py-2.5">
                      <p className="text-xs truncate" style={{ fontWeight: 700, color: "var(--text-1)" }}>{req.login_email}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs" style={{ color: "var(--text-2)" }}>{formatDate(req.created_at)}</span>
                        <StatusBadge status={req.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="sec-card p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#ECFDF5" }}>
                  <FaEnvelope size={14} style={{ color: "#059669" }} />
                </div>
                <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>Derniers messages</p>
              </div>
              <hr className="sec-divider" />
              {dashboardData.recentCommunications.length === 0 ? (
                <EmptyState icon={<FaEnvelope size={22} style={{ color: "#DDD6FE" }} />} label="Aucun message récent" />
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {dashboardData.recentCommunications.map((msg, i) => (
                    <div key={i} className="data-row px-3 py-2.5">
                      <p className="text-xs truncate" style={{ fontWeight: 700, color: "var(--text-1)" }}>À: {msg.recipient_email}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-2)" }}>{msg.message.substring(0, 50)}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs" style={{ color: "var(--text-2)" }}>{formatDateTime(msg.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 sec-card p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#EEE8FF" }}>
                  <FaChartLine size={14} style={{ color: "#5B21B6" }} />
                </div>
                <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>Répartition des utilisateurs par rôle</p>
              </div>
              <hr className="sec-divider" />
              {dashboardData.userRoleDistribution.length === 0 ? (
                <EmptyState icon={<FaChartLine size={22} style={{ color: "#DDD6FE" }} />} label="Aucune donnée" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={dashboardData.userRoleDistribution} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" paddingAngle={3}>
                      {dashboardData.userRoleDistribution.map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={7} formatter={(v) => <span style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 600 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="mt-3 text-center">
                <span className="text-xs" style={{ color: "var(--text-2)" }}>Total utilisateurs: <strong>{dashboardData.totalUsers}</strong></span>
              </div>
            </div>
          </div>

          <div className="sec-card p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#FFF1F2" }}>
                <FaUserMd size={14} style={{ color: "#F43F5E" }} />
              </div>
              <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>Médecins en attente de vérification</p>
            </div>
            <hr className="sec-divider" />
            {dashboardData.unverifiedDoctors === 0 ? (
              <EmptyState icon={<FaCheckCircle size={22} style={{ color: "#10B981" }} />} label="Tous les médecins sont vérifiés" />
            ) : (
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "#FFF1F2", border: "1.5px solid #FECDD3" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#F43F5E20" }}>
                    <FaUserMd size={18} style={{ color: "#F43F5E" }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>{dashboardData.unverifiedDoctors} médecin(s) en attente</p>
                    <p className="text-xs" style={{ color: "var(--text-2)" }}>Document(s) à vérifier</p>
                  </div>
                </div>
                <Link to="/adminverify" className="btn-accent px-4 py-2 rounded-xl text-xs flex items-center gap-2" style={{ fontWeight: 600 }}>
                  Vérifier maintenant <FaArrowRight size={10} />
                </Link>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;