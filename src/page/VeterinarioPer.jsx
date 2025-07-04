"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Home, CalendarPlus, Stethoscope, Users2, Dog, LogOut, Menu, X } from "lucide-react"
import "../styles/VeterinarioPer.css"
import { logoutWithConfirmation } from "../services/authUtils"

const Veterinarios = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleLogout = () => {
    const logoutButton = document.querySelector(".vet-header-logout")
    if (logoutButton) {
      logoutButton.style.animation = "fadeOutRight 0.4s forwards"
      setTimeout(() => {
        logoutWithConfirmation()
      }, 400)
    } else {
      logoutWithConfirmation()
    }
  }

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  const logoutVariants = {
    initial: {
      scale: 1,
      rotateX: 0,
    },
    hover: {
      scale: 1.05,
      rotateX: 10,
      y: -3,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    tap: {
      scale: 0.95,
      rotateX: -5,
      transition: { duration: 0.1 },
    },
  }

  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
        staggerChildren: 0.1,
      },
    },
    closed: {
      x: -240,
      opacity: 0.8,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  }

  const menuItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    hover: {
      x: 8,
      scale: 1.02,
      transition: { duration: 0.2 },
    },
  }

  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.3 },
    },
  }
    //----------------------------------------------------------------------------
    //----------------------------------------------------------------------------
    //-----------------------------RUTAS-----------------------------------------
    //----------------------------------------------------------------------------
    //----------------------------------------------------------------------------
  const menuItems = [
    { icon: Home, text: "Inicio", to: "/InicioVeterinario", description: "Panel principal del sistema" },
    { icon: CalendarPlus, text: "Citas", to: "/CitasVet", description: "Gestiona citas médicas" },
    { icon: Stethoscope, text: "Consultas", to: "/ConsultasVet", description: "Historial de consultas" },
    { icon: Users2, text: "Usuarios", to: "/UsuarioVet", description: "Administrar usuarios" },
    { icon: Dog, text: "Mascotas", to: "/VetMascotas", description: "Registro de mascotas" },
  ]

  return (
    <motion.div className="veterinarios-container" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.header className="vet-header" variants={headerVariants}>
        <motion.div
          className="vet-header-logo"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          PET LOVERS
        </motion.div>

        <motion.div
          className="vet-header-right"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div className="vet-header-usuario" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <span>Veterinario</span>
            <motion.div
              className="vet-usuario-avatar"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <span>V</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="vet-header-logout"
            variants={logoutVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onClick={handleLogout}
          >
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
              <LogOut className="vet-icon" />
            </motion.div>
            <span>Cerrar sesión</span>
          </motion.div>
        </motion.div>
      </motion.header>

      <div className="vet-body">
        {/* Sidebar */}
        <motion.nav
          className={`vet-sidebar ${sidebarOpen ? "open" : ""}`}
          variants={sidebarVariants}
          animate={sidebarOpen ? "open" : "closed"}
        >
          <motion.ul>
            {menuItems.map((item, index) => (
              <motion.li
                key={item.text}
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className="menu-item-icon"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <item.icon className="vet-icon" />
                </motion.div>
                <Link to={item.to}>{item.text}</Link>
              </motion.li>
            ))}
          </motion.ul>

          {/* Botón toggle sidebar para móvil */}
          <motion.button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </motion.nav>

        {/* Contenido Principal */}
        <motion.main className="vet-content" variants={contentVariants} initial="hidden" animate="visible">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Bienvenido a Pet Lovers
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Elige una opción del menú para empezar.
          </motion.p>

          {/* Cards de acceso rápido animadas */}
          <motion.div
            className="quick-access-cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {menuItems.slice(0, 3).map((item, index) => (
              <motion.div
                key={item.text}
                className="quick-card"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                whileHover={{
                  y: -5,
                  scale: 1.02,
                  boxShadow: "0 10px 25px rgba(6, 182, 212, 0.15)",
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to={item.to} className="quick-card-link">
                  <motion.div
                    className="quick-card-icon"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <item.icon size={24} />
                  </motion.div>
                  <h3>{item.text}</h3>
                  <p>{item.description}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.main>
      </div>

      {/* Overlay para móvil */}
      <AnimatePresence>
        {!sidebarOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Veterinarios
