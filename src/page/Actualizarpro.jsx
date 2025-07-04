import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../styles/Datospro.css';

const Actualizarpro = () => {
  const [datos, setDatos] = useState({
    tipoDocumento: '',
    documento: '',
    nombre: '',
    fechaNacimiento: '',
    telefono: '',
    email: '',
    direccion: '',
    fechaRegistro: '',
    contraseñaActual: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (email) {
      axios.get(`/api/propietarios/email/${email}`)
        .then(res => {
          const {
            tipo_Doc, doc, nombre, fecha_Nac,
            tel, email, direccion, fecha_Regis,
          } = res.data;

          setDatos(prev => ({
            ...prev,
            tipoDocumento: tipo_Doc || '',
            documento: doc || '',
            nombre: nombre || '',
            fechaNacimiento: fecha_Nac || '',
            telefono: tel || '',
            email: email || '',
            direccion: direccion || '',
            fechaRegistro: fecha_Regis || '',
          }));
        })
        .catch(err => {
          console.error('Error al cargar datos:', err);
          Swal.fire('Error', 'No se pudieron cargar los datos del propietario', 'error');
        });
    }
  }, []);

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailOriginal = localStorage.getItem('email');

    try {
      const response = await axios.post('/api/propietarios/verificar-password', {
        email: emailOriginal,
        password: datos.contraseñaActual,
      });

      if (response.data.success) {
        const datosActualizar = {
          tel: datos.telefono,
          email: datos.email,
          direccion: datos.direccion,
        };
        await modifyData(emailOriginal, datosActualizar);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseña incorrecta',
        text: 'Debes recuperar tu contraseña para actualizar tus datos',
        confirmButtonText: 'Ir a recuperar',
        confirmButtonColor: '#2196f3',
      }).then(() => {
        navigate('/recuperarcontraseña');
      });
    }
  };

  const modifyData = async (email, data = {}) => {
    try {
      const response = await axios.put(`/api/propietarios/email/${email}`, data);
      if (response) {
        Swal.fire('Éxito', 'Datos actualizados correctamente', 'success')
          .then(() => {
            if (email !== datos.email) {
              localStorage.setItem('email', datos.email);
            }
            navigate('/Datospro');
          });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Datos no se modificaron',
        confirmButtonText: 'Aceptar',
      });
    }
  };

  return (
    <div className="datospro-container">
      <h2>Actualizar datos</h2>
      <form className="datospro-form" onSubmit={handleSubmit}>
        <label>Tipo de Documento:</label>
        <input type="text" name="tipoDocumento" value={datos.tipoDocumento} readOnly />

        <label>Documento:</label>
        <input type="text" name="documento" value={datos.documento} readOnly />

        <label>Nombre:</label>
        <input type="text" name="nombre" value={datos.nombre} readOnly />

        <label>Fecha de Nacimiento:</label>
        <input type="date" name="fechaNacimiento" value={datos.fechaNacimiento?.split('T')[0]} readOnly />

        <label>Teléfono:</label>
        <input type="text" name="telefono" value={datos.telefono} onChange={handleChange} required />

        <label>Email:</label>
        <input type="email" name="email" value={datos.email} onChange={handleChange} required />

        <label>Dirección:</label>
        <input type="text" name="direccion" value={datos.direccion} onChange={handleChange} required />

        <label>Fecha de Registro:</label>
        <input type="text" name="fechaRegistro" value={new Date(datos.fechaRegistro).toLocaleString()} readOnly />

        <label>Contraseña actual:</label>
        <input
          type="password"
          name="contraseñaActual"
          value={datos.contraseñaActual}
          onChange={handleChange}
          required
          placeholder="Ingresa tu contraseña para confirmar"
        />

        <button className="btn-actualizar" type="submit">Guardar cambios</button>
      </form>
    </div>
  );
};

export default Actualizarpro;
