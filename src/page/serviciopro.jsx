import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Servicios.css";

function PanelServicios() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:3000/api/servicios")
      .then(res => setServices(res.data))
      .catch(err => console.error("Error al cargar servicios:", err));
  }, []);

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="service-panel-container">
      <h1 className="service-panel-title">Servicios Veterinarios PetLovers</h1>
      <p className="service-panel-description">Ofrecemos una amplia gama de servicios para el cuidado y bienestar de tu mascota</p>

      <div className="service-grid">
        {services.map((service) => (
          <div key={service.id} className="service-card" onClick={() => handleServiceClick(service)}>
            <div className="service-card-content">
              <div className="service-icon-container">🔧</div> {/* Puedes agregar SVG según el nombre */}
              <h3 className="service-title">{service.nombre}</h3>
              <p className="service-description">{service.descripcion?.slice(0, 70) + "..."}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedService && (
        <div className="service-modal-backdrop" onClick={closeModal}>
          <div className="service-modal" onClick={(e) => e.stopPropagation()}>
            <div className="service-modal-header">
              <h3 className="service-modal-title">{selectedService.nombre}</h3>
              <button className="service-modal-close-x" onClick={closeModal}>×</button>
            </div>
            <p className="service-modal-description">{selectedService.descripcion}</p>
            <div className="service-modal-details">
              <div className="service-modal-detail">
                <span className="service-modal-label">Precio:</span>
                <span className="service-modal-value">${selectedService.precio} COP</span>
              </div>
              <div className="service-modal-detail">
                <span className="service-modal-label">Duración:</span>
                <span className="service-modal-value">{selectedService.duracion_estimada} minutos</span>
              </div>
            </div>
            <div className="service-modal-actions">
              <button className="service-modal-close" onClick={closeModal}>Cerrar</button>
              <button className="service-modal-reserve" onClick={() => window.location.href = "/Login"}>Reservar Cita</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PanelServicios;