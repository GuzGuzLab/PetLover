"use client"

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, User, Dog, Phone, Mail, Plus, Search, Filter,
  Edit, Trash2, CheckCircle, XCircle, AlertCircle, X,
} from "lucide-react";
import Swal from 'sweetalert2';
import "../styles/CitasVet.css";

const VeterinaryAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const [servicios, setServicios] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);

  // Función centralizada para cargar todos los datos
  const fetchAllData = async () => {
    try {
      const [appRes, servRes, vetRes] = await Promise.all([
        fetch('http://localhost:3000/api/citasvet'),
        fetch('http://localhost:3000/api/servicios'),
        fetch('http://localhost:3000/api/veterinarios')
      ]);
      
      if (!appRes.ok || !servRes.ok || !vetRes.ok) throw new Error("Error al cargar datos iniciales");

      setAppointments(await appRes.json());
      setServicios(await servRes.json());
      setVeterinarios(await vetRes.json());

    } catch (error) {
      console.error("Error al cargar los datos:", error);
      Swal.fire('Error', 'No se pudieron cargar los datos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // useEffect para la carga inicial
  useEffect(() => {
    setLoading(true);
    fetchAllData();
  }, []);

  // --- Manejadores para el MODAL DE EDICIÓN ---
  const handleOpenEditModal = (appointment) => {
    setCurrentAppointment(appointment);
    // *** AJUSTE REALIZADO AQUÍ ***
    // Se usan los campos correctos que vienen de la API modificada
    setEditFormData({
        servicio_nombre: appointment.service || '', 
        vet_id: appointment.veterinario_id, 
        fecha_hora: appointment.date,
        time: appointment.time,
        motivo: appointment.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => setIsEditModalOpen(false);

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    if (!currentAppointment) return;
    try {
        const response = await fetch(`http://localhost:3000/api/citasvet/${currentAppointment.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editFormData),
        });
        if (!response.ok) throw new Error('No se pudo actualizar la cita.');
        
        handleCloseEditModal();
        await Swal.fire({
            title: '¡Actualizado!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
        fetchAllData(); // Recargar datos para ver los cambios
    } catch (error) {
        console.error("Error al actualizar la cita:", error);
        Swal.fire('Error', 'No se pudo actualizar la cita.', 'error');
    }
  };

  // --- Manejadores para la TARJETA DE CITA ---
  const handleDeleteAppointment = (appointmentId) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esta acción!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:3000/api/citasvet/${appointmentId}`, { method: 'DELETE' });
          if (!response.ok) throw new Error('No se pudo eliminar la cita.');
          setAppointments(prev => prev.filter(app => app.id !== appointmentId));
          Swal.fire('¡Eliminado!', 'La cita ha sido eliminada.', 'success');
        } catch (error) {
          console.error("Error al eliminar la cita:", error);
          Swal.fire('Error', 'No se pudo eliminar la cita.', 'error');
        }
      }
    });
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    const originalAppointments = [...appointments];
    setAppointments(prev => prev.map(app => app.id === appointmentId ? { ...app, status: newStatus } : app));
    try {
      const response = await fetch(`http://localhost:3000/api/citasvet/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
        setAppointments(originalAppointments);
      }
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      Swal.fire('Error', 'Error de conexión.', 'error');
      setAppointments(originalAppointments);
    }
  };

  // --- Lógica de renderizado y filtros ---
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmada": return "status-confirmed";
      case "programada": return "status-pending"; // 'programada' es el nuevo 'pendiente'
      case "completada": return "status-completed";
      case "cancelada": return "status-cancelled";
      default: return "status-default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmada": return <CheckCircle className="status-icon" />;
      case "programada": return <AlertCircle className="status-icon" />;
      case "completada": return <CheckCircle className="status-icon" />;
      case "cancelada": return <XCircle className="status-icon" />;
      default: return <AlertCircle className="status-icon" />;
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const searchLower = searchTerm.toLowerCase();
    const statusLower = appointment.status ? appointment.status.toLowerCase() : '';
    const matchesSearch =
      (appointment.petName && appointment.petName.toLowerCase().includes(searchLower)) ||
      (appointment.ownerName && appointment.ownerName.toLowerCase().includes(searchLower));
    const matchesStatus = statusFilter === "all" || statusLower === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const cardVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  if (loading) {
    return (
      <div className="appointments-container">
        <h2 className="loading-message">Cargando Citas...</h2>
      </div>
    );
  }

  return (
    <motion.div className="appointments-container" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="appointments-header">
        <div className="appointments-header-content">
            <div className="appointments-title-container"><h1 className="appointments-title">Gestión de Citas</h1><p className="appointments-subtitle">Administra las citas veterinarias</p></div>
            <Link to="/citas" className="appointments-new-button"><Plus className="button-icon" />Nueva Cita</Link>
        </div>
      </motion.div>

      <motion.div className="appointments-filters">
        <div className="search-container"><Search className="search-icon" /><input type="text" placeholder="Buscar por mascota o propietario..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input"/></div>
        <div className="filter-container">
          <Filter className="filter-icon" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="all">Todos los estados</option>
            {/* *** AJUSTE REALIZADO AQUÍ *** */}
            <option value="programada">Programada</option>
            <option value="confirmada">Confirmada</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </motion.div>
      
      <motion.div className="appointments-list">
        <AnimatePresence>
          {filteredAppointments.map((appointment) => (
            <motion.div key={appointment.id} className="appointment-card-container" variants={cardVariants}>
              <div className="appointment-card">
                <div className="appointment-content">
                  <div className="appointment-info">
                    <div className="appointment-pet-info"><div className="pet-avatar"><Dog className="pet-icon" /></div><div className="pet-details"><h3 className="pet-name">{appointment.petName}</h3><p className="owner-name"><User className="owner-icon" />{appointment.ownerName}</p></div></div>
                    <div className="appointment-details">
                      <div className="appointment-detail"><Calendar className="detail-icon" /><span>{new Date(appointment.date).toLocaleDateString("es-ES", { timeZone: 'UTC' })}</span></div>
                      <div className="appointment-detail"><Clock className="detail-icon" /><span>{appointment.time}</span></div>
                      <div className="appointment-detail"><Phone className="detail-icon" /><span>{appointment.phone}</span></div>
                      <div className="appointment-detail"><Mail className="detail-icon" /><span>{appointment.email}</span></div>
                    </div>
                    <div className="appointment-badges">
                      <div className={`status-badge-container ${getStatusClass(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        {/* *** AJUSTE REALIZADO AQUÍ *** */}
                        <select value={appointment.status} className="status-select" onChange={(e) => handleStatusChange(appointment.id, e.target.value)}>
                          <option value="programada">Programada</option>
                          <option value="confirmada">Confirmada</option>
                          <option value="completada">Completada</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      </div>
                      <span className="service-badge">{appointment.service}</span>
                    </div>
                    {appointment.notes && (<p className="appointment-notes"><strong>Notas:</strong> {appointment.notes}</p>)}
                  </div>
                  <div className="appointment-actions">
                    <motion.button className="action-button edit-button" onClick={() => handleOpenEditModal(appointment)}><Edit size={16} /></motion.button>
                    <motion.button className="action-button delete-button" onClick={() => handleDeleteAppointment(appointment.id)}><Trash2 size={16} /></motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredAppointments.length === 0 && !loading && (
        <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="empty-icon-container"><Calendar className="empty-icon" /></div>
          <h3 className="empty-title">No hay citas</h3>
          <p className="empty-message">No se encontraron citas que coincidan con los filtros. ¡Intenta crear una nueva!</p>
        </motion.div>
      )}

      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Editar Cita</h2>
                <button onClick={handleCloseEditModal} className="btn-cerrar"><X size={24} /></button>
              </div>
              <div className="modal-body">
                {currentAppointment && 
                  <form onSubmit={handleEditFormSubmit} className="edit-form">
                    {/* *** AJUSTE REALIZADO AQUÍ *** */}
                    <div className="form-group">
                        <label>Servicio</label>
                        <input 
                            type="text"
                            name="servicio_nombre" 
                            value={editFormData.servicio_nombre || ''}
                            onChange={handleEditFormChange} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Veterinario</label>
                        <select name="vet_id" value={editFormData.vet_id || ''} onChange={handleEditFormChange} required>
                            {veterinarios.map(v => <option key={v.vet_id} value={v.vet_id}>Dr. {v.nombre}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Fecha</label>
                        <input type="date" name="fecha_hora" value={editFormData.fecha_hora || ''} onChange={handleEditFormChange} required />
                    </div>
                    <div className="form-group">
                        <label>Hora</label>
                        <input type="time" name="time" value={editFormData.time || ''} onChange={handleEditFormChange} required />
                    </div>
                    <div className="form-group">
                        <label>Notas</label>
                        <textarea name="motivo" value={editFormData.motivo || ''} onChange={handleEditFormChange}></textarea>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secundario" onClick={handleCloseEditModal}>Cancelar</button>
                        <button type="submit" className="btn-primario">Guardar Cambios</button>
                    </div>
                  </form>
                }
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VeterinaryAppointments;