import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="header">
      <div className="logo-container">
        <img 
          src="https://raw.githubusercontent.com/Nore0729/Img-soft-veterinario/refs/heads/main/GuzPet.png" 
          alt="Logo GuzPet" 
          className="logo" 
        />
      </div>

      {/* Menú Hamburguesa solo en móvil */}
      {!isDesktop && (
        <button 
          className={`hamburger-btn ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menú"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}

      {/* Contenido del Header - visible en desktop o cuando el menú móvil está abierto */}
      <div className={`header-content ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <nav className="nav-menu">
          <ul className="menu-list">
            <li>
              <Link to="/" className="nav-link" onClick={() => !isDesktop && setIsMobileMenuOpen(false)}>Inicio</Link>
            </li>
            <li>
              <Link to="/servicios" className="nav-link" onClick={() => !isDesktop && setIsMobileMenuOpen(false)}>Servicios</Link>
            </li>
            <li>
              <Link to="/ubicacion" className="nav-link" onClick={() => !isDesktop && setIsMobileMenuOpen(false)}>Ubicación</Link>
            </li>
            <li>
              <Link to="/AyudaU" className="nav-link" onClick={() => !isDesktop && setIsMobileMenuOpen(false)}>Ayuda</Link>
            </li>
            {/* <li>
              <Link to="/mascotas" className="nav-link" onClick={() => !isDesktop && setIsMobileMenuOpen(false)}>Mascotas</Link>
            </li>
            <li>
              <Link to="/contacto" className="nav-link" onClick={() => !isDesktop && setIsMobileMenuOpen(false)}>Contacto</Link>
            </li> */}
          </ul>
        </nav>

        <div className="header-buttons">
          <Link 
            to="/propietarios" 
            className="register-btn"
            onClick={() => !isDesktop && setIsMobileMenuOpen(false)}
          >
            Regístrate
          </Link>
          <Link 
            to="/login" 
            className="login-btn"
            onClick={() => !isDesktop && setIsMobileMenuOpen(false)}
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;