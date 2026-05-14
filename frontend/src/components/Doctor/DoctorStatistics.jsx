import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FaHome, 
  FaUserInjured, 
  FaCalendarCheck, 
  FaFileMedical, 
  FaCog,
  FaSignOutAlt, 
  FaChartLine, 
  FaMoneyBillWave, 
  FaUsers, 
  FaBriefcaseMedical,
  FaBars, 
  FaTimes, 
  FaUserClock, 
  FaUserPlus, 
  FaStethoscope, 
  FaPlay,
  FaCheckCircle, 
  FaSpinner, 
  FaChartBar, 
  FaChartPie, 
  FaDatabase, 
  FaBrain,
  FaShieldAlt, 
  FaSync, 
  FaTasks, 
  FaTint, 
  FaCalendarAlt, 
  FaArrowUp,
  FaArrowDown, 
  FaEquals, 
  FaExclamationCircle, 
  FaRegCalendarCheck,
  FaEnvelope,
  FaGraduationCap,
} from "react-icons/fa";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart, Line,
} from "recharts";

const API_BASE_URL = "http://127.0.0.1:8000/api";
const CHART_COLORS = ["#3B7EF8","#0ECDB5","#F59E0B","#F43F5E","#8B5CF6","#10B981","#F97316","#06B6D4"];
const BLOOD_COLORS = { "A+":"#F43F5E","A-":"#FB7185","B+":"#3B7EF8","B-":"#60A5FA","O+":"#10B981","O-":"#34D399","AB+":"#8B5CF6","AB-":"#A78BFA" };

const api = axios.create({ baseURL: API_BASE_URL });
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

const OBFUSCATION_KEY = "MediCareSecure2025!";

function obfuscate(str) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result);
}

