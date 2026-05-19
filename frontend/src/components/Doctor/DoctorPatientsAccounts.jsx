import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FaHome,
  FaUserInjured,
  FaCalendarCheck,
  FaFileMedical,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaUserPlus,
  FaTrash,
  FaUsers,
  FaUserClock,
  FaStethoscope,
  FaSync,
  FaExclamationCircle,
  FaCheckCircle,
  FaChartLine,
  FaTasks,
  FaBars,
  FaTimes,
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

  .db-sidebar { background: linear-gradient(180deg,var(--navy) 0%,var(--navy-mid) 60%,var(--navy-light) 100%); }
  .db-logo-ring { background: linear-gradient(135deg,var(--accent),#2563EB); }
  .db-nav-link { transition:all .2s ease; border-left:3px solid transparent; color:rgba(255,255,255,.48); font-size:14px; }
  .db-nav-link:hover { background:rgba(59,126,248,.14); border-left-color:var(--accent); color:#fff; }
  .db-nav-link.active { background:rgba(59,126,248,.22); border-left-color:var(--accent); color:#fff; }
  .db-toggle { background:linear-gradient(135deg,var(--accent),#2563EB); box-shadow:0 4px 14px rgba(59,126,248,.4); }

  .sec-card { background:#fff; border-radius:20px; border:1.5px solid var(--border); transition:all .2s ease; }
  .sec-card:hover { border-color:rgba(59,126,248,.22); box-shadow:0 8px 28px rgba(59,126,248,.07); }

  .btn-ghost {
    border:1.5px solid #E2E8F0;
    color:#64748B;
    background:#fff;
    transition:all .18s ease;
    border-radius:12px;
  }
  .btn-ghost:hover { background:#F8FAFF; border-color:rgba(59,126,248,.3); color:var(--accent); }

  .err-banner { background:#FFF1F2; border:1.5px solid #FECDD3; color:#9F1239; border-radius:14px; }
  .sec-divider { border:none; border-top:1.5px solid #F0EEFF; margin:0 0 16px 0; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(59,126,248,.25); border-radius:99px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(59,126,248,.45); }
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
    if (err.response && err.response.status === 401) {
      console.error("Integrity check failed", err);
      clearAndRedirect(navigate);
      return;
    }
    console.warn("Integrity check network error, skipping redirect", err);
  }
};

function DoctorPatientsAccounts() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const integrityInterval = useRef(null);

  const isSecretary = user?.role === "secretaire";

  const navItems = isSecretary
    ? [
        { to: "/secretariatdb", icon: <FaHome />, label: "Tableau de bord" },
        { to: "/secpatients", icon: <FaUserInjured />, label: "Patients" },
        { to: "/seccreatepatient", icon: <FaUserPlus />, label: "Comptes patients", active: true },
        { to: "/secretaryRendezvous", icon: <FaCalendarCheck />, label: "Rendez-vous" },
        { to: "/sectasks", icon: <FaTasks />, label: "Tâches" },
        { to: "/secwaiting", icon: <FaUserClock />, label: "Salle d'attente" },
        { to: "/secpay", icon: <FaFileMedical />, label: "Paiements" },
        { to: "/secmail", icon: <FaEnvelope />, label: "Messagerie" },
        { to: "/secsettings", icon: <FaCog />, label: "Paramètres" },
      ]
    : [
        { to: "/docdb", icon: <FaHome />, label: "Tableau de bord" },
        { to: "/patients", icon: <FaUserInjured />, label: "Patients" },
        { to: "/prescription", icon: <FaFileMedical />, label: "Ordonnance" },
        { to: "/rendezvous", icon: <FaCalendarCheck />, label: "Rendez-vous" },
        { to: "/docwaiting", icon: <FaUserClock />, label: "Salle d'attente" },
        { to: "/createpatient", icon: <FaUserPlus />, label: "Comptes patients", active: true },
        { to: "/docstats", icon: <FaChartLine />, label: "Statistiques" },
        { to: "/doctasks", icon: <FaTasks />, label: "Tâches" },
        { to: "/docmail", icon: <FaEnvelope />, label: "Communication" },
        { to: "/doctuto", icon: <FaGraduationCap />, label: "Tutoriel" },
        { to: "/docsettings", icon: <FaCog />, label: "Paramètres" },
      ];

  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (!["medecin", "secretaire"].includes(parsedUser.role)) {
      navigate("/dashboard");
      return;
    }

    setUser(parsedUser);

    performIntegrityCheck(navigate, setError, true)
      .then(() => {
        fetchPatients(token);
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

  const fetchPatients = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/doctor/patients-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger la liste des comptes patients.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE}/doctor/patients-users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const messages = Object.values(data.errors).flat().join(" ");
          throw new Error(messages);
        } else {
          throw new Error(data.error || "Erreur lors de la création");
        }
      }

      setSuccess("Compte patient créé avec succès !");
      setFormData({ name: "", email: "", password: "" });
      fetchPatients(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE}/doctor/patients-users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      setPatients(patients.filter((p) => p.id !== id));
      setSuccess("Compte patient supprimé.");
    } catch (err) {
      setError(err.message);
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
    <div className="flex h-screen overflow-hidden" style={{ background: "linear-gradient(180deg,#EEF4FF 0%,#F8FBFF 42%,#FFFFFF 100%)" }}>
      <style>{G}</style>
      <FontInjector />

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
                Espace médecin / secrétariat
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
              {user?.name?.charAt(0) || "D"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate" style={{ fontWeight: 600 }}>
                {user?.role === 'medecin' ? `Dr. ${user?.name}` : user?.name}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>
                {user?.role === 'medecin' ? 'Médecin' : 'Secrétaire'}
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
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,var(--accent),#2563EB)" }}>
                  <FaUserPlus size={14} />
                </div>
                <h2 className="text-2xl" style={{ fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.03em" }}>
                  Gestion des comptes patients
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
                onClick={() => fetchPatients(localStorage.getItem("token"))}
                className="w-10 h-10 rounded-xl flex items-center justify-center btn-ghost"
                title="Actualiser"
              >
                <FaSync size={13} style={{ color: "#64748B" }} />
              </button>
              <div
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                style={{ background: "#fff", border: "1.5px solid var(--border)" }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs db-logo-ring"
                  style={{ fontWeight: 700 }}
                >
                  {user?.name?.charAt(0) || "D"}
                </div>
                <span className="hidden sm:inline text-sm" style={{ fontWeight: 600, color: "var(--text-1)" }}>
                  {user?.role === 'medecin' ? `Dr. ${user?.name}` : user?.name}
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
          {success && (
            <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{ background: "#ECFDF5", border: "1.5px solid #A7F3D0", color: "#065F46" }}>
              <FaCheckCircle size={16} />
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          <div className="sec-card p-6 mb-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#EEF4FF" }}>
                <FaUserPlus size={14} style={{ color: "var(--accent)" }} />
              </div>
              <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>
                Ajouter un nouveau compte patient
              </p>
            </div>
            <hr className="sec-divider" style={{ border: "none", borderTop: "1.5px solid #F0EEFF", margin: "0 0 20px 0" }} />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-2)" }}>
                  Nom complet
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-200"
                  style={{ border: "1.5px solid var(--border)", background: "#fff" }}
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-2)" }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-200"
                  style={{ border: "1.5px solid var(--border)", background: "#fff" }}
                  placeholder="patient@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-2)" }}>
                  Mot de passe
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="8"
                  maxLength="12"
                  className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-200"
                  style={{ border: "1.5px solid var(--border)", background: "#fff" }}
                  placeholder="••••••••"
                />
                <p className="text-xs mt-1" style={{ color: "var(--text-2)" }}>8 à 12 caractères</p>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-white font-medium transition disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,var(--accent),#2563EB)" }}
                >
                  {submitting ? "Création..." : "Créer le compte patient"}
                </button>
              </div>
            </form>
          </div>

          <div className="sec-card p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#ECFDF5" }}>
                <FaUsers size={14} style={{ color: "#059669" }} />
              </div>
              <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>
                Mes comptes patients ({patients.length})
              </p>
            </div>
            <hr className="sec-divider" style={{ border: "none", borderTop: "1.5px solid #F0EEFF", margin: "0 0 20px 0" }} />

            {patients.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <FaUsers size={32} style={{ color: "#DDD6FE" }} />
                <p className="text-sm mt-3" style={{ color: "var(--text-2)" }}>
                  Vous n'avez pas encore de comptes patients.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                      <th className="py-3 text-left font-semibold" style={{ color: "var(--text-2)" }}>Nom</th>
                      <th className="py-3 text-left font-semibold" style={{ color: "var(--text-2)" }}>Email</th>
                      <th className="py-3 text-left font-semibold" style={{ color: "var(--text-2)" }}>Créé le</th>
                      <th className="py-3 text-left font-semibold" style={{ color: "var(--text-2)" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50 transition" style={{ borderColor: "var(--border)" }}>
                        <td className="py-3 font-medium" style={{ color: "var(--text-1)" }}>{p.name}</td>
                        <td className="py-3" style={{ color: "var(--text-2)" }}>{p.email}</td>
                        <td className="py-3" style={{ color: "var(--text-2)" }}>
                          {new Date(p.created_at).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-red-600 hover:text-red-800 transition p-1"
                            title="Supprimer"
                          >
                            <FaTrash size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DoctorPatientsAccounts;
