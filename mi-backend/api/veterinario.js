// archivo: api/veterinario.js
const express = require('express');
const router = express.Router();

module.exports = function (db) {
  router.get('/', (req, res) => {
    console.log("📢 [GET /api/veterinarios] Petición de lista de veterinarios recibida.");

    const sql = `
      SELECT u.id AS vet_id, u.nombre 
      FROM usuarios u
      JOIN asignacion_rol ar ON u.doc = ar.doc_usu
      WHERE ar.rol_id = 2
      ORDER BY u.nombre ASC;
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('❌ Error al obtener los veterinarios:', err);
        return res.status(500).json({ error: 'Error al obtener veterinarios' });
      }
      console.log("🔍 Resultados de la BD para Veterinarios:", results);
      res.json(results);
    });
  });

  return router;
};
