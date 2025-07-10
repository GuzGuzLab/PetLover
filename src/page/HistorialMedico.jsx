// HistorialMedico.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/HistorialMedico.css';

const HistorialMedico = () => {
  const [mascotas, setMascotas] = useState([]);
  const [historiales, setHistoriales] = useState({});
  const [mascotaActiva, setMascotaActiva] = useState(null); // ID de mascota expandida

  useEffect(() => {
    const doc = localStorage.getItem("doc_pro");
    if (!doc) return;

    const cargarMascotas = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/mascotas/propietario/${doc}`);
        setMascotas(res.data);
      } catch (err) {
        console.error('❌ Error al cargar mascotas:', err);
      }
    };

    cargarMascotas();
  }, []);

  const toggleHistorial = async (idMascota) => {
    if (mascotaActiva === idMascota) {
      setMascotaActiva(null); // Cierra
      return;
    }

    setMascotaActiva(idMascota); // Abre

    if (!historiales[idMascota]) {
      try {
        const res = await axios.get(`http://localhost:3000/api/historial/${idMascota}`);
        setHistoriales(prev => ({ ...prev, [idMascota]: res.data }));
      } catch (err) {
        console.error('❌ Error al cargar historial:', err);
      }
    }
  };

  return (
    <div className="historial-container">
      <h2>📋 Historial Médico de Mascotas</h2>

      <div className="acordeon-historial">
        {mascotas.map(mascota => (
          <div key={mascota.id} className="bloque-mascota">
            <h3
              className="nombre-mascota"
              onClick={() => toggleHistorial(mascota.id)}
              style={{ cursor: 'pointer' }}
            >
              🐾 {mascota.nombre}
            </h3>

            {mascotaActiva === mascota.id && (
              <div className="panel-historial">
                {historiales[mascota.id]?.length > 0 ? (
                  historiales[mascota.id].map((item, idx) => (
                    <div key={idx} className="historial-item">
                      <p><strong>📅 Fecha:</strong> {new Date(item.fecha).toLocaleDateString()}</p>
                      <p><strong>📝 Motivo:</strong> {item.motivo}</p>
                      <p><strong>🔍 Diagnóstico:</strong> {item.diagnostico}</p>
                      <p><strong>👨‍⚕️ Veterinario:</strong> {item.veterinario}</p>
                    </div>
                  ))
                ) : (
                  <p className="vacio">❗ No hay historial registrado para esta mascota.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistorialMedico;
