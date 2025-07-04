import AdminLayout from "../../layout/AdminLayout";
import '../../styles/Administrador/InicioAdmin.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus,
  faUsers,
  faUserPen,
  faUserShield,
  faChartLine,
  faCalendarAlt,
  faBell,
  faEnvelope,
  faUserMd,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';

function DashboardAdmin() {
  const navigate = useNavigate();
  const [usuariosRegistrados, setUsuariosRegistrados] = useState(0);
  const [adminsRegistrados, setAdminsRegistrados] = useState(0);
  const [veterinariosRegistrados, setVeterinariosRegistrados] = useState(0);
  const [clientesRegistrados, setClientesRegistrados] = useState(0);
  const [totalCitas, setTotalCitas] = useState([]); // Estado para todas las citas
  const [citasHoy, setCitasHoy] = useState(0); // Estado para el número de citas de hoy
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(true);

  // Removí stats.citasHoy fijo, ahora se calculará dinámicamente
  const stats = {
    notificaciones: 5,
    mensajes: 3
  };

  useEffect(() => {
    const nombre = localStorage.getItem('nombre');
    if (nombre) setAdminName(nombre);

    const fetchData = async () => {
      try {
        // --- Carga de estadísticas de usuarios ---
        const [usuariosRes, adminsRes, vetsRes, clientesRes] = await Promise.all([
          fetch('http://localhost:3000/api/admin/usuarios_registrados'),
          fetch('http://localhost:3000/api/admin/admin_registrados'),
          fetch('http://localhost:3000/api/admin/vet_registrados'),
          fetch('http://localhost:3000/api/admin/clientes_registrados')
        ]);

        const [usuariosData, adminsData, vetsData, clientesData] = await Promise.all([
          usuariosRes.json(),
          adminsRes.json(),
          vetsRes.json(),
          clientesRes.json()
        ]);

        if (usuariosRes.ok && usuariosData[0]?.total_usuarios !== undefined) {
          setUsuariosRegistrados(usuariosData[0].total_usuarios);
        } else {
          console.error("Error al obtener usuarios:", usuariosData);
        }
        if (adminsRes.ok && adminsData[0]?.total_administradores !== undefined) {
          setAdminsRegistrados(adminsData[0].total_administradores);
        } else {
          console.error("Error al obtener administradores:", adminsData);
        }
        if (vetsRes.ok && vetsData[0]?.total_veterinarios !== undefined) {
          setVeterinariosRegistrados(vetsData[0].total_veterinarios);
        } else {
          console.error("Error al obtener veterinarios:", vetsData);
        }
        if (clientesRes.ok && clientesData[0]?.total_clientes !== undefined) {
          setClientesRegistrados(clientesData[0].total_clientes);
        } else {
          console.error("Error al obtener clientes:", clientesData);
        }

        // --- Nueva llamada API para obtener todas las citas ---
        // Asumiendo que tu ruta para obtener todas las citas es http://localhost:3000/citas
        const citasRes = await fetch('http://localhost:3000/citas');
        if (!citasRes.ok) throw new Error('Error al obtener citas');
        const citasData = await citasRes.json();
        setTotalCitas(citasData); // Guarda todas las citas

        // --- Calcular citas para hoy ---
        const today = new Date();
        // Ajusta la fecha actual a la zona horaria local de Soacha, Cundinamarca, Colombia (UTC-5)
        // Esto es importante para que la comparación de fechas sea precisa y no dependa del horario UTC del servidor.
        const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const citasDeHoy = citasData.filter(cita => {
            // Asumiendo que la fecha de la cita viene en un formato que puede ser convertido a Date.
            // Si tu campo de fecha_cita en la base de datos es un DATE o DATETIME,
            // JavaScript Date.parse() debería manejarlo bien, pero es mejor estandarizar.
            const citaDate = new Date(cita.fecha_cita);
            const citaDateString = `${citaDate.getFullYear()}-${String(citaDate.getMonth() + 1).padStart(2, '0')}-${String(citaDate.getDate()).padStart(2, '0')}`;
            return citaDateString === todayString;
        });
        setCitasHoy(citasDeHoy.length); // Actualiza el estado con el conteo de citas de hoy

        setLoading(false);
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNuevoUsuarioClick = () => {
    navigate("/FormularioUsu");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-dashboard">
          <div className="loading-container">
            <p>Cargando datos...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <header className="dashboard-header">
          <div>
            <h1>Bienvenido, {adminName}</h1>
            <p>Aquí tienes un resumen de la actividad del sistema</p>
          </div>
          <div className="header-icons">
            <div className="notification-badge">
              <FontAwesomeIcon icon={faBell} />
              <span>{stats.notificaciones}</span>
            </div>
            <div className="notification-badge">
              <FontAwesomeIcon icon={faEnvelope} />
              <span>{stats.mensajes}</span>
            </div>
          </div>
        </header>

        {/* Estadísticas principales */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div className="stat-info">
              <h3>Usuarios registrados</h3>
              <p className="stat-number">{usuariosRegistrados}</p>
              <p className="stat-trend positive">↑ 12% este mes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon clients">
              <FontAwesomeIcon icon={faUserTie} />
            </div>
            <div className="stat-info">
              <h3>Clientes registrados</h3>
              <p className="stat-number">{clientesRegistrados}</p>
              <p className="stat-trend positive">↑ 5% este mes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon vets">
              <FontAwesomeIcon icon={faUserMd} />
            </div>
            <div className="stat-info">
              <h3>Veterinarios registrados</h3>
              <p className="stat-number">{veterinariosRegistrados}</p>
              <p className="stat-trend positive">↑ 8% este mes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon admins">
              <FontAwesomeIcon icon={faUserShield} />
            </div>
            <div className="stat-info">
              <h3>Administradores</h3>
              <p className="stat-number">{adminsRegistrados}</p>
              <p className="stat-trend neutral">→ Sin cambios</p>
            </div>
          </div>
        </div>

        <section className="quick-actions">
          <h2>Acciones Rápidas</h2>
          <div className="action-buttons">
            <button className="action-btn" onClick={handleNuevoUsuarioClick}>
              <FontAwesomeIcon icon={faUserPlus} />
              Nuevo Usuario
            </button>
          </div>
        </section>

        <div className="dashboard-bottom">
          <div className="appointments-card">
            <h2>
              <FontAwesomeIcon icon={faCalendarAlt} />
              Citas para hoy
            </h2>
            <div className="appointments-count">
              {/* Ahora muestra el valor dinámico de citasHoy */}
              <span>{citasHoy}</span> 
              <button>Ver todas</button>
            </div>
            <div className="appointments-list">
              {citasHoy > 0 ? (
                <p>Hay {citasHoy} citas programadas para hoy.</p>
              ) : (
                <p>No hay citas programadas para hoy.</p>
              )}
              {/* Aquí podrías mapear y mostrar las citas de hoy si las necesitaras detalladas */}
            </div>
          </div>

          <div className="activity-card">
            <h2>
              <FontAwesomeIcon icon={faChartLine} />
              Actividad reciente
            </h2>
            <div className="activity-list">
              <p>Últimas acciones en el sistema...</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default DashboardAdmin;