import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FaRobot,
  FaPaperPlane,
  FaSpinner,
  FaRegLightbulb,
  FaUserInjured,
  FaCalendarCheck,
  FaFileMedical,
  FaExclamationTriangle,
  FaShieldAlt,
  FaRedoAlt,
} from "react-icons/fa";

const API_BASE = "http://127.0.0.1:8000/api";

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
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

const QUICK_PROMPTS = [
  "Résume les demandes de rendez-vous en attente.",
  "Quels patients n'ont pas eu de visite récente ?",
  "Prépare un aperçu du patient que je vais rechercher.",
  "Donne-moi les prochains rendez-vous acceptés.",
];

const ChatBubble = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`assistant-bubble ${isUser ? "user" : "assistant"}`}>
      <div className="assistant-bubble-meta">
        <span className="assistant-bubble-role">{isUser ? "Médecin" : "Assistant IA"}</span>
        {!isUser && <FaRobot size={11} />}
      </div>
      <div className="assistant-bubble-content">{message.content}</div>
    </div>
  );
};

const StatCard = ({ icon, label, value, tone = "blue" }) => (
  <div className={`assistant-stat ${tone}`}>
    <div className="assistant-stat-icon">{icon}</div>
    <div>
      <div className="assistant-stat-label">{label}</div>
      <div className="assistant-stat-value">{value}</div>
    </div>
  </div>
);

