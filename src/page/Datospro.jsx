import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../styles/Datospro.css';

const Datospro = () => {
  const [datos, setDatos] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (email) {
      axios.get(`/api/propietarios/email/${encodeURIComponent(email)}`)
        .then(response => setDatos(response.data))
        .catch(error => {
          console.error('Error al obtener datos del propietario:', error);
          Swal.fire({
            icon: 'error',
            title: 'No se encontraron datos',
            text: 'No se pudo obtener la información del propietario con ese correo',
            confirmButtonColor: '#2196f3'
          });
        });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Email no encontrado',
        text: 'Por favor, inicia sesión para ver tus datos',
        confirmButtonColor: '#2196f3'
      });
    }
  }, []);

  if (!datos) {
    return <div className="cargando">Cargando datos...</div>;
  }

  const handleActualizar = (e) => {
    e.preventDefault();
    navigate('/Actualizarpro');
  };

  return (
    <div className="datospro-container">
      <h2>Mi cuenta</h2>
      <form className="datospro-form">
        <label>Tipo de Documento:</label>
        <input type="text" value={datos.tipo_Doc} readOnly />

        <label>Documento:</label>
        <input type="text" value={datos.doc} readOnly />

        <label>Nombre:</label>
        <input type="text" value={datos.nombre} readOnly />

        <label>Fecha de Nacimiento:</label>
        <input type="date" value={datos.fecha_Nac?.split('T')[0]} readOnly />

        <label>Teléfono:</label>
        <input type="text" value={datos.tel} readOnly />

        <label>Email:</label>
        <input type="email" value={datos.email} readOnly />

        <label>Dirección:</label>
        <input type="text" value={datos.direccion} readOnly />

        <label>Fecha de Registro:</label>
        <input type="text" value={new Date(datos.fecha_Regis).toLocaleString()} readOnly />

        <button className="btn-actualizar" onClick={handleActualizar}>
          Actualizar datos
        </button>
      </form>
    </div>
  );
};

export default Datospro;
