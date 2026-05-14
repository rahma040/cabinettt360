import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaUserMd,
  FaCalendarCheck,
  FaFileMedical,
  FaPrescriptionBottle,
  FaCreditCard,
  FaChartLine,
  FaStar,
  FaQuoteRight,
  FaPhoneAlt,
  FaArrowRight,
  FaUsers,
  FaClock,
  FaRocket,
  FaHome,
  FaEnvelope,
  FaUserInjured,
  FaTasks,
  FaUserPlus,
  FaUserClock,
  FaTimesCircle,
} from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";

const heroImage = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
const dashboardPreview = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
const testimonial1 = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";
const testimonial2 = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";
const testimonial3 = "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";

const testimonials = [
  { name: "Dr. Sarah Johnson", role: "Cardiologue", image: testimonial1, quote: "Ce système a révolutionné ma pratique. La gestion des patients et la planification me font gagner des heures chaque semaine.", rating: 5 },
  { name: "Dr. Michael Chen", role: "Médecine générale", image: testimonial2, quote: "L'intégration des ordonnances électroniques et de la facturation est parfaite. Mon équipe adore sa simplicité.", rating: 5 },
  { name: "Dr. Emily Rodriguez", role: "Pédiatre", image: testimonial3, quote: "Enfin une plateforme qui comprend les besoins pédiatriques. Le suivi des vaccinations est un vrai plus !", rating: 5 },
];

const stats = [
  { value: "500+", label: "Professionnels de santé", icon: FaUserMd },
  { value: "50K+", label: "Patients actifs", icon: FaUsers },
  { value: "99.9%", label: "Disponibilité garantie", icon: FaClock },
];

const tutorialCards = [
  { title: "Tableau de bord", icon: FaHome, description: "Aperçu global : KPI clés, rendez-vous récents, salle d'attente en temps réel.", videoUrl: "https://www.youtube.com/embed/ACHErLy_yY0" },
  { title: "Communication", icon: FaEnvelope, description: "Messages sécurisés avec pièces jointes, historique complet.", videoUrl: "https://www.youtube.com/embed/jwIkB7RkEoU" },
  { title: "Patients", icon: FaUserInjured, description: "Gestion complète du fichier patient : ajout, modification, historique médical.", videoUrl: "https://www.youtube.com/embed/hZJEjUR_p-4" },
  { title: "Prescription", icon: FaFileMedical, description: "Créez, éditez et imprimez des ordonnances numériques avec posologie.", videoUrl: "https://www.youtube.com/embed/xA5bxTkkRUM" },
  { title: "Rendez-vous", icon: FaCalendarCheck, description: "Calendrier des consultations : planifier, modifier ou annuler.", videoUrl: "https://www.youtube.com/embed/_yG3mFFva9Q" },
  { title: "Salle d'attente", icon: FaUserClock, description: "Suivi en direct des patients en attente. Marquez l'arrivée.", videoUrl: "https://www.youtube.com/embed/u3TDlyPr8dc" },
  { title: "Secrétaire", icon: FaUserPlus, description: "Gestion des comptes secrétaires : ajouter, désactiver ou modifier les droits.", videoUrl: "https://www.youtube.com/embed/hFmU3Wf6Zqo" },
  { title: "Statistiques", icon: FaChartLine, description: "Analyses détaillées : évolution des consultations, rapports exportables.", videoUrl: "https://www.youtube.com/embed/LZn7gLTqxKQ" },
  { title: "Tâches", icon: FaTasks, description: "Planification, suivi, rappels et attribution des tâches aux secrétaires.", videoUrl: "https://www.youtube.com/embed/Slf108UjZvo" },
];

const cardColors = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-blue-500",
  "from-rose-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-yellow-500 to-amber-500",
  "from-sky-500 to-blue-600",
];

