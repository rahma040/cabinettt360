import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaUserInjured,
  FaCalendarCheck,
  FaFileMedical,
  FaCog,
  FaSignOutAlt,
  FaSearch,
  FaPlus,
  FaDownload,
  FaEdit,
  FaChevronDown,
  FaChevronUp,
  FaNotesMedical,
  FaFilePdf,
  FaImage,
  FaWeight,
  FaRuler,
  FaPhone,
  FaTint,
  FaMoneyBillWave,
  FaStethoscope,
  FaFilePrescription,
  FaUpload,
  FaFolderOpen,
  FaBars,
  FaTimes,
  FaEye,
  FaSpinner,
  FaUser,
  FaUserClock,
  FaUserPlus,
  FaFont,
  FaSave,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaPalette,
  FaBold,
  FaItalic,
  FaUnderline,
  FaSearchPlus,
  FaSearchMinus,
  FaVectorSquare,
  FaCircle,
  FaMinus,
  FaChartLine,
  FaTasks,
  FaEnvelope,
  FaGraduationCap,
} from "react-icons/fa";
import jsPDF from "jspdf";
import { fabric } from "fabric";

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

const globalStyles = `
  * { font-family: 'Sora', sans-serif; }
  :root {
    --navy: #060D1F;
    --navy-mid: #0C1A3A;
    --navy-light: #122048;
    --accent: #3B7EF8;
    --accent-glow: rgba(59,126,248,0.25);
    --teal: #0ECDB5;
    --amber: #F59E0B;
    --rose: #F43F5E;
    --emerald: #10B981;
    --surface: #F4F7FF;
    --card: #FFFFFF;
    --text-primary: #0A0F1E;
    --text-secondary: #5B6B8A;
    --border: rgba(59,126,248,0.12);
  }
  .patients-root { background: var(--surface); min-height: 100vh; }
  .sidebar-nav { background: linear-gradient(180deg, var(--navy) 0%, var(--navy-mid) 60%, var(--navy-light) 100%); }
  .sidebar-logo-ring { background: linear-gradient(135deg, var(--accent), var(--teal)); }
  .nav-link { border-left: 3px solid transparent; transition: all 0.2s ease; }
  .nav-link:hover { background: rgba(59,126,248,0.12); border-left-color: var(--accent); color: #fff; }
  .nav-link.active { background: rgba(59,126,248,0.2); border-left-color: var(--accent); color: #fff; box-shadow: inset 0 0 20px rgba(59,126,248,0.08); }
  .patient-card { border: 1.5px solid transparent; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
  .patient-card:hover { border-color: rgba(59,126,248,0.2); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59,126,248,0.08); }
  .patient-card.selected { border-color: var(--accent); background: linear-gradient(135deg, #EEF4FF 0%, #F4F7FF 100%); box-shadow: 0 4px 24px var(--accent-glow); }
  .glass-card { backdrop-filter: blur(12px); background: rgba(255,255,255,0.92); }
  .btn-primary { background: linear-gradient(135deg, var(--accent) 0%, #2563EB 100%); transition: all 0.2s ease; box-shadow: 0 4px 14px rgba(59,126,248,0.35); }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59,126,248,0.45); }
  .btn-primary:active { transform: translateY(1px); box-shadow: 0 2px 8px rgba(59,126,248,0.35); }
  .btn-primary:disabled { opacity: 0.55; transform: none; }
  .btn-amber { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); transition: all 0.2s ease; box-shadow: 0 4px 14px rgba(245,158,11,0.3); }
  .btn-amber:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(245,158,11,0.4); }
  .btn-amber:active { transform: translateY(1px); }
  .btn-emerald { background: linear-gradient(135deg, #10B981 0%, #059669 100%); transition: all 0.2s ease; box-shadow: 0 4px 14px rgba(16,185,129,0.3); }
  .btn-emerald:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,0.4); }
  .btn-emerald:active { transform: translateY(1px); }
  .btn-purple { background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); transition: all 0.2s ease; box-shadow: 0 4px 14px rgba(139,92,246,0.3); }
  .btn-purple:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(139,92,246,0.4); }
  .btn-purple:active { transform: translateY(1px); }
  .section-card { border: 1.5px solid var(--border); transition: border-color 0.2s ease; }
  .section-card:hover { border-color: rgba(59,126,248,0.22); }
  .input-field { border: 1.5px solid #E2E8F0; transition: all 0.2s ease; background: #FAFCFF; }
  .input-field:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); background: #fff; }
  .badge-paid { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
  .badge-pending { background: #FFFBEB; color: #92400E; border: 1px solid #FDE68A; }
  .badge-unpaid { background: #FFF1F2; color: #9F1239; border: 1px solid #FECDD3; }
  .badge-done { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
  .badge-cancelled { background: #FFF1F2; color: #9F1239; border: 1px solid #FECDD3; }
  .badge-planned { background: #EFF6FF; color: #1E40AF; border: 1px solid #BFDBFE; }
  .modal-overlay { background: rgba(6,13,31,0.65); backdrop-filter: blur(6px); transition: opacity 0.2s ease; }
  .modal-box { animation: modalIn 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
  @keyframes modalIn { from { opacity:0; transform: scale(0.96) translateY(8px); } to { opacity:1; transform: scale(1) translateY(0); } }
  .visite-row { border: 1.5px solid #E8EEFF; transition: all 0.2s ease; }
  .visite-row:hover { border-color: rgba(59,126,248,0.25); }
  .visite-header { background: linear-gradient(135deg, #F8FAFF 0%, #F0F4FF 100%); cursor: pointer; transition: background 0.2s ease; }
  .visite-header:hover { background: linear-gradient(135deg, #F0F4FF 0%, #E8EEFF 100%); }
  .sidebar-toggle { background: linear-gradient(135deg, var(--accent), #2563EB); box-shadow: 0 4px 14px rgba(59,126,248,0.4); transition: transform 0.2s ease; }
  .sidebar-toggle:hover { transform: scale(1.02); }
  .sidebar-toggle:active { transform: scale(0.98); }
  .stat-chip { background: linear-gradient(135deg, rgba(59,126,248,0.1), rgba(14,205,181,0.08)); border: 1px solid rgba(59,126,248,0.15); transition: all 0.2s ease; }
  .toolbar-btn { background: #fff; border: 1.5px solid #E2E8F0; transition: all 0.18s ease; }
  .toolbar-btn:hover { border-color: var(--accent); color: var(--accent); background: #EEF4FF; transform: translateY(-1px); }
  .toolbar-btn:active { transform: translateY(1px); }
  .toolbar-btn.active-format { border-color: var(--accent); background: #EEF4FF; color: var(--accent); }
  .canvas-wrapper { box-shadow: 0 8px 40px rgba(6,13,31,0.12); border: 2px solid #E8EEFF; border-radius: 12px; overflow: hidden; transition: box-shadow 0.2s ease; }
  .canvas-wrapper:hover { box-shadow: 0 12px 48px rgba(6,13,31,0.16); }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(59,126,248,0.25); border-radius: 99px; transition: background 0.2s ease; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(59,126,248,0.45); }
  .fade-in-item {
    animation: fadeInUp 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
  }
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .section-content {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  button:active:not(:disabled) {
    transform: scale(0.98);
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

const TemplateEditorModal = ({ isOpen, onClose, onSave, initialTemplateData, initialTemplateName }) => {
  const [canvas, setCanvas] = useState(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateName, setTemplateName] = useState(initialTemplateName || "");
  const [showTextModal, setShowTextModal] = useState(false);
  const [newTextContent, setNewTextContent] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isHistoryLock, setIsHistoryLock] = useState(false);

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
  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");

  const fetchTemplates = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/prescription-templates`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      if (initialTemplateData) {
        setSelectedTemplateId("");
        setTemplateName(initialTemplateName);
      }
    }
  }, [isOpen, initialTemplateData, initialTemplateName]);

  useEffect(() => {
    if (!isOpen) return;
    const initCanvas = () => {
      if (canvasRef.current && !canvas) {
        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
          width: 800,
          height: 1131,
          backgroundColor: "white",
          preserveObjectStacking: true,
        });
        setCanvas(fabricCanvas);
        setCanvasReady(true);

        const container = canvasRef.current.parentElement;
        if (container) {
          const scale = Math.min(container.clientWidth / 800, 1);
          fabricCanvas.setZoom(scale);
          setZoom(scale);
        }

        if (initialTemplateData) {
          let data = initialTemplateData;
          if (typeof data === "string") data = JSON.parse(data);
          fabricCanvas.loadFromJSON(data, () => {
            fabricCanvas.renderAll();
            const state = JSON.stringify(fabricCanvas.toJSON(["id", "name", "type"]));
            setHistory([state]);
            setHistoryIndex(0);
          });
        } else {
          const state = JSON.stringify(fabricCanvas.toJSON(["id", "name", "type"]));
          setHistory([state]);
          setHistoryIndex(0);
        }

        fabricCanvas.on("selection:created", handleSelection);
        fabricCanvas.on("selection:updated", handleSelection);
        fabricCanvas.on("selection:cleared", () => setSelectedObject(null));
        fabricCanvas.on("object:modified", saveHistory);
        fabricCanvas.on("object:added", saveHistory);
        fabricCanvas.on("object:removed", saveHistory);
      }
    };

    const handleSelection = () => {
      if (!canvas) return;
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
        } else if (
          active.type === "path" ||
          active.type === "rect" ||
          active.type === "circle" ||
          active.type === "line"
        ) {
          setStrokeWidth(active.strokeWidth || 2);
          setStrokeColor(active.stroke || "#000000");
          setFillColor(active.fill || "#ffffff");
        }
      }
    };

    const saveHistory = () => {
      if (!canvas || isHistoryLock) return;
      const state = JSON.stringify(canvas.toJSON(["id", "name", "type"]));
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), state]);
      setHistoryIndex((prev) => prev + 1);
    };

    initCanvas();

    return () => {
      if (canvas) {
        canvas.off("selection:created", handleSelection);
        canvas.off("selection:updated", handleSelection);
        canvas.off("selection:cleared", () => setSelectedObject(null));
        canvas.off("object:modified", saveHistory);
        canvas.off("object:added", saveHistory);
        canvas.off("object:removed", saveHistory);
        canvas.dispose();
        setCanvas(null);
        setCanvasReady(false);
      }
    };
  }, [isOpen, initialTemplateData]);

  const applyFormatting = (updates) => {
    if (!canvas || !selectedObject) return;
    selectedObject.set(updates);
    canvas.renderAll();
  };

  const addTextFromModal = () => {
    if (!canvas || !canvasReady) return;
    if (!newTextContent.trim()) { setShowTextModal(false); return; }
    const text = newTextContent.trim();
    const fabricText = new fabric.IText(text, {
      left: 100, top: 100, fontFamily, fontSize, fontWeight, fontStyle,
      underline, textAlign, fill: textColor, lineHeight, charSpacing: charSpacing * 1000,
    });
    canvas.add(fabricText);
    canvas.setActiveObject(fabricText);
    canvas.renderAll();
    setShowTextModal(false);
  };

  const addImage = () => { fileInputRef.current.click(); };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const imgElement = new Image();
      imgElement.onload = () => {
        if (!canvas || !canvasReady) return;
        const img = new fabric.Image(imgElement);
        const maxWidth = 300, maxHeight = 300;
        let scale = 1;
        if (img.width > maxWidth || img.height > maxHeight) {
          scale = Math.min(maxWidth / img.width, maxHeight / img.height);
          img.scale(scale);
        }
        const canvasCenter = canvas.getCenter();
        img.set({ left: canvasCenter.left, top: canvasCenter.top, originX: "center", originY: "center" });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      };
      imgElement.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const addLine = () => {
    if (!canvas || !canvasReady) return;
    const line = new fabric.Line([50, 50, 200, 50], { left: 100, top: 100, stroke: strokeColor, strokeWidth });
    canvas.add(line); canvas.setActiveObject(line); canvas.renderAll();
  };

  const addRectangle = () => {
    if (!canvas || !canvasReady) return;
    const rect = new fabric.Rect({ left: 100, top: 100, width: 100, height: 80, fill: fillColor, stroke: strokeColor, strokeWidth });
    canvas.add(rect); canvas.setActiveObject(rect); canvas.renderAll();
  };

  const addCircle = () => {
    if (!canvas || !canvasReady) return;
    const circle = new fabric.Circle({ left: 100, top: 100, radius: 50, fill: fillColor, stroke: strokeColor, strokeWidth });
    canvas.add(circle); canvas.setActiveObject(circle); canvas.renderAll();
  };

  const deleteSelected = () => {
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject); canvas.renderAll();
  };

  const duplicateObject = () => {
    if (!canvas || !selectedObject || !canvasReady) return;
    if (selectedObject.type === "i-text") {
      const newText = new fabric.IText(selectedObject.text, {
        left: selectedObject.left + 20, top: selectedObject.top + 20,
        fontFamily: selectedObject.fontFamily, fontSize: selectedObject.fontSize,
        fontWeight: selectedObject.fontWeight, fontStyle: selectedObject.fontStyle,
        underline: selectedObject.underline, textAlign: selectedObject.textAlign,
        fill: selectedObject.fill, lineHeight: selectedObject.lineHeight,
        charSpacing: selectedObject.charSpacing,
      });
      canvas.add(newText); canvas.setActiveObject(newText); canvas.renderAll();
    } else {
      selectedObject.clone((cloned) => {
        cloned.set({ left: selectedObject.left + 20, top: selectedObject.top + 20 });
        canvas.add(cloned); canvas.setActiveObject(cloned); canvas.renderAll();
      });
    }
  };

  const bringForward = () => {
    if (!canvas || !selectedObject) return;
    const objects = canvas.getObjects();
    const index = objects.indexOf(selectedObject);
    if (index < objects.length - 1) { canvas.moveTo(selectedObject, index + 1); canvas.renderAll(); }
  };

  const bringBackward = () => {
    if (!canvas || !selectedObject) return;
    const objects = canvas.getObjects();
    const index = objects.indexOf(selectedObject);
    if (index > 0) { canvas.moveTo(selectedObject, index - 1); canvas.renderAll(); }
  };

  const zoomIn = () => {
    if (!canvas) return;
    let newZoom = Math.min(zoom + 0.1, 2);
    canvas.setZoom(newZoom); setZoom(newZoom);
  };

  const zoomOut = () => {
    if (!canvas) return;
    let newZoom = Math.max(zoom - 0.1, 0.5);
    canvas.setZoom(newZoom); setZoom(newZoom);
  };

  const resetZoom = () => {
    if (!canvas) return;
    const container = canvasRef.current?.parentElement;
    if (container) {
      const scale = Math.min(container.clientWidth / 800, 1);
      canvas.setZoom(scale); setZoom(scale);
    }
  };

  const loadSelectedTemplate = () => {
    if (!selectedTemplateId) return;
    const template = templates.find((t) => t.id === parseInt(selectedTemplateId));
    if (template && canvas && canvasReady) {
      let data = template.template_data;
      if (typeof data === "string") data = JSON.parse(data);
      canvas.loadFromJSON(data, () => {
        canvas.renderAll(); setTemplateName(template.name); resetZoom();
      });
    }
  };

  const generatePDF = () => {
    if (!canvas) return null;
    const originalWidth = canvas.getWidth();
    const originalHeight = canvas.getHeight();
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = originalWidth; tempCanvas.height = originalHeight;
    const tempFabricCanvas = new fabric.Canvas(tempCanvas);
    const data = canvas.toJSON(["id", "name", "type"]);
    tempFabricCanvas.loadFromJSON(data, () => {
      tempFabricCanvas.renderAll();
      const dataURL = tempFabricCanvas.toDataURL("image/png");
      const doc = new jsPDF();
      const img = new Image();
      img.src = dataURL;
      img.onload = () => {
        const imgWidth = doc.internal.pageSize.getWidth();
        const imgHeight = (img.height * imgWidth) / img.width;
        doc.addImage(img, "PNG", 0, 0, imgWidth, imgHeight);
        const blob = doc.output("blob");
        onSave(blob, templateName);
        tempFabricCanvas.dispose();
      };
    });
  };

  const handleSave = () => { if (!canvas) return; generatePDF(); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
      <style>{globalStyles}</style>
      <div className="modal-box bg-white rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="px-8 py-5 flex justify-between items-center" style={{ borderBottom: "1.5px solid #E8EEFF", background: "linear-gradient(135deg, #F8FAFF 0%, #EEF4FF 100%)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}>
              <FaFilePrescription size={18} />
            </div>
            <div>
              <h2 className="text-lg font-700 text-gray-900" style={{ fontWeight: 700 }}>
                {initialTemplateData ? "Modifier le modèle" : "Créer un modèle d'ordonnance"}
              </h2>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Éditeur de prescription</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all" style={{ border: "1.5px solid #E2E8F0", color: "#94A3B8" }}>
            <FaTimes size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="lg:w-64 flex-shrink-0 space-y-4">
              <div className="rounded-2xl p-4" style={{ background: "#F8FAFF", border: "1.5px solid #E8EEFF" }}>
                <p className="text-xs font-600 uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.08em" }}>Mes modèles</p>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full rounded-xl p-2.5 text-sm mb-2 input-field"
                >
                  <option value="">Sélectionner un modèle</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <button
                  onClick={loadSelectedTemplate}
                  disabled={!selectedTemplateId}
                  className="w-full text-white text-sm py-2.5 rounded-xl font-600 disabled:opacity-40 btn-primary"
                  style={{ fontWeight: 600 }}
                >
                  Charger le modèle
                </button>
              </div>

              <div className="rounded-2xl p-4" style={{ background: "#F8FAFF", border: "1.5px solid #E8EEFF" }}>
                <label className="text-xs font-600 uppercase tracking-wider mb-2 block" style={{ color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.08em" }}>Nom du modèle</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full rounded-xl p-2.5 text-sm input-field"
                  placeholder="Ex: Ordonnance standard"
                />
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="rounded-2xl p-3 flex flex-wrap gap-2 items-center" style={{ background: "#F8FAFF", border: "1.5px solid #E8EEFF" }}>
                {[
                  { icon: <FaFont size={13} />, label: "Texte", action: () => setShowTextModal(true) },
                  { icon: <FaImage size={13} />, label: "Image", action: addImage },
                  { icon: <FaMinus size={13} />, label: "Ligne", action: addLine },
                  { icon: <FaVectorSquare size={13} />, label: "Rect.", action: addRectangle },
                  { icon: <FaCircle size={13} />, label: "Cercle", action: addCircle },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.action} className="toolbar-btn rounded-xl px-3 py-1.5 text-xs flex items-center gap-1.5 font-500" style={{ fontWeight: 500, color: "#374151" }}>
                    {btn.icon} {btn.label}
                  </button>
                ))}

                <div className="w-px h-5 mx-1" style={{ background: "#E2E8F0" }} />

                <button onClick={zoomOut} className="toolbar-btn rounded-xl p-2" title="Zoom arrière"><FaSearchMinus size={13} /></button>
                <span className="text-xs font-600 px-1" style={{ color: "var(--accent)", fontWeight: 600, minWidth: 38, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
                <button onClick={zoomIn} className="toolbar-btn rounded-xl p-2" title="Zoom avant"><FaSearchPlus size={13} /></button>
                <button onClick={resetZoom} className="toolbar-btn rounded-xl px-2.5 py-1.5 text-xs">Reset</button>

                <div className="w-px h-5 mx-1" style={{ background: "#E2E8F0" }} />

                <button onClick={duplicateObject} disabled={!selectedObject} className={`toolbar-btn rounded-xl p-2 ${!selectedObject ? "opacity-40 cursor-not-allowed" : ""}`} title="Dupliquer"><FaSave size={13} /></button>
                <button onClick={deleteSelected} disabled={!selectedObject} className={`toolbar-btn rounded-xl p-2 ${!selectedObject ? "opacity-40 cursor-not-allowed" : "hover:text-red-500 hover:border-red-200"}`} title="Supprimer"><FaTrash size={13} /></button>
                <button onClick={bringForward} disabled={!selectedObject} className={`toolbar-btn rounded-xl p-2 ${!selectedObject ? "opacity-40 cursor-not-allowed" : ""}`} title="Avancer"><FaArrowUp size={13} /></button>
                <button onClick={bringBackward} disabled={!selectedObject} className={`toolbar-btn rounded-xl p-2 ${!selectedObject ? "opacity-40 cursor-not-allowed" : ""}`} title="Reculer"><FaArrowDown size={13} /></button>
              </div>

              {selectedObject && selectedObject.type === "i-text" && (
                <div className="rounded-2xl p-3 flex flex-wrap gap-2 items-center" style={{ background: "#F0F4FF", border: "1.5px solid #DBEAFE" }}>
                  <select value={fontFamily} onChange={(e) => { setFontFamily(e.target.value); applyFormatting({ fontFamily: e.target.value }); }} className="border rounded-xl px-2.5 py-1.5 text-xs bg-white input-field">
                    {["Arial","Helvetica","Times New Roman","Courier New","Georgia","Verdana"].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <input type="number" value={fontSize} onChange={(e) => { const v = parseInt(e.target.value)||12; setFontSize(v); applyFormatting({ fontSize: v }); }} className="w-14 border rounded-xl px-2 py-1.5 text-xs bg-white input-field" min="8" max="72" />
                  <button onClick={() => { const nw = fontWeight==="bold"?"normal":"bold"; setFontWeight(nw); applyFormatting({ fontWeight: nw }); }} className={`toolbar-btn rounded-xl p-1.5 ${fontWeight==="bold"?"active-format":""}`}><FaBold size={12} /></button>
                  <button onClick={() => { const ns = fontStyle==="italic"?"normal":"italic"; setFontStyle(ns); applyFormatting({ fontStyle: ns }); }} className={`toolbar-btn rounded-xl p-1.5 ${fontStyle==="italic"?"active-format":""}`}><FaItalic size={12} /></button>
                  <button onClick={() => { const nu = !underline; setUnderline(nu); applyFormatting({ underline: nu }); }} className={`toolbar-btn rounded-xl p-1.5 ${underline?"active-format":""}`}><FaUnderline size={12} /></button>
                  <div className="flex items-center gap-1.5">
                    <FaPalette size={12} style={{ color: "#94A3B8" }} />
                    <input type="color" value={textColor} onChange={(e) => { setTextColor(e.target.value); applyFormatting({ fill: e.target.value }); }} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                  </div>
                  <select value={textAlign} onChange={(e) => { setTextAlign(e.target.value); applyFormatting({ textAlign: e.target.value }); }} className="border rounded-xl px-2.5 py-1.5 text-xs bg-white input-field">
                    <option value="left">Gauche</option><option value="center">Centre</option><option value="right">Droite</option><option value="justify">Justifié</option>
                  </select>
                  <div className="flex items-center gap-1">
                    <span className="text-xs" style={{ color: "#94A3B8" }}>Interligne</span>
                    <input type="number" value={lineHeight} onChange={(e) => { const v=parseFloat(e.target.value)||1; setLineHeight(v); applyFormatting({ lineHeight: v }); }} className="w-14 border rounded-xl px-2 py-1.5 text-xs bg-white input-field" min="0.5" max="3" step="0.1" />
                  </div>
                </div>
              )}

              {selectedObject && (selectedObject.type==="rect"||selectedObject.type==="circle"||selectedObject.type==="line") && (
                <div className="rounded-2xl p-3 flex flex-wrap gap-2 items-center" style={{ background: "#F0F4FF", border: "1.5px solid #DBEAFE" }}>
                  <span className="text-xs font-600" style={{ color: "#64748B", fontWeight: 600 }}>Trait:</span>
                  <input type="number" value={strokeWidth} onChange={(e) => { const v=parseFloat(e.target.value)||1; setStrokeWidth(v); applyFormatting({ strokeWidth: v }); }} className="w-14 border rounded-xl px-2 py-1.5 text-xs bg-white input-field" min="1" max="20" />
                  <input type="color" value={strokeColor} onChange={(e) => { setStrokeColor(e.target.value); applyFormatting({ stroke: e.target.value }); }} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                  {selectedObject.type !== "line" && (
                    <>
                      <span className="text-xs font-600" style={{ color: "#64748B", fontWeight: 600 }}>Remplissage:</span>
                      <input type="color" value={fillColor} onChange={(e) => { setFillColor(e.target.value); applyFormatting({ fill: e.target.value }); }} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                    </>
                  )}
                </div>
              )}

              <div className="canvas-wrapper flex justify-center bg-gray-100 p-4">
                <canvas ref={canvasRef} style={{ width: "100%", height: "auto" }} />
              </div>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
          </div>
        </div>

        <div className="px-8 py-5 flex justify-end gap-3" style={{ borderTop: "1.5px solid #E8EEFF", background: "#FAFBFF" }}>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-600 transition-all hover:bg-gray-100" style={{ border: "1.5px solid #E2E8F0", color: "#64748B", fontWeight: 600 }}>
            Annuler
          </button>
          <button onClick={handleSave} disabled={!templateName.trim()} className="btn-primary text-white px-6 py-2.5 rounded-xl text-sm font-600 disabled:opacity-40 flex items-center gap-2" style={{ fontWeight: 600 }}>
            <FaFilePdf size={14} /> Générer PDF
          </button>
        </div>

        {showTextModal && (
          <div className="fixed inset-0 flex items-center justify-center z-60 modal-overlay">
            <div className="modal-box bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <h3 className="text-base font-700 mb-4" style={{ fontWeight: 700, color: "var(--text-primary)" }}>Ajouter du texte</h3>
              <textarea
                value={newTextContent}
                onChange={(e) => setNewTextContent(e.target.value)}
                className="w-full rounded-xl p-3 text-sm mb-4 input-field"
                rows="3"
                placeholder="Entrez votre texte..."
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowTextModal(false)} className="px-4 py-2 rounded-xl text-sm hover:bg-gray-100 transition-all" style={{ border: "1.5px solid #E2E8F0", color: "#64748B" }}>Annuler</button>
                <button onClick={addTextFromModal} className="btn-primary text-white px-5 py-2 rounded-xl text-sm font-600" style={{ fontWeight: 600 }}>Ajouter</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function Patients({
  allowedRole = "medecin",
  spaceLabel = "Espace médecin",
  userRoleLabel = "Médecin",
  roleInitial = "D",
  pageTitle = "Mes Patients",
  activePath = "/patients",
  navItems: customNavItems = null,
  showDocuments = true,
  showDoctorNotes = true,
  showMedicalHistory = true,
  showVisites = true,
}) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showVisiteModal, setShowVisiteModal] = useState(false);
  const [showEditVisiteModal, setShowEditVisiteModal] = useState(false);
  const [showDocumentsList, setShowDocumentsList] = useState(false);
  const [showVisitesList, setShowVisitesList] = useState(false);
  const [visitesPage, setVisitesPage] = useState(1);
  const [visitesPerPage] = useState(5);
  const [expandedVisiteId, setExpandedVisiteId] = useState(null);
  const [expandedSections, setExpandedSections] = useState({ info: true, antecedents: false, chirurgicaux: false, familiaux: false, notes: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesContent, setNotesContent] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const [newPatient, setNewPatient] = useState({ nom:"", prenom:"", age:"", poids:"", taille:"", email:"", telephone:"", adresse:"", groupe_sanguin:"", antecedents_medicaux:"", antecedents_chirurgicaux:"", antecedents_familiaux:"", allergies:"", medicaments_actuels:"" });
  const [editPatient, setEditPatient] = useState({});
  const [newDocument, setNewDocument] = useState({ titre:"", type:"autre", date_document:"", notes:"", fichier:null });
  const [newVisite, setNewVisite] = useState({ date_visite:"", motif:"", diagnostic:"", prescription_texte:"", montant:"", statut_paiement:"en_attente", medecin:"", notes:"", prescription_fichiers:[], statut:"planifié" });
  const [editVisite, setEditVisite] = useState(null);
  const [editVisiteData, setEditVisiteData] = useState({ date_visite:"", motif:"", diagnostic:"", prescription_texte:"", montant:"", statut_paiement:"en_attente", medecin:"", notes:"", statut:"planifié" });
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [pendingTemplatePDF, setPendingTemplatePDF] = useState(null);

  const token = localStorage.getItem("token");
  const integrityInterval = useRef(null);
  const mainContentRef = useRef(null);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const convertVisitStatusToAppointment = (statut) => {
    if (statut === "terminé") return "completed";
    if (statut === "annulé") return "cancelled";
    return "scheduled";
  };

  const updateAppointmentFromVisite = async (patientId, oldDate, newVisiteData) => {
    try {
      const response = await api.get("/appointments");
      let appointments = response.data;
      appointments = appointments.filter(a => a.patient_id === patientId);
      const targetAppointment = appointments.find(a => a.appointment_date === oldDate);
      if (targetAppointment) {
        const newStatus = convertVisitStatusToAppointment(newVisiteData.statut);
        const payload = {
          patient_id: targetAppointment.patient_id,
          appointment_date: newVisiteData.date_visite,
          start_time: targetAppointment.start_time,
          end_time: targetAppointment.end_time,
          notes: targetAppointment.notes,
          status: newStatus,
        };
        await api.put(`/appointments/${targetAppointment.id}`, payload);
      }
    } catch (error) {
      console.error("Failed to update appointment:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { navigate("/login"); return; }
    const parsedUser = JSON.parse(userData);
    const isRoleAllowed = Array.isArray(allowedRole)
      ? allowedRole.includes(parsedUser.role)
      : parsedUser.role === allowedRole;
    if (!isRoleAllowed) {
      navigate("/accessdenied");
      return;
    }
    setUser(parsedUser);

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

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
      });
      if (!response.ok) {
        if (response.status === 401) { clearAndRedirect(navigate); return; }
        throw new Error("Failed to fetch user");
      }
      const userData = await response.json();
      setDoctorInfo(userData);
      fetchPatients();
    } catch (error) {
      console.error("Erreur d'authentification:", error);
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      setDoctorInfo(localUser);
      fetchPatients();
    }
  };

  useEffect(() => {
    const filtered = patients.filter((p) =>
      (p.nom?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (p.prenom?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (p.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
      });
      if (!response.ok) {
        if (response.status === 401) { clearAndRedirect(navigate); return; }
        throw new Error("Failed to fetch");
      }
      const data = await response.json();
      setPatients(data); setFilteredPatients(data); setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des patients:", error);
      setPatients([]); setFilteredPatients([]); setLoading(false);
    }
  };

  const fetchPatientDetails = async (patientId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
      });
      if (!response.ok) {
        if (response.status === 401) { clearAndRedirect(navigate); return; }
        throw new Error("Failed to fetch patient details");
      }
      const patientData = await response.json();
      if (patientData.visites) {
        patientData.visites = patientData.visites.map((visite) => {
          if (visite.prescription_fichiers && typeof visite.prescription_fichiers === "string") {
            try { visite.prescription_fichiers = JSON.parse(visite.prescription_fichiers); }
            catch (e) { visite.prescription_fichiers = []; }
          } else if (!visite.prescription_fichiers) { visite.prescription_fichiers = []; }
          return visite;
        });
      }
      setPatients((prev) => prev.map((p) => (p.id === patientId ? patientData : p)));
      setSelectedPatient(patientData);
      setEditPatient(patientData);
    } catch (error) { console.error("Erreur:", error); }
  };

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    fetchPatientDetails(patient.id);
    setShowDocumentsList(false); setShowVisitesList(false);
    setVisitesPage(1); setExpandedVisiteId(null);
  };

  const handleAddPatient = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body:JSON.stringify(newPatient)
      });
      if (response.ok) {
        const patient = await response.json();
        setPatients([...patients, patient]); setShowAddModal(false);
        setNewPatient({ nom:"", prenom:"", age:"", poids:"", taille:"", email:"", telephone:"", adresse:"", groupe_sanguin:"", antecedents_medicaux:"", antecedents_chirurgicaux:"", antecedents_familiaux:"", allergies:"", medicaments_actuels:"" });
      } else { const e = await response.json(); alert("Erreur: " + (e.error||"Erreur inconnue")); }
    } catch (error) { console.error(error); alert("Erreur lors de l'ajout du patient"); }
    finally { setIsSubmitting(false); }
  };

  const handleEditPatient = async (e) => {
    e.preventDefault(); if (!selectedPatient) return; setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${selectedPatient.id}`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body:JSON.stringify(editPatient)
      });
      if (response.ok) {
        await fetchPatientDetails(selectedPatient.id);
        setShowEditModal(false);
      } else { const e = await response.json(); alert("Erreur: " + (e.error||"Erreur inconnue")); }
    } catch (error) { console.error(error); alert("Erreur lors de la modification"); }
    finally { setIsSubmitting(false); }
  };

  const handleDeletePatient = async () => {
    if (!selectedPatient) return;

    const confirmDelete = window.confirm("Voulez-vous vraiment supprimer ce patient ?");
    if (!confirmDelete) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${selectedPatient.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const remainingPatients = patients.filter((p) => p.id !== selectedPatient.id);
        setPatients(remainingPatients);
        setFilteredPatients(remainingPatients);
        setSelectedPatient(null);
        setShowEditModal(false);
      } else {
        const e = await response.json();
        alert("Erreur: " + (e.error || "Erreur inconnue"));
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression du patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault(); if (!selectedPatient) return;
    const formData = new FormData();
    if (newDocument.titre) formData.append("titre", newDocument.titre);
    if (newDocument.type) formData.append("type", newDocument.type);
    if (newDocument.date_document) formData.append("date_document", newDocument.date_document);
    if (newDocument.notes) formData.append("notes", newDocument.notes);
    if (newDocument.fichier) { formData.append("document", newDocument.fichier); } else { alert("Veuillez sélectionner un fichier"); return; }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${selectedPatient.id}/documents`, {
        method:"POST",
        headers:{ Authorization:`Bearer ${token}` },
        body:formData
      });
      if (response.ok) {
        const document = await response.json();
        const updatedPatient = { ...selectedPatient, documents: [...(selectedPatient.documents||[]), document] };
        setSelectedPatient(updatedPatient);
        setPatients((prev) => prev.map((p) => (p.id === selectedPatient.id ? updatedPatient : p)));
        setShowDocumentModal(false);
        setNewDocument({ titre:"", type:"autre", date_document:"", notes:"", fichier:null });
        fetchPatientDetails(selectedPatient.id);
      } else { const e = await response.json(); alert("Erreur: " + (e.error||"Erreur inconnue")); }
    } catch (error) { console.error(error); alert("Erreur: " + error.message); }
    finally { setIsSubmitting(false); }
  };

  const handleAddVisite = async (e) => {
    e.preventDefault(); if (!selectedPatient) return;
    const formData = new FormData();
    Object.keys(newVisite).forEach((key) => {
      if (key === "prescription_fichiers" && newVisite.prescription_fichiers?.length > 0) {
        newVisite.prescription_fichiers.forEach((file, idx) => formData.append(`prescription_fichiers[${idx}]`, file));
      } else if (newVisite[key] !== null && newVisite[key] !== "" && newVisite[key] !== undefined) {
        formData.append(key, newVisite[key]);
      }
    });
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${selectedPatient.id}/visites`, {
        method:"POST",
        headers:{ Authorization:`Bearer ${token}` },
        body:formData
      });
      if (response.ok) {
        const visite = await response.json();
        if (visite.prescription_fichiers && typeof visite.prescription_fichiers === "string") {
          try { visite.prescription_fichiers = JSON.parse(visite.prescription_fichiers); } catch (e) { visite.prescription_fichiers = []; }
        } else if (!visite.prescription_fichiers) { visite.prescription_fichiers = []; }
        const updatedPatient = { ...selectedPatient, visites: [visite, ...(selectedPatient.visites||[])] };
        setSelectedPatient(updatedPatient);
        setPatients((prev) => prev.map((p) => (p.id === selectedPatient.id ? updatedPatient : p)));
        setShowVisiteModal(false);
        setNewVisite({ date_visite:"", motif:"", diagnostic:"", prescription_texte:"", montant:"", statut_paiement:"en_attente", medecin:"", notes:"", prescription_fichiers:[], statut:"planifié" });
      } else { const e = await response.json(); alert("Erreur: " + (e.error||"Erreur inconnue")); }
    } catch (error) { console.error(error); alert("Erreur lors de l'ajout de la visite"); }
    finally { setIsSubmitting(false); }
  };

  const handleEditVisiteClick = (visite) => {
    setEditVisite(visite);
    const formattedDate = formatDateForInput(visite.date_visite);
    setEditVisiteData({ date_visite:formattedDate, motif:visite.motif||"", diagnostic:visite.diagnostic||"", prescription_texte:visite.prescription_texte||"", montant:visite.montant||"", statut_paiement:visite.statut_paiement||"en_attente", medecin:visite.medecin||"", notes:visite.notes||"", statut:visite.statut||"planifié" });
    setShowEditVisiteModal(true);
  };

  const handleTemplatePDFGenerated = (pdfBlob, templateName) => { setPendingTemplatePDF(pdfBlob); setShowTemplateEditor(false); };

  const handleUpdateVisite = async (e) => {
    e.preventDefault(); if (!selectedPatient || !editVisite) return; setIsSubmitting(true);
    try {
      const oldDate = editVisite.date_visite;
      let pdfFile = null;
      if (pendingTemplatePDF) {
        pdfFile = new File([pendingTemplatePDF], `prescription_${Date.now()}.pdf`, { type:"application/pdf" });
      } else if (editVisiteData.prescription_texte) {
        const doc = new jsPDF();
        doc.setFontSize(16); doc.text("Prescription", 20, 20);
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(editVisiteData.prescription_texte, 170);
        doc.text(lines, 20, 40);
        const blob = doc.output("blob");
        pdfFile = new File([blob], `prescription_${Date.now()}.pdf`, { type:"application/pdf" });
      }
      const updateResponse = await fetch(`${API_BASE_URL}/patients/${selectedPatient.id}/visites/${editVisite.id}`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body:JSON.stringify(editVisiteData)
      });
      if (!updateResponse.ok) { const e = await updateResponse.json(); throw new Error(e.error||e.message||"Erreur lors de la mise à jour"); }
      if (pdfFile) {
        const formData = new FormData(); formData.append("prescription_file", pdfFile);
        const fileResponse = await fetch(`${API_BASE_URL}/patients/${selectedPatient.id}/visites/${editVisite.id}/prescription-file`, {
          method:"POST",
          headers:{ Authorization:`Bearer ${token}` },
          body:formData
        });
        if (!fileResponse.ok) { const e = await fileResponse.json(); throw new Error(e.error||e.message||"Erreur fichier"); }
      }
      await updateAppointmentFromVisite(selectedPatient.id, oldDate, editVisiteData);
      fetchPatientDetails(selectedPatient.id);
      setShowEditVisiteModal(false); setEditVisite(null); setPendingTemplatePDF(null);
    } catch (error) { console.error(error); alert("Erreur: " + error.message); }
    finally { setIsSubmitting(false); }
  };

  const openNotesModal = () => {
    setNotesContent(selectedPatient?.notes_doctor || "");
    setShowNotesModal(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedPatient) return;
    setSavingNotes(true);
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${selectedPatient.id}`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body:JSON.stringify({ notes_doctor: notesContent })
      });
      if (response.ok) {
        const updatedPatient = { ...selectedPatient, notes_doctor: notesContent };
        setSelectedPatient(updatedPatient);
        setPatients((prev) => prev.map((p) => (p.id === selectedPatient.id ? updatedPatient : p)));
        setShowNotesModal(false);
      } else {
        alert("Erreur lors de la sauvegarde des notes");
      }
    } catch (error) { console.error(error); alert("Erreur lors de la sauvegarde"); }
    finally { setSavingNotes(false); }
  };

  const handleLogout = () => {
    if (integrityInterval.current) clearInterval(integrityInterval.current);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userIntegrityHash");
    navigate("/login");
  };

  const toggleSection = (section, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const mainEl = mainContentRef.current;
    const scrollPos = mainEl ? mainEl.scrollTop : 0;
    setExpandedSections({ ...expandedSections, [section]: !expandedSections[section] });
    requestAnimationFrame(() => {
      if (mainEl) mainEl.scrollTop = scrollPos;
    });
  };
  const toggleVisiteExpand = (visiteId) => setExpandedVisiteId(expandedVisiteId === visiteId ? null : visiteId);
  const loadMoreVisites = () => setVisitesPage((prev) => prev + 1);
  const getPaginatedVisites = () => { if (!selectedPatient?.visites) return []; return selectedPatient.visites.slice(0, visitesPage * visitesPerPage); };

  const getTypeIcon = (type) => {
    switch (type) {
      case "scan": return <FaFileMedical style={{ color: "#3B7EF8" }} />;
      case "analyse_sang": return <FaTint style={{ color: "#F43F5E" }} />;
      case "radio": return <FaImage style={{ color: "#8B5CF6" }} />;
      case "ordonnance": return <FaFilePrescription style={{ color: "#10B981" }} />;
      default: return <FaFilePdf style={{ color: "#94A3B8" }} />;
    }
  };

  const getTypeLabel = (type) => {
    const types = { scan:"Scanner", analyse_sang:"Analyse sanguine", radio:"Radiographie", ordonnance:"Ordonnance", autre:"Autre" };
    return types[type] || type;
  };

  const getPaymentStatusBadge = (statut) => {
    if (statut === "paye") return <span className="badge-paid px-2.5 py-0.5 rounded-full text-xs font-600" style={{ fontWeight: 600 }}>Payé</span>;
    if (statut === "en_attente") return <span className="badge-pending px-2.5 py-0.5 rounded-full text-xs font-600" style={{ fontWeight: 600 }}>En attente</span>;
    if (statut === "impaye") return <span className="badge-unpaid px-2.5 py-0.5 rounded-full text-xs font-600" style={{ fontWeight: 600 }}>Impayé</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600" style={{ fontWeight: 600 }}>{statut}</span>;
  };

  const getVisitStatusBadge = (statut) => {
    if (statut === "terminé") return <span className="badge-done px-2.5 py-0.5 rounded-full text-xs font-600" style={{ fontWeight: 600 }}>Terminé</span>;
    if (statut === "annulé") return <span className="badge-cancelled px-2.5 py-0.5 rounded-full text-xs font-600" style={{ fontWeight: 600 }}>Annulé</span>;
    return <span className="badge-planned px-2.5 py-0.5 rounded-full text-xs font-600" style={{ fontWeight: 600 }}>Planifié</span>;
  };

  const getFileIcon = (filename) => {
    if (!filename) return <FaFileMedical style={{ color: "#94A3B8" }} />;
    const ext = filename.split(".").pop().toLowerCase();
    if (["jpg","jpeg","png","gif","bmp"].includes(ext)) return <FaImage style={{ color: "#8B5CF6" }} />;
    if (ext === "pdf") return <FaFilePdf style={{ color: "#F43F5E" }} />;
    return <FaFileMedical style={{ color: "#94A3B8" }} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "linear-gradient(135deg, #060D1F 0%, #0C1A3A 100%)" }}>
        <style>{globalStyles}</style>
        <FontInjector />
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 sidebar-logo-ring">
            <FaStethoscope className="text-white text-2xl" />
          </div>
          <div className="flex items-center gap-2 text-white justify-center">
            <FaSpinner className="animate-spin text-blue-400" />
            <span className="text-sm" style={{ color: "#94A3B8" }}>Chargement en cours…</span>
          </div>
        </div>
      </div>
    );
  }

  const navItems = customNavItems || [
    { to: "/docdb", icon: <FaHome />, label: "Tableau de bord" },
    { to: "/patients", icon: <FaUserInjured />, label: "Patients", active: activePath === "/patients" },
    { to: "/prescription", icon: <FaFileMedical />, label: "Ordonnance" },
    { to: "/rendezvous", icon: <FaCalendarCheck />, label: "Rendez-vous" },
    { to: "/docwaiting", icon: <FaUserClock />, label: "Salle d'attente" },
    { to: "/createsec", icon: <FaUserPlus />, label: "Secrétaire" },
    { to: "/docstats", icon: <FaChartLine />, label: "Statistiques" },
    { to: "/doctasks", icon: <FaTasks />, label: "Tâches" },
    { to: "/docmail", icon: <FaEnvelope />, label: "Communication" },
    { to: "/doctuto", icon: <FaGraduationCap />, label: "Tutoriel" },
    { to: "/docsettings", icon: <FaCog />, label: "Paramètres" },
  ];

  const inputCls = "w-full p-3 rounded-xl text-sm input-field";
  const labelCls = "block text-xs font-600 mb-1.5 uppercase tracking-wider";
  const labelStyle = { color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.07em" };

  const SectionBlock = ({ id, icon, title, children }) => (
    <div className="rounded-2xl overflow-hidden section-card">
      <button
        onClick={(e) => toggleSection(id, e)}
        className="w-full px-6 py-4 flex items-center justify-between transition-colors duration-200 hover:bg-blue-50/40"
        style={{ background: expandedSections[id] ? "linear-gradient(135deg, #F0F4FF, #EEF4FF)" : "#FAFBFF" }}
      >
        <span className="flex items-center gap-2.5 font-600 text-sm" style={{ fontWeight: 600, color: "var(--text-primary)" }}>
          {icon}<span>{title}</span>
        </span>
        <span style={{ color: "var(--accent)" }}>{expandedSections[id] ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}</span>
      </button>
      {expandedSections[id] && (
        <div className="p-6 bg-white section-content animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="patients-root flex h-screen overflow-hidden">
      <style>{globalStyles}</style>
      <FontInjector />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center text-white rounded-r-xl shadow-lg sidebar-toggle"
      >
        {sidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
      </button>

      <aside className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-40 w-64 flex flex-col sidebar-nav`}>
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center sidebar-logo-ring flex-shrink-0">
              <FaStethoscope className="text-white text-base" />
            </div>
            <div>
              <h1 className="text-white text-lg font-800" style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Cabi Doc</h1>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{spaceLabel}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-500 ${item.active ? "active" : ""}`}
              style={{ color: item.active ? "#fff" : "rgba(255,255,255,0.55)", fontWeight: 500 }}
            >
              <span style={{ opacity: item.active ? 1 : 0.7 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 m-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-700 text-sm flex-shrink-0 sidebar-logo-ring" style={{ fontWeight: 700 }}>
              {doctorInfo?.name?.charAt(0) || user?.name?.charAt(0) || roleInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-600 truncate" style={{ fontWeight: 600 }}>{doctorInfo?.name || user?.name || userRoleLabel}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{userRoleLabel}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-500 transition-all hover:bg-red-500/20" style={{ color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
            <FaSignOutAlt size={13} /><span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 lg:hidden" style={{ background: "rgba(6,13,31,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setSidebarOpen(false)} />}

      <main ref={mainContentRef} className="flex-1 overflow-y-auto" style={{ background: "var(--surface)" }}>
        <div className="p-6 lg:p-8 pt-14 lg:pt-8 max-w-7xl mx-auto">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center btn-primary">
                  <FaUserInjured className="text-white" size={14} />
                </div>
                <h2 className="text-2xl font-800" style={{ color: "var(--text-primary)", fontWeight: 800, letterSpacing: "-0.03em" }}>{pageTitle}</h2>
              </div>
              <p className="text-sm ml-11" style={{ color: "var(--text-secondary)" }}>
                <span className="font-600" style={{ color: "var(--accent)", fontWeight: 600 }}>{filteredPatients.length}</span> patient{filteredPatients.length !== 1 ? "s" : ""} enregistré{filteredPatients.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary mt-4 sm:mt-0 text-white px-5 py-2.5 rounded-xl text-sm font-600 flex items-center gap-2"
              style={{ fontWeight: 600 }}
            >
              <FaPlus size={12} />
              Nouveau patient
            </button>
          </div>

          <div className="relative mb-6">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} size={14} />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm input-field"
              style={{ background: "#fff", boxShadow: "0 2px 12px rgba(6,13,31,0.06)" }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            <div className="lg:col-span-2 space-y-3">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient, i) => (
                  <div
                    key={patient.id}
                    onClick={() => handlePatientClick(patient)}
                    className={`patient-card bg-white rounded-2xl p-4 cursor-pointer ${selectedPatient?.id === patient.id ? "selected" : ""} fade-in-item`}
                    style={{ boxShadow: "0 2px 12px rgba(6,13,31,0.05)", animationDelay: `${i * 40}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-700 flex-shrink-0 text-sm"
                        style={{
                          fontWeight: 700,
                          background: selectedPatient?.id === patient.id
                            ? "linear-gradient(135deg, var(--accent), #2563EB)"
                            : "linear-gradient(135deg, #E8EEFF, #D1DCFF)",
                          color: selectedPatient?.id === patient.id ? "#fff" : "var(--accent)",
                        }}
                      >
                        {(patient.nom?.charAt(0) || "P").toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-700 text-sm truncate" style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                          {patient.nom || ""} {patient.prenom || ""}
                        </p>
                        <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-secondary)" }}>
                          {patient.age ? `${patient.age} ans` : "Âge non renseigné"}
                          {patient.email ? ` · ${patient.email}` : ""}
                        </p>
                      </div>
                      <div className="stat-chip px-2.5 py-1 rounded-lg text-xs font-600 flex-shrink-0" style={{ fontWeight: 600, color: "var(--accent)" }}>
                        {patient.visites?.length || 0}V
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl p-10 text-center" style={{ border: "1.5px dashed #E8EEFF" }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#F0F4FF" }}>
                    <FaFolderOpen style={{ color: "#94A3B8" }} size={22} />
                  </div>
                  <p className="font-700 text-sm mb-1" style={{ fontWeight: 700, color: "var(--text-primary)" }}>Aucun patient trouvé</p>
                  <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>Commencez par ajouter votre premier patient</p>
                  <button onClick={() => setShowAddModal(true)} className="btn-primary text-white px-4 py-2 rounded-xl text-xs font-600 inline-flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                    <FaPlus size={10} /> Ajouter un patient
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-3">
              {selectedPatient ? (
                <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(6,13,31,0.08)", border: "1.5px solid var(--border)" }}>
                  <div className="px-6 pt-6 pb-5" style={{ background: "linear-gradient(135deg, #F8FAFF 0%, #EEF4FF 100%)", borderBottom: "1.5px solid #E8EEFF" }}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-800 text-xl flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--accent), #2563EB)", fontWeight: 800, boxShadow: "0 4px 14px rgba(59,126,248,0.35)" }}>
                          {(selectedPatient.nom?.charAt(0) || "P").toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-800" style={{ fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                            {selectedPatient.nom || ""} {selectedPatient.prenom || ""}
                          </h3>
                          <div className="flex flex-wrap gap-3 mt-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                            {selectedPatient.poids && <span className="flex items-center gap-1"><FaWeight size={11} />{selectedPatient.poids} kg</span>}
                            {selectedPatient.taille && <span className="flex items-center gap-1"><FaRuler size={11} />{selectedPatient.taille} cm</span>}
                            {selectedPatient.telephone && <span className="flex items-center gap-1"><FaPhone size={11} />{selectedPatient.telephone}</span>}
                            {selectedPatient.groupe_sanguin && (
                              <span className="px-2 py-0.5 rounded-lg font-700 text-xs" style={{ background: "#FFF1F2", color: "#E11D48", border: "1px solid #FECDD3", fontWeight: 700 }}>
                                {selectedPatient.groupe_sanguin}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setShowEditModal(true)} className="btn-amber text-white px-3.5 py-2 rounded-xl text-xs font-600 flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                          <FaEdit size={11} /> Modifier
                        </button>
                        <button
                          onClick={handleDeletePatient}
                          disabled={isSubmitting}
                          className="text-white px-3.5 py-2 rounded-xl text-xs font-600 flex items-center gap-1.5 transition-all disabled:opacity-50"
                          style={{ fontWeight: 600, background: "linear-gradient(135deg, #F43F5E, #BE123C)", boxShadow: "0 4px 14px rgba(244,63,94,0.32)" }}
                        >
                          <FaTrash size={11} /> Supprimer
                        </button>
                        {showDocuments && (
                          <button
                            onClick={() => { setShowDocumentsList(!showDocumentsList); setShowVisitesList(false); }}
                            className={`text-white px-3.5 py-2 rounded-xl text-xs font-600 flex items-center gap-1.5 transition-all ${showDocumentsList ? "btn-emerald" : "hover:bg-emerald-50"}`}
                            style={{ fontWeight: 600, ...(showDocumentsList ? {} : { background: "#E8FFF6", color: "#065F46", border: "1.5px solid #A7F3D0" }) }}
                          >
                            <FaFileMedical size={11} /> Documents ({selectedPatient.documents?.length || 0})
                          </button>
                        )}
                        {showVisites && (
                          <button
                            onClick={() => { setShowVisitesList(!showVisitesList); setShowDocumentsList(false); }}
                            className={`text-white px-3.5 py-2 rounded-xl text-xs font-600 flex items-center gap-1.5 transition-all ${showVisitesList ? "btn-primary" : "hover:bg-blue-50"}`}
                            style={{ fontWeight: 600, ...(showVisitesList ? {} : { background: "#EEF4FF", color: "var(--accent)", border: "1.5px solid #BFDBFE" }) }}
                          >
                            <FaCalendarCheck size={11} /> Visites ({selectedPatient.visites?.length || 0})
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    {showDocuments && showDocumentsList && (
                      <div className="rounded-2xl overflow-hidden section-card animate-fadeIn">
                        <div className="px-5 py-3 flex justify-between items-center" style={{ background: "linear-gradient(135deg, #F0FFF8, #ECFDF5)", borderBottom: "1.5px solid #A7F3D0" }}>
                          <span className="font-700 text-sm flex items-center gap-2" style={{ fontWeight: 700, color: "#065F46" }}>
                            <FaFileMedical size={14} /> Documents médicaux
                          </span>
                          <button onClick={() => setShowDocumentModal(true)} className="btn-emerald text-white px-3 py-1.5 rounded-xl text-xs font-600 flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                            <FaUpload size={11} /> Ajouter
                          </button>
                        </div>
                        <div className="p-4 bg-white">
                          {selectedPatient.documents?.length > 0 ? (
                            <div className="space-y-2">
                              {selectedPatient.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#F8FAFF", border: "1.5px solid #E8EEFF" }}>
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EEF4FF" }}>
                                      {getTypeIcon(doc.type)}
                                    </div>
                                    <div>
                                      <p className="font-600 text-sm" style={{ fontWeight: 600, color: "var(--text-primary)" }}>{doc.titre || "Sans titre"}</p>
                                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                        {getTypeLabel(doc.type)} · {doc.date_document ? new Date(doc.date_document).toLocaleDateString("fr-FR") : "Date inconnue"}
                                      </p>
                                    </div>
                                  </div>
                                  {doc.fichier_nom && (
                                    <div className="flex gap-1.5">
                                      <a href={`${API_BASE_URL}/patients/${selectedPatient.id}/documents/${doc.id}/view?token=${token}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-blue-50" style={{ color: "var(--accent)", border: "1.5px solid #BFDBFE" }}><FaEye size={13} /></a>
                                      <a href={`${API_BASE_URL}/patients/${selectedPatient.id}/documents/${doc.id}/download?token=${token}`} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-green-50" style={{ color: "#10B981", border: "1.5px solid #A7F3D0" }}><FaDownload size={13} /></a>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center py-6 text-sm" style={{ color: "var(--text-secondary)" }}>Aucun document médical</p>
                          )}
                        </div>
                      </div>
                    )}

                    {showVisites && showVisitesList && (
                      <div className="rounded-2xl overflow-hidden section-card animate-fadeIn">
                        <div className="px-5 py-3" style={{ background: "linear-gradient(135deg, #EEF4FF, #E0EDFF)", borderBottom: "1.5px solid #BFDBFE" }}>
                          <span className="font-700 text-sm flex items-center gap-2" style={{ fontWeight: 700, color: "#1E40AF" }}>
                            <FaCalendarCheck size={14} /> Historique des visites
                          </span>
                        </div>
                        <div className="p-4 bg-white space-y-2">
                          {selectedPatient.visites?.length > 0 ? (
                            <>
                              {getPaginatedVisites().map((visite) => {
                                const fichiers = Array.isArray(visite.prescription_fichiers)
                                  ? visite.prescription_fichiers
                                  : visite.prescription_fichiers ? [visite.prescription_fichiers] : [];
                                return (
                                  <div key={visite.id} className="visite-row rounded-xl overflow-hidden transition-all">
                                    <div
                                      onClick={() => toggleVisiteExpand(visite.id)}
                                      className="visite-header px-4 py-3 flex justify-between items-center transition-colors"
                                    >
                                      <div>
                                        <p className="font-700 text-sm" style={{ fontWeight: 700, color: "var(--accent)" }}>
                                          {visite.date_visite ? new Date(visite.date_visite).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" }) : "Date inconnue"}
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{visite.motif || "Motif non spécifié"}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {getVisitStatusBadge(visite.statut)}
                                        {getPaymentStatusBadge(visite.statut_paiement)}
                                        <button onClick={(e) => { e.stopPropagation(); handleEditVisiteClick(visite); }} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-amber-100" style={{ color: "#D97706" }}><FaEdit size={12} /></button>
                                        <span style={{ color: "var(--accent)" }}>{expandedVisiteId === visite.id ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}</span>
                                      </div>
                                    </div>
                                    {expandedVisiteId === visite.id && (
                                      <div className="px-4 pb-4 pt-3 bg-white space-y-2.5 text-sm animate-fadeIn" style={{ borderTop: "1.5px solid #E8EEFF" }}>
                                        {visite.medecin && <p><span className="font-600" style={{ fontWeight: 600, color: "#475569" }}>Médecin :</span> <span style={{ color: "var(--text-primary)" }}>{visite.medecin}</span></p>}
                                        {visite.diagnostic && <p><span className="font-600" style={{ fontWeight: 600, color: "#475569" }}>Diagnostic :</span> <span style={{ color: "var(--text-primary)" }}>{visite.diagnostic}</span></p>}
                                        {visite.prescription_texte && (
                                          <div className="rounded-xl p-3" style={{ background: "#F0F4FF", border: "1px solid #DBEAFE" }}>
                                            <p className="font-600 text-xs mb-1" style={{ fontWeight: 600, color: "#1E40AF" }}>Prescription</p>
                                            <p style={{ color: "var(--text-primary)" }}>{visite.prescription_texte}</p>
                                          </div>
                                        )}
                                        {fichiers.length > 0 && (
                                          <div>
                                            <p className="font-600 text-xs mb-2" style={{ fontWeight: 600, color: "#475569" }}>Fichiers joints</p>
                                            <div className="space-y-1.5">
                                              {fichiers.map((file, idx) => {
                                                const fileName = typeof file === "string" ? file : file.nom || `Fichier ${idx + 1}`;
                                                return (
                                                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: "#F8FAFF", border: "1px solid #E8EEFF" }}>
                                                    <div className="flex items-center gap-2">
                                                      {getFileIcon(fileName)}
                                                      <span className="text-xs truncate max-w-32" style={{ color: "var(--text-primary)" }}>{fileName}</span>
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                      <a href={`${API_BASE_URL}/patients/${selectedPatient.id}/visites/${visite.id}/prescription/${idx}/view?token=${token}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-blue-50" style={{ color: "var(--accent)" }}><FaEye size={12} /></a>
                                                      <a href={`${API_BASE_URL}/patients/${selectedPatient.id}/visites/${visite.id}/prescription/${idx}/download?token=${token}`} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-green-50" style={{ color: "#10B981" }}><FaDownload size={12} /></a>
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}
                                        {visite.montant && (
                                          <p className="flex items-center gap-2 text-xs">
                                            <FaMoneyBillWave style={{ color: "#10B981" }} />
                                            <span className="font-600" style={{ fontWeight: 600, color: "#065F46" }}>Montant :</span>
                                            <span style={{ color: "var(--text-primary)" }}>{visite.montant}</span>
                                          </p>
                                        )}
                                        {visite.notes && <p className="text-xs italic" style={{ color: "var(--text-secondary)" }}>{visite.notes}</p>}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              {selectedPatient.visites.length > visitesPage * visitesPerPage && (
                                <button onClick={loadMoreVisites} className="w-full py-2 text-xs font-600 rounded-xl transition-all hover:bg-blue-50" style={{ color: "var(--accent)", fontWeight: 600, border: "1.5px dashed #BFDBFE" }}>
                                  Voir plus de visites…
                                </button>
                              )}
                            </>
                          ) : (
                            <p className="text-center py-6 text-sm" style={{ color: "var(--text-secondary)" }}>Aucune visite enregistrée</p>
                          )}
                        </div>
                      </div>
                    )}

                    <SectionBlock id="info" icon={<FaUser size={13} style={{ color: "var(--accent)" }} />} title="Informations personnelles">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {[
                          ["Âge", selectedPatient.age ? `${selectedPatient.age} ans` : "—"],
                          ["Groupe sanguin", selectedPatient.groupe_sanguin || "—"],
                          ["Email", selectedPatient.email || "—", true],
                          ["Téléphone", selectedPatient.telephone || "—", true],
                          ["Adresse", selectedPatient.adresse || "—", true],
                          ["Allergies", selectedPatient.allergies || "Aucune", true],
                        ].map(([label, value, full]) => (
                          <div key={label} className={full ? "col-span-2" : ""}>
                            <p className="text-xs mb-0.5" style={{ color: "var(--text-secondary)" }}>{label}</p>
                            <p className="font-600" style={{ fontWeight: 600, color: "var(--text-primary)" }}>{value}</p>
                          </div>
                        ))}
                      </div>
                    </SectionBlock>

                    {showMedicalHistory && (
                      <>
                        <SectionBlock id="antecedents" icon={<FaStethoscope size={13} style={{ color: "var(--accent)" }} />} title="Antécédents médicaux">
                          <p className="text-sm mb-3" style={{ color: "var(--text-primary)" }}>{selectedPatient.antecedents_medicaux || "Aucun antécédent médical renseigné."}</p>
                          {selectedPatient.medicaments_actuels && (
                            <div className="rounded-xl p-3" style={{ background: "#EEF4FF", border: "1px solid #BFDBFE" }}>
                              <p className="text-xs font-600 mb-1" style={{ fontWeight: 600, color: "#1E40AF" }}>Médicaments actuels</p>
                              <p className="text-sm" style={{ color: "var(--text-primary)" }}>{selectedPatient.medicaments_actuels}</p>
                            </div>
                          )}
                        </SectionBlock>

                        <SectionBlock id="chirurgicaux" icon={<FaFileMedical size={13} style={{ color: "var(--accent)" }} />} title="Antécédents chirurgicaux">
                          <p className="text-sm" style={{ color: "var(--text-primary)" }}>{selectedPatient.antecedents_chirurgicaux || "Aucun antécédent chirurgical renseigné."}</p>
                        </SectionBlock>

                        <SectionBlock id="familiaux" icon={<FaUserInjured size={13} style={{ color: "var(--accent)" }} />} title="Antécédents familiaux">
                          <p className="text-sm" style={{ color: "var(--text-primary)" }}>{selectedPatient.antecedents_familiaux || "Aucun antécédent familial renseigné."}</p>
                        </SectionBlock>
                      </>
                    )}

                    {showDoctorNotes && (
                      <SectionBlock id="notes" icon={<FaNotesMedical size={13} style={{ color: "var(--accent)" }} />} title="Notes du médecin">
                        <div className="space-y-3">
                          <button
                            onClick={openNotesModal}
                            className="btn-primary text-white px-4 py-2 rounded-xl text-sm font-600 flex items-center gap-2"
                          >
                            <FaEdit size={12} /> Modifier les notes
                          </button>
                          {selectedPatient.notes_doctor && (
                            <div className="p-3 rounded-xl" style={{ background: "#F0F4FF", border: "1px solid #DBEAFE" }}>
                              <p className="text-xs font-600 mb-1" style={{ fontWeight: 600, color: "#1E40AF" }}>Notes existantes</p>
                              <p className="text-sm" style={{ color: "var(--text-primary)" }}>{selectedPatient.notes_doctor}</p>
                            </div>
                          )}
                        </div>
                      </SectionBlock>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-20" style={{ boxShadow: "0 4px 24px rgba(6,13,31,0.06)", border: "1.5px dashed #D1DCFF" }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: "linear-gradient(135deg, #EEF4FF, #E0EDFF)" }}>
                    <FaUserInjured style={{ color: "var(--accent)" }} size={26} />
                  </div>
                  <h3 className="font-800 text-base mb-2" style={{ fontWeight: 800, color: "var(--text-primary)" }}>Sélectionnez un patient</h3>
                  <p className="text-sm text-center max-w-56" style={{ color: "var(--text-secondary)" }}>Cliquez sur un patient dans la liste pour voir ses informations détaillées</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showDoctorNotes && showNotesModal && selectedPatient && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-lg w-full shadow-2xl">
            <div className="px-8 py-6" style={{ borderBottom: "1.5px solid #E8EEFF" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center btn-primary">
                  <FaNotesMedical className="text-white" size={14} />
                </div>
                <div>
                  <h3 className="font-800 text-base" style={{ fontWeight: 800, color: "var(--text-primary)" }}>Notes du médecin</h3>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{selectedPatient.nom} {selectedPatient.prenom}</p>
                </div>
              </div>
            </div>
            <div className="px-8 py-6">
              <textarea
                className="w-full p-3 rounded-xl text-sm input-field"
                rows="8"
                placeholder="Ajouter des notes médicales privées…"
                value={notesContent}
                onChange={(e) => setNotesContent(e.target.value)}
                autoFocus
              />
            </div>
            <div className="px-8 pb-6 pt-2 flex justify-end gap-3">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-600 hover:bg-gray-100 transition-all"
                style={{ border: "1.5px solid #E2E8F0", color: "#64748B", fontWeight: 600 }}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="btn-primary text-white px-6 py-2.5 rounded-xl text-sm font-600 flex items-center gap-2 disabled:opacity-50"
                style={{ fontWeight: 600 }}
              >
                {savingNotes ? <FaSpinner className="animate-spin" size={13} /> : <><FaSave size={12} /> Enregistrer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-8 py-6 sticky top-0 bg-white" style={{ borderBottom: "1.5px solid #E8EEFF" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center btn-primary">
                  <FaUserPlus className="text-white" size={14} />
                </div>
                <div>
                  <h3 className="font-800 text-base" style={{ fontWeight: 800, color: "var(--text-primary)" }}>Nouveau patient</h3>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Tous les champs sont optionnels</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleAddPatient} className="px-8 py-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls} style={labelStyle}>Nom</label><input type="text" value={newPatient.nom||""} onChange={(e) => setNewPatient({...newPatient,nom:e.target.value})} className={inputCls} placeholder="Dupont" /></div>
                <div><label className={labelCls} style={labelStyle}>Prénom</label><input type="text" value={newPatient.prenom||""} onChange={(e) => setNewPatient({...newPatient,prenom:e.target.value})} className={inputCls} placeholder="Marie" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={labelCls} style={labelStyle}>Âge</label><input type="number" value={newPatient.age||""} onChange={(e) => setNewPatient({...newPatient,age:e.target.value})} className={inputCls} placeholder="42" /></div>
                <div><label className={labelCls} style={labelStyle}>Poids (kg)</label><input type="number" step="0.1" value={newPatient.poids||""} onChange={(e) => setNewPatient({...newPatient,poids:e.target.value})} className={inputCls} placeholder="70" /></div>
                <div><label className={labelCls} style={labelStyle}>Taille (cm)</label><input type="number" step="0.1" value={newPatient.taille||""} onChange={(e) => setNewPatient({...newPatient,taille:e.target.value})} className={inputCls} placeholder="170" /></div>
              </div>
              <div><label className={labelCls} style={labelStyle}>Email</label><input type="email" value={newPatient.email||""} onChange={(e) => setNewPatient({...newPatient,email:e.target.value})} className={inputCls} placeholder="marie@exemple.fr" /></div>
              <div><label className={labelCls} style={labelStyle}>Téléphone</label><input type="tel" value={newPatient.telephone||""} onChange={(e) => setNewPatient({...newPatient,telephone:e.target.value})} className={inputCls} placeholder="+33 6 00 00 00 00" /></div>
              <div><label className={labelCls} style={labelStyle}>Adresse</label><input type="text" value={newPatient.adresse||""} onChange={(e) => setNewPatient({...newPatient,adresse:e.target.value})} className={inputCls} placeholder="12 rue de la Paix, Paris" /></div>
              <div>
                <label className={labelCls} style={labelStyle}>Groupe sanguin</label>
                <select value={newPatient.groupe_sanguin||""} onChange={(e) => setNewPatient({...newPatient,groupe_sanguin:e.target.value})} className={inputCls}>
                  <option value="">Sélectionner</option>
                  {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g=><option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-600 hover:bg-gray-100 transition-all" style={{ border: "1.5px solid #E2E8F0", color: "#64748B", fontWeight: 600 }}>Annuler</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary text-white px-6 py-2.5 rounded-xl text-sm font-600 flex items-center gap-2 disabled:opacity-50" style={{ fontWeight: 600 }}>
                  {isSubmitting ? <FaSpinner className="animate-spin" size={13} /> : <><FaPlus size={12} /> Créer le patient</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedPatient && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-8 py-6 sticky top-0 bg-white" style={{ borderBottom: "1.5px solid #E8EEFF" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center btn-amber">
                  <FaEdit className="text-white" size={14} />
                </div>
                <h3 className="font-800 text-base" style={{ fontWeight: 800, color: "var(--text-primary)" }}>Modifier le patient</h3>
              </div>
            </div>
            <form onSubmit={handleEditPatient} className="px-8 py-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls} style={labelStyle}>Nom</label><input type="text" value={editPatient.nom||""} onChange={(e) => setEditPatient({...editPatient,nom:e.target.value})} className={inputCls} /></div>
                <div><label className={labelCls} style={labelStyle}>Prénom</label><input type="text" value={editPatient.prenom||""} onChange={(e) => setEditPatient({...editPatient,prenom:e.target.value})} className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={labelCls} style={labelStyle}>Âge</label><input type="number" value={editPatient.age||""} onChange={(e) => setEditPatient({...editPatient,age:e.target.value})} className={inputCls} /></div>
                <div><label className={labelCls} style={labelStyle}>Poids (kg)</label><input type="number" step="0.1" value={editPatient.poids||""} onChange={(e) => setEditPatient({...editPatient,poids:e.target.value})} className={inputCls} /></div>
                <div><label className={labelCls} style={labelStyle}>Taille (cm)</label><input type="number" step="0.1" value={editPatient.taille||""} onChange={(e) => setEditPatient({...editPatient,taille:e.target.value})} className={inputCls} /></div>
              </div>
              <div><label className={labelCls} style={labelStyle}>Email</label><input type="email" value={editPatient.email||""} onChange={(e) => setEditPatient({...editPatient,email:e.target.value})} className={inputCls} /></div>
              <div><label className={labelCls} style={labelStyle}>Téléphone</label><input type="tel" value={editPatient.telephone||""} onChange={(e) => setEditPatient({...editPatient,telephone:e.target.value})} className={inputCls} /></div>
              <div><label className={labelCls} style={labelStyle}>Adresse</label><input type="text" value={editPatient.adresse||""} onChange={(e) => setEditPatient({...editPatient,adresse:e.target.value})} className={inputCls} /></div>
              <div>
                <label className={labelCls} style={labelStyle}>Groupe sanguin</label>
                <select value={editPatient.groupe_sanguin||""} onChange={(e) => setEditPatient({...editPatient,groupe_sanguin:e.target.value})} className={inputCls}>
                  <option value="">Sélectionner</option>
                  {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g=><option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div><label className={labelCls} style={labelStyle}>Antécédents médicaux</label><textarea value={editPatient.antecedents_medicaux||""} onChange={(e) => setEditPatient({...editPatient,antecedents_medicaux:e.target.value})} rows="3" className={inputCls} /></div>
              <div><label className={labelCls} style={labelStyle}>Antécédents chirurgicaux</label><textarea value={editPatient.antecedents_chirurgicaux||""} onChange={(e) => setEditPatient({...editPatient,antecedents_chirurgicaux:e.target.value})} rows="3" className={inputCls} /></div>
              <div><label className={labelCls} style={labelStyle}>Antécédents familiaux</label><textarea value={editPatient.antecedents_familiaux||""} onChange={(e) => setEditPatient({...editPatient,antecedents_familiaux:e.target.value})} rows="3" className={inputCls} /></div>
              <div><label className={labelCls} style={labelStyle}>Allergies</label><textarea value={editPatient.allergies||""} onChange={(e) => setEditPatient({...editPatient,allergies:e.target.value})} rows="2" className={inputCls} /></div>
              <div><label className={labelCls} style={labelStyle}>Médicaments actuels</label><textarea value={editPatient.medicaments_actuels||""} onChange={(e) => setEditPatient({...editPatient,medicaments_actuels:e.target.value})} rows="2" className={inputCls} /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-600 hover:bg-gray-100 transition-all" style={{ border: "1.5px solid #E2E8F0", color: "#64748B", fontWeight: 600 }}>Annuler</button>
                <button type="submit" disabled={isSubmitting} className="btn-amber text-white px-6 py-2.5 rounded-xl text-sm font-600 flex items-center gap-2 disabled:opacity-50" style={{ fontWeight: 600 }}>
                  {isSubmitting ? <FaSpinner className="animate-spin" size={13} /> : <><FaSave size={12} /> Enregistrer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDocuments && showDocumentModal && selectedPatient && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-lg w-full shadow-2xl">
            <div className="px-8 py-6" style={{ borderBottom: "1.5px solid #E8EEFF" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center btn-emerald">
                  <FaUpload className="text-white" size={13} />
                </div>
                <div>
                  <h3 className="font-800 text-base" style={{ fontWeight: 800, color: "var(--text-primary)" }}>Ajouter un document</h3>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{selectedPatient.nom} {selectedPatient.prenom}</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleUploadDocument} className="px-8 py-6 space-y-4">
              <div><label className={labelCls} style={labelStyle}>Titre</label><input type="text" value={newDocument.titre||""} onChange={(e) => setNewDocument({...newDocument,titre:e.target.value})} className={inputCls} placeholder="Ex: Bilan sanguin mars 2025" /></div>
              <div>
                <label className={labelCls} style={labelStyle}>Type</label>
                <select value={newDocument.type} onChange={(e) => setNewDocument({...newDocument,type:e.target.value})} className={inputCls}>
                  {[["scan","Scanner"],["analyse_sang","Analyse sanguine"],["radio","Radiographie"],["ordonnance","Ordonnance"],["autre","Autre"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div><label className={labelCls} style={labelStyle}>Date</label><input type="date" value={newDocument.date_document||""} onChange={(e) => setNewDocument({...newDocument,date_document:e.target.value})} className={inputCls} /></div>
              <div>
                <label className={labelCls} style={labelStyle}>Fichier</label>
                <div className="rounded-xl p-4 text-center cursor-pointer transition-all hover:border-blue-400" style={{ border: "2px dashed #BFDBFE", background: "#F8FAFF" }}>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setNewDocument({...newDocument,fichier:e.target.files[0]})} className="hidden" id="doc-file-input" required />
                  <label htmlFor="doc-file-input" className="cursor-pointer">
                    <FaUpload className="mx-auto mb-2" size={20} style={{ color: "var(--accent)" }} />
                    <p className="text-xs font-600" style={{ fontWeight: 600, color: "var(--accent)" }}>{newDocument.fichier ? newDocument.fichier.name : "Cliquer pour sélectionner"}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>PDF, JPG, PNG</p>
                  </label>
                </div>
              </div>
              <div><label className={labelCls} style={labelStyle}>Notes</label><textarea value={newDocument.notes||""} onChange={(e) => setNewDocument({...newDocument,notes:e.target.value})} rows="3" className={inputCls} placeholder="Observations complémentaires…" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowDocumentModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-600 hover:bg-gray-100 transition-all" style={{ border: "1.5px solid #E2E8F0", color: "#64748B", fontWeight: 600 }}>Annuler</button>
                <button type="submit" disabled={isSubmitting} className="btn-emerald text-white px-6 py-2.5 rounded-xl text-sm font-600 flex items-center gap-2 disabled:opacity-50" style={{ fontWeight: 600 }}>
                  {isSubmitting ? <FaSpinner className="animate-spin" size={13} /> : <><FaUpload size={12} /> Ajouter</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVisites && showVisiteModal && selectedPatient && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-8 py-6 sticky top-0 bg-white" style={{ borderBottom: "1.5px solid #E8EEFF" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center btn-primary">
                  <FaCalendarCheck className="text-white" size={13} />
                </div>
                <div>
                  <h3 className="font-800 text-base" style={{ fontWeight: 800, color: "var(--text-primary)" }}>Nouvelle visite</h3>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{selectedPatient.nom} {selectedPatient.prenom}</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleAddVisite} className="px-8 py-6 space-y-4">
              <div><label className={labelCls} style={labelStyle}>Date</label><input type="date" value={newVisite.date_visite||""} onChange={(e) => setNewVisite({...newVisite,date_visite:e.target.value})} className={inputCls} required /></div>
              <div><label className={labelCls} style={labelStyle}>Médecin</label><input type="text" value={newVisite.medecin||""} onChange={(e) => setNewVisite({...newVisite,medecin:e.target.value})} className={inputCls} placeholder="Dr. Nom" /></div>
              <div><label className={labelCls} style={labelStyle}>Motif</label><input type="text" value={newVisite.motif||""} onChange={(e) => setNewVisite({...newVisite,motif:e.target.value})} className={inputCls} placeholder="Consultation, suivi…" /></div>
              <div><label className={labelCls} style={labelStyle}>Diagnostic</label><textarea value={newVisite.diagnostic||""} onChange={(e) => setNewVisite({...newVisite,diagnostic:e.target.value})} rows="2" className={inputCls} /></div>
              <div><label className={labelCls} style={labelStyle}>Prescription (texte)</label><textarea value={newVisite.prescription_texte||""} onChange={(e) => setNewVisite({...newVisite,prescription_texte:e.target.value})} rows="2" className={inputCls} /></div>
              <div>
                <label className={labelCls} style={labelStyle}>Fichiers joints</label>
                <div className="rounded-xl p-3 text-center transition-all hover:border-blue-400" style={{ border: "2px dashed #BFDBFE", background: "#F8FAFF" }}>
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setNewVisite({...newVisite,prescription_fichiers:Array.from(e.target.files)})} className="hidden" id="visite-files" />
                  <label htmlFor="visite-files" className="cursor-pointer text-xs font-600" style={{ color: "var(--accent)", fontWeight: 600 }}>
                    {newVisite.prescription_fichiers?.length > 0 ? `${newVisite.prescription_fichiers.length} fichier(s) sélectionné(s)` : "Cliquer pour ajouter des fichiers"}
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls} style={labelStyle}>Montant</label><input type="text" value={newVisite.montant||""} onChange={(e) => setNewVisite({...newVisite,montant:e.target.value})} className={inputCls} placeholder="45 TND" /></div>
                <div>
                  <label className={labelCls} style={labelStyle}>Paiement</label>
                  <select value={newVisite.statut_paiement} onChange={(e) => setNewVisite({...newVisite,statut_paiement:e.target.value})} className={inputCls}>
                    <option value="paye">Payé</option><option value="en_attente">En attente</option><option value="impaye">Impayé</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Statut de la visite</label>
                <select value={newVisite.statut} onChange={(e) => setNewVisite({...newVisite,statut:e.target.value})} className={inputCls}>
                  <option value="planifié">Planifié</option><option value="terminé">Terminé</option><option value="annulé">Annulé</option>
                </select>
              </div>
              <div><label className={labelCls} style={labelStyle}>Notes</label><textarea value={newVisite.notes||""} onChange={(e) => setNewVisite({...newVisite,notes:e.target.value})} rows="2" className={inputCls} /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowVisiteModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-600 hover:bg-gray-100 transition-all" style={{ border: "1.5px solid #E2E8F0", color: "#64748B", fontWeight: 600 }}>Annuler</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary text-white px-6 py-2.5 rounded-xl text-sm font-600 flex items-center gap-2 disabled:opacity-50" style={{ fontWeight: 600 }}>
                  {isSubmitting ? <FaSpinner className="animate-spin" size={13} /> : <><FaSave size={12} /> Enregistrer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVisites && showEditVisiteModal && editVisite && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="modal-box bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-8 py-6 sticky top-0 bg-white" style={{ borderBottom: "1.5px solid #E8EEFF" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center btn-amber">
                  <FaEdit className="text-white" size={13} />
                </div>
                <div>
                  <h3 className="font-800 text-base" style={{ fontWeight: 800, color: "var(--text-primary)" }}>Modifier la visite</h3>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{selectedPatient.nom} {selectedPatient.prenom}</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleUpdateVisite} className="px-8 py-6 space-y-4">
              <div><label className={labelCls} style={labelStyle}>Date</label><input type="date" value={editVisiteData.date_visite||""} onChange={(e) => setEditVisiteData({...editVisiteData,date_visite:e.target.value})} className={inputCls} required /></div>
              <div><label className={labelCls} style={labelStyle}>Médecin</label><input type="text" value={editVisiteData.medecin||""} onChange={(e) => setEditVisiteData({...editVisiteData,medecin:e.target.value})} className={inputCls} /></div>
              <div><label className={labelCls} style={labelStyle}>Motif</label><input type="text" value={editVisiteData.motif||""} onChange={(e) => setEditVisiteData({...editVisiteData,motif:e.target.value})} className={inputCls} /></div>
              <div><label className={labelCls} style={labelStyle}>Diagnostic</label><textarea value={editVisiteData.diagnostic||""} onChange={(e) => setEditVisiteData({...editVisiteData,diagnostic:e.target.value})} rows="2" className={inputCls} /></div>

              <div className="flex items-center justify-between p-3 rounded-xl transition-all hover:shadow-md" style={{ background: "#F5F0FF", border: "1.5px solid #DDD6FE" }}>
                <div>
                  <p className="font-600 text-sm" style={{ fontWeight: 600, color: "#5B21B6" }}>Créer une ordonnance visuelle</p>
                  <p className="text-xs" style={{ color: "#7C3AED" }}>Éditeur de modèle avec export PDF</p>
                </div>
                <div className="flex items-center gap-2">
                  {pendingTemplatePDF && <span className="text-xs font-600" style={{ color: "#059669", fontWeight: 600 }}>✓ PDF prêt</span>}
                  <button type="button" onClick={() => setShowTemplateEditor(true)} className="btn-purple text-white px-4 py-2 rounded-xl text-xs font-600 flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                    <FaFilePrescription size={11} /> Ouvrir
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls} style={labelStyle}>Montant</label><input type="text" value={editVisiteData.montant||""} onChange={(e) => setEditVisiteData({...editVisiteData,montant:e.target.value})} className={inputCls} placeholder="45 TND" /></div>
                <div>
                  <label className={labelCls} style={labelStyle}>Paiement</label>
                  <select value={editVisiteData.statut_paiement} onChange={(e) => setEditVisiteData({...editVisiteData,statut_paiement:e.target.value})} className={inputCls}>
                    <option value="paye">Payé</option><option value="en_attente">En attente</option><option value="impaye">Impayé</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Statut de la visite</label>
                <select value={editVisiteData.statut} onChange={(e) => setEditVisiteData({...editVisiteData,statut:e.target.value})} className={inputCls}>
                  <option value="planifié">Planifié</option><option value="terminé">Terminé</option><option value="annulé">Annulé</option>
                </select>
              </div>
              <div><label className={labelCls} style={labelStyle}>Notes</label><textarea value={editVisiteData.notes||""} onChange={(e) => setEditVisiteData({...editVisiteData,notes:e.target.value})} rows="2" className={inputCls} /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowEditVisiteModal(false); setPendingTemplatePDF(null); }} className="px-5 py-2.5 rounded-xl text-sm font-600 hover:bg-gray-100 transition-all" style={{ border: "1.5px solid #E2E8F0", color: "#64748B", fontWeight: 600 }}>Annuler</button>
                <button type="submit" disabled={isSubmitting} className="btn-amber text-white px-6 py-2.5 rounded-xl text-sm font-600 flex items-center gap-2 disabled:opacity-50" style={{ fontWeight: 600 }}>
                  {isSubmitting ? <FaSpinner className="animate-spin" size={13} /> : <><FaSave size={12} /> Mettre à jour</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <TemplateEditorModal
        isOpen={showTemplateEditor}
        onClose={() => setShowTemplateEditor(false)}
        onSave={handleTemplatePDFGenerated}
        initialTemplateData={null}
        initialTemplateName=""
      />
    </div>
  );
}

export default Patients;