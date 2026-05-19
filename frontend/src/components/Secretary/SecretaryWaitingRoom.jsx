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
  FaTrash,
  FaSpinner,
  FaUser,
  FaStethoscope,
  FaSearch,
  FaExclamationTriangle,
  FaUserPlus,
  FaChevronCircleDown,
  FaUserClock,
  FaUserCheck,
  FaRegClock,
  FaRegCalendarCheck,
  FaMoneyBillWave,
  FaClock,
  FaClipboardList,
  FaEnvelope,
} from "react-icons/fa";

const API_BASE_URL = "http://127.0.0.1:8000/api";
const MAX_SLOTS = 20;

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

  .btn-violet { background:linear-gradient(135deg,var(--violet),#6D28D9); color:#fff; box-shadow:0 4px 14px rgba(139,92,246,.32); transition:all .2s ease; }
  .btn-violet:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(139,92,246,.42); }
  .btn-violet:disabled { opacity:.5; transform:none; box-shadow:none; cursor:not-allowed; }
  .btn-ghost { border:1.5px solid #E2E8F0; color:#64748B; background:#fff; transition:all .18s ease; }
  .btn-ghost:hover { background:#F8FAFF; border-color:rgba(139,92,246,.3); color:var(--violet); }

  .wr-input { border:1.5px solid #E2E8F0; background:#fff; transition:all .2s ease; font-size:14px; }
  .wr-input:focus { outline:none; border-color:var(--violet); box-shadow:0 0 0 3px var(--violet-glow); }

  .stat-violet { background:linear-gradient(135deg,#EEE8FF,#DDD6FE); border:1.5px solid #DDD6FE; }
  .stat-green  { background:linear-gradient(135deg,#ECFDF5,#D1FAE5); border:1.5px solid #A7F3D0; }
  .stat-blue   { background:linear-gradient(135deg,#EEF4FF,#E0EDFF); border:1.5px solid #BFDBFE; }

  .slot-empty { background:#FAFBFF; border:2px dashed #DDD6FE; cursor:pointer; transition:all .22s cubic-bezier(.4,0,.2,1); }
  .slot-empty:hover { background:#F5F0FF; border-color:var(--violet); transform:translateY(-2px); box-shadow:0 8px 24px rgba(139,92,246,.12); }
  .slot-occupied { background:#fff; border:2px solid #DDD6FE; transition:all .22s cubic-bezier(.4,0,.2,1); cursor:default; }
  .slot-occupied:hover { border-color:var(--violet); box-shadow:0 8px 24px rgba(139,92,246,.12); transform:translateY(-2px); }
  .slot-avatar-empty { background:linear-gradient(135deg,#EEE8FF,#DDD6FE); }
  .slot-avatar-occupied { background:linear-gradient(135deg,var(--violet),#6D28D9); }
  .slot-remove { background:linear-gradient(135deg,var(--rose),#BE123C); box-shadow:0 4px 14px rgba(244,63,94,.35); transition:all .18s ease; }
  .slot-remove:hover { transform:scale(1.1); }

  .slot-tooltip { background:rgba(10,15,30,.92); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,.08); }

  .pt-dropdown { border:1.5px solid #E2E8F0; border-radius:16px; background:#fff; box-shadow:0 12px 36px rgba(6,13,31,.12); }
  .pt-row:hover { background:#F5F0FF; }
  .pt-row-selected { background:#F5F0FF; }

  .modal-overlay { background:rgba(6,13,31,.62); backdrop-filter:blur(7px); }
  .modal-box { animation:mIn .24s cubic-bezier(.4,0,.2,1); min-height: 520px; display: flex; flex-direction: column; }
  @keyframes mIn { from{opacity:0;transform:scale(.95) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);} }

  .toast-success { background:linear-gradient(135deg,#10B981,#059669); }
  .toast-error   { background:linear-gradient(135deg,#F43F5E,#BE123C); }
  .toast-item { animation:toastIn .28s cubic-bezier(.4,0,.2,1); box-shadow:0 8px 24px rgba(6,13,31,.18); }
  @keyframes toastIn { from{opacity:0;transform:translateX(60px);}to{opacity:1;transform:translateX(0);} }

  .progress-track { background:#E8EEFF; border-radius:99px; height:8px; overflow:hidden; }
  .progress-fill { background:linear-gradient(90deg,var(--violet),var(--accent)); border-radius:99px; height:8px; transition:width .6s cubic-bezier(.4,0,.2,1); }

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

function SecretaryWaitingRoom({
  allowedRole = "secretaire",
  roleLabel = "Secrétaire",
  spaceLabel = "Espace secrétariat",
  roleInitial = "S",
  navItems: customNavItems = null,
}) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [secretaryInfo, setSecretaryInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availablePatientsRaw, setAvailablePatientsRaw] = useState([]);
  const [availablePatients, setAvailablePatients] = useState([]);
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [slots, setSlots] = useState(Array(MAX_SLOTS).fill(null));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);

  const integrityInterval = useRef(null);

  const getToken = () => localStorage.getItem("token");

  const isAuthenticatedSecretary = () => {
    const token = getToken();
    const userData = localStorage.getItem("user");
    if (!token || !userData) return false;
    return JSON.parse(userData).role === allowedRole;
  };

  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: "ease-out-cubic" });
    if (!isAuthenticatedSecretary()) { navigate("/login"); return; }
    setUser(JSON.parse(localStorage.getItem("user")));

    performIntegrityCheck(navigate, null, true)
      .then(() => {
        fetchCurrentUser();
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
    if (secretaryInfo) fetchData();
  }, [secretaryInfo]);

  useEffect(() => {
    const newSlots = Array(MAX_SLOTS).fill(null);
    waitingPatients.forEach((p) => {
      if (p.slot !== null && p.slot >= 0 && p.slot < MAX_SLOTS) newSlots[p.slot] = p;
    });
    setSlots(newSlots);
  }, [waitingPatients]);

  const addToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/auth/me");
      setSecretaryInfo(response.data);
    } catch (err) {
      console.error(err);
      setSecretaryInfo(JSON.parse(localStorage.getItem("user") || "{}"));
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAppointments = async () => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const res = await api.get(`/appointments?start_date=${today}&end_date=${today}`);
      setTodayAppointments(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch today's appointments", err);
      setTodayAppointments([]);
      return [];
    }
  };

  const filterAvailablePatients = (rawPatients, appointments) => {
    if (!appointments.length) return rawPatients;
    const appointmentsMap = new Map();
    appointments.forEach((apt) => {
      appointmentsMap.set(apt.patient_id, apt.status);
    });
    return rawPatients.filter((p) => {
      const status = appointmentsMap.get(p.patient_id);
      return status === "scheduled";
    });
  };

  const fetchAvailablePatients = async () => {
    const res = await api.get("/waiting-room/available-patients");
    setAvailablePatientsRaw(res.data);
    const filtered = filterAvailablePatients(res.data, todayAppointments);
    setAvailablePatients(filtered);
  };

  const fetchWaitingPatients = async () => {
    const res = await api.get("/waiting-room");
    setWaitingPatients(res.data);
  };

  const fetchData = async () => {
    try {
      const appointments = await fetchTodayAppointments();
      const rawPatientsRes = await api.get("/waiting-room/available-patients");
      const rawPatients = rawPatientsRes.data;
      setAvailablePatientsRaw(rawPatients);
      const filtered = filterAvailablePatients(rawPatients, appointments);
      setAvailablePatients(filtered);
      const waitingRes = await api.get("/waiting-room");
      setWaitingPatients(waitingRes.data);
    } catch (err) {
      console.error(err);
      addToast("Erreur lors du chargement.", "error");
    }
  };

  const handleSlotClick = (index) => {
    if (slots[index] !== null) return;
    setSelectedSlot(index);
    setSelectedPatientId("");
    setPatientSearchTerm("");
    setPatientDropdownOpen(false);
    setModalOpen(true);
  };

  const handleAddToWaiting = async () => {
    if (!selectedPatientId) { addToast("Veuillez sélectionner un patient.", "error"); return; }
    const selected = availablePatients.find((p) => p.patient_id === parseInt(selectedPatientId));
    if (!selected) return;
    setSubmitting(true);
    try {
      await api.post("/waiting-room", {
        patient_id: selected.patient_id,
        appointment_id: selected.appointment_id,
        slot: selectedSlot,
      });
      addToast("Patient ajouté à la salle d'attente");
      setModalOpen(false);
      await fetchData();
    } catch (err) {
      addToast(err.response?.data?.error || "Erreur lors de l'ajout", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveFromWaiting = async (id) => {
    try {
      await api.delete(`/waiting-room/${id}`);
      addToast("Patient retiré de la salle d'attente");
      await fetchData();
    } catch (err) {
      addToast(err.response?.data?.error || "Erreur retrait", "error");
    }
  };

  const handleLogout = () => {
    if (integrityInterval.current) clearInterval(integrityInterval.current);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userIntegrityHash");
    navigate("/login");
  };

  const filteredPatients = availablePatients.filter((p) =>
    p.patient_name.toLowerCase().includes(patientSearchTerm.toLowerCase())
  );

  const formatArrivalTime = (ds) =>
    new Date(ds).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const occupancyPct = ((waitingPatients.length / MAX_SLOTS) * 100).toFixed(0);

  const navItems = customNavItems || [
    { to: "/secretariatdb", icon: <FaHome />, label: "Tableau de bord" },
    { to: "/secpatients", icon: <FaUserInjured />, label: "Patients" },
    { to: "/seccreatepatient", icon: <FaUserPlus />, label: "Comptes patients" },
    { to: "/secretaryRendezvous", icon: <FaCalendarCheck />, label: "Rendez-vous" },
    { to: "/sectasks", icon: <FaClipboardList />, label: "Tâches"},
    { to: "/secwaiting", icon: <FaUserClock />, label: "Salle d'attente", active: true  },
    { to: "/secpay", icon: <FaMoneyBillWave />, label: "Paiements"},
    { to: "/secmail", icon: <FaEnvelope />, label: "Messagerie" },
    { to: "/secsettings", icon: <FaCog />, label: "Paramètres" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "linear-gradient(135deg,#060D1F,#0C1A3A)" }}>
        <style>{G}</style><FontInjector />
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 wr-logo-ring">
            <FaUserClock className="text-white text-2xl" />
          </div>
          <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-sm" style={{ color: "#94A3B8" }}>Chargement de la salle d'attente…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface)" }}>
      <style>{G}</style><FontInjector />

      <div className="fixed top-5 right-5 z-[60] space-y-2 w-80">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item rounded-2xl px-4 py-3 flex items-center justify-between text-white ${t.type === "success" ? "toast-success" : "toast-error"}`}>
            <div className="flex items-center gap-2.5 text-sm" style={{ fontWeight: 600 }}>
              {t.type === "success" ? <FaUserCheck size={14} /> : <FaExclamationTriangle size={14} />}
              {t.message}
            </div>
            <button onClick={() => removeToast(t.id)} className="ml-3 hover:opacity-70 transition-opacity"><FaTimes size={13} /></button>
          </div>
        ))}
      </div>

      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center text-white rounded-r-xl wr-toggle">
        {sidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
      </button>

      <aside className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 transition-transform duration-300 z-40 w-64 flex flex-col wr-sidebar`}>
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center wr-logo-ring flex-shrink-0">
              <FaStethoscope className="text-white text-base" />
            </div>
            <div>
              <h1 className="text-white text-lg" style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Cabi Doc</h1>
              <p className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>{spaceLabel}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className={`wr-nav-link flex items-center gap-3 px-4 py-3 rounded-xl ${item.active ? "active" : ""}`}
              style={{ fontWeight: item.active ? 600 : 500 }}>
              <span style={{ opacity: item.active ? 1 : 0.65 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 m-3 rounded-2xl" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0 wr-logo-ring" style={{ fontWeight: 700 }}>
              {secretaryInfo?.name?.charAt(0) || user?.name?.charAt(0) || roleInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate" style={{ fontWeight: 600 }}>{secretaryInfo?.name || user?.name || roleLabel}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>{roleLabel}</p>
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

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8 gap-4" data-aos="fade-down">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", boxShadow: "0 4px 14px rgba(139,92,246,.35)" }}>
                  <FaUserClock size={14} />
                </div>
                <h2 className="text-2xl" style={{ fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.03em" }}>Salle d'attente</h2>
              </div>
              <p className="text-sm ml-11 capitalize" style={{ color: "var(--text-2)" }}>
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: "#fff", border: "1.5px solid var(--border)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs wr-logo-ring" style={{ fontWeight: 700 }}>
                  {secretaryInfo?.name?.charAt(0) || user?.name?.charAt(0) || "S"}
                </div>
                <span className="hidden sm:inline text-sm" style={{ fontWeight: 600, color: "var(--text-1)" }}>{secretaryInfo?.name || user?.name || roleLabel}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" data-aos="fade-up">
            <div className="stat-violet rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.7)" }}>
                  <FaUserClock style={{ color: "#5B21B6" }} size={18} />
                </div>
                <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,.6)", color: "#5B21B6", fontWeight: 700 }}>
                  {MAX_SLOTS} places total
                </span>
              </div>
              <p className="text-xs mb-0.5 uppercase tracking-wider" style={{ color: "#5B21B6", fontWeight: 600, letterSpacing: "0.08em" }}>En attente</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.04em" }}>{waitingPatients.length}</p>
            </div>

            <div className="stat-green rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.7)" }}>
                  <FaRegCalendarCheck style={{ color: "#059669" }} size={18} />
                </div>
                <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,.6)", color: "#059669", fontWeight: 700 }}>
                  Libres
                </span>
              </div>
              <p className="text-xs mb-0.5 uppercase tracking-wider" style={{ color: "#059669", fontWeight: 600, letterSpacing: "0.08em" }}>Places disponibles</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.04em" }}>{MAX_SLOTS - waitingPatients.length}</p>
            </div>

            <div className="stat-blue rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.7)" }}>
                  <FaRegClock style={{ color: "#1E40AF" }} size={18} />
                </div>
                <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,.6)", color: "#1E40AF", fontWeight: 700 }}>
                  Taux
                </span>
              </div>
              <p className="text-xs mb-0.5 uppercase tracking-wider" style={{ color: "#1E40AF", fontWeight: 600, letterSpacing: "0.08em" }}>Occupation</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.04em" }}>{occupancyPct}%</p>
              <div className="progress-track mt-3">
                <div className="progress-fill" style={{ width: `${occupancyPct}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ border: "1.5px solid var(--border)", boxShadow: "0 4px 24px rgba(6,13,31,.06)" }} data-aos="fade-up">
            <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: "1.5px solid #F0EEFF" }}>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 rounded-full" style={{ background: "linear-gradient(180deg,var(--violet),var(--accent))" }} />
                <div>
                  <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>Occupation de la salle</p>
                  <p className="text-xs" style={{ color: "var(--text-2)" }}>Cliquez sur une place vide pour ajouter un patient</p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-xl text-xs" style={{ background: "#EEE8FF", color: "#5B21B6", border: "1px solid #DDD6FE", fontWeight: 700 }}>
                {waitingPatients.length} / {MAX_SLOTS} places
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
              {slots.map((slot, index) => {
                const isOccupied = slot !== null;
                const patient = slot?.patient;
                const appointment = slot?.appointment;
                const isHovered = hoveredSlot === index;

                return (
                  <div
                    key={index}
                    className={`relative rounded-2xl ${isOccupied ? "slot-occupied" : "slot-empty"}`}
                    onClick={() => !isOccupied && handleSlotClick(index)}
                    onMouseEnter={() => setHoveredSlot(index)}
                    onMouseLeave={() => setHoveredSlot(null)}
                  >
                    <div className="p-4 flex flex-col items-center text-center">
                      <span className="text-xs px-2 py-0.5 rounded-lg mb-3" style={{
                        fontWeight: 700,
                        background: isOccupied ? "#EEE8FF" : "#F0F4FF",
                        color: isOccupied ? "#5B21B6" : "var(--text-2)",
                      }}>
                        #{index + 1}
                      </span>

                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${isOccupied ? "slot-avatar-occupied" : "slot-avatar-empty"}`}
                        style={{ boxShadow: isOccupied ? "0 4px 14px rgba(139,92,246,.3)" : "none" }}
                      >
                        {isOccupied ? (
                          <span className="text-white text-lg" style={{ fontWeight: 800 }}>
                            {patient?.prenom?.charAt(0)}{patient?.nom?.charAt(0)}
                          </span>
                        ) : (
                          <FaUserPlus size={20} style={{ color: "#A78BFA" }} />
                        )}
                      </div>

                      {isOccupied && (
                        <>
                          <p className="text-xs w-full truncate" style={{ fontWeight: 700, color: "var(--text-1)" }}>
                            {patient?.prenom} {patient?.nom}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <FaClock size={9} style={{ color: "var(--text-2)" }} />
                            <span className="text-xs" style={{ color: "var(--text-2)", fontWeight: 500 }}>
                              {formatArrivalTime(slot.arrived_at)}
                            </span>
                          </div>
                        </>
                      )}

                      {!isOccupied && (
                        <p className="text-xs" style={{ color: "#A78BFA", fontWeight: 500 }}>Ajouter</p>
                      )}
                    </div>

                    {isOccupied && isHovered && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveFromWaiting(slot.id); }}
                        className="slot-remove absolute -top-2 -right-2 w-7 h-7 rounded-xl flex items-center justify-center text-white"
                        title="Retirer"
                      >
                        <FaTrash size={11} />
                      </button>
                    )}

                    {isOccupied && isHovered && (
                      <div className="slot-tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-3 py-2.5 rounded-xl z-20 text-left w-48">
                        <p className="text-white text-xs mb-1" style={{ fontWeight: 700 }}>{patient?.nom} {patient?.prenom}</p>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,.6)" }}>
                          Motif : {appointment?.notes || "Non spécifié"}
                        </p>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,.6)" }}>
                          Arrivé à {formatArrivalTime(slot.arrived_at)}
                        </p>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderTopColor: "rgba(10,15,30,.92)" }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-6 mt-6 pt-4" style={{ borderTop: "1.5px solid #F0EEFF" }}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg slot-avatar-occupied" />
                <span className="text-xs" style={{ color: "var(--text-2)", fontWeight: 500 }}>Occupé</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg slot-avatar-empty" />
                <span className="text-xs" style={{ color: "var(--text-2)", fontWeight: 500 }}>Disponible</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <FaUserClock size={11} style={{ color: "var(--violet)" }} />
                <span className="text-xs" style={{ color: "var(--text-2)", fontWeight: 500 }}>Survolez pour voir les détails</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-8 py-6" style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <FaUserPlus className="text-white" size={16} />
                </div>
                <button onClick={() => setModalOpen(false)} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-all">
                  <FaTimes size={14} />
                </button>
              </div>
              <h3 className="text-white text-lg" style={{ fontWeight: 800 }}>Ajouter un patient</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/60 text-xs">Place</span>
                <span className="px-2 py-0.5 rounded-lg text-xs text-white" style={{ background: "rgba(255,255,255,.2)", fontWeight: 700 }}>#{selectedSlot + 1}</span>
              </div>
            </div>

            <div className="px-8 py-6 pb-12">
              <label className="block text-xs mb-2 uppercase tracking-wider" style={{ color: "var(--text-2)", fontWeight: 600, letterSpacing: "0.07em" }}>
                Patient <span style={{ color: "var(--rose)" }}>*</span>
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPatientDropdownOpen(!patientDropdownOpen)}
                  className="w-full p-3 rounded-xl text-sm text-left flex justify-between items-center wr-input"
                >
                  <span style={{ color: selectedPatientId ? "var(--text-1)" : "#94A3B8", fontWeight: selectedPatientId ? 600 : 400 }}>
                    {selectedPatientId
                      ? availablePatients.find((p) => p.patient_id === parseInt(selectedPatientId))?.patient_name
                      : "Choisir un patient avec RDV aujourd'hui"}
                  </span>
                  <FaChevronCircleDown size={14} style={{ color: "#94A3B8", transform: patientDropdownOpen ? "rotate(180deg)" : "none", transition: ".2s" }} />
                </button>

                {patientDropdownOpen && (
                  <div className="absolute z-20 mt-1.5 w-full pt-dropdown overflow-hidden">
                    <div className="p-2.5" style={{ borderBottom: "1.5px solid #F0EEFF" }}>
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={12} style={{ color: "#94A3B8" }} />
                        <input
                          type="text"
                          placeholder="Rechercher par nom…"
                          value={patientSearchTerm}
                          onChange={(e) => setPatientSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 rounded-xl text-sm wr-input"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-56">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((p) => (
                          <button
                            key={p.appointment_id}
                            type="button"
                            onClick={() => { setSelectedPatientId(p.patient_id.toString()); setPatientDropdownOpen(false); }}
                            className={`pt-row w-full text-left px-4 py-3 transition-all ${selectedPatientId === p.patient_id.toString() ? "pt-row-selected" : ""}`}
                            style={{ borderBottom: "1px solid #F8F5FF" }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm" style={{ fontWeight: 600, color: "var(--text-1)" }}>{p.patient_name}</span>
                              {selectedPatientId === p.patient_id.toString() && (
                                <span className="text-xs" style={{ color: "var(--violet)", fontWeight: 700 }}>✓</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg" style={{ background: "#EEE8FF", color: "#5B21B6", fontWeight: 600 }}>
                                <FaClock size={8} /> {p.time}
                              </span>
                              {p.reason && <span className="text-xs truncate" style={{ color: "var(--text-2)" }}>{p.reason}</span>}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="py-10 text-center">
                          <FaUser className="mx-auto mb-2" size={28} style={{ color: "#DDD6FE" }} />
                          <p className="text-sm" style={{ color: "var(--text-2)", fontWeight: 600 }}>Aucun patient disponible</p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>Tous les patients sont déjà en salle d'attente</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {selectedPatientId && (
                <div className="mt-4 rounded-xl p-4 flex items-center gap-3" style={{ background: "#F5F0FF", border: "1.5px solid #DDD6FE" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0" style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", fontWeight: 700 }}>
                    {availablePatients.find((p) => p.patient_id === parseInt(selectedPatientId))?.patient_name?.charAt(0) || "P"}
                  </div>
                  <div>
                    <p className="text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>
                      {availablePatients.find((p) => p.patient_id === parseInt(selectedPatientId))?.patient_name}
                    </p>
                    <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "#5B21B6" }}>
                      <FaUserCheck size={10} /> Patient sélectionné · Place #{selectedSlot + 1}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 pb-60 pt-2 flex gap-3">
              <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1 py-3 rounded-xl text-sm" style={{ fontWeight: 600 }}>
                Annuler
              </button>
              <button
                onClick={handleAddToWaiting}
                disabled={submitting || !selectedPatientId}
                className="btn-violet flex-1 py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                style={{ fontWeight: 600 }}
              >
                {submitting ? <FaSpinner className="animate-spin" size={13} /> : <><FaPlus size={12} /> Ajouter</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SecretaryWaitingRoom;