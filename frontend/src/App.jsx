import { Link, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaBars, FaTimes, FaStethoscope, FaSignOutAlt } from "react-icons/fa";

import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import PasswordReset from "./components/PasswordReset";
import WaitingVerification from "./components/WaitingVerification";
import AccessDenied from "./components/AccessDenied";
import PatientDashboard from "./components/Patient/PatientDashboard";
import PatientConsultations from "./components/Patient/PatientConsultations";
import PatientMedicalRecord from "./components/Patient/PatientMedicalRecord";

//Admin
import Admindb from './components/Admin/Admindb'
import AdminUsers from "./components/Admin/AdminUsers";
import AdminPasswordReset from "./components/Admin/AdminPasswordReset";
import AdminCommunications from "./components/Admin/AdminCommunications";
import AdminVerifyDoctors from "./components/Admin/AdminVerifyDoctors";

//Sec
import SecretariatDB from "./components/Secretary/SecDashbaord";
import SecretaryRendezVous from "./components/Secretary/SecretaryRendezVous";
import SecretaryWaitingRoom from "./components/Secretary/SecretaryWaitingRoom";
import SecretaryPayments from "./components/Secretary/SecretaryPayments";
import SecretaryTasks from "./components/Secretary/SecretaryTasks";
import SecretarySettings from "./components/Secretary/SecretarySettings";
import SecretaryPatients from "./components/Secretary/SecretaryPatients";

// Doctor 
import DoctorWaitingRoom from "./components/Doctor/DoctorWaitingRoom";
import PrescriptionTemplates from "./components/Doctor/PrescriptionTemplates";
import DoctorSecretaries from "./components/Doctor/DoctorSecretaries";
import DoctorPatientsAccounts from "./components/Doctor/DoctorPatientsAccounts";
import Patients from './components/Doctor/Patients';
import RendezVous from "./components/Doctor/RendezVous";
import Docdb from "./components/Doctor/DocDashboard";
import DoctorStatistics from "./components/Doctor/DoctorStatistics";
import DoctorTasks from "./components/Doctor/DoctorTasks";
import DoctorTutorial from "./components/Doctor/DoctorTutorial";
import DoctorCommunication from "./components/Doctor/DoctorCommunication";
import DoctorSettings from "./components/Doctor/DoctorSettings";

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init();
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Check authentication status
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  // Run on mount and on every route change (because login redirects)
  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  // Also listen to storage events (for cross-tab synchronization)
  useEffect(() => {
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userIntegrityHash");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const navLinks = isLoggedIn
    ? []
    : [
        { to: "/", label: "Accueil" },
        { to: "/login", label: "Connexion" },
        { to: "/register", label: "Inscription" },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] overflow-x-hidden flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * {
          font-family: 'Sora', sans-serif;
        }
        body {
          margin: 0;
          padding: 0;
        }
        /* Remove any default top margin from page containers */
        #root > div > div:last-child {
          margin-top: 0;
        }
      `}</style>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md transition-all group-hover:scale-105">
                <FaStethoscope className="text-white text-lg" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Cabi Doc
              </span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              {mobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>

            <ul className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      location.pathname === link.to
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {isLoggedIn && (
                <li>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 text-gray-300 hover:bg-white/10 hover:text-white"
                  >
                    <FaSignOutAlt size={14} />
                    Déconnexion
                  </button>
                </li>
              )}
            </ul>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-white/10 animate-fadeInUp">
              <ul className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        location.pathname === link.to
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {isLoggedIn && (
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 text-gray-300 hover:bg-white/10 hover:text-white"
                    >
                      <FaSignOutAlt size={14} />
                      Déconnexion
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Main content - exact offset for fixed navbar (64px) */}
      <div className="flex-1 pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/passreset" element={<PasswordReset />} />
          <Route path="/waiting-verification" element={<WaitingVerification />} />
          <Route path="/accessdenied" element={<AccessDenied />} />

          <Route path="/admindb" element={<Admindb />} />
          <Route path="/adminusers" element={<AdminUsers />} />
          <Route path="/adminpass" element={<AdminPasswordReset />} />
          <Route path="/admincoms" element={<AdminCommunications />} />
          <Route path="/adminverify" element={<AdminVerifyDoctors />} />

          <Route path="/docdb" element={<Docdb />} />
          <Route path="/createsec" element={<DoctorSecretaries />} />
          <Route path="/createpatient" element={<DoctorPatientsAccounts />} />
          <Route path="/seccreatepatient" element={<DoctorPatientsAccounts />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/rendezvous" element={<RendezVous />} />
          <Route path="/prescription" element={<PrescriptionTemplates />} />
          <Route path="/docwaiting" element={<DoctorWaitingRoom />} />
          <Route path="/docstats" element={<DoctorStatistics />} />
          <Route path="/doctasks" element={<DoctorTasks />} />
          <Route path="/doctuto" element={<DoctorTutorial />} />
          <Route path="/docmail" element={<DoctorCommunication />} />
          <Route path="/docsettings" element={<DoctorSettings />} />

          <Route path="/patientdb" element={<PatientDashboard />} />
          <Route path="/patient-consultations" element={<PatientConsultations />} />
          <Route path="/patient-medical-record" element={<PatientMedicalRecord />} />

          <Route path="/secretariatdb" element={<SecretariatDB />} />
          <Route path="/secpatients" element={<SecretaryPatients />} />
          <Route path="/secretaryRendezvous" element={<SecretaryRendezVous />} />
          <Route path="/secwaiting" element={<SecretaryWaitingRoom />} />
          <Route path="/secpay" element={<SecretaryPayments />} />
          <Route path="/secmail" element={<DoctorCommunication />} />
          <Route path="/sectasks" element={<SecretaryTasks />} />
          <Route path="/secsettings" element={<SecretarySettings />} />
        </Routes>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;