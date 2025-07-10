import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles//MisMascotas.css'; // Estilos aparte para mantener limpio el JSX

const MisMascotas = () => {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedDoc = localStorage.getItem('doc_pro');

    if (storedDoc) {
      const fetchMascotas = async () => {
        try {
          const res = await axios.get(`/api/mascotas/propietario/${storedDoc}`);
          console.log('Mascotas recibidas:', res.data);
          setMascotas(res.data);
        } catch (err) {
          console.error('Error al cargar mascotas:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchMascotas();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <p>Cargando mascotas...</p>;

  return (
    <div className="contenedor-mascotas">
      <h2>Mis Mascotas</h2>
      {mascotas.length === 0 ? (
        <p>No tienes mascotas registradas.</p>
      ) : (
        <div className="tarjetas-mascotas">
          {mascotas.map((mascota) => (
            <div className="tarjeta" key={mascota.id}>
              <h3>{mascota.nombre}</h3>
              <p><strong>Especie:</strong> {mascota.especie}</p>
              <p><strong>Raza:</strong> {mascota.raza}</p>
              <p><strong>Color:</strong> {mascota.color}</p>
              <p><strong>Género:</strong> {mascota.genero}</p>
              <p><strong>Tamaño:</strong> {mascota.tamano}</p>
              <p><strong>Peso:</strong> {mascota.peso} kg</p>
              <p><strong>Vacunado:</strong> {mascota.vacunado ? 'Sí' : 'No'}</p>
              {mascota.observaciones && (
                <p><strong>Observaciones:</strong> {mascota.observaciones}</p>
              )}
              <p><strong>Fecha de Nacimiento:</strong> {new Date(mascota.fecha_nac).toLocaleDateString()}</p>
              <p><strong>Estado:</strong> {mascota.estado}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisMascotas;

