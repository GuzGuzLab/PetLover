import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaClock,
  FaPaw,
  FaUserMd
} from 'react-icons/fa';
import axios from 'axios';
import '../styles/UserWelcome.css';

const UserWelcome = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [mascotas, setMascotas] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    const nombre = localStorage.getItem('nombre') || 'Usuario';
    const email = localStorage.getItem('email') || 'usuario@email.com';
    const doc = localStorage.getItem('doc_pro');
    setUserData({ nombre, email });

    if (doc) {
      const cargarDatos = async () => {
        try {
          const [mascotasRes, vetRes, citasRes] = await Promise.all([
            axios.get(`/api/mascotas/propietario/${doc}`),
            axios.get(`/api/veterinarios`),
            axios.get(`/api/citas/todas/${doc}`)
          ]);

          setMascotas(mascotasRes.data);
          setVeterinarios(vetRes.data);
          setCitas(citasRes.data);
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
    <div className="dashboard-page">
      <h1 className="welcome-title">¡Bienvenid@, {userData.nombre}!</h1>

      <section className="dashboard-section">
        <h2 className="section-title">🐾 Mis Mascotas</h2>
        <div className="card-grid">
          {mascotas.length === 0 ? (
            <p className="empty">No tienes mascotas registradas.</p>
          ) : (
            mascotas.map((mascota, index) => (
              <div key={index} className="card">
                <h3>{mascota.nombre}</h3>
                <p><strong>Especie:</strong> {mascota.especie}</p>
                <p><strong>Raza:</strong> {mascota.raza}</p>
                <Link to="/HistorialMedico" className="btn-link">Ver Historial</Link>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">📅 Próximas Citas</h2>
        <div className="card-grid">
          {citas.length === 0 ? (
            <p className="empty">No tienes citas próximas.</p>
          ) : (
            citas.map((cita, index) => (
              <div key={index} className="card cita-card">
                <h3>{cita.servicio}</h3>
                <p><FaPaw /> Mascota: {mascotas.find(m => m.id === cita.mascota_id)?.nombre || 'Desconocida'}</p>
                <p><FaUserMd /> Veterinario: {getNombreVet(cita.veterinario_id)}</p>
                <p><FaCalendarAlt /> {new Date(cita.fecha).toLocaleDateString()}</p>
                <p><FaClock /> {cita.hora?.slice(0, 5)}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default UserWelcome;
