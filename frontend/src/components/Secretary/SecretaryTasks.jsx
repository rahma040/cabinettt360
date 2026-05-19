import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome, 
  FaUserInjured,
  FaCalendarCheck, 
  FaCog, 
  FaSignOutAlt, 
  FaBell,
  FaClipboardList, 
  FaClock, 
  FaUserClock, 
  FaCheckCircle,
  FaExclamationCircle, 
  FaHourglassHalf, 
  FaBars,
  FaTimes, 
  FaSearch, 
  FaEdit, 
  FaCheck, 
  FaFireAlt, 
  FaFlag,
  FaStethoscope, 
  FaMoneyBillWave, 
  FaStickyNote, 
  FaInbox,
  FaBan,
  FaInfoCircle,
  FaEnvelope,
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
    link.href =
      "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap";
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

  .chip-gray   { background:#F8FAFF; border:1px solid #E2E8F0; color:#64748B; }
  .chip-blue   { background:#EEF4FF; border:1px solid #BFDBFE; color:#1E40AF; }
  .chip-green  { background:#ECFDF5; border:1px solid #A7F3D0; color:#065F46; }
  .chip-amber  { background:#FFFBEB; border:1px solid #FDE68A; color:#92400E; }
  .chip-rose   { background:#FFF1F2; border:1px solid #FECDD3; color:#9F1239; }
  .chip-violet { background:#EEE8FF; border:1px solid #DDD6FE; color:#5B21B6; }

  .prio-high   { background:#FFF1F2; color:#F43F5E; border:1px solid #FECDD3; }
  .prio-medium { background:#FFFBEB; color:#D97706; border:1px solid #FDE68A; }
  .prio-low    { background:#ECFDF5; color:#059669; border:1px solid #A7F3D0; }

  .stat-pending   { background:#EEF4FF; color:#1E40AF; border:1px solid #BFDBFE; }
  .stat-done      { background:#ECFDF5; color:#065F46; border:1px solid #A7F3D0; }
  .stat-cancelled { background:#F8FAFF; color:#64748B; border:1px solid #E2E8F0; }

  .st-input { border:1.5px solid #E2E8F0; background:#fff; transition:all .2s ease; font-size:14px; }
  .st-input:focus { outline:none; border-color:var(--violet); box-shadow:0 0 0 3px var(--violet-glow); }

  .task-row { border:1.5px solid #E8EEFF; border-radius:16px; background:#fff; transition:all .2s ease; cursor:pointer; }
  .task-row:hover { border-color:rgba(139,92,246,.25); box-shadow:0 4px 18px rgba(139,92,246,.08); transform:translateX(3px); }
  .task-row-done { background:#F0FFF8; border-color:#A7F3D0; }
  .task-row-done:hover { border-color:rgba(16,185,129,.35); box-shadow:0 4px 18px rgba(16,185,129,.08); }
  .task-row-cancelled { opacity:.65; }
  .task-row-overdue { background:#FFF5F7; border-color:#FECDD3; }

  .st-select { border:1.5px solid #E2E8F0; border-radius:10px; font-size:12px; padding:5px 10px; cursor:pointer; transition:all .18s ease; background:#fff; font-family:'Sora',sans-serif; }
  .st-select:focus { outline:none; border-color:var(--violet); }

  .filter-pill { border-radius:10px; padding:5px 12px; font-size:12px; font-weight:600; transition:all .18s ease; cursor:pointer; }
  .filter-active { background:#fff; box-shadow:0 2px 10px rgba(6,13,31,.08); color:var(--text-1); }
  .filter-idle { color:var(--text-2); }
  .filter-idle:hover { background:rgba(255,255,255,.5); }

  .btn-ghost { border:1.5px solid #E2E8F0; color:#64748B; background:#fff; transition:all .18s ease; border-radius:12px; }
  .btn-ghost:hover { background:#F8FAFF; border-color:rgba(139,92,246,.3); color:var(--violet); }

  .err-banner { background:#FFF1F2; border:1.5px solid #FECDD3; color:#9F1239; border-radius:14px; }

  .sec-card { background:#fff; border-radius:20px; border:1.5px solid var(--border); }

  .mono { font-family:'JetBrains Mono',monospace; }

  .modal-overlay { position:fixed; inset:0; background:rgba(6,13,31,0.65); backdrop-filter:blur(6px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:20px; }
  .modal-container { background:#fff; border-radius:28px; max-width:500px; width:100%; overflow:hidden; box-shadow:0 32px 64px rgba(0,0,0,0.3); animation:modalFadeIn 0.2s ease; }
  @keyframes modalFadeIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
  .modal-header { display:flex; justify-content:space-between; align-items:center; padding:18px 24px; background:linear-gradient(135deg,var(--violet),#6D28D9); color:white; }
  .modal-header h3 { font-size:1.1rem; font-weight:700; margin:0; }
  .modal-close { background:rgba(255,255,255,0.15); border:none; border-radius:40px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:white; transition:all 0.2s; }
  .modal-close:hover { background:rgba(255,255,255,0.25); }
  .modal-body { padding:24px; }
  .detail-row { display:flex; margin-bottom:16px; border-bottom:1px solid #F0EEFF; padding-bottom:10px; }
  .detail-label { width:100px; font-size:12px; font-weight:600; color:var(--text-2); text-transform:uppercase; letter-spacing:0.05em; }
  .detail-value { flex:1; font-size:14px; font-weight:500; color:var(--text-1); word-break:break-word; white-space:pre-wrap; }
  .detail-value p { margin:0; line-height:1.5; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(139,92,246,.25); border-radius:99px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(139,92,246,.45); }
`;

const priorityMap = {
  low:    { label: "Basse", cls: "prio-low", dot: "#10B981", icon: <FaFlag size={9} /> },
  medium: { label: "Moyenne", cls: "prio-medium", dot: "#F59E0B", icon: <FaFlag size={9} /> },
  high:   { label: "Haute", cls: "prio-high", dot: "#F43F5E", icon: <FaFireAlt size={9} /> },
};

const statusMap = {
  pending:   { label: "En attente", cls: "stat-pending", icon: <FaHourglassHalf size={9} /> },
  done:      { label: "Terminé", cls: "stat-done", icon: <FaCheckCircle size={9} /> },
  cancelled: { label: "Annulé", cls: "stat-cancelled", icon: <FaBan size={9} /> },
};

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

const SecretaryTasks = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const integrityInterval = useRef(null);

  const navItems = [
    { to: "/secretariatdb", icon: <FaHome />, label: "Tableau de bord" },
    { to: "/secpatients", icon: <FaUserInjured />, label: "Patients" },
    { to: "/seccreatepatient", icon: <FaUserPlus />, label: "Comptes patients" },
    { to: "/secretaryRendezvous", icon: <FaCalendarCheck />, label: "Rendez-vous" },
    { to: "/sectasks", icon: <FaClipboardList />, label: "Tâches", active: true },
    { to: "/secwaiting", icon: <FaUserClock />, label: "Salle d'attente" },
    { to: "/secpay", icon: <FaMoneyBillWave />, label: "Paiements"},
    { to: "/secmail", icon: <FaEnvelope />, label: "Messagerie" },
    { to: "/secsettings", icon: <FaCog />, label: "Paramètres" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { navigate("/login"); return; }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "secretaire") { navigate("/dashboard"); return; }
    setUser(parsedUser);

    performIntegrityCheck(navigate, setError, true)
      .then(() => {
        fetchTasks();
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

  const fetchTasks = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get("/doctor/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les tâches.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/doctor/tasks/${taskId}`, { status });
      fetchTasks();
      setEditingTaskId(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du changement de statut");
    }
  };

  const handleLogout = () => {
    if (integrityInterval.current) clearInterval(integrityInterval.current);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userIntegrityHash");
    navigate("/login");
  };

  const formatDateTime = (ds) => {
    if (!ds) return "—";
    return new Date(ds).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const isOverdue = (task) => task.status === "pending" && task.time && new Date(task.time) < new Date();

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  const filtered = tasks.filter((t) => {
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    const matchSearch = !search || t.task.toLowerCase().includes(search.toLowerCase()) || (t.note || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const total = tasks.length;
  const pending  = tasks.filter((t) => t.status === "pending").length;
  const done = tasks.filter((t) => t.status === "done").length;
  const cancelled = tasks.filter((t) => t.status === "cancelled").length;
  const highPrio  = tasks.filter((t) => t.priority === "high" && t.status === "pending").length;
  const overdue  = tasks.filter(isOverdue).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "linear-gradient(135deg,#060D1F,#0C1A3A)" }}>
        <style>{G}</style><FontInjector />
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 st-logo-ring">
            <FaClipboardList className="text-white text-2xl" />
          </div>
          <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-sm" style={{ color: "#94A3B8" }}>Chargement des tâches…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface)" }}>
      <style>{G}</style><FontInjector />

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
        <div className="p-6 lg:p-8 pt-14 lg:pt-8 max-w-6xl mx-auto">

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,var(--violet),#6D28D9)", boxShadow: "0 4px 14px rgba(139,92,246,.35)" }}>
                  <FaClipboardList size={14} />
                </div>
                <h2 className="text-2xl" style={{ fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.03em" }}>
                  Tâches du médecin
                </h2>
              </div>
              <p className="text-sm ml-11 capitalize" style={{ color: "var(--text-2)" }}>
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

          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { cls: "chip-gray",   icon: <FaClipboardList size={11} />, label: "Total",          val: total },
              { cls: "chip-blue",   icon: <FaHourglassHalf size={11} />, label: "En attente",     val: pending },
              { cls: "chip-green",  icon: <FaCheckCircle size={11} />,   label: "Terminées",      val: done },
              { cls: "chip-gray",   icon: <FaBan size={11} />,           label: "Annulées",       val: cancelled },
              { cls: "chip-rose",   icon: <FaFireAlt size={11} />,       label: "Haute priorité", val: highPrio },
              { cls: "chip-rose",   icon: <FaExclamationCircle size={11} />, label: "En retard",  val: overdue },
            ].map((s, i) => (
              <div key={i} className={`${s.cls} px-3.5 py-2 rounded-xl flex items-center gap-2`} style={{ fontWeight: 600, fontSize: 12 }}>
                {s.icon}
                <span>{s.label}</span>
                <span className="mono" style={{ fontWeight: 800 }}>{s.val}</span>
              </div>
            ))}
          </div>

          <div className="sec-card px-5 py-4 mb-5 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2" size={12} style={{ color: "#94A3B8" }} />
              <input
                type="text"
                placeholder="Rechercher une tâche…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm st-input"
              />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#EEE8FF" }}>
              {[["all","Tous"],["pending","En attente"],["done","Terminé"],["cancelled","Annulé"]].map(([v,l]) => (
                <button key={v} onClick={() => setFilterStatus(v)} className={`filter-pill ${filterStatus === v ? "filter-active" : "filter-idle"}`}>{l}</button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#EEE8FF" }}>
              {[["all","Toutes"],["high","Haute"],["medium","Moyenne"],["low","Basse"]].map(([v,l]) => (
                <button key={v} onClick={() => setFilterPriority(v)} className={`filter-pill ${filterPriority === v ? "filter-active" : "filter-idle"}`}>{l}</button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filtered.length === 0 ? (
              <div className="sec-card flex flex-col items-center justify-center py-20">
                <FaInbox size={28} style={{ color: "#DDD6FE", marginBottom: 10 }} />
                <p className="font-700 text-sm mb-1" style={{ fontWeight: 700, color: "var(--text-1)" }}>Aucune tâche trouvée</p>
                <p className="text-sm" style={{ color: "var(--text-2)" }}>Modifiez les filtres pour afficher des tâches</p>
              </div>
            ) : (
              filtered.map((task) => {
                const prio = priorityMap[task.priority] || priorityMap.medium;
                const status = statusMap[task.status] || statusMap.pending;
                const overdue = isOverdue(task);
                const isEditing = editingTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    className={`task-row px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 ${
                      task.status === "done" ? "task-row-done" :
                      task.status === "cancelled" ? "task-row-cancelled" :
                      overdue ? "task-row-overdue" : ""
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: prio.dot }} />

                    <div className="flex-1 min-w-0" onClick={() => openTaskModal(task)}>
                      <p className="text-sm" style={{
                        fontWeight: 700,
                        color: task.status === "cancelled" ? "var(--text-2)" : "var(--text-1)",
                        textDecoration: task.status === "cancelled" ? "line-through" : "none",
                      }}>
                        {task.task}
                      </p>
                      <div className="flex flex-wrap items-center gap-2.5 mt-1">
                        <span className="mono text-xs flex items-center gap-1" style={{ color: overdue ? "#F43F5E" : "var(--text-2)" }}>
                          <FaClock size={9} />
                          {formatDateTime(task.time)}
                        </span>
                        {task.note && (
                          <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-2)" }}>
                            <FaStickyNote size={9} />
                            <span className="max-w-xs truncate">{task.note}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                      <span className={`${prio.cls} px-2.5 py-0.5 rounded-lg text-xs flex items-center gap-1`} style={{ fontWeight: 600 }}>
                        {prio.icon} {prio.label}
                      </span>
                      {overdue && (
                        <span className="px-2.5 py-0.5 rounded-lg text-xs flex items-center gap-1" style={{ background: "#FFF1F2", color: "#F43F5E", border: "1px solid #FECDD3", fontWeight: 700 }}>
                          <FaExclamationCircle size={9} /> En retard
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="st-select"
                          style={{ fontWeight: 600 }}
                          autoFocus
                        >
                          <option value="pending">En attente</option>
                          <option value="done">Terminé</option>
                          <option value="cancelled">Annulé</option>
                        </select>
                        <button
                          onClick={() => handleStatusChange(task.id, newStatus)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-green-100"
                          style={{ color: "#10B981", border: "1.5px solid #A7F3D0" }}
                        >
                          <FaCheck size={12} />
                        </button>
                        <button
                          onClick={() => setEditingTaskId(null)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-gray-100"
                          style={{ color: "#94A3B8", border: "1.5px solid #E2E8F0" }}
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`${status.cls} px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1`} style={{ fontWeight: 600 }}>
                          {status.icon} {status.label}
                        </span>
                        <button
                          onClick={() => { setEditingTaskId(task.id); setNewStatus(task.status); }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-violet-50"
                          style={{ color: "var(--violet)", border: "1.5px solid #DDD6FE" }}
                          title="Modifier le statut"
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          onClick={() => openTaskModal(task)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-violet-50"
                          style={{ color: "var(--violet)", border: "1.5px solid #DDD6FE" }}
                          title="Voir les détails"
                        >
                          <FaInfoCircle size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {filtered.length > 0 && (
            <p className="text-center text-xs mt-4" style={{ color: "var(--text-2)" }}>
              Affichage de {filtered.length} tâche{filtered.length !== 1 ? "s" : ""} sur {total}
            </p>
          )}
        </div>
      </main>

      {modalOpen && selectedTask && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Détails de la tâche</h3>
              <button className="modal-close" onClick={closeModal}>
                <FaTimes size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <div className="detail-label">Titre</div>
                <div className="detail-value">{selectedTask.task}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Date & heure</div>
                <div className="detail-value">{formatDateTime(selectedTask.time)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Priorité</div>
                <div className="detail-value">
                  <span className={`${priorityMap[selectedTask.priority]?.cls || "prio-medium"} px-2.5 py-0.5 rounded-lg text-xs flex items-center gap-1 inline-flex`}>
                    {priorityMap[selectedTask.priority]?.icon} {priorityMap[selectedTask.priority]?.label || "Moyenne"}
                  </span>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Statut</div>
                <div className="detail-value">
                  <span className={`${statusMap[selectedTask.status]?.cls || "stat-pending"} px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1 inline-flex`}>
                    {statusMap[selectedTask.status]?.icon} {statusMap[selectedTask.status]?.label || "En attente"}
                  </span>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Note</div>
                <div className="detail-value">
                  {selectedTask.note ? (
                    <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{selectedTask.note}</p>
                  ) : (
                    <span style={{ color: "var(--text-2)" }}>Aucune note</span>
                  )}
                </div>
              </div>
              {selectedTask.created_at && (
                <div className="detail-row">
                  <div className="detail-label">Créée le</div>
                  <div className="detail-value">{formatDateTime(selectedTask.created_at)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretaryTasks;