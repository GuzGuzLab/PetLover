import { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Search, X } from "lucide-react";
import "../../styles/Administrador/ServiciosAdmin.css";
import AdminLayout from "../../layout/AdminLayout";

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

  // Cargar servicios desde la API
  const cargarServicios = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/servicios`);
      if (!response.ok) throw new Error("Error al obtener los servicios");
      const data = await response.json();
      setServicios(data);
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  // Eliminar un servicio
  const handleEliminar = async (id) => {
    const confirmacion = window.confirm("¿Estás seguro de que quieres eliminar este servicio?");
    if (!confirmacion) return;

    try {
      const res = await fetch(`/api/servicios/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "No se pudo eliminar el servicio");
      }

      const data = await res.json();
      alert(data.message);
      cargarServicios();
    } catch (error) {
      console.error("Error al eliminar el servicio:", error);
      alert(error.message);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nombre, descripcion, precio, duracion } = formData;

    if (!nombre || !descripcion || !precio || !duracion) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      const res = await fetch(`/api/servicios`, {
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
      alert(result.message);
      setFormData({ nombre: "", descripcion: "", precio: "", duracion: "" });
      setIsFormVisible(false);
      cargarServicios();
    } catch (error) {
      console.error("Error al registrar el servicio:", error);
      alert(error.message);
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

  // Filtro por búsqueda
  const filteredServicios = servicios.filter(servicio =>
    servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servicio.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="servicios-admin-container">
        <h1 className="servicios-titulo">Administración de Servicios Veterinarios</h1>

        {!isFormVisible && (
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
            <h2>Agregar nuevo Servicio</h2>
            <form onSubmit={handleSubmit} className="servicios-form">
              <div className="form-group">
                <label>Nombre del Servicio</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Precio ($)</label>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Duración (min)</label>
                  <input
                    type="number"
                    name="duracion"
                    value={formData.duracion}
                    onChange={handleChange}
                    min="5"
                    required
                  />
                </div>
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn-primary">Agregar Servicio</button>
                <button type="button" className="btn-primary" style={{ background: '#F08080' }} onClick={handleCancelar}>
                  Cancelar
                </button>
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
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServicios.length > 0 ? (
                    filteredServicios.map(servicio => (
                      <tr key={servicio.id}>
                        <td>{servicio.nombre}</td>
                        <td>{servicio.descripcion}</td>
                        <td>${servicio.precio}</td>
                        <td>{servicio.duracion_estimada} min</td>
                        <td className="actions-cell">
                          <button className="btn-editar" title="Editar">
                            <Edit size={16} />
                          </button>
                          <button 
                            className="btn-eliminar" 
                            title="Eliminar" 
                            onClick={() => handleEliminar(servicio.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-results">
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
