import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiPhone,
  FiMessageSquare,
  FiSend,
  FiX,
  FiUser,
} from "react-icons/fi";
import { FaSpinner, FaPhoneAlt } from "react-icons/fa";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const PasswordReset = () => {
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState("");
  const [contactMethod, setContactMethod] = useState("email");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateForm = () => {
    if (!loginEmail.trim()) {
      setError("Veuillez renseigner votre email de connexion.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(loginEmail)) {
      setError("Email de connexion invalide.");
      return false;
    }
    if (contactMethod === "email" && !contactEmail.trim()) {
      setError("Veuillez renseigner votre email de contact.");
      return false;
    }
    if (contactMethod === "phone" && !contactPhone.trim()) {
      setError("Veuillez renseigner votre numéro de téléphone.");
      return false;
    }
    if (contactMethod === "email" && !/\S+@\S+\.\S+/.test(contactEmail)) {
      setError("Email de contact invalide.");
      return false;
    }
    if (contactMethod === "phone" && !/^[\d\s\+\(\)\-]{8,20}$/.test(contactPhone)) {
      setError("Numéro de téléphone invalide.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/password-reset-request`, {
        login_email: loginEmail,
        contact_method: contactMethod,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        message: note,
      });

      if (response.status === 200 || response.status === 201) {
        setSuccess("Votre demande a été enregistrée. L'administrateur vous contactera sous 24h.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError("Erreur lors de l'envoi. Veuillez réessayer.");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404 && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(
          err.response?.data?.error ||
            "Impossible d'envoyer la demande. Vérifiez votre connexion."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-30px) translateX(20px); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
          .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
          .animate-scaleIn { animation: scaleIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
          .animate-slideInLeft { animation: slideInLeft 0.5s ease-out forwards; opacity: 0; }
          .animate-float { animation: float infinite ease-in-out; }
          .animate-shake { animation: shake 0.3s ease-in-out; }
          .animation-delay-100 { animation-delay: 0.1s; }
          .animation-delay-200 { animation-delay: 0.2s; }
          .animation-delay-300 { animation-delay: 0.3s; }
          .animation-delay-1000 { animation-delay: 1s; }
          .animation-delay-2000 { animation-delay: 2s; }
        `}
      </style>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md animate-fadeInUp">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex justify-center mb-8 animate-scaleIn">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FiLock className="text-white text-3xl" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-white mb-2 animate-fadeIn">
            Mot de passe oublié ?
          </h2>
          <p className="text-gray-300 text-center mb-8 animate-fadeIn animation-delay-100">
            Nous vous aiderons à réinitialiser votre mot de passe.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Login email (required) */}
            <div className="animate-slideInLeft">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email de connexion *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="votrecompte@exemple.fr"
                  required
                />
              </div>
            </div>

            {/* Contact method selector */}
            <div className="animate-slideInLeft animation-delay-100">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Comment souhaitez-vous être contacté ? *
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setContactMethod("email")}
                  className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    contactMethod === "email"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <FiMail size={18} />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setContactMethod("phone")}
                  className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    contactMethod === "phone"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <FiPhone size={18} />
                  Téléphone
                </button>
              </div>
            </div>

            {/* Dynamic contact field */}
            {contactMethod === "email" && (
              <div className="animate-slideInLeft animation-delay-200">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Votre email de contact *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="exemple@domaine.fr"
                  />
                </div>
              </div>
            )}

            {contactMethod === "phone" && (
              <div className="animate-slideInLeft animation-delay-200">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Votre numéro de téléphone *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhoneAlt className="text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
            )}

            {/* Optional note */}
            <div className="animate-slideInLeft animation-delay-300">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Note supplémentaire (optionnelle)
              </label>
              <div className="relative group">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FiMessageSquare className="text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="4"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Décrivez votre problème (optionnel)..."
                />
              </div>
            </div>

            <div className="flex gap-3 animate-fadeIn animation-delay-400">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex-1 py-3 px-4 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2 group"
              >
                <FiX size={18} />
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <FiSend size={18} />
                    Envoyer
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-shake">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg animate-fadeIn">
              <p className="text-green-400 text-sm text-center">{success}</p>
            </div>
          )}

          <p className="mt-6 text-center text-gray-400 animate-fadeIn animation-delay-500">
            Vous vous rappelez de votre mot de passe ?{" "}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;