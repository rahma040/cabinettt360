import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes, FaCheck, FaBan } from "react-icons/fa";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const NotificationModal = ({ isOpen, onClose, onActionComplete }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPendingRequests();
    }
  }, [isOpen]);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get("/appointments/pending-requests");
      setNotifications(response.data);
    } catch (err) {
      console.error("Error fetching pending requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (appointmentId) => {
    setActionLoading(appointmentId);
    try {
      await api.post(`/appointments/${appointmentId}/accept-request`);
      setNotifications(notifications.filter((n) => n.id !== appointmentId));
      onActionComplete?.();
    } catch (err) {
      console.error("Error accepting request:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeny = async (appointmentId) => {
    setActionLoading(appointmentId);
    try {
      await api.post(`/appointments/${appointmentId}/deny-request`);
      setNotifications(notifications.filter((n) => n.id !== appointmentId));
      onActionComplete?.();
    } catch (err) {
      console.error("Error denying request:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-96 flex flex-col" style={{ background: "var(--surface)" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-1)" }}>
            Demandes de rendez-vous
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            style={{ background: "rgba(255,255,255,.05)" }}
          >
            <FaTimes size={16} style={{ color: "var(--text-2)" }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center" style={{ color: "var(--text-2)" }}>
              Chargement...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center" style={{ color: "var(--text-2)" }}>
              Aucune demande en attente
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 rounded-xl border"
                  style={{ background: "rgba(255,255,255,.02)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: "var(--text-1)" }}>
                        {notification.patient?.prenom} {notification.patient?.nom}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-2)" }}>
                        {formatDate(notification.appointment_date)} à {notification.start_time}
                      </p>
                    </div>
                  </div>

                  {notification.notes && (
                    <p className="text-xs mb-3 p-2 rounded bg-gray-50" style={{ background: "rgba(255,255,255,.05)", color: "var(--text-2)" }}>
                      {notification.notes}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(notification.id)}
                      disabled={actionLoading === notification.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
                    >
                      <FaCheck size={12} /> Accepter
                    </button>
                    <button
                      onClick={() => handleDeny(notification.id)}
                      disabled={actionLoading === notification.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}
                    >
                      <FaBan size={12} /> Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t text-center" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={onClose}
            className="text-sm font-medium py-2 px-4 rounded-lg transition-colors"
            style={{ color: "var(--text-1)", background: "rgba(255,255,255,.05)" }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
