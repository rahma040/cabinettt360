import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome, 
  FaUsers, 
  FaCog,
  FaSignOutAlt, 
  FaUserPlus, 
  FaPlus,
  FaEdit, 
  FaTrash, 
  FaBars, 
  FaTimes, 
  FaStethoscope, 
  FaSearch,
  FaEnvelope, 
  FaUserTag, 
  FaEnvelope as FaEmail,
  FaUser, 
  FaTimes as FaClose, 
  FaExclamationCircle, 
  FaInbox,
  FaKey, 
  FaUserMd,
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
    link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);
  return null;
};

const globalStyles = `
  * { font-family: 'Sora', sans-serif; box-sizing: border-box; }
  :root {
    --navy: #060D1F; --navy-mid: #0C1A3A; --navy-light: #122048;
    --accent: #3B7EF8; --accent-glow: rgba(59,126,248,0.20);
    --teal: #0ECDB5; --amber: #F59E0B; --rose: #F43F5E; --emerald: #10B981;
    --violet: #8B5CF6; --surface: #F4F7FF; --text-1: #0A0F1E; --text-2: #5B6B8A;
    --border: rgba(59,126,248,0.13);
  }
  .dt-sidebar { background: linear-gradient(180deg,var(--navy) 0%,var(--navy-mid) 60%,var(--navy-light) 100%); }
  .dt-logo-ring { background: linear-gradient(135deg,var(--accent),#2563EB); }
  .dt-nav-link { transition:all .2s ease; border-left:3px solid transparent; color:rgba(255,255,255,.48); font-size:14px; }
  .dt-nav-link:hover { background:rgba(59,126,248,.14); border-left-color:var(--accent); color:#fff; }
  .dt-nav-link.active { background:rgba(59,126,248,.22); border-left-color:var(--accent); color:#fff; }
  .dt-toggle { background:linear-gradient(135deg,var(--accent),#2563EB); box-shadow:0 4px 14px rgba(59,126,248,.4); }
  .btn-accent { background:linear-gradient(135deg,var(--accent),#2563EB); color:#fff; box-shadow:0 4px 14px rgba(59,126,248,.32); transition:all .2s ease; }
  .btn-accent:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(59,126,248,.42); }
  .btn-emerald { background:linear-gradient(135deg,var(--emerald),#059669); color:#fff; }
  .btn-ghost { border:1.5px solid #E2E8F0; color:#64748B; background:#fff; transition:all .18s ease; }
  .btn-ghost:hover { background:#F8FAFF; border-color:rgba(59,126,248,.3); color:var(--accent); }
  .dt-input { border:1.5px solid #E2E8F0; background:#fff; transition:all .2s ease; font-size:14px; }
  .dt-input:focus { outline:none; border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-glow); }
  .chip-blue { background:#EEF4FF; border:1px solid #BFDBFE; color:#1E40AF; }
  .chip-green { background:#ECFDF5; border:1px solid #A7F3D0; color:#065F46; }
  .chip-amber { background:#FFFBEB; border:1px solid #FDE68A; color:#92400E; }
  .chip-rose { background:#FFF1F2; border:1px solid #FECDD3; color:#9F1239; }
  .chip-gray { background:#F8FAFF; border:1px solid #E2E8F0; color:#64748B; }
  .user-row { border:1.5px solid #E8EEFF; border-radius:14px; background:#fff; transition:all .2s ease; }
  .user-row:hover { border-color:rgba(59,126,248,.22); box-shadow:0 4px 16px rgba(59,126,248,.08); transform:translateX(3px); }
  .modal-overlay { background:rgba(6,13,31,.62); backdrop-filter:blur(7px); }
  .modal-box { animation:mIn .24s cubic-bezier(.4,0,.2,1); }
  @keyframes mIn { from{opacity:0;transform:scale(.95) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);} }
  .error-banner { background:#FFF1F2; border:1.5px solid #FECDD3; color:#9F1239; border-radius:14px; }
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(59,126,248,.25); border-radius:99px; }
`;

