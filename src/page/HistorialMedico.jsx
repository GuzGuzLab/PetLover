import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/HistorialMedico.css'; // Asegúrate de tener este archivo creado

const HistorialMedico = () => {
  const [mascotas, setMascotas] = useState([]);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const doc = localStorage.getItem("doc_pro");
    if (!doc) return;

    axios.get(`http://localhost:3000/api/mascotas/propietario/${doc}`)
      .then(res => setMascotas(res.data))
      .catch(err => console.error('❌ Error al cargar mascotas:', err));
  }, []);

  const cargarHistorial = (idMascota) => {
    setMascotaSeleccionada(idMascota);
    axios.get(`http://localhost:3000/api/historial/${idMascota}`)
      .then(res => setHistorial(res.data))
      .catch(err => console.error('❌ Error al cargar historial:', err));
  };

  return (
    <div className="historial-container">
      <h2>📋 Historial Médico de Mascotas</h2>

      <div className="historial-contenido">
        <div className="panel-mascotas">
          <h3>🐶 Mis Mascotas</h3>
          {mascotas.map(mascota => (
            <button
              key={mascota.id}
              className={`btn-mascota ${mascota.id === mascotaSeleccionada ? 'activo' : ''}`}
              onClick={() => cargarHistorial(mascota.id)}
            >
              {mascota.nombre}
            </button>
          ))}
        </div>

        <div className="panel-historial">
          {mascotaSeleccionada ? (
            historial.length > 0 ? (
              historial.map((item, idx) => (
                <div key={idx} className="historial-item">
                  <p><strong>📅 Fecha:</strong> {new Date(item.fecha).toLocaleDateString()}</p>
                  <p><strong>📝 Motivo:</strong> {item.motivo}</p>
                  <p><strong>🔍 Diagnóstico:</strong> {item.diagnostico}</p>
                  <p><strong>👨‍⚕️ Veterinario:</strong> {item.veterinario}</p>
                </div>
              ))
            ) : (
              <p>❗ No hay historial para esta mascota.</p>
            )
          ) : (
            <p>🔎 Selecciona una mascota para ver su historial médico.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorialMedico;