const AnimatedOnScroll = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1, once: true }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Home = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && modalOpen) {
        setModalOpen(false);
        setCurrentVideoUrl("");
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [modalOpen]);

  const openVideo = (url) => {
    setCurrentVideoUrl(url);
    setModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000" />
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 15 + 10}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedOnScroll>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                Simplifiez la gestion de votre{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  cabinet médical
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-lg">
                Une plateforme tout‑en‑un pour gérer patients, rendez‑vous, dossiers médicaux et facturation.
                Passez plus de temps à soigner, moins à la paperasse.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 group"
                >
                  Essai gratuit
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/demo"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                >
                  Voir la démo
                </Link>
              </div>
              <div className="mt-10 flex items-center text-gray-300">
                <span className="flex -space-x-2">
                  {testimonials.map((t, idx) => (
                    <img key={idx} src={t.image} alt={t.name} className="w-10 h-10 rounded-full border-2 border-slate-800" />
                  ))}
                </span>
                <span className="ml-4 text-sm font-medium">Approuvé par 500+ professionnels de santé</span>
              </div>
            </AnimatedOnScroll>

            <AnimatedOnScroll delay={200}>
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  <img src={heroImage} alt="Médecin utilisant une tablette" className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg flex items-center gap-3 animate-bounce-slow">
                  <FaCalendarCheck className="text-blue-400 text-2xl" />
                  <div>
                    <p className="text-xs text-gray-300">Prochain rendez‑vous</p>
                    <p className="font-semibold text-white">Aujourd'hui 15:30</p>
                  </div>
                </div>
              </div>
            </AnimatedOnScroll>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <AnimatedOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Tutoriels vidéo</h2>
            </AnimatedOnScroll>
            <AnimatedOnScroll delay={100}>
              <p className="text-lg text-gray-300">Maîtrisez chaque fonctionnalité grâce à nos guides interactifs.</p>
            </AnimatedOnScroll>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tutorialCards.map((card, idx) => (
              <AnimatedOnScroll key={idx} delay={idx * 100}>
                <div
                  onClick={() => openVideo(card.videoUrl)}
                  className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                >
                  <div className={`bg-gradient-to-br ${cardColors[idx % cardColors.length]} w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                    <card.icon className="text-white text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{card.title}</h3>
                  <p className="text-gray-300">{card.description}</p>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaArrowRight className="text-blue-400" />
                  </div>
                </div>
              </AnimatedOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => (
              <AnimatedOnScroll key={idx} delay={idx * 100}>
                <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:scale-105 transition-transform duration-300">
                  <stat.icon className="text-4xl text-blue-400 mx-auto mb-4" />
                  <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">{stat.value}</div>
                  <p className="text-gray-300">{stat.label}</p>
                </div>
              </AnimatedOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedOnScroll className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Tableau de bord intuitif à portée de main</h2>
              <p className="text-lg text-gray-300 mb-6">
                Obtenez une vue complète de votre cabinet avec notre tableau de bord clair et personnalisable.
                Consultez les rendez‑vous du jour, l'activité récente des patients et les indicateurs clés.
              </p>
              <ul className="space-y-4">
                {[
                  "Mises à jour en temps réel – Ne manquez aucun changement",
                  "Accès basé sur les rôles – Vues sécurisées pour le personnel",
                  "Compatible mobile – Gérez votre cabinet en déplacement",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mt-1">✓</div>
                    <p className="ml-4 text-gray-300">{item}</p>
                  </li>
                ))}
              </ul>
            </AnimatedOnScroll>
            <AnimatedOnScroll delay={200} className="order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 hover:scale-102 transition-transform duration-300">
                <img src={dashboardPreview} alt="Aperçu du tableau de bord" className="w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
              </div>
            </AnimatedOnScroll>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <AnimatedOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ce que disent les professionnels de santé</h2>
            </AnimatedOnScroll>
            <AnimatedOnScroll delay={100}>
              <p className="text-lg text-gray-300">Rejoignez des centaines de médecins satisfaits qui ont transformé leur pratique.</p>
            </AnimatedOnScroll>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <AnimatedOnScroll key={idx} delay={idx * 100}>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 relative hover:-translate-y-2 transition-transform duration-300">
                  <FaQuoteRight className="absolute top-6 right-6 text-blue-400/30 text-4xl" />
                  <div className="flex items-center mb-6">
                    <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-blue-400" />
                    <div>
                      <h4 className="font-bold text-white text-lg">{testimonial.name}</h4>
                      <p className="text-gray-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic mb-4">"{testimonial.quote}"</p>
                  <div className="flex text-yellow-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                </div>
              </AnimatedOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="container mx-auto max-w-5xl">
          <AnimatedOnScroll>
            <div className="relative bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-12 text-center border border-white/20 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative">Prêt à optimiser votre cabinet ?</h2>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto relative">
                Rejoignez des milliers de professionnels de santé qui font confiance à DoctorManager Pro.
              </p>
              <div className="flex flex-wrap justify-center gap-4 relative">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-105 flex items-center gap-2"
                >
                  Commencer gratuitement
                  <FaRocket />
                </Link>
                <Link
                  to="/contact"
                  className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-blue-600 transition transform hover:scale-105"
                >
                  Contacter les ventes
                </Link>
              </div>
              <div className="mt-8 flex justify-center items-center gap-6 text-sm text-gray-200 relative">
                <span className="flex items-center gap-2"><FaPhoneAlt /> +33 1 80 00 00 00</span>
                <span className="flex items-center gap-2"><HiOutlineMail /> contact@doctormanager.fr</span>
              </div>
            </div>
          </AnimatedOnScroll>
        </div>
      </section>

      <footer className="py-12 border-t border-white/10 text-center text-gray-400 text-sm">
        <p>© 2026 Cabi Doc. Tous droits réservés.</p>
      </footer>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => { setModalOpen(false); setCurrentVideoUrl(""); }}
        >
          <div
            className="relative bg-slate-900 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 bg-slate-800 border-b border-white/10">
              <h3 className="text-white font-semibold">Vidéo tutorielle</h3>
              <button
                onClick={() => { setModalOpen(false); setCurrentVideoUrl(""); }}
                className="text-gray-400 hover:text-white transition"
              >
                <FaTimesCircle size={24} />
              </button>
            </div>
            <div className="relative pt-[56.25%]">
              <iframe
                src={currentVideoUrl}
                title="YouTube tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-30px) translateX(20px); }
        }
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-pulse { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-float { animation: float infinite ease-in-out; }
        .animate-bounce-slow { animation: bounceSlow 2s infinite ease-in-out; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .hover\\:scale-102:hover { transform: scale(1.02); }
      `}</style>
    </div>
  );
};

export default Home;