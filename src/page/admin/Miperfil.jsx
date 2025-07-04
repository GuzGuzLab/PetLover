import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Administrador/Miperfil.css';
import { FaArrowLeft, FaUserEdit, FaSave, FaTimes, FaLock, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

function PerfilAdministrador() {
  const navigate = useNavigate();
  const [modoEdicion, setModoEdicion] = useState(false);
  const [adminData, setAdminData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    nuevaContrasena: '',
    confirmarContrasena: '',
  });

  useEffect(() => {
    // Simulación: puedes reemplazar esto con una API real
    const datos = {
      nombre: localStorage.getItem('nombre') || 'Administrador Ejemplo',
      email: localStorage.getItem('email') || 'admin@vet.com',
      telefono: '3214567890',
      direccion: 'Calle 123 #45-67',
    };
    setAdminData(prev => ({ ...prev, ...datos }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardar = () => {
    if (
      adminData.nuevaContrasena &&
      adminData.nuevaContrasena !== adminData.confirmarContrasena
    ) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Aquí enviarías los datos actualizados al backend
    console.log('Datos actualizados:', adminData);
    alert('Perfil actualizado correctamente');
    setModoEdicion(false);
  };

  const volverAlMenu = () => {
    navigate('/inicioadmin'); // Asegúrate de que esta ruta coincida con tu configuración
  };

  return (
    <div className="perfil-admin-container">
      <div className="perfil-header">
        <button onClick={volverAlMenu} className="btn-volver">
          <FaArrowLeft /> Volver al Menú
        </button>
        <h2>Mi Perfil de Administrador</h2>
      </div>
      
      <div className="perfil-content">
        <div className="perfil-avatar">
          <div className="avatar-placeholder">
            {adminData.nombre.charAt(0).toUpperCase()}
          </div>
          <h3>{adminData.nombre}</h3>
          <p>Administrador del Sistema</p>
        </div>

        <div className="perfil-form">
          <div className="form-group">
            <label><FaUserEdit /> Nombre:</label>
            <input
              name="nombre"
              type="text"
              value={adminData.nombre}
              onChange={handleChange}
              disabled={!modoEdicion}
            />
          </div>

          <div className="form-group">
            <label><FaEnvelope /> Correo electrónico:</label>
            <input
              name="email"
              type="email"
              value={adminData.email}
              onChange={handleChange}
              disabled={!modoEdicion}
            />
          </div>

          <div className="form-group">
            <label><FaPhone /> Teléfono:</label>
            <input
              name="telefono"
              type="text"
              value={adminData.telefono}
              onChange={handleChange}
              disabled={!modoEdicion}
            />
          </div>

          <div className="form-group">
            <label><FaMapMarkerAlt /> Dirección:</label>
            <input
              name="direccion"
              type="text"
              value={adminData.direccion}
              onChange={handleChange}
              disabled={!modoEdicion}
            />
          </div>

          {modoEdicion && (
            <>
              <div className="form-group">
                <label><FaLock /> Nueva Contraseña:</label>
                <input
                  name="nuevaContrasena"
                  type="password"
                  value={adminData.nuevaContrasena}
                  onChange={handleChange}
                  placeholder="Dejar en blanco para no cambiar"
                />
              </div>

              <div className="form-group">
                <label><FaLock /> Confirmar Contraseña:</label>
                <input
                  name="confirmarContrasena"
                  type="password"
                  value={adminData.confirmarContrasena}
                  onChange={handleChange}
                  placeholder="Repite la nueva contraseña"
                />
              </div>
            </>
          )}

          <div className="perfil-botones">
            {modoEdicion ? (
              <>
                <button onClick={handleGuardar} className="btn-guardar">
                  <FaSave /> Guardar Cambios
                </button>
                <button className="btn-cancelar" onClick={() => setModoEdicion(false)}>
                  <FaTimes /> Cancelar
                </button>
              </>
            ) : (
              <button onClick={() => setModoEdicion(true)} className="btn-editar">
                <FaUserEdit /> Editar Perfil
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerfilAdministrador;