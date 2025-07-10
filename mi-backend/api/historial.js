const express = require('express');
const router = express.Router();

// db es la conexión de mysql2 que pasas desde tu server
module.exports = (db) => {
  // Obtener historial médico por ID de mascota
  router.get('/:id', async (req, res) => {
    const mascotaId = req.params.id;

    try {
      const [rows] = await db.query(`
        SELECT 
          hc.id, 
          hc.fecha_consulta AS fecha, 
          hc.motivo_consulta AS motivo, 
          hc.diagnostico, 
          CONCAT(v.nombre, ' ', v.apellido) AS veterinario
        FROM historias_clinicas hc
        LEFT JOIN veterinarios v ON hc.veterinario_id = v.id
        WHERE hc.mascota_id = ?
        ORDER BY hc.fecha_consulta DESC
      `, [mascotaId]);

      res.json(rows);
    } catch (error) {
      console.error("❌ Error al obtener historial médico:", error);
      res.status(500).json({ error: 'Error interno al obtener historial médico' });
    }
  });

  return router;
};
