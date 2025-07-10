"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { User, Search, Dog, ChevronRight, ChevronLeft, Users, Loader, Phone, Mail, Calendar } from "lucide-react"
import "../styles/UsuarioVet.css"

// --- SUB-COMPONENTES PARA MEJOR ORGANIZACIÓN ---

const StatCard = ({ icon, value, label, color }) => (
    <div className="stat-card">
        <div className={`stat-icon ${color}`}>{icon}</div>
        <div className="stat-info">
            <div className="value">{value}</div>
            <div className="label">{label}</div>
        </div>
    </div>
);

const PetCard = ({ pet }) => {
    const tieneCitaValida = pet.nextAppointment && pet.nextAppointment.date;
    const fechaFormateada = tieneCitaValida
      ? new Date(pet.nextAppointment.date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
      : "Sin citas programadas";

    // --- Animación individual para cada tarjeta de mascota ---
    const petCardVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div className="pet-card" variants={petCardVariants}>
            <div className="pet-card-info">
                <h4>{pet.name}</h4>
                <p>{pet.species} - {pet.breed}</p>
            </div>
            <div className={`pet-appointment ${!tieneCitaValida ? 'none' : ''}`}>
                <Calendar size={16} />
                <span>{fechaFormateada}</span>
            </div>
        </motion.div>
    );
};

// --- Componente OwnerCard con la animación mejorada ---
const OwnerCard = ({ owner, isExpanded, onToggle }) => {
    
    // ===== INICIO DE LA SECCIÓN DE ANIMACIÓN MEJORADA =====
    // Definimos las variantes para la animación del contenedor de mascotas
    const petSectionVariants = {
        collapsed: { 
            opacity: 0, 
            height: 0,
            transition: { duration: 0.2, ease: "easeOut" } 
        },
        expanded: { 
            opacity: 1, 
            height: "auto",
            transition: { 
                duration: 0.4, 
                ease: "easeInOut",
                // Esta línea hace que las tarjetas de mascota aparezcan una tras otra
                staggerChildren: 0.07 
            } 
        }
    };
    // ===== FIN DE LA SECCIÓN DE ANIMACIÓN MEJORADA =====

    return (
        <motion.div className="owner-card" layout>
            <div className="owner-header" onClick={() => onToggle(owner.id)}>
                <div className="owner-info-wrapper">
                    <div className="owner-avatar"><User size={24} /></div>
                    <div className="owner-main-details">
                        <h3 className="owner-name">{owner.name}</h3>
                        <div className="owner-contact-info">
                            <div className="contact-item"><Phone size={14} /><span>{owner.phone}</span></div>
                            <div className="contact-item"><Mail size={14} /><span>{owner.email}</span></div>
                        </div>
                    </div>
                </div>
                <div className="owner-actions">
                    <div className="pets-count">
                        <Dog size={16} />
                        <span>{owner.pets.length}</span>
                    </div>
                    <div className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                        <ChevronRight size={24} />
                    </div>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        key="content"
                        className="pets-section"
                        variants={petSectionVariants} // Usamos las variantes definidas arriba
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                    >
                        <div className="pets-grid">
                            {owner.pets.length > 0 ? (
                                owner.pets.map(pet => <PetCard key={pet.id} pet={pet} />)
                            ) : (
                                <p>Este propietario no tiene mascotas registradas.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};


// --- COMPONENTE PRINCIPAL ---
const UsuarioVet = () => {
    // ... (El resto del componente principal se mantiene exactamente igual)
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedOwners, setExpandedOwners] = useState(new Set());

    const fetchOwners = useCallback(async (doc) => {
        setLoading(true);
        let url = '/api/propietarios';
        if (doc) {
            url += `?doc=${doc}`;
        }
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar propietarios');
            const data = await response.json();
            setOwners(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setOwners([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchOwners(searchTerm);
        }, 500);
        return () => clearTimeout(debounce);
    }, [searchTerm, fetchOwners]);

    const toggleOwnerExpansion = (ownerId) => {
        const newSet = new Set(expandedOwners);
        newSet.has(ownerId) ? newSet.delete(ownerId) : newSet.add(ownerId);
        setExpandedOwners(newSet);
    };

    const totalPets = useMemo(() => 
        owners.reduce((acc, owner) => acc + (owner.pets ? owner.pets.length : 0), 0)
    , [owners]);

    return (
        <div className="usuarios-vet-container">
            <header className="page-header">
                <div className="title-section">
                    <Link to="/VeterinarioPer" className="back-button" title="Volver al Inicio">
                        <ChevronLeft size={20} />
                    </Link>
                    <div className="page-title">
                        <h1>Propietarios y Mascotas</h1>
                        <p>Gestiona la información de tus clientes y sus pacientes.</p>
                    </div>
                </div>
            </header>
            
            <section className="stats-container">
                <StatCard icon={<Users size={24}/>} value={owners.length} label="Total de Propietarios" color="propietarios" />
                <StatCard icon={<Dog size={24}/>} value={totalPets} label="Total de Mascotas" color="mascotas" />
            </section>
            
            <section className="filters-container">
                <div className="filter-group">
                    <Search size={18} className="input-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por documento del propietario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                    />
                </div>
            </section>

            <main className="owner-list">
                {loading ? (
                    <div><Loader /> Cargando...</div>
                ) : owners.length > 0 ? (
                    owners.map(owner => (
                        <OwnerCard
                            key={owner.id}
                            owner={owner}
                            isExpanded={expandedOwners.has(owner.id)}
                            onToggle={toggleOwnerExpansion}
                        />
                    ))
                ) : (
                    <div className="empty-state">No se encontraron propietarios.</div>
                )}
            </main>
        </div>
    );
};

export default UsuarioVet;