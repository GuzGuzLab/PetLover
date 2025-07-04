import "../../styles/Administrador/MenuAdmin.css"
import { useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { Users, Stethoscope, ShieldCheck, LogOut, ChevronDown, User, Menu } from 'lucide-react'

function MenuAdmin({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [adminName, setAdminName] = useState('Admin Usuario')
  const navigate = useNavigate()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleMouseEnter = () => {
    setDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    setDropdownOpen(false)
  }

  const handleProfileMouseEnter = () => {
    setProfileDropdownOpen(true)
  }

  const handleProfileMouseLeave = () => {
    setProfileDropdownOpen(false)
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div className="admin-dashboard-container">
      {/* Header Superior Azul */}
      <header className="admin-dashboard-header">
        <div className="admin-dashboard-header-content">
          <div className="admin-dashboard-header-left">
            <button className="admin-dashboard-mobile-toggle" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
          </div>
          
          {/* Solo Perfil en el header - SIN notificaciones */}
          <div className="admin-dashboard-header-right">
            <div 
              className={`admin-dashboard-profile-section ${profileDropdownOpen ? "admin-dashboard-profile-active" : ""}`}
              onMouseEnter={handleProfileMouseEnter}
              onMouseLeave={handleProfileMouseLeave}
            >
              <div className="admin-dashboard-profile-info">
                <div className="admin-dashboard-profile-avatar">
                  <User size={20} />
                </div>
                <div className="admin-dashboard-profile-details">
                  <span className="admin-dashboard-profile-name">{adminName}</span>
                  <span className="admin-dashboard-profile-role">Administrador</span>
                </div>
                <ChevronDown className="admin-dashboard-profile-chevron" size={16} />
              </div>
              <div className={`admin-dashboard-profile-dropdown ${profileDropdownOpen ? "admin-dashboard-dropdown-show" : ""}`}>
                <a href="/Miperfil" className="admin-dashboard-dropdown-item">
                  <User size={16} />
                  <span>Mi Perfil</span>
                </a>
                <a href="/configuracion" className="admin-dashboard-dropdown-item">
                  <ShieldCheck size={16} />
                  <span>Configuración</span>
                </a>
                <div className="admin-dashboard-dropdown-divider"></div>
                <button onClick={handleLogout} className="admin-dashboard-dropdown-item admin-dashboard-logout-btn">
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="admin-dashboard-main-wrapper">
        {/* Sidebar Izquierdo */}
        <nav className={`admin-dashboard-sidebar ${sidebarOpen ? "admin-dashboard-sidebar-open" : ""}`}>
          <ul className="admin-dashboard-nav-menu">
            <li>
              <a href="/InicioAdmin" className="admin-dashboard-nav-link">
                <Stethoscope className="admin-dashboard-nav-icon" size={18} />
                <span>Inicio</span>
              </a>
            </li>
            <li
              className={`admin-dashboard-dropdown-menu ${dropdownOpen ? "admin-dashboard-dropdown-active" : ""}`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <a href="#" className="admin-dashboard-dropdown-toggle admin-dashboard-nav-link">
                <Users className="admin-dashboard-nav-icon" size={18} />
                <span>Usuarios</span>
                <ChevronDown className="admin-dashboard-dropdown-chevron" size={16} />
              </a>
              <ul className={`admin-dashboard-dropdown-content ${dropdownOpen ? "admin-dashboard-dropdown-content-show" : ""}`}>
                <li>
                  <a href="/clientes" className="admin-dashboard-submenu-link">
                    <span>Clientes</span>
                  </a>
                </li>
                <li>
                  <a href="/Veterinarios" className="admin-dashboard-submenu-link">
                    <span>Veterinarios</span>
                  </a>
                </li>
                <li>
                  <a href="/Admin" className="admin-dashboard-submenu-link">
                    <span>Administradores</span>
                  </a>
                </li>
                <li>
                  <a href="/Roles" className="admin-dashboard-submenu-link">
                    <span>Roles</span>
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <a href="/ServiciosAdmin" className="admin-dashboard-nav-link">
                <Stethoscope className="admin-dashboard-nav-icon" size={18} />
                <span>Servicios</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Contenido Principal */}
        <main className="admin-dashboard-main-content">
          {children || <Outlet />}
        </main>
      </div>

      {sidebarOpen && <div className="admin-dashboard-sidebar-backdrop" onClick={toggleSidebar}></div>}
    </div>
  )
}

export default MenuAdmin;