const roleLabels = {
  admin: { label: "Admin", cls: "chip-rose", icon: <FaUserTag size={10} /> },
  medecin: { label: "Médecin", cls: "chip-blue", icon: <FaStethoscope size={10} /> },
  secretaire: { label: "Secrétaire", cls: "chip-amber", icon: <FaUserPlus size={10} /> },
  patient: { label: "Patient", cls: "chip-green", icon: <FaUser size={10} /> }
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

const AdminUsers = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "patient"
  });
  const integrityInterval = useRef(null);

  const navItems = [
    { to: "/admindb", icon: <FaHome />, label: "Tableau de bord" },
    { to: "/adminusers", icon: <FaUsers />, label: "Utilisateurs", active: true },
    { to: "/adminpass", icon: <FaKey />, label: "Réinitialisation MDP" },
    { to: "/adminverify", icon: <FaUserMd />, label: "Vérifier Médecins" },
    { to: "/admincoms", icon: <FaEnvelope />, label: "Communications" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { navigate("/login"); return; }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") { navigate("/dashboard"); return; }
    setUser(parsedUser);

    performIntegrityCheck(navigate, setError, true)
      .then(() => {
        fetchUsers();
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

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", role: "patient" });
    setEditingUser(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const payload = {};
        if (formData.name !== editingUser.name) payload.name = formData.name;
        if (formData.email !== editingUser.email) payload.email = formData.email;
        if (formData.password) payload.password = formData.password;
        if (formData.role !== editingUser.role) payload.role = formData.role;
        if (Object.keys(payload).length === 0) {
          resetForm();
          return;
        }
        await api.put(`/admin/users/${editingUser.id}`, payload);
      } else {
        await api.post("/admin/users", formData);
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join("\n") : "Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", 
      role: user.role
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Erreur lors de la suppression");
    }
  };

  const handleLogout = () => {
    if (integrityInterval.current) clearInterval(integrityInterval.current);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userIntegrityHash");
    navigate("/login");
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.role && u.role.toLowerCase().includes(search.toLowerCase()))
  );

  const totalUsers = users.length;
  const admins = users.filter(u => u.role === "admin").length;
  const doctors = users.filter(u => u.role === "medecin").length;
  const secretaries = users.filter(u => u.role === "secretaire").length;
  const patients = users.filter(u => u.role === "patient").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "linear-gradient(135deg,#060D1F,#0C1A3A)" }}>
        <style>{globalStyles}</style><FontInjector />
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 dt-logo-ring">
            <FaUsers className="text-white text-2xl" />
          </div>
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-sm" style={{ color: "#94A3B8" }}>Chargement des utilisateurs…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface)" }}>
      <style>{globalStyles}</style><FontInjector />

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
              <p className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>Espace admin</p>
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
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate" style={{ fontWeight: 600 }}>{user?.name || "Admin"}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>Administrateur</p>
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
                  <FaUsers size={14} />
                </div>
                <h2 className="text-2xl" style={{ fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.03em" }}>Gestion des utilisateurs</h2>
              </div>
              <p className="text-sm ml-11" style={{ color: "var(--text-2)" }}>
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="btn-accent px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
              style={{ fontWeight: 600 }}
            >
              <FaPlus size={12} /> Nouvel utilisateur
            </button>
          </div>

          {error && (
            <div className="error-banner px-5 py-4 mb-6 flex items-center gap-3">
              <FaExclamationCircle size={16} style={{ color: "#F43F5E" }} />
              <span className="text-sm" style={{ fontWeight: 600 }}>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { cls: "chip-gray", icon: <FaUsers size={11} />, label: "Total", val: totalUsers },
              { cls: "chip-rose", icon: <FaUserTag size={11} />, label: "Admins", val: admins },
              { cls: "chip-blue", icon: <FaStethoscope size={11} />, label: "Médecins", val: doctors },
              { cls: "chip-amber", icon: <FaUserPlus size={11} />, label: "Secrétaires", val: secretaries },
              { cls: "chip-green", icon: <FaUser size={11} />, label: "Patients", val: patients },
            ].map((stat, idx) => (
              <div key={idx} className={`${stat.cls} px-3.5 py-2 rounded-xl flex items-center gap-2`} style={{ fontWeight: 600, fontSize: 12 }}>
                {stat.icon}
                <span>{stat.label}</span>
                <span className="mono" style={{ fontWeight: 800 }}>{stat.val}</span>
              </div>
            ))}
          </div>

          <div className="relative mb-6 max-w-md">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2" size={12} style={{ color: "#94A3B8" }} />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou rôle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm dt-input"
            />
          </div>

          <div className="space-y-2.5">
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-20" style={{ border: "1.5px dashed #DBEAFE" }}>
                <FaInbox size={28} style={{ color: "#BFDBFE", marginBottom: 10 }} />
                <p className="font-700 text-base mb-1" style={{ fontWeight: 700, color: "var(--text-1)" }}>Aucun utilisateur trouvé</p>
                <p className="text-sm" style={{ color: "var(--text-2)" }}>Modifiez votre recherche ou créez un nouvel utilisateur</p>
              </div>
            ) : (
              filteredUsers.map((u) => {
                const roleInfo = roleLabels[u.role] || roleLabels.patient;
                return (
                  <div key={u.id} className="user-row px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,var(--accent),#2563EB)", color: "#fff", fontWeight: 700 }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>{u.name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-2)" }}>
                          <FaEmail size={9} /> {u.email}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                      <span className={`${roleInfo.cls} px-2.5 py-0.5 rounded-lg text-xs flex items-center gap-1`} style={{ fontWeight: 600 }}>
                        {roleInfo.icon} {roleInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => handleEdit(u)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-blue-50" style={{ color: "var(--accent)", border: "1.5px solid #BFDBFE" }}>
                        <FaEdit size={12} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-red-50" style={{ color: "#F43F5E", border: "1.5px solid #FECDD3" }}>
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-8 py-6" style={{ background: "linear-gradient(135deg,var(--accent),#2563EB)" }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  {editingUser ? <FaEdit className="text-white" size={16} /> : <FaUserPlus className="text-white" size={16} />}
                </div>
                <button onClick={resetForm} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-all">
                  <FaClose size={14} />
                </button>
              </div>
              <h3 className="text-white text-lg" style={{ fontWeight: 800 }}>{editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</h3>
              <p className="text-white/60 text-xs mt-0.5">Remplissez les informations ci-dessous</p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
              <div>
                <label className="block text-xs font-600 mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-2)", fontWeight: 600, letterSpacing: "0.07em" }}>Nom complet <span style={{ color: "var(--rose)" }}>*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} required className="dt-input w-full p-3 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-600 mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-2)", fontWeight: 600, letterSpacing: "0.07em" }}>Email <span style={{ color: "var(--rose)" }}>*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleFormChange} required className="dt-input w-full p-3 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-600 mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-2)", fontWeight: 600, letterSpacing: "0.07em" }}>
                  Mot de passe {!editingUser && <span style={{ color: "var(--rose)" }}>*</span>}
                  {editingUser && <span className="text-xs font-normal ml-1" style={{ color: "var(--text-2)" }}>(laisser vide pour ne pas changer)</span>}
                </label>
                <input type="password" name="password" value={formData.password} onChange={handleFormChange} required={!editingUser} className="dt-input w-full p-3 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-600 mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-2)", fontWeight: 600, letterSpacing: "0.07em" }}>Rôle <span style={{ color: "var(--rose)" }}>*</span></label>
                <select name="role" value={formData.role} onChange={handleFormChange} className="dt-input w-full p-3 rounded-xl text-sm">
                  <option value="admin">Admin</option>
                  <option value="medecin">Médecin</option>
                  <option value="secretaire">Secrétaire</option>
                  <option value="patient">Patient</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetForm} className="btn-ghost px-5 py-2.5 rounded-xl text-sm" style={{ fontWeight: 600 }}>Annuler</button>
                <button type="submit" className="btn-accent px-6 py-2.5 rounded-xl text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                  {editingUser ? <><FaEdit size={12} /> Mettre à jour</> : <><FaPlus size={12} /> Créer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;