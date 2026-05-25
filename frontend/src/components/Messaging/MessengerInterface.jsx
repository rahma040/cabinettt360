import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome, FaUserInjured, FaCalendarCheck, FaFileMedical, FaCog, FaSignOutAlt,
  FaUserPlus, FaUserClock, FaChartLine, FaTasks, FaStethoscope, FaBars, FaTimes,
  FaSync, FaExclamationCircle, FaEnvelope, FaPaperclip, FaCheckCircle, FaSpinner,
  FaFilePdf, FaDownload, FaEye, FaPaperPlane, FaRobot, FaSmile, FaPhone, FaInfoCircle,
  FaEllipsisV, FaSearch, FaArrowLeft,
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

const FontInjector = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);
  return null;
};

const G = `
  * { font-family: 'Sora', sans-serif; box-sizing: border-box; }
  :root {
    --navy: #060D1F; --navy-mid: #0C1A3A; --navy-light: #122048;
    --accent: #3B7EF8; --teal: #0ECDB5; --amber: #F59E0B; --rose: #F43F5E;
    --emerald: #10B981; --violet: #8B5CF6; --surface: #EEF2FF;
    --text-1: #0A0F1E; --text-2: #5B6B8A; --border: rgba(59,126,248,0.13);
  }
  .db-sidebar { background: linear-gradient(180deg,var(--navy) 0%,var(--navy-mid) 60%,var(--navy-light) 100%); }
  .db-logo-ring { background: linear-gradient(135deg,var(--accent),#2563EB); }
  .db-nav-link { transition:all .2s ease; border-left:3px solid transparent; color:rgba(255,255,255,.48); font-size:14px; }
  .db-nav-link:hover { background:rgba(59,126,248,.14); border-left-color:var(--accent); color:#fff; }
  .db-nav-link.active { background:rgba(59,126,248,.22); border-left-color:var(--accent); color:#fff; }
  .db-toggle { background:linear-gradient(135deg,var(--accent),#2563EB); box-shadow:0 4px 14px rgba(59,126,248,.4); }

  .messenger-container { display: flex; height: calc(100vh - 64px); background: #fff; }
  .messenger-sidebar { width: 360px; border-right: 1px solid #E5E7EB; display: flex; flex-direction: column; background: #fff; }
  .messenger-header { padding: 16px; border-bottom: 1px solid #E5E7EB; }
  .messenger-header-title { font-size: 32px; font-weight: 800; color: var(--text-1); margin: 0; }
  .messenger-search-box { margin-top: 12px; position: relative; }
  .messenger-search-box input {
    width: 100%; padding: 10px 16px 10px 40px; border: 1px solid #E5E7EB;
    border-radius: 20px; font-size: 14px; outline: none; background: #F0F2F5;
    transition: all .2s ease;
  }
  .messenger-search-box input:focus { border-color: var(--accent); background: #fff; }
  .messenger-search-box svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #B0B9C1; }

  .conversation-list { flex: 1; overflow-y: auto; }
  .conversation-item {
    padding: 8px 8px; margin: 0 8px; border-radius: 12px; cursor: pointer;
    transition: all .2s ease; display: flex; align-items: center; gap: 10px;
  }
  .conversation-item:hover { background: #F0F2F5; }
  .conversation-item.active { background: #E7F3FF; }
  .conversation-avatar {
    width: 56px; height: 56px; border-radius: 50%; display: flex;
    align-items: center; justify-content: center; flex-shrink: 0;
    font-weight: 700; color: #fff; font-size: 20px;
  }
  .conversation-info { flex: 1; min-width: 0; }
  .conversation-name { font-size: 15px; font-weight: 500; color: var(--text-1); }
  .conversation-preview { font-size: 13px; color: #65676B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .conversation-time { font-size: 12px; color: #B0B9C1; flex-shrink: 0; }

  .messenger-chat { flex: 1; display: flex; flex-direction: column; background: #fff; }
  .chat-header {
    padding: 12px 20px; border-bottom: 1px solid #E5E7EB;
    display: flex; align-items: center; justify-content: space-between;
  }
  .chat-header-title { font-size: 15px; font-weight: 600; color: var(--text-1); }
  .chat-header-subtitle { font-size: 12px; color: #65676B; }
  .chat-actions { display: flex; gap: 8px; }
  .chat-action-btn {
    width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer;
    background: #F0F2F5; color: #0A66C2; display: flex; align-items: center;
    justify-content: center; transition: all .2s ease; font-size: 16px;
  }
  .chat-action-btn:hover { background: #E4E6EB; }

  .messages-container {
    flex: 1; overflow-y: auto; padding: 20px; display: flex;
    flex-direction: column; gap: 12px;
  }
  .message-group { display: flex; flex-direction: column; gap: 4px; }
  .message-group.own { align-items: flex-end; }
  .message-bubble {
    max-width: 55%; padding: 8px 12px; border-radius: 18px; word-wrap: break-word;
    font-size: 15px; line-height: 1.4; animation: slideIn .2s ease;
  }
  @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .message-bubble.sent {
    background: linear-gradient(135deg, var(--accent), #2563EB); color: #fff;
  }
  .message-bubble.received { background: #E4E6EB; color: var(--text-1); }
  .message-time { font-size: 12px; color: #B0B9C1; padding: 0 12px; }

  .input-area {
    padding: 12px 20px; border-top: 1px solid #E5E7EB;
    background: #fff;
  }
  .input-wrapper {
    display: flex; gap: 8px; align-items: flex-end;
  }
  .input-field {
    flex: 1; display: flex; align-items: center; gap: 8px;
    background: #F0F2F5; border-radius: 20px; padding: 10px 16px;
    border: 1px solid transparent; transition: all .2s ease;
  }
  .input-field:focus-within { border-color: var(--accent); }
  .input-field textarea {
    flex: 1; border: none; outline: none; background: transparent;
    font-size: 15px; resize: none; max-height: 100px;
    font-family: 'Sora', sans-serif; color: var(--text-1);
  }
  .input-field textarea::placeholder { color: #B0B9C1; }
  .input-icon-btn {
    background: none; border: none; cursor: pointer; color: #0A66C2;
    font-size: 18px; display: flex; align-items: center; justify-content: center;
    transition: all .2s ease; padding: 0;
  }
  .input-icon-btn:hover { transform: scale(1.15); }
  .send-btn {
    width: 36px; height: 36px; border-radius: 50%; border: none;
    background: linear-gradient(135deg, var(--accent), #2563EB); color: #fff;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all .2s ease; font-size: 16px;
  }
  .send-btn:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(59,126,248,.3); }
  .send-btn:disabled { opacity: .5; cursor: not-allowed; }

  .empty-state {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; color: #B0B9C1;
  }
  .empty-state-icon { font-size: 64px; margin-bottom: 16px; opacity: .5; }
  .empty-state-text { font-size: 15px; text-align: center; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #CED0D4; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #B0B9C1; }
`;

