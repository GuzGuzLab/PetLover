"use client"

import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import {
  Stethoscope, Search, Filter, Plus, Eye, Edit, Calendar, User, Dog, Cat, X, ChevronLeft,
  Clipboard, Clock, Activity, Trash2 as Trash
} from "lucide-react";
import "../styles/ConsultasVet.css";

// =====================================================================
// ========== SUB-COMPONENTES (CON CLASES ACTUALIZADAS) ==========
// =====================================================================

const StatCard = ({ icon, value, label, color }) => (
    <div className="stat-card">
        <div className={`stat-icon ${color}`}>{icon}</div>
        <div className="stat-info"><div className="value">{value}</div><div className="label">{label}</div></div>
    </div>
);

const ConsultaCard = ({ consulta, onView, onEdit, onDelete }) => (
    <motion.div className="vet_consulta_card" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        {/* Contenedor de acciones posicionado absolutamente */}
        <div className="vet_consulta_actions">
            <button className="vet_consulta_action_btn view" title="Ver Detalles" onClick={() => onView(consulta)}><Eye size={16} /></button>
            <button className="vet_consulta_action_btn edit" title="Editar" onClick={() => onEdit(consulta)}><Edit size={16} /></button>
            <button className="vet_consulta_action_btn delete" title="Eliminar" onClick={() => onDelete(consulta.id)}><Trash size={16} /></button>
        </div>

        <div className="vet_consulta_header">
            <span className="fecha-info"><Calendar size={14} /> {consulta.fecha}</span>
        </div>
        <div className="card-body">
            <div className="pet-info">
                <div className="pet-avatar">{consulta.mascota.especie === "Perro" ? <Dog size={24} /> : <Cat size={24} />}</div>
                <div>
                    <h3 className="pet-name">{consulta.mascota.nombre}</h3>
                    <p className="owner-name"><User size={14} /> {consulta.mascota.propietario}</p>
                </div>
            </div>
            <div className="consulta-summary">
                <p><strong>Motivo:</strong> {consulta.motivo}</p>
                <p><strong>Diagnóstico:</strong> {consulta.diagnostico || 'Pendiente'}</p>
            </div>
        </div>
    </motion.div>
);

