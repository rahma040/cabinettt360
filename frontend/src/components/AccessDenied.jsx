import React from "react";
import { Link } from "react-router-dom";
import { FiShield, FiAlertTriangle } from "react-icons/fi";

const AccessDenied = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      {/* Animated blurred background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
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

      {/* Main card */}
      <div className="relative w-full max-w-md animate-fadeInUp">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6 animate-scaleIn">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FiShield className="text-white text-4xl" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3 animate-fadeIn">
            Accès refusé
          </h2>

          <div className="space-y-4 animate-fadeIn animation-delay-100">
            <p className="text-gray-300 text-sm leading-relaxed">
              Votre session a expiré ou une tentative de modification non autorisée des données de votre session a été détectée.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              Pour des raisons de sécurité, l'accès à cette page a été bloqué. Veuillez vous reconnecter pour obtenir une nouvelle session valide.
            </p>
          </div>

          {/* Security warning box */}
          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 animate-fadeIn animation-delay-200">
            <div className="flex items-center justify-center gap-2 text-orange-400 text-sm">
              <FiAlertTriangle size={16} />
              <span>Session invalide ou expirée</span>
            </div>
          </div>

          {/* Redirect button to login */}
          <div className="mt-8 animate-fadeIn animation-delay-300">
            <Link
              to="/login"
              className="inline-block w-full py-3 px-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Retour à la connexion
            </Link>
          </div>

          <p className="mt-6 text-gray-400 text-xs animate-fadeIn animation-delay-400">
            Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur.
          </p>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
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
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-30px) translateX(20px); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
        .animate-float { animation: float infinite ease-in-out; }
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
};

export default AccessDenied;