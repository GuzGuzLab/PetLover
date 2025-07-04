import React, { useEffect, useState } from "react"
import axios from "axios"

const CitasProximas = () => {
  const [citas, setCitas] = useState([])
  const [doc, setDoc] = useState("")

  useEffect(() => {
    const storedDoc = localStorage.getItem("doc_pro")
    setDoc(storedDoc)

    if (storedDoc) {
      axios
        .get(`http://localhost:3000/api/citas/propietario_doc=${storedDoc}`)
        .then((res) => setCitas(res.data))
        .catch((err) => console.error("Error al cargar citas:", err))
    }
  }, [])

  return (
    <div>
      <h2>Citas Próximas</h2>
      {citas.length > 0 ? (
        <ul>
          {citas.map((cita) => (
            <li key={cita.id}>
              <strong>{cita.fecha}</strong> a las <strong>{cita.hora}</strong> — {cita.servicio}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay citas próximas.</p>
      )}
    </div>
  )
}

export default CitasProximas
