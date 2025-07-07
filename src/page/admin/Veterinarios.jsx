import AdminLayout from "../../layout/AdminLayout";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faSearch, faCheck, faTimes, faToggleOn, faToggleOff } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Administrador/Veterinarios.css";

const API_BASE_URL = "http://localhost:3000";

function Veterinarios() {
  const [veterinarios, setVeterinarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [especialidadFiltro, setEspecialidadFiltro] = useState("");
  const [searchTerm, setSearchTerm] = useState("")
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoDoc, setEditandoDoc] = useState(null); 
  const [nuevoVeterinario, setNuevoVeterinario] = useState({
    doc: "",
    tipo_Doc: "",
    nombre: "",
    especialidad: "",
    email: "",
    telefono: "", 
  });
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [loadingStates, setLoadingStates] = useState({});

  // 🔗 Consumo de la API para cargar veterinarios
  useEffect(() => {
    const cargarVeterinarios = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Vet_Admin/obtener_veterinarios`);
        if (!response.ok) throw new Error("Error al obtener los veterinarios");

        const data = await response.json();

        const veterinariosFormateados = data.map((vet) => ({
          id: vet.doc, 
          doc: vet.doc, 
          tipo_Doc: vet.tipo_Doc, 
          nombre: vet.nombre,
          especialidad: vet.especialidad,
          email: vet.email,
          telefono: vet.tel,
          activo: vet.estado || true // Asumimos true si no viene el estado
        }));
        setVeterinarios(veterinariosFormateados);
      } catch (error) {
        console.error("Error al cargar veterinarios:", error);
        mostrarNotificacion("Error al cargar veterinarios", "error");
      }
    };
    cargarVeterinarios();
  }, []);

  // ✅ NUEVA FUNCIÓN: Cambiar estado (activo/inactivo) CON API
  const toggleEstado = async (doc) => {
    try {
      setLoadingStates(prev => ({ ...prev, [doc]: true }));
      
      const veterinario = veterinarios.find(v => v.doc === doc);
      if (!veterinario) return;

      const nuevoEstado = !veterinario.activo;

      // Llamar a la API para cambiar estado
      const response = await fetch(`${API_BASE_URL}/api/Vet_Admin/toggle_estado/${doc}`, {
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
      setVeterinarios(veterinarios.map(v => 
        v.doc === doc ? { ...v, activo: nuevoEstado } : v
      ));

      mostrarNotificacion(
        `Veterinario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
        "exito"
      );
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      mostrarNotificacion(
        error.message.includes('404') 
          ? 'Veterinario no encontrado' 
          : 'Error al cambiar estado',
        "error"
      );
    } finally {
      setLoadingStates(prev => ({ ...prev, [doc]: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoVeterinario({ ...nuevoVeterinario, [name]: value });
  };

  const mostrarNotificacion = (mensaje, tipo) => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => {
      setNotificacion({ mostrar: false, mensaje: "", tipo: "" });
    }, 3000);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setNuevoVeterinario({
      doc: "",
      tipo_Doc: "",
      nombre: "",
      especialidad: "",
      email: "",
      telefono: "",
      foto: "",
    });
    setEditandoDoc(null); 
  };

  // 🚀 Función para enviar el formulario (Actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { doc, tipo_Doc, nombre, email, especialidad, telefono } = nuevoVeterinario;
    if (!tipo_Doc || !nombre || !email || !especialidad) {
      mostrarNotificacion("Tipo de Documento, Nombre, Email y Especialidad son obligatorios", "error");
      return;
    }

    try {
      if (editandoDoc) {
        const response = await fetch(`${API_BASE_URL}/api/Vet_Admin/actualizar_veterinario/${editandoDoc}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tipo_Doc: tipo_Doc,
            nombre: nombre,
            email: email,
            especialidad: especialidad,
            tel: telefono, 
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.error || "Error al actualizar el veterinario.";
          throw new Error(errorMessage);
        }
        mostrarNotificacion("Veterinario actualizado correctamente", "exito");
        handleCancelar(); 
        const responseReload = await fetch(`${API_BASE_URL}/api/Vet_Admin/obtener_veterinarios`);
        if (!responseReload.ok) throw new Error("Error al recargar veterinarios");
        const dataReload = await responseReload.json();
        setVeterinarios(dataReload.map((vet) => ({
            id: vet.doc,
            doc: vet.doc,
            tipo_Doc: vet.tipo_Doc,
            nombre: vet.nombre,
            especialidad: vet.especialidad,
            email: vet.email,
            telefono: vet.tel,
            foto: vet.foto || "",
            activo: vet.estado || true
        })));
      } else {
        if (!doc) {
          mostrarNotificacion("Número de documento es obligatorio para agregar", "error");
          return;
        }
        const nuevoId = veterinarios.length > 0 ? Math.max(...veterinarios.map((v) => v.id)) + 1 : 1;
        setVeterinarios([...veterinarios, { ...nuevoVeterinario, id: nuevoId, doc: doc, activo: true }]);
        mostrarNotificacion("Veterinario agregado correctamente", "exito");
        handleCancelar();
      }

    } catch (error) {
      console.error("Error en handleSubmit:", error);
      mostrarNotificacion(error.message, "error");
    }
  };

  const handleEditar = (veterinario) => {
    setEditandoDoc(veterinario.doc); 
    setNuevoVeterinario({ 
      ...veterinario, 
      doc: veterinario.doc,
      tipo_Doc: veterinario.tipo_Doc || '',
      telefono: veterinario.telefono || '',
    });
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
      vet.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.especialidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vet.doc && vet.doc.toLowerCase().includes(searchTerm.toLowerCase()));

    const coincideEspecialidad = especialidadFiltro ? vet.especialidad === especialidadFiltro : true;

    return coincideBusqueda && coincideEspecialidad;
  });

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
        {mostrarFormulario && (
          <div className="overlay">
              <form className="formulario-veterinario" onSubmit={handleSubmit}>
                  <div className="form-header">
                      <img src="https://raw.githubusercontent.com/Nore0729/Img-soft-veterinario/refs/heads/main/GuzPet.png" alt="Logo Veterinaria" className="veterinaria-logo" />
                      <h2>{editandoDoc ? "Editar Veterinario" : "Agregar Nuevo Veterinario"}</h2>
                  </div>
                  <div className="form-row">
                      <div className="form-group">
                          <label>Número de Documento:</label>
                          <input
                              type="text"
                              name="doc"
                              value={nuevoVeterinario.doc}
                              onChange={handleChange}
                              required
                              disabled={!!editandoDoc}
                          />
                      </div>
                      <div className="form-group">
                          <label>Tipo de Documento:</label>
                          <input
                              type="text"
                              name="tipo_Doc"
                              value={nuevoVeterinario.tipo_Doc}
                              onChange={handleChange}
                              required
                          />
                      </div>
                  </div>
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

                  <div className="form-buttons">
                      <button type="submit" className="btn-guardar">
                          {editandoDoc ? "Guardar Cambios" : "Agregar Veterinario"}
                      </button>
                      <button type="button" className="btn-cancelar" onClick={handleCancelar}>
                          Cancelar
                      </button>
                  </div>
              </form>
          </div>
      )}

        {/* Tabla de veterinarios */}
        <div className="tabla-container">
          <table className="tabla-veterinarios">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Tipo Doc.</th>
                <th>Nombre</th>
                <th>Especialidad</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {veterinariosFiltrados.map((vet) => (
                <tr key={vet.id}>
                  <td>{vet.doc}</td>
                  <td>{vet.tipo_Doc}</td>
                  <td>{vet.nombre}</td>
                  <td>{vet.especialidad}</td>
                  <td>{vet.email}</td>
                  <td>{vet.telefono || "-"}</td>
                  <td>
                    <button 
                      onClick={() => toggleEstado(vet.doc)}
                      disabled={loadingStates[vet.doc]}
                      className={`status-btn ${vet.activo ? 'active' : 'inactive'}`}
                    >
                      {loadingStates[vet.doc] ? (
                        <span className="spinner"></span>
                      ) : vet.activo ? (
                        <FontAwesomeIcon icon={faToggleOn} />
                      ) : (
                        <FontAwesomeIcon icon={faToggleOff} />
                      )}
                      {loadingStates[vet.doc] ? 'Procesando...' : vet.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="acciones-tabla">
                    <button onClick={() => handleEditar(vet)} className="btn-editar">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {veterinariosFiltrados.length === 0 && (
          <p className="sin-resultados">
            {searchTerm || especialidadFiltro
              ? "No se encontraron veterinarios con ese criterio"
              : "No hay veterinarios registrados"}
          </p>
        )}
      </div>
    </AdminLayout>
  );
}

export default Veterinarios;