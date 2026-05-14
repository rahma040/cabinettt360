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
  FaUserPlus,
  FaUserClock,
  FaChartLine,
  FaTasks,
  FaStethoscope,
  FaBars,
  FaTimes,
  FaSync,
  FaExclamationCircle,
  FaEnvelope,
  FaPaperclip,
  FaCheckCircle,
  FaSpinner,
  FaFilePdf,
  FaDownload,
  FaEye,
  FaPaperPlane,
  FaInbox,
  FaGraduationCap,
  FaEdit,
  FaAt,
  FaRegClock,
  FaSearch,
  FaPlus,
  FaArrowLeft,
  FaRobot,
} from "react-icons/fa";
import DoctorAssistantChat from "./DoctorAssistantChat";

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
    --teal:        #0ECDB5;
    --amber:       #F59E0B;
    --rose:        #F43F5E;
    --emerald:     #10B981;
    --violet:      #8B5CF6;
    --surface:     #EEF2FF;
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

  .mail-shell {
    display: flex;
    height: calc(100vh - 64px);
    background: #fff;
    border-radius: 24px;
    border: 1.5px solid #E0E8FF;
    overflow: hidden;
    box-shadow: 0 8px 40px rgba(59,126,248,0.08);
  }

  .mail-list-pane {
    width: 320px;
    min-width: 260px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border-right: 1.5px solid #E8EEFF;
    background: #F8FAFF;
  }
  .mail-list-header {
    padding: 18px 16px 14px;
    border-bottom: 1.5px solid #E8EEFF;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .compose-btn {
    width: 100%;
    background: linear-gradient(135deg, var(--accent), #2563EB);
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 11px 0;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    letter-spacing: -0.01em;
    transition: all .2s ease;
    box-shadow: 0 4px 14px rgba(59,126,248,0.3);
  }
  .compose-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59,126,248,0.4); }

  .search-wrap {
    position: relative;
  }
  .search-wrap input {
    width: 100%;
    padding: 8px 12px 8px 34px;
    border-radius: 10px;
    border: 1.5px solid #E0E8FF;
    background: #fff;
    font-size: 12px;
    color: var(--text-1);
    outline: none;
    transition: border-color .2s ease;
  }
  .search-wrap input:focus { border-color: var(--accent); }
  .search-wrap svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); }

  .tab-switch {
    display: flex;
    background: #fff;
    border: 1.5px solid #E0E8FF;
    border-radius: 12px;
    padding: 3px;
    gap: 4px;
  }
  .tab-btn {
    flex: 1;
    background: transparent;
    border: none;
    border-radius: 10px;
    padding: 8px 0;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all .2s ease;
    color: var(--text-2);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .tab-btn.active {
    background: linear-gradient(135deg, var(--accent), #2563EB);
    color: #fff;
    box-shadow: 0 2px 8px rgba(59,126,248,0.25);
  }

  .msg-list { flex: 1; overflow-y: auto; }
  .msg-list-item {
    padding: 14px 16px;
    cursor: pointer;
    border-bottom: 1px solid #EEF1FF;
    transition: background .15s ease;
    position: relative;
  }
  .msg-list-item:hover { background: #EEF4FF; }
  .msg-list-item.selected { background: #E8EEFF; border-left: 3px solid var(--accent); }
  .msg-list-item.selected .msg-li-recipient { color: var(--accent); }

  .msg-li-recipient {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .msg-li-preview {
    font-size: 11.5px;
    color: var(--text-2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;
  }
  .msg-li-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .msg-li-time {
    font-size: 10.5px;
    color: #94A3B8;
    font-weight: 500;
  }
  .msg-li-attach {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    color: var(--rose);
    font-weight: 600;
  }

  .mail-detail-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .empty-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
  }
  .empty-pane-icon {
    width: 80px; height: 80px;
    border-radius: 26px;
    background: linear-gradient(135deg, #EEF4FF, #DBEAFE);
    border: 2px solid #BFDBFE;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }

  .detail-header {
    padding: 22px 28px 18px;
    border-bottom: 1.5px solid #E8EEFF;
    background: #fff;
  }
  .detail-subject {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--text-1);
    letter-spacing: -0.025em;
    margin-bottom: 10px;
  }
  .detail-meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }
  .detail-recipient {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: #EEF4FF;
    border: 1.5px solid #BFDBFE;
    border-radius: 10px;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 600;
    color: #1D4ED8;
  }
  .detail-time {
    font-size: 11.5px;
    color: var(--text-2);
    display: flex;
    align-items: center;
    gap: 5px;
    font-weight: 500;
  }
  .detail-body {
    flex: 1;
    overflow-y: auto;
    padding: 28px 28px 20px;
    font-size: 14px;
    line-height: 1.8;
    color: var(--text-1);
    white-space: pre-wrap;
    background: #fff;
  }
  .detail-attachment-bar {
    padding: 14px 28px 18px;
    border-top: 1.5px solid #E8EEFF;
    background: #F8FAFF;
  }
  .attach-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--text-2);
    margin-bottom: 10px;
  }
  .attach-card {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    border: 1.5px solid #E0E8FF;
    border-radius: 12px;
    padding: 10px 14px;
    margin-right: 10px;
    margin-bottom: 10px;
  }
  .attach-card-icon {
    width: 36px; height: 36px;
    border-radius: 9px;
    background: linear-gradient(135deg, #FFF1F2, #FFE4E6);
    border: 1.5px solid #FECDD3;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .attach-card-name {
    font-size: 12.5px;
    font-weight: 700;
    color: var(--text-1);
    max-width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .attach-card-type {
    font-size: 10.5px;
    color: var(--text-2);
    font-weight: 500;
  }
  .pdf-action-btn {
    border: none;
    border-radius: 8px;
    padding: 6px 11px;
    font-size: 11.5px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: all .18s ease;
  }
  .pdf-view-btn {
    background: linear-gradient(135deg, #EEF4FF, #DBEAFE);
    color: #1D4ED8;
    border: 1.5px solid #BFDBFE;
  }
  .pdf-view-btn:hover { background: #DBEAFE; transform: translateY(-1px); }
  .pdf-dl-btn {
    background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
    color: #065F46;
    border: 1.5px solid #A7F3D0;
  }
  .pdf-dl-btn:hover { background: #D1FAE5; transform: translateY(-1px); }
  .pdf-loading-btn {
    background: #F1F5F9;
    color: #94A3B8;
    border: 1.5px solid #E2E8F0;
    cursor: not-allowed;
  }
  .compose-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .compose-topbar {
    padding: 20px 28px 16px;
    border-bottom: 1.5px solid #E8EEFF;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .compose-title {
    font-size: 1rem;
    font-weight: 800;
    color: var(--text-1);
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .compose-body {
    flex: 1;
    padding: 22px 28px;
    background: #fff;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .field-group label {
    display: block;
    font-size: 10.5px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-2);
    margin-bottom: 7px;
  }
  .field-input {
    width: 100%;
    padding: 11px 14px;
    border-radius: 12px;
    border: 1.5px solid #E0E8FF;
    background: #F8FAFF;
    font-size: 13.5px;
    color: var(--text-1);
    outline: none;
    transition: all .2s ease;
    font-family: 'Sora', sans-serif;
  }
  .field-input:focus {
    border-color: var(--accent);
    background: #fff;
    box-shadow: 0 0 0 4px rgba(59,126,248,0.07);
  }
  .compose-footer {
    padding: 14px 28px 20px;
    border-top: 1.5px solid #E8EEFF;
    background: #F8FAFF;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .file-attach-label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: #fff;
    border: 1.5px solid #E0E8FF;
    border-radius: 10px;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-2);
    cursor: pointer;
    transition: all .18s ease;
  }
  .file-attach-label:hover { border-color: var(--accent); color: var(--accent); }
  .file-attached-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #FFF1F2;
    border: 1.5px solid #FECDD3;
    border-radius: 8px;
    padding: 5px 10px;
    font-size: 11.5px;
    font-weight: 600;
    color: #9F1239;
    max-width: 180px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .send-btn {
    background: linear-gradient(135deg, var(--accent), #2563EB);
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 10px 22px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    box-shadow: 0 4px 14px rgba(59,126,248,0.32);
    transition: all .2s ease;
    letter-spacing: -0.01em;
  }
  .send-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59,126,248,0.42); }
  .send-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .toast-success {
    display: flex; align-items: center; gap: 9px;
    background: linear-gradient(135deg,#ECFDF5,#D1FAE5);
    border: 1.5px solid #A7F3D0;
    color: #065F46;
    border-radius: 12px;
    padding: 11px 15px;
    font-size: 13px; font-weight: 600;
    margin: 0 28px 16px;
  }
  .toast-error {
    display: flex; align-items: center; gap: 9px;
    background: linear-gradient(135deg,#FFF1F2,#FFE4E6);
    border: 1.5px solid #FECDD3;
    color: #9F1239;
    border-radius: 12px;
    padding: 11px 15px;
    font-size: 13px; font-weight: 600;
    margin: 0 28px 16px;
  }

  .empty-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 16px;
    text-align: center;
    color: var(--text-2);
    gap: 10px;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(59,126,248,.2); border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(59,126,248,.4); }

  @keyframes spin { to { transform: rotate(360deg); } }
  .animate-spin { animation: spin 0.8s linear infinite; }

  @media (max-width: 768px) {
    .mail-shell {
      flex-direction: column;
      border-radius: 16px;
    }
    .mail-list-pane {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid #E8EEFF;
    }
    .mail-detail-pane {
      width: 100%;
    }
    .detail-header, .detail-body, .detail-attachment-bar, .compose-topbar, .compose-body, .compose-footer {
      padding-left: 16px;
      padding-right: 16px;
    }
    .compose-body textarea {
      min-height: 150px;
    }
    .attach-card {
      width: calc(100% - 20px);
      margin-right: 0;
    }
    .attach-card-name {
      max-width: 120px;
    }
  }
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

const DoctorCommunication = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [communications, setCommunications] = useState([]);
  const [loadingComms, setLoadingComms] = useState(true);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("inbox");
  const [section, setSection] = useState("messages");
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [pdfLoading, setPdfLoading] = useState({});

  const fileInputRef = useRef(null);
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
    { to: "/docmail", icon: <FaEnvelope />, label: "Communication", active: true },
    { to: "/doctuto", icon: <FaGraduationCap />, label: "Tutoriel" },
    { to: "/docsettings", icon: <FaCog />, label: "Paramètres" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { navigate("/login"); return; }
    const parsed = JSON.parse(userData);
    if (parsed.role !== "medecin") { navigate("/dashboard"); return; }
    setUser(parsed);

    performIntegrityCheck(navigate, null, true)
      .then(() => {
        fetchCommunications();
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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchCommunications = async () => {
    setLoadingComms(true);
    try {
      const res = await api.get("/doctor/communications");
      setCommunications(res.data);
    } catch {
    } finally {
      setLoadingComms(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => file.type === "application/pdf" && file.size <= 10 * 1024 * 1024);
    if (validFiles.length !== selectedFiles.length) {
      alert("Seuls les fichiers PDF de moins de 10 Mo sont acceptés.");
    }
    setFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError("");
    const fd = new FormData();
    fd.append("recipient_email", recipientEmail);
    fd.append("message", message);
    files.forEach((file) => {
      fd.append("files[]", file);
    });
    try {
      await api.post("/doctor/communications", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitSuccess(true);
      setRecipientEmail("");
      setMessage("");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchCommunications();
      setTimeout(() => {
        setSubmitSuccess(false);
        setView("inbox");
        if (isMobile) {
          setSelected(null);
        }
      }, 1800);
    } catch (err) {
      if (err.response?.data?.errors)
        setSubmitError(Object.values(err.response.data.errors).flat().join(", "));
      else setSubmitError("Erreur lors de l'envoi. Vérifiez votre connexion.");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchBlobAndAct = async (id, index, action) => {
    const key = `${id}-${index}-${action}`;
    setPdfLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const token = localStorage.getItem("token");
      const endpoint = action === "view" ? "view" : "download";
      const response = await fetch(`${API_BASE}/doctor/communications/${id}/${endpoint}/${index}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      if (action === "view") {
        window.open(blobUrl, "_blank");
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      } else {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `document-${id}-${index}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      }
    } catch (error) {
      console.error("PDF fetch error:", error);
      alert("Impossible de charger le fichier PDF. Vérifiez votre connexion.");
    } finally {
      setPdfLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleLogout = () => {
    if (integrityInterval.current) clearInterval(integrityInterval.current);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userIntegrityHash");
    navigate("/login");
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleString("fr-FR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };
  const formatShort = (d) => {
    if (!d) return "";
    const date = new Date(d);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  };

  const getFilteredMessages = () => {
    let filtered = communications;
    if (activeTab !== "all") {
      filtered = filtered.filter(comm => comm.direction === activeTab);
    }
    if (search.trim() !== "") {
      filtered = filtered.filter(
        (c) =>
          c.other_party_email.toLowerCase().includes(search.toLowerCase()) ||
          c.message.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered;
  };

  const filtered = getFilteredMessages();

  const showListOnMobile = () => {
    if (view === "compose") return false;
    if (selected) return false;
    return true;
  };

  const showDetailOnMobile = () => {
    return view === "inbox" && selected !== null;
  };

  const showComposeOnMobile = () => {
    return view === "compose";
  };

  const goBackToList = () => {
    setSelected(null);
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
          <span className="text-sm" style={{ color: "#94A3B8" }}>Chargement...</span>
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

      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#EEF4FF", border: "1px solid #BFDBFE",
              borderRadius: 99, padding: "3px 12px",
              fontSize: 10.5, fontWeight: 700, color: "#1D4ED8",
              textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4,
            }}>
              <FaEnvelope size={9} /> Messagerie
            </div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.03em", lineHeight: 1.2 }}>
              Communications
            </h2>
          </div>
            <div className="flex items-center gap-3 flex-wrap justify-end">
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid #E0E8FF", borderRadius: 999, padding: 4 }}>
                <button
                  onClick={() => setSection("messages")}
                  style={{
                    border: "none",
                    borderRadius: 999,
                    padding: "8px 14px",
                    background: section === "messages" ? "linear-gradient(135deg, var(--accent), #2563EB)" : "transparent",
                    color: section === "messages" ? "#fff" : "var(--text-2)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <FaEnvelope size={10} style={{ marginRight: 6 }} /> Messagerie
                </button>
                <button
                  onClick={() => setSection("assistant")}
                  style={{
                    border: "none",
                    borderRadius: 999,
                    padding: "8px 14px",
                    background: section === "assistant" ? "linear-gradient(135deg, #0F766E, #115E59)" : "transparent",
                    color: section === "assistant" ? "#fff" : "var(--text-2)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <FaRobot size={10} style={{ marginRight: 6 }} /> Assistant IA
                </button>
              </div>
              <button onClick={fetchCommunications}
                style={{ width: 38, height: 38, borderRadius: 10, border: "1.5px solid #E0E8FF", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                title="Actualiser">
                <FaSync size={13} style={{ color: "#64748B" }} />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid #E0E8FF", borderRadius: 12, padding: "6px 12px" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs db-logo-ring" style={{ fontWeight: 700, width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {user?.name?.charAt(0) || "D"}
              </div>
              <span className="hidden sm:inline" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>
                Dr. {user?.name || "Médecin"}
              </span>
            </div>
          </div>
        </div>

        {section === "messages" ? (
            <div className="mail-shell mx-6 mb-6" style={{ height: "calc(100vh - 112px)" }}>
              {!isMobile ? (
                <>
                  <div className="mail-list-pane">
                    <div className="mail-list-header">
                      <button className="compose-btn" onClick={() => { setView("compose"); setSelected(null); }}>
                        <FaEdit size={12} /> Nouveau message
                      </button>
                      <div className="tab-switch">
                        <button
                          className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
                          onClick={() => { setActiveTab("all"); setSelected(null); }}
                        >
                          <FaInbox size={10} /> Tous
                        </button>
                        <button
                          className={`tab-btn ${activeTab === "sent" ? "active" : ""}`}
                          onClick={() => { setActiveTab("sent"); setSelected(null); }}
                        >
                          <FaPaperPlane size={10} /> Envoyés
                        </button>
                        <button
                          className={`tab-btn ${activeTab === "received" ? "active" : ""}`}
                          onClick={() => { setActiveTab("received"); setSelected(null); }}
                        >
                          <FaEnvelope size={10} /> Reçus
                        </button>
                      </div>
                      <div className="search-wrap">
                        <FaSearch size={11} style={{ color: "#94A3B8" }} />
                        <input
                          type="text"
                          placeholder="Rechercher par email..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ padding: "10px 16px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-2)" }}>
                        {activeTab === "all" && "Tous les messages"}
                        {activeTab === "sent" && "Messages envoyés"}
                        {activeTab === "received" && "Messages reçus"}
                      </span>
                      <span style={{ background: "#EEF4FF", color: "var(--accent)", borderRadius: 99, padding: "1px 8px", fontSize: 10, fontWeight: 800 }}>
                        {filtered.length}
                      </span>
                    </div>

                    <div className="msg-list">
                      {loadingComms ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
                          <div style={{ width: 28, height: 28, border: "2px solid #BFDBFE", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        </div>
                      ) : filtered.length === 0 ? (
                        <div className="empty-list">
                          <FaInbox size={28} style={{ color: "#C7D2FE", marginBottom: 8 }} />
                          <p style={{ fontSize: 13, fontWeight: 600 }}>Aucun message</p>
                          <p style={{ fontSize: 11.5 }}>
                            {activeTab === "sent" && "Vous n'avez envoyé aucun message."}
                            {activeTab === "received" && "Vous n'avez reçu aucun message."}
                            {activeTab === "all" && "Cliquez sur « Nouveau message » pour commencer."}
                          </p>
                        </div>
                      ) : (
                        filtered.map((comm) => (
                          <div
                            key={comm.id}
                            className={`msg-list-item ${selected?.id === comm.id ? "selected" : ""}`}
                            onClick={() => { setSelected(comm); setView("inbox"); }}
                          >
                            <div className="msg-li-recipient">
                              <FaAt size={9} style={{ opacity: 0.5 }} />
                              {comm.direction === 'sent' ? `À : ${comm.other_party_email}` : `De : ${comm.other_party_email}`}
                            </div>
                            <div className="msg-li-preview">{comm.message}</div>
                            <div className="msg-li-meta">
                              <span className="msg-li-time">
                                <FaRegClock size={9} style={{ marginRight: 3 }} />
                                {formatShort(comm.created_at)}
                              </span>
                              {comm.file_path && comm.file_path.length > 0 && (
                                <span className="msg-li-attach">
                                  <FaPaperclip size={8} /> {comm.file_path.length} fichier(s)
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mail-detail-pane">
                    {view === "compose" && (
                      <div className="compose-pane">
                        <div className="compose-topbar">
                          <div className="compose-title">
                            <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,var(--accent),#2563EB)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <FaPaperPlane size={12} style={{ color: "#fff" }} />
                            </div>
                            Nouveau message
                          </div>
                          <button
                            onClick={() => setView("inbox")}
                            style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #E0E8FF", background: "#F8FAFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                            title="Fermer"
                          >
                            <FaTimes size={12} style={{ color: "#94A3B8" }} />
                          </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                          <div className="compose-body">
                            <div className="field-group">
                              <label>À (destinataire)</label>
                              <div style={{ position: "relative" }}>
                                <FaAt size={12} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                                <input
                                  type="email"
                                  required
                                  placeholder="adresse@exemple.com"
                                  value={recipientEmail}
                                  onChange={(e) => setRecipientEmail(e.target.value)}
                                  className="field-input"
                                  style={{ paddingLeft: 32 }}
                                />
                              </div>
                            </div>

                            <div style={{ borderTop: "1px solid #EEF1FF", margin: "0 -28px", padding: "0 28px" }} />

                            <div className="field-group" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                              <label>Message</label>
                              <textarea
                                required
                                rows="10"
                                placeholder="Rédigez votre message ici..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="field-input"
                                style={{ resize: "none", flex: 1, minHeight: 200 }}
                              />
                            </div>
                          </div>

                          <div style={{ padding: "0 28px", marginBottom: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <input
                                type="file"
                                accept=".pdf"
                                id="pdf-file-input"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                multiple
                                style={{ display: "none" }}
                              />
                              <label htmlFor="pdf-file-input" className="file-attach-label">
                                <FaPlus size={10} /> Ajouter un PDF
                              </label>
                              {files.map((file, idx) => (
                                <span key={idx} className="file-attached-chip">
                                  <FaFilePdf size={10} />
                                  {file.name}
                                  <button
                                    type="button"
                                    onClick={() => removeFile(idx)}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "#9F1239", padding: 0, marginLeft: 2 }}
                                  >
                                    <FaTimes size={9} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>

                          {submitSuccess && (
                            <div className="toast-success">
                              <FaCheckCircle size={14} /> Message envoyé avec succès !
                            </div>
                          )}
                          {submitError && (
                            <div className="toast-error">
                              <FaExclamationCircle size={14} /> {submitError}
                            </div>
                          )}

                          <div className="compose-footer">
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }} />
                            <button type="submit" disabled={submitting} className="send-btn">
                              {submitting
                                ? <><FaSpinner className="animate-spin" size={12} /> Envoi...</>
                                : <><FaPaperPlane size={12} /> Envoyer</>
                              }
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {view === "inbox" && !selected && (
                      <div className="empty-pane">
                        <div className="empty-pane-icon">
                          <FaEnvelope size={30} style={{ color: "#93C5FD" }} />
                        </div>
                        <p style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-1)", marginBottom: 6 }}>
                          Aucun message sélectionné
                        </p>
                        <p style={{ fontSize: 13, color: "var(--text-2)", maxWidth: 260, lineHeight: 1.6 }}>
                          Choisissez un message dans la liste ou composez-en un nouveau.
                        </p>
                        <button
                          onClick={() => setView("compose")}
                          className="send-btn"
                          style={{ marginTop: 20 }}
                        >
                          <FaEdit size={12} /> Nouveau message
                        </button>
                      </div>
                    )}

                    {view === "inbox" && selected && (
                      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
                        <div className="detail-header">
                          <div className="detail-subject">
                            {selected.direction === 'sent' ? (
                              <>Message à {selected.other_party_email}</>
                            ) : (
                              <>Message de {selected.other_party_email}</>
                            )}
                          </div>
                          <div className="detail-meta-row">
                            <span className="detail-recipient">
                              <FaAt size={10} /> {selected.direction === 'sent' ? `Destinataire : ${selected.other_party_email}` : `Expéditeur : ${selected.other_party_email}`}
                            </span>
                            <span className="detail-time">
                              <FaRegClock size={10} />
                              {formatDate(selected.created_at)}
                            </span>
                          </div>
                        </div>

                        <div className="detail-body">
                          {selected.message}
                        </div>

                        {selected.file_path && selected.file_path.length > 0 && (
                          <div className="detail-attachment-bar">
                            <p className="attach-label">Pièces jointes ({selected.file_path.length})</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                              {selected.file_path.map((filePath, idx) => {
                                const fileName = filePath.split("/").pop();
                                const viewKey = `${selected.id}-${idx}-view`;
                                const downloadKey = `${selected.id}-${idx}-download`;
                                return (
                                  <div key={idx} className="attach-card">
                                    <div className="attach-card-icon">
                                      <FaFilePdf size={16} style={{ color: "var(--rose)" }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div className="attach-card-name">
                                        {fileName}
                                      </div>
                                      <div className="attach-card-type">Fichier PDF</div>
                                    </div>
                                    <div style={{ display: "flex", gap: 6 }}>
                                      {pdfLoading[viewKey] ? (
                                        <button className="pdf-action-btn pdf-loading-btn" disabled>
                                          <FaSpinner className="animate-spin" size={10} /> Chargement...
                                        </button>
                                      ) : (
                                        <button
                                          className="pdf-action-btn pdf-view-btn"
                                          onClick={() => fetchBlobAndAct(selected.id, idx, "view")}
                                        >
                                          <FaEye size={10} /> Voir
                                        </button>
                                      )}
                                      {pdfLoading[downloadKey] ? (
                                        <button className="pdf-action-btn pdf-loading-btn" disabled>
                                          <FaSpinner className="animate-spin" size={10} /> ...
                                        </button>
                                      ) : (
                                        <button
                                          className="pdf-action-btn pdf-dl-btn"
                                          onClick={() => fetchBlobAndAct(selected.id, idx, "download")}
                                        >
                                          <FaDownload size={10} /> Télécharger
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
                    )}
                  </div>
                </>
              ) : (
                <div className="mx-6 mb-6" style={{ height: "calc(100vh - 112px)" }}>
                  <DoctorAssistantChat />
                </div>
              )}
            </div>
          ) : (
            <div className="mx-6 mb-6" style={{ height: "calc(100vh - 112px)" }}>
              <DoctorAssistantChat />
            </div>
          )}
      </main>
    </div>
  );
};

export default DoctorCommunication;