// archivo: api/servicios.js

const express = require('express');
const router = express.Router();

module.exports = (db) => {

  // ✅ RUTA GET para obtener la lista de servicios con todos los campos
  router.get('/', (req, res) => {
    console.log("📢 [GET /api/servicios] Petición de lista de servicios recibida.");

    const query = `
      SELECT id, nombre, descripcion, precio, duracion_estimada
      FROM servicios
      WHERE estado = "Activo"
      ORDER BY nombre ASC
    `;

    db.query(query, (err, results) => {
      console.log("🔍 Resultados de la BD para Servicios:", results);
      if (err) {
        console.error('❌ Error al obtener los servicios:', err);
        return res.status(500).json({ error: 'Error al obtener los servicios' });
      }
      res.json(results);
    });
  });

  // ✅ RUTA POST para crear un nuevo servicio
  router.post('/', (req, res) => {
    const { nombre, descripcion, precio, duracion_estimada } = req.body;

    if (!nombre || !descripcion || !precio || !duracion_estimada) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const query = `
      INSERT INTO servicios (nombre, descripcion, precio, duracion_estimada)
      VALUES (?, ?, ?, ?)
    `;
    const values = [nombre, descripcion, precio, duracion_estimada];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('❌ Error al insertar el servicio:', err);
        return res.status(500).json({ error: 'Error al insertar el servicio' });
      }
      res.status(201).json({ message: '✅ Servicio registrado correctamente' });
    });
  });

  // ✅ RUTA DELETE para desactivar un servicio (estado = Inactivo)
  router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const query = `
      UPDATE servicios
      SET estado = "Inactivo"
      WHERE id = ?
    `;

    db.query(query, [id], (err, result) => {
      if (err) {
        console.error('❌ Error al eliminar el servicio:', err);
        return res.status(500).json({ error: 'Error al eliminar el servicio' });
      }
      res.json({ message: '✅ Servicio eliminado correctamente' });
    });
  });



  //actualiar servicios 
router.put('/servicios/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, duracion_estimada } = req.body;

  // Validación básica de los datos recibidos
  if (!nombre || !descripcion || !precio || !duracion_estimada) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  const query = `
    UPDATE servicios 
    SET 
      nombre = ?, 
      descripcion = ?, 
      precio = ?, 
      duracion_estimada = ?
    WHERE id = ?;
  `;

  db.query(query, [nombre, descripcion, precio, duracion_estimada, id], (err, result) => {
    if (err) {
      console.error("Error al actualizar el servicio:", err);
      return res.status(500).json({ error: "Error en la base de datos al actualizar el servicio." });
    }

    // Verificar si alguna fila fue afectada para saber si el servicio existía
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Servicio no encontrado." });
    }

    res.status(200).json({ 
      success: true,
      message: "Servicio actualizado exitosamente."
    });
  });
});


  return router;
};
