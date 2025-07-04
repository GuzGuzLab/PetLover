import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaPaw, FaCalendarAlt, FaClipboard, FaHome, FaCog,
  FaStethoscope, FaClock
} from 'react-icons/fa';
import '../styles/User.css';
import axios from 'axios';

const UserWelcome = ({ userName }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [mascotas, setMascotas] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    const nombre = localStorage.getItem('nombre') || userName || 'Usuario';
    const email = localStorage.getItem('email') || 'usuario@email.com';
    const doc = localStorage.getItem('doc_pro');

    setUserData({ nombre, email });

    if (doc) {
      const cargarDatos = async () => {
        try {
          const [mascotasRes, vetRes, citasRes] = await Promise.all([
            axios.get(`http://localhost:3000/api/mascotas/propietario/${doc}`),
            axios.get(`http://localhost:3000/api/veterinarios`),
            axios.get(`http://localhost:3000/api/citas/todas/${doc}`)
          ]);

          setMascotas(mascotasRes.data);
          setVeterinarios(vetRes.data);
          console.log("Citas recibidas:", citasRes.data);
          setCitas(citasRes.data);
        } catch (error) {
          console.error("Error al cargar datos:", error);
        }
      };

      cargarDatos();
    }
  }, [userName]);

  const getNombreMascota = (id) => {
    const mascota = mascotas.find(m => m.id === id);
    return mascota ? mascota.nombre : `ID: ${id}`;
  };

  const getNombreVet = (id) => {
    const vet = veterinarios.find(v => v.vet_id === id);
    return vet ? vet.nombre : `ID: ${id}`;
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="user-welcome">
      <h1>¡Bienvenid@, {userData.nombre}!</h1>

      <div className="dashboard-cards">
        {/* Mascotas */}
        <div className="info-card">
          <h2><FaPaw /> Tus Mascotas</h2>
          <div className="pet-list">
            {mascotas.length === 0 ? (
              <p>No tienes mascotas registradas.</p>
            ) : (
              mascotas.map((mascota, index) => (
                <div className="pet-item" key={index}>
                  <div>
                    <h3>{mascota.nombre}</h3>
                    <p>Especie: {mascota.especie || 'Desconocida'}</p>
                    <p>Raza: {mascota.raza || 'Desconocida'}</p>
                    <Link to="/HistorialMedico" className="view-all">Ver Historial  →</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Próximas Citas */}
        <div className="info-card">
          <h2><FaCalendarAlt /> Próximas Citas</h2>
          <div className="pet-list">
            {citas.length === 0 ? (
              <p>No tienes citas próximas</p>
            ) : (
              citas.map((cita, index) => (
                <div className="pet-item" key={index}>
                  <div>
                    <h3>{cita.servicio}</h3>
                    <p><FaPaw /> Mascota: {getNombreMascota(cita.mascota_id)}</p>
                    <p>👨‍⚕️ Veterinario: {getNombreVet(cita.veterinario_id)}</p>
                    <p><FaCalendarAlt /> Fecha: {new Date(cita.fecha).toLocaleDateString("es-CO")}</p>
                    <p><FaClock /> Hora: {cita.hora?.slice(0, 5)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link to="/CitasProximas" className="view-all">Ver calendario →</Link>
        </div>
      </div>
    </div>
  );
};

export default UserWelcome;
