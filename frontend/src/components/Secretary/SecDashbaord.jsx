import { useEffect, useState, useMemo, useRef } from "react";
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
  FaClipboardList,
  FaClock,
  FaPhone,
  FaUserPlus,
  FaEnvelope,
  FaExclamationCircle,
  FaBars,
  FaTimes,
  FaSearch,
  FaBriefcaseMedical,
  FaUserClock,
  FaArrowRight,
  FaSync,
  FaStethoscope,
  FaMoneyBillWave,
} from "react-icons/fa";
import NotificationModal from "../NotificationModal";

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

  .wr-sidebar { background: linear-gradient(180deg,var(--navy) 0%,var(--navy-mid) 60%,var(--navy-light) 100%); }
  .wr-logo-ring { background: linear-gradient(135deg,var(--violet),#6D28D9); }
  .wr-nav-link { transition:all .2s ease; border-left:3px solid transparent; color:rgba(255,255,255,.48); font-size:14px; }
  .wr-nav-link:hover { background:rgba(139,92,246,.14); border-left-color:var(--violet); color:#fff; }
  .wr-nav-link.active { background:rgba(139,92,246,.22); border-left-color:var(--violet); color:#fff; }
  .wr-toggle { background:linear-gradient(135deg,var(--violet),#6D28D9); box-shadow:0 4px 14px rgba(139,92,246,.4); }

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
  .badge-high       { background:#FFF1F2; color:#9F1239; border:1px solid #FECDD3; }
  .badge-medium     { background:#FFFBEB; color:#92400E; border:1px solid #FDE68A; }
  .badge-low        { background:#ECFDF5; color:#065F46; border:1px solid #A7F3D0; }

  .qa-card { border:1.5px solid var(--border); border-radius:16px; background:#fff; transition:all .22s ease; cursor:pointer; }
  .qa-card:hover { border-color:rgba(59,126,248,.3); box-shadow:0 8px 24px rgba(59,126,248,.1); transform:translateY(-2px); }

  .mono { font-family:'JetBrains Mono',monospace; }

  .err-banner { background:#FFF1F2; border:1.5px solid #FECDD3; color:#9F1239; border-radius:14px; }

  .sec-divider { border:none; border-top:1.5px solid #F0EEFF; margin:0 0 16px 0; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(139,92,246,.25); border-radius:99px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(139,92,246,.45); }
`;

const toYMD = (dateInput) => {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
};

const formatDate = (dateString, timeString) => {
  if (!dateString) return "";
  let dateObj;
  if (timeString) {
    dateObj = new Date(`${dateString}T${timeString}`);
  } else {
    dateObj = new Date(dateString);
  }
  return dateObj.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StatusBadge = ({ status }) => {
  const statusMap = {
    scheduled: { label: "Confirmé", cls: "badge-scheduled" },
    completed: { label: "Terminé", cls: "badge-completed" },
    cancelled: { label: "Annulé", cls: "badge-cancelled" },
  };
  const cfg = statusMap[status] || { label: status, cls: "badge-waiting" };
  return (
    <span className={`${cfg.cls} px-2.5 py-0.5 rounded-full text-xs flex-shrink-0`} style={{ fontWeight: 600 }}>
      {cfg.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const priorityMap = {
    high: { label: "Haute", cls: "badge-high" },
    medium: { label: "Moyenne", cls: "badge-medium" },
    low: { label: "Basse", cls: "badge-low" },
  };
  const cfg = priorityMap[priority] || { label: priority, cls: "badge-medium" };
  return (
    <span className={`${cfg.cls} px-2.5 py-0.5 rounded-full text-xs flex-shrink-0`} style={{ fontWeight: 600 }}>
      {cfg.label}
    </span>
  );
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

function SecDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const integrityInterval = useRef(null);

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(toYMD(new Date()));
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [messageNotifications, setMessageNotifications] = useState([]);

  const getToken = () => localStorage.getItem("token");
  const getStoredUser = () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  };

  const handleApiError = async (response) => {
    if (response.status === 401) {
      clearAndRedirect(navigate);
      return true;
    }
    return false;
  };

  const fetchAppointments = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (await handleApiError(response)) return;
      if (!response.ok) throw new Error("Failed to fetch appointments");
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      throw err;
    }
  };

  const fetchPatients = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (await handleApiError(response)) return;
      if (!response.ok) throw new Error("Failed to fetch patients");
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      console.error("Error fetching patients:", err);
      throw err;
    }
  };

  const fetchTasks = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/doctor/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (await handleApiError(response)) return;
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      throw err;
    }
  };

  const fetchCurrentUser = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (await handleApiError(response)) return;
      if (!response.ok) throw new Error("Failed to fetch user");
      const userData = await response.json();
      setDoctorInfo(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchPendingRequests = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (await handleApiError(response)) return;
      if (!response.ok) return;
      const data = await response.json();
      setPendingRequestsCount((Array.isArray(data) ? data : []).filter((item) => item.request_status === "pending").length);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const fetchMessageNotifications = async () => {
    try {
      const [countRes, notifRes] = await Promise.all([
        api.get("/communications/unread-count"),
        api.get("/communications/notifications"),
      ]);

      setUnreadMessageCount(countRes.data?.count || 0);
      setMessageNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
    } catch (error) {
      console.error("Error fetching communication notifications:", error);
    }
  };

  const fetchDashboardData = async () => {
    const token = getToken();
    if (!token) {
      clearAndRedirect(navigate);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchAppointments(token),
        fetchPatients(token),
        fetchTasks(token),
        fetchCurrentUser(token),
        fetchPendingRequests(token),
        fetchMessageNotifications(),
      ]);
    } catch (err) {
      setError("Impossible de charger les données. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const refreshNotifications = () => {
      const token = getToken();
      if (!token) return;
      fetchPendingRequests(token);
      fetchMessageNotifications();
    };

    refreshNotifications();
    const interval = setInterval(refreshNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    const storedUser = getStoredUser();
    if (!storedUser || !getToken()) {
      clearAndRedirect(navigate);
      return;
    }
    setUser(storedUser);

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

  const todayStr = toYMD(new Date());

  const startOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return toYMD(new Date(d.setDate(diff)));
  };

  const endOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() + (day === 0 ? 0 : 7 - day);
    return toYMD(new Date(d.setDate(diff)));
  };

  const todayAppointmentsList = useMemo(() => {
    return appointments
      .filter(apt => {
        const aptDate = toYMD(apt.appointment_date);
        return aptDate === selectedDate && apt.status !== 'cancelled';
      })
      .map(apt => ({
        id: apt.id,
        patient: apt.patient ? `${apt.patient.prenom} ${apt.patient.nom}` : "Patient inconnu",
        heure: apt.start_time,
        statut: apt.status,
        motif: apt.notes || "Consultation",
      }));
  }, [appointments, selectedDate]);

  const pendingTasksList = useMemo(() => {
    return tasks
      .filter(task => task.status === 'pending')
      .map(task => ({
        id: task.id,
        task: task.task,
        priorite: task.priority,
        echeance: new Date(task.time).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
  }, [tasks]);

  const recentPatientsList = useMemo(() => {
    return patients
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 4)
      .map(p => ({
        id: p.id,
        nom: `${p.prenom} ${p.nom}`,
        email: p.email,
        telephone: p.telephone,
        date: p.created_at,
      }));
  }, [patients]);

  const stats = useMemo(() => {
    const weekStart = startOfWeek(todayStr);
    const weekEnd = endOfWeek(todayStr);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const todayAppointmentsCount = appointments.filter(apt => {
      const aptDate = toYMD(apt.appointment_date);
      return aptDate === todayStr && apt.status !== 'cancelled';
    }).length;

    const pendingToday = appointments.filter(apt => {
      const aptDate = toYMD(apt.appointment_date);
      return aptDate === todayStr && apt.status === 'scheduled';
    }).length;

    const weekAppointments = appointments.filter(apt => {
      const aptDate = toYMD(apt.appointment_date);
      return aptDate >= weekStart && aptDate <= weekEnd;
    }).length;

    const pendingTasksCount = tasks.filter(task => task.status === 'pending').length;

    const newPatientsCount = patients.filter(p => {
      const d = new Date(p.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    return {
      todayAppointments: todayAppointmentsCount,
      pendingAppointments: pendingToday,
      totalAppointmentsWeek: weekAppointments,
      pendingTasks: pendingTasksCount,
      newPatients: newPatientsCount,
    };
  }, [appointments, tasks, patients, todayStr]);

  const filteredPatients = useMemo(() => {
    return recentPatientsList.filter(p =>
      p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.telephone.includes(searchTerm)
    );
  }, [recentPatientsList, searchTerm]);

  const handleLogout = () => {
    if (integrityInterval.current) clearInterval(integrityInterval.current);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userIntegrityHash");
    navigate("/login");
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const kpis = [
    {
      cls: "kpi-blue",
      icon: <FaCalendarCheck size={20} style={{ color: "#1E40AF" }} />,
      label: "RDV aujourd'hui",
      value: stats.todayAppointments,
      sub: `${stats.pendingAppointments} en attente`,
      mono: true,
    },
    {
      cls: "kpi-green",
      icon: <FaBriefcaseMedical size={20} style={{ color: "#059669" }} />,
      label: "Cette semaine",
      value: stats.totalAppointmentsWeek,
      sub: "rendez-vous",
      mono: true,
    },
    {
      cls: "kpi-amber",
      icon: <FaClipboardList size={20} style={{ color: "#D97706" }} />,
      label: "Tâches en attente",
      value: stats.pendingTasks,
      sub: "à traiter",
      mono: true,
    },
    {
      cls: "kpi-violet",
      icon: <FaUserInjured size={20} style={{ color: "#5B21B6" }} />,
      label: "Nouveaux patients",
      value: stats.newPatients,
      sub: "ce mois",
      mono: true,
    },
  ];

  const quickActions = [
    { to: "/secretaryRendezvous", icon: <FaCalendarCheck size={18} style={{ color: "#1E40AF" }} />, bg: "#EEF4FF", label: "Nouveau RDV" },
    { to: "/seccreatepatient", icon: <FaUserPlus size={18} style={{ color: "#059669" }} />, bg: "#ECFDF5", label: "Comptes patients" },
    { to: "/sectasks", icon: <FaClipboardList size={18} style={{ color: "#059669" }} />, bg: "#ECFDF5", label: "Taches" },
    { to: "/secwaiting", icon: <FaUserClock  size={18} style={{ color: "#D97706" }} />, bg: "#FFFBEB", label: "Salle d'attente" },
    { to: "/secpay", icon: <FaMoneyBillWave size={18} style={{ color: "#5B21B6" }} />, bg: "#EEE8FF", label: "Paiements" },
    { to: "/secmail", icon: <FaEnvelope size={18} style={{ color: "#5B21B6" }} />, bg: "#EEE8FF", label: "Messagerie" },
  ];

  const navItems = [
    { to: "/secretariatdb", icon: <FaHome />, label: "Tableau de bord", active: true },
    { to: "/secpatients", icon: <FaUserInjured />, label: "Patients" },
    { to: "/seccreatepatient", icon: <FaUserPlus />, label: "Comptes patients" },
    { to: "/secretaryRendezvous", icon: <FaCalendarCheck />, label: "Rendez-vous" },
    { to: "/sectasks", icon: <FaClipboardList />, label: "Tâches" },
    { to: "/secwaiting", icon: <FaUserClock />, label: "Salle d'attente" },
    { to: "/secpay", icon: <FaMoneyBillWave />, label: "Paiements" },
    { to: "/secmail", icon: <FaEnvelope />, label: "Messagerie" },
    { to: "/secsettings", icon: <FaCog />, label: "Paramètres" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "linear-gradient(135deg,#060D1F,#0C1A3A)" }}>
        <style>{G}</style><FontInjector />
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 wr-logo-ring">
            <FaStethoscope className="text-white text-2xl" />
          </div>
          <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-sm" style={{ color: "#94A3B8" }}>Chargement du tableau de bord…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface)" }}>
      <style>{G}</style><FontInjector />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center text-white rounded-r-xl wr-toggle"
      >
        {sidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 transition-transform duration-300 z-40 w-64 flex flex-col wr-sidebar`}
      >
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center wr-logo-ring flex-shrink-0">
              <FaStethoscope className="text-white text-base" />
            </div>
            <div>
              <h1 className="text-white text-lg" style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                Cabi Doc
              </h1>
              <p className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>
                Espace secrétariat
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`wr-nav-link flex items-center gap-3 px-4 py-3 rounded-xl ${
                item.active ? "active" : ""
              }`}
              style={{ fontWeight: item.active ? 600 : 500 }}
            >
              <span style={{ opacity: item.active ? 1 : 0.65 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 m-3 rounded-2xl" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0 wr-logo-ring"
              style={{ fontWeight: 700 }}
            >
              {user?.name?.charAt(0) || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate" style={{ fontWeight: 600 }}>
                {user?.name || "Secrétaire"}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>
                Secrétaire
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all hover:bg-red-500/20"
            style={{ color: "rgba(255,255,255,.5)", fontWeight: 500 }}
          >
            <FaSignOutAlt size={12} /> Déconnexion
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: "rgba(6,13,31,.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 pt-14 lg:pt-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                  style={{
                    background: "linear-gradient(135deg,var(--violet),#6D28D9)",
                    boxShadow: "0 4px 14px rgba(139,92,246,.35)",
                  }}
                >
                  <FaHome size={14} />
                </div>
                <h2 className="text-2xl" style={{ fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.03em" }}>
                  Tableau de bord
                </h2>
              </div>
              <p className="text-sm ml-11 capitalize" style={{ color: "var(--text-2)" }}>
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="mt-4 sm:mt-0 flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="w-10 h-10 rounded-xl flex items-center justify-center btn-ghost"
                title="Actualiser"
              >
                <FaSync size={13} style={{ color: "#64748B" }} />
              </button>
              <button
                onClick={() => setShowNotificationModal(true)}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center btn-ghost transition-all hover:bg-blue-50"
                title="Notifications"
              >
                <FaBell size={13} style={{ color: "#64748B" }} />
                {pendingRequestsCount + unreadMessageCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}
                  >
                    {pendingRequestsCount + unreadMessageCount}
                  </span>
                )}
              </button>
              <div
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                style={{ background: "#fff", border: "1.5px solid var(--border)" }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs wr-logo-ring"
                  style={{ fontWeight: 700 }}
                >
                  {user?.name?.charAt(0) || "S"}
                </div>
                <span className="hidden sm:inline text-sm" style={{ fontWeight: 600, color: "var(--text-1)" }}>
                  {user?.name || "Secrétaire"}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="err-banner px-5 py-4 mb-6 flex items-center gap-3">
              <FaExclamationCircle size={16} style={{ color: "#F43F5E" }} />
              <span className="text-sm" style={{ fontWeight: 600 }}>
                {error}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpis.map((k, i) => (
              <div key={i} className={`kpi-card ${k.cls}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.7)" }}>
                    {k.icon}
                  </div>
                </div>
                <p className="text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text-2)", fontWeight: 600, letterSpacing: "0.08em" }}>
                  {k.label}
                </p>
                <p
                  className={`${k.mono ? "mono" : ""} mb-1`}
                  style={{ fontSize: k.mono ? 26 : 18, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em" }}
                >
                  {k.value}
                </p>
                <p className="text-xs" style={{ color: "var(--text-2)", fontWeight: 500 }}>
                  {k.sub}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {quickActions.map((qa, i) => (
              <Link key={i} to={qa.to} className="qa-card p-4 flex items-center gap-3 no-underline">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: qa.bg }}>
                  {qa.icon}
                </div>
                <span className="text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>
                  {qa.label}
                </span>
                <FaArrowRight size={10} style={{ color: "var(--text-2)", marginLeft: "auto" }} />
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 sec-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#FFFBEB" }}>
                    <FaCalendarCheck size={14} style={{ color: "#D97706" }} />
                  </div>
                  <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>
                    Rendez-vous aujourd'hui
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1 text-xs border rounded-lg focus:outline-none"
                    style={{ borderColor: "var(--border)", fontFamily: "mono" }}
                  />
                  <Link to="/secretaryRendezvous" className="text-xs flex items-center gap-1" style={{ color: "var(--accent)", fontWeight: 600 }}>
                    Voir tout <FaArrowRight size={9} />
                  </Link>
                </div>
              </div>
              <hr className="sec-divider" />

              {todayAppointmentsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <FaCalendarCheck size={22} style={{ color: "#DDD6FE" }} />
                  <p className="text-xs mt-2" style={{ color: "var(--text-2)" }}>
                    Aucun rendez-vous aujourd'hui
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayAppointmentsList.map((apt) => (
                    <div key={apt.id} className="data-row px-4 py-3 flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs flex-shrink-0 wr-logo-ring"
                        style={{ fontWeight: 700 }}
                      >
                        {apt.patient?.charAt(0) || "P"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ fontWeight: 700, color: "var(--text-1)" }}>
                          {apt.patient}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="mono text-xs flex items-center gap-1" style={{ color: "var(--text-2)" }}>
                            <FaClock size={9} /> {apt.heure}
                          </span>
                          <span className="text-xs" style={{ color: "var(--text-2)" }}>
                            {apt.motif}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={apt.statut} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sec-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#FFF1F2" }}>
                    <FaClipboardList size={14} style={{ color: "#F43F5E" }} />
                  </div>
                  <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>
                    Tâches prioritaires
                  </p>
                </div>
                <span className="mono text-xs px-2 py-0.5 rounded-lg" style={{ background: "#FFF1F2", color: "#F43F5E", border: "1px solid #FECDD3", fontWeight: 700 }}>
                  {pendingTasksList.length}
                </span>
              </div>
              <hr className="sec-divider" />

              {pendingTasksList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <FaClipboardList size={22} style={{ color: "#DDD6FE" }} />
                  <p className="text-xs mt-2" style={{ color: "var(--text-2)" }}>
                    Aucune tâche en attente
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingTasksList.map((task) => (
                    <div key={task.id} className="data-row px-4 py-3">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm" style={{ fontWeight: 600, color: "var(--text-1)" }}>
                          {task.task}
                        </p>
                        <PriorityBadge priority={task.priorite} />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="mono text-xs flex items-center gap-1" style={{ color: "var(--text-2)" }}>
                          <FaClock size={9} /> {task.echeance}
                        </span>
                        <button
                          className="text-xs px-3 py-1 rounded-full transition"
                          style={{ background: "#F43F5E", color: "#fff", fontWeight: 600 }}
                        >
                          Traiter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="sec-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#ECFDF5" }}>
                  <FaUserInjured size={14} style={{ color: "#059669" }} />
                </div>
                <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>
                  Derniers patients
                </p>
              </div>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs border rounded-lg focus:outline-none"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
            </div>
            <hr className="sec-divider" />

            {filteredPatients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <FaUserInjured size={22} style={{ color: "#DDD6FE" }} />
                <p className="text-xs mt-2" style={{ color: "var(--text-2)" }}>
                  Aucun patient trouvé
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPatients.map((patient) => (
                  <div key={patient.id} className="data-row px-4 py-3 flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#10B981,#059669)", fontWeight: 700 }}
                    >
                      {patient.nom?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ fontWeight: 700, color: "var(--text-1)" }}>
                        {patient.nom}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs" style={{ color: "var(--text-2)" }}>
                        <span className="flex items-center gap-1">
                          <FaEnvelope size={9} /> {patient.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaPhone size={9} /> {patient.telephone}
                        </span>
                      </div>
                    </div>
                    <span className="mono text-xs" style={{ color: "var(--text-2)" }}>
                      {new Date(patient.date).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-right">
            </div>
          </div>
        </div>

        <NotificationModal
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          onActionComplete={() => {
            fetchPendingRequests(getToken());
            fetchAppointments(getToken());
            fetchMessageNotifications();
          }}
          messageNotifications={messageNotifications}
          unreadMessageCount={unreadMessageCount}
          onOpenMessages={() => navigate("/secmail")}
        />
      </main>
    </div>
  );
}

export default SecDashboard;