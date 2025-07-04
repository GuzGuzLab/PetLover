import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch } from "@fortawesome/free-solid-svg-icons"
import "../../styles/Administrador/Administrador.css"
import AdminLayout from "../../layout/AdminLayout"

function Administradores() {
  const [administradores, setAdministradores] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [rolFiltro, setRolFiltro] = useState("")

  useEffect(() => {
    const obtenerAdministradores = async () => {
      try {
        const respuesta = await fetch("http://localhost:3000/api/admin/obtener_administradores")
        const datos = await respuesta.json()

        const administradoresFormateados = datos.map((admin, index) => ({
          id: index + 1,
          nombre: admin.nombre,
          email: admin.email,
          telefono: admin.tel,
          rol: admin.nivel_acceso || "Administrador",
          estado: "Activo",
          foto: "", 
        }))

        setAdministradores(administradoresFormateados)
      } catch (error) {
        console.error("Error al obtener administradores:", error)
      }
    }

    obtenerAdministradores()
  }, [])

  const administradoresFiltrados = administradores.filter((admin) => {
    const coincideBusqueda =
      admin.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      admin.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      admin.rol.toLowerCase().includes(busqueda.toLowerCase())

    const coincideRol = rolFiltro ? admin.rol === rolFiltro : true

    return coincideBusqueda && coincideRol
  })

  const roles = [...new Set(administradores.map((admin) => admin.rol))]

  return (
    <AdminLayout>
      <div className="administradores-container">
        <h1>Administradores del Sistema</h1>

        <div className="controles-superiores">
          <div className="busqueda-container">
            <input
              type="text"
              placeholder="Buscar administradores..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <FontAwesomeIcon icon={faSearch} className="icono-busqueda" />
          </div>
        </div>

        <div className="tabla-container">
          <table className="tabla-administradores">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {administradoresFiltrados.map((admin) => (
                <tr key={admin.id} className={admin.estado === "Inactivo" ? "fila-inactiva" : ""}>
                  <td>
                    <img
                      src={admin.foto || "https://via.placeholder.com/50?text=Admin"}
                      alt={admin.nombre}
                      className="foto-administrador"
                    />
                  </td>
                  <td>{admin.nombre}</td>
                  <td>{admin.email}</td>
                  <td>{admin.telefono || "-"}</td>
                  <td>
                    <span className={`badge-rol ${admin.rol.toLowerCase().replace(/\s+/g, "-")}`}>{admin.rol}</span>
                  </td>
                  <td>
                    <span className={`badge-estado ${admin.estado.toLowerCase()}`}>{admin.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {administradoresFiltrados.length === 0 && (
          <p className="sin-resultados">
            {busqueda || rolFiltro
              ? "No se encontraron administradores con ese criterio"
              : "No hay administradores registrados"}
          </p>
        )}
      </div>
    </AdminLayout>
  )
}

export default Administradores
