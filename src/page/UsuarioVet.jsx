"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Phone,
  Mail,
  Dog,
  Calendar,
  Clock,
  ChevronRight,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react"
import "../styles/UsuarioVet.css" // Asegúrate de que la ruta a tu CSS es correcta

const OwnersList = () => {
  // --- ESTADOS DEL COMPONENTE ---
  const [ownersData, setOwnersData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [expandedOwners, setExpandedOwners] = useState(new Set())

  // --- FUNCIÓN PARA OBTENER DATOS DEL BACKEND (CORREGIDA) ---
  const fetchOwners = useCallback(async (doc) => {
    setIsLoading(true);
    
    // Usamos una ruta relativa que funcionará correctamente
    let url = '/api/propietarios'; 
    
    // Si hay un término de búsqueda, lo añadimos como un parámetro de query
    if (doc) {
      url += `?doc=${doc}`;
    }
  
    try {
      const response = await fetch(url); // La URL ahora es correcta
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOwnersData(data);
    } catch (error) {
      console.error("No se pudieron obtener los datos de los propietarios:", error);
      setOwnersData([]); // En caso de error, dejamos la lista vacía
    } finally {
      setIsLoading(false);
    }
  }, []); // El array de dependencias vacío asegura que la función no se recree innecesariamente

  // --- useEffect PARA BÚSQUEDA Y CARGA INICIAL ---
  useEffect(() => {
    // Debounce para no sobrecargar la API con cada letra tecleada
    const debounceHandler = setTimeout(() => {
      fetchOwners(searchTerm);
    }, 500);

    return () => {
      clearTimeout(debounceHandler);
    };
  }, [searchTerm, fetchOwners]);


  // --- FUNCIONES AUXILIARES Y DE MANEJO DE UI ---
  const toggleOwnerExpansion = (ownerId) => {
    const newExpanded = new Set(expandedOwners);
    if (newExpanded.has(ownerId)) {
      newExpanded.delete(ownerId);
    } else {
      newExpanded.add(ownerId);
    }
    setExpandedOwners(newExpanded);
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmada": return "status-confirmed";
      case "programada": return "status-pending";
      case "completada": return "status-completed";
      case "cancelada": return "status-cancelled";
      default: return "status-default";
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmada": return <CheckCircle className="status-icon" />;
      case "programada": return <AlertCircle className="status-icon" />;
      default: return <Calendar className="status-icon" />;
    }
  }

  const filteredOwners = ownersData.filter((owner) => {
    if (!owner.pets) return true; // Si por alguna razón no hay mascotas, no lo filtramos
    const hasPendingAppointments = owner.pets.some(
      (pet) => pet && pet.pendingAppointments > 0
    );
    if (filterStatus === "all") return true;
    if (filterStatus === "with-appointments") return hasPendingAppointments;
    if (filterStatus === "no-appointments") return !hasPendingAppointments;
    return true;
  });

  // --- RENDERIZADO DEL COMPONENTE ---

  if (isLoading) {
    return (
      <div className="loading-state">
        <Loader className="loading-icon" />
        <p>Cargando propietarios...</p>
      </div>
    );
  }

  return (
    <motion.div className="owners-container">
      <motion.div className="owners-header">
        <h1 className="owners-title">Propietarios y Mascotas</h1>
        <p className="owners-subtitle">Gestiona la información de todos los propietarios y sus mascotas.</p>
      </motion.div>

      <motion.div className="owners-filters">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por documento del propietario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-container">
          <Filter className="filter-icon" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
            <option value="all">Todos los propietarios</option>
            <option value="with-appointments">Con citas pendientes</option>
            <option value="no-appointments">Sin citas pendientes</option>
          </select>
        </div>
      </motion.div>

      <AnimatePresence>
        {filteredOwners.length > 0 ? (
          filteredOwners.map((owner) => (
            <motion.div key={owner.id} className="owner-card-container">
              <div className="owner-card">
                <div className="owner-header" onClick={() => toggleOwnerExpansion(owner.id)}>
                    <div className="owner-info">
                        <div className="owner-avatar"><User className="owner-avatar-icon" /></div>
                        <div className="owner-details">
                            <h3 className="owner-name">{owner.name}</h3>
                            <p className="owner-summary">
                                {owner.pets.length} mascota{owner.pets.length !== 1 ? 's' : ''}
                            </p>
                            <div className="owner-contact">
                                <Phone className="contact-icon" /><span>{owner.phone}</span>
                                <Mail className="contact-icon" /><span>{owner.email}</span>
                            </div>
                        </div>
                    </div>
                    <div className="owner-actions">
                        <motion.div className="expand-button" animate={{ rotate: expandedOwners.has(owner.id) ? 90 : 0 }}>
                            <ChevronRight className="expand-icon" />
                        </motion.div>
                    </div>
                </div>

                <AnimatePresence>
                  {expandedOwners.has(owner.id) && (
                    <motion.div
                      className="pets-section"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="pets-grid">
                        {owner.pets.map((pet) => pet && (
                          <motion.div key={pet.id} className="pet-card">
                            <div className="pet-info">
                              <h5 className="pet-name">{pet.name}</h5>
                              <p className="pet-breed">{pet.breed} • {pet.age}</p>
                              {pet.nextAppointment ? (
                                <div className={`next-appointment ${getStatusClass(pet.nextAppointment.status)}`}>
                                  <div className="appointment-info">
                                    <span className="appointment-date">
                                      {getStatusIcon(pet.nextAppointment.status)}
                                      {pet.nextAppointment.service}
                                    </span>
                                    <span className="appointment-time">
                                      {new Date(pet.nextAppointment.date + 'T00:00:00').toLocaleDateString('es-ES', {day: '2-digit', month: 'long'})}, {pet.nextAppointment.time}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="no-appointment">
                                  <span>Sin citas programadas</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div className="empty-state">
            <User className="empty-icon" />
            <h3 className="empty-title">No se encontraron propietarios</h3>
            <p className="empty-message">Intenta con otro término de búsqueda o ajusta los filtros.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default OwnersList;