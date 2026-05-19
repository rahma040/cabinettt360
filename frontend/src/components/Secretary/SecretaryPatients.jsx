import {
  FaHome,
  FaUserInjured,
  FaCalendarCheck,
  FaUserClock,
  FaMoneyBillWave,
  FaClipboardList,
  FaCog,
  FaUserPlus,
  FaEnvelope,
} from "react-icons/fa";
import Patients from "../Doctor/Patients";

function SecretaryPatients() {
  const navItems = [
    { to: "/secretariatdb", icon: <FaHome />, label: "Tableau de bord" },
    { to: "/secpatients", icon: <FaUserInjured />, label: "Patients", active: true },
    { to: "/seccreatepatient", icon: <FaUserPlus />, label: "Comptes patients" },
    { to: "/secretaryRendezvous", icon: <FaCalendarCheck />, label: "Rendez-vous" },
    { to: "/sectasks", icon: <FaClipboardList />, label: "Tâches" },
    { to: "/secwaiting", icon: <FaUserClock />, label: "Salle d'attente" },
    { to: "/secpay", icon: <FaMoneyBillWave />, label: "Paiements" },
    { to: "/secmail", icon: <FaEnvelope />, label: "Messagerie" },
    { to: "/secsettings", icon: <FaCog />, label: "Paramètres" },
  ];

  return (
    <Patients
      allowedRole="secretaire"
      spaceLabel="Espace secrétariat"
      userRoleLabel="Secrétaire"
      roleInitial="S"
      pageTitle="Patients"
      activePath="/secpatients"
      navItems={navItems}
      showDocuments={false}
      showDoctorNotes={false}
      showMedicalHistory={false}
      showVisites={false}
    />
  );
}

export default SecretaryPatients;