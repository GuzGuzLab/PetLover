import AdminLayout from "../../layout/AdminLayout";
import '../../styles/Administrador/InicioAdmin.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus,
  faUsers,
  faUserTie,
  faUserShield,
  faChartLine,
  faCalendarAlt,
  faBell,
  faEnvelope,
  faUserMd
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';

function DashboardAdmin() {
  const navigate = useNavigate();
  const [usuariosRegistrados, setUsuariosRegistrados] = useState(0);
  const [adminsRegistrados, setAdminsRegistrados] = useState(0);
  const [veterinariosRegistrados, setVeterinariosRegistrados] = useState(0);
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(true);

  const stats = {
    clientes: 5,
    citasHoy: 10,
    notificaciones: 5,
    mensajes: 3
  };

  useEffect(() => {
    const nombre = localStorage.getItem('nombre');
    if (nombre) setAdminName(nombre);

    // Función para obtener datos de la API
    const fetchData = async () => {
      try {
        // Obtener usuarios registrados
        const usuariosRes = await fetch('http://localhost:3000/api/admin/usuarios_registrados');
        if (!usuariosRes.ok) throw new Error('Error al obtener usuarios');
        const usuariosData = await usuariosRes.json();
        if (usuariosData && usuariosData[0]?.total_usuarios !== undefined) {
          setUsuariosRegistrados(usuariosData[0].total_usuarios);
        }

        // Obtener administradores registrados
        const adminsRes = await fetch('http://localhost:3000/api/admin/admin_registrados');
        if (!adminsRes.ok) throw new Error('Error al obtener administradores');
        const adminsData = await adminsRes.json();
        if (adminsData && adminsData[0]?.total_administradores !== undefined) {
          setAdminsRegistrados(adminsData[0].total_administradores);
        }

        // Obtener veterinarios registrados
        const vetsRes = await fetch('http://localhost:3000/api/admin/vet_registrados');
        if (!vetsRes.ok) throw new Error('Error al obtener veterinarios');
        const vetsData = await vetsRes.json();
        if (vetsData && vetsData[0]?.total_veterinarios !== undefined) {
          setVeterinariosRegistrados(vetsData[0].total_veterinarios);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error al cargar datos:", err);
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
              <h3>Clientes activos</h3>
              <p className="stat-number">{stats.clientes}</p>
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
              <span>{stats.citasHoy}</span>
              <button>Ver todas</button>
            </div>
            <div className="appointments-list">
              <p>Lista de citas programadas para hoy...</p>
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