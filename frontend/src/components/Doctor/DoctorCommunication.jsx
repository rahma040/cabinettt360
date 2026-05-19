import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

  return (
    <div className="min-h-screen bg-slate-100">
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
          className="rounded-3xl border border-slate-200 bg-white shadow-lg"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {activePanel === "assistant" ? (
            <div className="flex min-h-[calc(100vh-180px)] overflow-hidden">
              <aside className="hidden w-64 flex-col border-r border-slate-200 bg-slate-900 lg:flex">
                <div className="px-6 pt-8 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                      <FaStethoscope className="text-white text-base" />
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold tracking-tight text-white">Cabi Doc</h2>
                      <p className="text-xs text-white/40">Espace médecin</p>
                    </div>
                  </div>
                </div>

                <nav className="flex-1 space-y-0.5 px-3 pb-4">
                  {navItems.map((item) => (
                    <a
                      key={item.to}
                      href={item.to}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white ${item.active ? "bg-white/10 text-white" : ""}`}
                    >
                      <span className="text-white/80">{item.icon}</span>
                      <span>{item.label}</span>
                    </a>
                  ))}
                </nav>

                <div className="m-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
                      {user?.name?.charAt(0) || "D"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">Dr. {user?.name}</p>
                      <p className="text-xs text-white/40">Médecin</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      localStorage.removeItem("userIntegrityHash");
                      navigate("/login");
                    }}
                    className="flex w-full items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-white/60 transition hover:bg-red-500/20 hover:text-white"
                    type="button"
                  >
                    <FaSignOutAlt size={12} /> Déconnexion
                  </button>
                </div>
              </aside>

              <div className="flex-1 min-w-0">
                <DoctorAssistantChat />
              </div>
            </div>
          ) : (
            <MessengerInterface
              navItems={navItems}
              isDoctor
              userRoleLabel="Médecin"
              roleInitial="D"
              spaceLabel="Espace médecin"
              user={user}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorCommunication;
