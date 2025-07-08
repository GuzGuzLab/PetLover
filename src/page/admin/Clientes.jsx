import "../../styles/Administrador/ClienteAdmin.css";
import AdminLayout from "../../layout/AdminLayout";
import { User, AtSign, Phone, Calendar, MapPin, FileText, Edit, Trash2, ToggleLeft, ToggleRight, Search, Plus } from "lucide-react";
import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:3000";

function RegistroClientes() {
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCliente, setEditingCliente] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [loadingStates, setLoadingStates] = useState({});

  // 🚀 Función para cargar los clientes desde la API (SIN MODIFICAR)
  const cargarClientes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Cliente/odtener_clientes`);
      if (!response.ok) throw new Error("Error al obtener clientes");
      const data = await response.json();

      const clientesFormateados = data.map(cliente => ({
        id: cliente.id,
        tipoDocumento: cliente.tipo_Doc,
        documento: cliente.doc,
        nombreCompleto: cliente.nombre,
        fechaNacimiento: cliente.fecha_Nac ? new Date(cliente.fecha_Nac).toISOString().split('T')[0] : null,
        telefono: cliente.tel,
        email: cliente.email,
        direccion: cliente.direccion,
        activo: true, // Mantengo el valor por defecto como true
      }));

      setClientes(clientesFormateados);
    } catch (error) {
      console.error("Error cargando clientes:", error);
      showNotification("Error al cargar clientes", "error");
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // 🔄 Función para actualizar cliente (SIN MODIFICAR)
  const actualizarCliente = async (doc, datosActualizados) => {
    try {
      const fechaFormateada = datosActualizados.fechaNacimiento 
        ? new Date(datosActualizados.fechaNacimiento).toISOString().split('T')[0]
        : null;

      const response = await fetch(`${API_BASE_URL}/api/Cliente/actualizar_cliente/${doc}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo_Doc: datosActualizados.tipoDocumento,
          nombre: datosActualizados.nombreCompleto,
          email: datosActualizados.email,
          tel: datosActualizados.telefono,
          direccion: datosActualizados.direccion,
          fecha_Nac: fechaFormateada,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar cliente');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      throw error;
    }
  };

  // ✏️ Manejar edición de cliente (SIN MODIFICAR)
  const handleEdit = (cliente) => {
    setEditingCliente({
      ...cliente,
      fechaNacimiento: cliente.fechaNacimiento || ""
    });
    setShowEditModal(true);
  };

  // ✅ Guardar cambios editados (SIN MODIFICAR)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await actualizarCliente(editingCliente.documento, editingCliente);
      
      setClientes(clientes.map(c => 
        c.documento === editingCliente.documento ? editingCliente : c
      ));
      
      showNotification("Cliente actualizado correctamente", "success");
      setShowEditModal(false);
      setEditingCliente(null);
      
      cargarClientes();
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  // 🔍 Filtrar clientes por búsqueda (SIN MODIFICAR)
  const filteredClientes = clientes.filter(cliente =>
    cliente.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.documento.includes(searchTerm)
  );

  // 📢 Mostrar notificación (SIN MODIFICAR)
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // ✅ NUEVA FUNCIÓN: Cambiar estado (activo/inactivo) CON API
  const toggleEstado = async (id) => {
    try {
      setLoadingStates(prev => ({ ...prev, [id]: true }));
      
      const cliente = clientes.find(c => c.id === id);
      if (!cliente) return;

      const nuevoEstado = !cliente.activo;

      // Llamar a la nueva API para cambiar estado
      const response = await fetch(`${API_BASE_URL}/api/cliente/toggle_estado/${cliente.documento}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cambiar estado');
      }

      // Actualizar estado local solo si la API responde correctamente
      setClientes(clientes.map(c => 
        c.id === id ? { ...c, activo: nuevoEstado } : c
      ));

      showNotification(
        `Cliente ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
        "success"
      );
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      showNotification(
        error.message.includes('404') 
          ? 'Cliente no encontrado' 
          : 'Error al cambiar estado',
        "error"
      );
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <AdminLayout>
      <div className="clientes-container">
        {/* Notificación */}
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <div className="clientes-header">
          <h1>Panel para la gestión de Clientes</h1>
          <div className="clientes-actions">
            <div className="search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="clientes-table-container">
          <table className="clientes-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Documento</th>
                <th>Nombre Completo</th>
                <th>Fecha Nacimiento</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Dirección</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
              <tbody>
                {filteredClientes.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-clientes">
                      No hay clientes registrados
                    </td>
                  </tr>
                ) : (
                  filteredClientes.map(cliente => (
                    <tr key={cliente.id}>
                      <td>{cliente.id}</td>
                      <td>
                        <div className="documento-cell">
                          <span className="tipo-doc">{cliente.tipoDocumento}</span>
                          {cliente.documento}
                        </div>
                      </td>
                      <td>{cliente.nombreCompleto}</td>
                      <td>{cliente.fechaNacimiento ? new Date(cliente.fechaNacimiento).toLocaleDateString() : 'No especificada'}</td>
                      <td>
                        <div className="telefono-cell">
                          <Phone size={16} />
                          {cliente.telefono || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div className="email-cell">
                          <AtSign size={16} />
                          {cliente.email}
                        </div>
                      </td>
                      <td>
                        <div className="direccion-cell">
                          <MapPin size={16} />
                          {cliente.direccion || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <button 
                          onClick={() => toggleEstado(cliente.id)}
                          disabled={loadingStates[cliente.id]}
                          className={`status-btn ${cliente.activo ? 'active' : 'inactive'}`}
                        >
                          {loadingStates[cliente.id] ? (
                            <span className="spinner"></span>
                          ) : cliente.activo ? (
                            <ToggleRight size={20} />
                          ) : (
                            <ToggleLeft size={20} />
                          )}
                          {loadingStates[cliente.id] ? 'Procesando...' : cliente.activo ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="actions-cell">
                        <button className="btn-edit" onClick={() => handleEdit(cliente)}>
                          <Edit size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

          </table>
        </div>

        {/* Modal de Edición (SIN MODIFICAR) */}
        {showEditModal && editingCliente && (
          <div className="modal-overlay">
            <div className="edit-modal">
              <h2>Editar Cliente</h2>
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label>Tipo Documento:</label>
                  <select
                    value={editingCliente.tipoDocumento}
                    onChange={(e) => setEditingCliente({...editingCliente, tipoDocumento: e.target.value})}
                    required
                  >
                    <option value="CC">Cédula</option>
                    <option value="TI">Tarjeta Identidad</option>
                    <option value="CE">Cédula Extranjería</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Documento:</label>
                  <input 
                    type="text" 
                    value={editingCliente.documento} 
                    readOnly 
                  />
                </div>

                <div className="form-group">
                  <label>Nombre Completo:</label>
                  <input
                    type="text"
                    value={editingCliente.nombreCompleto}
                    onChange={(e) => setEditingCliente({...editingCliente, nombreCompleto: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editingCliente.email}
                    onChange={(e) => setEditingCliente({...editingCliente, email: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono:</label>
                  <input
                    type="tel"
                    value={editingCliente.telefono || ''}
                    onChange={(e) => setEditingCliente({...editingCliente, telefono: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Dirección:</label>
                  <input
                    type="text"
                    value={editingCliente.direccion || ''}
                    onChange={(e) => setEditingCliente({...editingCliente, direccion: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Fecha Nacimiento:</label>
                  <input
                    type="date"
                    value={editingCliente.fechaNacimiento || ''}
                    onChange={(e) => setEditingCliente({
                      ...editingCliente, 
                      fechaNacimiento: e.target.value
                    })}
                  />
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
      </div>
    </AdminLayout>
  );
}

export default RegistroClientes;