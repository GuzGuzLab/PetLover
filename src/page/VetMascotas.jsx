"use client"

import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import Swal from 'sweetalert2';
import {
  Dog, Cat, Search, Filter, Plus, Eye, Edit, Calendar, Weight, Shield, PawPrint, X, Trash2, ChevronLeft
} from "lucide-react";
import "../styles/VetMascotas.css"; // Asegúrate que la ruta al CSS sea correcta

// --- SUB-COMPONENTES ---

const StatCard = ({ icon, value, label, color }) => (
    <div className="stat-card" style={{ '--accent-color': color }}>
        <div className={`stat-icon ${color}`}>{icon}</div>
        <div className="stat-info">
            <div className="value">{value}</div>
            <div className="label">{label}</div>
        </div>
    </div>
);

const PetCard = ({ mascota, onView, onEdit, onDeactivate }) => (
    <motion.div
        className={`vet_pet_card ${mascota.estado === 'Inactivo' ? 'inactive' : ''}`}
        layout initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
    >
        {/* Contenedor de acciones posicionado absolutamente */}
        <div className="vet_card_actions">
            <button className="vet_action_btn view" title="Ver Detalles" onClick={() => onView(mascota)}><Eye size={16} /></button>
            <button className="vet_action_btn edit" title="Editar" onClick={() => onEdit(mascota)}><Edit size={16} /></button>
            <button
                className={`vet_action_btn ${mascota.estado === 'Activo' ? 'deactivate' : 'reactivate'}`}
                title={mascota.estado === 'Activo' ? 'Desactivar' : 'Reactivar'}
                onClick={() => onDeactivate(mascota)}
            >
                <Trash2 size={16} />
            </button>
        </div>

        <div className="vet_card_header">
            <div className="pet-info">
                <div className="pet-avatar">{mascota.especie === "Perro" ? <Dog size={24} /> : <Cat size={24} />}</div>
                <div>
                    <h3 className="pet-name">{mascota.nombre}</h3>
                    <p className="pet-breed">{mascota.raza}</p>
                </div>
            </div>
        </div>

        <div className="card-body">
            <div className="pet-details-grid">
                <div className="detail-item"><span className="value">{mascota.peso} kg</span><span className="label">Peso</span></div>
                <div className="detail-item"><span className="value">{mascota.edad}</span><span className="label">Edad</span></div>
                <div className="detail-item"><span className="value">{mascota.genero}</span><span className="label">Género</span></div>
            </div>
            <div className="owner-info">
                <span>Propietario: <strong>{mascota.propietario_nombre}</strong></span>
            </div>
        </div>
        <div className="card-footer">
            <div className={`status-badge ${mascota.vacunado ? "vacunado" : "no-vacunado"}`}>
                <Shield size={12} />{mascota.vacunado ? "Vacunado" : "Sin Vacunar"}
            </div>
            <span className="ultima-consulta">
                Últ. Consulta: {mascota.ultimaConsulta ? new Date(mascota.ultimaConsulta).toLocaleDateString('es-ES') : 'N/A'}
            </span>
        </div>
    </motion.div>
);

