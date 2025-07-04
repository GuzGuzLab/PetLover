import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faSearch, faSave, faTimes, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import "../styles/Consultas.css";

const Consultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevaConsulta, setNuevaConsulta] = useState({
    paciente: "",
    fecha: "",
    hora: "",
    motivo: "",
    diagnostico: "",
    tratamiento: ""
  });

  useEffect(() => {
    // Datos iniciales de ejemplo
    setConsultas([
      {
        id: 1,
        paciente: "Max (Labrador)",
        propietario: "Juan Pérez",
        fecha: "2023-06-15",
        hora: "10:00",
        motivo: "Control anual",
        diagnostico: "Saludable",
        tratamiento: "Vacuna anual aplicada"
      },
      {
        id: 2,
        paciente: "Luna (Siamesa)",
        propietario: "María Gómez",
        fecha: "2023-06-16",
        hora: "11:30",
        motivo: "Problemas digestivos",
        diagnostico: "Gastritis leve",
        tratamiento: "Dieta blanda por 48h"
      }
    ]);
  }, []);

  const handleEliminar = (id) => {
    const confirmacion = window.confirm("¿Estás seguro de que quieres eliminar esta consulta?");
    if (confirmacion) {
      setConsultas(consultas.filter((consulta) => consulta.id !== id));
    }
  };

  const handleEditar = (consulta) => {
    setEditandoId(consulta.id);
    setNuevaConsulta({
      paciente: consulta.paciente,
      fecha: consulta.fecha,
      hora: consulta.hora,
      motivo: consulta.motivo,
      diagnostico: consulta.diagnostico,
      tratamiento: consulta.tratamiento
    });
    setMostrarFormulario(true);
  };

  const handleAgregar = () => {
    setEditandoId(null);
    setNuevaConsulta({
      paciente: "",
      fecha: "",
      hora: "",
      motivo: "",
      diagnostico: "",
      tratamiento: ""
    });
    setMostrarFormulario(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { paciente, fecha, hora, motivo, diagnostico, tratamiento } = nuevaConsulta;

    if (paciente && fecha && hora && motivo) {
      if (editandoId) {
        setConsultas(consultas.map(consulta => 
          consulta.id === editandoId ? { 
            ...consulta,
            ...nuevaConsulta
          } : consulta
        ));
      } else {
        const nueva = {
          id: consultas.length > 0 ? Math.max(...consultas.map(c => c.id)) + 1 : 1,
          paciente,
          propietario: "Nuevo Propietario", // Esto debería venir de un selector
          fecha,
          hora,
          motivo,
          diagnostico: diagnostico || "Por determinar",
          tratamiento: tratamiento || "Por determinar"
        };
        setConsultas([...consultas, nueva]);
      }
      
      setNuevaConsulta({
        paciente: "",
        fecha: "",
        hora: "",
        motivo: "",
        diagnostico: "",
        tratamiento: ""
      });
      setMostrarFormulario(false);
      setEditandoId(null);
    } else {
      alert("Los campos Paciente, Fecha, Hora y Motivo son obligatorios.");
    }
  };

  const consultasFiltradas = consultas.filter((consulta) => {
    const terminoBusqueda = busqueda.toLowerCase();
    return (
      consulta.paciente.toLowerCase().includes(terminoBusqueda) ||
      consulta.propietario.toLowerCase().includes(terminoBusqueda) ||
      consulta.motivo.toLowerCase().includes(terminoBusqueda) ||
      consulta.diagnostico.toLowerCase().includes(terminoBusqueda)
    );
  });

  return (
    <div className="vet-container">
      {/* Header y Sidebar del componente Veterinario */}
      
      <main className="vet-main">
        <div className="seccion-container">
          <h1>Registro de Consultas</h1>

          <div className="acciones-superiores">
            <button className="btn-agregar" onClick={handleAgregar}>
              <FontAwesomeIcon icon={faPlus} /> Nueva Consulta
            </button>
            <div className="busqueda-container">
              <input
                type="text"
                placeholder="Buscar consulta..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <FontAwesomeIcon icon={faSearch} className="icono-busqueda" />
            </div>
          </div>

          {mostrarFormulario && (
            <form className="formulario-nuevo" onSubmit={handleSubmit}>
              <h3>{editandoId ? "Editar Consulta" : "Agregar Consulta"}</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Paciente</label>
                  <input
                    type="text"
                    placeholder="Nombre del paciente"
                    value={nuevaConsulta.paciente}
                    onChange={(e) => setNuevaConsulta({ ...nuevaConsulta, paciente: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Fecha</label>
                  <div className="input-with-icon">
                    <input
                      type="date"
                      value={nuevaConsulta.fecha}
                      onChange={(e) => setNuevaConsulta({ ...nuevaConsulta, fecha: e.target.value })}
                      required
                    />
                    <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Hora</label>
                  <input
                    type="time"
                    value={nuevaConsulta.hora}
                    onChange={(e) => setNuevaConsulta({ ...nuevaConsulta, hora: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Motivo</label>
                  <input
                    type="text"
                    placeholder="Motivo de la consulta"
                    value={nuevaConsulta.motivo}
                    onChange={(e) => setNuevaConsulta({ ...nuevaConsulta, motivo: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Diagnóstico</label>
                  <textarea
                    placeholder="Diagnóstico"
                    value={nuevaConsulta.diagnostico}
                    onChange={(e) => setNuevaConsulta({ ...nuevaConsulta, diagnostico: e.target.value })}
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Tratamiento</label>
                  <textarea
                    placeholder="Tratamiento indicado"
                    value={nuevaConsulta.tratamiento}
                    onChange={(e) => setNuevaConsulta({ ...nuevaConsulta, tratamiento: e.target.value })}
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="form-buttons">
                <button type="submit" className="btn-guardar">
                  <FontAwesomeIcon icon={editandoId ? faSave : faPlus} /> 
                  {editandoId ? " Guardar Cambios" : " Registrar Consulta"}
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

          <table className="tabla-consultas">
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>Propietario</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Motivo</th>
                <th>Diagnóstico</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {consultasFiltradas.map((consulta) => (
                <tr key={consulta.id}>
                  <td>{consulta.id}</td>
                  <td>{consulta.paciente}</td>
                  <td>{consulta.propietario}</td>
                  <td>{consulta.fecha}</td>
                  <td>{consulta.hora}</td>
                  <td>{consulta.motivo}</td>
                  <td className="diagnostico-cell">
                    {consulta.diagnostico || <span className="no-data">Sin diagnóstico</span>}
                  </td>
                  <td>
                    <button 
                      className="btn-editar" 
                      onClick={() => handleEditar(consulta)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="btn-eliminar" 
                      onClick={() => handleEliminar(consulta.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
              {consultasFiltradas.length === 0 && (
                <tr>
                  <td colSpan="8">No se encontraron consultas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Consultas;