const ConsultaViewModal = ({ consulta, onClose, onEdit }) => {
    if (!consulta) return null;

    return (
        <motion.div className="modal-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" onClick={(e) => e.stopPropagation()} initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}>
                <div className="modal-header">
                    <h2><Stethoscope size={24} /> Detalle de Consulta</h2>
                    <button className="btn-cerrar" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <div className="details-section">
                        <h4>Información General</h4>
                        <div className="details-grid">
                            <div className="detail-item"><strong>Fecha y Hora:</strong> <span>{consulta.fecha} - {consulta.hora}</span></div>
                            <div className="detail-item"><strong>Veterinario:</strong> <span>{consulta.veterinario}</span></div>
                        </div>
                    </div>
                    <div className="details-section">
                        <h4>Paciente</h4>
                        <div className="details-grid">
                            <div className="detail-item"><strong>Mascota:</strong> <span>{consulta.mascota.nombre}</span></div>
                            <div className="detail-item"><strong>Especie:</strong> <span>{consulta.mascota.especie}</span></div>
                            <div className="detail-item"><strong>Raza:</strong> <span>{consulta.mascota.raza}</span></div>
                            <div className="detail-item"><strong>Propietario:</strong> <span>{consulta.mascota.propietario}</span></div>
                        </div>
                    </div>
                    <div className="details-section">
                        <h4>Análisis Clínico</h4>
                        <div className="detail-text-block"><strong>Motivo:</strong><p>{consulta.motivo}</p></div>
                        <div className="detail-text-block"><strong>Diagnóstico:</strong><p>{consulta.diagnostico || 'No especificado.'}</p></div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-secundario" onClick={onClose}>Cerrar</button>
                    <button className="btn-primario" onClick={() => onEdit(consulta)}><Edit size={16} /> Editar</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const ConsultaFormModal = ({ isOpen, onClose, onSubmit, formData, setFormData, modoEdicion, ...formProps }) => {
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div className="modal-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.div className="modal-content" onClick={(e) => e.stopPropagation()} initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}>
                        <div className="modal-header"><h2><Plus size={24} /> {modoEdicion ? 'Editar Consulta' : 'Nueva Consulta'}</h2><button className="btn-cerrar" onClick={onClose}><X size={20} /></button></div>
                        <form onSubmit={onSubmit} className="modal-body">
                            <div className="form-grid">
                                <div className="form-group"><label>Propietario</label><select value={formProps.propietarioSeleccionado} onChange={(e) => formProps.handlePropietarioChange(e.target.value)} required><option value="">Seleccionar propietario</option>{formProps.listaPropietarios.map(p => (<option key={p.doc} value={p.doc}>{p.nombre}</option>))}</select></div>
                                <div className="form-group"><label>Mascota</label><select name="mascota_id" value={formData.mascota_id} onChange={handleFormChange} disabled={!formProps.propietarioSeleccionado || formProps.cargandoMascotas} required><option value="">{formProps.cargandoMascotas ? 'Cargando...' : 'Seleccionar mascota'}</option>{formProps.mascotasDelPropietario.map(m => (<option key={m.id} value={m.id}>{m.nombre}</option>))}</select></div>
                                <div className="form-group"><label>Fecha</label><input type="date" name="fecha" value={formData.fecha || ''} onChange={handleFormChange} required /></div>
                                <div className="form-group"><label>Hora</label><input type="time" name="hora" value={formData.hora || ''} onChange={handleFormChange} required /></div>
                                <div className="form-group full-width"><label>Veterinario</label><select name="vet_id" value={formData.vet_id} onChange={handleFormChange} required><option value="">Seleccionar veterinario</option>{formProps.listaVeterinarios.map(v => (<option key={v.vet_id} value={v.vet_id}>{v.nombre}</option>))}</select></div>
                                <div className="form-group full-width"><label>Motivo de consulta</label><textarea name="motivo_consulta" value={formData.motivo_consulta || ''} onChange={handleFormChange} required></textarea></div>
                                <div className="form-group full-width"><label>Diagnóstico</label><textarea name="diagnostico" value={formData.diagnostico || ''} onChange={handleFormChange}></textarea></div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secundario" onClick={onClose}>Cancelar</button>
                                <button type="submit" className="btn-primario" disabled={formProps.enviando}>{formProps.enviando ? 'Guardando...' : 'Guardar'}</button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- COMPONENTE PRINCIPAL ---
const VetConsultas = () => {
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({ busqueda: "", fechaInicio: "", fechaFin: "" });
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedConsulta, setSelectedConsulta] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [formData, setFormData] = useState({});
    const [listaPropietarios, setListaPropietarios] = useState([]);
    const [listaVeterinarios, setListaVeterinarios] = useState([]);
    const [propietarioSeleccionado, setPropietarioSeleccionado] = useState('');
    const [mascotasDelPropietario, setMascotasDelPropietario] = useState([]);
    const [cargandoMascotas, setCargandoMascotas] = useState(false);
    const [enviando, setEnviando] = useState(false);

    // Simulación de datos. Reemplazar con llamadas a API.
    const fetchData = useCallback(async () => {
        setLoading(true);
        const mockConsultas = [
            { id: 1, fecha: '2025-07-09', hora: '10:30', veterinario: 'Dr. Smith', motivo: 'Chequeo anual', diagnostico: 'Saludable', mascota: { id: 1, nombre: 'Rocky', especie: 'Perro', raza: 'Golden', propietario: 'Ana Torres' } },
            { id: 2, fecha: '2025-07-08', hora: '15:00', veterinario: 'Dra. Jones', motivo: 'Vómitos', diagnostico: 'Gastroenteritis', mascota: { id: 2, nombre: 'Luna', especie: 'Gato', raza: 'Siamés', propietario: 'Felipe Nieves' } }
        ];
        const mockPropietarios = [{ doc: '123', nombre: 'Ana Torres' }, { doc: '456', nombre: 'Felipe Nieves' }];
        const mockVeterinarios = [{ vet_id: 1, nombre: 'Dr. Smith' }, { vet_id: 2, nombre: 'Dra. Jones' }];
        
        setConsultas(mockConsultas);
        setListaPropietarios(mockPropietarios);
        setListaVeterinarios(mockVeterinarios);
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handlePropietarioChange = async (doc) => {
        setPropietarioSeleccionado(doc);
        setMascotasDelPropietario([]);
        setFormData(prev => ({ ...prev, mascota_id: '' }));
        if (!doc) return;
        setCargandoMascotas(true);
        // Simulación
        setTimeout(() => {
            if (doc === '123') setMascotasDelPropietario([{ id: 1, nombre: 'Rocky' }]);
            if (doc === '456') setMascotasDelPropietario([{ id: 2, nombre: 'Luna' }]);
            setCargandoMascotas(false);
        }, 500);
    };

    const openNewForm = () => {
        setModoEdicion(false);
        setFormData({ mascota_id: '', vet_id: '', fecha: '', hora: '', motivo_consulta: '', diagnostico: '' });
        setPropietarioSeleccionado('');
        setMascotasDelPropietario([]);
        setIsFormModalOpen(true);
    };

    const openEditForm = (consulta) => {
        // Lógica para abrir el formulario de edición
        setModoEdicion(true);
        setSelectedConsulta(consulta);
        // ... resto de la lógica ...
        setIsViewModalOpen(false);
        setIsFormModalOpen(true);
    };
    
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        // ... Lógica de envío ...
        setTimeout(() => {
            setEnviando(false);
            setIsFormModalOpen(false);
            Swal.fire('¡Éxito!', modoEdicion ? 'Consulta actualizada.' : 'Consulta creada.', 'success');
            fetchData();
        }, 1000);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: '¿Estás seguro?', text: "No podrás revertir esto.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, eliminar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Lógica para eliminar
                Swal.fire('¡Eliminado!', 'La consulta ha sido eliminada.', 'success');
                fetchData();
            }
        });
    };
    
    // ... Lógica de filtros y estadísticas ...
    const consultasFiltradas = useMemo(() => {
        // ...
        return consultas;
    }, [consultas, filtros]);

    const estadisticas = useMemo(() => {
        // ...
        return { total: 2, esteMes: 2, mascotasUnicas: 2, seguimientos: 0 };
    }, [consultas]);

    if (loading) return <div className="loading-state"><h3>Cargando Historial Médico...</h3></div>;

    return (
        <div className="consultas-page-container">
            <header className="consultas-header">
                <div className="consultas-title-section">
                    <Link to="/VeterinarioPer" className="consultas-back-button" title="Volver al Inicio"><ChevronLeft size={20} /></Link>
                    <div className="consultas-title"><h1>Historial Médico</h1><p>Visualiza y gestiona todas las consultas.</p></div>
                </div>
                <div className="consultas-actions">
                    <button onClick={openNewForm} className="btn-nuevo"><Plus size={18} /> Nueva Consulta</button>
                </div>
            </header>

            <section className="consultas-controls">
                {/* ... */}
            </section>
            
            <main className="consultas-grid">
                {consultasFiltradas.length > 0 ? (
                    consultasFiltradas.map(consulta => (
                        <ConsultaCard 
                            key={consulta.id}
                            consulta={consulta}
                            onView={(data) => { setSelectedConsulta(data); setIsViewModalOpen(true); }}
                            onEdit={openEditForm}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <div className="empty-state"><h3>No se encontraron consultas.</h3></div>
                )}
            </main>
            
            <AnimatePresence>
                {isViewModalOpen && <ConsultaViewModal consulta={selectedConsulta} onClose={() => setIsViewModalOpen(false)} onEdit={openEditForm} />}
            </AnimatePresence>
            
            <ConsultaFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                formData={formData}
                setFormData={setFormData}
                modoEdicion={modoEdicion}
                listaPropietarios={listaPropietarios}
                propietarioSeleccionado={propietarioSeleccionado}
                handlePropietarioChange={handlePropietarioChange}
                mascotasDelPropietario={mascotasDelPropietario}
                cargandoMascotas={cargandoMascotas}
                listaVeterinarios={listaVeterinarios}
                enviando={enviando}
            />
        </div>
    );
};

export default VetConsultas;