function deobfuscate(obfuscatedStr) {
  const decoded = atob(obfuscatedStr);
  let result = "";
  for (let i = 0; i < decoded.length; i++) {
    const charCode = decoded.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length);
    result += String.fromCharCode(charCode);
  }
  return result;
}

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
  *{font-family:'Sora',sans-serif;box-sizing:border-box;}
  :root{--navy:#060D1F;--navy-mid:#0C1A3A;--navy-light:#122048;--accent:#3B7EF8;--accent-glow:rgba(59,126,248,0.20);--teal:#0ECDB5;--amber:#F59E0B;--rose:#F43F5E;--emerald:#10B981;--violet:#8B5CF6;--surface:#F4F7FF;--text-1:#0A0F1E;--text-2:#5B6B8A;--border:rgba(59,126,248,0.13);}
  .ds-sidebar{background:linear-gradient(180deg,var(--navy) 0%,var(--navy-mid) 60%,var(--navy-light) 100%);}
  .ds-logo-ring{background:linear-gradient(135deg,var(--accent),#2563EB);}
  .ds-nav-link{transition:all .2s ease;border-left:3px solid transparent;color:rgba(255,255,255,.48);font-size:14px;}
  .ds-nav-link:hover{background:rgba(59,126,248,.14);border-left-color:var(--accent);color:#fff;}
  .ds-nav-link.active{background:rgba(59,126,248,.22);border-left-color:var(--accent);color:#fff;}
  .ds-toggle{background:linear-gradient(135deg,var(--accent),#2563EB);box-shadow:0 4px 14px rgba(59,126,248,.4);}
  .btn-accent{background:linear-gradient(135deg,var(--accent),#2563EB);color:#fff;box-shadow:0 4px 18px rgba(59,126,248,.38);transition:all .2s ease;}
  .btn-accent:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(59,126,248,.5);}
  .btn-ghost{border:1.5px solid #E2E8F0;color:#64748B;background:#fff;transition:all .18s ease;}
  .btn-ghost:hover{background:#F8FAFF;border-color:rgba(59,126,248,.3);color:var(--accent);}
  .preload-bg{background:radial-gradient(ellipse 80% 60% at 50% -10%,rgba(59,126,248,0.12) 0%,transparent 70%),linear-gradient(180deg,#F4F7FF 0%,#EEF4FF 100%);}
  .preload-card{background:#fff;border:1.5px solid rgba(59,126,248,0.15);border-radius:28px;box-shadow:0 24px 80px rgba(59,126,248,0.12);}
  .preload-glow{position:absolute;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(59,126,248,0.15) 0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;animation:pulse-glow 3s ease-in-out infinite;}
  @keyframes pulse-glow{0%,100%{opacity:.6;transform:translate(-50%,-50%) scale(1);}50%{opacity:1;transform:translate(-50%,-50%) scale(1.15);}}
  .seq-step{border:1.5px solid #E8EEFF;border-radius:14px;background:#FAFBFF;transition:all .3s ease;}
  .seq-step.done{border-color:#A7F3D0;background:#F0FFF8;}
  .seq-step.running{border-color:var(--accent);background:#EEF4FF;}
  .seq-bar{height:3px;border-radius:99px;background:#E8EEFF;overflow:hidden;}
  .seq-bar-fill{height:3px;border-radius:99px;background:linear-gradient(90deg,var(--accent),var(--teal));}
  .seq-bar-pulse{height:3px;border-radius:99px;background:linear-gradient(90deg,var(--accent),var(--teal));background-size:200% 100%;animation:barPulse .8s linear infinite;width:40%;}
  @keyframes barPulse{0%{background-position:0% 0%;}100%{background-position:-200% 0%;}}
  .kpi-blue{background:linear-gradient(135deg,#EEF4FF,#DBEAFE);border:1.5px solid #BFDBFE;}
  .kpi-green{background:linear-gradient(135deg,#ECFDF5,#D1FAE5);border:1.5px solid #A7F3D0;}
  .kpi-violet{background:linear-gradient(135deg,#EEE8FF,#DDD6FE);border:1.5px solid #DDD6FE;}
  .kpi-amber{background:linear-gradient(135deg,#FFFBEB,#FEF3C7);border:1.5px solid #FDE68A;}
  .kpi-teal{background:linear-gradient(135deg,#ECFFFE,#CCFBF1);border:1.5px solid #99F6E4;}
  .kpi-rose{background:linear-gradient(135deg,#FFF1F2,#FFE4E6);border:1.5px solid #FECDD3;}
  .kpi-card{border-radius:20px;padding:20px;transition:all .22s cubic-bezier(.4,0,.2,1);}
  .kpi-card:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(6,13,31,.1);}
  .chart-card{background:#fff;border-radius:20px;border:1.5px solid var(--border);padding:24px;transition:all .22s ease;}
  .chart-card:hover{border-color:rgba(59,126,248,.22);box-shadow:0 8px 28px rgba(59,126,248,.08);}
  .period-bar{background:#E8EEFF;border-radius:12px;padding:4px;}
  .period-active{background:#fff;color:var(--text-1);font-weight:700;box-shadow:0 2px 10px rgba(6,13,31,.08);}
  .period-idle{color:var(--text-2);font-weight:500;}
  .top-row{border:1.5px solid #E8EEFF;border-radius:14px;background:#FAFBFF;transition:all .2s ease;}
  .top-row:hover{border-color:rgba(59,126,248,.22);background:#F0F4FF;transform:translateX(4px);}
  .activity-row{border:1.5px solid #E8EEFF;border-radius:14px;background:#FAFBFF;transition:all .2s ease;}
  .activity-row:hover{border-color:rgba(59,126,248,.22);background:#F0F4FF;}
  .mono{font-family:'JetBrains Mono',monospace;}
  ::-webkit-scrollbar{width:5px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:rgba(59,126,248,.25);border-radius:99px;}
  ::-webkit-scrollbar-thumb:hover{background:rgba(59,126,248,.45);}
`;

const STEPS = [
  { icon:<FaDatabase size={14}/>, label:"Connexion à la base de données",detail:"Authentification sécurisée…" },
  { icon:<FaUsers size={14}/>,    label:"Chargement des données patients",detail:"Récupération des dossiers…" },
  { icon:<FaBriefcaseMedical size={14}/>, label:"Analyse des visites médicales",detail:"Calcul des statistiques…" },
  { icon:<FaMoneyBillWave size={14}/>,label:"Traitement des revenus",detail:"Agrégation financière…" },
  { icon:<FaCalendarCheck size={14}/>,label:"Données de rendez-vous",detail:"Tri par période…" },
  { icon:<FaBrain size={14}/>,label:"Génération des graphiques",detail:"Construction des visualisations…" },
  { icon:<FaShieldAlt size={14}/>,label:"Finalisation du tableau de bord",detail:"Mise en forme des résultats…" },
];

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#fff",border:"1.5px solid #E8EEFF",borderRadius:12,padding:"10px 14px",boxShadow:"0 8px 24px rgba(6,13,31,.1)",fontFamily:"Sora,sans-serif"}}>
      <p style={{fontSize:11,color:"#94A3B8",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</p>
      {payload.map((p,i)=>(
        <p key={i} style={{fontSize:14,fontWeight:700,color:p.color||"#0A0F1E"}}>
          {currency?new Intl.NumberFormat("fr-FR",{style:"currency",currency:"TND"}).format(p.value):p.value}
          <span style={{fontSize:11,fontWeight:500,color:"#94A3B8",marginLeft:4}}>{p.name}</span>
        </p>
      ))}
    </div>
  );
};

const Trend = ({ current, previous }) => {
  if (previous == null || previous === 0) return null;
  const pct = Math.round(((current-previous)/previous)*100);
  if (pct > 0) return <span className="text-xs flex items-center gap-0.5" style={{color:"#10B981",fontWeight:700}}><FaArrowUp size={9}/>{pct}%</span>;
  if (pct < 0) return <span className="text-xs flex items-center gap-0.5" style={{color:"#F43F5E",fontWeight:700}}><FaArrowDown size={9}/>{Math.abs(pct)}%</span>;
  return <span className="text-xs flex items-center gap-0.5" style={{color:"#94A3B8",fontWeight:700}}><FaEquals size={9}/>0%</span>;
};

const ChartHeader = ({ title, subtitle, iconBg, icon }) => (
  <div className="flex items-center justify-between mb-5">
    <div>
      <p style={{fontWeight:700,color:"var(--text-1)",fontSize:14}}>{title}</p>
      {subtitle&&<p className="text-xs mt-0.5" style={{color:"var(--text-2)"}}>{subtitle}</p>}
    </div>
    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:iconBg}}>{icon}</div>
  </div>
);

const clearAndRedirect = (navigate) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userIntegrityHash");
  navigate("/accessdenied");
};

const performIntegrityCheck = async (navigate, setError, isInitial = false) => {
  const token = localStorage.getItem("token");
  const storedUserRaw = localStorage.getItem("user");
  const storedObfuscatedHash = localStorage.getItem("userIntegrityHash");

  if (!token || !storedUserRaw) return;

  try {
    const response = await api.get("/current-user");
    const { data } = response;

    const storedUser = JSON.parse(storedUserRaw);
    if (
      storedUser.id !== data.id ||
      storedUser.email !== data.email ||
      storedUser.role !== data.role
    ) {
      console.warn("Tampering detected: user data mismatch");
      clearAndRedirect(navigate);
      return;
    }

    if (isInitial && !storedObfuscatedHash && data.integrity_hash) {
      const obfuscated = obfuscate(data.integrity_hash);
      localStorage.setItem("userIntegrityHash", obfuscated);
      return;
    }

    if (storedObfuscatedHash) {
      const storedHash = deobfuscate(storedObfuscatedHash);
      if (data.integrity_hash !== storedHash) {
        console.warn("Tampering detected: integrity hash mismatch");
        clearAndRedirect(navigate);
        return;
      }
    }
  } catch (err) {
    console.error("Integrity check failed", err);
    clearAndRedirect(navigate);
  }
};

function DoctorStatistics() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState("month");
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const seqTimerRef = useRef(null);
  const integrityInterval = useRef(null);

  const [stats, setStats] = useState({
    overview:null, visitsTimeline:[], revenueTimeline:[], paymentDist:[],
    appointmentDist:[], topPatients:[], ageDist:[], monthlyComparison:[],
    visitsByDay:[], visitStatus:[], revenueByMonth:[], bloodGroups:[],
    recentActivity:null,
  });

  const navItems = [
    { to: "/docdb", icon: <FaHome />, label: "Tableau de bord" },
    { to: "/patients", icon: <FaUserInjured />, label: "Patients" },
    { to: "/prescription", icon: <FaFileMedical />, label: "Ordonnance" },
    { to: "/rendezvous", icon: <FaCalendarCheck />, label: "Rendez-vous" },
    { to: "/docwaiting", icon: <FaUserClock />, label: "Salle d'attente" },
    { to: "/createsec", icon: <FaUserPlus />, label: "Secrétaire" },
    { to: "/docstats", icon: <FaChartLine />, label: "Statistiques", active: true },
    { to: "/doctasks", icon: <FaTasks />, label: "Tâches" },
    { to: "/docmail", icon: <FaEnvelope />, label: "Communication" },
    { to: "/doctuto", icon: <FaGraduationCap />, label: "Tutoriel" },
    { to: "/docsettings", icon: <FaCog />, label: "Paramètres" },
  ];

  useEffect(()=>{
    AOS.init({duration:700,once:true,easing:"ease-out-cubic"});
    const token=localStorage.getItem("token"), userData=localStorage.getItem("user");
    if(!token||!userData){navigate("/login");return;}
    const parsedUser = JSON.parse(userData);
    if(parsedUser.role !== "medecin") { navigate("/dashboard"); return; }
    setUser(parsedUser);

    performIntegrityCheck(navigate, null, true)
      .then(() => {})
      .catch(() => {});

    integrityInterval.current = setInterval(() => {
      performIntegrityCheck(navigate, null, false);
    }, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        performIntegrityCheck(navigate, null, false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (integrityInterval.current) clearInterval(integrityInterval.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  },[navigate]);

  const handleLogout=()=>{
    if (integrityInterval.current) clearInterval(integrityInterval.current);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userIntegrityHash");
    navigate("/login");
  };

  const startLoadSequence=()=>{
    setLoading(true);setCompletedSteps([]);setCurrentStep(0);
    fetchAllStats(localStorage.getItem("token"));
  };

  useEffect(()=>{
    if(!loading||currentStep<0||currentStep>=STEPS.length)return;
    seqTimerRef.current=setTimeout(()=>{
      setCompletedSteps(prev=>[...prev,currentStep]);
      if(currentStep+1<STEPS.length)setCurrentStep(currentStep+1);
    },600+Math.random()*500);
    return()=>clearTimeout(seqTimerRef.current);
  },[loading,currentStep]);

  const fetchAllStats=async(token)=>{
    const H={Authorization:`Bearer ${token}`};
    try{
      const [oR,viR,reR,paR,apR,tpR,agR,mcR,dR,vsR,rmR,bgR,raR]=await Promise.all([
        fetch(`${API_BASE_URL}/doctor/statistics/overview`,{headers:H}),
        fetch(`${API_BASE_URL}/doctor/statistics/visits-timeline?period=${period}`,{headers:H}),
        fetch(`${API_BASE_URL}/doctor/statistics/revenue-timeline?period=${period}`,{headers:H}),
        fetch(`${API_BASE_URL}/doctor/statistics/payment-distribution`,{headers:H}),
        fetch(`${API_BASE_URL}/doctor/statistics/appointment-distribution`,{headers:H}),
        fetch(`${API_BASE_URL}/doctor/statistics/top-patients?limit=5`,{headers:H}),
        fetch(`${API_BASE_URL}/doctor/statistics/age-distribution`,{headers:H}),
        fetch(`${API_BASE_URL}/doctor/statistics/monthly-comparison`,{headers:H}),
        fetch(`${API_BASE_URL}/doctor/statistics/visits-by-day`,{headers:H}),
        fetch(`${API_BASE_URL}/doctor/statistics/visit-status`,{headers:H}),
        fetch(`${API_BASE_URL}/doctor/statistics/revenue-by-month`,{headers:H}),
        fetch(`${API_BASE_URL}/doctor/statistics/blood-group-distribution`,{headers:H}),
        fetch(`${API_BASE_URL}/doctor/statistics/recent-activity`,{headers:H}),
      ]);
      const [overview,visitsTimeline,revenueTimeline,paymentDist,appointmentDist,
             topPatients,ageDist,monthlyComparison,visitsByDay,visitStatus,
             revenueByMonth,bloodGroups,recentActivity]=await Promise.all([
        oR.json(),viR.json(),reR.json(),paR.json(),apR.json(),tpR.json(),agR.json(),
        mcR.json(),dR.json(),vsR.json(),rmR.json(),bgR.json(),raR.json()
      ]);
      setStats({overview,visitsTimeline,revenueTimeline,paymentDist,appointmentDist,
                topPatients,ageDist,monthlyComparison,visitsByDay,visitStatus,
                revenueByMonth,bloodGroups,recentActivity});
      const waitForSteps=()=>setCompletedSteps(prev=>{
        if(prev.length>=STEPS.length-1){setTimeout(()=>{setLoading(false);setDataLoaded(true);},600);return prev;}
        setTimeout(waitForSteps,300);return prev;
      });
      waitForSteps();
    }catch(err){console.error(err);setLoading(false);}
  };

  useEffect(()=>{if(dataLoaded&&user)fetchAllStats(localStorage.getItem("token"));},[period]);

  const fmt=v=>new Intl.NumberFormat("fr-FR",{style:"currency",currency:"TND"}).format(v||0);
  const ov=stats.overview;

  const Sidebar=()=>(
    <aside className={`fixed inset-y-0 left-0 transform ${sidebarOpen?"translate-x-0":"-translate-x-full"} lg:relative lg:translate-x-0 transition-transform duration-300 z-40 w-64 flex flex-col ds-sidebar`}>
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center ds-logo-ring flex-shrink-0"><FaStethoscope className="text-white text-base"/></div>
          <div><h1 className="text-white text-lg" style={{fontWeight:800,letterSpacing:"-0.02em"}}>Cabi Doc</h1><p className="text-xs" style={{color:"rgba(255,255,255,.38)"}}>Espace médecin</p></div>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item=>(
          <Link key={item.to} to={item.to} onClick={()=>setSidebarOpen(false)}
            className={`ds-nav-link flex items-center gap-3 px-4 py-3 rounded-xl ${item.active?"active":""}`}
            style={{fontWeight:item.active?600:500}}>
            <span style={{opacity:item.active?1:0.65}}>{item.icon}</span><span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 m-3 rounded-2xl" style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)"}}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0 ds-logo-ring" style={{fontWeight:700}}>{user?.name?.charAt(0)||"D"}</div>
          <div className="flex-1 min-w-0"><p className="text-white text-sm truncate" style={{fontWeight:600}}>Dr. {user?.name||"Médecin"}</p><p className="text-xs" style={{color:"rgba(255,255,255,.38)"}}>Médecin</p></div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all hover:bg-red-500/20" style={{color:"rgba(255,255,255,.5)",fontWeight:500}}>
          <FaSignOutAlt size={12}/> Déconnexion
        </button>
      </div>
    </aside>
  );

  if(!loading&&!dataLoaded)return(
    <div className="flex h-screen overflow-hidden" style={{background:"var(--surface)"}}>
      <style>{G}</style><FontInjector/>
      <button onClick={()=>setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center text-white rounded-r-xl ds-toggle">{sidebarOpen?<FaTimes size={16}/>:<FaBars size={16}/>}</button>
      <Sidebar/>{sidebarOpen&&<div className="fixed inset-0 z-30 lg:hidden" style={{background:"rgba(6,13,31,.5)",backdropFilter:"blur(4px)"}} onClick={()=>setSidebarOpen(false)}/>}
      <main className="flex-1 overflow-y-auto preload-bg flex items-center justify-center p-8 pt-16 lg:pt-8">
        <div className="relative max-w-lg w-full text-center">
          <div className="preload-glow"/>
          <div className="preload-card p-10 relative">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto" style={{background:"linear-gradient(135deg,var(--accent),#2563EB)",boxShadow:"0 12px 40px rgba(59,126,248,.4)"}}><FaChartLine className="text-white" size={36}/></div>
              {[0,1,2].map(i=>(
                <div key={i} className="absolute w-3 h-3 rounded-full" style={{background:["var(--accent)","var(--teal)","var(--violet)"][i],top:"50%",left:"50%",transform:`rotate(${i*120}deg) translateX(48px)`,boxShadow:`0 0 8px ${["rgba(59,126,248,.6)","rgba(14,205,181,.6)","rgba(139,92,246,.6)"][i]}`,animation:`orbit${i} 3s linear infinite`}}/>
              ))}
              <style>{`@keyframes orbit0{from{transform:rotate(0deg) translateX(48px);}to{transform:rotate(360deg) translateX(48px);}}@keyframes orbit1{from{transform:rotate(120deg) translateX(48px);}to{transform:rotate(480deg) translateX(48px);}}@keyframes orbit2{from{transform:rotate(240deg) translateX(48px);}to{transform:rotate(600deg) translateX(48px);}}`}</style>
            </div>
            <h2 className="text-2xl mb-2" style={{fontWeight:800,color:"var(--text-1)",letterSpacing:"-0.03em"}}>Tableau de bord analytique</h2>
            <p className="text-sm mb-2" style={{color:"var(--text-2)"}}>Visualisez l'intégralité de votre activité médicale en temps réel.</p>
            <p className="text-xs mb-8" style={{color:"#94A3B8"}}>Patients · Visites · Revenus · Tendances · Jours actifs · Groupes sanguins</p>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {["13 indicateurs","Comparaison 6 mois","Jours actifs","Groupes sanguins","Top patients","Activité récente"].map(f=>(
                <span key={f} className="px-3 py-1 rounded-xl text-xs" style={{background:"#EEF4FF",color:"var(--accent)",border:"1.5px solid #BFDBFE",fontWeight:600}}>{f}</span>
              ))}
            </div>
            <button onClick={startLoadSequence} className="btn-accent w-full py-4 rounded-2xl text-base flex items-center justify-center gap-3" style={{fontWeight:700}}><FaPlay size={14}/> Charger les données</button>
            <p className="text-xs mt-4" style={{color:"#94A3B8"}}>Données récupérées directement depuis la base de données</p>
          </div>
        </div>
      </main>
    </div>
  );

  if(loading){
    const pct=Math.round((completedSteps.length/STEPS.length)*100);
    return(
      <div className="flex h-screen overflow-hidden" style={{background:"var(--surface)"}}>
        <style>{G}</style><FontInjector/>
        <button onClick={()=>setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center text-white rounded-r-xl ds-toggle">{sidebarOpen?<FaTimes size={16}/>:<FaBars size={16}/>}</button>
        <Sidebar/>{sidebarOpen&&<div className="fixed inset-0 z-30 lg:hidden" style={{background:"rgba(6,13,31,.5)",backdropFilter:"blur(4px)"}} onClick={()=>setSidebarOpen(false)}/>}
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-8 pt-16 lg:pt-8 preload-bg">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ds-logo-ring" style={{boxShadow:"0 8px 28px rgba(59,126,248,.35)"}}><FaSync className="text-white animate-spin" size={20}/></div>
              <h2 className="text-xl mb-1" style={{fontWeight:800,color:"var(--text-1)",letterSpacing:"-0.02em"}}>Génération du tableau de bord</h2>
              <p className="text-sm" style={{color:"var(--text-2)"}}>Veuillez patienter pendant le chargement des données…</p>
            </div>
            <div className="bg-white rounded-2xl p-6 mb-4" style={{border:"1.5px solid var(--border)",boxShadow:"0 4px 20px rgba(6,13,31,.06)"}}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs" style={{color:"var(--text-2)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em"}}>Progression globale</span>
                <span className="mono text-sm" style={{fontWeight:700,color:"var(--accent)"}}>{pct}%</span>
              </div>
              <div className="seq-bar mb-1"><div className="seq-bar-fill" style={{width:`${pct}%`,transition:"width .4s ease"}}/></div>
              <p className="text-xs mt-1" style={{color:"#94A3B8"}}>{completedSteps.length} / {STEPS.length} étapes</p>
            </div>
            <div className="space-y-2">
              {STEPS.map((step,i)=>{
                const isDone=completedSteps.includes(i),isRun=currentStep===i&&!isDone;
                return(
                  <div key={i} className={`seq-step px-4 py-3 ${isDone?"done":isRun?"running":""}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:isDone?"linear-gradient(135deg,#10B981,#059669)":isRun?"linear-gradient(135deg,var(--accent),#2563EB)":"#F0F4FF",color:isDone||isRun?"#fff":"#94A3B8"}}>
                        {isDone?<FaCheckCircle size={14}/>:isRun?<FaSpinner size={14} className="animate-spin"/>:step.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{fontWeight:isDone||isRun?700:500,color:isDone?"#065F46":isRun?"var(--accent)":"var(--text-2)"}}>{step.label}</p>
                        {isRun&&<p className="text-xs mt-0.5" style={{color:"#94A3B8"}}>{step.detail}</p>}
                      </div>
                      {isDone&&<span className="text-xs px-2 py-0.5 rounded-lg flex-shrink-0" style={{background:"#A7F3D0",color:"#065F46",fontWeight:700}}>✓</span>}
                      {isRun&&<span className="text-xs px-2 py-0.5 rounded-lg flex-shrink-0" style={{background:"#BFDBFE",color:"#1E40AF",fontWeight:700}}>En cours</span>}
                      {!isDone&&!isRun&&<span className="text-xs px-2 py-0.5 rounded-lg flex-shrink-0" style={{background:"#F0F4FF",color:"#94A3B8",fontWeight:600}}>En attente</span>}
                    </div>
                    {isRun&&<div className="seq-bar mt-2 ml-11"><div className="seq-bar-pulse"/></div>}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return(
    <div className="flex h-screen overflow-hidden" style={{background:"var(--surface)"}}>
      <style>{G}</style><FontInjector/>
      <button onClick={()=>setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center text-white rounded-r-xl ds-toggle">{sidebarOpen?<FaTimes size={16}/>:<FaBars size={16}/>}</button>
      <Sidebar/>{sidebarOpen&&<div className="fixed inset-0 z-30 lg:hidden" style={{background:"rgba(6,13,31,.5)",backdropFilter:"blur(4px)"}} onClick={()=>setSidebarOpen(false)}/>}

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 pt-14 lg:pt-8 max-w-7xl mx-auto">

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8" data-aos="fade-down">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{background:"linear-gradient(135deg,var(--accent),#2563EB)",boxShadow:"0 4px 14px rgba(59,126,248,.35)"}}><FaChartLine size={14}/></div>
                <h2 className="text-2xl" style={{fontWeight:800,color:"var(--text-1)",letterSpacing:"-0.03em"}}>Statistiques détaillées</h2>
              </div>
              <p className="text-sm ml-11" style={{color:"var(--text-2)"}}>Vue d'ensemble complète de votre activité médicale</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-3">
              <button onClick={()=>{setDataLoaded(false);setCompletedSteps([]);setCurrentStep(-1);}} className="btn-ghost px-4 py-2 rounded-xl text-xs flex items-center gap-2" style={{fontWeight:600}}><FaSync size={11}/> Recharger</button>
              <div className="period-bar flex">
                {[["week","Semaine"],["month","Mois"],["year","Année"]].map(([p,l])=>(
                  <button key={p} onClick={()=>setPeriod(p)} className={`px-4 py-2 rounded-xl text-xs transition-all ${period===p?"period-active":"period-idle"}`}>{l}</button>
                ))}
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{background:"#fff",border:"1.5px solid var(--border)"}}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs ds-logo-ring" style={{fontWeight:700}}>{user?.name?.charAt(0)||"D"}</div>
                <span className="hidden sm:inline text-sm" style={{fontWeight:600,color:"var(--text-1)"}}>Dr. {user?.name||"Médecin"}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5" data-aos="fade-up">
            {[
              {cls:"kpi-blue",  icon:<FaUsers size={20} style={{color:"#1E40AF"}}/>,label:"Patients",val:ov?.totalPatients||0,sub:"total enregistrés",mono:true,tc:<Trend current={ov?.newPatientsThisMonth} previous={ov?.newPatientsLastMonth}/>},
              {cls:"kpi-green", icon:<FaBriefcaseMedical size={20} style={{color:"#059669"}}/>,label:"Visites totales",val:ov?.totalVisits||0,sub:"consultations",mono:true,tc:<Trend current={ov?.completedVisitsThisMonth} previous={ov?.completedVisitsLastMonth}/>},
              {cls:"kpi-violet",icon:<FaCalendarCheck size={20} style={{color:"#5B21B6"}}/>,label:"Rendez-vous",val:ov?.totalAppointments||0,sub:"planifiés & passés",mono:true,tc:null},
              {cls:"kpi-amber", icon:<FaMoneyBillWave size={20} style={{color:"#D97706"}}/>,label:"Chiffre d'affaires",val:fmt(ov?.totalRevenue),sub:"revenus encaissés",mono:false,tc:<Trend current={ov?.revenueThisMonth} previous={ov?.revenueLastMonth}/>},
            ].map((k,i)=>(
              <div key={i} className={`kpi-card ${k.cls}`} data-aos="fade-up" data-aos-delay={i*60}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:"rgba(255,255,255,.7)"}}>{k.icon}</div>
                  {k.tc}
                </div>
                <p className="text-xs mb-1 uppercase tracking-wider" style={{color:"var(--text-2)",fontWeight:600,letterSpacing:"0.08em"}}>{k.label}</p>
                <p className={`${k.mono?"mono":""} mb-1`} style={{fontSize:k.mono?28:20,fontWeight:800,color:"var(--text-1)",letterSpacing:"-0.03em"}}>{k.val}</p>
                <p className="text-xs" style={{color:"var(--text-2)",fontWeight:500}}>{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6" data-aos="fade-up">
            {[
              {cls:"kpi-teal", icon:<FaRegCalendarCheck size={13} style={{color:"#0D9488"}}/>, label:"Présence", val:ov?.attendanceRate!=null?`${ov.attendanceRate}%`:"—"},
              {cls:"kpi-rose", icon:<FaTimes size={13} style={{color:"#F43F5E"}}/>, label:"Annulations", val:ov?.cancelledAppointments??"-"},
              {cls:"kpi-violet",icon:<FaBriefcaseMedical size={13} style={{color:"#7C3AED"}}/>, label:"Moy. v./patient", val:ov?.avgVisitsPerPatient??"-"},
              {cls:"kpi-amber", icon:<FaMoneyBillWave size={13} style={{color:"#D97706"}}/>, label:"Moy. rev./visite", val:ov?.avgRevenuePerVisit?fmt(ov.avgRevenuePerVisit):"—"},
              {cls:"kpi-rose", icon:<FaExclamationCircle size={13} style={{color:"#F43F5E"}}/>,label:"Paiements att.", val:ov?.pendingPayments??"-"},
              {cls:"kpi-green", icon:<FaUserPlus size={13} style={{color:"#059669"}}/>, label:"Nouveaux/mois", val:ov?.newPatientsThisMonth??"-"},
            ].map((k,i)=>(
              <div key={i} className={`kpi-card ${k.cls} flex items-center gap-3`} style={{padding:14}} data-aos="fade-up" data-aos-delay={i*40}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"rgba(255,255,255,.7)"}}>{k.icon}</div>
                <div><p className="text-xs" style={{color:"var(--text-2)",fontWeight:600,letterSpacing:"0.05em"}}>{k.label}</p><p className="mono text-sm" style={{fontWeight:800,color:"var(--text-1)"}}>{k.val}</p></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="chart-card" data-aos="fade-up">
              <ChartHeader title="Évolution des visites" subtitle="Consultations dans le temps" iconBg="#EEF4FF" icon={<FaChartLine size={14} style={{color:"var(--accent)"}}/>}/>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={stats.visitsTimeline}>
                  <defs><linearGradient id="vG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B7EF8" stopOpacity={0.18}/><stop offset="95%" stopColor="#3B7EF8" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FF"/><XAxis dataKey="date" tick={{fontSize:11,fill:"#94A3B8",fontFamily:"Sora"}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11,fill:"#94A3B8",fontFamily:"Sora"}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Area type="monotone" dataKey="count" stroke="#3B7EF8" strokeWidth={2.5} fill="url(#vG)" dot={{r:4,fill:"#3B7EF8",strokeWidth:2,stroke:"#fff"}} name="Visites"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card" data-aos="fade-up" data-aos-delay="60">
              <ChartHeader title="Chiffre d'affaires" subtitle="Revenus dans le temps" iconBg="#ECFDF5" icon={<FaMoneyBillWave size={14} style={{color:"#059669"}}/>}/>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={stats.revenueTimeline}>
                  <defs><linearGradient id="rG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.18}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0FAF6"/><XAxis dataKey="date" tick={{fontSize:11,fill:"#94A3B8",fontFamily:"Sora"}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11,fill:"#94A3B8",fontFamily:"Sora"}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip currency/>}/>
                  <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fill="url(#rG)" dot={{r:4,fill:"#10B981",strokeWidth:2,stroke:"#fff"}} name="Revenu"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="chart-card" data-aos="fade-up">
              <ChartHeader title="Comparaison mensuelle" subtitle="Visites, revenus & nouveaux patients (6 mois)" iconBg="#EEE8FF" icon={<FaChartBar size={14} style={{color:"var(--violet)"}}/>}/>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={stats.monthlyComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FF"/>
                  <XAxis dataKey="month" tick={{fontSize:11,fill:"#94A3B8",fontFamily:"Sora"}} axisLine={false} tickLine={false}/>
                  <YAxis yAxisId="left"  tick={{fontSize:10,fill:"#94A3B8",fontFamily:"Sora"}} axisLine={false} tickLine={false}/>
                  <YAxis yAxisId="right" orientation="right" tick={{fontSize:10,fill:"#94A3B8",fontFamily:"Sora"}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend iconType="circle" iconSize={8} formatter={v=><span style={{fontSize:11,color:"var(--text-2)",fontWeight:600}}>{v}</span>}/>
                  <Bar yAxisId="left" dataKey="visites"     name="Visites"       fill="#3B7EF8" radius={[4,4,0,0]} barSize={14}/>
                  <Bar yAxisId="left" dataKey="newPatients" name="Nouveaux pat." fill="#0ECDB5" radius={[4,4,0,0]} barSize={14}/>
                  <Line yAxisId="right" dataKey="revenue"  name="Revenu (TND)"   stroke="#F59E0B" strokeWidth={2.5} dot={{r:4,fill:"#F59E0B",stroke:"#fff",strokeWidth:2}}/>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card" data-aos="fade-up" data-aos-delay="60">
              <ChartHeader title="Jours les plus actifs" subtitle="Répartition des visites par jour (3 derniers mois)" iconBg="#FFFBEB" icon={<FaCalendarAlt size={14} style={{color:"#D97706"}}/>}/>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.visitsByDay} barSize={26}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FF"/>
                  <XAxis dataKey="day" tick={{fontSize:11,fill:"#94A3B8",fontFamily:"Sora"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:"#94A3B8",fontFamily:"Sora"}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="count" name="Visites" radius={[6,6,0,0]}>
                    {stats.visitsByDay.map((_,idx)=><Cell key={idx} fill={CHART_COLORS[idx%CHART_COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="chart-card" data-aos="fade-up">
              <ChartHeader title="Statut des paiements" subtitle="Payé / attente / impayé" iconBg="#FFFBEB" icon={<FaChartPie size={14} style={{color:"#D97706"}}/>}/>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart><Pie data={stats.paymentDist} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" paddingAngle={3} label={({percent})=>`${(percent*100).toFixed(0)}%`} labelLine={false}>{stats.paymentDist.map((_,idx)=><Cell key={idx} fill={CHART_COLORS[idx%CHART_COLORS.length]}/>)}</Pie><Tooltip/><Legend iconType="circle" iconSize={8} formatter={v=><span style={{fontSize:11,color:"var(--text-2)",fontWeight:600}}>{v}</span>}/></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card" data-aos="fade-up" data-aos-delay="60">
              <ChartHeader title="Statut des rendez-vous" subtitle="Planifiés, terminés, annulés" iconBg="#EEE8FF" icon={<FaChartPie size={14} style={{color:"var(--violet)"}}/>}/>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart><Pie data={stats.appointmentDist} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" paddingAngle={3} label={({percent})=>`${(percent*100).toFixed(0)}%`} labelLine={false}>{stats.appointmentDist.map((_,idx)=><Cell key={idx} fill={["#8B5CF6","#10B981","#F43F5E"][idx%3]}/>)}</Pie><Tooltip/><Legend iconType="circle" iconSize={8} formatter={v=><span style={{fontSize:11,color:"var(--text-2)",fontWeight:600}}>{v}</span>}/></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card" data-aos="fade-up" data-aos-delay="120">
              <ChartHeader title="Groupes sanguins" subtitle="Répartition par groupe sanguin" iconBg="#FFF1F2" icon={<FaTint size={14} style={{color:"#F43F5E"}}/>}/>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart><Pie data={stats.bloodGroups} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" paddingAngle={3} label={({name})=>name} labelLine={false}>{stats.bloodGroups.map((entry,idx)=><Cell key={idx} fill={BLOOD_COLORS[entry.name]||CHART_COLORS[idx%CHART_COLORS.length]}/>)}</Pie><Tooltip/><Legend iconType="circle" iconSize={8} formatter={v=><span style={{fontSize:10,color:"var(--text-2)",fontWeight:600}}>{v}</span>}/></PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="chart-card" data-aos="fade-up">
              <ChartHeader title="Répartition par âge" subtitle="Tranches d'âge des patients" iconBg="#EEF4FF" icon={<FaUsers size={14} style={{color:"var(--accent)"}}/>}/>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.ageDist} barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FF"/><XAxis dataKey="name" tick={{fontSize:11,fill:"#94A3B8",fontFamily:"Sora"}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11,fill:"#94A3B8",fontFamily:"Sora"}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="value" name="Patients" radius={[6,6,0,0]}>{stats.ageDist.map((_,idx)=><Cell key={idx} fill={CHART_COLORS[idx%CHART_COLORS.length]}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card" data-aos="fade-up" data-aos-delay="60">
              <ChartHeader title="Revenu mensuel (12 mois)" subtitle="Évolution des recettes sur l'année" iconBg="#ECFDF5" icon={<FaChartLine size={14} style={{color:"#059669"}}/>}/>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={stats.revenueByMonth}>
                  <defs><linearGradient id="rmG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/><stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0FAF6"/><XAxis dataKey="month" tick={{fontSize:10,fill:"#94A3B8",fontFamily:"Sora"}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:"#94A3B8",fontFamily:"Sora"}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip currency/>}/>
                  <Area type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={2.5} fill="url(#rmG)" dot={{r:3,fill:"#F59E0B",stroke:"#fff",strokeWidth:2}} name="Revenu"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card" data-aos="fade-up" data-aos-delay="120">
              <ChartHeader title="Statut des visites" subtitle="Terminées, planifiées, annulées" iconBg="#ECFDF5" icon={<FaChartPie size={14} style={{color:"#059669"}}/>}/>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart><Pie data={stats.visitStatus} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" paddingAngle={3} label={({percent})=>`${(percent*100).toFixed(0)}%`} labelLine={false}>{stats.visitStatus.map((_,idx)=><Cell key={idx} fill={["#10B981","#3B7EF8","#F43F5E"][idx%3]}/>)}</Pie><Tooltip/><Legend iconType="circle" iconSize={8} formatter={v=><span style={{fontSize:11,color:"var(--text-2)",fontWeight:600}}>{v}</span>}/></PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="chart-card" data-aos="fade-up">
              <ChartHeader title="Top 5 patients" subtitle="Par nombre de visites" iconBg="#FFFBEB" icon={<FaChartBar size={14} style={{color:"#D97706"}}/>}/>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.topPatients.map(p=>({name:`${p.nom} ${p.prenom}`.substring(0,12),visits:p.visites_count}))} barSize={22} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FF" horizontal={false}/>
                  <XAxis type="number" tick={{fontSize:10,fill:"#94A3B8",fontFamily:"Sora"}} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:"var(--text-2)",fontFamily:"Sora",fontWeight:600}} axisLine={false} tickLine={false} width={80}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="visits" radius={[0,8,8,0]} name="Visites" fill="#F59E0B"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card" data-aos="fade-up" data-aos-delay="60">
              <ChartHeader title="Classement des patients" subtitle="Les patients les plus fidèles" iconBg="#EEF4FF" icon={<FaUserInjured size={14} style={{color:"var(--accent)"}}/>}/>
              <div className="space-y-2.5">
                {stats.topPatients.slice(0,5).map((p,i)=>(
                  <div key={i} className="top-row px-4 py-3 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs flex-shrink-0" style={{fontWeight:800,background:i===0?"linear-gradient(135deg,#F59E0B,#D97706)":i===1?"linear-gradient(135deg,#94A3B8,#64748B)":i===2?"linear-gradient(135deg,#D97706,#92400E)":"#EEF4FF",color:i<3?"#fff":"var(--text-2)"}}>{i+1}</div>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs flex-shrink-0 ds-logo-ring" style={{fontWeight:700}}>{p.prenom?.charAt(0)}{p.nom?.charAt(0)}</div>
                    <div className="flex-1 min-w-0"><p className="text-sm truncate" style={{fontWeight:700,color:"var(--text-1)"}}>{p.prenom} {p.nom}</p></div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="mono text-sm" style={{fontWeight:800,color:"var(--accent)"}}>{p.visites_count}</span>
                      <span className="text-xs" style={{color:"var(--text-2)"}}>visites</span>
                    </div>
                  </div>
                ))}
                {!stats.topPatients.length&&<div className="py-10 text-center"><FaUsers className="mx-auto mb-2" size={28} style={{color:"#DDD6FE"}}/><p className="text-sm" style={{color:"var(--text-2)"}}>Aucune donnée</p></div>}
              </div>
            </div>
          </div>

          {stats.recentActivity&&(
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="chart-card" data-aos="fade-up">
                <ChartHeader title="Visites récentes" subtitle="Les 5 dernières consultations" iconBg="#EEF4FF" icon={<FaBriefcaseMedical size={14} style={{color:"var(--accent)"}}/>}/>
                <div className="space-y-2">
                  {(stats.recentActivity.recentVisits||[]).map((v,i)=>(
                    <div key={i} className="activity-row px-4 py-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs flex-shrink-0 ds-logo-ring" style={{fontWeight:700}}>{v.patient?.nom?.charAt(0)||"P"}{v.patient?.prenom?.charAt(0)||""}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{fontWeight:700,color:"var(--text-1)"}}>{v.patient?`${v.patient.nom} ${v.patient.prenom}`:"Patient"}</p>
                        <p className="text-xs mt-0.5 mono" style={{color:"var(--text-2)"}}>{v.date_visite?.split("T")[0]}{v.motif?` · ${v.motif}`:""}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs flex-shrink-0" style={{fontWeight:600,background:v.statut_paiement==="payé"?"#ECFDF5":v.statut_paiement==="en_attente"?"#FFFBEB":"#FFF1F2",color:v.statut_paiement==="payé"?"#065F46":v.statut_paiement==="en_attente"?"#92400E":"#9F1239",border:`1px solid ${v.statut_paiement==="payé"?"#A7F3D0":v.statut_paiement==="en_attente"?"#FDE68A":"#FECDD3"}`}}>
                        {v.montant?`${v.montant} TND`:"—"}
                      </span>
                    </div>
                  ))}
                  {!(stats.recentActivity.recentVisits||[]).length&&<p className="text-center py-8 text-sm" style={{color:"var(--text-2)"}}>Aucune visite récente</p>}
                </div>
              </div>
              <div className="chart-card" data-aos="fade-up" data-aos-delay="60">
                <ChartHeader title="Nouveaux patients" subtitle="Les 5 derniers dossiers créés" iconBg="#ECFDF5" icon={<FaUserPlus size={14} style={{color:"#059669"}}/>}/>
                <div className="space-y-2">
                  {(stats.recentActivity.recentPatients||[]).map((p,i)=>(
                    <div key={i} className="activity-row px-4 py-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs flex-shrink-0" style={{background:"linear-gradient(135deg,#10B981,#059669)",fontWeight:700}}>{p.nom?.charAt(0)}{p.prenom?.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{fontWeight:700,color:"var(--text-1)"}}>{p.nom} {p.prenom}</p>
                        <p className="text-xs mt-0.5" style={{color:"var(--text-2)"}}>{p.age?`${p.age} ans`:"-"}</p>
                      </div>
                      <span className="mono text-xs" style={{color:"var(--text-2)",fontWeight:500}}>{p.created_at?.split("T")[0]}</span>
                    </div>
                  ))}
                  {!(stats.recentActivity.recentPatients||[]).length&&<p className="text-center py-8 text-sm" style={{color:"var(--text-2)"}}>Aucun nouveau patient</p>}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default DoctorStatistics;