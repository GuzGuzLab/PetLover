import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/User.css";
import { FaClock, FaCalendarPlus, FaStethoscope, FaPaw, FaTimes } from "react-icons/fa";

const CitasProximas = () => {
  const [citas, setCitas] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      const doc = localStorage.getItem("doc_pro");
      if (!doc) return;

      try {
        const [citasRes, mascotasRes, veterinariosRes] = await Promise.all([
          axios.get(`http://localhost:3000/api/citas/todas/${doc}`),
          axios.get(`http://localhost:3000/api/mascotas/propietario/${doc}`),
          axios.get(`http://localhost:3000/api/veterinarios`)
        ]);

        setCitas(citasRes.data);
        setMascotas(mascotasRes.data);
        setVeterinarios(veterinariosRes.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    cargarDatos();
  }, []);

  const obtenerNombreMascota = (id) => {
    const mascota = mascotas.find(m => m.id === id);
    return mascota ? mascota.nombre : "Mascota";
  };

  const obtenerNombreVeterinario = (id) => {
    const vet = veterinarios.find(v => v.vet_id === id);
    return vet ? vet.nombre : "Veterinario";
  };

  const cancelarCita = async (id, fecha, hora) => {
    const fechaHoraCita = new Date(`${fecha}T${hora}`);
    const ahora = new Date();

    const diferenciaMs = fechaHoraCita - ahora;
    if (diferenciaMs < 60 * 60 * 1000) {
      setMensaje("❌ Solo puedes cancelar la cita con al menos 1 hora de anticipación.");
      return;
    }

    try {
      await axios.put(`http://localhost:3000/api/citas/cancelar/${id}`);
      setCitas(prev => prev.map(c => c.id === id ? { ...c, estado: "cancelada" } : c));
      setMensaje("✅ Cita cancelada correctamente.");
    } catch (error) {
      console.error("Error al cancelar cita:", error);
    }
  };

  const formatearFecha = (f) => new Date(f).toLocaleDateString("es-CO");
  const formatearHora = (h) => h.slice(0, 5);

  return (
    <div className="citas-tarjetas-container">
      <h2>📅 Mis Citas</h2>
      {mensaje && <div className="mensaje">{mensaje}</div>}

      <div className="tarjetas-grid">
        {citas.length === 0 ? (
          <p>No tienes citas registradas.</p>
        ) : (
          citas.map((cita) => (
            <div className="tarjeta-cita" key={cita.id}>
              <div className="tarjeta-header">
                <FaStethoscope /> <strong>{cita.servicio}</strong>
              </div>
              <div className="tarjeta-body">
                <p><FaPaw /> <strong>Mascota:</strong> {obtenerNombreMascota(cita.mascota_id)}</p>
                <p><FaStethoscope /> <strong>Veterinario:</strong> {obtenerNombreVeterinario(cita.veterinario_id)}</p>
                <p><FaCalendarPlus /> <strong>Fecha:</strong> {formatearFecha(cita.fecha)}</p>
                <p><FaClock /> <strong>Hora:</strong> {formatearHora(cita.hora)}</p>
                <p><strong>Estado:</strong> {cita.estado}</p>
              </div>
              {cita.estado === "programada" && (
                <button
                  className="btn-cancelar"
                  onClick={() => cancelarCita(cita.id, cita.fecha, cita.hora)}
                >
                  <FaTimes /> Cancelar
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CitasProximas;