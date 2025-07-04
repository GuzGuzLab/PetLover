// archivo: api/servicios.js (Versión Corregida y Optimizada)

const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // RUTA GET para obtener la lista de servicios
  router.get('/', (req, res) => {
    // --- ¡EL CONSOLE.LOG DEBE IR AQUÍ! ---
    console.log("📢 [GET /api/servicios] Petición de lista de servicios recibida.");

    // Seleccionamos solo los datos necesarios para el menú y los ordenamos
    const query = 'SELECT id, nombre FROM servicios WHERE estado = "Activo" ORDER BY nombre ASC';

    db.query(query, (err, results) => {
       console.log("🔍 Resultados de la BD para Servicios:", results);
      if (err) {
        console.error('Error al obtener los servicios:', err);
        return res.status(500).json({ error: 'Error al obtener los servicios' });
      }
      res.json(results);
    });
  });

  // RUTA POST para crear un nuevo servicio
  router.post('/', (req, res) => {
    // (Este console.log se quita de aquí, ya que no es para listar)
    const { nombre, descripcion, precio, duracion_estimada } = req.body;
    
    if (!nombre || !descripcion || !precio || !duracion_estimada) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const query = 'INSERT INTO servicios (nombre, descripcion, precio, duracion_estimada) VALUES (?, ?, ?, ?)';
    const values = [nombre, descripcion, precio, duracion_estimada];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al insertar el servicio' });
      }
      res.status(201).json({ message: 'Servicio registrado correctamente' });
    });
  });

  // RUTA DELETE para desactivar un servicio
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'UPDATE servicios SET estado = "Inactivo" WHERE id = ?';

    db.query(query, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al eliminar el servicio' });
      }
      res.json({ message: 'Servicio eliminado correctamente' });
    });
  });

  return router;
};