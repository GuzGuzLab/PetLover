// archivo: api/veterinario.js
const express = require('express');
const router = express.Router();

module.exports = function (db) {
  // Ruta para obtener todos los veterinarios
  router.get('/', (req, res) => {
    console.log("📢 [GET /api/veterinarios] Petición de lista de veterinarios recibida.");

    const sql = `
      SELECT u.id AS vet_id, u.nombre, u.doc, u.email, v.especialidad
      FROM usuarios u
      INNER JOIN veterinarios v ON u.id = v.vet_id
      ORDER BY u.nombre ASC;
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('❌ Error al obtener los veterinarios:', err);
        return res.status(500).json({ error: 'Error al obtener veterinarios' });
      }
      console.log("🔍 Veterinarios encontrados:", results);
      res.status(200).json(results);
    });
  });

  return router;
};
