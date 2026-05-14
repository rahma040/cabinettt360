import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome, 
  FaUserInjured, 
  FaCalendarCheck, 
  FaFileMedical, 
  FaCog,
  FaSignOutAlt, 
  FaUserPlus, 
  FaUserClock, 
  FaChartLine,
  FaTasks, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCheckCircle, 
  FaTimesCircle,
  FaHourglassHalf, 
  FaBars, 
  FaTimes, 
  FaStethoscope, 
  FaSearch, 
  FaFlag, 
  FaStickyNote,
  FaEllipsisV, 
  FaCheck, 
  FaClock, 
  FaExclamationCircle,
  FaInbox, 
  FaFireAlt,
  FaEnvelope,
  FaGraduationCap,
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
    --accent-glow: rgba(59,126,248,0.20);
    --teal:        #0ECDB5;
    --amber:       #F59E0B;
    --rose:        #F43F5E;
    --emerald:     #10B981;
    --violet:      #8B5CF6;
    --surface:     #F4F7FF;
    --text-1:      #0A0F1E;
    --text-2:      #5B6B8A;
    --border:      rgba(59,126,248,0.13);
  }

  .dt-sidebar { background: linear-gradient(180deg,var(--navy) 0%,var(--navy-mid) 60%,var(--navy-light) 100%); }
  .dt-logo-ring { background: linear-gradient(135deg,var(--accent),#2563EB); }
  .dt-nav-link { transition:all .2s ease; border-left:3px solid transparent; color:rgba(255,255,255,.48); font-size:14px; }
  .dt-nav-link:hover { background:rgba(59,126,248,.14); border-left-color:var(--accent); color:#fff; }
  .dt-nav-link.active { background:rgba(59,126,248,.22); border-left-color:var(--accent); color:#fff; }
  .dt-toggle { background:linear-gradient(135deg,var(--accent),#2563EB); box-shadow:0 4px 14px rgba(59,126,248,.4); }

  .btn-accent { background:linear-gradient(135deg,var(--accent),#2563EB); color:#fff; box-shadow:0 4px 14px rgba(59,126,248,.32); transition:all .2s ease; }
  .btn-accent:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(59,126,248,.42); }
  .btn-emerald { background:linear-gradient(135deg,var(--emerald),#059669); color:#fff; box-shadow:0 4px 14px rgba(16,185,129,.28); transition:all .2s ease; }
  .btn-emerald:hover { transform:translateY(-1px); }
  .btn-amber { background:linear-gradient(135deg,var(--amber),#D97706); color:#fff; box-shadow:0 4px 14px rgba(245,158,11,.28); transition:all .2s ease; }
  .btn-amber:hover { transform:translateY(-1px); }
  .btn-ghost { border:1.5px solid #E2E8F0; color:#64748B; background:#fff; transition:all .18s ease; }
  .btn-ghost:hover { background:#F8FAFF; border-color:rgba(59,126,248,.3); color:var(--accent); }

  .dt-input { border:1.5px solid #E2E8F0; background:#fff; transition:all .2s ease; font-size:14px; }
  .dt-input:focus { outline:none; border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-glow); }

  .chip-blue   { background:#EEF4FF; border:1px solid #BFDBFE; color:#1E40AF; }
  .chip-green  { background:#ECFDF5; border:1px solid #A7F3D0; color:#065F46; }
  .chip-amber  { background:#FFFBEB; border:1px solid #FDE68A; color:#92400E; }
  .chip-rose   { background:#FFF1F2; border:1px solid #FECDD3; color:#9F1239; }
  .chip-gray   { background:#F8FAFF; border:1px solid #E2E8F0; color:#64748B; }

  .kanban-col { background:#F8FAFF; border:1.5px solid #E8EEFF; border-radius:20px; min-height:200px; transition:all .2s ease; }
  .kanban-col-header { border-radius:16px 16px 0 0; padding:14px 16px; }

  .task-card { background:#fff; border:1.5px solid #E8EEFF; border-radius:16px; transition:all .22s cubic-bezier(.4,0,.2,1); }
  .task-card:hover { border-color:rgba(59,126,248,.28); box-shadow:0 8px 24px rgba(59,126,248,.1); transform:translateY(-2px); }
  .task-card-done { background:#F0FFF8; border-color:#A7F3D0; }
  .task-card-done:hover { border-color:rgba(16,185,129,.4); box-shadow:0 8px 24px rgba(16,185,129,.1); }
  .task-card-cancelled { background:#F8FAFF; border-color:#E2E8F0; opacity:.7; }

  .prio-high   { background:#FFF1F2; color:#F43F5E; border:1px solid #FECDD3; }
  .prio-medium { background:#FFFBEB; color:#D97706; border:1px solid #FDE68A; }
  .prio-low    { background:#ECFDF5; color:#059669; border:1px solid #A7F3D0; }

  .status-pending   { background:#EEF4FF; color:#1E40AF; border:1px solid #BFDBFE; }
  .status-done      { background:#ECFDF5; color:#065F46; border:1px solid #A7F3D0; }
  .status-cancelled { background:#F8FAFF; color:#64748B; border:1px solid #E2E8F0; }

  .status-select { border:1.5px solid #E2E8F0; border-radius:10px; font-size:12px; padding:4px 8px; cursor:pointer; transition:all .18s ease; background:#fff; }
  .status-select:focus { outline:none; border-color:var(--accent); }

  .filter-pill { border-radius:10px; padding:6px 14px; font-size:12px; font-weight:600; transition:all .18s ease; cursor:pointer; }
  .filter-pill-active { background:#fff; box-shadow:0 2px 10px rgba(6,13,31,.08); color:var(--text-1); }
  .filter-pill-idle { color:var(--text-2); }
  .filter-pill-idle:hover { background:rgba(255,255,255,.5); }

  .modal-overlay { background:rgba(6,13,31,.62); backdrop-filter:blur(7px); }
  .modal-box { animation:mIn .24s cubic-bezier(.4,0,.2,1); }
  @keyframes mIn { from{opacity:0;transform:scale(.95) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);} }

  .error-banner { background:#FFF1F2; border:1.5px solid #FECDD3; color:#9F1239; border-radius:14px; }

  .task-row { border:1.5px solid #E8EEFF; border-radius:14px; background:#fff; transition:all .2s ease; }
  .task-row:hover { border-color:rgba(59,126,248,.22); box-shadow:0 4px 16px rgba(59,126,248,.08); transform:translateX(3px); }
  .task-row-done { background:#F0FFF8; border-color:#A7F3D0; }
  .task-row-cancelled { opacity:.65; }

  .mono { font-family:'JetBrains Mono',monospace; }

  .view-bar { background:#E8EEFF; border-radius:12px; padding:4px; }
  .view-active { background:#fff; box-shadow:0 2px 10px rgba(6,13,31,.08); font-weight:700; color:var(--text-1); }
  .view-idle { color:var(--text-2); font-weight:500; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(59,126,248,.25); border-radius:99px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(59,126,248,.45); }
`;

const priorityMap = {
  low:    { label: "Basse",   cls: "prio-low",    icon: <FaFlag size={9} />,            dot: "#10B981" },
  medium: { label: "Moyenne", cls: "prio-medium",  icon: <FaFlag size={9} />,            dot: "#F59E0B" },
  high:   { label: "Haute",   cls: "prio-high",    icon: <FaFireAlt size={9} />,         dot: "#F43F5E" },
};

const statusMap = {
  pending:   { label: "En attente", cls: "status-pending",   icon: <FaHourglassHalf size={10} />,  colColor: "#EEF4FF", colBorder: "#BFDBFE", colText: "#1E40AF", colDot: "#3B7EF8" },
  done:      { label: "Terminé",    cls: "status-done",      icon: <FaCheckCircle size={10} />,    colColor: "#ECFDF5", colBorder: "#A7F3D0", colText: "#065F46", colDot: "#10B981" },
  cancelled: { label: "Annulé",     cls: "status-cancelled", icon: <FaTimesCircle size={10} />,    colColor: "#F8FAFF", colBorder: "#E2E8F0", colText: "#64748B", colDot: "#94A3B8" },
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

const DoctorTasks = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [view, setView] = useState("kanban"); 
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [search, setSearch] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);

  const [formData, setFormData] = useState({
    task: "", time: "", priority: "medium", status: "pending", note: "",
  });

  const integrityInterval = useRef(null);

  const navItems = [
    { to: "/docdb", icon: <FaHome />, label: "Tableau de bord" },
    { to: "/patients", icon: <FaUserInjured />, label: "Patients" },
    { to: "/prescription", icon: <FaFileMedical />, label: "Ordonnance" },
    { to: "/rendezvous", icon: <FaCalendarCheck />, label: "Rendez-vous" },
    { to: "/docwaiting", icon: <FaUserClock />, label: "Salle d'attente" },
    { to: "/createsec", icon: <FaUserPlus />, label: "Secrétaire" },
    { to: "/docstats", icon: <FaChartLine />, label: "Statistiques" },
    { to: "/doctasks", icon: <FaTasks />, label: "Tâches", active: true },
    { to: "/docmail", icon: <FaEnvelope />, label: "Communication" },
    { to: "/doctuto", icon: <FaGraduationCap />, label: "Tutoriel" },
    { to: "/docsettings", icon: <FaCog />, label: "Paramètres" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { navigate("/login"); return; }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "medecin") { navigate("/dashboard"); return; }
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

  useEffect(() => {
    const handler = () => setMenuOpenId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ task: "", time: "", priority: "medium", status: "pending", note: "" });
    setEditingTask(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) await api.put(`/doctor/tasks/${editingTask.id}`, formData);
      else await api.post("/doctor/tasks", formData);
      resetForm();
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({ task: task.task, time: task.time.slice(0, 16), priority: task.priority, status: task.status, note: task.note || "" });
    setShowForm(true);
    setMenuOpenId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette tâche ?")) return;
    try { await api.delete(`/doctor/tasks/${id}`); fetchTasks(); }
    catch (err) { console.error(err); alert("Erreur lors de la suppression"); }
    setMenuOpenId(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try { await api.put(`/doctor/tasks/${id}`, { status: newStatus }); fetchTasks(); }
    catch (err) { console.error(err); alert("Erreur lors du changement de statut"); }
  };

  const handleLogout = () => {
    if (integrityInterval.current) clearInterval(integrityInterval.current);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userIntegrityHash");
    navigate("/login");
  };

  const formatDateTime = (s) => {
    if (!s) return "";
    const d = new Date(s);
    return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const isOverdue = (task) => task.status === "pending" && task.time && new Date(task.time) < new Date();

  const filtered = tasks.filter((t) => {
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    const matchSearch = !search || t.task.toLowerCase().includes(search.toLowerCase()) || (t.note || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const byStatus = {
    pending:filtered.filter((t) => t.status === "pending"),
    done:filtered.filter((t) => t.status === "done"),
    cancelled:filtered.filter((t) => t.status === "cancelled"),
  };

  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const done = tasks.filter((t) => t.status === "done").length;
  const cancelled = tasks.filter((t) => t.status === "cancelled").length;
  const highPrio  = tasks.filter((t) => t.priority === "high" && t.status === "pending").length;
  const overdue  = tasks.filter(isOverdue).length;

  const IC = "w-full p-3 rounded-xl text-sm dt-input";
  const LC = "block text-xs font-600 mb-1.5 uppercase tracking-wider";
  const LS = { color: "var(--text-2)", fontWeight: 600, letterSpacing: "0.07em" };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "linear-gradient(135deg,#060D1F,#0C1A3A)" }}>
        <style>{G}</style><FontInjector />
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 dt-logo-ring">
            <FaTasks className="text-white text-2xl" />
          </div>
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-sm" style={{ color: "#94A3B8" }}>Chargement des tâches…</span>
        </div>
      </div>
    );
  }

  const TaskCard = ({ task, compact = false }) => {
    const prio   = priorityMap[task.priority] || priorityMap.medium;
    const status = statusMap[task.status] || statusMap.pending;
    const overdue = isOverdue(task);

    return (
      <div
        className={`task-card ${task.status === "done" ? "task-card-done" : task.status === "cancelled" ? "task-card-cancelled" : ""} p-4 ${compact ? "" : "mb-2"}`}
        style={overdue ? { borderColor: "#FECDD3", background: "#FFF5F7" } : {}}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="text-sm flex-1" style={{
            fontWeight: 700,
            color: task.status === "cancelled" ? "var(--text-2)" : "var(--text-1)",
            textDecoration: task.status === "cancelled" ? "line-through" : "none",
          }}>
            {task.task}
          </p>

          <div className="relative flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === task.id ? null : task.id); }}
              className="w-7 h-7 rounded-xl flex items-center justify-center btn-ghost"
            >
              <FaEllipsisV size={11} />
            </button>
            {menuOpenId === task.id && (
              <div className="absolute right-0 top-9 z-30 bg-white rounded-2xl shadow-xl py-1 w-36" style={{ border: "1.5px solid #E8EEFF" }}>
                <button onClick={() => handleEdit(task)} className="w-full text-left px-4 py-2.5 text-xs flex items-center gap-2.5 hover:bg-blue-50 transition-all" style={{ color: "var(--text-1)", fontWeight: 600 }}>
                  <FaEdit size={12} style={{ color: "var(--accent)" }} /> Modifier
                </button>
                <button onClick={() => { handleStatusChange(task.id, "done"); setMenuOpenId(null); }} className="w-full text-left px-4 py-2.5 text-xs flex items-center gap-2.5 hover:bg-green-50 transition-all" style={{ color: "#065F46", fontWeight: 600 }}>
                  <FaCheck size={12} style={{ color: "#10B981" }} /> Marquer terminé
                </button>
                <button onClick={() => handleDelete(task.id)} className="w-full text-left px-4 py-2.5 text-xs flex items-center gap-2.5 hover:bg-red-50 transition-all" style={{ color: "#9F1239", fontWeight: 600 }}>
                  <FaTrash size={12} style={{ color: "#F43F5E" }} /> Supprimer
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className={`${prio.cls} px-2 py-0.5 rounded-lg text-xs flex items-center gap-1`} style={{ fontWeight: 600 }}>
            {prio.icon} {prio.label}
          </span>
          {overdue && (
            <span className="px-2 py-0.5 rounded-lg text-xs flex items-center gap-1" style={{ background: "#FFF1F2", color: "#F43F5E", border: "1px solid #FECDD3", fontWeight: 700 }}>
              <FaExclamationCircle size={9} /> En retard
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <FaClock size={10} style={{ color: overdue ? "#F43F5E" : "var(--text-2)" }} />
          <span className="mono text-xs" style={{ color: overdue ? "#F43F5E" : "var(--text-2)", fontWeight: 500 }}>
            {formatDateTime(task.time)}
          </span>
        </div>

        {task.note && (
          <div className="flex items-start gap-1.5 mb-3">
            <FaStickyNote size={10} style={{ color: "var(--text-2)", flexShrink: 0, marginTop: 2 }} />
            <p className="text-xs line-clamp-2" style={{ color: "var(--text-2)" }}>{task.note}</p>
          </div>
        )}

        <select
          value={task.status}
          onChange={(e) => handleStatusChange(task.id, e.target.value)}
          className="status-select w-full"
          onClick={(e) => e.stopPropagation()}
          style={{ fontWeight: 600, color: status.cls === "status-pending" ? "#1E40AF" : status.cls === "status-done" ? "#065F46" : "#64748B" }}
        >
          <option value="pending">En attente</option>
          <option value="done">Terminé</option>
          <option value="cancelled">Annulé</option>
        </select>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface)" }}>
      <style>{G}</style><FontInjector />

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
              <p className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>Espace médecin</p>
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
              {user?.name?.charAt(0) || "D"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate" style={{ fontWeight: 600 }}>Dr. {user?.name || "Médecin"}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>Médecin</p>
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
                  <FaTasks size={14} />
                </div>
                <h2 className="text-2xl" style={{ fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.03em" }}>Mes tâches</h2>
              </div>
              <p className="text-sm ml-11 capitalize" style={{ color: "var(--text-2)" }}>
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="view-bar flex">
                {[["kanban", "Kanban"], ["list", "Liste"]].map(([v, l]) => (
                  <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-xl text-xs transition-all ${view === v ? "view-active" : "view-idle"}`}>{l}</button>
                ))}
              </div>

              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="btn-accent px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
                style={{ fontWeight: 600 }}
              >
                <FaPlus size={12} /> Nouvelle tâche
              </button>
            </div>
          </div>

          {error && (
            <div className="error-banner px-5 py-4 mb-6 flex items-center gap-3">
              <FaExclamationCircle size={16} style={{ color: "#F43F5E" }} />
              <span className="text-sm" style={{ fontWeight: 600 }}>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { cls: "chip-gray",  icon: <FaTasks size={11} />,           label: "Total",        val: total },
              { cls: "chip-blue",  icon: <FaHourglassHalf size={11} />,   label: "En attente",   val: pending },
              { cls: "chip-green", icon: <FaCheckCircle size={11} />,     label: "Terminées",    val: done },
              { cls: "chip-rose",  icon: <FaTimesCircle size={11} />,     label: "Annulées",     val: cancelled },
              { cls: "chip-amber", icon: <FaFireAlt size={11} />,         label: "Haute priorité",val: highPrio },
              { cls: "chip-rose",  icon: <FaExclamationCircle size={11} />,label: "En retard",   val: overdue },
            ].map((s, i) => (
              <div key={i} className={`${s.cls} px-3.5 py-2 rounded-xl flex items-center gap-2`} style={{ fontWeight: 600, fontSize: 12 }}>
                {s.icon}
                <span>{s.label}</span>
                <span className="mono" style={{ fontWeight: 800 }}>{s.val}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-white rounded-2xl" style={{ border: "1.5px solid var(--border)" }}>
            <div className="relative flex-1 min-w-48">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2" size={12} style={{ color: "#94A3B8" }} />
              <input
                type="text"
                placeholder="Rechercher une tâche…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm dt-input"
              />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#F0F4FF" }}>
              {[["all", "Tous"], ["pending", "En attente"], ["done", "Terminé"], ["cancelled", "Annulé"]].map(([v, l]) => (
                <button key={v} onClick={() => setFilterStatus(v)} className={`filter-pill ${filterStatus === v ? "filter-pill-active" : "filter-pill-idle"}`}>
                  {l}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#F0F4FF" }}>
              {[["all", "Toutes"], ["high", "Haute"], ["medium", "Moyenne"], ["low", "Basse"]].map(([v, l]) => (
                <button key={v} onClick={() => setFilterPriority(v)} className={`filter-pill ${filterPriority === v ? "filter-pill-active" : "filter-pill-idle"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {view === "kanban" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(["pending", "done", "cancelled"]).map((status) => {
                const s = statusMap[status];
                const col = byStatus[status];
                return (
                  <div key={status} className="kanban-col">
                    <div className="kanban-col-header flex items-center justify-between" style={{ background: s.colColor, borderBottom: `1.5px solid ${s.colBorder}` }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.colDot }} />
                        <span className="text-sm" style={{ fontWeight: 700, color: s.colText }}>{s.label}</span>
                      </div>
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: "rgba(255,255,255,.7)", color: s.colText, fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>
                        {col.length}
                      </span>
                    </div>

                    <div className="p-3 space-y-2 min-h-36">
                      {col.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <FaInbox size={22} style={{ color: "#DDD6FE", marginBottom: 8 }} />
                          <p className="text-xs" style={{ color: "#94A3B8", fontWeight: 500 }}>Aucune tâche</p>
                        </div>
                      ) : (
                        col.map((task) => <TaskCard key={task.id} task={task} />)
                      )}
                    </div>

                    {status === "pending" && (
                      <div className="px-3 pb-3">
                        <button
                          onClick={() => { resetForm(); setShowForm(true); }}
                          className="w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                          style={{ border: "1.5px dashed #BFDBFE", color: "var(--accent)", fontWeight: 600 }}
                        >
                          <FaPlus size={10} /> Ajouter une tâche
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {view === "list" && (
            <div className="space-y-2.5">
              {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-20" style={{ border: "1.5px dashed #DBEAFE" }}>
                  <FaInbox size={28} style={{ color: "#BFDBFE", marginBottom: 10 }} />
                  <p className="font-700 text-base mb-1" style={{ fontWeight: 700, color: "var(--text-1)" }}>Aucune tâche trouvée</p>
                  <p className="text-sm" style={{ color: "var(--text-2)" }}>Modifiez les filtres ou ajoutez une nouvelle tâche</p>
                </div>
              ) : (
                filtered.map((task) => {
                  const prio = priorityMap[task.priority] || priorityMap.medium;
                  const overdue = isOverdue(task);
                  return (
                    <div key={task.id} className={`task-row ${task.status === "done" ? "task-row-done" : task.status === "cancelled" ? "task-row-cancelled" : ""} px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3`}
                      style={overdue ? { borderColor: "#FECDD3", background: "#FFF5F7" } : {}}
                    >
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: prio.dot }} />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm" style={{
                          fontWeight: 700, color: task.status === "cancelled" ? "var(--text-2)" : "var(--text-1)",
                          textDecoration: task.status === "cancelled" ? "line-through" : "none",
                        }}>
                          {task.task}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 mono text-xs" style={{ color: overdue ? "#F43F5E" : "var(--text-2)" }}>
                            <FaClock size={9} /> {formatDateTime(task.time)}
                          </span>
                          {task.note && (
                            <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-2)" }}>
                              <FaStickyNote size={9} /> {task.note.substring(0, 40)}{task.note.length > 40 ? "…" : ""}
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

                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="status-select flex-shrink-0"
                        style={{ fontWeight: 600 }}
                      >
                        <option value="pending">En attente</option>
                        <option value="done">Terminé</option>
                        <option value="cancelled">Annulé</option>
                      </select>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => handleEdit(task)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-blue-50" style={{ color: "var(--accent)", border: "1.5px solid #BFDBFE" }}>
                          <FaEdit size={12} />
                        </button>
                        <button onClick={() => handleDelete(task.id)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-red-50" style={{ color: "#F43F5E", border: "1.5px solid #FECDD3" }}>
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-8 py-6" style={{ background: "linear-gradient(135deg,var(--accent),#2563EB)" }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  {editingTask ? <FaEdit className="text-white" size={16} /> : <FaPlus className="text-white" size={16} />}
                </div>
                <button onClick={resetForm} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-all">
                  <FaTimes size={14} />
                </button>
              </div>
              <h3 className="text-white text-lg" style={{ fontWeight: 800 }}>{editingTask ? "Modifier la tâche" : "Nouvelle tâche"}</h3>
              <p className="text-white/60 text-xs mt-0.5">Remplissez les informations ci-dessous</p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
              <div>
                <label className={LC} style={LS}>Tâche <span style={{ color: "var(--rose)" }}>*</span></label>
                <input type="text" name="task" value={formData.task} onChange={handleFormChange} required placeholder="Ex: Rédiger rapport patient…" className={IC} />
              </div>

              <div>
                <label className={LC} style={LS}>Date et heure <span style={{ color: "var(--rose)" }}>*</span></label>
                <input type="datetime-local" name="time" value={formData.time} onChange={handleFormChange} required className={IC} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LC} style={LS}>Priorité</label>
                  <select name="priority" value={formData.priority} onChange={handleFormChange} className={IC}>
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </div>
                <div>
                  <label className={LC} style={LS}>Statut</label>
                  <select name="status" value={formData.status} onChange={handleFormChange} className={IC}>
                    <option value="pending">En attente</option>
                    <option value="done">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 py-3 px-4 rounded-xl" style={{ background: "#F8FAFF", border: "1.5px solid #E8EEFF" }}>
                <span className="text-xs" style={{ color: "var(--text-2)", fontWeight: 600 }}>Aperçu :</span>
                <span className={`${priorityMap[formData.priority]?.cls} px-2.5 py-0.5 rounded-lg text-xs flex items-center gap-1`} style={{ fontWeight: 600 }}>
                  {priorityMap[formData.priority]?.icon} {priorityMap[formData.priority]?.label}
                </span>
                <span className={`${statusMap[formData.status]?.cls} px-2.5 py-0.5 rounded-lg text-xs flex items-center gap-1`} style={{ fontWeight: 600 }}>
                  {statusMap[formData.status]?.icon} {statusMap[formData.status]?.label}
                </span>
              </div>

              <div>
                <label className={LC} style={LS}>Note (optionnelle)</label>
                <textarea name="note" value={formData.note} onChange={handleFormChange} rows="3" placeholder="Informations complémentaires…" className={IC} />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetForm} className="btn-ghost px-5 py-2.5 rounded-xl text-sm" style={{ fontWeight: 600 }}>
                  Annuler
                </button>
                <button type="submit" className="btn-accent px-6 py-2.5 rounded-xl text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                  {editingTask ? <><FaEdit size={12} /> Mettre à jour</> : <><FaPlus size={12} /> Créer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorTasks;