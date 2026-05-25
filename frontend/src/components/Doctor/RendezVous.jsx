import { useEffect, useState, useRef, useCallback } from "react";
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
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaUser,
  FaStethoscope,
  FaNotesMedical,
  FaCalendarAlt,
  FaSearch,
  FaChevronCircleDown,
  FaPhone,
  FaExclamationTriangle,
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
  FaUserClock,
  FaFileMedical,
  FaUserPlus,
  FaPlus,
  FaSync,
  FaExclamationCircle,
  FaChartLine,
  FaTasks,
  FaEnvelope,
  FaGraduationCap,
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

  .sec-card { background:#fff; border-radius:20px; border:1.5px solid var(--border); transition:all .2s ease; }
  .sec-card:hover { border-color:rgba(59,126,248,.22); box-shadow:0 8px 28px rgba(59,126,248,.07); }

  .day-col { background:#fff; border-radius:20px; border:1.5px solid var(--border); transition: all 0.22s ease; }
  .day-col:hover { border-color: rgba(139,92,246,0.2); }
  .day-col-today { border-color: var(--violet) !important; box-shadow: 0 0 0 3px rgba(139,92,246,0.22); }

  .appt-card { border-left: 3px solid var(--violet); border-radius: 12px; background: #F8F5FF; transition: all 0.2s ease; cursor: pointer; }
  .appt-card:hover { background: #F0EAFF; box-shadow: 0 4px 14px rgba(139,92,246,0.12); transform: translateY(-1px); }
  .appt-card-done { border-left-color: #10B981; background: #F0FFF8; }
  .appt-card-done:hover { background: #E6FFF5; }
  .appt-card-cancelled { border-left-color: #F43F5E; background: #FFF5F7; }
  .appt-card-cancelled:hover { background: #FFE8EE; }

  .badge-done      { background:#ECFDF5; color:#065F46; border:1px solid #A7F3D0; }
  .badge-cancelled { background:#FFF1F2; color:#9F1239; border:1px solid #FECDD3; }
  .badge-planned   { background:#EEF4FF; color:#1E40AF; border:1px solid #BFDBFE; }

  .view-bar { background: #E8EEFF; border-radius: 12px; padding: 4px; }
  .view-btn-active { background:#fff; color: var(--text-1); box-shadow: 0 2px 10px rgba(6,13,31,0.08); font-weight:700; }
  .view-btn-idle { color: var(--text-2); font-weight:500; }

  .chip-violet { background:#EEE8FF; border:1px solid #DDD6FE; color:#5B21B6; }
  .chip-green  { background:#ECFDF5; border:1px solid #A7F3D0; color:#065F46; }
  .chip-amber  { background:#FFFBEB; border:1px solid #FDE68A; color:#92400E; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(59,126,248,.25); border-radius:99px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(59,126,248,.45); }
`;

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const extractDate = (s) => (s ? s.split("T")[0] : "");

const getWeekDates = (date) => {
  const cur = new Date(date);
  const day = cur.getDay();
  const mon = new Date(cur);
  mon.setDate(cur.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
};

const getMonthDates = (date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const startDay = firstDay.getDay();
  const calendarStart = new Date(firstDay);
  calendarStart.setDate(firstDay.getDate() - (startDay === 0 ? 6 : startDay - 1));

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(calendarStart);
    d.setDate(calendarStart.getDate() + i);
    return d;
  });
};

const isToday = (date) => {
  const t = new Date();
  return (
    date.getFullYear() === t.getFullYear() &&
    date.getMonth() === t.getMonth() &&
    date.getDate() === t.getDate()
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

function RendezVous() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [formData, setFormData] = useState({ patient_id: "", appointment_date: "", start_time: "", end_time: "", notes: "", status: "scheduled" });
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [existingPatientWarning, setExistingPatientWarning] = useState(null);
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});
  const [itemsPerPage] = useState(5);
  const [error, setError] = useState(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const integrityInterval = useRef(null);

  const getToken = useCallback(() => localStorage.getItem("token"), []);

  const isAuthenticated = useCallback(() => {
    const token = getToken();
    const userData = localStorage.getItem("user");
    return token && userData;
  }, [getToken]);

  const navItems = [
    { to: "/docdb", icon: <FaHome />, label: "Tableau de bord" },
    { to: "/patients", icon: <FaUserInjured />, label: "Patients" },
    { to: "/prescription", icon: <FaFileMedical />, label: "Ordonnance" },
    { to: "/rendezvous", icon: <FaCalendarCheck />, label: "Rendez-vous", active: true  },
    { to: "/docwaiting", icon: <FaUserClock />, label: "Salle d'attente" },
    { to: "/createsec", icon: <FaUserPlus />, label: "Secrétaire" },
    { to: "/docstats", icon: <FaChartLine />, label: "Statistiques" },
    { to: "/doctasks", icon: <FaTasks />, label: "Tâches" },
    { to: "/docmail", icon: <FaEnvelope />, label: "Communication"},
    { to: "/doctuto", icon: <FaGraduationCap />, label: "Tutoriel" },
    { to: "/docsettings", icon: <FaCog />, label: "Paramètres" },
  ];

  const fetchPendingRequests = useCallback(async () => {
    try {
      const response = await api.get("/appointments");
      setPendingRequestsCount((Array.isArray(response.data) ? response.data : []).filter((item) => item.request_status === "pending").length);
    } catch (err) {
      console.error("Failed to fetch pending requests:", err);
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!response.ok) {
        if (response.status === 401) {
          clearAndRedirect(navigate);
          return;
        }
        throw new Error("Auth failed");
      }
      const userData = await response.json();
      setDoctorInfo(userData);
    } catch (error) {
      console.error("Auth error:", error);
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      setDoctorInfo(localUser);
    } finally {
      setLoading(false);
    }
  }, [navigate, getToken]);

  const fetchPatients = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/patients`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
      if (res.ok) {
        const json = await res.json();
        setPatients(json);
      } else if (res.status === 401) {
        clearAndRedirect(navigate);
      }
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    }
  }, [navigate, getToken]);

  const fetchAppointments = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setError(null);
    try {
      let startDate, endDate;
      if (viewMode === "day") {
        startDate = endDate = formatDate(selectedDate);
      } else {
        const weekDates = getWeekDates(selectedDate);
        startDate = formatDate(weekDates[0]);
        endDate = formatDate(weekDates[5]);
      }
      const response = await fetch(
        `${API_BASE_URL}/appointments?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const processed = data.map((appt) => ({
          ...appt,
          clean_date: extractDate(appt.appointment_date),
          patient: appt.patient || { nom: "", prenom: "" },
        }));
        setAppointments(processed);
      } else if (response.status === 401) {
        clearAndRedirect(navigate);
      } else {
        const err = await response.json();
        setError(err.error || "Erreur lors du chargement");
      }
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      setError("Erreur de connexion au serveur");
    } finally {
      await fetchPendingRequests();
    }
  }, [navigate, selectedDate, viewMode, getToken, fetchPendingRequests]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    const userData = localStorage.getItem("user");
    setUser(JSON.parse(userData));

    performIntegrityCheck(navigate, setError, true)
      .then(() => {
        fetchCurrentUser();
        fetchPatients();
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
  }, [navigate, fetchCurrentUser, fetchPatients, isAuthenticated]);

  useEffect(() => {
    if (doctorInfo) {
      fetchAppointments();
    }
  }, [doctorInfo, fetchAppointments]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 15000);
    return () => clearInterval(interval);
  }, [fetchPendingRequests, getToken]);

  const getStatusBadge = (status) => {
    if (status === "completed")
      return (
        <span className="badge-done px-2.5 py-0.5 rounded-full text-xs" style={{ fontWeight: 600 }}>
          Terminé
        </span>
      );
    if (status === "cancelled")
      return (
        <span className="badge-cancelled px-2.5 py-0.5 rounded-full text-xs" style={{ fontWeight: 600 }}>
          Annulé
        </span>
      );
    return (
      <span className="badge-planned px-2.5 py-0.5 rounded-full text-xs" style={{ fontWeight: 600 }}>
        Planifié
      </span>
    );
  };

  const apptCardClass = (status) => {
    if (status === "completed") return "appt-card appt-card-done";
    if (status === "cancelled") return "appt-card appt-card-cancelled";
    return "appt-card";
  };

  const toggleDayExpanded = (dateStr) => {
    setExpandedDays((prev) => ({ ...prev, [dateStr]: !prev[dateStr] }));
  };

  const getPaginatedAppointments = (apptMap, dateStr) => {
    if (!apptMap[dateStr]) return [];
    if (expandedDays[dateStr]) return apptMap[dateStr];
    return apptMap[dateStr].slice(0, itemsPerPage);
  };

  const hasMoreAppointments = (apptMap, dateStr) => {
    return apptMap[dateStr] && apptMap[dateStr].length > itemsPerPage;
  };

  const changeDate = (dir) => {
    const d = new Date(selectedDate);
    if (viewMode === "day") d.setDate(d.getDate() + dir);
    else if (viewMode === "month") d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir * 7);
    setSelectedDate(d);
    setExpandedDays({});
  };

  const goToToday = () => {
    setSelectedDate(new Date());
    setExpandedDays({});
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setExpandedDays({});
  };

  const openDetailsModal = (appt) => {
    setCurrentAppointment(appt);
    setShowDetailsModal(true);
  };

  const handleLogout = () => {
    if (integrityInterval.current) clearInterval(integrityInterval.current);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userIntegrityHash");
    navigate("/login");
  };

  const addToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const checkExistingPatient = (name) => {
    if (!name?.trim()) return null;
    const q = name.toLowerCase().trim();
    return patients.find(
      (p) =>
        `${p.nom} ${p.prenom}`.toLowerCase().includes(q) ||
        p.nom?.toLowerCase().includes(q) ||
        p.prenom?.toLowerCase().includes(q)
    );
  };

  const filteredPatients = patients.filter((p) => {
    const q = patientSearchTerm.toLowerCase();
    return (p.nom?.toLowerCase() || "").includes(q) || (p.prenom?.toLowerCase() || "").includes(q) || (p.telephone?.toLowerCase() || "").includes(q);
  });

  const handleSelectPatient = (p) => {
    setFormData({ ...formData, patient_id: p.id });
    setSelectedPatientName(`${p.nom} ${p.prenom}`);
    setPatientDropdownOpen(false);
    setPatientSearchTerm("");
  };

  const resetForm = () => {
    setFormData({ patient_id: "", appointment_date: "", start_time: "", end_time: "", notes: "", status: "scheduled" });
    setSelectedPatientName("");
  };
  const resetQuickAdd = () => {
    setShowQuickAdd(false); setNewPatientName(""); setNewPatientPhone(""); setExistingPatientWarning(null); setPatientSearchTerm("");
  };

  const handleQuickAddAndAppointment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (existingPatientWarning) { addToast("Ce patient existe déjà. Veuillez utiliser la sélection.", "error"); setIsSubmitting(false); return; }
      const token = getToken();
      const pRes = await fetch(`${API_BASE_URL}/patients`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ nom: newPatientName.split(" ")[0] || newPatientName, prenom: newPatientName.split(" ").slice(1).join(" ") || "", telephone: newPatientPhone || "" }) });
      if (!pRes.ok) throw new Error("Failed to create patient");
      const newPat = await pRes.json();
      const apptRes = await fetch(`${API_BASE_URL}/appointments`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, patient_id: newPat.id }) });
      if (!apptRes.ok) throw new Error("Failed to create appointment");
      addToast("Rendez-vous créé avec succès.", "success");
      setShowAddModal(false); resetForm(); resetQuickAdd(); fetchPatients(); fetchAppointments();
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de la création: " + (err.message || "?"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    if (showQuickAdd) return handleQuickAddAndAppointment(e);
    setIsSubmitting(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/appointments`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error("Failed to create appointment");
      addToast("Rendez-vous créé avec succès.", "success");
      setShowAddModal(false); resetForm(); fetchAppointments();
    } catch (err) {
      console.error(err);
      addToast("Erreur: " + (err.message || "?"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const weekDates = getWeekDates(selectedDate);
  const appointmentsByDate = {};
  appointments.forEach((appt) => {
    const d = appt.clean_date;
    if (!appointmentsByDate[d]) appointmentsByDate[d] = [];
    appointmentsByDate[d].push(appt);
  });
  Object.keys(appointmentsByDate).forEach((d) =>
    appointmentsByDate[d].sort((a, b) => a.start_time.localeCompare(b.start_time))
  );

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "linear-gradient(135deg,#060D1F,#0C1A3A)" }}
      >
        <style>{G}</style>
        <FontInjector />
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 db-logo-ring">
            <FaStethoscope className="text-white text-2xl" />
          </div>
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-sm" style={{ color: "#94A3B8" }}>
            Chargement du tableau de bord…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface)" }}>
      <style>{G}</style>
      <FontInjector />

      <div className="fixed top-5 right-5 z-[60] space-y-2 w-80">
        {toasts.map((t) => (
          <div key={t.id} className={`rounded-2xl px-4 py-3 flex items-center justify-between text-white shadow-lg ${t.type === "success" ? "toast-success" : "toast-error"}`}>
            <div className="flex items-center gap-2.5 text-sm font-semibold">
              {t.type === "success" ? <svg className="w-4 h-4" /> : <FaExclamationCircle size={14} />}
              {t.message}
            </div>
            <button onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))} className="ml-3 hover:opacity-70">
              <FaTimes size={13} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center text-white rounded-r-xl db-toggle"
      >
        {sidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 transition-transform duration-300 z-40 w-64 flex flex-col db-sidebar`}
      >
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center db-logo-ring flex-shrink-0">
              <FaStethoscope className="text-white text-base" />
            </div>
            <div>
              <h1 className="text-white text-lg" style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                Cabi Doc
              </h1>
              <p className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>
                Espace médecin
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
              className={`db-nav-link flex items-center gap-3 px-4 py-3 rounded-xl ${
                item.active ? "active" : ""
              }`}
              style={{ fontWeight: item.active ? 600 : 500 }}
            >
              <span style={{ opacity: item.active ? 1 : 0.65 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div
          className="p-4 m-3 rounded-2xl"
          style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0 db-logo-ring"
              style={{ fontWeight: 700 }}
            >
              {doctorInfo?.name?.charAt(0) || user?.name?.charAt(0) || "D"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate" style={{ fontWeight: 600 }}>
                Dr. {doctorInfo?.name || user?.name || "Médecin"}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>
                Médecin
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4" data-aos="fade-down">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                  style={{
                    background: "linear-gradient(135deg,var(--accent),#2563EB)",
                    boxShadow: "0 4px 14px rgba(59,126,248,.35)",
                  }}
                >
                  <FaCalendarCheck size={14} />
                </div>
                <h2
                  className="text-2xl"
                  style={{ fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.03em" }}
                >
                  Rendez-vous
                </h2>
              </div>
              <p className="text-sm ml-11" style={{ color: "var(--text-2)" }}>
                {viewMode === "day"
                  ? selectedDate.toLocaleDateString("fr-FR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : viewMode === "month"
                  ? selectedDate.toLocaleDateString("fr-FR", {
                      month: "long",
                      year: "numeric",
                    })
                  : `Semaine du ${weekDates[0].toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                    })} au ${weekDates[5].toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={fetchAppointments}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center btn-ghost"
                title="Actualiser"
              >
                <FaSync size={13} style={{ color: "#64748B" }} />
              </button>

              <div className="view-bar flex">
                {[
                  ["day", "Jour"],
                  ["week", "Semaine"],
                  ["month", "Mois"],
                ].map(([m, l]) => (
                  <button
                    key={m}
                    onClick={() => handleViewModeChange(m)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                      viewMode === m ? "view-btn-active" : "view-btn-idle"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => changeDate(-1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center btn-ghost"
                >
                  <FaChevronLeft size={13} />
                </button>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 rounded-xl text-xs"
                  style={{
                    background: "#EEE8FF",
                    color: "#5B21B6",
                    border: "1.5px solid #DDD6FE",
                    fontWeight: 700,
                  }}
                >
                            Aujourd&apos;hui
                </button>
                <button
                  onClick={() => changeDate(1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center btn-ghost"
                >
                  <FaChevronRight size={13} />
                </button>
              </div>
              <button
                onClick={() => navigate("/appointment-requests")}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl btn-ghost text-sm"
                title="Demandes des rendez-vous"
                style={{ fontWeight: 600 }}
              >
                <FaBell size={13} style={{ color: "#64748B" }} />
                <span>Demandes des rendez-vous</span>
                {pendingRequestsCount > 0 && (
                  <span
                    className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}
                  >
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-violet px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"
                style={{ fontWeight: 600 }}
              >
                <FaPlus size={12} /> Nouveau RDV
              </button>
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

          <div className="flex flex-wrap gap-3 mb-6" data-aos="fade-up">
            <div
              className="chip-violet px-3.5 py-2 rounded-xl text-xs flex items-center gap-2"
              style={{ fontWeight: 600 }}
            >
              <FaCalendarAlt size={11} />
              {appointments.length} rendez-vous
            </div>
            <div
              className="chip-green px-3.5 py-2 rounded-xl text-xs flex items-center gap-2"
              style={{ fontWeight: 600 }}
            >
              <FaStethoscope size={11} />
              {appointments.filter((a) => a.status === "completed").length} terminés
            </div>
            <div
              className="chip-amber px-3.5 py-2 rounded-xl text-xs flex items-center gap-2"
              style={{ fontWeight: 600 }}
            >
              <FaClock size={11} />
              {appointments.filter((a) => a.status === "scheduled").length} planifiés
            </div>
          </div>

          {appointments.length === 0 && (
            <div
              className="bg-white rounded-2xl flex flex-col items-center justify-center py-20"
              style={{ border: "1.5px dashed #DDD6FE", boxShadow: "0 4px 24px rgba(6,13,31,0.06)" }}
              data-aos="fade-up"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "linear-gradient(135deg,#EEE8FF,#DDD6FE)" }}
              >
                <FaCalendarCheck style={{ color: "var(--violet)" }} size={26} />
              </div>
              <h3 className="font-800 text-base mb-2" style={{ fontWeight: 800, color: "var(--text-1)" }}>
                Aucun rendez-vous
              </h3>
              <p className="text-sm mb-6 text-center max-w-xs" style={{ color: "var(--text-2)" }}>
                {viewMode === "day"
                  ? "Aucun rendez-vous prévu pour cette journée."
                  : "Aucun rendez-vous prévu pour cette semaine."}
              </p>
            </div>
          )}

          {appointments.length > 0 && viewMode === "day" && (
            <div
              className="bg-white rounded-2xl p-6"
              style={{ border: "1.5px solid var(--border)", boxShadow: "0 4px 24px rgba(6,13,31,0.06)" }}
              data-aos="fade-up"
            >
              <div
                className="flex items-center gap-3 mb-5 pb-4"
                style={{ borderBottom: "1.5px solid #F0EEFF" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#EEE8FF,#DDD6FE)" }}
                >
                  <FaCalendarAlt style={{ color: "var(--violet)" }} size={16} />
                </div>
                <div>
                  <p
                    className="font-700 text-sm"
                    style={{ fontWeight: 700, color: "var(--text-1)" }}
                  >
                    {selectedDate.toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-2)" }}>
                    {appointments.length} rendez-vous ce jour
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {appointments
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .slice(0, expandedDays["day"] ? undefined : itemsPerPage)
                  .map((appt) => {
                    const patientName = appt.patient
                      ? `${appt.patient.nom || ""} ${appt.patient.prenom || ""}`.trim()
                      : `Patient #${appt.patient_id}`;
                    return (
                      <div
                        key={appt.id}
                        className={apptCardClass(appt.status) + " p-4"}
                        onClick={() => openDetailsModal(appt)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{
                                background:
                                  appt.status === "completed"
                                    ? "linear-gradient(135deg,#10B981,#059669)"
                                    : appt.status === "cancelled"
                                    ? "linear-gradient(135deg,#F43F5E,#BE123C)"
                                    : "linear-gradient(135deg,#8B5CF6,#6D28D9)",
                              }}
                            >
                              <FaClock className="text-white" size={14} />
                            </div>
                            <div>
                              <p
                                className="font-700 text-sm"
                                style={{ fontWeight: 700, color: "var(--text-1)" }}
                              >
                                {appt.start_time.substring(0, 5)} – {appt.end_time.substring(0, 5)}
                              </p>
                              <p
                                className="text-xs flex items-center gap-1 mt-0.5"
                                style={{ color: "var(--text-2)" }}
                              >
                                <FaUser size={10} /> {patientName}
                              </p>
                              {appt.notes && (
                                <p
                                  className="text-xs mt-1 flex items-center gap-1"
                                  style={{ color: "var(--text-2)" }}
                                >
                                  <FaNotesMedical size={10} />
                                  <span className="truncate max-w-xs">{appt.notes}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {getStatusBadge(appt.status)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {appointments.length > itemsPerPage && (
                <button
                  onClick={() => toggleDayExpanded("day")}
                  className="mt-4 w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  style={{
                    border: "1.5px dashed #DDD6FE",
                    color: "var(--violet)",
                    fontWeight: 600,
                  }}
                >
                  {expandedDays["day"] ? (
                    <>
                      <FaChevronUp size={10} /> Voir moins
                    </>
                  ) : (
                    <>
                      <FaChevronDown size={10} /> Voir plus ({appointments.length - itemsPerPage} autres)
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {appointments.length > 0 && viewMode === "week" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-aos="fade-up">
              {weekDates.map((date) => {
                const dateStr = formatDate(date);
                const dayAppts = appointmentsByDate[dateStr] || [];
                const paginatedAppts = getPaginatedAppointments(appointmentsByDate, dateStr);
                const hasMore = hasMoreAppointments(appointmentsByDate, dateStr);
                const today = isToday(date);

                return (
                  <div key={dateStr} className={`day-col p-4 ${today ? "day-col-today" : ""}`}>
                    <div
                      className="flex items-start justify-between mb-3 pb-3"
                      style={{ borderBottom: "1.5px solid #F0EEFF" }}
                    >
                      <div>
                        <p
                          className="text-sm"
                          style={{
                            fontWeight: 700,
                            color: today ? "var(--violet)" : "var(--text-1)",
                            textTransform: "capitalize",
                          }}
                        >
                          {date.toLocaleDateString("fr-FR", { weekday: "long" })}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>
                          {date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {today && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{
                              background: "#EEE8FF",
                              color: "var(--violet)",
                              fontWeight: 700,
                              fontSize: 10,
                            }}
                          >
                            Aujourd&apos;hui
                          </span>
                        )}
                        {dayAppts.length > 0 && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs chip-violet"
                            style={{ fontWeight: 600 }}
                          >
                            {dayAppts.length} RDV
                          </span>
                        )}
                      </div>
                    </div>

                    {paginatedAppts.length > 0 ? (
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                        {paginatedAppts.map((appt) => {
                          const patientName = appt.patient
                            ? `${appt.patient.nom || ""} ${appt.patient.prenom || ""}`.trim()
                            : `Patient #${appt.patient_id}`;
                          return (
                            <div
                              key={appt.id}
                              className={apptCardClass(appt.status) + " p-3 text-xs"}
                              onClick={() => openDetailsModal(appt)}
                            >
                              <div className="flex items-start justify-between mb-1.5">
                                <span
                                  className="font-700"
                                  style={{
                                    fontWeight: 700,
                                    color:
                                      appt.status === "completed"
                                        ? "#059669"
                                        : appt.status === "cancelled"
                                        ? "#F43F5E"
                                        : "var(--violet)",
                                  }}
                                >
                                  {appt.start_time.substring(0, 5)} – {appt.end_time.substring(0, 5)}
                                </span>
                              </div>
                              <p
                                className="flex items-center gap-1 truncate mb-1.5"
                                style={{ color: "var(--text-1)", fontWeight: 600 }}
                              >
                                <FaUser size={9} style={{ color: "var(--text-2)" }} />
                                {patientName}
                              </p>
                              {getStatusBadge(appt.status)}
                              {appt.notes && (
                                <p
                                  className="mt-1.5 flex items-center gap-1 truncate"
                                  style={{ color: "var(--text-2)" }}
                                >
                                  <FaNotesMedical size={9} /> {appt.notes}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        className="text-center py-8 text-xs"
                        style={{ color: "#A78BFA", fontWeight: 500 }}
                      >
                        <FaCalendarAlt className="mx-auto mb-1.5" size={16} style={{ color: "#C4B5FD" }} />
                        Aucun rendez-vous
                      </div>
                    )}

                    {hasMore && (
                      <button
                        onClick={() => toggleDayExpanded(dateStr)}
                        className="mt-2 w-full py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
                        style={{
                          border: "1.5px dashed #DDD6FE",
                          color: "var(--violet)",
                          fontWeight: 600,
                        }}
                      >
                        {expandedDays[dateStr] ? (
                          <>
                            <FaChevronUp size={9} /> Moins
                          </>
                        ) : (
                          <>
                            <FaChevronDown size={9} /> +{dayAppts.length - itemsPerPage} autres
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {appointments.length > 0 && viewMode === "month" && (
            <div
              className="bg-white rounded-2xl p-6"
              style={{ border: "1.5px solid var(--border)", boxShadow: "0 4px 24px rgba(6,13,31,0.06)" }}
              data-aos="fade-up"
            >
              <div className="flex items-center justify-between mb-5 pb-4" style={{ borderBottom: "1.5px solid #F0EEFF" }}>
                <div>
                  <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>
                    Planning mensuel
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>
                    {selectedDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-xl text-xs chip-violet" style={{ fontWeight: 600 }}>
                  {appointments.length} rendez-vous
                </span>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2 text-[11px] uppercase tracking-[0.12em]" style={{ color: "var(--text-2)", fontWeight: 700 }}>
                {[
                  "Lun",
                  "Mar",
                  "Mer",
                  "Jeu",
                  "Ven",
                  "Sam",
                  "Dim",
                ].map((day) => (
                  <div key={day} className="px-2 py-1 text-center">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {getMonthDates(selectedDate).map((date) => {
                  const dateStr = formatDate(date);
                  const dayAppts = appointmentsByDate[dateStr] || [];
                  const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                  const today = isToday(date);

                  return (
                    <div
                      key={dateStr}
                      className="rounded-2xl p-3 min-h-[140px] border transition-all"
                      style={{
                        background: isCurrentMonth ? "#fff" : "#F8FAFF",
                        borderColor: today ? "var(--violet)" : "#E2E8F0",
                        boxShadow: today ? "0 0 0 3px rgba(139,92,246,0.16)" : "none",
                        opacity: isCurrentMonth ? 1 : 0.55,
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-7 h-7 rounded-xl flex items-center justify-center text-xs"
                            style={{
                              background: today ? "#EEE8FF" : "#F8FAFF",
                              color: today ? "var(--violet)" : "var(--text-1)",
                              fontWeight: 700,
                            }}
                          >
                            {date.getDate()}
                          </span>
                          {today && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] chip-violet" style={{ fontWeight: 700 }}>
                              Aujourd&apos;hui
                            </span>
                          )}
                        </div>
                        {dayAppts.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] chip-violet" style={{ fontWeight: 600 }}>
                            {dayAppts.length}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {dayAppts.slice(0, 3).map((appt) => {
                          const patientName = appt.patient
                            ? `${appt.patient.nom || ""} ${appt.patient.prenom || ""}`.trim()
                            : `Patient #${appt.patient_id}`;
                          return (
                            <button
                              key={appt.id}
                              type="button"
                              onClick={() => openDetailsModal(appt)}
                              className="w-full text-left rounded-xl px-2.5 py-2 text-[11px] transition-all"
                              style={{
                                background:
                                  appt.status === "completed"
                                    ? "#ECFDF5"
                                    : appt.status === "cancelled"
                                    ? "#FFF1F2"
                                    : "#EEF4FF",
                                border: "1px solid transparent",
                                color:
                                  appt.status === "completed"
                                    ? "#065F46"
                                    : appt.status === "cancelled"
                                    ? "#9F1239"
                                    : "#1E40AF",
                              }}
                            >
                              <div className="font-700 truncate" style={{ fontWeight: 700 }}>
                                {appt.start_time.substring(0, 5)} {patientName}
                              </div>
                              <div className="truncate opacity-80">{getStatusBadge(appt.status)}</div>
                            </button>
                          );
                        })}
                        {dayAppts.length > 3 && (
                          <button
                            type="button"
                            onClick={() => openDetailsModal(dayAppts[3])}
                            className="w-full text-left rounded-xl px-2.5 py-2 text-[11px] transition-all"
                            style={{ background: "#F8FAFF", border: "1px dashed #CBD5E1", color: "var(--text-2)", fontWeight: 600 }}
                          >
                            +{dayAppts.length - 3} autres rendez-vous
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-8 py-6 sticky top-0 bg-white flex justify-between items-center" style={{ borderBottom: "1.5px solid #F0EEFF" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center btn-violet"><FaPlus className="text-white" size={13} /></div>
                <h3 className="font-800 text-base" style={{ fontWeight: 800, color: "var(--text-1)" }}>Nouveau rendez-vous</h3>
              </div>
              {!showQuickAdd && (
                <button type="button" onClick={() => setShowQuickAdd(true)} className="btn-emerald px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                  <FaUserPlus size={11} /> Nouveau patient
                </button>
              )}
            </div>

            <form onSubmit={handleAddAppointment} className="px-8 py-6 space-y-5">
              {!showQuickAdd ? (
                <div>
                  <label className={"block text-xs font-600 mb-1.5 uppercase tracking-wider"} style={{ color: "var(--text-2)", fontWeight: 600 }}>Patient <span style={{ color: "var(--rose)" }}>*</span></label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPatientDropdownOpen(!patientDropdownOpen)}
                      className="w-full p-3 rounded-xl text-sm text-left flex justify-between items-center rv-input"
                    >
                      <span style={{ color: formData.patient_id ? "var(--text-1)" : "#94A3B8" }}>
                        {selectedPatientName || "Sélectionner un patient"}
                      </span>
                      <FaChevronCircleDown size={14} style={{ color: "#94A3B8", transform: patientDropdownOpen ? "rotate(180deg)" : "none", transition: "0.2s" }} />
                    </button>
                    {patientDropdownOpen && (
                      <div className="absolute z-20 mt-1 w-full pt-dropdown overflow-hidden">
                        <div className="p-2" style={{ borderBottom: "1.5px solid #F0EEFF" }}>
                          <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={12} style={{ color: "#94A3B8" }} />
                            <input type="text" placeholder="Rechercher…" value={patientSearchTerm} onChange={(e) => setPatientSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl text-sm rv-input" autoFocus />
                          </div>
                        </div>
                        <div className="overflow-y-auto max-h-52">
                          {filteredPatients.length > 0 ? filteredPatients.map((p) => (
                            <button key={p.id} type="button" onClick={() => handleSelectPatient(p)} className="pt-row w-full text-left px-4 py-3 flex items-center justify-between transition-all" style={{ borderBottom: "1px solid #F8F5FF" }}>
                              <div>
                                <span className="text-sm" style={{ fontWeight: 600, color: "var(--text-1)" }}>{p.nom} {p.prenom}</span>
                                {p.telephone && <span className="text-xs ml-2" style={{ color: "var(--text-2)" }}>📞 {p.telephone}</span>}
                              </div>
                              {formData.patient_id === p.id && <span className="text-xs" style={{ color: "var(--violet)", fontWeight: 700 }}>✓</span>}
                            </button>
                          )) : (
                            <div className="p-5 text-center text-sm" style={{ color: "var(--text-2)" }}>Aucun patient trouvé</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl p-4 space-y-3" style={{ background: "#F5FFFA", border: "1.5px solid #A7F3D0" }}>
                  <p className="text-sm flex items-center gap-2" style={{ fontWeight: 700, color: "#065F46" }}>
                    <FaUserPlus size={13} /> Nouveau patient
                  </p>
                  <div>
                    <label className={"block text-xs font-600 mb-1.5 uppercase tracking-wider"} style={{ color: "#065F46", fontWeight: 600 }}>Nom complet *</label>
                    <input type="text" value={newPatientName} onChange={(e) => { setNewPatientName(e.target.value); setExistingPatientWarning(checkExistingPatient(e.target.value)); }} className={"w-full p-3 rounded-xl text-sm rv-input"} placeholder="Jean Dupont" required />
                  </div>
                  {newPatientName && (
                    <div>
                      <label className={"block text-xs font-600 mb-1.5 uppercase tracking-wider"} style={{ color: "#065F46", fontWeight: 600 }}>Téléphone (optionnel)</label>
                      <div className="relative">
                        <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2" size={12} style={{ color: "#94A3B8" }} />
                        <input type="tel" value={newPatientPhone} onChange={(e) => setNewPatientPhone(e.target.value)} className={"w-full p-3 rounded-xl text-sm rv-input pl-10"} placeholder="06 12 34 56 78" />
                      </div>
                    </div>
                  )}
                  {existingPatientWarning && (
                    <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A" }}>
                      <FaExclamationTriangle size={13} style={{ color: "#D97706", flexShrink: 0, marginTop: 2 }} />
                      <div className="text-xs" style={{ color: "#92400E" }}>
                        <p style={{ fontWeight: 700 }}>Patient existant détecté</p>
                        <p>{existingPatientWarning.nom} {existingPatientWarning.prenom}</p>
                        <p className="mt-0.5">Veuillez utiliser la sélection existante.</p>
                      </div>
                    </div>
                  )}
                  <button type="button" onClick={resetQuickAdd} className="btn-ghost px-3 py-1.5 rounded-xl text-xs" style={{ fontWeight: 600 }}>← Retour</button>
                </div>
              )}

              <div>
                <label className={"block text-xs font-600 mb-1.5 uppercase tracking-wider"} style={{ color: "var(--text-2)", fontWeight: 600 }}>Date <span style={{ color: "var(--rose)" }}>*</span></label>
                <input type="date" value={formData.appointment_date} onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })} className={"w-full p-3 rounded-xl text-sm rv-input"} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={"block text-xs font-600 mb-1.5 uppercase tracking-wider"} style={{ color: "var(--text-2)", fontWeight: 600 }}>Début <span style={{ color: "var(--rose)" }}>*</span></label>
                  <input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} min="08:00" max="18:00" step="60" className={"w-full p-3 rounded-xl text-sm rv-input"} required />
                  <p className="text-xs mt-1" style={{ color: "var(--text-2)" }}>Entre 08:00 et 18:00</p>
                </div>
                <div>
                  <label className={"block text-xs font-600 mb-1.5 uppercase tracking-wider"} style={{ color: "var(--text-2)", fontWeight: 600 }}>Fin <span style={{ color: "var(--rose)" }}>*</span></label>
                  <input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} min="08:00" max="18:00" step="60" className={"w-full p-3 rounded-xl text-sm rv-input"} required />
                </div>
              </div>

              <div>
                <label className={"block text-xs font-600 mb-1.5 uppercase tracking-wider"} style={{ color: "var(--text-2)", fontWeight: 600 }}>Statut</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={"w-full p-3 rounded-xl text-sm rv-input"}>
                  <option value="scheduled">Planifié</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>

              <div>
                <label className={"block text-xs font-600 mb-1.5 uppercase tracking-wider"} style={{ color: "var(--text-2)", fontWeight: 600 }}>Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows="3" className={"w-full p-3 rounded-xl text-sm rv-input"} placeholder="Informations complémentaires…" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddModal(false); resetForm(); resetQuickAdd(); setPatientDropdownOpen(false); }} className="btn-ghost px-5 py-2.5 rounded-xl text-sm" style={{ fontWeight: 600 }}>Annuler</button>
                <button type="submit" disabled={isSubmitting || (showQuickAdd && !!existingPatientWarning) || (!showQuickAdd && !formData.patient_id)} className="btn-violet px-6 py-2.5 rounded-xl text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                  {isSubmitting ? <FaSpinner className="animate-spin" size={13} /> : <><FaPlus size={12} /> Créer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && currentAppointment && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div
            className="modal-box bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
            style={{ animation: "mIn 0.24s cubic-bezier(.4,0,.2,1)" }}
          >
            <div
              className="px-8 py-6 flex items-start justify-between"
              style={{
                background: "linear-gradient(135deg,#EEE8FF,#DDD6FE)",
                borderBottom: "1.5px solid #DDD6FE",
              }}
            >
              <div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}
                >
                  <FaCalendarAlt className="text-white" size={15} />
                </div>
                <h3 className="font-800 text-base" style={{ fontWeight: 800, color: "var(--text-1)" }}>
                  Détails du rendez-vous
                </h3>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center btn-ghost mt-1"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="px-8 py-6 space-y-4">
              {[
                {
                  icon: <FaUser style={{ color: "var(--violet)" }} />,
                  bg: "#EEE8FF",
                  label: "Patient",
                  val: currentAppointment.patient
                    ? `${currentAppointment.patient.nom} ${currentAppointment.patient.prenom}`.trim()
                    : `Patient #${currentAppointment.patient_id}`,
                },
                {
                  icon: <FaCalendarAlt style={{ color: "#10B981" }} />,
                  bg: "#ECFDF5",
                  label: "Date",
                  val: new Date(
                    currentAppointment.clean_date || currentAppointment.appointment_date
                  ).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                },
                {
                  icon: <FaClock style={{ color: "var(--violet)" }} />,
                  bg: "#EEE8FF",
                  label: "Horaire",
                  val: `${currentAppointment.start_time.substring(0, 5)} – ${currentAppointment.end_time.substring(0, 5)}`,
                },
              ].map(({ icon, bg, label, val }) => (
                <div key={label} className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: bg }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p
                      className="text-xs"
                      style={{
                        color: "var(--text-2)",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {label}
                    </p>
                    <p className="text-sm mt-0.5" style={{ fontWeight: 700, color: "var(--text-1)" }}>
                      {val}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#FFFBEB" }}
                >
                  <FaStethoscope style={{ color: "#D97706" }} />
                </div>
                <div>
                  <p
                    className="text-xs"
                    style={{
                      color: "var(--text-2)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Statut
                  </p>
                  <div className="mt-1">{getStatusBadge(currentAppointment.status)}</div>
                </div>
              </div>

              {currentAppointment.notes && (
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#F8F5FF" }}
                  >
                    <FaNotesMedical style={{ color: "var(--violet)" }} />
                  </div>
                  <div>
                    <p
                      className="text-xs"
                      style={{
                        color: "var(--text-2)",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Notes
                    </p>
                    <p className="text-sm mt-0.5" style={{ color: "var(--text-1)" }}>
                      {currentAppointment.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 pb-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn-ghost px-5 py-2.5 rounded-xl text-sm"
                style={{ fontWeight: 600 }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes mIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .modal-overlay {
            background: rgba(6,13,31,0.62);
            backdrop-filter: blur(7px);
          }
          .btn-ghost {
            border: 1.5px solid #E2E8F0;
            color: #64748B;
            background: #fff;
            transition: all 0.18s ease;
          }
          .btn-ghost:hover {
            background: #F8FAFF;
            border-color: rgba(139,92,246,0.3);
            color: var(--violet);
          }
        `}
      </style>
    </div>
  );
}

export default RendezVous;