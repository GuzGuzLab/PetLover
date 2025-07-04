// archivo: api/veterinario.js
const express = require('express');
const router = express.Router();

module.exports = function(db) {
  router.get('/', (req, res) => {
    console.log("📢 [GET /api/veterinarios] Petición de lista de veterinarios recibida.");
    
    const sql = `
      SELECT u.id as vet_id, u.nombre 
      FROM usuarios u
      JOIN asignacion_roles ar ON u.id = ar.usu_id
      WHERE ar.rol_id = 2 -- Asumiendo que 2 es el ID del rol 'veterinario'
      ORDER BY u.nombre ASC;
    `;
    
    db.query(sql, (err, results) => {
      // --- AÑADE ESTA LÍNEA PARA VER LOS RESULTADOS ---
      console.log("🔍 Resultados de la BD para Veterinarios:", results);

      if (err) {
        console.error('Error al obtener los veterinarios:', err);
        return res.status(500).json({ error: 'Error al obtener veterinarios' });
      }
      res.json(results);
    });
  });

  return router;
};