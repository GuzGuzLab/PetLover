import { useState, useEffect } from "react";
import { PlusCircle, Edit, Search, X, ToggleLeft, ToggleRight } from "lucide-react"; // CORREGIDO
import "../../styles/Administrador/ServiciosAdmin.css";
import AdminLayout from "../../layout/AdminLayout";

// Es una buena práctica definir la URL base de la API
const API_BASE_URL = "http://localhost:3000";

function ServiciosAdmin() {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    duracion: "",
  });

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para la edición
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  // Estado para la carga de los botones de estado y notificaciones
  const [loadingStates, setLoadingStates] = useState({});
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // --- Sistema de Notificaciones ---
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Cargar servicios desde la API
  const cargarServicios = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/servicios`);
      if (!response.ok) throw new Error("Error al obtener los servicios");
      const data = await response.json();
      // Mapeamos los datos incluyendo el estado booleano 'activo'
      const serviciosConEstado = data.map(s => ({...s, activo: s.estado === 'Activo'}));
      setServicios(serviciosConEstado);
    } catch (error) {
      console.error("Error:", error);
      showNotification(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  // Manejar cambios en el formulario de AGREGAR
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Enviar el formulario de AGREGAR
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nombre, descripcion, precio, duracion } = formData;

    if (!nombre || !descripcion || !precio || !duracion) {
      showNotification("Todos los campos son obligatorios", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/servicios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          descripcion,
          precio: parseFloat(precio),
          duracion_estimada: parseInt(duracion)
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al registrar el servicio");
      }

      const result = await res.json();
      showNotification(result.message, "success");
      setFormData({ nombre: "", descripcion: "", precio: "", duracion: "" });
      setIsFormVisible(false);
      cargarServicios();
    } catch (error) {
      console.error("Error al registrar el servicio:", error);
      showNotification(error.message, "error");
    }
  };
  
  // --- Funciones para la edición ---

  const handleEditClick = (servicio) => {
    setEditingService({
        id: servicio.id,
        nombre: servicio.nombre,
        descripcion: servicio.descripcion,
        precio: servicio.precio,
        duracion_estimada: servicio.duracion_estimada
    });
    setIsEditModalVisible(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingService(prev => ({
        ...prev,
        [name]: value
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingService) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/servicios/${editingService.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: editingService.nombre,
                descripcion: editingService.descripcion,
                precio: parseFloat(editingService.precio),
                duracion_estimada: parseInt(editingService.duracion_estimada)
            })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "No se pudo actualizar el servicio");
        }

        const result = await res.json();
        showNotification(result.message, "success");
        setIsEditModalVisible(false);
        setEditingService(null);
        cargarServicios();
    } catch (error) {
        console.error("Error al actualizar el servicio:", error);
        showNotification(error.message, "error");
    }
  };

  // --- FUNCIÓN PARA CAMBIAR EL ESTADO ---
  const handleToggleEstado = async (id) => {
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/servicios/${id}/estado`, {
        method: 'PUT',
      });
      if (!res.ok) {
        throw new Error("Error al cambiar el estado del servicio");
      }
      // Actualizar el estado localmente para reflejar el cambio
      setServicios(servicios.map(s => {
        if (s.id === id) {
          const nuevoEstado = !s.activo;
          showNotification(`Servicio ${nuevoEstado ? 'activado' : 'desactivado'}`, "success");
          return { ...s, activo: nuevoEstado };
        }
        return s;
      }));
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      showNotification(error.message, "error");
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleCancelar = () => {
    setFormData({ nombre: "", descripcion: "", precio: "", duracion: "" });
    setIsFormVisible(false);
  };

  const handleAgregarServicio = () => {
    setIsFormVisible(true);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const filteredServicios = servicios.filter(servicio =>
    servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servicio.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="servicios-admin-container">
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <h1 className="servicios-titulo">Administración de Servicios Veterinarios</h1>

        {!isFormVisible && !isEditModalVisible && (
          <button 
            className="btn-primary btn-corto" 
            onClick={handleAgregarServicio}
            style={{ width: '160px', height: '68px', display: 'block', marginLeft: 'auto', padding: '20px', marginBottom: '20px' }} 
          >
            <PlusCircle size={18} /> Agregar Servicio
          </button>
        )}

        {isFormVisible && (
          <div className="servicios-form-container">
            <h2>Agregar Nuevo Servicio</h2>
            <form onSubmit={handleSubmit} className="servicios-form">
              <div className="form-group">
                <label>Nombre del Servicio</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Precio ($)</label>
                  <input type="number" name="precio" value={formData.precio} onChange={handleChange} min="0" step="0.01" required />
                </div>
                <div className="form-group">
                  <label>Duración (min)</label>
                  <input type="number" name="duracion" value={formData.duracion} onChange={handleChange} min="5" required />
                </div>
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn-primary">Agregar Servicio</button>
                <button type="button" className="btn-primary" style={{ background: '#F08080' }} onClick={handleCancelar}>Cancelar</button>
              </div>
            </form>
          </div>
        )}
        
        {isEditModalVisible && editingService && (
            <div className="servicios-form-container">
              <h2>Editar Servicio</h2>
              <form onSubmit={handleUpdateSubmit} className="servicios-form">
                <div className="form-group">
                  <label>Nombre del Servicio</label>
                  <input type="text" name="nombre" value={editingService.nombre} onChange={handleEditChange} required />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea name="descripcion" value={editingService.descripcion} onChange={handleEditChange} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Precio ($)</label>
                    <input type="number" name="precio" value={editingService.precio} onChange={handleEditChange} min="0" step="0.01" required />
                  </div>
                  <div className="form-group">
                    <label>Duración (min)</label>
                    <input type="number" name="duracion_estimada" value={editingService.duracion_estimada} onChange={handleEditChange} min="5" required />
                  </div>
                </div>
                <div className="form-buttons">
                  <button type="submit" className="btn-primary">Guardar Cambios</button>
                  <button type="button" className="btn-primary" style={{ background: '#F08080' }} onClick={() => setIsEditModalVisible(false)}>Cancelar</button>
                </div>
              </form>
            </div>
        )}

        <div className="servicios-list-container">
          <div className="search-container">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar servicios..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <X className="clear-search" onClick={handleClearSearch} />
            )}
          </div>

          {isLoading ? (
            <div className="loading-message">Cargando servicios...</div>
          ) : (
            <div className="servicios-table-container">
              <table className="servicios-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Precio</th>
                    <th>Duración</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServicios.length > 0 ? (
                    filteredServicios.map(servicio => (
                      <tr key={servicio.id} className={!servicio.activo ? "fila-inactiva" : ""}>
                        <td>{servicio.nombre}</td>
                        <td>{servicio.descripcion}</td>
                        <td>${new Intl.NumberFormat('es-CO').format(servicio.precio)}</td>
                        <td>{servicio.duracion_estimada} min</td>
                        <td>
                          <button
                            className={`status-btn ${servicio.activo ? 'active' : 'inactive'}`}
                            onClick={() => handleToggleEstado(servicio.id)}
                            disabled={loadingStates[servicio.id]}
                          >
                            {loadingStates[servicio.id] ? (
                              <span className="spinner-btn"></span>
                            ) : (
                              servicio.activo ? <ToggleRight size={20}/> : <ToggleLeft size={20}/> // CORREGIDO
                            )}
                            {loadingStates[servicio.id] ? 'Cargando...' : (servicio.activo ? 'Activo' : 'Inactivo')}
                          </button>
                        </td>
                        <td className="actions-cell">
                          <button className="btn-editar" title="Editar" onClick={() => handleEditClick(servicio)}>
                            <Edit size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-results">
                        {searchTerm ? "No se encontraron resultados" : "No hay servicios registrados"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default ServiciosAdmin;
