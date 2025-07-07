// routes/admin.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();



module.exports = function (db) {

  router.get('/notificaciones', async (req, res) => {
    try {
      const [notificaciones] = await db.promise().query(
        `SELECT * FROM notificaciones 
         WHERE leida = FALSE 
         ORDER BY fecha_creacion DESC 
         LIMIT 10`
      );
      res.json(notificaciones);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
  });
  
  router.put('/notificaciones/:id/leer', async (req, res) => {
    try {
      await db.promise().query(
        `UPDATE notificaciones SET leida = TRUE WHERE id = ?`,
        [req.params.id]
      );
      res.json({ success: true });
    } catch (error) {
      console.error('Error al actualizar notificación:', error);
      res.status(500).json({ error: 'Error al actualizar notificación' });
    }
  });

    return router; 
}