// api/citasvet.js

const express = require('express');
const router = express.Router();

module.exports = function(db) {

  // GET: Obtener TODAS las citas para la lista
  router.get('/', (req, res) => {
  // La consulta ahora se adapta a la estructura de la BD
  const sql = `
    SELECT
      c.id,
      m.nombre AS petName,
      p.nombre AS ownerName,
      p.tel AS phone,
      p.email AS email,
      c.fecha,                               -- Obtenemos la fecha
      c.hora,                                -- Obtenemos la hora
      c.servicio AS service,                 -- Obtenemos el nombre del servicio directamente
      c.estado AS status,
      c.notas AS notes,
      c.veterinario_id,                      -- Pasamos el ID del veterinario
      vet_user.nombre AS veterinario
    FROM citas c
    JOIN mascotas m ON c.mascota_id = m.id
    JOIN usuarios p ON m.doc_pro = p.doc
    JOIN veterinarios v ON c.veterinario_id = v.vet_id -- Unión corregida
    JOIN usuarios vet_user ON v.vet_id = vet_user.id
    ORDER BY c.fecha, c.hora ASC;
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error al consultar citas:", err);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
    
    // "Traducimos" los resultados para el frontend
    const citasFormateadas = results.map(cita => {
      const fechaJS = new Date(cita.fecha);
      const [hora, minutos] = cita.hora.split(':');
      fechaJS.setUTCHours(hora, minutos);

      return {
        ...cita,
        // Creamos los campos 'date' y 'time' que el frontend espera
        date: fechaJS.toISOString().split('T')[0],
        time: `${hora}:${minutos}`
      };
    });
    res.status(200).json(citasFormateadas);
  });
});

  // GET: Obtener UNA SOLA cita por su ID (para rellenar el formulario de edición)
  router.put('/:id', (req, res) => {
  const citaId = req.params.id;
  // Esperamos los nombres de campo que envía el formulario de edición
  const { servicio_nombre, vet_id, fecha_hora, time, motivo } = req.body;

  const sql = `
    UPDATE citas 
    SET 
      servicio = ?, 
      veterinario_id = ?, 
      fecha = ?, 
      hora = ?, 
      notas = ? 
    WHERE id = ?`;
  
  const params = [servicio_nombre, vet_id, fecha_hora, time, motivo, citaId];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("❌ Error al actualizar la cita:", err);
      return res.status(500).json({ error: 'Error al actualizar la cita.' });
    }
    res.status(200).json({ message: 'Cita actualizada exitosamente' });
  });
});
  // PUT: Actualizar una cita existente por su ID
  router.put('/:id', (req, res) => {
    const citaId = req.params.id;
    const { servicio_id, vet_id, fecha_hora, time, motivo } = req.body;
    const fechaHoraCompleta = `${fecha_hora} ${time}:00`;
    const sql = `UPDATE citas SET servicio_id = ?, vet_id = ?, fecha_hora = ?, notas = ? WHERE id = ?`;
    const params = [servicio_id, vet_id, fechaHoraCompleta, motivo, citaId];
    db.query(sql, params, (err, result) => {
      if (err) {
        console.error("❌ Error al actualizar la cita:", err);
        return res.status(500).json({ error: 'Error al actualizar la cita.' });
      }
      res.status(200).json({ message: 'Cita actualizada exitosamente' });
    });
  });
  
  // POST: Crear una nueva cita
  router.post('/', (req, res) => {
    const { mascota_id, vet_id, servicio_id, fecha_hora, time, motivo } = req.body;
    if (!mascota_id || !vet_id || !servicio_id || !fecha_hora || !time) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }
    const fechaHoraCompleta = `${fecha_hora} ${time}:00`;
    const sql = `INSERT INTO citas (mascota_id, vet_id, servicio_id, fecha_hora, notas, estado) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [mascota_id, vet_id, servicio_id, fechaHoraCompleta, motivo, 'Pendiente'];
    db.query(sql, params, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al agendar la cita.' });
      res.status(201).json({ message: "Cita agendada exitosamente", citaId: result.insertId });
    });
  });

  // PATCH: Actualizar solo el estado de una cita
  router.patch('/:id/status', (req, res) => {
    const { status } = req.body;
    const sql = "UPDATE citas SET estado = ? WHERE id = ?";
    db.query(sql, [status, req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: "Error interno del servidor." });
      res.status(200).json({ message: "Estado actualizado correctamente." });
    });
  });
  
  // DELETE: Eliminar una cita por su ID
  router.delete('/:id', (req, res) => {
    const sql = "DELETE FROM citas WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: "Error interno del servidor." });
      res.status(200).json({ message: "Cita eliminada exitosamente." });
    });
  });

  return router;
};