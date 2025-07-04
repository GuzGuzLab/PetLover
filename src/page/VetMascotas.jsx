"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
  Dog, Cat, Search, Filter, Plus, Eye, Edit, Calendar, Weight, Heart, Shield, Users, PawPrint, X, Trash2,
} from "lucide-react"
import "../styles/VetMascotas.css"

const VetMascotas = () => {
  const [mascotas, setMascotas] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [filtros, setFiltros] = useState({ busqueda: "", especie: "todas" });
  const [loading, setLoading] = useState(true);
  
  // Estados para los modales
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Carga inicial de datos
  const fetchMascotas = useCallback(async () => {
    try {
      const response = await fetch('/api/mascotas');
      if (!response.ok) throw new Error('Error al cargar los datos');
      const data = await response.json();
      setMascotas(data);

      // Calcular estadísticas
      const totalMascotas = data.length;
      const perros = data.filter(m => m.especie.toLowerCase() === 'perro').length;
      const gatos = data.filter(m => m.especie.toLowerCase() === 'gato').length;
      const vacunadas = data.filter(m => m.vacunado).length;
      setEstadisticas({ totalMascotas, perros, gatos, vacunadas });

    } catch (error) {
      console.error("No se pudieron obtener los datos de las mascotas:", error);
      Swal.fire('Error', 'No se pudieron cargar los datos de las mascotas.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchMascotas();
  }, [fetchMascotas]);

  // --- MANEJADORES DE MODALES ---
  const handleOpenViewModal = (mascota) => { setMascotaSeleccionada(mascota); setIsViewModalOpen(true); };
  const handleCloseViewModal = () => setIsViewModalOpen(false);
  
  const handleOpenEditModal = (mascota) => {
    setMascotaSeleccionada(mascota);
    setEditFormData({
      nombre: mascota.nombre,
      raza: mascota.raza,
      fecha_nac: new Date(mascota.fecha_nac).toISOString().split('T')[0],
      peso: mascota.peso,
      observaciones: mascota.observaciones || '',
    });
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => setIsEditModalOpen(false);

  // --- LÓGICA DE FORMULARIO DE EDICIÓN ---
  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/mascotas/${mascotaSeleccionada.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'No se pudo actualizar la mascota.');
      }

      handleCloseEditModal();
      Swal.fire('¡Actualizado!', 'La mascota ha sido actualizada.', 'success');
      fetchMascotas(); // Recargamos la lista
    } catch (error) {
      Swal.fire('Error', error.toString(), 'error');
    }
  };

  // --- LÓGICA PARA DESACTIVAR MASCOTA ---
  const handleDeactivatePet = (mascota) => {
    const nuevoEstado = mascota.estado === 'Activo' ? 'Inactivo' : 'Activo';
    Swal.fire({
      title: `¿Seguro que quieres ${nuevoEstado === 'Inactivo' ? 'desactivar' : 'reactivar'} a ${mascota.nombre}?`,
      text: nuevoEstado === 'Inactivo' ? "La mascota se marcará como inactiva." : "La mascota volverá a estar activa.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Sí, ${nuevoEstado === 'Inactivo' ? 'desactivar' : 'reactivar'}`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/api/mascotas/${mascota.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado }),
          });
          if (!response.ok) throw new Error('No se pudo cambiar el estado.');
          
          Swal.fire('¡Cambiado!', `El estado de ${mascota.nombre} ha sido modificado.`, 'success');
          setMascotas(mascotas.map(m => m.id === mascota.id ? { ...m, estado: nuevoEstado } : m));
        } catch (error) {
          Swal.fire('Error', error.toString(), 'error');
        }
      }
    });
  };

  // --- Lógica de Filtrado y Renderizado ---
  const mascotasFiltradas = mascotas.filter((mascota) => 
    (mascota.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) || 
     mascota.propietario_nombre.toLowerCase().includes(filtros.busqueda.toLowerCase())) &&
    (filtros.especie === "todas" || mascota.especie.toLowerCase() === filtros.especie.toLowerCase())
  );
  
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
  const cardVariants = { hidden: { scale: 0.95, opacity: 0 }, visible: { scale: 1, opacity: 1 }, hover: { scale: 1.02, y: -5, transition: { duration: 0.2 } } };

  if (loading) {
    return (
      <div className="vet-mascotas-loading">
        <motion.div className="loading-spinner" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <PawPrint size={48} />
        </motion.div>
        <p>Cargando mascotas...</p>
      </div>
    );
  }

  return (
    <motion.div className="vet-mascotas-container" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="vet-mascotas-header" variants={itemVariants}>
        <div className="header-content">
          <h1><PawPrint className="header-icon" />Gestión de Mascotas</h1>
          <p>Administra y supervisa todas las mascotas registradas en el sistema</p>
        </div>
        <Link to="/mascotas" className="link-sin-linea">
          <motion.button className="btn-nuevo" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Plus size={20} />Nueva Mascota
          </motion.button>
        </Link>
      </motion.div>

      <motion.div className="estadisticas-grid" variants={itemVariants}>
        <div className="estadistica-card"><div className="estadistica-icon total"><Users size={24} /></div><div className="estadistica-info"><h3>{estadisticas.totalMascotas}</h3><p>Total Mascotas</p></div></div>
        <div className="estadistica-card"><div className="estadistica-icon perros"><Dog size={24} /></div><div className="estadistica-info"><h3>{estadisticas.perros}</h3><p>Perros</p></div></div>
        <div className="estadistica-card"><div className="estadistica-icon gatos"><Cat size={24} /></div><div className="estadistica-info"><h3>{estadisticas.gatos}</h3><p>Gatos</p></div></div>
        <div className="estadistica-card"><div className="estadistica-icon vacunadas"><Shield size={24} /></div><div className="estadistica-info"><h3>{estadisticas.vacunadas}</h3><p>Vacunadas</p></div></div>
      </motion.div>

      <motion.div className="filtros-container" variants={itemVariants}>
        <div className="busqueda-container">
          <Search className="busqueda-icon" />
          <input type="text" placeholder="Buscar por nombre de mascota o propietario..." value={filtros.busqueda} onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })} className="busqueda-input"/>
        </div>
        <div className="filtros-opciones">
          <div className="filtro-grupo">
            <Filter size={16} />
            <select value={filtros.especie} onChange={(e) => setFiltros({ ...filtros, especie: e.target.value })} className="filtro-select">
              <option value="todas">Todas las especies</option>
              <option value="Perro">Perros</option>
              <option value="Gato">Gatos</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div className="mascotas-grid">
        <AnimatePresence>
          {mascotasFiltradas.length > 0 ? (
            mascotasFiltradas.map((mascota) => (
              <motion.div key={mascota.id} className={`mascota-card ${mascota.estado === 'Inactivo' ? 'inactive' : ''}`} variants={cardVariants} initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.9 }} whileHover="hover">
                <div className="mascota-header">
                  <div className="mascota-avatar">{mascota.especie === "Perro" ? <Dog size={24} /> : <Cat size={24} />}</div>
                  <div className="mascota-info-basica"><h3>{mascota.nombre}</h3><p>{mascota.raza}</p></div>
                  <div className="mascota-acciones">
                    <motion.button title="Ver Detalles" className="btn-accion ver" onClick={() => handleOpenViewModal(mascota)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Eye size={16} /></motion.button>
                    <motion.button title="Editar" className="btn-accion editar" onClick={() => handleOpenEditModal(mascota)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Edit size={16} /></motion.button>
                    <motion.button title={mascota.estado === 'Activo' ? 'Desactivar' : 'Reactivar'} className={`btn-accion desactivar ${mascota.estado === 'Inactivo' ? 'reactivar' : ''}`} onClick={() => handleDeactivatePet(mascota)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Trash2 size={16} /></motion.button>
                  </div>
                </div>
                <div className="mascota-detalles">
                  <div className="detalle-item"><Weight size={16} /><span>{mascota.peso} kg</span></div>
                  <div className="detalle-item"><Calendar size={16} /><span>{mascota.edad}</span></div>
                  <div className="detalle-item"><Heart size={16} /><span>{mascota.genero}</span></div>
                </div>
                <div className="mascota-propietario"><p><strong>Propietario:</strong> {mascota.propietario_nombre}</p><p><strong>Teléfono:</strong> {mascota.propietario_telefono}</p></div>
                <div className="mascota-estado">
                  <span className={`estado-badge ${mascota.vacunado ? "vacunado" : "no-vacunado"}`}><Shield size={12} />{mascota.vacunado ? "Vacunado" : "Sin vacunar"}</span>
                  <span className="ultima-consulta">Última consulta: {mascota.ultimaConsulta ? new Date(mascota.ultimaConsulta).toLocaleDateString('es-ES') : 'N/A'}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="no-results">No se encontraron mascotas que coincidan con los filtros.</div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* MODAL DE VISTA */}
      <AnimatePresence>
        {isViewModalOpen && mascotaSeleccionada && (
          <motion.div className="modal-overlay" onClick={handleCloseViewModal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <div className="modal-header">
                <h2>{mascotaSeleccionada.especie === "Perro" ? <Dog size={24} /> : <Cat size={24} />}{mascotaSeleccionada.nombre}</h2>
                <button className="btn-cerrar" onClick={handleCloseViewModal}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="detalle-seccion"><h4>Información Básica</h4><div className="detalle-grid"><div><strong>Especie:</strong> {mascotaSeleccionada.especie}</div><div><strong>Raza:</strong> {mascotaSeleccionada.raza}</div><div><strong>Género:</strong> {mascotaSeleccionada.genero}</div><div><strong>Edad:</strong> {mascotaSeleccionada.edad}</div><div><strong>Peso:</strong> {mascotaSeleccionada.peso} kg</div><div><strong>Color:</strong> {mascotaSeleccionada.color}</div></div></div>
                <div className="detalle-seccion"><h4>Estado de Salud</h4><div className="detalle-grid"><div><strong>Vacunado:</strong> {mascotaSeleccionada.vacunado ? "Sí" : "No"}</div><div><strong>Estado Reproductivo:</strong> {mascotaSeleccionada.estadoReproductivo}</div><div><strong>Última Consulta:</strong> {mascotaSeleccionada.ultimaConsulta ? new Date(mascotaSeleccionada.ultimaConsulta).toLocaleDateString('es-ES') : 'N/A'}</div></div></div>
                <div className="detalle-seccion"><h4>Propietario</h4><div className="detalle-grid"><div><strong>Nombre:</strong> {mascotaSeleccionada.propietario_nombre}</div><div><strong>Teléfono:</strong> {mascotaSeleccionada.propietario_telefono}</div></div></div>
                <div className="detalle-seccion"><h4>Observaciones</h4><p>{mascotaSeleccionada.observaciones || 'Sin observaciones.'}</p></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn-secundario" onClick={handleCloseViewModal}>Cerrar</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* MODAL DE EDICIÓN */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div className="modal-overlay" onClick={handleCloseEditModal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <form onSubmit={handleEditFormSubmit}>
                <div className="modal-header">
                  <h2><Edit size={24} /> Editar a {mascotaSeleccionada?.nombre}</h2>
                  <button type="button" className="btn-cerrar" onClick={handleCloseEditModal}><X size={20} /></button>
                </div>
                <div className="modal-body">
                  <div className="edit-form-grid">
                    <div className="form-group"><label>Nombre</label><input type="text" name="nombre" value={editFormData.nombre} onChange={handleEditFormChange} required /></div>
                    <div className="form-group"><label>Raza</label><input type="text" name="raza" value={editFormData.raza} onChange={handleEditFormChange} required /></div>
                    <div className="form-group"><label>Fecha de Nacimiento</label><input type="date" name="fecha_nac" value={editFormData.fecha_nac} onChange={handleEditFormChange} required /></div>
                    <div className="form-group"><label>Peso (kg)</label><input type="number" step="0.1" name="peso" value={editFormData.peso} onChange={handleEditFormChange} required /></div>
                    <div className="form-group full-width"><label>Observaciones</label><textarea name="observaciones" value={editFormData.observaciones} onChange={handleEditFormChange} rows="4"></textarea></div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secundario" onClick={handleCloseEditModal}>Cancelar</button>
                  <button type="submit" className="btn-primario">Guardar Cambios</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default VetMascotas;