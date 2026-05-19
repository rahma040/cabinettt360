import { useEffect, useState, useRef } from "react";
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
  FaPlus,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
  FaClock,
  FaUser,
  FaStethoscope,
  FaNotesMedical,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaExclamationTriangle,
  FaPhone,
  FaUserPlus,
  FaChevronCircleDown,
  FaUserClock,
  FaMoneyBillWave,
  FaClipboardList,
  FaCheckCircle,
  FaExclamationCircle,
  FaEnvelope,
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
    --navy:       #060D1F;
    --navy-mid:   #0C1A3A;
    --navy-light: #122048;
    --accent:     #3B7EF8;
    --accent-glow:rgba(59,126,248,0.20);
    --violet:     #8B5CF6;
    --violet-glow:rgba(139,92,246,0.22);
    --teal:       #0ECDB5;
    --amber:      #F59E0B;
    --rose:       #F43F5E;
    --emerald:    #10B981;
    --surface:    #F4F7FF;
    --text-1:     #0A0F1E;
    --text-2:     #5B6B8A;
    --border:     rgba(59,126,248,0.13);
  }

  .rv-sidebar { background: linear-gradient(180deg, var(--navy) 0%, var(--navy-mid) 60%, var(--navy-light) 100%); }
  .rv-logo-ring { background: linear-gradient(135deg, var(--violet), #6D28D9); }
  .rv-nav-link { transition: all 0.2s ease; border-left: 3px solid transparent; color: rgba(255,255,255,0.48); font-size:14px; }
  .rv-nav-link:hover { background: rgba(139,92,246,0.14); border-left-color: var(--violet); color: #fff; }
  .rv-nav-link.active { background: rgba(139,92,246,0.22); border-left-color: var(--violet); color: #fff; }
  .rv-toggle { background: linear-gradient(135deg, var(--violet), #6D28D9); box-shadow: 0 4px 14px rgba(139,92,246,0.4); }

  .btn-violet { background: linear-gradient(135deg, var(--violet), #6D28D9); color:#fff; box-shadow: 0 4px 14px rgba(139,92,246,0.32); transition: all 0.2s ease; }
  .btn-violet:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(139,92,246,0.42); }
  .btn-violet:disabled { opacity:.5; transform:none; box-shadow:none; cursor:not-allowed; }
  .btn-emerald { background: linear-gradient(135deg, #10B981, #059669); color:#fff; box-shadow: 0 4px 14px rgba(16,185,129,0.28); transition: all 0.2s ease; }
  .btn-emerald:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,0.38); }
  .btn-amber { background: linear-gradient(135deg, #F59E0B, #D97706); color:#fff; box-shadow: 0 4px 14px rgba(245,158,11,0.28); transition: all 0.2s ease; }
  .btn-amber:hover { transform: translateY(-1px); }
  .btn-ghost { border: 1.5px solid #E2E8F0; color: #64748B; background: #fff; transition: all 0.18s ease; }
  .btn-ghost:hover { background: #F8FAFF; border-color: rgba(139,92,246,0.3); color: var(--violet); }
  .btn-ghost:disabled { opacity:.45; cursor:not-allowed; }

  .rv-input { border: 1.5px solid #E2E8F0; background: #fff; transition: all 0.2s ease; font-size:14px; }
  .rv-input:focus { outline:none; border-color: var(--violet); box-shadow: 0 0 0 3px var(--violet-glow); }

  .view-bar { background: #E8EEFF; border-radius: 12px; padding: 4px; }
  .view-btn-active { background:#fff; color: var(--text-1); box-shadow: 0 2px 10px rgba(6,13,31,0.08); font-weight:700; }
  .view-btn-idle { color: var(--text-2); font-weight:500; }

  .day-col { background:#fff; border-radius:20px; border:1.5px solid var(--border); transition: all 0.22s ease; }
  .day-col:hover { border-color: rgba(139,92,246,0.2); }
  .day-col-today { border-color: var(--violet) !important; box-shadow: 0 0 0 3px var(--violet-glow); }
  .day-col-drop { border-color: var(--violet) !important; background: #F5F0FF !important; }

  .appt-card { border-left: 3px solid var(--violet); border-radius: 12px; background: #F8F5FF; transition: all 0.2s ease; cursor: grab; }
  .appt-card:active { cursor: grabbing; }
  .appt-card:hover { background: #F0EAFF; box-shadow: 0 4px 14px rgba(139,92,246,0.12); transform: translateY(-1px); }
  .appt-card-done { border-left-color: #10B981; background: #F0FFF8; }
  .appt-card-done:hover { background: #E6FFF5; }
  .appt-card-cancelled { border-left-color: #F43F5E; background: #FFF5F7; }
  .appt-card-cancelled:hover { background: #FFE8EE; }
  .appt-card-dragging { opacity: 0.45; }

  .drop-zone { border: 2px dashed #DDD6FE; border-radius: 12px; transition: all 0.2s ease; }
  .drop-zone-hover { border-color: var(--violet); background: #F5F0FF; }

  .badge-done      { background:#ECFDF5; color:#065F46; border:1px solid #A7F3D0; }
  .badge-cancelled { background:#FFF1F2; color:#9F1239; border:1px solid #FECDD3; }
  .badge-planned   { background:#EEF4FF; color:#1E40AF; border:1px solid #BFDBFE; }

  .modal-overlay { background: rgba(6,13,31,0.62); backdrop-filter: blur(7px); }
  .modal-box { animation: mIn 0.24s cubic-bezier(.4,0,.2,1); }
  @keyframes mIn { from{opacity:0;transform:scale(0.95) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);} }

  .pt-dropdown { border:1.5px solid #E2E8F0; border-radius:14px; background:#fff; box-shadow:0 8px 28px rgba(6,13,31,0.1); }
  .pt-row:hover { background:#F5F0FF; }

  .chip-violet { background:#EEE8FF; border:1px solid #DDD6FE; color:#5B21B6; }
  .chip-green  { background:#ECFDF5; border:1px solid #A7F3D0; color:#065F46; }
  .chip-amber  { background:#FFFBEB; border:1px solid #FDE68A; color:#92400E; }

  .toast-success { background: linear-gradient(135deg, #10B981, #059669); color: white; }
  .toast-error { background: linear-gradient(135deg, #F43F5E, #BE123C); color: white; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(139,92,246,0.25); border-radius:99px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(139,92,246,0.45); }
`;

const fmtDate = (date) => {
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

function SecretaryRendezVous() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [secretaryInfo, setSecretaryInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDragModal, setShowDragModal] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [dragData, setDragData] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});
  const [itemsPerPage] = useState(5);
  const [toasts, setToasts] = useState([]);

  const [formData, setFormData] = useState({
    patient_id: "",
    appointment_date: "",
    start_time: "",
    end_time: "",
    notes: "",
    status: "scheduled",
  });

  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [existingPatientWarning, setExistingPatientWarning] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState("");

  const integrityInterval = useRef(null);

  const addToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const getToken = () => localStorage.getItem("token");

  const isAuthenticatedSecretary = () => {
    const token = getToken();
    const userData = localStorage.getItem("user");
    if (!token || !userData) return false;
    const parsed = JSON.parse(userData);
    return parsed.role === "secretaire";
  };

  const toggleDayExpanded = (dateStr) =>
    setExpandedDays((prev) => ({ ...prev, [dateStr]: !prev[dateStr] }));

  const getPaginatedAppointments = (apptMap, dateStr) => {
    if (!apptMap[dateStr]) return [];
    return expandedDays[dateStr]
      ? apptMap[dateStr]
      : apptMap[dateStr].slice(0, itemsPerPage);
  };

  const hasMoreAppointments = (apptMap, dateStr) =>
    apptMap[dateStr] && apptMap[dateStr].length > itemsPerPage;

  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: "ease-out-cubic" });
    if (!isAuthenticatedSecretary()) { navigate("/login"); return; }
    const userData = localStorage.getItem("user");
    setUser(JSON.parse(userData));

    performIntegrityCheck(navigate, null, true)
      .then(() => {
        fetchCurrentUser();
        fetchPatients();
      })
      .catch(() => setLoading(false));

    integrityInterval.current = setInterval(() => {
      performIntegrityCheck(navigate, null, false);
    }, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        performIntegrityCheck(navigate, null, false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (integrityInterval.current) clearInterval(integrityInterval.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [navigate]);

  useEffect(() => {
    if (secretaryInfo) fetchAppointments();
  }, [secretaryInfo, selectedDate, viewMode]);

  const fetchCurrentUser = async () => {
    const token = getToken();
    if (!token) { navigate("/login"); return; }
    try {
      const res = await api.get("/auth/me");
      setSecretaryInfo(res.data);
    } catch (err) {
      console.error(err);
      setSecretaryInfo(JSON.parse(localStorage.getItem("user") || "{}"));
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get("/patients");
      setPatients(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) clearAndRedirect(navigate);
    }
  };

  const fetchAppointments = async () => {
    try {
      let startDate, endDate;
      if (viewMode === "day") {
        startDate = endDate = fmtDate(selectedDate);
      } else {
        const wd = getWeekDates(selectedDate);
        startDate = fmtDate(wd[0]); endDate = fmtDate(wd[5]);
      }
      const res = await api.get(`/appointments?start_date=${startDate}&end_date=${endDate}`);
      const data = res.data.map((a) => ({
        ...a,
        clean_date: extractDate(a.appointment_date),
        patient: a.patient || { nom: "", prenom: "" },
      }));
      setAppointments(data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) clearAndRedirect(navigate);
    }
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

  const handleQuickAddAndAppointment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (existingPatientWarning) { addToast("Ce patient existe déjà. Veuillez utiliser la sélection.", "error"); setIsSubmitting(false); return; }
      const pRes = await api.post("/patients", {
        nom: newPatientName.split(" ")[0] || newPatientName,
        prenom: newPatientName.split(" ").slice(1).join(" ") || "",
        telephone: newPatientPhone || "",
      });
      const newPat = pRes.data;
      await api.post("/appointments", { ...formData, patient_id: newPat.id });
      addToast("Rendez-vous créé avec succès.", "success");
      setShowAddModal(false); resetForm(); resetQuickAdd(); fetchPatients(); fetchAppointments();
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de la création: " + (err.response?.data?.error || "?"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    if (showQuickAdd) return handleQuickAddAndAppointment(e);
    try {
      await api.post("/appointments", formData);
      addToast("Rendez-vous créé avec succès.", "success");
      setShowAddModal(false); resetForm(); fetchAppointments();
    } catch (err) {
      console.error(err);
      addToast("Erreur: " + (err.response?.data?.error || "?"), "error");
    }
  };

  const convertAppointmentStatusToVisitStatus = (status) => {
    if (status === "completed") return "terminé";
    if (status === "cancelled") return "annulé";
    return "planifié";
  };

  const findAndUpdateVisite = async (patientId, oldDate, newDate, newStatus) => {
    try {
      const res = await api.get(`/patients/${patientId}`);
      const patient = res.data;
      if (!patient.visites) return;
      const targetVisite = patient.visites.find(v => v.date_visite === oldDate);
      if (!targetVisite) return;
      const visitStatus = convertAppointmentStatusToVisitStatus(newStatus);
      const updateData = {
        date_visite: newDate,
        statut: visitStatus,
      };
      await api.put(`/patients/${patientId}/visites/${targetVisite.id}`, updateData);
    } catch (error) {
      console.error("Failed to update visite:", error);
    }
  };

  const findAndDeleteVisite = async (patientId, appointmentDate) => {
    try {
      const res = await api.get(`/patients/${patientId}`);
      const patient = res.data;
      if (!patient.visites) return;
      const targetVisite = patient.visites.find(v => v.date_visite === appointmentDate);
      if (!targetVisite) return;
      await api.delete(`/patients/${patientId}/visites/${targetVisite.id}`);
    } catch (error) {
      console.error("Failed to delete visite:", error);
    }
  };

  const handleEditAppointment = async (e) => {
    e.preventDefault();
    if (!currentAppointment) return;
    setIsSubmitting(true);
    try {
      const oldDate = currentAppointment.appointment_date;
      const newDate = formData.appointment_date;
      const newStatus = formData.status;
      const payload = {
        patient_id: formData.patient_id,
        appointment_date: newDate,
        start_time: formData.start_time,
        end_time: formData.end_time,
        notes: formData.notes,
        status: newStatus,
      };
      const response = await api.put(`/appointments/${currentAppointment.id}`, payload);
      if (response.status === 200 && response.data) {
        await findAndUpdateVisite(formData.patient_id, oldDate, newDate, newStatus);
        addToast("Rendez-vous modifié avec succès.", "success");
        setShowEditModal(false);
        resetForm();
        await fetchAppointments();
      } else {
        addToast("La modification a échoué.", "error");
      }
    } catch (err) {
      console.error("Update error:", err);
      const msg = err.response?.data?.error || err.response?.data?.message || "Erreur lors de la modification.";
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAppointment = async (id, patientId, appointmentDate) => {
    try {
      await api.delete(`/appointments/${id}`);
      await findAndDeleteVisite(patientId, appointmentDate);
      addToast("Rendez-vous supprimé.", "success");
      fetchAppointments();
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de la suppression.", "error");
    }
  };

  const handleDragStart = (e, appt) => {
    e.dataTransfer.setData("application/json", JSON.stringify({
      id: appt.id, patient_id: appt.patient_id, start_time: appt.start_time,
      end_time: appt.end_time, notes: appt.notes, status: appt.status,
      appointment_date: appt.appointment_date,
    }));
    e.currentTarget.classList.add("appt-card-dragging");
  };
  const handleDragEnd = (e) => e.currentTarget.classList.remove("appt-card-dragging");
  const handleDragOver = (e, date) => { e.preventDefault(); setDropTarget(date); };
  const handleDragLeave = () => setDropTarget(null);
  const handleDrop = (e, targetDate) => {
    e.preventDefault(); setDropTarget(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      setDragData({ ...data, new_date: targetDate }); setShowDragModal(true);
    } catch (err) { console.error(err); }
  };
  const handleDragDropConfirm = async () => {
    if (!dragData) return;
    try {
      const oldDate = dragData.appointment_date;
      const newDate = dragData.new_date;
      await api.put(`/appointments/${dragData.id}`, {
        patient_id: dragData.patient_id,
        appointment_date: newDate,
        start_time: dragData.start_time,
        end_time: dragData.end_time,
        notes: dragData.notes,
        status: dragData.status,
      });
      await findAndUpdateVisite(dragData.patient_id, oldDate, newDate, dragData.status);
      addToast("Rendez-vous déplacé avec succès.", "success");
      setShowDragModal(false); setDragData(null); fetchAppointments();
    } catch (err) {
      console.error(err);
      addToast("Erreur lors du déplacement.", "error");
    }
  };

  const resetForm = () => {
    setFormData({ patient_id: "", appointment_date: "", start_time: "", end_time: "", notes: "", status: "scheduled" });
    setCurrentAppointment(null); setSelectedPatientName("");
  };
  const resetQuickAdd = () => {
    setShowQuickAdd(false); setNewPatientName(""); setNewPatientPhone(""); setExistingPatientWarning(null); setPatientSearchTerm("");
  };

  const openEditModal = (a) => {
    setCurrentAppointment(a);
    setFormData({
      patient_id: a.patient_id,
      appointment_date: a.clean_date || a.appointment_date.split("T")[0],
      start_time: a.start_time.substring(0, 5),
      end_time: a.end_time.substring(0, 5),
      notes: a.notes || "",
      status: a.status,
    });
    setShowEditModal(true);
  };
  const openDetailsModal = (a) => { setCurrentAppointment(a); setShowDetailsModal(true); };

  const changeDate = (dir) => {
    const d = new Date(selectedDate);
    if (viewMode === "day") d.setDate(d.getDate() + dir);
    else if (viewMode === "month") d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir * 7);
    setSelectedDate(d); setExpandedDays({});
  };
  const goToToday = () => { setSelectedDate(new Date()); setExpandedDays({}); };
  const handleViewModeChange = (m) => { setViewMode(m); setExpandedDays({}); };
  const handleLogout = () => {
    if (integrityInterval.current) clearInterval(integrityInterval.current);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userIntegrityHash");
    navigate("/login");
  };

  const filteredPatients = patients.filter((p) => {
    const q = patientSearchTerm.toLowerCase();
    return (p.nom?.toLowerCase() || "").includes(q) || (p.prenom?.toLowerCase() || "").includes(q) || (p.telephone?.toLowerCase() || "").includes(q);
  });
  const handleSelectPatient = (p) => {
    setFormData({ ...formData, patient_id: p.id });
    setSelectedPatientName(`${p.nom} ${p.prenom}`);
    setPatientDropdownOpen(false); setPatientSearchTerm("");
  };

  const getStatusBadge = (status) => {
    if (status === "completed") return <span className="badge-done px-2.5 py-0.5 rounded-full text-xs" style={{ fontWeight: 600 }}>Terminé</span>;
    if (status === "cancelled") return <span className="badge-cancelled px-2.5 py-0.5 rounded-full text-xs" style={{ fontWeight: 600 }}>Annulé</span>;
    return <span className="badge-planned px-2.5 py-0.5 rounded-full text-xs" style={{ fontWeight: 600 }}>Planifié</span>;
  };

  const apptCardClass = (status) => {
    if (status === "completed") return "appt-card appt-card-done";
    if (status === "cancelled") return "appt-card appt-card-cancelled";
    return "appt-card";
  };

  const weekDates = getWeekDates(selectedDate);
  const appointmentsByDate = {};
  appointments.forEach((a) => {
    const d = a.clean_date;
    if (!appointmentsByDate[d]) appointmentsByDate[d] = [];
    appointmentsByDate[d].push(a);
  });
  Object.keys(appointmentsByDate).forEach((d) =>
    appointmentsByDate[d].sort((a, b) => a.start_time.localeCompare(b.start_time))
  );

  const navItems = [
    { to: "/secretariatdb", icon: <FaHome />, label: "Tableau de bord" },
    { to: "/secpatients", icon: <FaUserInjured />, label: "Patients" },
    { to: "/secretaryRendezvous", icon: <FaCalendarCheck />, label: "Rendez-vous", active: true  },
    { to: "/sectasks", icon: <FaClipboardList />, label: "Tâches"},
    { to: "/secwaiting", icon: <FaUserClock />, label: "Salle d'attente" },
    { to: "/secpay", icon: <FaMoneyBillWave />, label: "Paiements"},
    { to: "/secmail", icon: <FaEnvelope />, label: "Messagerie" },
    { to: "/secsettings", icon: <FaCog />, label: "Paramètres" },
  ];

  const IC = "w-full p-3 rounded-xl text-sm rv-input";
  const LC = "block text-xs font-600 mb-1.5 uppercase tracking-wider";
  const LS = { color: "var(--text-2)", fontWeight: 600, letterSpacing: "0.07em" };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "linear-gradient(135deg,#060D1F,#0C1A3A)" }}>
        <style>{G}</style><FontInjector />
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 rv-logo-ring">
            <FaCalendarCheck className="text-white text-2xl" />
          </div>
          <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-sm" style={{ color: "#94A3B8" }}>Chargement…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface)" }}>
      <style>{G}</style><FontInjector />

      <div className="fixed top-5 right-5 z-[60] space-y-2 w-80">
        {toasts.map((t) => (
          <div key={t.id} className={`rounded-2xl px-4 py-3 flex items-center justify-between text-white shadow-lg ${t.type === "success" ? "toast-success" : "toast-error"}`}>
            <div className="flex items-center gap-2.5 text-sm font-semibold">
              {t.type === "success" ? <FaCheckCircle size={14} /> : <FaExclamationCircle size={14} />}
              {t.message}
            </div>
            <button onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))} className="ml-3 hover:opacity-70">
              <FaTimes size={13} />
            </button>
          </div>
        ))}
      </div>

      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center text-white rounded-r-xl rv-toggle">
        {sidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
      </button>

      <aside className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 transition-transform duration-300 z-40 w-64 flex flex-col rv-sidebar`}>
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center rv-logo-ring flex-shrink-0">
              <FaStethoscope className="text-white text-base" />
            </div>
            <div>
              <h1 className="text-white text-lg" style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Cabi Doc</h1>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>Espace secrétariat</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className={`rv-nav-link flex items-center gap-3 px-4 py-3 rounded-xl ${item.active ? "active" : ""}`}
              style={{ fontWeight: item.active ? 600 : 500 }}>
              <span style={{ opacity: item.active ? 1 : 0.65 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 m-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0 rv-logo-ring" style={{ fontWeight: 700 }}>
              {secretaryInfo?.name?.charAt(0) || user?.name?.charAt(0) || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate" style={{ fontWeight: 600 }}>{secretaryInfo?.name || user?.name || "Secrétaire"}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>Secrétaire</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all hover:bg-red-500/20" style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
            <FaSignOutAlt size={12} /> Déconnexion
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 lg:hidden" style={{ background: "rgba(6,13,31,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 pt-14 lg:pt-8 max-w-7xl mx-auto">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4" data-aos="fade-down">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", boxShadow: "0 4px 14px rgba(139,92,246,0.35)" }}>
                  <FaCalendarCheck size={14} />
                </div>
                <h2 className="text-2xl" style={{ fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.03em" }}>Rendez-vous</h2>
              </div>
              <p className="text-sm ml-11" style={{ color: "var(--text-2)" }}>
                {viewMode === "day"
                  ? selectedDate.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
                  : viewMode === "month"
                  ? selectedDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
                  : `Semaine du ${weekDates[0].toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} au ${weekDates[5].toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="view-bar flex">
                {[ ["day", "Jour"], ["week", "Semaine"], ["month", "Mois"] ].map(([m, l]) => (
                  <button key={m} onClick={() => handleViewModeChange(m)} className={`px-4 py-2 rounded-xl text-sm transition-all ${viewMode === m ? "view-btn-active" : "view-btn-idle"}`}>
                    {l}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => changeDate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center btn-ghost"><FaChevronLeft size={13} /></button>
                <button onClick={goToToday} className="px-4 py-2 rounded-xl text-xs" style={{ background: "#EEE8FF", color: "#5B21B6", border: "1.5px solid #DDD6FE", fontWeight: 700 }}>Aujourd'hui</button>
                <button onClick={() => changeDate(1)} className="w-9 h-9 rounded-xl flex items-center justify-center btn-ghost"><FaChevronRight size={13} /></button>
              </div>

              <button onClick={() => setShowAddModal(true)} className="btn-violet px-4 py-2.5 rounded-xl text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                <FaPlus size={12} /> Nouveau RDV
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-6" data-aos="fade-up">
            <div className="chip-violet px-3.5 py-2 rounded-xl text-xs flex items-center gap-2" style={{ fontWeight: 600 }}>
              <FaCalendarAlt size={11} />
              {appointments.length} rendez-vous
            </div>
            <div className="chip-green px-3.5 py-2 rounded-xl text-xs flex items-center gap-2" style={{ fontWeight: 600 }}>
              <FaStethoscope size={11} />
              {appointments.filter((a) => a.status === "completed").length} terminés
            </div>
            <div className="chip-amber px-3.5 py-2 rounded-xl text-xs flex items-center gap-2" style={{ fontWeight: 600 }}>
              <FaClock size={11} />
              {appointments.filter((a) => a.status === "scheduled").length} planifiés
            </div>
          </div>

          {appointments.length === 0 && (
            <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-20" style={{ border: "1.5px dashed #DDD6FE", boxShadow: "0 4px 24px rgba(6,13,31,0.06)" }} data-aos="fade-up">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: "linear-gradient(135deg,#EEE8FF,#DDD6FE)" }}>
                <FaCalendarCheck style={{ color: "var(--violet)" }} size={26} />
              </div>
              <h3 className="font-800 text-base mb-2" style={{ fontWeight: 800, color: "var(--text-1)" }}>Aucun rendez-vous</h3>
              <p className="text-sm mb-6 text-center max-w-xs" style={{ color: "var(--text-2)" }}>
                {viewMode === "day" ? "Aucun rendez-vous prévu pour cette journée." : "Aucun rendez-vous prévu pour cette semaine."}
              </p>
              <button onClick={() => setShowAddModal(true)} className="btn-violet px-6 py-2.5 rounded-xl text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                <FaPlus size={12} /> Ajouter un rendez-vous
              </button>
            </div>
          )}

          {appointments.length > 0 && viewMode === "day" && (
            <div className="bg-white rounded-2xl p-6" style={{ border: "1.5px solid var(--border)", boxShadow: "0 4px 24px rgba(6,13,31,0.06)" }} data-aos="fade-up">
              <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: "1.5px solid #F0EEFF" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#EEE8FF,#DDD6FE)" }}>
                  <FaCalendarAlt style={{ color: "var(--violet)" }} size={16} />
                </div>
                <div>
                  <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>
                    {selectedDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-2)" }}>{appointments.length} rendez-vous ce jour</p>
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
                        draggable
                        onDragStart={(e) => handleDragStart(e, appt)}
                        onDragEnd={handleDragEnd}
                        className={apptCardClass(appt.status) + " p-4"}
                        onClick={() => openDetailsModal(appt)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: appt.status === "completed" ? "linear-gradient(135deg,#10B981,#059669)" : appt.status === "cancelled" ? "linear-gradient(135deg,#F43F5E,#BE123C)" : "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}>
                              <FaClock className="text-white" size={14} />
                            </div>
                            <div>
                              <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>
                                {appt.start_time.substring(0, 5)} – {appt.end_time.substring(0, 5)}
                              </p>
                              <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "var(--text-2)" }}>
                                <FaUser size={10} /> {patientName}
                              </p>
                              {appt.notes && (
                                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--text-2)" }}>
                                  <FaNotesMedical size={10} />
                                  <span className="truncate max-w-xs">{appt.notes}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {getStatusBadge(appt.status)}
                            <button onClick={() => openEditModal(appt)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-amber-100" style={{ color: "#D97706", border: "1.5px solid #FDE68A" }}><FaEdit size={13} /></button>
                            <button onClick={() => handleDeleteAppointment(appt.id, appt.patient_id, appt.appointment_date)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-red-100" style={{ color: "#F43F5E", border: "1.5px solid #FECDD3" }}><FaTrash size={13} /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {appointments.length > itemsPerPage && (
                <button onClick={() => toggleDayExpanded("day")} className="mt-4 w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all" style={{ border: "1.5px dashed #DDD6FE", color: "var(--violet)", fontWeight: 600 }}>
                  {expandedDays["day"] ? <><FaChevronUp size={10} /> Voir moins</> : <><FaChevronDown size={10} /> Voir plus ({appointments.length - itemsPerPage} autres)</>}
                </button>
              )}
            </div>
          )}

          {appointments.length > 0 && viewMode === "week" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-aos="fade-up">
              {weekDates.map((date) => {
                const dateStr = fmtDate(date);
                const dayAppts = appointmentsByDate[dateStr] || [];
                const paginatedAppts = getPaginatedAppointments(appointmentsByDate, dateStr);
                const hasMore = hasMoreAppointments(appointmentsByDate, dateStr);
                const today = isToday(date);
                const isDrop = dropTarget === dateStr;

                return (
                  <div
                    key={dateStr}
                    className={`day-col p-4 ${today ? "day-col-today" : ""} ${isDrop ? "day-col-drop" : ""}`}
                    onDragOver={(e) => handleDragOver(e, dateStr)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, dateStr)}
                  >
                    <div className="flex items-start justify-between mb-3 pb-3" style={{ borderBottom: "1.5px solid #F0EEFF" }}>
                      <div>
                        <p className="text-sm" style={{ fontWeight: 700, color: today ? "var(--violet)" : "var(--text-1)", textTransform: "capitalize" }}>
                          {date.toLocaleDateString("fr-FR", { weekday: "long" })}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>
                          {date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {today && <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "#EEE8FF", color: "var(--violet)", fontWeight: 700, fontSize: 10 }}>Aujourd'hui</span>}
                        {dayAppts.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs chip-violet" style={{ fontWeight: 600 }}>{dayAppts.length} RDV</span>
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
                              draggable
                              onDragStart={(e) => handleDragStart(e, appt)}
                              onDragEnd={handleDragEnd}
                              className={apptCardClass(appt.status) + " p-3 text-xs"}
                              onClick={() => openDetailsModal(appt)}
                            >
                              <div className="flex items-start justify-between mb-1.5">
                                <span className="font-700" style={{ fontWeight: 700, color: appt.status === "completed" ? "#059669" : appt.status === "cancelled" ? "#F43F5E" : "var(--violet)" }}>
                                  {appt.start_time.substring(0, 5)} – {appt.end_time.substring(0, 5)}
                                </span>
                                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                  <button onClick={() => openEditModal(appt)} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-amber-100 transition-all" style={{ color: "#D97706" }}><FaEdit size={11} /></button>
                                  <button onClick={() => handleDeleteAppointment(appt.id, appt.patient_id, appt.appointment_date)} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-100 transition-all" style={{ color: "#F43F5E" }}><FaTrash size={11} /></button>
                                </div>
                              </div>
                              <p className="flex items-center gap-1 truncate mb-1.5" style={{ color: "var(--text-1)", fontWeight: 600 }}>
                                <FaUser size={9} style={{ color: "var(--text-2)" }} />
                                {patientName}
                              </p>
                              {getStatusBadge(appt.status)}
                              {appt.notes && (
                                <p className="mt-1.5 flex items-center gap-1 truncate" style={{ color: "var(--text-2)" }}>
                                  <FaNotesMedical size={9} /> {appt.notes}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        className={`drop-zone text-center py-8 text-xs ${isDrop ? "drop-zone-hover" : ""}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, dateStr)}
                      >
                        <FaCalendarAlt className="mx-auto mb-1.5" size={16} style={{ color: "#C4B5FD" }} />
                        <span style={{ color: "#A78BFA", fontWeight: 500 }}>Déposer ici</span>
                      </div>
                    )}

                    {hasMore && (
                      <button onClick={() => toggleDayExpanded(dateStr)} className="mt-2 w-full py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 transition-all" style={{ border: "1.5px dashed #DDD6FE", color: "var(--violet)", fontWeight: 600 }}>
                        {expandedDays[dateStr]
                          ? <><FaChevronUp size={9} /> Moins</>
                          : <><FaChevronDown size={9} /> +{dayAppts.length - itemsPerPage} autres</>}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {appointments.length > 0 && viewMode === "month" && (
            <div className="bg-white rounded-2xl p-6" style={{ border: "1.5px solid var(--border)", boxShadow: "0 4px 24px rgba(6,13,31,0.06)" }} data-aos="fade-up">
              <div className="flex items-center justify-between mb-5 pb-4" style={{ borderBottom: "1.5px solid #F0EEFF" }}>
                <div>
                  <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>Planning mensuel</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>{selectedDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</p>
                </div>
                <span className="px-3 py-1.5 rounded-xl text-xs chip-violet" style={{ fontWeight: 600 }}>{appointments.length} rendez-vous</span>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2 text-[11px] uppercase tracking-[0.12em]" style={{ color: "var(--text-2)", fontWeight: 700 }}>
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                  <div key={day} className="px-2 py-1 text-center">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {getMonthDates(selectedDate).map((date) => {
                  const dateStr = fmtDate(date);
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
                          <span className="w-7 h-7 rounded-xl flex items-center justify-center text-xs" style={{ background: today ? "#EEE8FF" : "#F8FAFF", color: today ? "var(--violet)" : "var(--text-1)", fontWeight: 700 }}>{date.getDate()}</span>
                          {today && <span className="px-2 py-0.5 rounded-full text-[10px] chip-violet" style={{ fontWeight: 700 }}>Aujourd'hui</span>}
                        </div>
                        {dayAppts.length > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] chip-violet" style={{ fontWeight: 600 }}>{dayAppts.length}</span>}
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
                                background: appt.status === "completed" ? "#ECFDF5" : appt.status === "cancelled" ? "#FFF1F2" : "#EEF4FF",
                                color: appt.status === "completed" ? "#065F46" : appt.status === "cancelled" ? "#9F1239" : "#1E40AF",
                              }}
                            >
                              <div className="font-700 truncate" style={{ fontWeight: 700 }}>{appt.start_time.substring(0, 5)} {patientName}</div>
                              <div className="mt-0.5">{getStatusBadge(appt.status)}</div>
                            </button>
                          );
                        })}
                        {dayAppts.length > 3 && (
                          <button type="button" onClick={() => openDetailsModal(dayAppts[3])} className="w-full text-left rounded-xl px-2.5 py-2 text-[11px] transition-all" style={{ background: "#F8FAFF", border: "1px dashed #CBD5E1", color: "var(--text-2)", fontWeight: 600 }}>
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
                  <label className={LC} style={LS}>Patient <span style={{ color: "var(--rose)" }}>*</span></label>
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
                    <label className={LC} style={{ ...LS, color: "#065F46" }}>Nom complet *</label>
                    <input type="text" value={newPatientName} onChange={(e) => { setNewPatientName(e.target.value); setExistingPatientWarning(checkExistingPatient(e.target.value)); }} className={IC} placeholder="Jean Dupont" required />
                  </div>
                  {newPatientName && (
                    <div>
                      <label className={LC} style={{ ...LS, color: "#065F46" }}>Téléphone (optionnel)</label>
                      <div className="relative">
                        <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2" size={12} style={{ color: "#94A3B8" }} />
                        <input type="tel" value={newPatientPhone} onChange={(e) => setNewPatientPhone(e.target.value)} className={IC + " pl-10"} placeholder="06 12 34 56 78" />
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
                <label className={LC} style={LS}>Date <span style={{ color: "var(--rose)" }}>*</span></label>
                <input type="date" value={formData.appointment_date} onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })} className={IC} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LC} style={LS}>Début <span style={{ color: "var(--rose)" }}>*</span></label>
                  <input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} min="08:00" max="18:00" step="60" className={IC} required />
                  <p className="text-xs mt-1" style={{ color: "var(--text-2)" }}>Entre 08:00 et 18:00</p>
                </div>
                <div>
                  <label className={LC} style={LS}>Fin <span style={{ color: "var(--rose)" }}>*</span></label>
                  <input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} min="08:00" max="18:00" step="60" className={IC} required />
                </div>
              </div>

              <div>
                <label className={LC} style={LS}>Statut</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={IC}>
                  <option value="scheduled">Planifié</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>

              <div>
                <label className={LC} style={LS}>Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows="3" className={IC} placeholder="Informations complémentaires…" />
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

      {showEditModal && currentAppointment && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-8 py-6 sticky top-0 bg-white" style={{ borderBottom: "1.5px solid #F0EEFF" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center btn-amber"><FaEdit className="text-white" size={13} /></div>
                <h3 className="font-800 text-base" style={{ fontWeight: 800, color: "var(--text-1)" }}>Modifier le rendez-vous</h3>
              </div>
            </div>
            <form onSubmit={handleEditAppointment} className="px-8 py-6 space-y-5">
              <div>
                <label className={LC} style={LS}>Patient</label>
                <select value={formData.patient_id} onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })} className={IC} required>
                  <option value="">Sélectionner</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
                </select>
              </div>
              <div>
                <label className={LC} style={LS}>Date</label>
                <input type="date" value={formData.appointment_date} onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })} className={IC} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LC} style={LS}>Début</label>
                  <input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} min="08:00" max="18:00" step="60" className={IC} required />
                </div>
                <div>
                  <label className={LC} style={LS}>Fin</label>
                  <input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} min="08:00" max="18:00" step="60" className={IC} required />
                </div>
              </div>
              <div>
                <label className={LC} style={LS}>Statut</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={IC}>
                  <option value="scheduled">Planifié</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
              <div>
                <label className={LC} style={LS}>Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows="3" className={IC} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowEditModal(false); resetForm(); }} className="btn-ghost px-5 py-2.5 rounded-xl text-sm" style={{ fontWeight: 600 }}>Annuler</button>
                <button type="submit" disabled={isSubmitting} className="btn-amber px-6 py-2.5 rounded-xl text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                  {isSubmitting ? <FaSpinner className="animate-spin" size={13} /> : <><FaEdit size={12} /> Modifier</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDragModal && dragData && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="px-8 py-6" style={{ background: "linear-gradient(135deg,#EEE8FF,#DDD6FE)", borderBottom: "1.5px solid #DDD6FE" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}>
                <FaCalendarCheck className="text-white" size={16} />
              </div>
              <h3 className="font-800 text-base" style={{ fontWeight: 800, color: "var(--text-1)" }}>Déplacer le rendez-vous ?</h3>
            </div>
            <div className="px-8 py-6">
              <div className="rounded-xl p-4" style={{ background: "#F5F0FF", border: "1.5px solid #DDD6FE" }}>
                <p className="text-sm mb-2" style={{ color: "var(--text-2)" }}>
                  <span style={{ fontWeight: 700, color: "var(--text-1)" }}>Nouvelle date :</span>{" "}
                  {new Date(dragData.new_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <p className="text-sm" style={{ color: "var(--text-2)" }}>
                  <span style={{ fontWeight: 700, color: "var(--text-1)" }}>Horaire :</span>{" "}
                  {dragData.start_time} – {dragData.end_time}
                </p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => { setShowDragModal(false); setDragData(null); }} className="btn-ghost px-5 py-2.5 rounded-xl text-sm" style={{ fontWeight: 600 }}>Annuler</button>
                <button onClick={handleDragDropConfirm} className="btn-violet px-6 py-2.5 rounded-xl text-sm" style={{ fontWeight: 600 }}>Confirmer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && currentAppointment && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="px-8 py-6 flex items-start justify-between" style={{ background: "linear-gradient(135deg,#EEE8FF,#DDD6FE)", borderBottom: "1.5px solid #DDD6FE" }}>
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}>
                  <FaCalendarAlt className="text-white" size={15} />
                </div>
                <h3 className="font-800 text-base" style={{ fontWeight: 800, color: "var(--text-1)" }}>Détails du rendez-vous</h3>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="w-9 h-9 rounded-xl flex items-center justify-center btn-ghost mt-1"><FaTimes size={14} /></button>
            </div>

            <div className="px-8 py-6 space-y-4">
              {[
                { icon: <FaUser style={{ color: "var(--violet)" }} />, bg: "#EEE8FF", label: "Patient", val: currentAppointment.patient ? `${currentAppointment.patient.nom} ${currentAppointment.patient.prenom}` : `Patient #${currentAppointment.patient_id}` },
                { icon: <FaCalendarAlt style={{ color: "#10B981" }} />, bg: "#ECFDF5", label: "Date", val: new Date(currentAppointment.clean_date || currentAppointment.appointment_date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) },
                { icon: <FaClock style={{ color: "var(--violet)" }} />, bg: "#EEE8FF", label: "Horaire", val: `${currentAppointment.start_time.substring(0, 5)} – ${currentAppointment.end_time.substring(0, 5)}` },
              ].map(({ icon, bg, label, val }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>{icon}</div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                    <p className="text-sm mt-0.5" style={{ fontWeight: 700, color: "var(--text-1)" }}>{val}</p>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#FFFBEB" }}>
                  <FaStethoscope style={{ color: "#D97706" }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--text-2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Statut</p>
                  <div className="mt-1">{getStatusBadge(currentAppointment.status)}</div>
                </div>
              </div>

              {currentAppointment.notes && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#F8F5FF" }}>
                    <FaNotesMedical style={{ color: "var(--violet)" }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Notes</p>
                    <p className="text-sm mt-0.5" style={{ color: "var(--text-1)" }}>{currentAppointment.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 pb-6 flex justify-end gap-3">
              <button onClick={() => setShowDetailsModal(false)} className="btn-ghost px-5 py-2.5 rounded-xl text-sm" style={{ fontWeight: 600 }}>Fermer</button>
              <button onClick={() => { setShowDetailsModal(false); openEditModal(currentAppointment); }} className="btn-amber px-5 py-2.5 rounded-xl text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                <FaEdit size={12} /> Modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SecretaryRendezVous;