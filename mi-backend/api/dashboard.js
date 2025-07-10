
const express = require('express');
const router = express.Router();

module.exports = function(db) {

  router.get('/stats/:vet_id', (req, res) => {
    const { vet_id } = req.params;
    console.log(`📢 [GET /api/dashboard/stats] Petición para el veterinario ID: ${vet_id}.`);

    if (!vet_id) {
      return res.status(400).json({ error: "Falta el ID del veterinario." });
    }

    const sql = `
      SELECT
        (SELECT nombre FROM usuarios WHERE id = ?) AS nombre_veterinario,
        
        COUNT(CASE 
          WHEN DATE(hc.fecha_consulta) = CURDATE() AND hc.vet_id = ? 
          THEN hc.id 
        END) AS citas_hoy,
        
        COUNT(CASE 
          WHEN DATE(hc.fecha_consulta) = CURDATE() AND hc.vet_id = ? 
          THEN hc.id 
        END) AS pacientes_atendidos_hoy,
        
        COUNT(CASE 
          WHEN DATE(hc.fecha_consulta) = CURDATE() AND hc.vet_id = ? AND (hc.diagnostico IS NULL OR hc.diagnostico = '') 
          THEN hc.id 
        END) AS consultas_pendientes
        
      FROM historias_clinicas hc;
    `;
    const params = [vet_id, vet_id, vet_id, vet_id];
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error('❌ [GET /api/dashboard/stats] Error al consultar la base de datos:', err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'No se encontraron datos para el dashboard.' });
      }
      const stats = results[0];
      console.log("✅ [GET /api/dashboard/stats] Estadísticas encontradas:", stats);
      // Formateamos la respuesta como la espera el frontend
      const respuestaFormateada = {
        nombreUsuario: stats.nombre_veterinario || 'Dr.',
        estadisticas: {
          citasHoy: stats.citas_hoy,
          pacientesAtendidos: stats.pacientes_atendidos_hoy,
          consultasPendientes: stats.consultas_pendientes
        }
      };
      res.status(200).json(respuestaFormateada);
    });
  });

  return router;
};