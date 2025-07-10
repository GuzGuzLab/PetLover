"use client"

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, User, Dog, Phone, Mail, Plus, Search, Filter,
  Edit, Trash2, CheckCircle, XCircle, AlertCircle, X, ChevronLeft
} from "lucide-react";
import Swal from 'sweetalert2';
import "../styles/CitasVet.css"; // Tu nuevo archivo CSS

// --- COMPONENTES REFACTORIZADOS PARA MEJOR ORGANIZACIÓN ---

// Componente para la Tarjeta de Cita
const AppointmentCard = ({ appointment, onEdit, onDelete, onStatusChange }) => {
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmada": return "status-confirmada";
      case "programada": return "status-programada";
      case "completada": return "status-completada";
      case "cancelada": return "status-cancelada";
      default: return "";
    }
  };

  return (
    <motion.div 
        className="appointment-card"
        layout
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
    >
      <div className="card-main-content">
        <div className="pet-info">
          <div className="pet-avatar"><Dog size={24} /></div>
          <div>
            <h3 className="pet-name">{appointment.petName}</h3>
            <p className="owner-name">{appointment.ownerName}</p>
          </div>
        </div>
        <div className="appointment-time-info">
          <div className="info-line"><Calendar size={16} /><span>{new Date(appointment.date).toLocaleDateString("es-ES", { timeZone: 'UTC' })}</span></div>
          <div className="info-line"><Clock size={16} /><span>{appointment.time}</span></div>
        </div>
        <div className="card-actions">
          <button className="action-button edit" onClick={() => onEdit(appointment)} title="Editar"><Edit size={18} /></button>
          <button className="action-button delete" onClick={() => onDelete(appointment.id)} title="Eliminar"><Trash2 size={18} /></button>
        </div>
      </div>
      <div className="card-footer">
        <span className="service-badge">{appointment.service}</span>
        <div className="status-badge">
          <div className={`status-display ${getStatusClass(appointment.status)}`}>
            {appointment.status || 'Sin estado'}
          </div>
          <select value={appointment.status} className="status-select" onChange={(e) => onStatusChange(appointment.id, e.target.value)}>
            <option value="programada">Programada</option>
            <option value="confirmada">Confirmada</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
};

