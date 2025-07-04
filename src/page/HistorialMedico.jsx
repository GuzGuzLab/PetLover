import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faSearch, 
  faSave, 
  faTimes, 
  faToggleOn, 
  faToggleOff,
  faCheckCircle,
  faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import "../styles/HistorialMedico.css";

const HistorialMedico = () => {
  const [historiales, setHistoriales] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  
  const [nuevoHistorial, setNuevoHistorial] = useState({
    paciente: "",
    fecha: "",
    peso: "",
    temperatura: "",
    diagnostico: "",
    tratamiento: "",
    observaciones: "",
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
    setHistoriales([
      {
        id: 1,
        paciente: "Max (Labrador)",
        fecha: "2023-06-15",
        peso: "28.5 kg",
        temperatura: "38.5°C",
        diagnostico: "Saludable",
        tratamiento: "Vacuna antirrábica",
        observaciones: "Peso ideal, pelaje brillante",
        activo: true
      },
      {
        id: 2,
        paciente: "Luna (Siamesa)",
        fecha: "2023-06-10",
        peso: "4.2 kg",
        temperatura: "39.1°C",
        diagnostico: "Fiebre leve",
        tratamiento: "Antipirético y observación",
        observaciones: "Volver en 48h si persiste la fiebre",
        activo: true
      }
    ]);
  }, []);

  // Manejar activar/desactivar
  const handleToggle = (id) => {
    const historial = historiales.find(h => h.id === id);
    const nuevoEstado = !historial.activo;
    
    setHistoriales(historiales.map(h => 
      h.id === id ? { ...h, activo: nuevoEstado } : h
    ));
    
    showNotificationMessage(
      `Historial ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
      'success'
    );
  };

  const handleEliminar = (id) => {
    const confirmacion = window.confirm("¿Estás seguro de que quieres eliminar este historial médico?");
    if (confirmacion) {
      setHistoriales(historiales.filter((historial) => historial.id !== id));
      showNotificationMessage("Historial eliminado correctamente", "success");
    }
  };

  const handleEditar = (historial) => {
    setEditandoId(historial.id);
    setNuevoHistorial({
      paciente: historial.paciente,
      fecha: historial.fecha,
      peso: historial.peso,
      temperatura: historial.temperatura,
      diagnostico: historial.diagnostico,
      tratamiento: historial.tratamiento,
      observaciones: historial.observaciones,
      activo: historial.activo
    });
    setMostrarFormulario(true);
  };

  const handleAgregar = () => {
    setEditandoId(null);
    setNuevoHistorial({
      paciente: "",
      fecha: "",
      peso: "",
      temperatura: "",
      diagnostico: "",
      tratamiento: "",
      observaciones: "",
      activo: true
    });
    setMostrarFormulario(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { paciente, fecha, peso, temperatura, diagnostico } = nuevoHistorial;

    if (paciente && fecha && peso && temperatura && diagnostico) {
      if (editandoId) {
        setHistoriales(historiales.map(historial => 
          historial.id === editandoId ? { 
            ...historial,
            ...nuevoHistorial
          } : historial
        ));
        showNotificationMessage("Historial actualizado correctamente", "success");
      } else {
        const nuevo = {
          id: historiales.length > 0 ? Math.max(...historiales.map(h => h.id)) + 1 : 1,
          ...nuevoHistorial
        };
        setHistoriales([...historiales, nuevo]);
        showNotificationMessage("Historial creado correctamente", "success");
      }
      
      setNuevoHistorial({
        paciente: "",
        fecha: "",
        peso: "",
        temperatura: "",
        diagnostico: "",
        tratamiento: "",
        observaciones: "",
        activo: true
      });
      setMostrarFormulario(false);
      setEditandoId(null);
    } else {
      showNotificationMessage("Complete los campos obligatorios", "error");
    }
  };

  const historialesFiltrados = historiales.filter((historial) => {
    const terminoBusqueda = busqueda.toLowerCase();
    return (
      historial.paciente.toLowerCase().includes(terminoBusqueda) ||
      historial.diagnostico.toLowerCase().includes(terminoBusqueda) ||
      historial.tratamiento.toLowerCase().includes(terminoBusqueda)
    );
  });

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-logo-container">
            <div className="admin-title">Pet Lovers</div>
          </div>
          <div className="admin-user-section">
            <div className="admin-avatar-wrapper">
              <img src="/vet-avatar.png" alt="avatar" className="admin-avatar" />
              <div className="admin-user-info">
                <span className="admin-doctor-name">Dr. Veterinario</span>
                <span className="vet-specialty">Cirujano</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="admin-sidebar">
        <div className="sidebar-header">
          <h1>Menú Veterinario</h1>
        </div>
        <ul>
          <li><a href="/consultas">Consultas</a></li>
          <li><a href="/pacientes">Pacientes</a></li>
          <li><a href="/cirugias">Cirugías</a></li>
          <li><a href="/calendario">Calendario</a></li>
        </ul>
      </nav>

      <main className="admin-main">
        <div className="historial-content">
          <h1 className="admin-heading">Historiales Médicos</h1>

          <div className="admin-form">
            <button className="admin-button" onClick={handleAgregar}>
              <FontAwesomeIcon icon={faPlus} /> Nuevo Historial
            </button>
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar historial..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
            </div>
          </div>

          {mostrarFormulario && (
            <form className="form-container" onSubmit={handleSubmit}>
              <h3>{editandoId ? "Editar Historial" : "Agregar Historial"}</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Paciente</label>
                  <input
                    type="text"
                    placeholder="Nombre del paciente"
                    value={nuevoHistorial.paciente}
                    onChange={(e) => setNuevoHistorial({ ...nuevoHistorial, paciente: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={nuevoHistorial.fecha}
                    onChange={(e) => setNuevoHistorial({ ...nuevoHistorial, fecha: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Peso</label>
                  <input
                    type="text"
                    placeholder="Peso (ej. 5.2 kg)"
                    value={nuevoHistorial.peso}
                    onChange={(e) => setNuevoHistorial({ ...nuevoHistorial, peso: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Temperatura</label>
                  <input
                    type="text"
                    placeholder="Temperatura (ej. 38.5°C)"
                    value={nuevoHistorial.temperatura}
                    onChange={(e) => setNuevoHistorial({ ...nuevoHistorial, temperatura: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Diagnóstico</label>
                  <input
                    type="text"
                    placeholder="Diagnóstico principal"
                    value={nuevoHistorial.diagnostico}
                    onChange={(e) => setNuevoHistorial({ ...nuevoHistorial, diagnostico: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Tratamiento</label>
                  <textarea
                    placeholder="Tratamiento indicado"
                    value={nuevoHistorial.tratamiento}
                    onChange={(e) => setNuevoHistorial({ ...nuevoHistorial, tratamiento: e.target.value })}
                    rows="2"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Observaciones</label>
                  <textarea
                    placeholder="Observaciones adicionales"
                    value={nuevoHistorial.observaciones}
                    onChange={(e) => setNuevoHistorial({ ...nuevoHistorial, observaciones: e.target.value })}
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="admin-button">
                  <FontAwesomeIcon icon={editandoId ? faSave : faPlus} /> 
                  {editandoId ? " Guardar Cambios" : " Registrar Historial"}
                </button>
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={() => {
                    setMostrarFormulario(false);
                    setEditandoId(null);
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} /> Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Paciente</th>
                  <th>Fecha</th>
                  <th>Peso</th>
                  <th>Temperatura</th>
                  <th>Diagnóstico</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {historialesFiltrados.map((historial) => (
                  <tr key={historial.id}>
                    <td>{historial.id}</td>
                    <td>{historial.paciente}</td>
                    <td>{historial.fecha}</td>
                    <td>{historial.peso}</td>
                    <td>{historial.temperatura}</td>
                    <td>{historial.diagnostico}</td>
                    <td>
                      <button 
                        className={`btn-toggle ${historial.activo ? 'active' : 'inactive'}`}
                        onClick={() => handleToggle(historial.id)}
                      >
                        <FontAwesomeIcon icon={historial.activo ? faToggleOn : faToggleOff} />
                        {historial.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td>
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEditar(historial)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleEliminar(historial.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
                {historialesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="8">No se encontraron historiales médicos.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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

export default HistorialMedico;