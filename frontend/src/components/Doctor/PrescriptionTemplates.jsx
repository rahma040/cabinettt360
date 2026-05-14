import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import { fabric } from "fabric";
import {
  FaHome, 
  FaUserInjured, 
  FaCalendarCheck, 
  FaCog, 
  FaSignOutAlt,
  FaBars, 
  FaTimes, 
  FaPlus, 
  FaTrash, 
  FaFileMedical,
  FaImage, 
  FaFont, 
  FaEraser, 
  FaSave, 
  FaCopy, 
  FaArrowUp, 
  FaArrowDown,
  FaPalette, 
  FaAlignLeft, 
  FaAlignCenter, 
  FaAlignRight, 
  FaAlignJustify,
  FaBold, 
  FaItalic, 
  FaUnderline, 
  FaSearchPlus, 
  FaSearchMinus,
  FaVectorSquare, 
  FaCircle, 
  FaMinus, 
  FaUserClock, 
  FaUserPlus,
  FaStethoscope, 
  FaChartLine, 
  FaTasks, 
  FaFilePrescription,
  FaExclamationCircle, 
  FaCheckCircle, 
  FaLayerGroup,
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

  .pt-sidebar { background: linear-gradient(180deg,var(--navy) 0%,var(--navy-mid) 60%,var(--navy-light) 100%); }
  .pt-logo-ring { background: linear-gradient(135deg,var(--accent),#2563EB); }
  .pt-nav-link { transition:all .2s ease; border-left:3px solid transparent; color:rgba(255,255,255,.48); font-size:14px; }
  .pt-nav-link:hover { background:rgba(59,126,248,.14); border-left-color:var(--accent); color:#fff; }
  .pt-nav-link.active { background:rgba(59,126,248,.22); border-left-color:var(--accent); color:#fff; }
  .pt-toggle { background:linear-gradient(135deg,var(--accent),#2563EB); box-shadow:0 4px 14px rgba(59,126,248,.4); }

  .btn-accent { background:linear-gradient(135deg,var(--accent),#2563EB); color:#fff; box-shadow:0 4px 14px rgba(59,126,248,.32); transition:all .2s ease; }
  .btn-accent:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(59,126,248,.42); }
  .btn-emerald { background:linear-gradient(135deg,var(--emerald),#059669); color:#fff; box-shadow:0 4px 14px rgba(16,185,129,.28); transition:all .2s ease; }
  .btn-emerald:hover { transform:translateY(-1px); }
  .btn-rose { background:linear-gradient(135deg,var(--rose),#BE123C); color:#fff; box-shadow:0 4px 14px rgba(244,63,94,.28); transition:all .2s ease; }
  .btn-rose:hover { transform:translateY(-1px); }
  .btn-ghost { border:1.5px solid #E2E8F0; color:#64748B; background:#fff; transition:all .18s ease; }
  .btn-ghost:hover { background:#F8FAFF; border-color:rgba(59,126,248,.3); color:var(--accent); }
  .btn-ghost:disabled { opacity:.4; cursor:not-allowed; transform:none !important; }

  .pt-input { border:1.5px solid #E2E8F0; background:#fff; transition:all .2s ease; font-size:14px; }
  .pt-input:focus { outline:none; border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-glow); }

  .tmpl-item { border:1.5px solid #E8EEFF; border-radius:14px; background:#FAFBFF; transition:all .22s cubic-bezier(.4,0,.2,1); cursor:pointer; }
  .tmpl-item:hover { border-color:rgba(59,126,248,.28); background:#F0F4FF; transform:translateX(3px); }
  .tmpl-item.selected { border-color:var(--accent); background:linear-gradient(135deg,#EEF4FF,#F0F4FF); box-shadow:0 4px 16px var(--accent-glow); }

  .tool-btn { border:1.5px solid #E2E8F0; background:#fff; border-radius:12px; transition:all .18s ease; color:var(--text-2); }
  .tool-btn:hover { border-color:rgba(59,126,248,.3); background:#F0F4FF; color:var(--accent); }
  .tool-btn:disabled { opacity:.4; cursor:not-allowed; }
  .tool-btn.active-fmt { border-color:var(--accent); background:#EEF4FF; color:var(--accent); }

  .canvas-wrapper { border:2px solid #E8EEFF; border-radius:16px; overflow:hidden; background:#F8FAFF;
    box-shadow:0 8px 40px rgba(6,13,31,.1), inset 0 0 0 1px rgba(255,255,255,.5); }
  .canvas-inner { background:#fff; display:inline-block; }

  .sec-card { background:#fff; border-radius:20px; border:1.5px solid var(--border); }

  .tool-sep { width:1.5px; height:24px; background:#E2E8F0; flex-shrink:0; }

  .modal-overlay { background:rgba(6,13,31,.62); backdrop-filter:blur(7px); }
  .modal-box { animation:mIn .24s cubic-bezier(.4,0,.2,1); }
  @keyframes mIn { from{opacity:0;transform:scale(.95) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);} }

  .err-banner { background:#FFF1F2; border:1.5px solid #FECDD3; color:#9F1239; border-radius:14px; }

  .editing-badge { background:#EEF4FF; border:1.5px solid #BFDBFE; color:#1E40AF; border-radius:10px; }

  .toast-ok  { background:linear-gradient(135deg,#10B981,#059669); }
  .toast-err { background:linear-gradient(135deg,#F43F5E,#BE123C); }
  .toast-item { animation:toastIn .28s cubic-bezier(.4,0,.2,1); box-shadow:0 8px 24px rgba(6,13,31,.18); }
  @keyframes toastIn { from{opacity:0;transform:translateX(60px);}to{opacity:1;transform:translateX(0);} }

  .mono { font-family:'JetBrains Mono',monospace; }

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
    console.error("Integrity check failed", err);
    clearAndRedirect(navigate);
  }
};

function PrescriptionTemplates() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [canvas, setCanvas] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isHistoryLock, setIsHistoryLock] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [newTextContent, setNewTextContent] = useState("");
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState({ title: "", message: "", onConfirm: null });
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertModalConfig, setAlertModalConfig] = useState({ title: "", message: "" });

  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(20);
  const [fontWeight, setFontWeight] = useState("normal");
  const [fontStyle, setFontStyle] = useState("normal");
  const [underline, setUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState("left");
  const [textColor, setTextColor] = useState("#000000");
  const [lineHeight, setLineHeight] = useState(1.2);
  const [charSpacing, setCharSpacing] = useState(0);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [fillColor, setFillColor] = useState("#ffffff");

  const canvasRef = useRef(null);
  const canvasInitialized = useRef(false);
  const fileInputRef = useRef(null);
  const integrityInterval = useRef(null);

  const getToken = () => localStorage.getItem("token");
  const isAuthenticated = () => !!(getToken() && localStorage.getItem("user"));

  const addToast = (message, type = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const showAlert = (title, message) => {
    if (title === "Succès") { addToast(message, "ok"); return; }
    setAlertModalConfig({ title, message });
    setShowAlertModal(true);
  };

  const showConfirm = (title, message, onConfirm) => {
    setConfirmModalConfig({ title, message, onConfirm: () => { onConfirm(); setShowConfirmModal(false); } });
    setShowConfirmModal(true);
  };

  const navItems = [
    { to: "/docdb", icon: <FaHome />, label: "Tableau de bord" },
    { to: "/patients", icon: <FaUserInjured />, label: "Patients" },
    { to: "/prescription", icon: <FaFileMedical />, label: "Ordonnance", active: true },
    { to: "/rendezvous", icon: <FaCalendarCheck />, label: "Rendez-vous" },
    { to: "/docwaiting", icon: <FaUserClock />, label: "Salle d'attente" },
    { to: "/createsec", icon: <FaUserPlus />, label: "Secrétaire" },
    { to: "/docstats", icon: <FaChartLine />, label: "Statistiques" },
    { to: "/doctasks", icon: <FaTasks />, label: "Tâches" },
    { to: "/docmail", icon: <FaEnvelope />, label: "Communication" },
    { to: "/doctuto", icon: <FaGraduationCap />, label: "Tutoriel" },
    { to: "/docsettings", icon: <FaCog />, label: "Paramètres" },
  ];

  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: "ease-out-cubic" });
    if (!isAuthenticated()) { navigate("/login"); return; }
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

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

  useEffect(() => { if (doctorInfo) fetchTemplates(); }, [doctorInfo]);

  useEffect(() => {
    if (!loading && doctorInfo && canvasRef.current && !canvasInitialized.current) {
      initCanvas();
    }
  }, [loading, doctorInfo]);

  const initCanvas = () => {
    try {
      canvasInitialized.current = true;
      const el = canvasRef.current;
      if (!el) return;

      const inst = new fabric.Canvas(el, {
        width: 800, height: 1131,
        backgroundColor: "white",
        preserveObjectStacking: true,
      });

      const resize = () => {
        if (!inst || !el.parentElement) return;
        const w = el.parentElement.clientWidth;
        const scale = Math.min(w / 800, 1);
        inst.setDimensions({ width: 800 * scale, height: 1131 * scale });
        inst.setZoom(scale);
        setZoom(scale);
        inst.renderAll();
      };
      setTimeout(resize, 100);
      window.addEventListener("resize", resize);

      setCanvas(inst);
      setIsCanvasReady(true);
      const init = JSON.stringify(inst.toJSON(["id", "name", "type"]));
      setHistory([init]);
      setHistoryIndex(0);

      return () => { window.removeEventListener("resize", resize); inst.dispose(); };
    } catch (err) {
      console.error("Canvas init error:", err);
      canvasInitialized.current = false;
      setIsCanvasReady(false);
    }
  };

  useEffect(() => {
    if (!canvas || !isCanvasReady) return;
    const handleSel = () => {
      const active = canvas.getActiveObject();
      if (active) {
        setSelectedObject(active);
        if (active.type === "i-text") {
          setFontFamily(active.fontFamily || "Arial");
          setFontSize(active.fontSize || 20);
          setFontWeight(active.fontWeight || "normal");
          setFontStyle(active.fontStyle || "normal");
          setUnderline(active.underline || false);
          setTextAlign(active.textAlign || "left");
          setTextColor(active.fill || "#000000");
          setLineHeight(active.lineHeight || 1.2);
          setCharSpacing(active.charSpacing / 1000 || 0);
        } else if (["path", "rect", "circle"].includes(active.type)) {
          setStrokeWidth(active.strokeWidth || 2);
          setStrokeColor(active.stroke || "#000000");
          setFillColor(active.fill || "#ffffff");
        }
      } else { setSelectedObject(null); }
    };
    canvas.on("selection:created", handleSel);
    canvas.on("selection:updated", handleSel);
    canvas.on("selection:cleared", () => setSelectedObject(null));
    return () => {
      canvas.off("selection:created", handleSel);
      canvas.off("selection:updated", handleSel);
      canvas.off("selection:cleared", () => setSelectedObject(null));
    };
  }, [canvas, isCanvasReady]);

  const saveHistory = useCallback(() => {
    if (!canvas || isHistoryLock || !isCanvasReady) return;
    const state = JSON.stringify(canvas.toJSON(["id", "name", "type"]));
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), state]);
    setHistoryIndex((prev) => prev + 1);
  }, [canvas, historyIndex, isHistoryLock, isCanvasReady]);

  useEffect(() => {
    if (!canvas || !isCanvasReady) return;
    canvas.on("object:modified", saveHistory);
    canvas.on("object:added", saveHistory);
    canvas.on("object:removed", saveHistory);
    return () => {
      canvas.off("object:modified", saveHistory);
      canvas.off("object:added", saveHistory);
      canvas.off("object:removed", saveHistory);
    };
  }, [canvas, saveHistory, isCanvasReady]);

  const fetchCurrentUser = async () => {
    const token = getToken();
    if (!token) { navigate("/login"); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
      if (!res.ok) {
        if (res.status === 401) { clearAndRedirect(navigate); return; }
        throw new Error("Auth failed");
      }
      setDoctorInfo(await res.json());
    } catch (err) {
      console.error(err);
      setDoctorInfo(JSON.parse(localStorage.getItem("user") || "{}"));
    } finally { setLoading(false); }
  };

  const fetchTemplates = async () => {
    const token = getToken(); if (!token) return;
    setApiError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/prescription-templates`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
      if (res.ok) { setTemplates(await res.json()); }
      else if (res.status === 401) { clearAndRedirect(navigate); }
      else if (res.status === 404) { setApiError("L'API des modèles n'est pas disponible."); }
      else { const e = await res.json(); setApiError(e.error || "Erreur lors du chargement"); }
    } catch (err) { console.error(err); setApiError("Erreur de connexion au serveur"); }
  };

  const applyFormatting = (updates) => {
    if (!canvas || !selectedObject || !isCanvasReady) return;
    selectedObject.set(updates); canvas.renderAll(); saveHistory();
  };

  const addTextFromModal = () => {
    if (!canvas || !isCanvasReady) { showAlert("Erreur", "Canvas non prêt"); return; }
    if (!newTextContent.trim()) { setShowTextModal(false); return; }
    const fabricText = new fabric.IText(newTextContent.trim(), { left: 100, top: 100, fontFamily, fontSize, fontWeight, fontStyle, underline, textAlign, fill: textColor, lineHeight, charSpacing: charSpacing * 1000 });
    canvas.add(fabricText); canvas.setActiveObject(fabricText); canvas.renderAll(); saveHistory();
    setShowTextModal(false); setNewTextContent("");
  };

  const addImage = () => fileInputRef.current.click();

  const handleImageUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        if (!canvas || !isCanvasReady) return;
        const fImg = new fabric.Image(img);
        const maxW = 300, maxH = 300;
        if (img.width > maxW || img.height > maxH) fImg.scale(Math.min(maxW / img.width, maxH / img.height));
        const c = canvas.getCenter();
        fImg.set({ left: c.left, top: c.top, originX: "center", originY: "center" });
        canvas.add(fImg); canvas.setActiveObject(fImg); canvas.renderAll(); saveHistory();
      };
      img.onerror = () => showAlert("Erreur", "Image non chargeable.");
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file); e.target.value = "";
  };

  const addLine = () => {
    if (!canvas || !isCanvasReady) return;
    const line = new fabric.Line([50, 50, 200, 50], { left: 100, top: 100, stroke: strokeColor, strokeWidth });
    canvas.add(line); canvas.setActiveObject(line); canvas.renderAll(); saveHistory();
  };

  const addRectangle = () => {
    if (!canvas || !isCanvasReady) return;
    const rect = new fabric.Rect({ left: 100, top: 100, width: 100, height: 80, fill: fillColor, stroke: strokeColor, strokeWidth });
    canvas.add(rect); canvas.setActiveObject(rect); canvas.renderAll(); saveHistory();
  };

  const addCircle = () => {
    if (!canvas || !isCanvasReady) return;
    const circle = new fabric.Circle({ left: 100, top: 100, radius: 50, fill: fillColor, stroke: strokeColor, strokeWidth });
    canvas.add(circle); canvas.setActiveObject(circle); canvas.renderAll(); saveHistory();
  };

  const clearCanvas = () => {
    if (!canvas || !isCanvasReady) return;
    showConfirm("Effacer tout", "Voulez-vous effacer tout le contenu du canvas ?", () => {
      canvas.clear(); canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
      setCurrentTemplate(null); setTemplateName(""); saveHistory();
    });
  };

  const newTemplate = () => {
    if (!canvas || !isCanvasReady) return;
    canvas.clear(); canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
    setCurrentTemplate(null); setTemplateName(""); saveHistory();
  };

  const duplicateObject = () => {
    if (!canvas || !selectedObject || !isCanvasReady) return;
    if (selectedObject.type === "i-text") {
      const t = new fabric.IText(selectedObject.text, { left: selectedObject.left + 20, top: selectedObject.top + 20, fontFamily: selectedObject.fontFamily, fontSize: selectedObject.fontSize, fontWeight: selectedObject.fontWeight, fontStyle: selectedObject.fontStyle, underline: selectedObject.underline, textAlign: selectedObject.textAlign, fill: selectedObject.fill, lineHeight: selectedObject.lineHeight, charSpacing: selectedObject.charSpacing });
      canvas.add(t); canvas.setActiveObject(t); canvas.renderAll(); saveHistory();
    } else if (selectedObject.type === "image") {
      fabric.Image.fromURL(selectedObject.getSrc(), (img) => {
        img.set({ left: selectedObject.left + 20, top: selectedObject.top + 20, scaleX: selectedObject.scaleX, scaleY: selectedObject.scaleY });
        canvas.add(img); canvas.setActiveObject(img); canvas.renderAll(); saveHistory();
      });
    } else {
      selectedObject.clone((cloned) => {
        cloned.set({ left: selectedObject.left + 20, top: selectedObject.top + 20 });
        canvas.add(cloned); canvas.setActiveObject(cloned); canvas.renderAll(); saveHistory();
      });
    }
  };

  const bringForward = () => {
    if (!canvas || !selectedObject || !isCanvasReady) return;
    const objs = canvas.getObjects(); const idx = objs.indexOf(selectedObject);
    if (idx < objs.length - 1) { canvas.moveTo(selectedObject, idx + 1); canvas.renderAll(); saveHistory(); }
  };

  const bringBackward = () => {
    if (!canvas || !selectedObject || !isCanvasReady) return;
    const objs = canvas.getObjects(); const idx = objs.indexOf(selectedObject);
    if (idx > 0) { canvas.moveTo(selectedObject, idx - 1); canvas.renderAll(); saveHistory(); }
  };

  const deleteSelected = () => {
    if (!canvas || !selectedObject || !isCanvasReady) return;
    canvas.remove(selectedObject); canvas.renderAll(); saveHistory();
  };

  const zoomIn = () => { if (!canvas || !isCanvasReady) return; const nz = Math.min(zoom + 0.1, 2); canvas.setZoom(nz); setZoom(nz); };
  const zoomOut = () => { if (!canvas || !isCanvasReady) return; const nz = Math.max(zoom - 0.1, 0.5); canvas.setZoom(nz); setZoom(nz); };
  const resetZoom = () => {
    if (!canvas || !isCanvasReady) return;
    const container = canvasRef.current?.parentElement;
    if (container) { const scale = Math.min(container.clientWidth / 800, 1); canvas.setZoom(scale); setZoom(scale); }
  };

  const saveTemplate = async () => {
    if (!canvas || !isCanvasReady) return;
    if (!templateName.trim()) { showAlert("Nom requis", "Veuillez donner un nom au modèle."); return; }
    const templateData = JSON.stringify(canvas.toJSON(["id", "name", "type", "version"]));
    const token = getToken(); if (!token) return;
    try {
      const url = currentTemplate ? `${API_BASE_URL}/prescription-templates/${currentTemplate.id}` : `${API_BASE_URL}/prescription-templates`;
      const res = await fetch(url, { method: currentTemplate ? "PUT" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: templateName, template_data: templateData }) });
      if (res.ok) { setShowSaveModal(false); setTemplateName(""); setCurrentTemplate(null); await fetchTemplates(); showAlert("Succès", "Modèle enregistré !"); }
      else { const e = await res.json(); showAlert("Erreur", e.error || "Erreur enregistrement"); }
    } catch (err) { console.error(err); showAlert("Erreur", "Erreur lors de l'enregistrement"); }
  };

  const loadTemplate = (tmpl) => {
    if (!canvas || !isCanvasReady) { showAlert("Erreur", "Canvas non prêt. Patientez…"); return; }
    try {
      const data = typeof tmpl.template_data === "string" ? JSON.parse(tmpl.template_data) : tmpl.template_data;
      canvas.loadFromJSON(data, () => { canvas.renderAll(); setCurrentTemplate(tmpl); setTemplateName(tmpl.name); saveHistory(); setTimeout(resetZoom, 100); });
    } catch (err) { console.error(err); showAlert("Erreur", "Erreur de chargement du modèle"); }
  };

  const deleteTemplate = async () => {
    if (!templateToDelete) return;
    const token = getToken(); if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/prescription-templates/${templateToDelete.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
      if (res.ok) {
        setShowDeleteConfirm(false); setTemplateToDelete(null); await fetchTemplates();
        if (currentTemplate?.id === templateToDelete.id) {
          setCurrentTemplate(null); setTemplateName("");
          if (canvas && isCanvasReady) { canvas.clear(); canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas)); }
        }
        showAlert("Succès", "Modèle supprimé");
      } else { showAlert("Erreur", "Erreur lors de la suppression"); }
    } catch (err) { console.error(err); showAlert("Erreur", "Erreur lors de la suppression"); }
  };

  const handleLogout = () => {
    if (integrityInterval.current) clearInterval(integrityInterval.current);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userIntegrityHash");
    navigate("/login");
  };

  const TB = "tool-btn px-3 py-2 flex items-center gap-1.5 text-xs"; 
  const TBI = "tool-btn p-2"; 
  const IC = "w-full p-3 rounded-xl text-sm pt-input";
  const LC = "block text-xs font-600 mb-1.5 uppercase tracking-wider";
  const LS = { color: "var(--text-2)", fontWeight: 600, letterSpacing: "0.07em" };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "linear-gradient(135deg,#060D1F,#0C1A3A)" }}>
        <style>{G}</style><FontInjector />
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 pt-logo-ring">
            <FaFilePrescription className="text-white text-2xl" />
          </div>
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-sm" style={{ color: "#94A3B8" }}>Chargement de l'éditeur…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface)" }}>
      <style>{G}</style><FontInjector />
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

      <div className="fixed top-5 right-5 z-[60] space-y-2 w-80">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item rounded-2xl px-4 py-3 flex items-center justify-between text-white ${t.type === "ok" ? "toast-ok" : "toast-err"}`}>
            <div className="flex items-center gap-2.5 text-sm" style={{ fontWeight: 600 }}>
              {t.type === "ok" ? <FaCheckCircle size={13} /> : <FaExclamationCircle size={13} />}
              {t.message}
            </div>
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} className="ml-3 hover:opacity-70"><FaTimes size={12} /></button>
          </div>
        ))}
      </div>

      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center text-white rounded-r-xl pt-toggle">
        {sidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
      </button>

      <aside className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 transition-transform duration-300 z-40 w-64 flex flex-col pt-sidebar`}>
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center pt-logo-ring flex-shrink-0">
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
              className={`pt-nav-link flex items-center gap-3 px-4 py-3 rounded-xl ${item.active ? "active" : ""}`}
              style={{ fontWeight: item.active ? 600 : 500 }}>
              <span style={{ opacity: item.active ? 1 : 0.65 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 m-3 rounded-2xl" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0 pt-logo-ring" style={{ fontWeight: 700 }}>
              {doctorInfo?.name?.charAt(0) || user?.name?.charAt(0) || "D"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate" style={{ fontWeight: 600 }}>Dr. {doctorInfo?.name || user?.name || "Médecin"}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>Médecin</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all hover:bg-red-500/20" style={{ color: "rgba(255,255,255,.5)", fontWeight: 500 }}>
            <FaSignOutAlt size={12} /> Déconnexion
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 lg:hidden" style={{ background: "rgba(6,13,31,.5)", backdropFilter: "blur(4px)" }} onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 overflow-y-auto">
        <div className="p-5 lg:p-7 pt-14 lg:pt-7 max-w-[1400px] mx-auto">

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4" data-aos="fade-down">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,var(--accent),#2563EB)", boxShadow: "0 4px 14px rgba(59,126,248,.35)" }}>
                  <FaFilePrescription size={14} />
                </div>
                <h2 className="text-2xl" style={{ fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.03em" }}>Modèles d'ordonnance</h2>
              </div>
              <div className="flex items-center gap-3 ml-11">
                <p className="text-sm" style={{ color: "var(--text-2)" }}>Créez et personnalisez vos modèles visuels</p>
                <span className="mono text-xs px-2.5 py-0.5 rounded-xl" style={{ background: "#EEF4FF", color: "var(--accent)", border: "1px solid #BFDBFE", fontWeight: 700 }}>
                  {templates.length} modèle{templates.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={newTemplate} className="btn-emerald px-4 py-2.5 rounded-xl text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                <FaPlus size={12} /> Nouveau
              </button>
              <button onClick={() => { setTemplateName(currentTemplate?.name || ""); setShowSaveModal(true); }} className="btn-accent px-4 py-2.5 rounded-xl text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                <FaSave size={12} /> Enregistrer
              </button>
            </div>
          </div>

          {apiError && (
            <div className="err-banner px-5 py-3 mb-4 flex items-center gap-3">
              <FaExclamationCircle size={15} style={{ color: "#F43F5E" }} />
              <span className="text-sm" style={{ fontWeight: 600 }}>{apiError}</span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-5">

            <div className="lg:w-60 xl:w-64 flex-shrink-0">
              <div className="sec-card p-4" data-aos="fade-right">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "#EEF4FF" }}>
                    <FaLayerGroup size={12} style={{ color: "var(--accent)" }} />
                  </div>
                  <p className="text-sm" style={{ fontWeight: 700, color: "var(--text-1)" }}>Mes modèles</p>
                </div>

                {templates.length === 0 ? (
                  <div className="py-10 text-center">
                    <FaFileMedical size={24} style={{ color: "#DDD6FE", margin: "0 auto 8px" }} />
                    <p className="text-xs" style={{ color: "var(--text-2)", fontWeight: 500 }}>Aucun modèle enregistré</p>
                  </div>
                ) : (
                  <ul className="space-y-2 max-h-[72vh] overflow-y-auto pr-0.5">
                    {templates.map((tmpl) => (
                      <li key={tmpl.id} className={`tmpl-item px-3 py-2.5 ${currentTemplate?.id === tmpl.id ? "selected" : ""}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 flex-1 min-w-0" onClick={() => loadTemplate(tmpl)}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: currentTemplate?.id === tmpl.id ? "linear-gradient(135deg,var(--accent),#2563EB)" : "#EEF4FF" }}>
                              <FaFilePrescription size={10} style={{ color: currentTemplate?.id === tmpl.id ? "#fff" : "var(--accent)" }} />
                            </div>
                            <span className="text-xs truncate" style={{ fontWeight: 700, color: "var(--text-1)" }}>{tmpl.name}</span>
                          </div>
                          <button
                            onClick={() => { setTemplateToDelete(tmpl); setShowDeleteConfirm(true); }}
                            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-100 transition-all flex-shrink-0"
                            style={{ color: "#F43F5E" }}
                          >
                            <FaTrash size={10} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-3" data-aos="fade-left">

              <div className="sec-card px-4 py-3 flex flex-wrap items-center gap-2">
                <button onClick={() => setShowTextModal(true)} className={TB}><FaFont size={12} /> Texte</button>
                <button onClick={addImage} className={TB}><FaImage size={12} /> Image</button>
                <button onClick={addLine} className={TB}><FaMinus size={12} /> Ligne</button>
                <button onClick={addRectangle} className={TB}><FaVectorSquare size={12} /> Rect.</button>
                <button onClick={addCircle} className={TB}><FaCircle size={12} /> Cercle</button>

                <div className="tool-sep mx-1" />

                <button onClick={zoomOut} className={TBI} title="Zoom arrière"><FaSearchMinus size={13} /></button>
                <span className="mono text-xs px-1.5" style={{ color: "var(--accent)", fontWeight: 700, minWidth: 38, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
                <button onClick={zoomIn} className={TBI} title="Zoom avant"><FaSearchPlus size={13} /></button>
                <button onClick={resetZoom} className={`${TBI} text-xs px-2.5`}>↺</button>

                <div className="tool-sep mx-1" />

                <button onClick={duplicateObject} disabled={!selectedObject} className={`${TBI} ${!selectedObject ? "opacity-40 cursor-not-allowed" : ""}`} title="Dupliquer"><FaCopy size={13} /></button>
                <button onClick={deleteSelected} disabled={!selectedObject} className={`${TBI} ${!selectedObject ? "opacity-40 cursor-not-allowed" : "hover:!text-rose-500 hover:!border-rose-200"}`} title="Supprimer"><FaTrash size={13} /></button>
                <button onClick={bringForward} disabled={!selectedObject} className={`${TBI} ${!selectedObject ? "opacity-40 cursor-not-allowed" : ""}`} title="Avancer"><FaArrowUp size={13} /></button>
                <button onClick={bringBackward} disabled={!selectedObject} className={`${TBI} ${!selectedObject ? "opacity-40 cursor-not-allowed" : ""}`} title="Reculer"><FaArrowDown size={13} /></button>

                <div className="tool-sep mx-1" />

                <button onClick={clearCanvas} className="tool-btn px-3 py-2 flex items-center gap-1.5 text-xs hover:!text-rose-500 hover:!border-rose-200 hover:!bg-rose-50">
                  <FaEraser size={11} /> Effacer tout
                </button>
              </div>

              <div className="sec-card px-4 py-3 flex flex-wrap items-center gap-2">
                <select
                  value={fontFamily}
                  onChange={(e) => { setFontFamily(e.target.value); if (selectedObject?.type === "i-text") applyFormatting({ fontFamily: e.target.value }); }}
                  className="border-1.5 rounded-xl px-2.5 py-1.5 text-xs pt-input"
                  style={{ border: "1.5px solid #E2E8F0" }}
                >
                  {["Arial", "Helvetica", "Times New Roman", "Courier New", "Georgia", "Verdana"].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>

                <input
                  type="number" value={fontSize} min="8" max="72"
                  onChange={(e) => { const v = parseInt(e.target.value) || 12; setFontSize(v); if (selectedObject?.type === "i-text") applyFormatting({ fontSize: v }); }}
                  className="w-14 rounded-xl px-2 py-1.5 text-xs pt-input text-center"
                />

                {[
                  { icon: <FaBold size={12} />, active: fontWeight === "bold", action: () => { const nw = fontWeight === "bold" ? "normal" : "bold"; setFontWeight(nw); if (selectedObject?.type === "i-text") applyFormatting({ fontWeight: nw }); }, title: "Gras" },
                  { icon: <FaItalic size={12} />, active: fontStyle === "italic", action: () => { const ns = fontStyle === "italic" ? "normal" : "italic"; setFontStyle(ns); if (selectedObject?.type === "i-text") applyFormatting({ fontStyle: ns }); }, title: "Italique" },
                  { icon: <FaUnderline size={12} />, active: underline, action: () => { const nu = !underline; setUnderline(nu); if (selectedObject?.type === "i-text") applyFormatting({ underline: nu }); }, title: "Souligné" },
                ].map((b, i) => (
                  <button key={i} onClick={b.action} title={b.title} className={`${TBI} ${b.active ? "active-fmt" : ""}`}>{b.icon}</button>
                ))}

                {[
                  { icon: <FaAlignLeft size={12} />, val: "left" },
                  { icon: <FaAlignCenter size={12} />, val: "center" },
                  { icon: <FaAlignRight size={12} />, val: "right" },
                  { icon: <FaAlignJustify size={12} />, val: "justify" },
                ].map((a) => (
                  <button key={a.val} onClick={() => { setTextAlign(a.val); if (selectedObject?.type === "i-text") applyFormatting({ textAlign: a.val }); }} className={`${TBI} ${textAlign === a.val ? "active-fmt" : ""}`}>
                    {a.icon}
                  </button>
                ))}

                <div className="flex items-center gap-1.5">
                  <FaPalette size={12} style={{ color: "#94A3B8" }} />
                  <input
                    type="color" value={textColor}
                    onChange={(e) => { setTextColor(e.target.value); if (selectedObject?.type === "i-text") applyFormatting({ fill: e.target.value }); else if (selectedObject && ["path","rect","circle"].includes(selectedObject.type)) applyFormatting({ stroke: e.target.value }); }}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                </div>

                <div className="tool-sep mx-1" />

                <div className="flex items-center gap-1.5">
                  <span className="text-xs" style={{ color: "#94A3B8", fontWeight: 600 }}>IL</span>
                  <input type="number" value={lineHeight} min="0.5" max="3" step="0.1"
                    onChange={(e) => { const v = parseFloat(e.target.value) || 1; setLineHeight(v); if (selectedObject?.type === "i-text") applyFormatting({ lineHeight: v }); }}
                    className="w-14 rounded-xl px-2 py-1.5 text-xs pt-input text-center"
                  />
                </div>

                <div className="tool-sep mx-1" />

                <div className="flex items-center gap-1.5">
                  <span className="text-xs" style={{ color: "#94A3B8", fontWeight: 600 }}>Trait</span>
                  <input type="number" value={strokeWidth} min="1" max="20"
                    onChange={(e) => { const v = parseFloat(e.target.value) || 1; setStrokeWidth(v); if (selectedObject && ["path","rect","circle","line"].includes(selectedObject.type)) applyFormatting({ strokeWidth: v }); }}
                    className="w-12 rounded-xl px-2 py-1.5 text-xs pt-input text-center"
                  />
                  <input type="color" value={strokeColor}
                    onChange={(e) => { setStrokeColor(e.target.value); if (selectedObject && ["path","rect","circle","line"].includes(selectedObject.type)) applyFormatting({ stroke: e.target.value }); }}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0" title="Couleur du trait"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs" style={{ color: "#94A3B8", fontWeight: 600 }}>Fill</span>
                  <input type="color" value={fillColor}
                    onChange={(e) => { setFillColor(e.target.value); if (selectedObject && ["rect","circle"].includes(selectedObject.type)) applyFormatting({ fill: e.target.value }); }}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0" title="Remplissage"
                  />
                </div>
              </div>

              <div className="canvas-wrapper flex justify-center overflow-auto p-4">
                <div className="canvas-inner">
                  <canvas ref={canvasRef} id="prescription-canvas" style={{ width: "100%", height: "auto" }} />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <p className="text-xs" style={{ color: "var(--text-2)" }}>
                  Glissez les objets · Double-cliquez sur un texte pour l'éditer
                </p>
                {currentTemplate && (
                  <span className="editing-badge px-3 py-1 text-xs flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                    <FaFilePrescription size={10} /> Édition : {currentTemplate.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showTextModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="px-8 py-6" style={{ background: "linear-gradient(135deg,var(--accent),#2563EB)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"><FaFont className="text-white" size={15} /></div>
                <button onClick={() => setShowTextModal(false)} className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-all"><FaTimes size={13} /></button>
              </div>
              <h3 className="text-white text-lg" style={{ fontWeight: 800 }}>Ajouter du texte</h3>
            </div>
            <div className="px-8 py-6">
              <label className={LC} style={LS}>Contenu</label>
              <textarea value={newTextContent} onChange={(e) => setNewTextContent(e.target.value)} rows="3" autoFocus placeholder="Saisissez votre texte…" className={IC} />
              <div className="flex justify-end gap-3 mt-5">
                <button onClick={() => setShowTextModal(false)} className="btn-ghost px-5 py-2.5 rounded-xl text-sm" style={{ fontWeight: 600 }}>Annuler</button>
                <button onClick={addTextFromModal} className="btn-accent px-6 py-2.5 rounded-xl text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                  <FaPlus size={11} /> Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSaveModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="px-8 py-6" style={{ background: "linear-gradient(135deg,var(--emerald),#059669)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"><FaSave className="text-white" size={15} /></div>
                <button onClick={() => setShowSaveModal(false)} className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-all"><FaTimes size={13} /></button>
              </div>
              <h3 className="text-white text-lg" style={{ fontWeight: 800 }}>Enregistrer le modèle</h3>
              <p className="text-white/60 text-xs mt-0.5">{currentTemplate ? "Mise à jour du modèle existant" : "Création d'un nouveau modèle"}</p>
            </div>
            <div className="px-8 py-6">
              <label className={LC} style={LS}>Nom du modèle <span style={{ color: "var(--rose)" }}>*</span></label>
              <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} autoFocus placeholder="Ex: Ordonnance standard" className={IC} />
              <div className="flex justify-end gap-3 mt-5">
                <button onClick={() => { setShowSaveModal(false); setTemplateName(currentTemplate?.name || ""); }} className="btn-ghost px-5 py-2.5 rounded-xl text-sm" style={{ fontWeight: 600 }}>Annuler</button>
                <button onClick={saveTemplate} className="btn-emerald px-6 py-2.5 rounded-xl text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                  <FaSave size={11} /> Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && templateToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="px-8 py-6" style={{ background: "linear-gradient(135deg,#FFF1F2,#FFE4E6)", borderBottom: "1.5px solid #FECDD3" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg,var(--rose),#BE123C)" }}>
                <FaTrash className="text-white" size={15} />
              </div>
              <h3 className="text-base" style={{ fontWeight: 800, color: "var(--text-1)" }}>Confirmer la suppression</h3>
            </div>
            <div className="px-8 py-5">
              <p className="text-sm" style={{ color: "var(--text-2)" }}>
                Supprimer le modèle <span style={{ fontWeight: 700, color: "var(--text-1)" }}>«{templateToDelete.name}»</span> ? Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-3 mt-5">
                <button onClick={() => { setShowDeleteConfirm(false); setTemplateToDelete(null); }} className="btn-ghost px-5 py-2.5 rounded-xl text-sm" style={{ fontWeight: 600 }}>Annuler</button>
                <button onClick={deleteTemplate} className="btn-rose px-5 py-2.5 rounded-xl text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                  <FaTrash size={11} /> Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="px-8 py-6" style={{ background: "linear-gradient(135deg,#EEF4FF,#E0EDFF)", borderBottom: "1.5px solid #BFDBFE" }}>
              <h3 className="text-base" style={{ fontWeight: 800, color: "var(--text-1)" }}>{confirmModalConfig.title}</h3>
            </div>
            <div className="px-8 py-5">
              <p className="text-sm" style={{ color: "var(--text-2)" }}>{confirmModalConfig.message}</p>
              <div className="flex justify-end gap-3 mt-5">
                <button onClick={() => setShowConfirmModal(false)} className="btn-ghost px-5 py-2.5 rounded-xl text-sm" style={{ fontWeight: 600 }}>Annuler</button>
                <button onClick={confirmModalConfig.onConfirm} className="btn-accent px-5 py-2.5 rounded-xl text-sm" style={{ fontWeight: 600 }}>Confirmer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAlertModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="px-8 py-6" style={{ background: "linear-gradient(135deg,#EEF4FF,#E0EDFF)", borderBottom: "1.5px solid #BFDBFE" }}>
              <h3 className="text-base" style={{ fontWeight: 800, color: "var(--text-1)" }}>{alertModalConfig.title}</h3>
            </div>
            <div className="px-8 py-5">
              <p className="text-sm" style={{ color: "var(--text-2)" }}>{alertModalConfig.message}</p>
              <div className="flex justify-end mt-5">
                <button onClick={() => setShowAlertModal(false)} className="btn-accent px-6 py-2.5 rounded-xl text-sm" style={{ fontWeight: 600 }}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrescriptionTemplates;