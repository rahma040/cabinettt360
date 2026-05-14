import SecretaryWaitingRoom from "../Secretary/SecretaryWaitingRoom";
import {
  FaHome,
  FaUserInjured,
  FaFileMedical,
  FaCalendarCheck,
  FaUserClock,
  FaUserPlus,
  FaChartLine,
  FaTasks,
  FaEnvelope,
  FaGraduationCap,
  FaCog,
} from "react-icons/fa";

function DoctorWaitingRoom() {
  const navItems = [
    { to: "/docdb", icon: <FaHome />, label: "Tableau de bord" },
    { to: "/patients", icon: <FaUserInjured />, label: "Patients" },
    { to: "/prescription", icon: <FaFileMedical />, label: "Ordonnance" },
    { to: "/rendezvous", icon: <FaCalendarCheck />, label: "Rendez-vous" },
    { to: "/docwaiting", icon: <FaUserClock />, label: "Salle d'attente", active: true },
    { to: "/createsec", icon: <FaUserPlus />, label: "Secrétaire" },
    { to: "/docstats", icon: <FaChartLine />, label: "Statistiques" },
    { to: "/doctasks", icon: <FaTasks />, label: "Tâches" },
    { to: "/docmail", icon: <FaEnvelope />, label: "Communication" },
    { to: "/doctuto", icon: <FaGraduationCap />, label: "Tutoriel" },
    { to: "/docsettings", icon: <FaCog />, label: "Paramètres" },
  ];

  return (
    <SecretaryWaitingRoom
      allowedRole="medecin"
      roleLabel="Médecin"
      spaceLabel="Espace médecin"
      roleInitial="D"
      navItems={navItems}
    />
  );
}

export default DoctorWaitingRoom;