import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus, FiFile } from "react-icons/fi";
import { FaSpinner, FaUserMd } from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "medecin",
  });
  const [licenceFile, setLicenceFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleFileChange = (e) => {
    setLicenceFile(e.target.files[0]);
    setError("");
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Le mot de passe doit comporter au moins 8 caractères");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError("Veuillez saisir une adresse email valide");
      return false;
    }
    if (formData.name.trim().length < 2) {
      setError("Le nom doit comporter au moins 2 caractères");
      return false;
    }
    if (!licenceFile) {
      setError("Veuillez télécharger votre licence médicale (PDF ou image)");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("role", "medecin");
    if (licenceFile) {
      data.append("licence_document", licenceFile);
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/waiting-verification");
    } catch (err) {
      if (err.response) {
        if (err.response.data.errors) {
          const errors = Object.values(err.response.data.errors).flat();
          setError(errors.join(", "));
        } else {
          setError(err.response.data.error || err.response.data.message || "Échec de l'inscription");
        }
      } else {
        setError("Erreur réseau. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 12 + 8}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md animate-fadeInUp">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex justify-center mb-8 animate-scaleIn">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FiUserPlus className="text-white text-3xl" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-white mb-2 animate-fadeIn">
            Inscription Médecin
          </h2>
          <p className="text-gray-300 text-center mb-8 animate-fadeIn animation-delay-100">
            Créez votre compte professionnel
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-slideInLeft">
              <label className="block text-sm font-medium text-gray-200 mb-2">Nom complet</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Dr. Jean Dupont"
                  required
                />
              </div>
            </div>

            <div className="animate-slideInLeft animation-delay-100">
              <label className="block text-sm font-medium text-gray-200 mb-2">Adresse email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="medecin@exemple.fr"
                  required
                />
              </div>
            </div>

            <div className="animate-slideInLeft animation-delay-200">
              <label className="block text-sm font-medium text-gray-200 mb-2">Mot de passe</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="animate-slideInLeft animation-delay-300">
              <label className="block text-sm font-medium text-gray-200 mb-2">Confirmer le mot de passe</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="animate-slideInLeft animation-delay-400">
              <label className="block text-sm font-medium text-gray-200 mb-2">Rôle</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserMd className="text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value="Médecin"
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/70 cursor-not-allowed"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FaUserMd className="text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="animate-slideInLeft animation-delay-450">
              <label className="block text-sm font-medium text-gray-200 mb-2">Licence médicale (PDF ou image)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFile className="text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Formats acceptés: PDF, JPG, PNG (max 5 Mo)</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Inscription en cours...
                  </>
                ) : (
                  <>
                    S'inscrire
                    <FiUserPlus className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-shake">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <p className="mt-6 text-center text-gray-400 animate-fadeIn animation-delay-500">
            Vous avez déjà un compte ?{" "}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      <style>{`
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
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-450 { animation-delay: 0.45s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
};

export default Register;