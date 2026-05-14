import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  FaHome, 
  FaUserInjured, 
  FaCalendarCheck, 
  FaFileMedical, 
  FaCog,
  FaSignOutAlt, 
  FaUserPlus, 
  FaUserClock, 
  FaWallet,
  FaCalendarAlt, 
  FaChartLine, 
  FaTasks, 
  FaStethoscope, 
  FaBars,
  FaTimes, 
  FaMoneyBillWave, 
  FaUsers, 
  FaBriefcaseMedical,
  FaSync,
  FaArrowRight, 
  FaFilePrescription, 
  FaClock, 
  FaExclamationCircle,
  FaEnvelope,
  FaGraduationCap,
  FaHeadset,
  FaPaperPlane,
  FaPaperclip,
  FaTimesCircle,
  FaSpinner,
  FaCheckCircle,
  FaBell,
} from "react-icons/fa";
import NotificationModal from "../NotificationModal";

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

const CHART_COLORS = ["#3B7EF8", "#10B981", "#F59E0B", "#F43F5E", "#8B5CF6"];

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

  .badge-scheduled { background:#FFFBEB; color:#92400E; border:1px solid #FDE68A; }
  .badge-completed  { background:#ECFDF5; color:#065F46; border:1px solid #A7F3D0; }
  .badge-cancelled  { background:#FFF1F2; color:#9F1239; border:1px solid #FECDD3; }
  .badge-waiting    { background:#EEF4FF; color:#1E40AF; border:1px solid #BFDBFE; }
  .badge-consult    { background:#EEE8FF; color:#5B21B6; border:1px solid #DDD6FE; }

  .slot-avatar { background:linear-gradient(135deg,var(--accent),#2563EB); }

  .qa-card { border:1.5px solid var(--border); border-radius:16px; background:#fff; transition:all .22s ease; cursor:pointer; }
  .qa-card:hover { border-color:rgba(59,126,248,.3); box-shadow:0 8px 24px rgba(59,126,248,.1); transform:translateY(-2px); }

  .contact-btn {
    background:#fff;
    border:1.5px solid #DDD6FE;
    transition:all .25s ease;
    box-shadow:0 0 0 0 rgba(139,92,246,0);
  }
  .contact-btn:hover {
    border-color:#8B5CF6;
    background:#F5F0FF;
    transform:translateY(-1px);
    box-shadow:0 0 12px rgba(139,92,246,0.4);
  }
  .contact-btn:active {
    transform:translateY(1px);
  }
  .contact-icon {
    animation: subtleGlow 2s infinite ease-in-out;
  }
  @keyframes subtleGlow {
    0%, 100% { filter: drop-shadow(0 0 2px rgba(139,92,246,0.3)); }
    50% { filter: drop-shadow(0 0 6px rgba(139,92,246,0.7)); }
  }

  .recharts-tooltip-wrapper { font-family:'Sora',sans-serif !important; }
  .mono { font-family:'JetBrains Mono',monospace; }
  .err-banner { background:#FFF1F2; border:1.5px solid #FECDD3; color:#9F1239; border-radius:14px; }
  .sec-divider { border:none; border-top:1.5px solid #F0EEFF; margin:0 0 16px 0; }
  .occ-bar { background:#E8EEFF; border-radius:99px; height:6px; overflow:hidden; }
  .occ-fill { background:linear-gradient(90deg,var(--accent),var(--teal)); border-radius:99px; height:6px; }

  .modal-overlay { background:rgba(6,13,31,0.65); backdrop-filter:blur(6px); }
  .modal-box { animation:modalIn 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
  @keyframes modalIn { from { opacity:0; transform: scale(0.96) translateY(8px); } to { opacity:1; transform: scale(1) translateY(0); } }

  .toast-success { background:linear-gradient(135deg,#10B981,#059669); }
  .toast-error   { background:linear-gradient(135deg,#F43F5E,#BE123C); }
  .toast-item { animation:toastIn .28s cubic-bezier(.4,0,.2,1); box-shadow:0 8px 24px rgba(6,13,31,.18); }
  @keyframes toastIn { from{opacity:0;transform:translateX(60px);}to{opacity:1;transform:translateX(0);} }

  .stagger-fade-up {
    opacity: 0;
    animation: fadeUp 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
  }
  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .stagger-delay-1 { animation-delay: 0.05s; }
  .stagger-delay-2 { animation-delay: 0.10s; }
  .stagger-delay-3 { animation-delay: 0.15s; }
  .stagger-delay-4 { animation-delay: 0.20s; }
  .stagger-delay-5 { animation-delay: 0.25s; }
  .stagger-delay-6 { animation-delay: 0.30s; }
  .stagger-delay-7 { animation-delay: 0.35s; }
  .stagger-delay-8 { animation-delay: 0.40s; }
  .stagger-delay-9 { animation-delay: 0.45s; }
  .stagger-delay-10 { animation-delay: 0.50s; }
  .stagger-delay-11 { animation-delay: 0.55s; }
  .stagger-delay-12 { animation-delay: 0.60s; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(59,126,248,.25); border-radius:99px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(59,126,248,.45); }
`;

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const clean = dateStr.toString().split("T")[0];
  const [year, month, day] = clean.split("-");
  if (!year || !month || !day) return clean;
  return `${day}/${month}/${year}`;
};

const fmt = (v) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TND" }).format(v || 0);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1.5px solid #E8EEFF", borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(6,13,31,.1)", fontFamily: "Sora,sans-serif" }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: "#0A0F1E" }}>{payload[0].name}</p>
      <p style={{ fontSize: 12, fontWeight: 600, color: payload[0].payload.fill }}>{payload[0].value}</p>
    </div>
  );
};

const Badge = ({ status, type = "appt" }) => {
  const apptMap = {
    scheduled: { label: "Planifié",cls: "badge-scheduled" },
    completed:  { label: "Terminé",cls: "badge-completed" },
    cancelled:  { label: "Annulé", cls: "badge-cancelled" },
  };
  const waitMap = {
    waiting:         { label: "En attente",cls: "badge-waiting" },
    in_consultation: { label: "En consultation",cls: "badge-consult" },
    completed:       { label: "Terminé",cls: "badge-completed" },
    cancelled:       { label: "Annulé",cls: "badge-cancelled" },
  };
  const map = type === "wait" ? waitMap : apptMap;
  const cfg = map[status] || { label: status, cls: "badge-waiting" };
  return (
    <span className={`${cfg.cls} px-2.5 py-0.5 rounded-full text-xs flex-shrink-0`} style={{ fontWeight: 600 }}>
      {cfg.label}
    </span>
  );
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

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [overview, setOverview] = useState({ totalPatients: 0, totalVisits: 0, totalAppointments: 0, totalRevenue: 0 });
  const [paymentDist, setPaymentDist] = useState([]);
  const [appointmentDist, setAppointmentDist] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [waitingRoom, setWaitingRoom] = useState([]);
  const [prescriptionTemplates, setPrescriptionTemplates] = useState([]);

  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactFiles, setContactFiles] = useState([]);
  const [sendingContact, setSendingContact] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const integrityInterval = useRef(null);

  const navItems = [
    { to: "/docdb", icon: <FaHome />, label: "Tableau de bord", active: true  },
    { to: "/patients", icon: <FaUserInjured />, label: "Patients" },
    { to: "/prescription", icon: <FaFileMedical />, label: "Ordonnance" },
    { to: "/rendezvous", icon: <FaCalendarCheck />, label: "Rendez-vous" },
    { to: "/docwaiting", icon: <FaUserClock />, label: "Salle d'attente" },
    { to: "/createsec", icon: <FaUserPlus />, label: "Secrétaire" },
    { to: "/docstats", icon: <FaChartLine />, label: "Statistiques" },
    { to: "/doctasks", icon: <FaTasks />, label: "Tâches" },
    { to: "/docmail", icon: <FaEnvelope />, label: "Communication"},
    { to: "/doctuto", icon: <FaGraduationCap />, label: "Tutoriel" },
    { to: "/docsettings", icon: <FaCog />, label: "Paramètres" },
  ];

  const addToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { navigate("/login"); return; }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "medecin") { navigate("/dashboard"); return; }
    setUser(parsedUser);

    performIntegrityCheck(navigate, setError, true)
      .then(() => {
        fetchDashboardData();
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
    setLoading(true); setError(null);
    try {
      const [
        overviewRes, paymentDistRes, appointmentDistRes,
        appointmentsRes, patientsRes, waitingRoomRes, templatesRes, pendingRequestsRes,
      ] = await Promise.all([
        api.get("/doctor/statistics/overview"),
        api.get("/doctor/statistics/payment-distribution"),
        api.get("/doctor/statistics/appointment-distribution"),
        api.get("/appointments"),
        api.get("/patients"),
        api.get("/waiting-room"),
        api.get("/prescription-templates"),
        api.get("/appointments/pending-requests").catch(() => ({ data: [] })),
      ]);

      setOverview(overviewRes.data);
      setPaymentDist(Array.isArray(paymentDistRes.data) ? paymentDistRes.data : []);
      setAppointmentDist(Array.isArray(appointmentDistRes.data) ? appointmentDistRes.data : []);

      let appointments = Array.isArray(appointmentsRes.data) ? [...appointmentsRes.data] : [];
      // Sort by most recent appointment (date descending, then time descending)
      appointments.sort((a, b) => {
        const dateTimeA = `${a.appointment_date} ${a.start_time || "00:00"}`;
        const dateTimeB = `${b.appointment_date} ${b.start_time || "00:00"}`;
        return dateTimeB.localeCompare(dateTimeA);
      });
      const patients = Array.isArray(patientsRes.data) ? patientsRes.data : [];
      setRecentAppointments(appointments.slice(0, 6));
      setRecentPatients(patients.slice(0, 5));
      setWaitingRoom(Array.isArray(waitingRoomRes.data) ? waitingRoomRes.data : []);
      setPrescriptionTemplates(Array.isArray(templatesRes.data) ? templatesRes.data : []);
      setPendingRequestsCount((Array.isArray(pendingRequestsRes.data) ? pendingRequestsRes.data : []).length);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Impossible de charger les données. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactMessage.trim()) {
      addToast("Veuillez écrire un message.", "error");
      return;
    }
    setSendingContact(true);
    const formData = new FormData();
    formData.append("recipient_email", "admin@gmail.com");
    formData.append("message", contactMessage);
    contactFiles.forEach((file) => {
      formData.append("files[]", file);
    });

    try {
      await api.post("/doctor/communications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addToast("Message envoyé à l'administrateur avec succès.", "success");
      setShowContactModal(false);
      setContactMessage("");
      setContactFiles([]);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || err.response?.data?.message || "Erreur lors de l'envoi du message.";
      addToast(msg, "error");
    } finally {
      setSendingContact(false);
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
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 db-logo-ring">
            <FaStethoscope className="text-white text-2xl" />
          </div>
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-sm" style={{ color: "#94A3B8" }}>Chargement du tableau de bord…</span>
        </div>
      </div>
    );
  }

  const kpis = [
    { cls: "kpi-blue",icon: <FaUsers size={20} style={{ color: "#1E40AF" }} />,label: "Patients",val: overview.totalPatients,  sub: "dossiers enregistrés", mono: true },
    { cls: "kpi-green",icon: <FaBriefcaseMedical size={20} style={{ color: "#059669" }} />, label: "Visites totales",val: overview.totalVisits,sub: "consultations",mono: true },
    { cls: "kpi-amber",icon: <FaCalendarCheck size={20} style={{ color: "#D97706" }} />, label: "Rendez-vous",val: overview.totalAppointments, sub: "planifiés & passés",mono: true },
    { cls: "kpi-violet",icon: <FaWallet size={20} style={{ color: "#5B21B6" }} />,label: "Chiffre d'affaires", val: fmt(overview.totalRevenue), sub: "revenus encaissés",mono: false },
  ];

  const quickActions = [
    { to: "/patients", icon: <FaUserPlus size={18} style={{ color: "#1E40AF" }} />, bg: "#EEF4FF", label: "Nouveau patient" },
    { to: "/rendezvous", icon: <FaCalendarAlt size={18} style={{ color: "#D97706" }} />, bg: "#FFFBEB", label: "Rendez-vous" },
    { to: "/prescription", icon: <FaFilePrescription size={18} style={{ color: "#059669" }} />, bg: "#ECFDF5", label: "Ordonnance" },
    { to: "/docstats", icon: <FaChartLine size={18} style={{ color: "#5B21B6" }} />, bg: "#EEE8FF", label: "Statistiques" },
  ];

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
            <button onClick={() => removeToast(t.id)} className="ml-3 hover:opacity-70"><FaTimes size={13} /></button>
          </div>
        ))}
      </div>

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
              <p className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>Espace médecin</p>
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

          <div className="stagger-fade-up stagger-delay-1 flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8">
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
                onClick={() => setShowNotificationModal(true)}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center btn-ghost transition-all hover:bg-blue-50"
                title="Notifications"
              >
                <FaBell size={13} style={{ color: "#64748B" }} />
                {pendingRequestsCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}
                  >
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowContactModal(true)}
                className="contact-btn w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                title="Contacter l'administrateur"
              >
                <FaHeadset size={16} style={{ color: "#8B5CF6" }} className="contact-icon" />
              </button>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: "#fff", border: "1.5px solid var(--border)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs db-logo-ring" style={{ fontWeight: 700 }}>{user?.name?.charAt(0) || "D"}</div>
                <span className="hidden sm:inline text-sm" style={{ fontWeight: 600, color: "var(--text-1)" }}>Dr. {user?.name || "Médecin"}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="stagger-fade-up stagger-delay-2 err-banner px-5 py-4 mb-6 flex items-center gap-3">
              <FaExclamationCircle size={16} style={{ color: "#F43F5E" }} />
              <span className="text-sm" style={{ fontWeight: 600 }}>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpis.map((k, i) => (
              <div key={i} className={`stagger-fade-up stagger-delay-${i + 3} kpi-card ${k.cls}`}>
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
              <Link key={i} to={qa.to} className={`stagger-fade-up stagger-delay-${i + 7} qa-card p-4 flex items-center gap-3 no-underline`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: qa.bg }}>
                  {qa.icon}
                </div>
                <span className="text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>{qa.label}</span>
                <FaArrowRight size={10} style={{ color: "var(--text-2)", marginLeft: "auto" }} />
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            <div className="stagger-fade-up stagger-delay-11 lg:col-span-2 sec-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#FFFBEB" }}>
                    <FaCalendarCheck size={14} style={{ color: "#D97706" }} />
                  </div>
                  <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>Rendez-vous récents</p>
                </div>
                <Link to="/rendezvous" className="text-xs flex items-center gap-1" style={{ color: "var(--accent)", fontWeight: 600 }}>
                  Voir tout <FaArrowRight size={9} />
                </Link>
              </div>
              <hr className="sec-divider" />

              {recentAppointments.length === 0 ? (
                <EmptyState icon={<FaCalendarCheck size={22} style={{ color: "#DDD6FE" }} />} label="Aucun rendez-vous récent" />
              ) : (
                <div className="space-y-2">
                  {recentAppointments.map((apt, i) => (
                    <div key={i} className="data-row px-4 py-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs flex-shrink-0 db-logo-ring" style={{ fontWeight: 700 }}>
                        {apt.patient?.nom?.charAt(0) || "P"}{apt.patient?.prenom?.charAt(0) || ""}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ fontWeight: 700, color: "var(--text-1)" }}>
                          {apt.patient ? `${apt.patient.nom} ${apt.patient.prenom}` : "—"}
                        </p>
                        <p className="mono text-xs flex items-center gap-1.5 mt-0.5" style={{ color: "var(--text-2)" }}>
                          <FaClock size={9} />
                          {formatDate(apt.appointment_date)} · {apt.start_time?.substring(0, 5)} – {apt.end_time?.substring(0, 5)}
                        </p>
                      </div>
                      <Badge status={apt.status} type="appt" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="stagger-fade-up stagger-delay-12 sec-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#EEF4FF" }}>
                    <FaUserClock size={14} style={{ color: "var(--accent)" }} />
                  </div>
                  <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>Salle d'attente</p>
                </div>
                <span className="mono text-xs px-2 py-0.5 rounded-lg" style={{ background: "#EEF4FF", color: "var(--accent)", border: "1px solid #BFDBFE", fontWeight: 700 }}>
                  {waitingRoom.length}
                </span>
              </div>
              <hr className="sec-divider" />

              <div className="mb-4">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs" style={{ color: "var(--text-2)", fontWeight: 600 }}>Occupation</span>
                  <span className="mono text-xs" style={{ color: "var(--accent)", fontWeight: 700 }}>
                    {waitingRoom.length}/20
                  </span>
                </div>
                <div className="occ-bar">
                  <div className="occ-fill" style={{ width: `${Math.min((waitingRoom.length / 20) * 100, 100)}%` }} />
                </div>
              </div>

              {waitingRoom.length === 0 ? (
                <EmptyState icon={<FaUserClock size={22} style={{ color: "#DDD6FE" }} />} label="Salle vide" />
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                  {waitingRoom.map((entry, i) => (
                    <div key={i} className="data-row px-3 py-2.5 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs flex-shrink-0 slot-avatar" style={{ fontWeight: 700 }}>
                        {entry.patient?.nom?.charAt(0) || "P"}{entry.patient?.prenom?.charAt(0) || ""}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate" style={{ fontWeight: 700, color: "var(--text-1)" }}>
                          {entry.patient ? `${entry.patient.nom} ${entry.patient.prenom}` : "—"}
                        </p>
                        <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--text-2)" }}>
                          <span className="mono">#{entry.slot}</span>
                          {entry.arrived_at && (
                            <span>· {new Date(entry.arrived_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                          )}
                        </p>
                      </div>
                      <Badge status={entry.status || "waiting"} type="wait" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            <div className="stagger-fade-up stagger-delay-13 sec-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#ECFDF5" }}>
                    <FaUserInjured size={14} style={{ color: "#059669" }} />
                  </div>
                  <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>Patients récents</p>
                </div>
                <Link to="/patients" className="text-xs flex items-center gap-1" style={{ color: "var(--accent)", fontWeight: 600 }}>
                  Voir tout <FaArrowRight size={9} />
                </Link>
              </div>
              <hr className="sec-divider" />

              {recentPatients.length === 0 ? (
                <EmptyState icon={<FaUserInjured size={22} style={{ color: "#DDD6FE" }} />} label="Aucun patient" />
              ) : (
                <div className="space-y-2">
                  {recentPatients.map((p, i) => (
                    <div key={i} className="data-row px-3 py-2.5 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs flex-shrink-0" style={{ background: "linear-gradient(135deg,#10B981,#059669)", fontWeight: 700 }}>
                        {p.nom?.charAt(0)}{p.prenom?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate" style={{ fontWeight: 700, color: "var(--text-1)" }}>{p.nom} {p.prenom}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>
                          {p.age ? `${p.age} ans` : "—"}{p.telephone ? ` · ${p.telephone}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="stagger-fade-up stagger-delay-14 sec-card p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#FFFBEB" }}>
                    <FaMoneyBillWave size={14} style={{ color: "#D97706" }} />
                  </div>
                  <p className="text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>Paiements</p>
                </div>
                <hr className="sec-divider" />
                {paymentDist.length === 0 ? (
                  <EmptyState icon={<FaWallet size={20} style={{ color: "#DDD6FE" }} />} label="Aucune donnée" small />
                ) : (
                  <ResponsiveContainer width="100%" height={190}>
                    <PieChart>
                      <Pie data={paymentDist} cx="50%" cy="50%" outerRadius={65} innerRadius={32} dataKey="value" paddingAngle={3}>
                        {paymentDist.map((_, idx) => (
                          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={7} formatter={(v) => <span style={{ fontSize: 10, color: "var(--text-2)", fontWeight: 600 }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="stagger-fade-up stagger-delay-15 sec-card p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#EEE8FF" }}>
                    <FaCalendarCheck size={14} style={{ color: "#5B21B6" }} />
                  </div>
                  <p className="text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>Rendez-vous</p>
                </div>
                <hr className="sec-divider" />
                {appointmentDist.length === 0 ? (
                  <EmptyState icon={<FaCalendarCheck size={20} style={{ color: "#DDD6FE" }} />} label="Aucune donnée" small />
                ) : (
                  <ResponsiveContainer width="100%" height={190}>
                    <PieChart>
                      <Pie data={appointmentDist} cx="50%" cy="50%" outerRadius={65} innerRadius={32} dataKey="value" paddingAngle={3}>
                        {appointmentDist.map((_, idx) => (
                          <Cell key={idx} fill={["#8B5CF6", "#10B981", "#F43F5E"][idx % 3]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={7} formatter={(v) => <span style={{ fontSize: 10, color: "var(--text-2)", fontWeight: 600 }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="stagger-fade-up stagger-delay-16 sec-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#ECFDF5" }}>
                  <FaFilePrescription size={14} style={{ color: "#059669" }} />
                </div>
                <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>Modèles d'ordonnances</p>
              </div>
              <Link to="/prescription" className="text-xs flex items-center gap-1" style={{ color: "var(--accent)", fontWeight: 600 }}>
                Gérer <FaArrowRight size={9} />
              </Link>
            </div>
            <hr className="sec-divider" />

            {prescriptionTemplates.length === 0 ? (
              <EmptyState icon={<FaFileMedical size={22} style={{ color: "#DDD6FE" }} />} label="Aucun modèle enregistré" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {prescriptionTemplates.map((t, i) => (
                  <div key={i} className="data-row px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#ECFDF5" }}>
                      <FaFilePrescription size={14} style={{ color: "#059669" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-700 truncate" style={{ fontWeight: 700, color: "var(--text-1)" }}>{t.name}</p>
                      <p className="mono text-xs mt-0.5" style={{ color: "var(--text-2)" }}>{formatDate(t.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {showContactModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-8 py-6" style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FaHeadset className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="text-white text-lg" style={{ fontWeight: 800 }}>Contacter l'administrateur</h3>
                    <p className="text-white/70 text-xs">Signaler un bug ou un problème technique</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-all"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="px-8 py-6 space-y-5">
              <div>
                <label className="block text-xs font-600 mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-2)", fontWeight: 600, letterSpacing: "0.07em" }}>
                  Message *
                </label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  rows="5"
                  className="w-full p-3 rounded-xl text-sm st-input resize-none"
                  placeholder="Décrivez votre problème en détail..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-600 mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-2)", fontWeight: 600, letterSpacing: "0.07em" }}>
                  Pièces jointes (PDF uniquement)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={(e) => setContactFiles(Array.from(e.target.files))}
                    className="hidden"
                    id="contact-files"
                  />
                  <label
                    htmlFor="contact-files"
                    className="flex items-center justify-center gap-2 w-full p-3 rounded-xl text-sm st-input cursor-pointer hover:border-purple-300 transition-all"
                  >
                    <FaPaperclip size={14} />
                    {contactFiles.length > 0
                      ? `${contactFiles.length} fichier(s) sélectionné(s)`
                      : "Ajouter des fichiers (PDF, max 10 Mo par fichier)"}
                  </label>
                </div>
                {contactFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {contactFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-lg">
                        <span className="truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setContactFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTimesCircle size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-600 border border-gray-300 hover:bg-gray-50 transition-all"
                  style={{ color: "#64748B", fontWeight: 600 }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={sendingContact}
                  className="flex-1 btn-accent py-3 rounded-xl text-sm font-600 flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ fontWeight: 600 }}
                >
                  {sendingContact ? <FaSpinner className="animate-spin" size={14} /> : <FaPaperPlane size={14} />}
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onActionComplete={() => {
          fetchDashboardData();
        }}
      />
    </div>
  );
};

export default DoctorDashboard;