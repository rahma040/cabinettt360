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
  FaBell,
  FaUserPlus,
  FaUserClock,
  FaChartLine,
  FaTasks,
  FaStethoscope,
  FaBars,
  FaTimes,
  FaSync,
  FaQuestionCircle,
  FaGraduationCap,
  FaArrowRight,
  FaEnvelope,
  FaLightbulb,
  FaCheckCircle,
  FaHeadset,
  FaTimesCircle,
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
    --surface:     #F0F4FF;
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

  .tut-hero {
    background: linear-gradient(135deg, #060D1F 0%, #0f2760 40%, #0C1A3A 100%);
    border-radius: 28px;
    position: relative;
    overflow: hidden;
    padding: 44px 40px;
  }
  .tut-hero-dots {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 28px 28px;
  }
  .tut-hero-glow-1 {
    position: absolute;
    top: -80px; right: -80px;
    width: 280px; height: 280px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59,126,248,0.3) 0%, transparent 65%);
  }
  .tut-hero-glow-2 {
    position: absolute;
    bottom: -50px; left: 20px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(14,205,181,0.18) 0%, transparent 65%);
  }

  .step-badge {
    width: 26px; height: 26px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--accent), #2563EB);
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .tut-card {
    background: #fff;
    border-radius: 22px;
    border: 1.5px solid #E8EEFF;
    padding: 22px;
    display: flex;
    flex-direction: column;
    transition: all .22s cubic-bezier(.4,0,.2,1);
    position: relative;
    overflow: hidden;
    text-decoration: none;
    cursor: pointer;
  }
  .tut-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--card-from, var(--accent)), var(--card-to, var(--teal)));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform .25s ease;
    border-radius: 22px 22px 0 0;
  }
  .tut-card:hover {
    border-color: transparent;
    box-shadow: 0 16px 48px rgba(59,126,248,0.14);
    transform: translateY(-4px);
  }
  .tut-card:hover::after { transform: scaleX(1); }

  .tut-card-icon {
    width: 48px; height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
    flex-shrink: 0;
    transition: transform .2s ease;
  }
  .tut-card:hover .tut-card-icon { transform: scale(1.08); }

  .tut-card-arrow {
    margin-top: auto;
    padding-top: 14px;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 700;
    color: var(--accent);
    transition: gap .2s ease;
  }
  .tut-card:hover .tut-card-arrow { gap: 8px; }

  .tips-card {
    background: #fff;
    border-radius: 24px;
    border: 1.5px solid var(--border);
    box-shadow: 0 4px 24px rgba(59,126,248,0.04);
  }
  .tip-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px solid #F5F3FF;
  }
  .tip-item:last-child { border-bottom: none; }
  .tip-dot {
    width: 26px; height: 26px;
    border-radius: 8px;
    background: linear-gradient(135deg, #EEF4FF, #DBEAFE);
    border: 1.5px solid #BFDBFE;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .tut-progress-wrap {
    background: #E8EEFF;
    border-radius: 99px;
    height: 6px;
    overflow: hidden;
    margin-top: 10px;
  }
  .tut-progress-fill {
    height: 6px;
    border-radius: 99px;
    background: linear-gradient(90deg, var(--accent), var(--teal));
    transition: width .5s ease;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(6,13,31,0.85);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .modal-container {
    background: #fff;
    border-radius: 28px;
    max-width: 900px;
    width: 100%;
    overflow: hidden;
    box-shadow: 0 32px 64px rgba(0,0,0,0.3);
    animation: modalFadeIn 0.2s ease;
  }
  @keyframes modalFadeIn {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: var(--navy);
    color: white;
  }
  .modal-header h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }
  .modal-close {
    background: rgba(255,255,255,0.1);
    border: none;
    border-radius: 40px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    transition: all 0.2s;
  }
  .modal-close:hover {
    background: rgba(255,255,255,0.25);
  }
  .modal-body {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    background: #000;
  }
  .modal-body iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(59,126,248,.25); border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(59,126,248,.45); }
