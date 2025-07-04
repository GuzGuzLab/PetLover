"use client"

import { Outlet, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import {
  FaUser,
  FaPaw,
  FaCalendarAlt,
  FaChevronRight,
  FaHome,
  FaClipboard,
  FaCog,
  FaSignOutAlt,
  FaCalendarPlus,
} from "react-icons/fa"
import { Link } from "react-router-dom"
import Swal from "sweetalert2"
import "../styles/User.css"

const UserLayout = () => {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()

  const [userData, setUserData] = useState({
    nombre: "",
    email: "",
  })

  const [mascotas, setMascotas] = useState([])

  useEffect(() => {
    const nombre = localStorage.getItem("nombre") || "Usuario"
    const email = localStorage.getItem("email") || "usuario@email.com"
    const doc = localStorage.getItem("doc_pro")

    setUserData({ nombre, email })

    if (doc) {
      fetch(`/api/mascotas/propietario/${doc}`)
        .then((res) => res.json())
        .then((data) => {
          setMascotas(data)
        })
        .catch((err) => console.error("Error cargando mascotas:", err))
    }
  }, [])

  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás segur@ de que deseas salir?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear()
        navigate("/login")
      }
    })
  }

  const menuItems = [
    {
      title: "Inicio",
      icon: <FaHome />,
      path: "/UserWelcome",
    },
    {
      title: "Mis Citas",
      icon: <FaCalendarAlt />,
      subItems: [
        { label: "Agendar Nueva Cita", path: "/AgendarCita", icon: <FaCalendarPlus /> },
        { label: "Próximas citas", path: "/citas-proximas" },
        { label: "Historial", path: "/historial-citas", icon: <FaClipboard /> },
      ],
    },
    {
      title: "Mis Mascotas",
      icon: <FaPaw />,
      subItems: mascotas.map((m) => ({
        label: m.nombre,
        path: `/mascota/${m.nombre.toLowerCase()}`,
      })),
    },
    {
      title: "Configuración",
      icon: <FaCog />,
      subItems: [
        { label: "Mi Cuenta", path: "/Datospro" },
        { label: "Ayuda", path: "/Ayudapro" },
        { label: "Actualizar Datos", path: "/Actualizarpro" },
      ],
    },
  ]

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span>{userData.nombre}</span>
        </div>
        <div className="topbar-right">
          <button className="btn-logout-top" onClick={handleLogout}>
            <FaSignOutAlt className="icon-logout-top" /> Cerrar sesión
          </button>
        </div>
      </div>

      <div className="user-dashboard">
        <div
          className={`sidebar ${expanded ? "expanded" : ""}`}
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
        >
          <div className="user-profile">
            {expanded && (
              <div className="user-info">
                <h3>{userData.nombre}</h3>
                <p>{userData.email}</p>
              </div>
            )}
          </div>

          <nav className="side-menu">
            {menuItems.map((item, index) => (
              <div key={index} className="menu-item">
                {item.path ? (
                  <Link to={item.path} className="menu-link" title={item.title}>
                    <span className="menu-icon">{item.icon}</span>
                    {expanded && <span className="menu-text">{item.title}</span>}
                  </Link>
                ) : (
                  <>
                    <div className="menu-header" title={item.title}>
                      <span className="menu-icon">{item.icon}</span>
                      {expanded && (
                        <>
                          <span className="menu-text">{item.title}</span>
                          <FaChevronRight className="menu-arrow" />
                        </>
                      )}
                    </div>
                    {expanded && item.subItems && (
                      <div className="submenu">
                        {item.subItems.map((subItem, subIndex) => (
                          <Link key={subIndex} to={subItem.path} className="submenu-item">
                            {subItem.icon && <span className="submenu-icon">{subItem.icon}</span>}
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}

            <div className="menu-item logout-item" onClick={handleLogout} style={{ cursor: "pointer" }}>
              <span className="menu-link" title="Cerrar sesión">
                <span className="menu-icon">
                  <FaUser />
                </span>
                {expanded && <span className="menu-text">Cerrar sesión</span>}
              </span>
            </div>
          </nav>
        </div>

        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default UserLayout
