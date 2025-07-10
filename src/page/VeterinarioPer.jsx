"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importa useNavigate para la redirección
import { Home, CalendarPlus, Stethoscope, Users2, Dog, LogOut, PanelLeft, ChevronLeft } from "lucide-react";
import "../styles/VeterinarioPer.css"; 

// Componente reutilizable para las tarjetas de estadísticas
const StatCard = ({ icon, label, value, color, loading }) => (
  <div className="stat-card" style={{ '--accent-color': color }}>
    <div className="stat-card-icon">{icon}</div>
    <div className="stat-card-info">
      {/* Muestra '...' mientras carga, después el valor */}
      <span className="stat-card-value">{loading ? '...' : value}</span>
      <span className="stat-card-label">{label}</span>
    </div>
  </div>
);


const Veterinarios = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] =useState(false);
  const navigate = useNavigate(); // Hook para poder redirigir al usuario
  
  const [dashboardData, setDashboardData] = useState({
    nombreUsuario: 'Dr.',
    estadisticas: {
        citasHoy: 0,
        pacientesAtendidos: 0,
        consultasPendientes: 0,
    }
  });
  const [loading, setLoading] = useState(true);

  // Este 'useEffect' se ejecuta una sola vez cuando el componente se carga
  useEffect(() => {
    // 1. Obtiene el ID del veterinario desde localStorage
    const vet_id = localStorage.getItem('userId'); 

    // 2. Verifica si el ID existe. Si no, el usuario no ha iniciado sesión.
    if (!vet_id) {
      console.error("ID de veterinario no encontrado, redirigiendo al login.");
      navigate('/login'); // Redirige al usuario a la página de login
      return; // Detiene la ejecución del resto del código
    }

    // 3. Si hay un ID, procede a buscar los datos del dashboard
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 4. Usa el ID para construir la URL correcta y llamar a la API
        const response = await fetch(`http://localhost:3000/api/dashboard/stats/${vet_id}`); 
        
        if (!response.ok) {
          throw new Error('No se pudo conectar al servidor o el veterinario no existe');
        }

        const data = await response.json();
        setDashboardData(data); // Guarda los datos recibidos en el estado

      } catch (error) {
        console.error("Error al obtener los datos del dashboard:", error);
        // Si hay un error (ej: el ID no es válido), también lo redirigimos
        navigate('/login');
      } finally {
        setLoading(false); // Detiene la animación de carga
      }
    };

    fetchDashboardData();
  }, [navigate]); // Se añade 'navigate' como dependencia del useEffect

  
  const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

  const handleLogout = () => {
    // Limpia todo el localStorage para una sesión cerrada de forma segura
    localStorage.clear();
    // Redirige al usuario a la página de login
    navigate('/login');
  };

  const menuItems = [
    { icon: CalendarPlus, text: "Citas", to: "/CitasVet", description: "Gestiona citas médicas" },
    { icon: Stethoscope, text: "Consultas", to: "/ConsultasVet", description: "Historial de consultas" },
    { icon: Users2, text: "Usuarios", to: "/UsuarioVet", description: "Administrar usuarios" },
    { icon: Dog, text: "Mascotas", to: "/VetMascotas", description: "Registro de mascotas" },
  ];

  return (
    <div className={`veterinarios-container ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <nav className="vet-sidebar">
        <div className="sidebar-header">
           <span className="sidebar-logo-text">PET LOVERS</span>
        </div>
        <ul>
          {menuItems.map((item) => (
            <li key={item.text} title={isSidebarCollapsed ? item.text : ''}>
              <Link to={item.to}>
                <item.icon className="menu-item-icon" size={22}/>
                <span className="menu-item-text">{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="main-content-wrapper">
        <header className="vet-header">
            <button onClick={toggleSidebar} className="sidebar-toggle-btn" title="Alternar menú">
               {isSidebarCollapsed ? <PanelLeft size={20} /> : <ChevronLeft size={20} />}
            </button>
            <div className="vet-header-right">
                <div className="vet-header-usuario">
                    <span>Veterinario</span>
                    <div className="vet-usuario-avatar">V</div>
                </div>
                <button onClick={handleLogout} className="vet-header-logout" title="Cerrar sesión">
                    <LogOut size={20} />
                    <span className="logout-text">Cerrar sesión</span>
                </button>
            </div>
        </header>

        <main className="vet-content">
            <div className="dashboard-header">
                <h1 className="welcome-title">Bienvenido de nuevo, {loading ? '...' : dashboardData.nombreUsuario}</h1>
                <p className="welcome-subtitle">Aquí tienes un resumen de tu jornada:</p>
                <div className="stats-container">
                    <StatCard 
                        icon={<CalendarPlus size={28} />} 
                        label="Citas para Hoy" 
                        value={dashboardData.estadisticas.citasHoy} 
                        color="#007bff"
                        loading={loading} 
                    />
                    <StatCard 
                        icon={<Users2 size={28} />} 
                        label="Pacientes Atendidos" 
                        value={dashboardData.estadisticas.pacientesAtendidos} 
                        color="#28a745" 
                        loading={loading}
                    />
                    <StatCard 
                        icon={<Stethoscope size={28} />} 
                        label="Consultas Pendientes" 
                        value={dashboardData.estadisticas.consultasPendientes} 
                        color="#ffc107"
                        loading={loading}
                    />
                </div>
            </div>
            <div className="quick-access-container">
                 <h2 className="quick-access-title">Acciones Rápidas</h2>
                 <div className="quick-access-cards">
                    {menuItems.slice(1, 4).map((item) => (
                        <div key={item.text} className="quick-card">
                             <Link to={item.to} className="quick-card-link">
                                <div className="quick-card-icon"><item.icon size={24} /></div>
                                <div className="quick-card-text">
                                    <h3>{item.text}</h3>
                                    <p>{item.description}</p>
                                </div>
                             </Link>
                        </div>
                    ))}
                 </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default Veterinarios;