// Componente para el Modal de Edición
const EditModal = ({ isOpen, onClose, appointment, onFormChange, onFormSubmit, formData, veterinarios }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="modal-content" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Editar Cita</h2>
            <button onClick={onClose} className="btn-cerrar"><X size={24} /></button>
          </div>
          <form onSubmit={onFormSubmit} className="modal-body">
            <div className="edit-form">
              <div className="form-group">
                  <label>Servicio</label>
                  <input type="text" name="servicio_nombre" value={formData.servicio_nombre || ''} onChange={onFormChange} required />
              </div>
              <div className="form-group">
                  <label>Veterinario</label>
                  <select name="vet_id" value={formData.vet_id || ''} onChange={onFormChange} required>
                      <option value="">Seleccione un veterinario</option>
                      {veterinarios.map(v => <option key={v.vet_id} value={v.vet_id}>Dr. {v.nombre}</option>)}
                  </select>
              </div>
              <div className="form-group">
                  <label>Fecha</label>
                  <input type="date" name="fecha_hora" value={formData.fecha_hora || ''} onChange={onFormChange} required />
              </div>
              <div className="form-group">
                  <label>Hora</label>
                  <input type="time" name="time" value={formData.time || ''} onChange={onFormChange} required />
              </div>
              <div className="form-group">
                  <label>Notas</label>
                  <textarea name="motivo" value={formData.motivo || ''} onChange={onFormChange}></textarea>
              </div>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn-secundario" onClick={onClose}>Cancelar</button>
                <button type="submit" className="btn-primario">Guardar Cambios</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- COMPONENTE PRINCIPAL ---
const VeterinaryAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [veterinarios, setVeterinarios] = useState([]);

  const fetchAllData = useCallback(async () => {
    try {
      const [appRes, vetRes] = await Promise.all([
        fetch('http://localhost:3000/api/citasvet'),
        fetch('http://localhost:3000/api/veterinarios')
      ]);
      if (!appRes.ok || !vetRes.ok) throw new Error("Error al cargar datos iniciales");
      setAppointments(await appRes.json());
      setVeterinarios(await vetRes.json());
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      Swal.fire('Error', 'No se pudieron cargar los datos.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAllData();
  }, [fetchAllData]);

  const handleOpenEditModal = (appointment) => {
    setCurrentAppointment(appointment);
    const datePart = appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '';
    setEditFormData({
        servicio_nombre: appointment.service || '', 
        vet_id: appointment.veterinario_id || '',
        fecha_hora: datePart,
        time: appointment.time || '',
        motivo: appointment.notes || ''
    });
    setIsEditModalOpen(true);
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
      setIsEditModalOpen(false);
      Swal.fire({ title: '¡Actualizado!', icon: 'success', timer: 1500, showConfirmButton: false });
      fetchAllData();
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar la cita.', 'error');
    }
  };

  const handleDeleteAppointment = (appointmentId) => {
    Swal.fire({
      title: '¿Estás seguro?', text: "¡No podrás revertir esto!", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminar!', cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:3000/api/citasvet/${appointmentId}`, { method: 'DELETE' });
          if (!response.ok) throw new Error('No se pudo eliminar la cita.');
          Swal.fire('¡Eliminado!', 'La cita ha sido eliminada.', 'success');
          fetchAllData();
        } catch (error) {
          Swal.fire('Error', 'No se pudo eliminar la cita.', 'error');
        }
      }
    });
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/api/citasvet/${appointmentId}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('No se pudo actualizar el estado.');
      fetchAllData();
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
    }
  };

  const filteredAppointments = appointments.filter((appointment) => 
    (appointment.petName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     appointment.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === "all" || appointment.status?.toLowerCase() === statusFilter)
  );

  return (
    <div className="citas-vet-container">
      <header className="citas-page-header">
        <div className="citas-title-section">
          <Link to="/VeterinarioPer" className="citas-back-button" title="Volver al inicio">
            <ChevronLeft size={20} />
          </Link>
          <div className="citas-title">
            <h1>Gestión de Citas</h1>
            <p>Organiza, edita y visualiza todas las citas programadas.</p>
          </div>
        </div>
        <div className="citas-header-actions">
          <Link to="/citas" className="appointments-new-button">
            <Plus size={18} />
            <span>Nueva Cita</span>
          </Link>
        </div>
      </header>

      <section className="citas-controls">
        <div className="filter-group">
          <Search size={18} className="input-icon" />
          <input type="text" placeholder="Buscar por mascota o propietario..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input"/>
        </div>
        <div className="filter-group">
          <Filter size={18} className="input-icon" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select">
            <option value="all">Todos los estados</option>
            <option value="programada">Programada</option>
            <option value="confirmada">Confirmada</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </section>

      {loading ? (
        <div className="loading-state">
            <div className="icon-container"><Calendar size={48} /></div>
            <h3>Cargando citas...</h3>
        </div>
      ) : (
        <AnimatePresence>
            <div className="appointments-list">
            {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteAppointment}
                    onStatusChange={handleStatusChange}
                />
                ))
            ) : (
                <div className="empty-state">
                    <div className="icon-container"><Calendar size={48} /></div>
                    <h3>No se encontraron citas</h3>
                    <p>No hay citas que coincidan con tus filtros de búsqueda.</p>
                </div>
            )}
            </div>
        </AnimatePresence>
      )}

      <EditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        appointment={currentAppointment}
        formData={editFormData}
        onFormChange={(e) => setEditFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
        onFormSubmit={handleEditFormSubmit}
        veterinarios={veterinarios}
      />
    </div>
  );
};

export default VeterinaryAppointments;