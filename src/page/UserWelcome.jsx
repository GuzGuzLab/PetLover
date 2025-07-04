import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaPaw, FaCalendarAlt, FaClipboard, FaHome, FaCog
} from 'react-icons/fa';
import '../styles/User.css';

const UserWelcome = ({ userName }) => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    nombre: '',
    email: ''
  });

  const [mascotas, setMascotas] = useState([]);

  useEffect(() => {
    const nombre = localStorage.getItem('nombre') || userName || 'Usuario';
    const email = localStorage.getItem('email') || 'usuario@email.com';
    const doc = localStorage.getItem('doc_pro');
  
    setUserData({ nombre, email });
  
    if (doc) {
      fetch(`/api/mascotas/propietario/${doc}`)  // ← CORREGIDA AQUÍ
        .then(res => res.json())
        .then(data => setMascotas(data))
        .catch(err => console.error("Error al cargar mascotas:", err));
    }
  }, [userName]);
  

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="main-content">
      <h1>¡Bienvenid@, {userData.nombre}!</h1>

      <div className="dashboard-cards">
        <div className="info-card">
          <h2><FaPaw /> Tus Mascotas</h2>
          <div className="pet-list">
            {mascotas.length > 0 ? (
              mascotas.map((mascota, index) => (
                <div className="pet-item" key={index}>
                  <div>
                    <h3>{mascota.nombre}</h3>
                    <p>Especie: {mascota.especie|| 'Desconocida'}</p>
                    <p>Raza: {mascota.raza|| 'Desconocida'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No tienes mascotas registradas.</p>
            )}
          </div>
        </div>

        <div className="info-card">
          <h2><FaCalendarAlt /> Próximas Citas</h2>
          <ul className="appointment-list">
           
          </ul>
          <Link to="/AgendarCita" className="view-all">Ver calendario →</Link>
        </div>
      </div>
    </div>
  );
};

export default UserWelcome;
