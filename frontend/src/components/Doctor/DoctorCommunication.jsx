import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome, FaUserInjured, FaCalendarCheck, FaFileMedical, FaCog, FaSignOutAlt,
  FaUserPlus, FaUserClock, FaChartLine, FaTasks, FaStethoscope, FaBars, FaTimes,
  FaSpinner, FaRobot, FaEnvelope,
} from "react-icons/fa";
import MessengerInterface from "../Messaging/MessengerInterface";
import DoctorAssistantChat from "./DoctorAssistantChat";

const api = axios.create({ baseURL: "http://127.0.0.1:8000/api" });
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

const DoctorCommunication = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("medecin");
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState("assistant");
  const integrityInterval = useRef(null);
  const touchStartX = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isDoctor = userRole === "medecin";

  useEffect(() => {
    setActivePanel(isDoctor ? "assistant" : "messages");
  }, [isDoctor]);

  const navItems = isDoctor
    ? [
        { to: "/docdb", icon: <FaHome />, label: "Tableau de bord" },
        { to: "/patients", icon: <FaUserInjured />, label: "Patients" },
        { to: "/rendezvous", icon: <FaCalendarCheck />, label: "Rendez-vous" },
        { to: "/prescription", icon: <FaFileMedical />, label: "Ordonnance" },
        { to: "/doctasks", icon: <FaTasks />, label: "Tâches" },
        { to: "/docmail", icon: <FaEnvelope />, label: "Messagerie", active: true },
        { to: "/docsettings", icon: <FaCog />, label: "Paramètres" },
      ]
    : [
        { to: "/secretariatdb", icon: <FaHome />, label: "Tableau de bord" },
        { to: "/secpatients", icon: <FaUserInjured />, label: "Patients" },
        { to: "/secretaryRendezvous", icon: <FaCalendarCheck />, label: "Rendez-vous" },
        { to: "/secwaiting", icon: <FaUserPlus />, label: "Salle d'attente" },
        { to: "/secmail", icon: <FaEnvelope />, label: "Messagerie", active: true },
        { to: "/secsettings", icon: <FaCog />, label: "Paramètres" },
      ];

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches?.[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    if (!isDoctor || touchStartX.current === null) {
      return;
    }

    const endX = event.changedTouches?.[0]?.clientX;
    if (typeof endX !== "number") {
      touchStartX.current = null;
      return;
    }

    const deltaX = endX - touchStartX.current;
    const threshold = 60;

    if (deltaX < -threshold) {
      setActivePanel("messages");
    } else if (deltaX > threshold) {
      setActivePanel("assistant");
    }

    touchStartX.current = null;
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const parsed = JSON.parse(userData);
    if (!["medecin", "secretaire"].includes(parsed.role)) {
      navigate("/dashboard");
      return;
    }

    setUserRole(parsed.role);
    setUser(parsed);
    performIntegrityCheckAsync(navigate, null, true)
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        navigate("/login");
      });

    integrityInterval.current = setInterval(() => {
      performIntegrityCheckAsync(navigate, null, false);
    }, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        performIntegrityCheckAsync(navigate, null, false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (integrityInterval.current) clearInterval(integrityInterval.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [navigate]);

  const performIntegrityCheckAsync = async (navigate, setError, isInitial = false) => {
    const token = localStorage.getItem("token");
    const storedUserRaw = localStorage.getItem("user");
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
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userIntegrityHash");
        navigate("/accessdenied");
      }
    } catch (err) {
      console.error("Integrity check failed", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userIntegrityHash");
      navigate("/accessdenied");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen"
        style={{ background: "linear-gradient(135deg,#060D1F,#0C1A3A)" }}>
        <style>{`
          .db-logo-ring { background: linear-gradient(135deg,#3B7EF8,#2563EB); }
        `}</style>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 db-logo-ring">
            <FaStethoscope className="text-white text-2xl" />
          </div>
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-sm" style={{ color: "#94A3B8" }}>Chargement...</span>
        </div>
      </div>
    );
  }

  if (!isDoctor) {
    return <MessengerInterface navItems={navItems} isDoctor={false} userRoleLabel="Secrétaire" roleInitial="S" spaceLabel="Espace secrétariat" user={user} />;
  }

  const handleLogout = () => {
    if (integrityInterval.current) clearInterval(integrityInterval.current);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userIntegrityHash");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-100 overflow-hidden">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center text-white rounded-r-xl"
        style={{ background: "linear-gradient(135deg,#3B7EF8,#2563EB)", boxShadow: "0 4px 14px rgba(59,126,248,.4)" }}
      >
        {sidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
      </button>

      <aside className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 transition-transform duration-300 z-40 w-64 flex flex-col`} style={{ background: "linear-gradient(180deg,#060D1F 0%,#0C1A3A 60%,#122048 100%)" }}>
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#3B7EF8,#2563EB)" }}>
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
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${item.active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
              style={{ fontWeight: item.active ? 600 : 500 }}
            >
              <span style={{ opacity: item.active ? 1 : 0.65 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 m-3 rounded-2xl" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0" style={{ background: "linear-gradient(135deg,#3B7EF8,#2563EB)", fontWeight: 700 }}>
              {user?.name?.charAt(0) || "D"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate" style={{ fontWeight: 600 }}>Dr. {user?.name}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>Médecin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all hover:bg-red-500/20"
            style={{ color: "rgba(255,255,255,.5)", fontWeight: 500, border: "none", background: "transparent", cursor: "pointer" }}
          >
            <FaSignOutAlt size={12} /> Déconnexion
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 lg:hidden" style={{ background: "rgba(6,13,31,.5)", backdropFilter: "blur(4px)" }} onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Communication</p>
              <h1 className="text-lg font-bold text-slate-900">Assistant IA et messagerie du cabinet</h1>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActivePanel("assistant")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activePanel === "assistant" ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Assistant IA
              </button>
              <button
                type="button"
                onClick={() => setActivePanel("messages")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activePanel === "messages" ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Messagerie
              </button>
            </div>
          </div>

          <div
            className="rounded-3xl border border-slate-200 bg-white shadow-lg overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ minHeight: "calc(100vh - 180px)" }}
          >
            {activePanel === "assistant" ? (
              <div className="h-full min-h-[calc(100vh-180px)]">
                <DoctorAssistantChat />
              </div>
            ) : (
              <div className="h-full min-h-[calc(100vh-180px)]">
                <MessengerInterface
                  navItems={navItems}
                  isDoctor
                  userRoleLabel="Médecin"
                  roleInitial="D"
                  spaceLabel="Espace médecin"
                  user={user}
                  embedded
                  showSidebar={false}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorCommunication;