`;

const CARD_COLORS = [
  { from: "#3B7EF8", to: "#2563EB", bg: "linear-gradient(135deg,#EEF4FF,#DBEAFE)", iconColor: "#1D4ED8" },
  { from: "#10B981", to: "#059669", bg: "linear-gradient(135deg,#ECFDF5,#D1FAE5)", iconColor: "#065F46" },
  { from: "#F59E0B", to: "#D97706", bg: "linear-gradient(135deg,#FFFBEB,#FEF3C7)", iconColor: "#92400E" },
  { from: "#8B5CF6", to: "#7C3AED", bg: "linear-gradient(135deg,#EEE8FF,#DDD6FE)", iconColor: "#5B21B6" },
  { from: "#F43F5E", to: "#E11D48", bg: "linear-gradient(135deg,#FFF1F2,#FFE4E6)", iconColor: "#9F1239" },
  { from: "#0ECDB5", to: "#0891B2", bg: "linear-gradient(135deg,#F0FDFA,#CCFBF1)", iconColor: "#0F766E" },
  { from: "#3B7EF8", to: "#8B5CF6", bg: "linear-gradient(135deg,#EEF4FF,#EEE8FF)", iconColor: "#4338CA" },
  { from: "#F59E0B", to: "#F43F5E", bg: "linear-gradient(135deg,#FFFBEB,#FFF1F2)", iconColor: "#B45309" },
  { from: "#10B981", to: "#3B7EF8", bg: "linear-gradient(135deg,#ECFDF5,#EEF4FF)", iconColor: "#0369A1" },
];

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

const DoctorTutorial = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const integrityInterval = useRef(null);

  const navItems = [
    { to: "/docdb", icon: <FaHome />, label: "Tableau de bord" },
    { to: "/patients", icon: <FaUserInjured />, label: "Patients" },
    { to: "/prescription", icon: <FaFileMedical />, label: "Ordonnance" },
    { to: "/rendezvous", icon: <FaCalendarCheck />, label: "Rendez-vous" },
    { to: "/docwaiting", icon: <FaUserClock />, label: "Salle d'attente" },
    { to: "/createsec", icon: <FaUserPlus />, label: "Secrétaire" },
    { to: "/docstats", icon: <FaChartLine />, label: "Statistiques" },
    { to: "/doctasks", icon: <FaTasks />, label: "Tâches" },
    { to: "/docmail", icon: <FaEnvelope />, label: "Communication" },
    { to: "/doctuto", icon: <FaGraduationCap />, label: "Tutoriel", active: true },
    { to: "/docsettings", icon: <FaCog />, label: "Paramètres" },
  ];

  const pages = [
    {
      to: "/docdb",
      icon: <FaHome size={20} />,
      title: "Tableau de bord",
      description:
        "Aperçu global : KPI clés (patients, visites, chiffre d'affaires), rendez-vous récents, salle d'attente en temps réel et graphiques de répartition.",
    },
    {
      to: "/docmail",
      icon: <FaEnvelope size={20} />,
      title: "Communication",
      description:
        "Envoyez des messages sécurisés avec pièces jointes PDF à vos confrères ou patients. Consultez et téléchargez l'historique complet.",
    },
    {
      to: "/patients",
      icon: <FaUserInjured size={20} />,
      title: "Patients",
      description:
        "Gestion complète du fichier patient : ajout, modification, historique médical, antécédents et notes. Recherche rapide intégrée.",
    },
    {
      to: "/prescription",
      icon: <FaFileMedical size={20} />,
      title: "Prescription",
      description:
        "Créez, éditez et imprimez des ordonnances numériques. Utilisez des modèles ou créez des prescriptions avec posologie et durée.",
    },
    {
      to: "/rendezvous",
      icon: <FaCalendarCheck size={20} />,
      title: "Rendez-vous",
      description:
        "Calendrier des consultations : planifier, modifier ou annuler des rendez-vous. Vue jour / semaine / mois avec gestion des créneaux.",
    },
    {
      to: "/docwaiting",
      icon: <FaUserClock size={20} />,
      title: "Salle d'attente",
      description:
        "Suivi en direct des patients en attente. Marquez l'arrivée, débutez une consultation ou transférez en salle virtuelle.",
    },
    {
      to: "/createsec",
      icon: <FaUserPlus size={20} />,
      title: "Secrétaire",
      description:
        "Gestion des comptes secrétaires : ajouter, désactiver ou modifier les droits pour la gestion des patients et rendez-vous.",
    },
    {
      to: "/docstats",
      icon: <FaChartLine size={20} />,
      title: "Statistiques",
      description:
        "Analyses détaillées : évolution des consultations, répartition des paiements, durée moyenne des visites et rapports exportables.",
    },
    {
      to: "/doctasks",
      icon: <FaTasks size={20} />,
      title: "Tâches",
      description:
        "Gestion des tâches quotidiennes : planification, suivi, rappels et attribution des tâches aux secrétaires.",
    },
  ];

  const videoMapping = {
    "Tableau de bord": "https://www.youtube.com/embed/ACHErLy_yY0",
    "Communication": "https://www.youtube.com/embed/jwIkB7RkEoU",
    "Patients": "https://www.youtube.com/embed/hZJEjUR_p-4",
    "Prescription": "https://www.youtube.com/embed/xA5bxTkkRUM",
    "Rendez-vous": "https://www.youtube.com/embed/_yG3mFFva9Q",
    "Salle d'attente": "https://www.youtube.com/embed/u3TDlyPr8dc",
    "Secrétaire": "https://www.youtube.com/embed/hFmU3Wf6Zqo",
    "Statistiques": "https://www.youtube.com/embed/LZn7gLTqxKQ",
    "Tâches": "https://www.youtube.com/embed/Slf108UjZvo",
  };

  const tips = [
    {
      icon: <FaSync size={12} style={{ color: "var(--accent)" }} />,
      text: "Utilisez le bouton Actualiser (icône de synchronisation) pour recharger les données en temps réel à tout moment.",
    },
    {
      icon: <FaCheckCircle size={12} style={{ color: "var(--emerald)" }} />,
      text: "Consultez régulièrement la salle d'attente pour réduire le temps d'attente et améliorer l'expérience patient.",
    },
    {
      icon: <FaHeadset size={12} style={{ color: "var(--violet)" }} />,
      text: "Un bouton d'assistance technique (icône tech) se trouve à côté de votre nom dans l'en-tête. Cliquez dessus pour envoyer un message direct à l'administrateur.",
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { navigate("/login"); return; }
    const parsed = JSON.parse(userData);
    if (parsed.role !== "medecin") { navigate("/dashboard"); return; }
    setUser(parsed);

    performIntegrityCheck(navigate, null, true)
      .then(() => setLoading(false))
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
    const handleEsc = (e) => {
      if (e.key === "Escape" && modalOpen) {
        setModalOpen(false);
        setCurrentVideoUrl("");
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [modalOpen]);

  const handleLogout = () => {
    if (integrityInterval.current) clearInterval(integrityInterval.current);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userIntegrityHash");
    navigate("/login");
  };

  const openVideoForTitle = (title) => {
    const videoUrl = videoMapping[title];
    if (videoUrl) {
      setCurrentVideoUrl(videoUrl);
      setModalOpen(true);
    } else {
      alert(`Aucune vidéo tutoriel disponible pour "${title}"`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen"
        style={{ background: "linear-gradient(135deg,#060D1F,#0C1A3A)" }}>
        <style>{G}</style>
        <FontInjector />
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 db-logo-ring">
            <FaStethoscope className="text-white text-2xl" />
          </div>
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-sm" style={{ color: "#94A3B8" }}>Chargement du tutoriel…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface)" }}>
      <style>{G}</style>
      <FontInjector />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center text-white rounded-r-xl db-toggle"
      >
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
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all hover:bg-red-500/20"
            style={{ color: "rgba(255,255,255,.5)", fontWeight: 500 }}>
            <FaSignOutAlt size={12} /> Déconnexion
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden"
          style={{ background: "rgba(6,13,31,.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 pt-14 lg:pt-8 max-w-7xl mx-auto">

          <div className="tut-hero mb-8">
            <div className="tut-hero-dots" />
            <div className="tut-hero-glow-1" />
            <div className="tut-hero-glow-2" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "rgba(59,126,248,0.2)", border: "1px solid rgba(59,126,248,0.35)",
                  borderRadius: 99, padding: "4px 14px",
                  fontSize: 11, fontWeight: 700, color: "#93C5FD",
                  textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12,
                }}>
                  <FaGraduationCap size={10} /> Guide d'utilisation
                </div>
                <h2 className="text-white" style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 8 }}>
                  Bienvenue dans Cabi Doc
                </h2>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, maxWidth: 420, lineHeight: 1.6 }}>
                  Découvrez toutes les fonctionnalités de votre espace médecin. Cliquez sur une section pour y accéder directement.
                </p>
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>
                      {pages.length} sections disponibles
                    </span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>100%</span>
                  </div>
                  <div className="tut-progress-wrap" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <div className="tut-progress-fill" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
                {[
                  { label: "Sections", value: pages.length, color: "#93C5FD" },
                  { label: "Conseils", value: tips.length, color: "#6EE7B7" },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 14, padding: "12px 20px",
                    display: "flex", alignItems: "center", gap: 14,
                    backdropFilter: "blur(8px)",
                  }}>
                    <p style={{ color: s.color, fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {pages.map((page, idx) => {
              const color = CARD_COLORS[idx % CARD_COLORS.length];
              return (
                <div
                  key={idx}
                  className="tut-card"
                  onClick={() => openVideoForTitle(page.title)}
                  style={{
                    "--card-from": color.from,
                    "--card-to": color.to,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="tut-card-icon" style={{ background: color.bg }}>
                      <span style={{ color: color.iconColor }}>{page.icon}</span>
                    </div>
                    <div className="step-badge">{idx + 1}</div>
                  </div>

                  <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-1)", marginBottom: 8, letterSpacing: "-0.02em" }}>
                    {page.title}
                  </h4>
                  <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65, flex: 1 }}>
                    {page.description}
                  </p>

                  <div className="tut-card-arrow" style={{ color: color.from }}>
                    <span>Regarder la vidéo</span>
                    <FaArrowRight size={10} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="tips-card">
            <div style={{ padding: "22px 24px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: "linear-gradient(135deg,#FFFBEB,#FEF3C7)",
                  border: "1.5px solid #FDE68A",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FaLightbulb size={14} style={{ color: "var(--amber)" }} />
                </div>
                <div>
                  <p style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em" }}>
                    Conseils rapides
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-2)" }}>Pour tirer le meilleur de Cabi Doc</p>
                </div>
              </div>
            </div>
            <hr style={{ border: "none", borderTop: "1.5px solid #F5F3FF", margin: "14px 0 0 0" }} />
            <div style={{ padding: "8px 24px 20px" }}>
              {tips.map((tip, i) => (
                <div key={i} className="tip-item">
                  <div className="tip-dot">{tip.icon}</div>
                  <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{tip.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => { setModalOpen(false); setCurrentVideoUrl(""); }}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Vidéo tutorielle</h3>
              <button className="modal-close" onClick={() => { setModalOpen(false); setCurrentVideoUrl(""); }}>
                <FaTimesCircle size={18} />
              </button>
            </div>
            <div className="modal-body">
              <iframe
                src={currentVideoUrl}
                title="YouTube tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorTutorial;