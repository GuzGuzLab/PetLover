import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import '../styles/Ubicacion.css'; 

const Ubicacion = () => {
  return (
    <section className="ubicacion-section">
      <div className="ubicacion-container">
        <h2 className="ubicacion-title">Nuestra Ubicación</h2>
        <div className="ubicacion-content">
          <div className="ubicacion-info">
            <InfoItem 
              icon={<FaMapMarkerAlt />}
              text="Cl. 12 #9 -58, Soacha, Cundinamarca"
            />
            <InfoItem 
              icon={<FaPhone />}
              text="+57 3214972944"
            />
            <InfoItem 
              icon={<FaEnvelope />}
              text="contacto@petlovers.com"
            />
            <InfoItem 
              icon={<FaClock />}
              text={<span>Lunes a Viernes: 9:00 AM - 4:00 PM<br />Sábados: 10:00 AM - 2:00 PM<br />Dominfo: Cerrado</span>}
            />
          </div>
          <div className="ubicacion-map">
          <iframe
              title="Ubicación Pet Lovers Spa Therapy"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3977.007047573952!2d-74.2208567!3d4.5839607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9f1dbb5a9d83%3A0x66d22c859134dc43!2sPet%20Lovers%20Spa%20Therapy!5e0!3m2!1ses!2sco!4v1620000000000!5m2!1ses!2sco"
              allowFullScreen
              loading="lazy"
              className="map-iframe"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

const InfoItem = ({ icon, text }) => (
  <div className="info-item">
    <span className="info-icon">{icon}</span>
    <p className="info-text">{text}</p>
  </div>
);

export default Ubicacion;