const ViewPetModal = ({ mascota, isOpen, onClose }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div className="modal-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="modal-content" onClick={(e) => e.stopPropagation()} initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}>
                    <div className="modal-header">
                        <h2><PawPrint /> {mascota.nombre}</h2>
                        <button className="btn-cerrar" onClick={onClose}><X /></button>
                    </div>
                    <div className="modal-body">
                        {/* ... contenido del modal ... */}
                    </div>
                    <div className="modal-footer"><button type="button" className="btn-secundario" onClick={onClose}>Cerrar</button></div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const EditPetModal = ({ mascota, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (mascota) {
            setFormData({
                nombre: mascota.nombre || '',
                raza: mascota.raza || '',
                fecha_nac: mascota.fecha_nac ? new Date(mascota.fecha_nac).toISOString().split('T')[0] : '',
                peso: mascota.peso || 0,
            });
        }
    }, [mascota]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(mascota.id, formData);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                 <motion.div className="modal-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.div className="modal-content" onClick={(e) => e.stopPropagation()} initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}>
                        <form onSubmit={handleSubmit}>
                            {/* ... contenido del formulario del modal ... */}
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


// --- COMPONENTE PRINCIPAL ---
const VetMascotas = () => {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ busqueda: "", especie: "todas" });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const fetchMascotas = useCallback(async () => {
    try {
      setLoading(true);
      // Simulación de datos. Reemplazar con la llamada a la API real.
      const mockMascotas = [
         { id: 1, nombre: 'Luna', especie: 'Gato', raza: 'Siamés', peso: 4.2, edad: '2 años', genero: 'Hembra', propietario_nombre: 'Felipe Nieves', estado: 'Activo', vacunado: true, ultimaConsulta: null },
         { id: 2, nombre: 'Rocky', especie: 'Perro', raza: 'Golden Retriever', peso: 28, edad: '5 años', genero: 'Macho', propietario_nombre: 'Ana Torres', estado: 'Activo', vacunado: true, ultimaConsulta: '2023-10-15' },
         { id: 3, nombre: 'Mishi', especie: 'Gato', raza: 'Común', peso: 3.5, edad: '1 año', genero: 'Hembra', propietario_nombre: 'Carlos Soto', estado: 'Inactivo', vacunado: false, ultimaConsulta: '2023-05-20' },
      ];
      setMascotas(mockMascotas);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar las mascotas.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMascotas(); }, [fetchMascotas]);

  const handleDeactivatePet = (mascota) => {
    const nuevoEstado = mascota.estado === 'Activo' ? 'Inactivo' : 'Activo';
    const actionText = nuevoEstado === 'Inactivo' ? 'desactivar' : 'reactivar';
    Swal.fire({
      title: `¿Seguro que quieres ${actionText} a ${mascota.nombre}?`,
      icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33', confirmButtonText: `Sí, ${actionText}`
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Lógica para cambiar el estado
        Swal.fire('¡Cambiado!', `El estado ha sido modificado.`, 'success');
        fetchMascotas();
      }
    });
  };

  const handleSavePet = async (petId, formData) => {
    // Lógica para guardar
    setIsEditModalOpen(false);
    Swal.fire('¡Actualizado!', 'La mascota ha sido actualizada.', 'success');
    fetchMascotas();
  };

  const mascotasFiltradas = useMemo(() =>
    mascotas.filter(m =>
      (m.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
       m.propietario_nombre.toLowerCase().includes(filtros.busqueda.toLowerCase())) &&
      (filtros.especie === "todas" || m.especie.toLowerCase() === filtros.especie.toLowerCase())
  ), [mascotas, filtros]);

  const estadisticas = useMemo(() => {
    const total = mascotas.length;
    const perros = mascotas.filter(m => m.especie.toLowerCase() === 'perro').length;
    const gatos = total - perros;
    const vacunadas = mascotas.filter(m => m.vacunado).length;
    return { total, perros, gatos, vacunadas };
  }, [mascotas]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="mascotas-page-container">
        <header className="page-header">
            <div className="title-section">
                <Link to="/VeterinarioPer" className="back-button" title="Volver al Inicio"><ChevronLeft size={20} /></Link>
                <div className="page-title">
                    <h1>Gestión de Mascotas</h1>
                    <p>Administra y supervisa todas las mascotas registradas.</p>
                </div>
            </div>
            <div className="header-actions">
                <Link to="/mascotas" className="btn-nuevo"><Plus size={18} /> Nueva Mascota</Link>
            </div>
        </header>

        <section className="stats-container">
            <StatCard icon={<PawPrint size={24}/>} value={estadisticas.total} label="Total Mascotas" color="#0d6efd" />
            <StatCard icon={<Dog size={24}/>} value={estadisticas.perros} label="Perros" color="#6f42c1" />
            <StatCard icon={<Cat size={24}/>} value={estadisticas.gatos} label="Gatos" color="#db2777" />
            <StatCard icon={<Shield size={24}/>} value={estadisticas.vacunadas} label="Vacunadas" color="#198754" />
        </section>

        <section className="filters-container">
            <div className="filter-group">
                <Search size={18} className="input-icon" />
                <input type="text" placeholder="Buscar por nombre de mascota o propietario..." value={filtros.busqueda} onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })} className="form-input"/>
            </div>
            <div className="filter-group">
                <Filter size={18} className="input-icon" />
                <select value={filtros.especie} onChange={(e) => setFiltros({ ...filtros, especie: e.target.value })} className="form-select">
                    <option value="todas">Todas las especies</option>
                    <option value="Perro">Perros</option>
                    <option value="Gato">Gatos</option>
                </select>
            </div>
        </section>

        <main className="mascotas-grid">
            <AnimatePresence>
                {mascotasFiltradas.length > 0 ? (
                    mascotasFiltradas.map((mascota) => (
                        <PetCard
                            key={mascota.id}
                            mascota={mascota}
                            onView={(pet) => { setSelectedPet(pet); setIsViewModalOpen(true); }}
                            onEdit={(pet) => { setSelectedPet(pet); setIsEditModalOpen(true); }}
                            onDeactivate={handleDeactivatePet}
                        />
                    ))
                ) : (
                    <div className="empty-state">No se encontraron mascotas.</div>
                )}
            </AnimatePresence>
        </main>

        <ViewPetModal
            mascota={selectedPet}
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
        />
        <EditPetModal
            mascota={selectedPet}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSavePet}
        />
    </div>
  );
};

export default VetMascotas;