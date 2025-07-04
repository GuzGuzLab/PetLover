
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import '../styles/Cookies.css';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = Cookies.get('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    Cookies.set('cookie_consent', 'accepted', { expires: 365 });
    setShowBanner(false);
  };

  const handleReject = () => {
    Cookies.set('cookie_consent', 'rejected', { expires: 365 });
    setShowBanner(false);
  };

  const handleLearnMore = () => {
    window.open('/politica-cookies', '_blank');
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="cookie-overlay" />
      <div className="cookie-banner">
        <p className="cookie-text">
          Usamos cookies para mejorar tu experiencia en <span className="highlight">Petlovers</span>. Estas cookies nos ayudan a personalizar contenido, analizar el tráfico y ofrecer funciones útiles. Puedes aceptarlas para disfrutar una experiencia completa, rechazarlas o ver más información.
        </p>
        <div className="cookie-actions">
          <button onClick={handleAccept} className="cookie-button accept">Aceptar</button>
          <button onClick={handleReject} className="cookie-button reject">Rechazar</button>
          <button onClick={handleLearnMore} className="cookie-button info">Más información</button>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;
