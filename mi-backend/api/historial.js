const express = require('express');
const router = express.Router();

module.exports = function (db) {
  router.get('/:mascota_id', (req, res) => {
    const { mascota_id } = req.params;

    const sql = `
      SELECT hc.id, hc.fecha, hc.motivo, hc.diagnostico, 
             CONCAT(v.nombre, ' ', v.apellido) AS veterinario
      FROM historias_clinicas hc
      JOIN veterinarios v ON hc.veterinario_id = v.vet_id
      WHERE hc.mascota_id = ?
      ORDER BY hc.fecha DESC
    `;

    db.query(sql, [mascota_id], (err, result) => {
      if (err) {
        console.error('❌ Error al obtener el historial médico:', err);
        return res.status(500).json({ error: 'Error al obtener el historial médico' });
      }

      res.status(200).json(result);
    });
  });

  return router;
};
