"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import {
  Stethoscope, Search, Filter, Plus, Eye, Edit, Calendar, User, Dog, Cat, Heart,
  Thermometer, Weight, Pill, FileText, Clock, AlertCircle, CheckCircle, X,
  Download, PrinterIcon as Print, Activity, Clipboard, Trash2 as Trash,
} from "lucide-react"
import "../styles/ConsultasVet.css"

const VetConsultas = () => {
  const [consultas, setConsultas] = useState([])
  const [estadisticas, setEstadisticas] = useState({})
  const [filtros, setFiltros] = useState({
    busqueda: "", mascota: "todas", veterinario: "todos",
    fechaInicio: "", fechaFin: "", estado: "todos",
  })
  const [consultaSeleccionada, setConsultaSeleccionada] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalNuevaConsulta, setModalNuevaConsulta] = useState(false)
  const [loading, setLoading] = useState(true)
  const [listaPropietarios, setListaPropietarios] = useState([]);
  const [propietarioSeleccionado, setPropietarioSeleccionado] = useState('');
  const [mascotasDelPropietario, setMascotasDelPropietario] = useState([]);
  const [listaVeterinarios, setListaVeterinarios] = useState([]);
  const [cargandoMascotas, setCargandoMascotas] = useState(false);
  const [nuevaConsulta, setNuevaConsulta] = useState({
    mascota_id: '', vet_id: '', fecha_consulta: '', motivo_consulta: '', diagnostico: '',
    tratamiento: '', observaciones: '', proxima_cita: '',
    signos_vitales: { peso: '', temperatura: '', frecuenciaCardiaca: '', frecuenciaRespiratoria: '' },
    medicamentos: []
  });
  const [enviando, setEnviando] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [consultasRes, propietariosRes, veterinariosRes] = await Promise.all([
          fetch('/api/consultas'),
          fetch('/api/propietarios'),
          fetch('/api/veterinarios')
        ]);
        if (!consultasRes.ok || !propietariosRes.ok || !veterinariosRes.ok) throw new Error('Error al obtener datos iniciales');
        
        const consultasData = await consultasRes.json();
        const propietariosData = await propietariosRes.json();
        const veterinariosData = await veterinariosRes.json();
        
        setConsultas(consultasData);
        setListaPropietarios(propietariosData);
        setListaVeterinarios(veterinariosData);
        setEstadisticas({
            totalConsultas: consultasData.length,
            consultasEsteMes: consultasData.filter(c => new Date(c.fecha).getMonth() === new Date().getMonth()).length,
            mascotasAtendidas: new Set(consultasData.map(c => c.mascota.id)).size,
            proximasConsultas: consultasData.filter(c => c.proximaCita).length,
        });
      } catch (error) {
        console.error("No se pudieron cargar los datos iniciales:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (modoEdicion && consultaSeleccionada) {
      // Encontrar el propietario por el nombre para obtener su 'doc'
      const propietario = listaPropietarios.find(p => p.nombre === consultaSeleccionada.mascota.propietario);
      
      if (propietario && propietario.doc) {
        // Cargar las mascotas de ese propietario
        handlePropietarioChange(propietario.doc).then(() => {
            // Una vez cargadas, seleccionamos la mascota correcta
            setNuevaConsulta(prevState => ({ ...prevState, mascota_id: consultaSeleccionada.mascota.id }));
        });
      }

      setNuevaConsulta({
        mascota_id: consultaSeleccionada.mascota.id,
        vet_id: consultaSeleccionada.vet_id,
        motivo_consulta: consultaSeleccionada.motivo || '',
        diagnostico: consultaSeleccionada.diagnostico || '',
        tratamiento: consultaSeleccionada.tratamiento || '',
        observaciones: consultaSeleccionada.observaciones || '',
        proxima_cita: consultaSeleccionada.proximaCita || '',
        signos_vitales: consultaSeleccionada.signosVitales || { peso: '', temperatura: '', frecuenciaCardiaca: '', frecuenciaRespiratoria: '' },
        medicamentos: consultaSeleccionada.medicamentos || [],
      });
    }
  }, [modoEdicion, consultaSeleccionada]);

  const handlePropietarioChange = async (docPropietario) => {
    setPropietarioSeleccionado(docPropietario);
    setMascotasDelPropietario([]);
    setNuevaConsulta(prevState => ({ ...prevState, mascota_id: '' })); // Limpiar mascota seleccionada
    if (!docPropietario) return;
    try {
      setCargandoMascotas(true);
      const response = await fetch(`/api/propietarios/${docPropietario}/mascotas`);
      if (!response.ok) throw new Error('No se pudieron cargar las mascotas');
      const data = await response.json();
      setMascotasDelPropietario(data);
      return data;
    } catch (error) {
      console.error(error);
    } finally {
      setCargandoMascotas(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("sv_")) {
      const vitalSignName = name.split("_")[1];
      setNuevaConsulta(prevState => ({ ...prevState, signos_vitales: { ...prevState.signos_vitales, [vitalSignName]: value } }));
    } else {
      setNuevaConsulta(prevState => ({ ...prevState, [name]: value }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    const form = e.target;
    const fecha = form.fecha.value;
    const hora = form.hora.value;
    const fecha_consulta_completa = `${fecha} ${hora || '00:00'}:00`;
    const datosParaEnviar = {
      ...nuevaConsulta,
      fecha_consulta: fecha_consulta_completa,
      mascota_id: nuevaConsulta.mascota_id,
      vet_id: nuevaConsulta.vet_id
    };
    const url = modoEdicion ? `/api/consultas/${consultaSeleccionada.id}` : '/api/consultas';
    const method = modoEdicion ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosParaEnviar),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'El servidor respondió con un error.');
      }
      
      cerrarModalNuevaConsulta();
      await Swal.fire({
        title: '¡Perfecto!',
        text: modoEdicion ? 'La consulta ha sido actualizada.' : 'La nueva consulta ha sido guardada.',
        icon: 'success',
        iconColor: '#00A79D',
        confirmButtonColor: '#00A79D',
        timer: 2500,
        timerProgressBar: true,
      });
      window.location.reload();
    } catch (error) {
      console.error("Error al guardar la consulta:", error);
      Swal.fire({
        title: '¡Oops...!',
        text: `Hubo un error al guardar: ${error.message}`,
        icon: 'error',
        confirmButtonColor: '#D33',
      });
    } finally {
      setEnviando(false);
    }
  };

  const handleDeleteConsulta = async (consultaId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esta acción!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/consultas/${consultaId}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'No se pudo eliminar la consulta.');
        }
        Swal.fire('¡Eliminado!', 'La consulta ha sido eliminada.', 'success');
        setConsultas(prevConsultas => prevConsultas.filter(c => c.id !== consultaId));
      } catch (error) {
        console.error("Error al eliminar la consulta:", error);
        Swal.fire('Error', `No se pudo eliminar la consulta: ${error.message}`, 'error');
      }
    }
  };

  const handlePrintConsulta = (consulta) => {
    // ===== INICIO DE LA SECCIÓN CORREGIDA =====
    // Gracias a la corrección en el backend, 'consulta.medicamentos' ya es un array.
    // La lógica se simplifica a solo usar el valor o un array vacío por si acaso.
    const medicamentosArray = consulta.medicamentos || [];
    // ===== FIN DE LA SECCIÓN CORREGIDA =====
    
    const printContent = `
      <html><head><title>Reporte de Consulta - ${consulta.mascota.nombre}</title><style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #00A79D; padding-bottom: 20px; }
        .header h1 { margin: 0; color: #00A79D; } .header p { margin: 5px 0; color: #555; }
        .seccion { margin-bottom: 25px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; }
        .seccion h2 { border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-top: 0; font-size: 1.2em; color: #333; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .info-grid strong { color: #00A79D; }
        .medicamentos-lista .item { padding: 5px; border-bottom: 1px dashed #eee; }
        .footer { text-align: center; margin-top: 50px; font-size: 0.8em; color: #aaa; }
      </style></head><body>
      <div class="header"><h1>Clínica Veterinaria "PetLover's"</h1><p>Reporte de Consulta Médica</p></div>
      <div class="seccion"><h2>Datos de la Consulta</h2><div class="info-grid"><div><strong>Fecha:</strong> ${consulta.fecha}</div><div><strong>Hora:</strong> ${consulta.hora}</div><div><strong>Veterinario:</strong> ${consulta.veterinario}</div></div></div>
      <div class="seccion"><h2>Paciente</h2><div class="info-grid"><div><strong>Nombre:</strong> ${consulta.mascota.nombre}</div><div><strong>Especie:</strong> ${consulta.mascota.especie}</div><div><strong>Raza:</strong> ${consulta.mascota.raza}</div><div><strong>Propietario:</strong> ${consulta.mascota.propietario}</div></div></div>
      <div class="seccion"><h2>Información Médica</h2><p><strong>Motivo de la Consulta:</strong> ${consulta.motivo}</p><p><strong>Diagnóstico:</strong> ${consulta.diagnostico}</p><p><strong>Tratamiento:</strong> ${consulta.tratamiento}</p><p><strong>Observaciones:</strong> ${consulta.observaciones}</p></div>
      ${medicamentosArray.length > 0 ? `<div class="seccion"><h2>Medicamentos Prescritos</h2><div class="medicamentos-lista">${medicamentosArray.map(med => `<div class="item">${med.nombre || 'N/A'} - Dosis: ${med.dosis || 'N/A'}, Frecuencia: ${med.frecuencia || 'N/A'}</div>`).join('')}</div></div>` : ''}
      ${consulta.proximaCita ? `<div class="seccion"><h2>Seguimiento</h2><p><strong>Próxima cita recomendada:</strong> ${consulta.proximaCita}</p></div>` : ''}
      <div class="footer">Este es un reporte generado por el sistema de la Clínica Veterinaria.</div></body></html>
    `;
    const printWindow = window.open('', '_blank', 'height=800,width=800');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const consultasFiltradas = consultas.filter((consulta) => {
    const busquedaLower = filtros.busqueda.toLowerCase();
    return (consulta.mascota.nombre.toLowerCase().includes(busquedaLower) ||
            consulta.mascota.propietario.toLowerCase().includes(busquedaLower) ||
            (consulta.diagnostico && consulta.diagnostico.toLowerCase().includes(busquedaLower)) ||
            (consulta.motivo && consulta.motivo.toLowerCase().includes(busquedaLower))) &&
           (filtros.mascota === "todas" || consulta.mascota.especie.toLowerCase() === filtros.mascota) &&
           (!filtros.fechaInicio || consulta.fecha >= filtros.fechaInicio) &&
           (!filtros.fechaFin || consulta.fecha <= filtros.fechaFin);
  });

  const abrirModal = (consulta) => { setConsultaSeleccionada(consulta); setModalAbierto(true); };
  const cerrarModal = () => { setModalAbierto(false); setConsultaSeleccionada(null); };
  
  const abrirModalEdicion = (consulta) => {
    setModoEdicion(true);
    setConsultaSeleccionada(consulta);
    setModalNuevaConsulta(true);
  };

  const abrirModalNuevaConsulta = () => {
    setModoEdicion(false);
    setConsultaSeleccionada(null);
    setNuevaConsulta({
        mascota_id: '', vet_id: '', fecha_consulta: '', motivo_consulta: '', diagnostico: '',
        tratamiento: '', observaciones: '', proxima_cita: '',
        signos_vitales: { peso: '', temperatura: '', frecuenciaCardiaca: '', frecuenciaRespiratoria: '' },
        medicamentos: []
    });
    setPropietarioSeleccionado('');
    setMascotasDelPropietario([]);
    setModalNuevaConsulta(true);
  };

  const cerrarModalNuevaConsulta = () => { setModalNuevaConsulta(false); setModoEdicion(false); };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
  const cardVariants = { hidden: { scale: 0.9, opacity: 0 }, visible: { scale: 1, opacity: 1 }, hover: { scale: 1.02, y: -5 } };

  if (loading) {
    return (
      <div className="vet-consultas-loading">
        <motion.div className="loading-spinner" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Stethoscope size={48} /></motion.div>
        <p>Cargando historial médico...</p>
      </div>
    )
  }

  return (
    <motion.div className="vet-consultas-container" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="vet-consultas-header" variants={itemVariants}>
        <div className="header-content"><h1><Stethoscope className="header-icon" /> Historial Médico</h1><p>Gestiona y supervisa todas las consultas médicas realizadas</p></div>
        <div className="header-actions"><motion.button className="btn-export" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} title="Exportar historial"><Download size={20} />Exportar</motion.button><motion.button className="btn-nuevo" onClick={abrirModalNuevaConsulta} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Plus size={20} />Nueva Consulta</motion.button></div>
      </motion.div>
      <motion.div className="estadisticas-grid" variants={itemVariants}>
        <motion.div className="estadistica-card" variants={cardVariants} whileHover="hover"><div className="estadistica-icon total"><Clipboard size={24} /></div><div className="estadistica-info"><h3>{estadisticas.totalConsultas}</h3><p>Total Consultas</p></div></motion.div>
        <motion.div className="estadistica-card" variants={cardVariants} whileHover="hover"><div className="estadistica-icon mes"><Calendar size={24} /></div><div className="estadistica-info"><h3>{estadisticas.consultasEsteMes}</h3><p>Este Mes</p></div></motion.div>
        <motion.div className="estadistica-card" variants={cardVariants} whileHover="hover"><div className="estadistica-icon mascotas"><Activity size={24} /></div><div className="estadistica-info"><h3>{estadisticas.mascotasAtendidas}</h3><p>Mascotas Atendidas</p></div></motion.div>
        <motion.div className="estadistica-card" variants={cardVariants} whileHover="hover"><div className="estadistica-icon proximas"><Clock size={24} /></div><div className="estadistica-info"><h3>{estadisticas.proximasConsultas}</h3><p>Seguimientos</p></div></motion.div>
      </motion.div>
      <motion.div className="filtros-container" variants={itemVariants}>
        <div className="busqueda-container"><Search className="busqueda-icon" /><input type="text" placeholder="Buscar por mascota, propietario o diagnóstico..." value={filtros.busqueda} onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })} className="busqueda-input"/></div>
        <div className="filtros-opciones"><div className="filtro-grupo"><Filter size={16} /><select value={filtros.mascota} onChange={(e) => setFiltros({ ...filtros, mascota: e.target.value })} className="filtro-select"><option value="todas">Todas las especies</option><option value="Perro">Perros</option><option value="Gato">Gatos</option></select></div><div className="filtro-grupo"><Calendar size={16} /><input type="date" value={filtros.fechaInicio} onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })} className="filtro-date"/></div><div className="filtro-grupo"><Calendar size={16} /><input type="date" value={filtros.fechaFin} onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })} className="filtro-date"/></div></div>
      </motion.div>
      <motion.div className="consultas-grid" variants={itemVariants}>
        <AnimatePresence>
          {consultasFiltradas.map((consulta) => (
            <motion.div key={consulta.id} className="consulta-card" variants={cardVariants} initial="hidden" animate="visible" exit="hidden" whileHover="hover">
              <div className="consulta-header">
                <div className="consulta-fecha"><Calendar size={16} /><span>{consulta.fecha} - {consulta.hora}</span></div>
                <div className="consulta-acciones">
                  <motion.button className="btn-accion ver" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => abrirModal(consulta)} title="Ver detalles"><Eye size={16} /></motion.button>
                  <motion.button className="btn-accion editar" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => abrirModalEdicion(consulta)} title="Editar consulta"><Edit size={16} /></motion.button>
                  <motion.button className="btn-accion imprimir" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handlePrintConsulta(consulta)} title="Imprimir reporte"><Print size={16} /></motion.button>
                  <motion.button className="btn-accion eliminar" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteConsulta(consulta.id)} title="Eliminar consulta"><Trash size={16} /></motion.button>
                </div>
              </div>
              <div className="consulta-mascota"><div className="mascota-avatar">{consulta.mascota.especie === "Perro" ? <Dog size={24} /> : <Cat size={24} />}</div><div className="mascota-info"><h3>{consulta.mascota.nombre}</h3><p>{consulta.mascota.raza} - {consulta.mascota.edad}</p><p className="propietario"><User size={14} />{consulta.mascota.propietario}</p></div></div>
              <div className="consulta-detalles"><div className="motivo"><strong>Motivo:</strong> {consulta.motivo}</div><div className="diagnostico"><strong>Diagnóstico:</strong> {consulta.diagnostico}</div><div className="veterinario"><strong>Veterinario:</strong> {consulta.veterinario}</div></div>
              <div className="consulta-signos"><div className="signo-item"><Weight size={16} /><span>{consulta.signosVitales?.peso || 'N/A'}</span></div><div className="signo-item"><Thermometer size={16} /><span>{consulta.signosVitales?.temperatura || 'N/A'}</span></div><div className="signo-item"><Heart size={16} /><span>{consulta.signosVitales?.frecuenciaCardiaca || 'N/A'}</span></div></div>
              <div className="consulta-footer"><div className="medicamentos-count"><Pill size={14} /><span>{consulta.medicamentos?.length || 0} medicamento(s)</span></div><div className="estado-badge"><CheckCircle size={12} /><span>Completada</span></div></div>
              {consulta.proximaCita && (<div className="proxima-cita"><Clock size={16} /><span>Próximo control: {consulta.proximaCita}</span></div>)}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {modalAbierto && consultaSeleccionada && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={cerrarModal}>
            <motion.div className="modal-content consulta-modal" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"><h2><Stethoscope size={24} />Consulta Médica - {consultaSeleccionada.mascota.nombre}</h2><button className="btn-cerrar" onClick={cerrarModal}><X size={20} /></button></div>
              <div className="modal-body"><div className="consulta-completa">
                <div className="seccion"><h4><Calendar size={18} />Información de la Consulta</h4><div className="info-grid"><div><strong>Fecha:</strong> {consultaSeleccionada.fecha}</div><div><strong>Hora:</strong> {consultaSeleccionada.hora}</div><div><strong>Veterinario:</strong> {consultaSeleccionada.veterinario}</div><div><strong>Estado:</strong> {consultaSeleccionada.estado}</div></div></div>
                <div className="seccion"><h4>{consultaSeleccionada.mascota.especie === "Perro" ? <Dog size={18} /> : <Cat size={18} />}Información de la Mascota</h4><div className="info-grid"><div><strong>Nombre:</strong> {consultaSeleccionada.mascota.nombre}</div><div><strong>Especie:</strong> {consultaSeleccionada.mascota.especie}</div><div><strong>Raza:</strong> {consultaSeleccionada.mascota.raza}</div><div><strong>Edad:</strong> {consultaSeleccionada.mascota.edad}</div><div><strong>Propietario:</strong> {consultaSeleccionada.mascota.propietario}</div><div><strong>Teléfono:</strong> {consultaSeleccionada.mascota.telefono}</div></div></div>
                <div className="seccion"><h4><AlertCircle size={18} />Motivo y Síntomas</h4><div className="texto-completo"><div className="campo"><strong>Motivo de consulta:</strong><p>{consultaSeleccionada.motivo}</p></div><div className="campo"><strong>Síntomas observados:</strong><p>{consultaSeleccionada.sintomas}</p></div></div></div>
                <div className="seccion"><h4><Activity size={18} />Signos Vitales</h4><div className="signos-vitales-grid"><div className="signo-vital"><Weight size={16} /><span>Peso</span><strong>{consultaSeleccionada.signosVitales?.peso || 'N/A'}</strong></div><div className="signo-vital"><Thermometer size={16} /><span>Temperatura</span><strong>{consultaSeleccionada.signosVitales?.temperatura || 'N/A'}</strong></div><div className="signo-vital"><Heart size={16} /><span>Freq. Cardíaca</span><strong>{consultaSeleccionada.signosVitales?.frecuenciaCardiaca || 'N/A'}</strong></div><div className="signo-vital"><Activity size={16} /><span>Freq. Respiratoria</span><strong>{consultaSeleccionada.signosVitales?.frecuenciaRespiratoria || 'N/A'}</strong></div></div></div>
                <div className="seccion"><h4><Stethoscope size={18} />Diagnóstico y Tratamiento</h4><div className="texto-completo"><div className="campo"><strong>Diagnóstico:</strong><p>{consultaSeleccionada.diagnostico}</p></div><div className="campo"><strong>Tratamiento:</strong><p>{consultaSeleccionada.tratamiento}</p></div></div></div>
                <div className="seccion"><h4><Pill size={18} />Medicamentos Prescritos</h4><div className="medicamentos-lista">{consultaSeleccionada.medicamentos?.map((medicamento, index) => (<div key={index} className="medicamento-item"><div className="medicamento-nombre">{medicamento.nombre}</div><div className="medicamento-detalles"><span>Dosis: {medicamento.dosis}</span><span>Frecuencia: {medicamento.frecuencia}</span></div></div>))}</div></div>
                <div className="seccion"><h4><FileText size={18} />Observaciones</h4><div className="texto-completo"><p>{consultaSeleccionada.observaciones}</p></div></div>
                {consultaSeleccionada.proximaCita && (<div className="seccion"><h4><Clock size={18} />Seguimiento</h4><div className="proxima-cita-info"><strong>Próxima cita recomendada:</strong> {consultaSeleccionada.proximaCita}</div></div>)}
                {consultaSeleccionada.archivos?.length > 0 && (<div className="seccion"><h4><FileText size={18} />Archivos Adjuntos</h4><div className="archivos-lista">{consultaSeleccionada.archivos.map((archivo, index) => (<div key={index} className="archivo-item"><FileText size={16} /><span>{archivo}</span><button className="btn-descargar"><Download size={14} /></button></div>))}</div></div>)}
              </div></div>
              <div className="modal-footer"><button className="btn-secundario" onClick={cerrarModal}>Cerrar</button><button className="btn-primario" onClick={() => handlePrintConsulta(consultaSeleccionada)}><Print size={16} />Imprimir</button><button className="btn-primario" onClick={() => { cerrarModal(); abrirModalEdicion(consultaSeleccionada); }}><Edit size={16} />Editar</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalNuevaConsulta && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={cerrarModalNuevaConsulta}>
            <motion.div className="modal-content nueva-consulta-modal" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"><h2><Plus size={24} />{modoEdicion ? 'Editar Consulta Médica' : 'Nueva Consulta Médica'}</h2><button className="btn-cerrar" onClick={cerrarModalNuevaConsulta}><X size={20} /></button></div>
              <div className="modal-body">
                <form className="nueva-consulta-form" onSubmit={handleFormSubmit}>
                  <div className="form-grid">
                    <div className="form-group"><label>Propietario</label><select value={propietarioSeleccionado} onChange={(e) => handlePropietarioChange(e.target.value)} required><option value="">Seleccionar propietario</option>{listaPropietarios.map(propietario => (<option key={propietario.id} value={propietario.doc}>{propietario.nombre} ({propietario.doc})</option>))}</select></div>
                    <div className="form-group"><label>Mascota</label><select name="mascota_id" value={nuevaConsulta.mascota_id} onChange={handleFormChange} disabled={!propietarioSeleccionado || cargandoMascotas} required><option value="">{cargandoMascotas ? 'Cargando...' : 'Seleccionar mascota'}</option>{mascotasDelPropietario.map(mascota => (<option key={mascota.id} value={mascota.id}>{mascota.nombre} ({mascota.especie})</option>))}</select></div>
                    <div className="form-group"><label>Fecha</label><input type="date" name="fecha" defaultValue={modoEdicion ? new Date(consultaSeleccionada.fecha).toISOString().split('T')[0] : ''} required /></div>
                    <div className="form-group"><label>Hora</label><input type="time" name="hora" defaultValue={modoEdicion ? consultaSeleccionada.hora : ''} /></div>
                    <div className="form-group"><label>Veterinario</label><select name="vet_id" value={nuevaConsulta.vet_id} onChange={handleFormChange} required><option value="">Seleccionar veterinario</option>{listaVeterinarios.map(vet => (<option key={vet.vet_id} value={vet.vet_id}>{vet.nombre}</option>))}</select></div>
                    <div className="form-group full-width"><label>Motivo de consulta</label><textarea name="motivo_consulta" value={nuevaConsulta.motivo_consulta} onChange={handleFormChange} placeholder="Describe el motivo..." required></textarea></div>
                    <div className="form-group"><label>Peso (kg)</label><input type="text" name="sv_peso" value={nuevaConsulta.signos_vitales.peso} onChange={handleFormChange} placeholder="10.5 kg" /></div>
                    <div className="form-group"><label>Temperatura (°C)</label><input type="text" name="sv_temperatura" value={nuevaConsulta.signos_vitales.temperatura} onChange={handleFormChange} placeholder="38.5°C" /></div>
                    <div className="form-group"><label>Freq. Cardíaca (bpm)</label><input type="text" name="sv_frecuenciaCardiaca" value={nuevaConsulta.signos_vitales.frecuenciaCardiaca} onChange={handleFormChange} placeholder="90 bpm" /></div>
                    <div className="form-group"><label>Freq. Respiratoria (rpm)</label><input type="text" name="sv_frecuenciaRespiratoria" value={nuevaConsulta.signos_vitales.frecuenciaRespiratoria} onChange={handleFormChange} placeholder="22 rpm" /></div>
                    <div className="form-group full-width"><label>Diagnóstico</label><textarea name="diagnostico" value={nuevaConsulta.diagnostico} onChange={handleFormChange} placeholder="Diagnóstico médico..."></textarea></div>
                    <div className="form-group full-width"><label>Tratamiento</label><textarea name="tratamiento" value={nuevaConsulta.tratamiento} onChange={handleFormChange} placeholder="Tratamiento prescrito..."></textarea></div>
                    <div className="form-group full-width"><label>Observaciones</label><textarea name="observaciones" value={nuevaConsulta.observaciones} onChange={handleFormChange} placeholder="Observaciones adicionales..."></textarea></div>
                    <div className="form-group"><label>Próxima cita</label><input type="date" name="proxima_cita" value={nuevaConsulta.proxima_cita} onChange={handleFormChange} /></div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-secundario" onClick={cerrarModalNuevaConsulta}>Cancelar</button>
                    <button type="submit" className="btn-primario" disabled={enviando}>{enviando ? 'Guardando...' : <><CheckCircle size={16} /> Guardar Consulta</>}</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default VetConsultas