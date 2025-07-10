// UserWelcome.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPaw, FaUserMd, FaCalendarAlt, FaClock } from 'react-icons/fa';
import axios from 'axios';
import '../styles/UserWelcome.css';

const UserWelcome = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [mascotas, setMascotas] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [citas, setCitas] = useState([]);
  const [servicios, setServicios] = useState([]);

  useEffect(() => {
    const nombre = localStorage.getItem('nombre') || 'Usuario';
    const email = localStorage.getItem('email') || 'usuario@email.com';
    const doc = localStorage.getItem('doc_pro');
    setUserData({ nombre, email });

    if (doc) {
      const cargarDatos = async () => {
        try {
          const [mascotasRes, vetRes, citasRes, serviciosRes] = await Promise.all([
            axios.get(`/api/mascotas/propietario/${doc}`),
            axios.get(`/api/veterinarios`),
            axios.get(`/api/citas/todas/${doc}`),
            axios.get(`/api/servicios`)
          ]);
          setMascotas(mascotasRes.data);
          setVeterinarios(vetRes.data);
          setCitas(citasRes.data);
          setServicios(serviciosRes.data);
        } catch (error) {
          console.error('Error al cargar datos:', error);
        }
      };
      cargarDatos();
    }
  }, []);

  const getNombreVet = (id) => {
    const vet = veterinarios.find(v => v.vet_id === id);
    return vet ? vet.nombre : 'Veterinario desconocido';
  };

  return (
    <div className="dashboard-page pastel-theme">
      <h1 className="welcome-title">¡Hola, {userData.nombre}! 🐾</h1>

      <div className="summary-cards fade-in">
        <div className="summary-card card-blue">
          <h3>Mascotas</h3>
          <p>{mascotas.length}</p>
        </div>
        <div className="summary-card card-green">
          <h3>Citas</h3>
          <p>{citas.length}</p>
        </div>
<<<<<<< HEAD
=======
        <div className="summary-card card-yellow">
          <h3>Registros</h3>
          <p>1</p>
        </div>
>>>>>>> e799c265f01b5607ab3582d82e3acf4cfa423ba3
      </div>

      <div className="quick-actions fade-in">
        <button onClick={() => navigate('/MisMascotas')} className="action-btn pastel-blue">🐶 Mis Mascotas</button>
        <button onClick={() => navigate('/AgendarCita')} className="action-btn pastel-green">📅 Agendar Cita</button>
        <button onClick={() => navigate('/HistorialMedico')} className="action-btn pastel-purple">📘 Historial</button>
<<<<<<< HEAD
        <button onClick={() => navigate('/Datospro')} className="action-btn pastel-orange">👤 Mi Perfil</button>
=======
        <button onClick={() => navigate('/Perfil')} className="action-btn pastel-orange">👤 Mi Perfil</button>
>>>>>>> e799c265f01b5607ab3582d82e3acf4cfa423ba3
      </div>

      <section className="dashboard-section fade-in-slow">
        <h2 className="section-title">📅 Próximas Citas</h2>
        <div className="card-grid">
          {citas.length === 0 ? (
            <p className="empty">No tienes citas próximas.</p>
          ) : (
            citas.map((cita, index) => (
              <div key={index} className="card cita-card pastel-card">
                <h3>{cita.servicio}</h3>
                <p><FaPaw /> {mascotas.find(m => m.id === cita.mascota_id)?.nombre || 'Desconocida'}</p>
                <p><FaUserMd /> {getNombreVet(cita.veterinario_id)}</p>
                <p><FaCalendarAlt /> {new Date(cita.fecha).toLocaleDateString()}</p>
                <p><FaClock /> {cita.hora?.slice(0, 5)}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="dashboard-section fade-in-slow">
        <h2 className="section-title">🦴 Cuidados y Alimentación</h2>
        <div className="card-grid">
          <div className="info-card tip-card">
            <h4>🍖 Alimentación</h4>
            <p>Ofrece comida adecuada a su edad y tamaño. Evita darle restos de comida humana.</p>
          </div>
          <div className="info-card tip-card">
            <h4>🏃‍♂️ Actividad física</h4>
            <p>Saca a pasear a tu mascota todos los días. El ejercicio mejora su salud y estado de ánimo.</p>
          </div>
          <div className="info-card tip-card">
            <h4>💉 Salud</h4>
            <p>Hazle chequeos veterinarios cada 6 meses. Mantén su calendario de vacunas actualizado.</p>
          </div>
        </div>
      </section>

      <section className="dashboard-section fade-in">
        <div className="quote-card">
          <p className="quote">"El amor más puro a veces tiene cuatro patas y una cola que mueve con alegría."</p>
        </div>
      </section>

      <section className="dashboard-section fade-in">
        <h2 className="section-title">🧼 Servicios Disponibles</h2>
        <div className="card-grid">
          {servicios.length === 0 ? (
            <p className="empty">No hay servicios disponibles en este momento.</p>
          ) : (
            servicios.map((servicio, index) => (
              <div key={index} className="info-card service-card">
                <h4>{servicio.nombre}</h4>
                <p>{servicio.descripcion}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="dashboard-section fade-in">
        <div className="quote-card">
          <p className="quote">"Una mascota no es nuestro todo, pero hace que nuestra vida sea mucho más completa."</p>
        </div>
      </section>
    </div>
  );
};

export default UserWelcome;