const formatTime = (date) => {
  const d = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (msgDate.getTime() === today.getTime()) {
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } else if ((today - msgDate) / (1000 * 60 * 60 * 24) === 1) {
    return "Hier";
  } else if ((today - msgDate) / (1000 * 60 * 60 * 24) < 7) {
    return d.toLocaleDateString("fr-FR", { weekday: "short" });
  }
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
};

const formatTimeDetail = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

function MessengerInterface({ navItems, isDoctor, userRoleLabel, roleInitial, spaceLabel, user, embedded = false, showSidebar = true }) {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeFetchRef = useRef(null);

  // Guard against null user
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "linear-gradient(135deg,#060D1F,#0C1A3A)" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "linear-gradient(135deg,#3B7EF8,#2563EB)" }}>
            <FaStethoscope className="text-white text-2xl" />
          </div>
          <span className="text-sm" style={{ color: "#94A3B8" }}>Chargement...</span>
        </div>
      </div>
    );
  }

  useEffect(() => {
    console.log("MessengerInterface mounted, fetching contacts...");
    fetchContacts();
    // Fetch messages when a contact is selected
    if (selectedContact) {
      fetchMessages(selectedContact.id);
    }
  }, [selectedContact]);

  // Separate effect for periodic refresh (much less frequent to avoid loading loop)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Periodic refresh of contacts...");
      fetchContacts();
      if (selectedContact) {
        fetchMessages(selectedContact.id);
      }
    }, 15000); // Refresh every 15 seconds instead of 3
    return () => clearInterval(interval);
  }, [selectedContact]);

  const fetchContacts = async () => {
    try {
      console.log("Fetching contacts...");
      const res = await api.get("/communications/contacts");
      const items = Array.isArray(res.data) ? res.data : [];
      console.log("Contacts fetched:", items.length);
      setContacts(items);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    }
  };

  const fetchMessages = async (contactId) => {
    // Guard overlapping/abandoned fetches using an active fetch id
    activeFetchRef.current = contactId;
    setLoading(true);
    const timeoutId = setTimeout(() => {
      if (activeFetchRef.current === contactId) {
        console.warn("fetchMessages timeout for contact:", contactId);
        setLoading(false);
      }
    }, 10000);

    try {
      console.log("Fetching messages for contact:", contactId);
      const res = await api.get("/communications");
      const allMsgs = Array.isArray(res.data) ? res.data : [];
      console.log("Total messages fetched:", allMsgs.length);

      // If another fetch was started meanwhile, ignore this response
      if (activeFetchRef.current !== contactId) {
        console.log("Ignoring stale fetch response for contact:", contactId);
        return;
      }

      const filtered = allMsgs.filter(
        (m) =>
          (m.sender_id === contactId || m.other_party_id === contactId) ||
          (m.other_party_email && typeof m.other_party_email === "string" && m.other_party_email.includes(String(contactId)))
      );
      console.log("Filtered messages for contact:", filtered.length);

      const sorted = filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setMessages(sorted);

      setTimeout(() => {
        try {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        } catch (e) {
          console.warn("scrollIntoView failed:", e);
        }
      }, 100);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      clearTimeout(timeoutId);
      if (activeFetchRef.current === contactId) {
        setLoading(false);
      }
    }
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setSidebarOpen(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedContact || (!newMessage.trim() && !filePreview)) return;

    setSubmitting(true);
    try {
      if (filePreview) {
        const formData = new FormData();
        formData.append("recipient_id", selectedContact.id);
        formData.append("message", newMessage || "[Document]");
        formData.append("files", filePreview.file);
        
        await api.post("/communications", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await api.post("/communications", {
          recipient_id: selectedContact.id,
          message: newMessage,
        });
      }

      setNewMessage("");
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchMessages(selectedContact.id);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview({
          file,
          preview: event.target?.result,
          name: file.name,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFilePreview = () => {
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const conversationList = useMemo(() => {
    const convoMap = {};

    // First, map all contacts with their messages
    contacts.forEach((contact) => {
      convoMap[contact.id] = {
        contact,
        messages: [],
        lastMessage: null,
        messageCount: 0,
      };
    });

    // Then, populate messages for each contact
    messages.forEach((msg) => {
      const contactId = msg.sender_id === user?.id ? msg.other_party_id : msg.sender_id;
      if (convoMap[contactId]) {
        convoMap[contactId].messages.push(msg);
        convoMap[contactId].lastMessage = msg;
        convoMap[contactId].messageCount += 1;
      }
    });

    // Convert to array and sort
    return Object.values(convoMap).sort((a, b) => {
      // If both have messages, sort by last message date
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at);
      }
      // Messages appear first, then contacts without messages (alphabetically)
      if (a.lastMessage && !b.lastMessage) return -1;
      if (!a.lastMessage && b.lastMessage) return 1;
      return (a.contact?.name || "").localeCompare(b.contact?.name || "");
    });
  }, [messages, contacts, user?.id]);

  const filteredConversations = useMemo(() => {
    return conversationList.filter(
      (convo) =>
        (convo.contact?.name && convo.contact.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (convo.contact?.email && convo.contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [conversationList, searchTerm]);

  const messagesToDisplay = selectedContact
    ? messages.filter(
        (m) =>
          (m.sender_id === selectedContact.id || m.other_party_id === selectedContact.id) ||
          (m.other_party_email === selectedContact.email)
      )
    : [];

  return (
    <div className={embedded ? "flex h-full min-h-0 overflow-hidden" : "flex h-screen overflow-hidden"} style={{ background: "var(--surface)" }}>
      <style>{G}</style>
      <FontInjector />

      {showSidebar && (
        <>
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
            style={{ background: "linear-gradient(180deg,var(--navy) 0%,var(--navy-mid) 60%,var(--navy-light) 100%)" }}
          >
            <div className="px-6 pt-8 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center db-logo-ring flex-shrink-0">
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
                <a
                  key={item.to}
                  href={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`db-nav-link flex items-center gap-3 px-4 py-3 rounded-xl ${item.active ? "active" : ""}`}
                  style={{ fontWeight: item.active ? 600 : 500, cursor: "pointer", textDecoration: "none" }}
                >
                  <span style={{ opacity: item.active ? 1 : 0.65 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>

            <div className="p-4 m-3 rounded-2xl" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0 db-logo-ring" style={{ fontWeight: 700 }}>
                  {user?.name?.charAt(0) || roleInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate" style={{ fontWeight: 600 }}>
                    {isDoctor ? `Dr. ${user?.name}` : user?.name}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>{userRoleLabel}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  localStorage.removeItem("userIntegrityHash");
                  navigate("/login");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all hover:bg-red-500/20"
                style={{ color: "rgba(255,255,255,.5)", fontWeight: 500, border: "none", background: "transparent", cursor: "pointer" }}
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
        </>
      )}

      <main style={{ flex: 1, display: "flex", overflow: "hidden", background: "#fff" }}>
        <div className="messenger-container" style={{ width: "100%", display: "flex", flexDirection: "column", height: "100%" }}>
          <div className="messenger-sidebar" style={{ display: selectedContact && window.innerWidth < 1024 ? "none" : "flex", width: "360px", borderRight: "1px solid #E5E7EB", flexDirection: "column", background: "#fff" }}>
            <div className="messenger-header">
              <h2 className="messenger-header-title">Messages</h2>
              <div className="messenger-search-box">
                <FaSearch size={14} />
                <input
                  type="text"
                  placeholder="Rechercher une conversation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="conversation-list">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center" style={{ color: "#B0B9C1", fontSize: "14px" }}>
                  {conversationList.length === 0 ? "Aucun contact disponible" : "Aucun résultat trouvé"}
                </div>
              ) : (
                filteredConversations.map((convo, idx) => (
                  <div
                    key={idx}
                    className={`conversation-item ${selectedContact?.id === convo.contact?.id ? "active" : ""}`}
                    onClick={() => convo.contact && handleSelectContact(convo.contact)}
                  >
                    <div
                      className="conversation-avatar"
                      style={{
                        background: `linear-gradient(135deg, ${["#3B7EF8", "#10B981", "#F59E0B", "#F43F5E"][idx % 4]}, ${["#2563EB", "#059669", "#D97706", "#DC2626"][idx % 4]})`,
                      }}
                    >
                      {convo.contact?.name?.charAt(0) || "U"}
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-name">{convo.contact?.name}</div>
                      <div className="conversation-preview" style={{ color: convo.lastMessage ? "#65676B" : "#B0B9C1", fontStyle: convo.lastMessage ? "normal" : "italic" }}>
                        {convo.lastMessage ? (
                          <>
                            {convo.lastMessage.sender_id === user?.id ? "Vous: " : ""}
                            {convo.lastMessage.message.substring(0, 40)}
                            {convo.lastMessage.message.length > 40 ? "..." : ""}
                          </>
                        ) : (
                          "Commencer une conversation"
                        )}
                      </div>
                    </div>
                    <div className="conversation-time">{convo.lastMessage ? formatTime(convo.lastMessage.created_at) : ""}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedContact ? (
            <div className="messenger-chat" style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff" }}>
              <div className="chat-header">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                  {window.innerWidth < 1024 && (
                    <button
                      onClick={() => setSelectedContact(null)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#0A66C2", fontSize: "20px" }}
                    >
                      <FaArrowLeft />
                    </button>
                  )}
                  <div>
                    <div className="chat-header-title">{selectedContact.name}</div>
                    <div className="chat-header-subtitle">{selectedContact.email}</div>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="chat-action-btn" title="Appel">
                    <FaPhone size={16} />
                  </button>
                  <button className="chat-action-btn" title="Info">
                    <FaInfoCircle size={16} />
                  </button>
                </div>
              </div>

              <div className="messages-container">
                {loading ? (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <FaSpinner className="animate-spin" size={24} style={{ color: "var(--accent)" }} />
                  </div>
                ) : messagesToDisplay.length === 0 ? (
                  <div className="empty-state">
                    <FaEnvelope className="empty-state-icon" />
                    <div className="empty-state-text">Aucun message yet</div>
                    <div className="empty-state-text" style={{ fontSize: "13px", opacity: ".7", marginTop: "8px" }}>
                      Commencez une conversation
                    </div>
                  </div>
                ) : (
                  messagesToDisplay.map((msg, idx) => {
                    const isSent = msg.sender_id === user?.id;
                    const prevMsg = messagesToDisplay[idx - 1];
                    const sameAsPrev = prevMsg && prevMsg.sender_id === msg.sender_id;
                    const timeDiff =
                      prevMsg &&
                      (new Date(msg.created_at) - new Date(prevMsg.created_at)) / (1000 * 60) < 5;

                    return (
                      <div key={msg.id} className={`message-group ${isSent ? "own" : ""}`}>
                        <div className={`message-bubble ${isSent ? "sent" : "received"}`}>{msg.message}</div>
                        {(!sameAsPrev || !timeDiff || idx === messagesToDisplay.length - 1) && (
                          <div className="message-time">{formatTimeDetail(msg.created_at)}</div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="input-area">
                                {filePreview && (
                                  <div style={{ padding: "8px 12px", background: "#F0F2F5", borderRadius: "8px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
                                      {filePreview.type.startsWith("image/") ? (
                                        <img src={filePreview.preview} alt="preview" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }} />
                                      ) : (
                                        <div style={{ width: "40px", height: "40px", background: "#E5E7EB", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                          <FaFilePdf size={20} style={{ color: "#F43F5E" }} />
                                        </div>
                                      )}
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: "12px", fontWeight: "500", color: "#0A0F1E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{filePreview.name}</div>
                                        <div style={{ fontSize: "11px", color: "#65676B" }}>{(filePreview.file.size / 1024).toFixed(2)} KB</div>
                                      </div>
                                    </div>
                                    <button onClick={removeFilePreview} type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "#65676B", fontSize: "16px" }}>✕</button>
                                  </div>
                                )}
                <div className="input-wrapper">
                  <div className="input-field">
                    <button
                      type="button"
                      className="input-icon-btn"
                      title="Pièce jointe"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FaPaperclip size={18} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                    />
                    <textarea
                      rows="1"
                      placeholder="Aa"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      style={{ resize: "none" }}
                    />
                    <button
                      type="button"
                      className="input-icon-btn"
                      title="Emoji"
                    >
                      <FaSmile size={18} />
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="send-btn"
                    disabled={submitting || (!newMessage.trim() && !filePreview)}
                    title="Envoyer"
                  >
                    {submitting ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaPaperPlane />
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="empty-state">
                <FaEnvelope className="empty-state-icon" />
                <div className="empty-state-text">Sélectionnez une conversation</div>
                <div className="empty-state-text" style={{ fontSize: "13px", opacity: ".7", marginTop: "8px" }}>
                  Choisissez un contact dans la liste
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MessengerInterface;
