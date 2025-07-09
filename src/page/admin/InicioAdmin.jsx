import AdminLayout from "../../layout/AdminLayout";
import '../../styles/Administrador/InicioAdmin.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus, faUsers, faUserShield, faChartLine, faCalendarAlt,
  faBell, faEnvelope, faUserMd, faUserTie, faChevronUp, 
  faChevronDown, faEquals, faRefresh, faCog
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

function DashboardAdmin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    usuarios: { total: 0, growth: 0 },
    admins: { total: 0, growth: 0 },
    veterinarios: { total: 0, growth: 0 },
    clientes: { total: 0, growth: 0 },
    citas: { total: 0, hoy: 0 }
  });
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    unread: [],
    all: [],
    count: 0
  });
  const [darkMode, setDarkMode] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);

  const [chartData, setChartData] = useState({
    userGrowth: {
      labels: [],
      datasets: [{
        label: 'Registros mensuales',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }]
    },
    userDistribution: {
      labels: ['Clientes', 'Veterinarios', 'Administradores'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: [
          'rgba(255, 99, 133, 0.72)',
          'rgba(54, 163, 235, 0.69)',
          'rgba(255, 207, 86, 0.57)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      }]
    }
  });

  // Función para marcar notificación como leída
  const markAsRead = async (id) => {
    try {
      const userId = localStorage.getItem('userId'); // Obtener el ID del admin del localStorage

      const response = await fetch(`http://localhost:3000/api/admin/notificaciones/marcar-leida/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuarioId: userId })
      });

      if (!response.ok) throw new Error('Error al actualizar notificación');

      const data = await response.json();

      if (data.success) {
        // Actualizar el estado local
        setNotifications(prev => {
          const updatedAll = prev.all.map(n => 
            n.id === id ? { ...n, leida: true } : n
          );
          return {
            all: updatedAll,
            unread: updatedAll.filter(n => !n.leida),
            count: updatedAll.filter(n => !n.leida).length
          };
        });
      }
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  useEffect(() => {
    const nombre = localStorage.getItem('nombre');
    if (nombre) setAdminName(nombre);

    const fetchData = async () => {
      try {
        // Llamadas API existentes
        const [usuariosRes, adminsRes, vetsRes, clientesRes] = await Promise.all([
          fetch('http://localhost:3000/api/admin/usuarios_registrados'),
          fetch('http://localhost:3000/api/admin/admin_registrados'),
          fetch('http://localhost:3000/api/Vet_Admin/vet_registrados'),
          fetch('http://localhost:3000/api/Cliente/clientes_registrados')
        ]);

        const [usuariosData, adminsData, vetsData, clientesData] = await Promise.all([
          usuariosRes.json(),
          adminsRes.json(),
          vetsRes.json(),
          clientesRes.json()
        ]);

        // Obtener datos del mes anterior (simulado para el ejemplo)
        const lastMonthData = {
          usuarios: Math.max(0, usuariosData[0]?.total_usuarios - 5 || 0),
          admins: adminsData[0]?.total_administradores || 0,
          veterinarios: Math.max(0, vetsData[0]?.total_veterinarios - 2 || 0),
          clientes: Math.max(0, clientesData[0]?.total_clientes - 3 || 0)
        };

        // Calcular crecimiento
        const calculateGrowth = (current, previous) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return Math.round(((current - previous) / previous) * 100);
        };

        // Actualizar estado con datos reales
        setStats({
          usuarios: {
            total: usuariosData[0]?.total_usuarios || 0,
            growth: calculateGrowth(usuariosData[0]?.total_usuarios || 0, lastMonthData.usuarios)
          },
          admins: {
            total: adminsData[0]?.total_administradores || 0,
            growth: calculateGrowth(adminsData[0]?.total_administradores || 0, lastMonthData.admins)
          },
          veterinarios: {
            total: vetsData[0]?.total_veterinarios || 0,
            growth: calculateGrowth(vetsData[0]?.total_veterinarios || 0, lastMonthData.veterinarios)
          },
          clientes: {
            total: clientesData[0]?.total_clientes || 0,
            growth: calculateGrowth(clientesData[0]?.total_clientes || 0, lastMonthData.clientes)
          },
          citas: { total: 0, hoy: 0 }
        });

        // Actualizar datos para gráficos
        setChartData(prev => ({
          ...prev,
          userDistribution: {
            ...prev.userDistribution,
            datasets: [{
              ...prev.userDistribution.datasets[0],
              data: [
                clientesData[0]?.total_clientes || 0,
                vetsData[0]?.total_veterinarios || 0,
                adminsData[0]?.total_administradores || 0
              ]
            }]
          }
        }));

        // Obtener citas
        const citasRes = await fetch('http://localhost:3000/citas');
        if (!citasRes.ok) throw new Error('Error al obtener citas');
        const citasData = await citasRes.json();
        
        const today = new Date();
        const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const citasDeHoy = citasData.filter(cita => {
          const citaDate = new Date(cita.fecha_cita);
          const citaDateString = `${citaDate.getFullYear()}-${String(citaDate.getMonth() + 1).padStart(2, '0')}-${String(citaDate.getDate()).padStart(2, '0')}`;
          return citaDateString === todayString;
        });

        // Actualizar estado de citas
        setStats(prev => ({
          ...prev,
          citas: {
            total: citasData.length,
            hoy: citasDeHoy.length
          }
        }));

        // Obtener notificaciones
        const notificacionesRes = await fetch('http://localhost:3000/api/notificaciones');
        if (!notificacionesRes.ok) throw new Error('Error al obtener notificaciones');
        const notificacionesData = await notificacionesRes.json();
        
        setNotifications({
          unread: notificacionesData.filter(n => !n.leida),
          all: notificacionesData,
          count: notificacionesData.filter(n => !n.leida).length
        });

        setRecentActivity([
          { id: 1, action: 'Usuario registrado', user: 'Juan Pérez', time: '10:30 AM' },
          { id: 2, action: 'Cita agendada', user: 'Clínica Veterinaria', time: '09:45 AM' }
        ]);

        setLoading(false);
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
        setLoading(false);
      }
    };

    fetchData();

    // Simular actualización periódica
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNuevoUsuarioClick = () => {
    navigate("/FormularioUsu");
  };

  const handleViewAllAppointments = () => {
    navigate("/citas");
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const getTrendIcon = (growth) => {
    if (growth > 0) return <FontAwesomeIcon icon={faChevronUp} />;
    if (growth < 0) return <FontAwesomeIcon icon={faChevronDown} />;
    return <FontAwesomeIcon icon={faEquals} />;
  };

  const getTrendClass = (growth) => {
    if (growth > 0) return 'positive';
    if (growth < 0) return 'negative';
    return 'neutral';
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
      <div className={`admin-dashboard ${darkMode ? 'dark-mode' : ''}`}>
        <header className="dashboard-header">
          <div>
            <h1>Bienvenido, {adminName}</h1>
            <p>Aquí tienes un resumen de la actividad del sistema</p>
          </div>
          <div className="header-controls">
            <button className="refresh-btn" onClick={handleRefresh}>
              <FontAwesomeIcon icon={faRefresh} />
            </button>
            <button className="settings-btn" onClick={() => setDarkMode(!darkMode)}>
              <FontAwesomeIcon icon={faCog} />
            </button>
            <div className="notification-badge">
              <FontAwesomeIcon icon={faBell} />
              {notifications.count > 0 && <span>{notifications.count}</span>}
              <div className="notification-dropdown">
                {notifications.all.length === 0 ? (
                  <div className="notification-item">
                    <p>No hay notificaciones</p>
                  </div>
                ) : (
                  notifications.all.slice(0, 5).map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notification-item ${notif.leida ? '' : 'unread'}`}
                      onClick={() => !notif.leida && markAsRead(notif.id)}
                    >
                      <p>{notif.mensaje || notif.titulo}</p>
                      <small>
                        {new Date(notif.fecha_creacion).toLocaleString()}
                      </small>
                    </div>
                  ))
                )}
                {notifications.all.length > 5 && (
                  <div className="notification-view-all">
                    <button onClick={() => navigate('/notificaciones')}>
                      Ver todas las notificaciones
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Resto del código permanece igual */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div className="stat-info">
              <h3>Usuarios registrados</h3>
              <p className="stat-number">{stats.usuarios.total}</p>
              <p className={`stat-trend ${getTrendClass(stats.usuarios.growth)}`}>
                {getTrendIcon(stats.usuarios.growth)} {Math.abs(stats.usuarios.growth)}% este mes
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon clients">
              <FontAwesomeIcon icon={faUserTie} />
            </div>
            <div className="stat-info">
              <h3>Clientes registrados</h3>
              <p className="stat-number">{stats.clientes.total}</p>
              <p className={`stat-trend ${getTrendClass(stats.clientes.growth)}`}>
                {getTrendIcon(stats.clientes.growth)} {Math.abs(stats.clientes.growth)}% este mes
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon vets">
              <FontAwesomeIcon icon={faUserMd} />
            </div>
            <div className="stat-info">
              <h3>Veterinarios registrados</h3>
              <p className="stat-number">{stats.veterinarios.total}</p>
              <p className={`stat-trend ${getTrendClass(stats.veterinarios.growth)}`}>
                {getTrendIcon(stats.veterinarios.growth)} {Math.abs(stats.veterinarios.growth)}% este mes
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon admins">
              <FontAwesomeIcon icon={faUserShield} />
            </div>
            <div className="stat-info">
              <h3>Administradores</h3>
              <p className="stat-number">{stats.admins.total}</p>
              <p className={`stat-trend ${getTrendClass(stats.admins.growth)}`}>
                {getTrendIcon(stats.admins.growth)} {Math.abs(stats.admins.growth)}% este mes
              </p>
            </div>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart-card">
            <h3>Distribución de usuarios</h3>
            <div className="chart-wrapper">
              <Pie 
                data={chartData.userDistribution} 
                options={{ 
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }} 
              />
            </div>
          </div>
          <div className="chart-card">
            <h3>Registros mensuales</h3>
            <div className="chart-wrapper">
              <Bar 
                data={chartData.userGrowth} 
                options={{ 
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
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
              <span>{stats.citas.hoy}</span> 
              <button onClick={handleViewAllAppointments}>Ver todas</button>
            </div>
            <div className="appointments-list">
              {stats.citas.hoy > 0 ? (
                <p>Hay {stats.citas.hoy} citas programadas para hoy.</p>
              ) : (
                <p>No hay citas programadas para hoy.</p>
              )}
            </div>
          </div>

          <div className="activity-card">
            <h2>
              <FontAwesomeIcon icon={faChartLine} />
              Actividad reciente
            </h2>
            <div className="activity-list">
              {recentActivity.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-content">
                    <strong>{activity.action}</strong>
                    <span>{activity.user}</span>
                  </div>
                  <small>{activity.time}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default DashboardAdmin;