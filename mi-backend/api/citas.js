const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Crear nueva cita
  router.post('/', (req, res) => {
    const {
      propietario_doc,
      mascota_id,
      servicio,
      veterinario_id,
      fecha,
      hora,
      notas,
      estado,
    } = req.body;

    if (!propietario_doc || !mascota_id || !servicio || !veterinario_id || !fecha || !hora) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const sql = `
      INSERT INTO citas 
      (propietario_doc, mascota_id, servicio, veterinario_id, fecha, hora, notas, estado) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        propietario_doc,
        mascota_id,
        servicio,
        veterinario_id,
        fecha,
        hora,
        notas || null,
        estado || 'programada',
      ],
      (err, results) => {
        if (err) {
          console.error('Error al insertar cita:', err);
          return res.status(500).json({ error: 'Error en el servidor al crear la cita' });
        }
        res.status(201).json({ message: 'Cita creada', id: results.insertId });
      }
    );
  });

  // Obtener citas por documento de propietario (próximas citas)
router.get('/propietario/:doc', (req, res) => {
  const { doc } = req.params;

  const sql = `
    SELECT * FROM citas
    WHERE propietario_doc = ? AND fecha >= CURDATE()
    ORDER BY fecha ASC
  `;

  db.query(sql, [doc], (err, results) => {
    if (err) {
      console.error('Error al obtener citas por propietario:', err);
      return res.status(500).json({ error: 'Error al obtener citas del propietario' });
    }
    res.status(200).json(results);
  });
});


  // Obtener todas las citas
  router.get('/', (req, res) => {
    const sql = `SELECT * FROM citas`;
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error al obtener citas:', err);
        return res.status(500).json({ error: 'Error en el servidor al obtener las citas' });
      }
      res.status(200).json(results);
    });
  });

  return router;
};