const DoctorAssistantChat = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Je suis votre assistant clinique et administratif. Posez-moi une question sur les patients, les rendez-vous, les visites ou les documents du cabinet.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [context, setContext] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (content) => {
    const trimmed = content.trim();
    if (!trimmed || loading) {
      return;
    }

    const userMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/doctor/assistant/chat", {
        message: trimmed,
        history: nextMessages.slice(-8).map(({ role, content: text }) => ({ role, content: text })),
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.data.answer,
        },
      ]);
      setContext(response.data.context || null);
    } catch (err) {
      const message = err.response?.data?.error || "Impossible de contacter l'assistant pour le moment.";
      setError(message);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const stats = context?.summary?.stats || {};
  const patients = context?.patients || [];
  const appointments = context?.appointments || {};
  const documents = context?.documents || [];
  const visits = context?.visits || [];
  const suggestions = context?.suggestions || QUICK_PROMPTS;

  return (
    <div className="assistant-shell">
      <style>{`
        .assistant-shell {
          display: grid;
          grid-template-columns: minmax(0, 1.7fr) minmax(300px, 1fr);
          gap: 18px;
          height: 100%;
          min-height: calc(100vh - 140px);
        }
        .assistant-panel,
        .assistant-side {
          background: #ffffff;
          border: 1.5px solid #E0E8FF;
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(59,126,248,0.08);
          overflow: hidden;
        }
        .assistant-panel {
          display: flex;
          flex-direction: column;
        }
        .assistant-header {
          padding: 20px 22px;
          border-bottom: 1.5px solid #E8EEFF;
          background: linear-gradient(135deg, #F8FAFF, #EEF4FF);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }
        .assistant-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .assistant-title-badge {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: linear-gradient(135deg, #3B7EF8, #2563EB);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 6px 18px rgba(59,126,248,0.32);
        }
        .assistant-title h3 {
          font-size: 1rem;
          font-weight: 800;
          color: #0A0F1E;
          margin: 0;
        }
        .assistant-title p {
          margin: 3px 0 0;
          color: #5B6B8A;
          font-size: 12px;
          line-height: 1.5;
        }
        .assistant-privacy {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          background: #fff;
          border: 1.5px solid #C7D2FE;
          color: #1D4ED8;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }
        .assistant-body {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          flex: 1;
          min-height: 0;
        }
        .assistant-messages {
          padding: 18px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: linear-gradient(180deg, #FFFFFF, #FAFCFF);
        }
        .assistant-bubble {
          max-width: 92%;
          border-radius: 18px;
          padding: 14px 15px;
          border: 1.5px solid transparent;
          box-shadow: 0 6px 18px rgba(15,23,42,0.04);
        }
        .assistant-bubble.user {
          align-self: flex-end;
          background: linear-gradient(135deg, #3B7EF8, #2563EB);
          color: #fff;
        }
        .assistant-bubble.assistant {
          align-self: flex-start;
          background: #fff;
          border-color: #E0E8FF;
        }
        .assistant-bubble-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 800;
          opacity: 0.8;
        }
        .assistant-bubble-role {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .assistant-bubble-content {
          white-space: pre-wrap;
          line-height: 1.7;
          font-size: 14px;
        }
        .assistant-typing {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #5B6B8A;
          font-size: 13px;
          font-weight: 600;
        }
        .assistant-composer {
          border-top: 1.5px solid #E8EEFF;
          background: #fff;
          padding: 16px 18px 18px;
        }
        .assistant-quick-prompts {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }
        .assistant-pill {
          border: 1.5px solid #D6E3FF;
          background: #F8FAFF;
          color: #1D4ED8;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: transform .18s ease, border-color .18s ease, background .18s ease;
        }
        .assistant-pill:hover {
          transform: translateY(-1px);
          border-color: #3B7EF8;
          background: #EEF4FF;
        }
        .assistant-form {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }
        .assistant-input-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .assistant-input {
          width: 100%;
          min-height: 110px;
          resize: vertical;
          border: 1.5px solid #DCE6FF;
          border-radius: 16px;
          padding: 14px 15px;
          font-size: 14px;
          color: #0A0F1E;
          outline: none;
          background: #FAFCFF;
          transition: border-color .2s ease, box-shadow .2s ease;
          line-height: 1.6;
        }
        .assistant-input:focus {
          border-color: #3B7EF8;
          box-shadow: 0 0 0 4px rgba(59,126,248,0.10);
          background: #fff;
        }
        .assistant-send {
          border: none;
          border-radius: 16px;
          padding: 14px 18px;
          background: linear-gradient(135deg, #3B7EF8, #2563EB);
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          box-shadow: 0 8px 18px rgba(59,126,248,0.25);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          min-width: 132px;
          justify-content: center;
        }
        .assistant-send:disabled {
          cursor: not-allowed;
          opacity: 0.7;
          box-shadow: none;
        }
        .assistant-error {
          margin-top: 10px;
          padding: 11px 12px;
          border-radius: 14px;
          border: 1.5px solid #FECACA;
          background: #FFF1F2;
          color: #9F1239;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 0.8s linear infinite;
        }
        .assistant-side {
          display: flex;
          flex-direction: column;
          padding: 18px;
          gap: 14px;
          overflow-y: auto;
        }
        .assistant-card {
          border: 1.5px solid #E0E8FF;
          border-radius: 18px;
          background: #fff;
          overflow: hidden;
        }
        .assistant-card-head {
          padding: 14px 14px 12px;
          border-bottom: 1px solid #EEF1FF;
          font-size: 12px;
          font-weight: 800;
          color: #0A0F1E;
          display: flex;
          align-items: center;
          gap: 8px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .assistant-card-body {
          padding: 14px;
        }
        .assistant-stats-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        .assistant-stat {
          border-radius: 16px;
          padding: 12px 13px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1.5px solid transparent;
        }
        .assistant-stat.blue { background: linear-gradient(135deg, #EEF4FF, #E0E7FF); border-color: #BFDBFE; }
        .assistant-stat.green { background: linear-gradient(135deg, #ECFDF5, #D1FAE5); border-color: #A7F3D0; }
        .assistant-stat.amber { background: linear-gradient(135deg, #FFFBEB, #FEF3C7); border-color: #FCD34D; }
        .assistant-stat.rose { background: linear-gradient(135deg, #FFF1F2, #FFE4E6); border-color: #FECDD3; }
        .assistant-stat-icon {
          width: 38px;
          height: 38px;
          border-radius: 13px;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2563EB;
          flex-shrink: 0;
        }
        .assistant-stat-label {
          font-size: 10.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #5B6B8A;
          margin-bottom: 2px;
        }
        .assistant-stat-value {
          font-size: 18px;
          font-weight: 900;
          color: #0A0F1E;
          letter-spacing: -0.03em;
        }
        .assistant-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .assistant-list-item {
          padding: 11px 12px;
          border-radius: 14px;
          border: 1px solid #EEF1FF;
          background: #FAFCFF;
        }
        .assistant-list-title {
          font-size: 13px;
          font-weight: 800;
          color: #0A0F1E;
          margin-bottom: 2px;
        }
        .assistant-list-subtitle {
          font-size: 11.5px;
          color: #5B6B8A;
          line-height: 1.5;
        }
        .assistant-empty-state {
          border: 1.5px dashed #C7D2FE;
          border-radius: 16px;
          background: #F8FAFF;
          padding: 16px;
          color: #5B6B8A;
          font-size: 13px;
          line-height: 1.6;
        }
        .assistant-reference-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .assistant-reference {
          border-radius: 14px;
          border: 1px solid #EEF1FF;
          background: #fff;
          padding: 11px 12px;
          font-size: 12px;
          color: #0A0F1E;
          line-height: 1.5;
        }
        .assistant-reference strong {
          display: block;
          margin-bottom: 2px;
          color: #1D4ED8;
        }
        @media (max-width: 1024px) {
          .assistant-shell {
            grid-template-columns: 1fr;
            min-height: auto;
          }
        }
        @media (max-width: 640px) {
          .assistant-header,
          .assistant-messages,
          .assistant-composer,
          .assistant-side {
            padding-left: 14px;
            padding-right: 14px;
          }
          .assistant-form {
            flex-direction: column;
          }
          .assistant-send {
            width: 100%;
          }
          .assistant-bubble {
            max-width: 100%;
          }
        }
      `}</style>

      <section className="assistant-panel">
        <div className="assistant-header">
          <div className="assistant-title">
            <div className="assistant-title-badge">
              <FaRobot size={18} />
            </div>
            <div>
              <h3>Assistant médical du médecin</h3>
              <p>
                CAG sécurisé sur les patients, visites, documents et rendez-vous du cabinet.
              </p>
            </div>
          </div>
          <div className="assistant-privacy">
            <FaShieldAlt size={11} /> Accès médecin uniquement
          </div>
        </div>

        <div className="assistant-body">
          <div className="assistant-messages">
            {messages.map((message, index) => (
              <ChatBubble key={`${message.role}-${index}`} message={message} />
            ))}
            {loading && (
              <div className="assistant-typing">
                <FaSpinner className="animate-spin" size={14} />
                L'assistant analyse les données du dossier...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="assistant-composer">
            <div className="assistant-quick-prompts">
              {suggestions.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="assistant-pill"
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                >
                  <FaRegLightbulb size={10} style={{ marginRight: 6 }} />
                  {prompt}
                </button>
              ))}
            </div>

            <form className="assistant-form" onSubmit={handleSubmit}>
              <div className="assistant-input-wrap">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Posez une question au sujet d'un patient, d'un rendez-vous ou d'un dossier..."
                  className="assistant-input"
                />
              </div>
              <button type="submit" className="assistant-send" disabled={loading || !input.trim()}>
                {loading ? <FaSpinner className="animate-spin" size={13} /> : <FaPaperPlane size={13} />}
                {loading ? "Analyse..." : "Envoyer"}
              </button>
            </form>

            {error && (
              <div className="assistant-error">
                <FaExclamationTriangle size={13} /> {error}
              </div>
            )}
          </div>
        </div>
      </section>

      <aside className="assistant-side">
        <div className="assistant-card">
          <div className="assistant-card-head">
            <FaRegLightbulb size={12} /> Résumé du contexte
          </div>
          <div className="assistant-card-body">
            {context ? (
              <div className="assistant-stats-grid">
                <StatCard icon={<FaUserInjured size={14} />} label="Patients" value={stats.patients_count ?? 0} tone="blue" />
                <StatCard icon={<FaCalendarCheck size={14} />} label="Demandes en attente" value={stats.pending_requests_count ?? 0} tone="amber" />
                <StatCard icon={<FaCalendarCheck size={14} />} label="Rendez-vous à venir" value={stats.upcoming_appointments_count ?? 0} tone="green" />
                <StatCard icon={<FaFileMedical size={14} />} label="Visites" value={stats.recent_visits_count ?? 0} tone="rose" />
              </div>
            ) : (
              <div className="assistant-empty-state">
                Lancez une question pour afficher un résumé contextuel des patients, rendez-vous, visites et documents associés.
              </div>
            )}
          </div>
        </div>

        <div className="assistant-card">
          <div className="assistant-card-head">
            <FaUserInjured size={12} /> Patients trouvés
          </div>
          <div className="assistant-card-body">
            {patients.length > 0 ? (
              <div className="assistant-list">
                {patients.map((patient) => (
                  <div className="assistant-list-item" key={patient.id}>
                    <div className="assistant-list-title">{patient.name}</div>
                    <div className="assistant-list-subtitle">
                      {patient.email || "Email indisponible"}
                      <br />
                      {patient.telephone || "Téléphone indisponible"}
                      {patient.last_visit_date ? <><br />Dernière visite: {patient.last_visit_date}</> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="assistant-empty-state">Aucun patient ciblé pour la requête actuelle.</div>
            )}
          </div>
        </div>

        <div className="assistant-card">
          <div className="assistant-card-head">
            <FaCalendarCheck size={12} /> Rendez-vous
          </div>
          <div className="assistant-card-body">
            <div className="assistant-reference-grid">
              <div className="assistant-reference">
                <strong>Demandes en attente</strong>
                {appointments.pending?.length ? `${appointments.pending.length} demande(s) en attente.` : "Aucune demande en attente dans le contexte courant."}
              </div>
              <div className="assistant-reference">
                <strong>Prochains rendez-vous</strong>
                {appointments.upcoming?.length ? `${appointments.upcoming.length} rendez-vous à venir remontés.` : "Aucun rendez-vous à venir dans le contexte courant."}
              </div>
              <div className="assistant-reference">
                <strong>Rendez-vous passés</strong>
                {appointments.past?.length ? `${appointments.past.length} rendez-vous passés chargés.` : "Aucun rendez-vous passé remonté."}
              </div>
            </div>
          </div>
        </div>

        <div className="assistant-card">
          <div className="assistant-card-head">
            <FaFileMedical size={12} /> Dernières visites et documents
          </div>
          <div className="assistant-card-body">
            <div className="assistant-reference-grid">
              <div className="assistant-reference">
                <strong>Visites récentes</strong>
                {visits.length ? `${visits.length} visite(s) récente(s) indexée(s).` : "Aucune visite récente dans le contexte courant."}
              </div>
              <div className="assistant-reference">
                <strong>Documents récents</strong>
                {documents.length ? `${documents.length} document(s) médical(aux) indexé(s).` : "Aucun document récent dans le contexte courant."}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default DoctorAssistantChat;
