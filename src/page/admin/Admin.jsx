import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faSearch, faCheck, faTimes, faToggleOn, faToggleOff } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Administrador/Administrador.css";
import AdminLayout from "../../layout/AdminLayout";

const API_BASE_URL = "http://localhost:3000";

function Administradores() {
  const [administradores, setAdministradores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // 🚀 Función para cargar administradores
  const cargarAdministradores = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/obtener_administradores`);
      if (!response.ok) throw new Error("Error al obtener administradores");
      
      const data = await response.json();
      
      const adminsFormateados = data.map(admin => ({
        id: admin.id,
        doc: admin.doc,
        tipoDocumento: admin.tipo_Doc,
        nombre: admin.nombre,
        email: admin.email,
        telefono: admin.tel,
        direccion: admin.direccion,
        nivelAcceso: admin.nivel_acceso || "medio",
        activo: true
      }));

      setAdministradores(adminsFormateados);
    } catch (error) {
      console.error("Error cargando administradores:", error);
      showNotification("Error al cargar administradores", "error");
    }
  };

  useEffect(() => {
    cargarAdministradores();
  }, []);

  // 🔄 Función para actualizar administrador
    const actualizarAdministrador = async (doc, datosActualizados) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/actualizar_admin/${doc}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tipo_Doc: datosActualizados.tipoDocumento,
            nombre: datosActualizados.nombre,
            email: datosActualizados.email,
            tel: datosActualizados.telefono,
            direccion: datosActualizados.direccion,
            nivel_acceso: datosActualizados.nivelAcceso
          })
        });
      
        // Verifica primero si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(`La API respondió con: ${response.status} - ${text}`);
        }
      
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al actualizar administrador');
        }
      
        return await response.json();
      } catch (error) {
        console.error('Error completo:', error);
        throw new Error(`Error al actualizar: ${error.message}`);
      }
    };

  // ✏️ Manejar edición de administrador
  const handleEdit = (admin) => {
    setEditingAdmin({
      ...admin,
      telefono: admin.telefono || '',
      direccion: admin.direccion || ''
    });
    setShowEditModal(true);
  };

  // ✅ Guardar cambios editados
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await actualizarAdministrador(editingAdmin.doc, editingAdmin);
      
      // Actualizar lista local
      setAdministradores(administradores.map(a => 
        a.doc === editingAdmin.doc ? editingAdmin : a
      ));
      
      showNotification("Administrador actualizado correctamente", "success");
      setShowEditModal(false);
      setEditingAdmin(null);
      
      // Recargar datos para asegurar consistencia
      cargarAdministradores();
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  // 🗑️ Eliminar administrador
  const handleEliminar = async (doc) => {
    const confirmacion = window.confirm("¿Estás seguro de que quieres eliminar este administrador?");
    if (confirmacion) {
      try {
        // Aquí deberías hacer la llamada a tu API para eliminar
        // await fetch(`${API_BASE_URL}/api/admin/eliminar_admin/${doc}`, { method: 'DELETE' });
        
        setAdministradores(administradores.filter(a => a.doc !== doc));
        showNotification("Administrador eliminado correctamente", "success");
      } catch (error) {
        showNotification("Error al eliminar administrador", "error");
      }
    }
  };

  // 🔄 Cambiar estado (activo/inactivo)
  const toggleEstado = (doc) => {
    setAdministradores(administradores.map(admin =>
      admin.doc === doc ? { ...admin, activo: !admin.activo } : admin
    ));
  };

  // 🔍 Filtrar administradores
  const filteredAdmins = administradores.filter(admin =>
    admin.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.doc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📢 Mostrar notificación
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  return (
    <AdminLayout>
      <div className="administradores-container">
        {/* Notificación */}
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            <FontAwesomeIcon icon={notification.type === "success" ? faCheck : faTimes} />
            {notification.message}
          </div>
        )}

        <h1>Administradores del Sistema</h1>

        <div className="controles-superiores">
          <div className="search-bar">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Buscar administradores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="tabla-container">
          <table className="tabla-administradores">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Nivel Acceso</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map(admin => (
                <tr key={admin.doc} className={!admin.activo ? "fila-inactiva" : ""}>
                  <td>
                    <div className="documento-cell">
                      <span className="tipo-doc">{admin.tipoDocumento}</span>
                      {admin.doc}
                    </div>
                  </td>
                  <td>{admin.nombre}</td>
                  <td>{admin.email}</td>
                  <td>{admin.telefono || 'N/A'}</td>
                  <td>
                    <span className={`badge-${admin.nivelAcceso}`}>
                      {admin.nivelAcceso}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => toggleEstado(admin.doc)}
                      className={`status-btn ${admin.activo ? 'active' : 'inactive'}`}
                    >
                      <FontAwesomeIcon icon={admin.activo ? faToggleOn : faToggleOff} />
                      {admin.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="actions-cell">
                    <button onClick={() => handleEdit(admin)} className="btn-edit">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal de Edición */}
        {showEditModal && editingAdmin && (
          <div className="modal-overlay">
            <div className="edit-modal">
              <h2>Editar Administrador</h2>
              <form onSubmit={handleSave}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Documento:</label>
                    <input 
                      type="text" 
                      value={editingAdmin.doc} 
                      readOnly 
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo Documento:</label>
                    <select
                      value={editingAdmin.tipoDocumento}
                      onChange={(e) => setEditingAdmin({...editingAdmin, tipoDocumento: e.target.value})}
                      required
                    >
                      <option value="CC">Cédula</option>
                      <option value="TI">Tarjeta Identidad</option>
                      <option value="CE">Cédula Extranjería</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre:</label>
                    <input
                      type="text"
                      value={editingAdmin.nombre}
                      onChange={(e) => setEditingAdmin({...editingAdmin, nombre: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={editingAdmin.email}
                      onChange={(e) => setEditingAdmin({...editingAdmin, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Teléfono:</label>
                    <input
                      type="tel"
                      value={editingAdmin.telefono || ''}
                      onChange={(e) => setEditingAdmin({...editingAdmin, telefono: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Dirección:</label>
                    <input
                      type="text"
                      value={editingAdmin.direccion || ''}
                      onChange={(e) => setEditingAdmin({...editingAdmin, direccion: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Nivel de Acceso:</label>
                  <select
                    value={editingAdmin.nivelAcceso}
                    onChange={(e) => setEditingAdmin({...editingAdmin, nivelAcceso: e.target.value})}
                    required
                  >
                    <option value="basico">Básico</option>
                    <option value="medio">Medio</option>
                    <option value="alto">Alto</option>
                  </select>
                </div>

                <div className="modal-buttons">
                  <button type="submit" className="btn-save">Guardar</button>
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {filteredAdmins.length === 0 && (
          <p className="sin-resultados">
            {searchTerm
              ? "No se encontraron administradores con ese criterio"
              : "No hay administradores registrados"}
          </p>
        )}
      </div>
    </AdminLayout>
  );
}

export default Administradores;