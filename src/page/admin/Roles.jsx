import { useState, useEffect } from "react";
import MenuAdmin from "./MenuAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPen, faTrash, faCheck, faTimes, faUserCog, faEdit } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Administrador/Roles.css";

// URL base de la API
const API_BASE_URL = "http://localhost:3000";

function Roles() {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarFormularioRol, setMostrarFormularioRol] = useState(false);
  const [nuevoRol, setNuevoRol] = useState({ nom_rol: "", descripcion: "" });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [rolEditando, setRolEditando] = useState(null);
  const [mostrarTablaAsignar, setMostrarTablaAsignar] = useState(false);
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: "", tipo: "" });

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/roles`);
      if (!response.ok) throw new Error("No se pudieron cargar los roles.");
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error("Error en cargarRoles:", error);
      mostrarNotificacion(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/obtener_Usuarios`);
      if (!response.ok) throw new Error("No se pudieron cargar los usuarios.");
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error en cargarUsuarios:", error);
      mostrarNotificacion(error.message, "error");
    }
  };

  const handleGuardarRol = async (e) => {
    e.preventDefault();
    if (!nuevoRol.nom_rol || !nuevoRol.descripcion) {
      mostrarNotificacion("Nombre y descripción son obligatorios", "error");
      return;
    }
    setIsSaving(true);

    const url = modoEdicion
      ? `${API_BASE_URL}/api/admin/roles/${rolEditando.id}`
      : `${API_BASE_URL}/api/admin/roles`;
    const method = modoEdicion ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoRol),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Error al ${modoEdicion ? 'actualizar' : 'crear'} el rol`);
      if (modoEdicion) {
        setRoles(roles.map(rol => (rol.id === rolEditando.id ? { ...rol, ...nuevoRol } : rol)));
        mostrarNotificacion("Rol actualizado correctamente", "exito");
      } else {
        setRoles([data, ...roles]);
        mostrarNotificacion("Rol creado correctamente", "exito");
      }
      handleCancelarRol();
    } catch (error) {
      console.error("Error en handleGuardarRol:", error);
      mostrarNotificacion(error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEliminarRol = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este rol?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/roles/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el rol");
      }
      setRoles(roles.filter(rol => rol.id !== id));
      mostrarNotificacion("Rol eliminado correctamente", "exito");
    } catch (error) {
      console.error("Error en handleEliminarRol:", error);
      mostrarNotificacion(error.message, "error");
    }
  };

  const handleRolChange = (e) => {
    const { name, value } = e.target;
    setNuevoRol(prev => ({ ...prev, [name]: value }));
  };

  const handleEditarRol = (rol) => {
    setModoEdicion(true);
    setRolEditando(rol);
    setNuevoRol({ nom_rol: rol.nom_rol, descripcion: rol.descripcion });
    setMostrarFormularioRol(true);
  };

  const handleCrearNuevoRol = () => {
    setModoEdicion(false);
    setRolEditando(null);
    setNuevoRol({ nom_rol: "", descripcion: "" });
    setMostrarFormularioRol(true);
  };

  const handleCancelarRol = () => {
    setMostrarFormularioRol(false);
    setModoEdicion(false);
    setNuevoRol({ nom_rol: "", descripcion: "" });
    setRolEditando(null);
  };

  const handleRoleChange = (roleId) => {
    setRolesSeleccionados(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleAsignarRoles = async () => {
  if (!usuarioSeleccionado || rolesSeleccionados.length === 0) {
    mostrarNotificacion("Selecciona un usuario y al menos un rol", "error");
    return;
  }

  try {
    // Verificar qué roles estamos asignando para debug
    const rolesParaAsignar = roles.filter(rol => rolesSeleccionados.includes(rol.id));
    console.log("Roles a asignar:", rolesParaAsignar.map(r => r.nom_rol));

    const response = await fetch(`${API_BASE_URL}/api/admin/asignar_roles/${usuarioSeleccionado.doc}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        rolesSeleccionados,
        asignado_por: 1, // ID del admin autenticado
        especialidad: "General", // Valor por defecto para veterinarios
        nivel_acceso: "alto" // Valor por defecto para administradores
      })
    });

    // Verificar si la respuesta es JSON
    const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(`El servidor respondió con: ${text.substring(0, 100)}...`);
        }
      
        const data = await response.json();
      
        if (!response.ok) {
          throw new Error(data.error || "No se pudieron asignar los roles.");
        }
      
        mostrarNotificacion("Roles asignados correctamente", "exito");
        setRolesSeleccionados([]);
        setUsuarioSeleccionado(null);
      } catch (error) {
        console.error("Error al asignar roles:", error);
        mostrarNotificacion(error.message.includes('<!DOCTYPE') 
          ? "Error en el servidor. Verifica la consola." 
          : error.message, 
        "error");
      }
    };

  const handleMostrarAsignar = async () => {
    await cargarUsuarios();
    setMostrarTablaAsignar(true);
  };

  const handleCancelarAsignar = () => {
    setMostrarTablaAsignar(false);
    setUsuarios([]);
    setRolesSeleccionados([]);
    setUsuarioSeleccionado(null);
  };

  const mostrarNotificacion = (mensaje, tipo) => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => setNotificacion({ mostrar: false, mensaje: "", tipo: "" }), 3000);
  };

  if (isLoading) {
    return (
      <MenuAdmin>
        <div className="admin-container"><h1>Cargando...</h1></div>
      </MenuAdmin>
    );
  }

  return (
    <MenuAdmin>
      <div className="admin-container">
        <main className="admin-main">
          <div className="roles-container">
            <h1>Gestión de Roles y Asignaciones</h1>
            {notificacion.mostrar && (
              <div className={`notificacion ${notificacion.tipo}`}>
                <FontAwesomeIcon icon={notificacion.tipo === "exito" ? faCheck : faTimes} /> {notificacion.mensaje}
              </div>
            )}

            {mostrarTablaAsignar ? (
              <div className="seccion-asignar-roles">
                <div className="header-asignar">
                  <h2>Asignar Rol a Usuario</h2>
                  <button onClick={handleCancelarAsignar} className="btn-volver">Volver a Roles</button>
                </div>
                <div className="tabla-responsive">
                  <table className="tabla-asignar-usuarios">
                    <thead>
                      <tr>
                        <th>ID</th><th>Tipo Doc.</th><th>Documento</th><th>Nombre</th><th>Email</th><th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map(usuario => (
                        <tr key={usuario.id}>
                          <td>{usuario.id}</td>
                          <td>{usuario.tipo_Doc}</td>
                          <td>{usuario.doc}</td>
                          <td>{usuario.nombre}</td>
                          <td>{usuario.email}</td>
                          <td>
                            <button className="btn-asignar" onClick={() => setUsuarioSeleccionado(usuario)}>
                              <FontAwesomeIcon icon={faEdit} /> Asignar Rol
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {usuarioSeleccionado && (
                  <div className="roles-seleccionados">
                    <h3>Asignar Roles a: {usuarioSeleccionado.nombre}</h3>
                    <div className="roles-lista">
                      {roles.map(rol => (
                        <div key={rol.id} className="rol-item">
                          <input
                            type="checkbox"
                            id={`rol-${rol.id}`}
                            checked={rolesSeleccionados.includes(rol.id)}
                            onChange={() => handleRoleChange(rol.id)}
                          />
                          <label htmlFor={`rol-${rol.id}`}>{rol.nom_rol}</label>
                        </div>
                      ))}
                    </div>
                    <button onClick={handleAsignarRoles} className="btn-asignar-roles">
                      Asignar Roles
                    </button>
                    <button
                        className="btn-cancelar-asignacion"
                        onClick={() => {
                          setUsuarioSeleccionado(null);
                          setRolesSeleccionados([]);
                        }}
                      >
                        Cancelar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="seccion-roles">
                <div className="header-roles">
                  <h2>Administrar Roles</h2>
                  {!mostrarFormularioRol && (
                    <div className="header-botones">
                      <button onClick={handleCrearNuevoRol} className="btn-nuevo-rol">
                        <FontAwesomeIcon icon={faPlus} /> Crear Nuevo Rol
                      </button>
                      <button onClick={handleMostrarAsignar} className="btn-asignar-rol">
                        <FontAwesomeIcon icon={faUserCog} /> Asignar Roles
                      </button>
                    </div>
                  )}
                </div>
                {mostrarFormularioRol ? (
                  <form onSubmit={handleGuardarRol} className="form-rol">
                    <h3>{modoEdicion ? "Editar Rol" : "Crear Nuevo Rol"}</h3>
                    <div className="form-group">
                      <label>Nombre del Rol:</label>
                      <input type="text" name="nom_rol" value={nuevoRol.nom_rol} onChange={handleRolChange} required />
                    </div>
                    <div className="form-group">
                      <label>Descripción:</label>
                      <textarea name="descripcion" value={nuevoRol.descripcion} onChange={handleRolChange} required rows="3" />
                    </div>
                    <div className="form-buttons">
                      <button type="submit" className="btn-guardar" disabled={isSaving}>
                        {isSaving ? 'Guardando...' : (modoEdicion ? 'Actualizar Rol' : 'Crear Rol')}
                      </button>
                      <button type="button" className="btn-cancelar" onClick={handleCancelarRol}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <table className="tabla-roles">
                    <thead><tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {roles.map(rol => (
                        <tr key={rol.id}>
                          <td>{rol.id}</td>
                          <td>{rol.nom_rol}</td>
                          <td>{rol.descripcion}</td>
                          <td className="acciones">
                            <button onClick={() => handleEditarRol(rol)} className="btn-editar"><FontAwesomeIcon icon={faPen} /></button>
                            <button onClick={() => handleEliminarRol(rol.id)} className="btn-eliminar"><FontAwesomeIcon icon={faTrash} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </MenuAdmin>
  );
}

export default Roles;
