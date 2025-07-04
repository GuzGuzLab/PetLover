import AdminLayout from "../../layout/AdminLayout";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faSearch, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Administrador/Veterinarios.css";

const API_BASE_URL = "http://localhost:3000";

function Veterinarios() {
  const [veterinarios, setVeterinarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [especialidadFiltro, setEspecialidadFiltro] = useState("");
  const [searchTerm, setSearchTerm] = useState("")
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoVeterinario, setNuevoVeterinario] = useState({
    nombre: "",
    especialidad: "",
    email: "",
    telefono: "",
    foto: "",
  });
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: "", tipo: "" });

  // 🔗 Consumo de la API
  useEffect(() => {
    const cargarVeterinarios = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/obtener_veterinarios`);
        if (!response.ok) throw new Error("Error al obtener los veterinarios");

        const data = await response.json();

        const veterinariosFormateados = data.map((vet) => ({
          id: vet.id,
          nombre: vet.nombre,
          especialidad: vet.especialidad,
          email: vet.email,
          telefono: vet.tel,
          foto: "", // Puedes agregar lógica para manejar fotos si las tienes
        }));

        setVeterinarios(veterinariosFormateados);
      } catch (error) {
        console.error("Error:", error);
        mostrarNotificacion("Error al cargar veterinarios", "error");
      }
    };

    cargarVeterinarios();
  }, []);

  // 🔧 Funciones de manejo de datos y formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoVeterinario({ ...nuevoVeterinario, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNuevoVeterinario({ ...nuevoVeterinario, foto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const mostrarNotificacion = (mensaje, tipo) => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => {
      setNotificacion({ mostrar: false, mensaje: "", tipo: "" });
    }, 3000);
  };

  const handleAgregar = () => {
    setEditandoId(null);
    setNuevoVeterinario({
      nombre: "",
      especialidad: "",
      email: "",
      telefono: "",
      foto: "",
    });
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setNuevoVeterinario({
      nombre: "",
      especialidad: "",
      email: "",
      telefono: "",
      foto: "",
    });
    setEditandoId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nuevoVeterinario.nombre || !nuevoVeterinario.especialidad || !nuevoVeterinario.email) {
      mostrarNotificacion("Nombre, especialidad y email son obligatorios", "error");
      return;
    }

    if (editandoId) {
      setVeterinarios(
        veterinarios.map((vet) => (vet.id === editandoId ? { ...nuevoVeterinario, id: editandoId } : vet))
      );
      mostrarNotificacion("Veterinario actualizado correctamente", "exito");
    } else {
      const nuevoId = veterinarios.length > 0 ? Math.max(...veterinarios.map((v) => v.id)) + 1 : 1;
      setVeterinarios([...veterinarios, { ...nuevoVeterinario, id: nuevoId }]);
      mostrarNotificacion("Veterinario agregado correctamente", "exito");
    }

    handleCancelar();
  };

  const handleEditar = (veterinario) => {
    setEditandoId(veterinario.id);
    setNuevoVeterinario({ ...veterinario });
    setMostrarFormulario(true);
  };

  const handleEliminar = (id) => {
    const confirmacion = window.confirm("¿Estás seguro de que quieres eliminar este veterinario?");
    if (confirmacion) {
      setVeterinarios(veterinarios.filter((vet) => vet.id !== id));
      mostrarNotificacion("Veterinario eliminado correctamente", "exito");
    }
  };

  const veterinariosFiltrados = veterinarios.filter((vet) => {
    const coincideBusqueda =
      vet.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      vet.especialidad.toLowerCase().includes(busqueda.toLowerCase()) ||
      vet.email.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEspecialidad = especialidadFiltro ? vet.especialidad === especialidadFiltro : true;

    return coincideBusqueda && coincideEspecialidad;
  });

  const especialidades = [...new Set(veterinarios.map((vet) => vet.especialidad))];

  return (
    <AdminLayout>
      <div className="veterinarios">
        <h1>Veterinarios Registrados</h1>
        {notificacion.mostrar && (
          <div className={`notificacion ${notificacion.tipo}`}>
            <FontAwesomeIcon icon={notificacion.tipo === "exito" ? faCheck : faTimes} />
            {notificacion.mensaje}
          </div>
        )}

        {/* Controles de búsqueda */}
        <div className="controles-superiores">
            <input
              type="text"
              placeholder="Buscar veterinarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Formulario */}
        {mostrarFormulario && (
          <form className="formulario-veterinario" onSubmit={handleSubmit}>
            <h2>{editandoId ? "Editar Veterinario" : "Agregar Nuevo Veterinario"}</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Nombre completo:</label>
                <input
                  type="text"
                  name="nombre"
                  value={nuevoVeterinario.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Especialidad:</label>
                <input
                  type="text"
                  name="especialidad"
                  value={nuevoVeterinario.especialidad}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={nuevoVeterinario.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Teléfono:</label>
                <input
                  type="tel"
                  name="telefono"
                  value={nuevoVeterinario.telefono}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Foto:</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {nuevoVeterinario.foto && (
                <img
                  src={nuevoVeterinario.foto}
                  alt="Previsualización"
                  className="preview-image"
                />
              )}
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-guardar">
                {editandoId ? "Guardar Cambios" : "Agregar Veterinario"}
              </button>
              <button type="button" className="btn-cancelar" onClick={handleCancelar}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Tabla de veterinarios */}
        <div className="tabla-container">
          <table className="tabla-veterinarios">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nombre</th>
                <th>Especialidad</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {veterinariosFiltrados.map((vet) => (
                <tr key={vet.id}>
                  <td>
                    <img
                      src={vet.foto || "https://via.placeholder.com/50?text=Sin+imagen"}
                      alt={vet.nombre}
                      className="foto-veterinario"
                    />
                  </td>
                  <td>{vet.nombre}</td>
                  <td>{vet.especialidad}</td>
                  <td>{vet.email}</td>
                  <td>{vet.telefono || "-"}</td>
                  <td className="acciones-tabla">
                    <button onClick={() => handleEditar(vet)} className="btn-editar">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => handleEliminar(vet.id)} className="btn-eliminar">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {veterinariosFiltrados.length === 0 && (
          <p className="sin-resultados">
            {busqueda || especialidadFiltro
              ? "No se encontraron veterinarios con ese criterio"
              : "No hay veterinarios registrados"}
          </p>
        )}
      </div>
    </AdminLayout>
  );
}

export default Veterinarios;
