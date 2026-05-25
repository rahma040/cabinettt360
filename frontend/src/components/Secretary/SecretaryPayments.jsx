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
  FaUserClock,
  FaUserPlus,
  FaMoneyBillWave,
  FaPrint,
  FaCheck,
  FaTimesCircle,
  FaSearch,
  FaCalendarAlt,
  FaCheckCircle,
  FaHourglassHalf,
  FaBars,
  FaTimes,
  FaReceipt,
  FaChevronLeft,
  FaChevronRight,
  FaStethoscope,
  FaFilter,
  FaClipboardList,
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
    --navy: #060D1F;
    --navy-mid: #0C1A3A;
    --navy-light: #122048;
    --accent: #3B7EF8;
    --accent-glow: rgba(59,126,248,0.22);
    --teal: #0ECDB5;
    --amber: #F59E0B;
    --rose: #F43F5E;
    --emerald: #10B981;
    --violet: #8B5CF6;
    --surface: #F4F7FF;
    --card: #FFFFFF;
    --text-primary: #0A0F1E;
    --text-secondary: #5B6B8A;
    --border: rgba(59,126,248,0.13);
  }
  body { background: var(--surface); }

  .sp-sidebar { background: linear-gradient(180deg, var(--navy) 0%, var(--navy-mid) 60%, var(--navy-light) 100%); }
  .sp-logo-ring { background: linear-gradient(135deg, var(--violet), #6D28D9); }
  .sp-nav-link { transition: all 0.2s ease; border-left: 3px solid transparent; color: rgba(255,255,255,0.5); }
  .sp-nav-link:hover { background: rgba(139,92,246,0.14); border-left-color: var(--violet); color: #fff; }
  .sp-nav-link.active { background: rgba(139,92,246,0.22); border-left-color: var(--violet); color: #fff; }

  .sp-card { background: #fff; border-radius: 20px; border: 1.5px solid var(--border); transition: all 0.22s cubic-bezier(.4,0,.2,1); }
  .sp-card:hover { box-shadow: 0 8px 32px rgba(59,126,248,0.09); border-color: rgba(59,126,248,0.22); }

  .pay-row { border: 1.5px solid #E8EEFF; border-radius: 16px; transition: all 0.2s ease; background: #fff; }
  .pay-row:hover { border-color: rgba(59,126,248,0.28); box-shadow: 0 4px 20px rgba(59,126,248,0.08); transform: translateY(-1px); }
  .pay-row-paid { background: #FAFFFE; border-color: #D1FAE5; }
  .pay-row-paid:hover { border-color: rgba(16,185,129,0.4); }

  .btn-primary { background: linear-gradient(135deg, var(--accent), #2563EB); color: #fff; transition: all 0.2s ease; box-shadow: 0 4px 14px rgba(59,126,248,0.32); }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59,126,248,0.42); }
  .btn-primary:disabled { opacity: 0.5; transform: none; box-shadow: none; }
  .btn-emerald { background: linear-gradient(135deg, #10B981, #059669); color: #fff; box-shadow: 0 4px 14px rgba(16,185,129,0.28); transition: all 0.2s ease; }
  .btn-emerald:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,0.38); }
  .btn-emerald:disabled { opacity: 0.5; transform: none; }
  .btn-ghost { border: 1.5px solid #E2E8F0; color: #64748B; background: #fff; transition: all 0.18s ease; }
  .btn-ghost:hover { background: #F8FAFF; border-color: rgba(59,126,248,0.3); color: var(--accent); }

  .sp-input { border: 1.5px solid #E2E8F0; background: #fff; transition: all 0.2s ease; }
  .sp-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }

  .badge-paid { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
  .badge-pending { background: #FFFBEB; color: #92400E; border: 1px solid #FDE68A; }
  .badge-unpaid { background: #FFF1F2; color: #9F1239; border: 1px solid #FECDD3; }

  .stat-pending { background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); border: 1.5px solid #FDE68A; }
  .stat-paid { background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border: 1.5px solid #A7F3D0; }

  .modal-overlay { background: rgba(6,13,31,0.62); backdrop-filter: blur(7px); }
  .modal-box { animation: mIn 0.24s cubic-bezier(.4,0,.2,1); }
  @keyframes mIn { from { opacity:0; transform: scale(0.95) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }

  .receipt-divider { border: none; border-top: 2px dashed #E2E8F0; margin: 16px 0; }

  .sp-toggle { background: linear-gradient(135deg, var(--violet), #6D28D9); box-shadow: 0 4px 14px rgba(139,92,246,0.4); }

  .tab-active { background: #fff; box-shadow: 0 2px 12px rgba(6,13,31,0.07); }
  .tab-inactive { color: var(--text-secondary); }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.22); border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.4); }
`;

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 rounded-xl flex items-center justify-center btn-ghost disabled:opacity-40 disabled:cursor-not-allowed text-sm"
      >
        <FaChevronLeft size={11} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className="w-8 h-8 rounded-xl text-xs font-600 transition-all"
          style={{
            fontWeight: 600,
            background: currentPage === page ? "linear-gradient(135deg,#8B5CF6,#6D28D9)" : "#fff",
            color: currentPage === page ? "#fff" : "var(--text-secondary)",
            border: currentPage === page ? "none" : "1.5px solid #E2E8F0",
            boxShadow: currentPage === page ? "0 4px 14px rgba(139,92,246,0.3)" : "none",
          }}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 rounded-xl flex items-center justify-center btn-ghost disabled:opacity-40 disabled:cursor-not-allowed text-sm"
      >
        <FaChevronRight size={11} />
      </button>
    </div>
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

function SecretaryPayments() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pendingVisites, setPendingVisites] = useState([]);
  const [paidVisites, setPaidVisites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedVisiteId, setSelectedVisiteId] = useState(null);

  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  const [paidCurrentPage, setPaidCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [pendingSearch, setPendingSearch] = useState("");
  const [paidSearch, setPaidSearch] = useState("");

  const integrityInterval = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: "ease-out-cubic" });
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { navigate("/login"); return; }
    setUser(JSON.parse(userData));

    performIntegrityCheck(navigate, null, true)
      .then(() => {
        fetchAllPayments();
        setLoading(false);
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

  const fetchAllPayments = async () => {
    try {
      const [pendingRes, paidRes] = await Promise.all([
        api.get("/secretary/payments"),
        api.get("/secretary/payments/paid"),
      ]);
      const allPending = pendingRes.data;
      const filteredPending = allPending.filter((v) => v.statut === "terminé");
      setPendingVisites(filteredPending);
      setPaidVisites(paidRes.data);
    } catch (error) {
      console.error("Erreur lors du chargement des paiements:", error);
    }
  };

  const handleFinalizePayment = async (visiteId) => {
    setProcessingPayment(true);
    try {
      const response = await api.post(`/secretary/payments/${visiteId}/finalize`);
      const result = response.data;
      if (result.success) {
        const updatedPending = pendingVisites.filter((v) => v.id !== visiteId);
        setPendingVisites(updatedPending);
        const finalizedVisite = pendingVisites.find((v) => v.id === visiteId);
        if (finalizedVisite) setPaidVisites([{ ...finalizedVisite, statut_paiement: "payé" }, ...paidVisites]);
        setReceiptData(result.receipt);
        setShowReceipt(true);
      } else {
        alert("Erreur lors de la finalisation du paiement");
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue");
    } finally {
      setProcessingPayment(false);
      setShowConfirmModal(false);
      setSelectedVisiteId(null);
    }
  };

  const handlePrintReceipt = (receipt) => {
    const printContent = `
      <div style="max-width:520px;margin:40px auto;border:1px solid #e2e8f0;padding:32px;border-radius:16px;font-family:'Segoe UI',sans-serif;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="width:48px;height:48px;background:linear-gradient(135deg,#8B5CF6,#6D28D9);border-radius:12px;margin:0 auto 10px;display:flex;align-items:center;justify-content:center;">
            <span style="color:#fff;font-size:20px;font-weight:700;">M</span>
          </div>
          <h2 style="margin:0;font-size:22px;font-weight:800;color:#0A0F1E;">Cabi Doc</h2>
          <p style="margin:4px 0 0;color:#5B6B8A;font-size:13px;">Cabi Doc · Reçu de paiement</p>
        </div>
        <hr style="border:none;border-top:2px dashed #E2E8F0;margin:20px 0;" />
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#5B6B8A;">Patient</td><td style="text-align:right;font-weight:600;color:#0A0F1E;">${receipt.patient}</td></tr>
          <tr><td style="padding:6px 0;color:#5B6B8A;">Date de visite</td><td style="text-align:right;font-weight:600;color:#0A0F1E;">${new Date(receipt.date_visite).toLocaleDateString("fr-FR")}</td></tr>
          <tr><td style="padding:6px 0;color:#5B6B8A;">Médecin</td><td style="text-align:right;font-weight:600;color:#0A0F1E;">${receipt.medecin}</td></tr>
          <tr><td style="padding:6px 0;color:#5B6B8A;">Date du paiement</td><td style="text-align:right;font-weight:600;color:#0A0F1E;">${receipt.payment_date}</td></tr>
        </table>
        <hr style="border:none;border-top:2px dashed #E2E8F0;margin:20px 0;" />
        <div style="display:flex;justify-content:space-between;align-items:center;background:#ECFDF5;padding:14px 18px;border-radius:12px;">
          <span style="color:#065F46;font-weight:700;font-size:15px;">Montant total</span>
          <span style="color:#059669;font-weight:800;font-size:20px;">${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TND" }).format(receipt.montant)}</span>
        </div>
        <div style="margin-top:28px;text-align:center;color:#10B981;font-weight:700;font-size:14px;">✓ Paiement effectué avec succès</div>
        <div style="margin-top:40px;text-align:center;border-top:1px solid #e2e8f0;padding-top:14px;">
          <div style="width:160px;margin:0 auto;font-size:11px;color:#94A3B8;">Signature</div>
        </div>
      </div>`;
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Reçu</title></head><body>${printContent}</body></html>`);
    win.document.close(); win.print(); win.close();
  };

  const handleCloseReceipt = () => { setShowReceipt(false); setReceiptData(null); };
  const handleLogout = () => {
    if (integrityInterval.current) clearInterval(integrityInterval.current);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userIntegrityHash");
    navigate("/login");
  };

  const getPaymentStatusBadge = (status) => {
    if (status === "payé") return <span className="badge-paid px-2.5 py-0.5 rounded-full text-xs font-600 flex items-center gap-1" style={{ fontWeight: 600 }}><FaCheckCircle size={9} /> Payé</span>;
    if (status === "en_attente") return <span className="badge-pending px-2.5 py-0.5 rounded-full text-xs font-600 flex items-center gap-1" style={{ fontWeight: 600 }}><FaHourglassHalf size={9} /> En attente</span>;
    return <span className="badge-unpaid px-2.5 py-0.5 rounded-full text-xs font-600 flex items-center gap-1" style={{ fontWeight: 600 }}><FaTimesCircle size={9} /> Impayé</span>;
  };

  const filteredPending = pendingVisites.filter((v) => {
    const name = `${v.patient?.nom || ""} ${v.patient?.prenom || ""}`.toLowerCase();
    return name.includes(pendingSearch.toLowerCase()) || (v.montant?.toString().includes(pendingSearch));
  });
  const totalPendingPages = Math.ceil(filteredPending.length / itemsPerPage);
  const pendingCurrentItems = filteredPending.slice((pendingCurrentPage - 1) * itemsPerPage, pendingCurrentPage * itemsPerPage);

  const filteredPaid = paidVisites.filter((v) => {
    const name = `${v.patient?.nom || ""} ${v.patient?.prenom || ""}`.toLowerCase();
    return name.includes(paidSearch.toLowerCase()) || (v.montant?.toString().includes(paidSearch));
  });
  const totalPaidPages = Math.ceil(filteredPaid.length / itemsPerPage);
  const paidCurrentItems = filteredPaid.slice((paidCurrentPage - 1) * itemsPerPage, paidCurrentPage * itemsPerPage);

  const totalRevenue = paidVisites.reduce((sum, v) => sum + parseFloat(v.montant || 0), 0);
  const pendingRevenue = pendingVisites.reduce((sum, v) => sum + parseFloat(v.montant || 0), 0);

  const navItems = [
    { to: "/secretariatdb", icon: <FaHome />, label: "Tableau de bord" },
    { to: "/secpatients", icon: <FaUserInjured />, label: "Patients" },
    { to: "/seccreatepatient", icon: <FaUserPlus />, label: "Comptes patients" },
    { to: "/secretaryRendezvous", icon: <FaCalendarCheck />, label: "Rendez-vous" },
    { to: "/sectasks", icon: <FaClipboardList />, label: "Tâches"},
    { to: "/secwaiting", icon: <FaUserClock />, label: "Salle d'attente" },
    { to: "/secpay", icon: <FaMoneyBillWave />, label: "Paiements", active: true },
    { to: "/secmail", icon: <FaEnvelope />, label: "Messagerie" },
    { to: "/secsettings", icon: <FaCog />, label: "Paramètres" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "linear-gradient(135deg,#060D1F,#0C1A3A)" }}>
        <style>{G}</style>
        <FontInjector />
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 sp-logo-ring">
            <FaMoneyBillWave className="text-white text-2xl" />
          </div>
          <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-sm" style={{ color: "#94A3B8" }}>Chargement des paiements…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface)", fontFamily: "'Sora', sans-serif" }}>
      <style>{G}</style>
      <FontInjector />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center text-white rounded-r-xl shadow-lg sp-toggle"
      >
        {sidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
      </button>

      <aside className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 transition-transform duration-300 z-40 w-64 flex flex-col sp-sidebar`}>
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center sp-logo-ring flex-shrink-0">
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
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`sp-nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${item.active ? "active" : ""}`}
              style={{ fontWeight: item.active ? 600 : 500 }}
            >
              <span style={{ opacity: item.active ? 1 : 0.65 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 m-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0 sp-logo-ring" style={{ fontWeight: 700 }}>
              {user?.name?.charAt(0) || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate" style={{ fontWeight: 600 }}>{user?.name || "Secrétaire"}</p>
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
        <div className="p-6 lg:p-8 pt-14 lg:pt-8 max-w-5xl mx-auto">

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8" data-aos="fade-down">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", boxShadow: "0 4px 14px rgba(139,92,246,0.35)" }}>
                  <FaMoneyBillWave size={14} />
                </div>
                <h2 className="text-2xl" style={{ fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>Gestion des paiements</h2>
              </div>
              <p className="text-sm ml-11" style={{ color: "var(--text-secondary)" }}>
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            <div className="mt-4 sm:mt-0 flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: "#fff", border: "1.5px solid var(--border)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs sp-logo-ring" style={{ fontWeight: 700 }}>
                  {user?.name?.charAt(0) || "S"}
                </div>
                <span className="hidden sm:inline text-sm" style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user?.name || "Secrétaire"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-5 mb-8" data-aos="fade-up">
            {[
              {
                cls: "stat-pending",
                icon: <FaHourglassHalf size={18} style={{ color: "#D97706" }} />,
                label: "En attente",
                value: pendingVisites.length,
              },
              {
                cls: "stat-paid",
                icon: <FaCheckCircle size={18} style={{ color: "#059669" }} />,
                label: "Payés",
                value: paidVisites.length,
              },
            ].map((s, i) => (
              <div key={i} className={`rounded-2xl p-5 w-full sm:w-72 ${s.cls}`} data-aos="fade-up" data-aos-delay={i * 80}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.7)" }}>
                    {s.icon}
                  </div>
                </div>
                <p className="text-xs mb-1" style={{ color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl mb-6" style={{ background: "#E8EEFF", width: "fit-content" }} data-aos="fade-up">
            {[
              { key: "pending", label: "En attente", count: filteredPending.length, icon: <FaHourglassHalf size={12} /> },
              { key: "paid", label: "Historique", count: filteredPaid.length, icon: <FaCheckCircle size={12} /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all ${activeTab === tab.key ? "tab-active" : "tab-inactive"}`}
                style={{ fontWeight: activeTab === tab.key ? 700 : 500, color: activeTab === tab.key ? "var(--text-primary)" : "var(--text-secondary)" }}
              >
                {tab.icon}
                {tab.label}
                <span
                  className="px-1.5 py-0.5 rounded-md text-xs"
                  style={{
                    fontWeight: 700,
                    background: activeTab === tab.key ? (tab.key === "pending" ? "#FFFBEB" : "#ECFDF5") : "rgba(0,0,0,0.08)",
                    color: activeTab === tab.key ? (tab.key === "pending" ? "#D97706" : "#059669") : "#94A3B8",
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {activeTab === "pending" && (
            <div data-aos="fade-up">
              <div className="flex items-center gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2" size={13} style={{ color: "#94A3B8" }} />
                  <input
                    type="text"
                    placeholder="Rechercher un patient…"
                    value={pendingSearch}
                    onChange={(e) => { setPendingSearch(e.target.value); setPendingCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm sp-input"
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs" style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A", color: "#92400E", fontWeight: 600 }}>
                  <FaFilter size={10} />
                  {filteredPending.length} résultat{filteredPending.length !== 1 ? "s" : ""}
                </div>
              </div>

              {filteredPending.length === 0 ? (
                <div className="sp-card p-16 text-center" data-aos="fade-up">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#ECFDF5" }}>
                    <FaCheckCircle size={26} style={{ color: "#10B981" }} />
                  </div>
                  <p className="font-700 text-base mb-1" style={{ fontWeight: 700, color: "var(--text-primary)" }}>Tout est à jour !</p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Aucun paiement en attente pour le moment.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {pendingCurrentItems.map((visite, i) => (
                      <div key={visite.id} className="pay-row p-4" data-aos="fade-up" data-aos-delay={i * 50}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0" style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", fontWeight: 700 }}>
                              {(visite.patient?.nom?.charAt(0) || "P").toUpperCase()}
                            </div>
                            <div>
                              <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                                {visite.patient?.nom} {visite.patient?.prenom}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                                  <FaCalendarAlt size={10} />
                                  {new Date(visite.date_visite).toLocaleDateString("fr-FR")}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-xs" style={{ background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A", fontWeight: 700 }}>
                                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TND" }).format(visite.montant || 0)}
                                </span>
                                {getPaymentStatusBadge(visite.statut_paiement)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedVisiteId(visite.id);
                              setShowConfirmModal(true);
                            }}
                            disabled={processingPayment}
                            className="btn-emerald px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50 flex-shrink-0"
                            style={{ fontWeight: 600 }}
                          >
                            <FaCheck size={12} />
                            Finaliser
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Pagination currentPage={pendingCurrentPage} totalPages={totalPendingPages} onPageChange={setPendingCurrentPage} />
                </>
              )}
            </div>
          )}

          {activeTab === "paid" && (
            <div data-aos="fade-up">
              <div className="flex items-center gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2" size={13} style={{ color: "#94A3B8" }} />
                  <input
                    type="text"
                    placeholder="Rechercher un patient…"
                    value={paidSearch}
                    onChange={(e) => { setPaidSearch(e.target.value); setPaidCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm sp-input"
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs" style={{ background: "#ECFDF5", border: "1.5px solid #A7F3D0", color: "#065F46", fontWeight: 600 }}>
                  <FaFilter size={10} />
                  {filteredPaid.length} résultat{filteredPaid.length !== 1 ? "s" : ""}
                </div>
              </div>

              {filteredPaid.length === 0 ? (
                <div className="sp-card p-16 text-center" data-aos="fade-up">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#EEF4FF" }}>
                    <FaReceipt size={26} style={{ color: "var(--accent)" }} />
                  </div>
                  <p className="font-700 text-base mb-1" style={{ fontWeight: 700, color: "var(--text-primary)" }}>Aucun historique</p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Les paiements finalisés apparaîtront ici.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {paidCurrentItems.map((visite, i) => (
                      <div key={visite.id} className="pay-row pay-row-paid p-4" data-aos="fade-up" data-aos-delay={i * 50}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0" style={{ background: "linear-gradient(135deg,#10B981,#059669)", fontWeight: 700 }}>
                              {(visite.patient?.nom?.charAt(0) || "P").toUpperCase()}
                            </div>
                            <div>
                              <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                                {visite.patient?.nom} {visite.patient?.prenom}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                                  <FaCalendarAlt size={10} />
                                  {new Date(visite.date_visite).toLocaleDateString("fr-FR")}
                                </span>
                                <span className="badge-paid px-2.5 py-0.5 rounded-full text-xs font-600 flex items-center gap-1" style={{ fontWeight: 600 }}>
                                  <FaCheckCircle size={9} /> Payé
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Pagination currentPage={paidCurrentPage} totalPages={totalPaidPages} onPageChange={setPaidCurrentPage} />
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {showReceipt && receiptData && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="px-8 py-6" style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <FaReceipt className="text-white" size={16} />
                </div>
                <button onClick={handleCloseReceipt} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-all">
                  <FaTimes size={14} />
                </button>
              </div>
              <h3 className="text-white text-lg" style={{ fontWeight: 800 }}>Reçu de paiement</h3>
              <p className="text-white/60 text-xs mt-0.5">Cabi Doc</p>
            </div>

            <div className="px-8 py-6">
              <div className="rounded-2xl p-5 mb-5 text-center" style={{ background: "linear-gradient(135deg,#ECFDF5,#D1FAE5)", border: "1.5px solid #A7F3D0" }}>
                <p className="text-xs mb-1" style={{ color: "#065F46", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Montant réglé</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: "#059669", letterSpacing: "-0.04em" }}>
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TND" }).format(receiptData.montant)}
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <FaCheckCircle size={11} style={{ color: "#10B981" }} />
                  <span className="text-xs" style={{ color: "#059669", fontWeight: 600 }}>Paiement confirmé</span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  ["Patient", receiptData.patient],
                  ["Date de visite", new Date(receiptData.date_visite).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })],
                  ["Médecin", receiptData.medecin],
                  ["Date du paiement", receiptData.payment_date],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <span className="text-xs" style={{ color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                    <span className="text-sm" style={{ fontWeight: 600, color: "var(--text-primary)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-8 pb-6 flex gap-3">
              <button
                onClick={() => handlePrintReceipt(receiptData)}
                className="flex-1 text-white py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", fontWeight: 700, boxShadow: "0 4px 14px rgba(139,92,246,0.35)" }}
              >
                <FaPrint size={13} /> Imprimer
              </button>
              <button onClick={handleCloseReceipt} className="btn-ghost px-5 py-3 rounded-xl text-sm" style={{ fontWeight: 600 }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="px-8 py-6 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#FFFBEB" }}>
                <FaHourglassHalf size={28} style={{ color: "#D97706" }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Confirmer le paiement</h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                Êtes-vous sûr de vouloir finaliser ce paiement ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedVisiteId(null);
                  }}
                  className="flex-1 btn-ghost py-3 rounded-xl text-sm font-semibold"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (selectedVisiteId) handleFinalizePayment(selectedVisiteId);
                  }}
                  className="flex-1 btn-emerald py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <FaCheck size={12} />
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SecretaryPayments;