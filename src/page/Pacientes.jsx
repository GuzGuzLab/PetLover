import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faSearch, 
  faSave, 
  faTimes, 
  faPaw,
  faToggleOn,
  faToggleOff,
  faCheckCircle,
  faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import "../styles/Pacientes.css";

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: "",
    especie: "Canino",
    raza: "",
    edad: "",
    sexo: "Macho",
    propietario: "",
    activo: true
  });

  // Mostrar notificación
  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Cargar datos iniciales
  useEffect(() => {
    setPacientes([
      {
        id: 1,
        nombre: "Max",
        especie: "Canino",
        raza: "Labrador Retriever",
        edad: "5 años",
        sexo: "Macho",
        propietario: "Juan Pérez",
        ultimaVisita: "2023-06-15",
        activo: true
      },
      {
        id: 2,
        nombre: "Luna",
        especie: "Felino",
        raza: "Siamés",
        edad: "3 años",
        sexo: "Hembra",
        propietario: "María Gómez",
        ultimaVisita: "2023-06-10",
        activo: true
      }
    ]);
  }, []);

  // Manejar activar/desactivar
  const handleToggle = (id) => {
    const paciente = pacientes.find(p => p.id === id);
    const nuevoEstado = !paciente.activo;
    
    setPacientes(pacientes.map(p => 
      p.id === id ? { ...p, activo: nuevoEstado } : p
    ));
    
    showNotificationMessage(
      `Paciente ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
      'success'
    );
  };

  const handleEliminar = (id) => {
    const confirmacion = window.confirm("¿Estás seguro de que quieres eliminar este paciente?");
    if (confirmacion) {
      setPacientes(pacientes.filter((paciente) => paciente.id !== id));
      showNotificationMessage("Paciente eliminado correctamente", "success");
    }
  };

  const handleEditar = (paciente) => {
    setEditandoId(paciente.id);
    setNuevoPaciente({
      nombre: paciente.nombre,
      especie: paciente.especie,
      raza: paciente.raza,
      edad: paciente.edad,
      sexo: paciente.sexo,
      propietario: paciente.propietario,
      activo: paciente.activo
    });
    setMostrarFormulario(true);
  };

  const handleAgregar = () => {
    setEditandoId(null);
    setNuevoPaciente({
      nombre: "",
      especie: "Canino",
      raza: "",
      edad: "",
      sexo: "Macho",
      propietario: "",
      activo: true
    });
    setMostrarFormulario(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { nombre, especie, raza, edad, sexo, propietario } = nuevoPaciente;

    if (nombre && especie && raza && edad && sexo && propietario) {
      if (editandoId) {
        setPacientes(pacientes.map(paciente => 
          paciente.id === editandoId ? { 
            ...paciente,
            ...nuevoPaciente,
            ultimaVisita: paciente.ultimaVisita || "Nunca"
          } : paciente
        ));
        showNotificationMessage("Paciente actualizado correctamente", "success");
      } else {
        const nuevo = {
          id: pacientes.length > 0 ? Math.max(...pacientes.map(p => p.id)) + 1 : 1,
          nombre,
          especie,
          raza,
          edad,
          sexo,
          propietario,
          ultimaVisita: "Nunca",
          activo: true
        };
        setPacientes([...pacientes, nuevo]);
        showNotificationMessage("Paciente registrado correctamente", "success");
      }
      
      setNuevoPaciente({
        nombre: "",
        especie: "Canino",
        raza: "",
        edad: "",
        sexo: "Macho",
        propietario: "",
        activo: true
      });
      setMostrarFormulario(false);
      setEditandoId(null);
    } else {
      showNotificationMessage("Complete todos los campos obligatorios", "error");
    }
  };

  const pacientesFiltrados = pacientes.filter((paciente) => {
    const terminoBusqueda = busqueda.toLowerCase();
    return (
      paciente.nombre.toLowerCase().includes(terminoBusqueda) ||
      paciente.propietario.toLowerCase().includes(terminoBusqueda) ||
      paciente.raza.toLowerCase().includes(terminoBusqueda)
    );
  });

  return (
    <div className="vet-container">
      <header className="vet-header">
        <div className="vet-header-content">
          <div className="vet-logo-container">
            <div className="vet-title">Pet Lovers</div>
          </div>
          <div className="vet-user-section">
            <div className="vet-avatar-wrapper">
              <img src="/vet-avatar.png" alt="avatar" className="vet-avatar" />
              <div className="vet-user-info">
                <span className="vet-doctor-name">Dr. Veterinario</span>
                <span className="vet-specialty">Cirujano</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="vet-sidebar">
        <div className="sidebar-header">
          <h1>Menú Veterinario</h1>
        </div>
        <ul>
          <li><a href="/consultas">Consultas</a></li>
          <li><a href="/pacientes" className="active">Pacientes</a></li>
          <li><a href="/cirugias">Cirugías</a></li>
          <li><a href="/calendario">Calendario</a></li>
        </ul>
      </nav>

      <main className="vet-main">
        <div className="seccion-container">
          <h1>Registro de Pacientes</h1>

          <div className="acciones-superiores">
            <button className="btn-agregar" onClick={handleAgregar}>
              <FontAwesomeIcon icon={faPlus} /> Nuevo Paciente
            </button>
            <div className="busqueda-container">
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <FontAwesomeIcon icon={faSearch} className="icono-busqueda" />
            </div>
          </div>

          {mostrarFormulario && (
            <form className="formulario-nuevo" onSubmit={handleSubmit}>
              <h3>{editandoId ? "Editar Paciente" : "Agregar Paciente"}</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre del paciente"
                    value={nuevoPaciente.nombre}
                    onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, nombre: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Especie</label>
                  <select
                    value={nuevoPaciente.especie}
                    onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, especie: e.target.value })}
                    required
                  >
                    <option value="Canino">Canino</option>
                    <option value="Felino">Felino</option>
                    <option value="Ave">Ave</option>
                    <option value="Roedor">Roedor</option>
                    <option value="Reptil">Reptil</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Raza</label>
                  <input
                    type="text"
                    placeholder="Raza"
                    value={nuevoPaciente.raza}
                    onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, raza: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Edad</label>
                  <input
                    type="text"
                    placeholder="Edad (ej. 3 años)"
                    value={nuevoPaciente.edad}
                    onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, edad: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Sexo</label>
                  <select
                    value={nuevoPaciente.sexo}
                    onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, sexo: e.target.value })}
                    required
                  >
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Propietario</label>
                  <input
                    type="text"
                    placeholder="Nombre del propietario"
                    value={nuevoPaciente.propietario}
                    onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, propietario: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="form-buttons">
                <button type="submit" className="btn-guardar">
                  <FontAwesomeIcon icon={editandoId ? faSave : faPlus} /> 
                  {editandoId ? " Guardar Cambios" : " Registrar Paciente"}
                </button>
                <button type="button" className="btn-cancelar" onClick={() => {
                  setMostrarFormulario(false);
                  setEditandoId(null);
                }}>
                  <FontAwesomeIcon icon={faTimes} /> Cancelar
                </button>
              </div>
            </form>
          )}

          <table className="tabla-pacientes">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Especie</th>
                <th>Raza</th>
                <th>Edad</th>
                <th>Estado</th>
                <th>Propietario</th>
                <th>Última Visita</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientesFiltrados.map((paciente) => (
                <tr key={paciente.id}>
                  <td>{paciente.id}</td>
                  <td>
                    <FontAwesomeIcon icon={faPaw} className="paw-icon" />
                    {paciente.nombre}
                  </td>
                  <td>{paciente.especie}</td>
                  <td>{paciente.raza}</td>
                  <td>{paciente.edad}</td>
                  <td>
                    <button 
                      className={`btn-toggle ${paciente.activo ? 'active' : 'inactive'}`}
                      onClick={() => handleToggle(paciente.id)}
                    >
                      <FontAwesomeIcon icon={paciente.activo ? faToggleOn : faToggleOff} />
                      {paciente.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>{paciente.propietario}</td>
                  <td>{paciente.ultimaVisita}</td>
                  <td>
                    <button 
                      className="btn-editar" 
                      onClick={() => handleEditar(paciente)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="btn-eliminar" 
                      onClick={() => handleEliminar(paciente.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
              {pacientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="9">No se encontraron pacientes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Notificación */}
      {showNotification && (
        <div className={`confirmation-message ${notificationType}`}>
          <FontAwesomeIcon icon={notificationType === 'success' ? faCheckCircle : faExclamationCircle} />
          {notificationMessage}
        </div>
      )}
    </div>
  );
};

export default Pacientes;