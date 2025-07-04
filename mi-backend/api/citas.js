const router = express.Router();

module.exports = (db) => {

  // Crear nueva cita
  router.post('/', (req, res) => {
    const {
@@ -47,25 +48,24 @@ module.exports = (db) => {
    );
  });

  // Obtener citas por documento de propietario (próximas citas)
router.get('/propietario/:doc', (req, res) => {
  const { doc } = req.params;
  // Obtener citas por documento de propietario
  router.get('/propietario/:doc', (req, res) => {
    const { doc } = req.params;

  const sql = `
    SELECT * FROM citas
    WHERE propietario_doc = ? AND fecha >= CURDATE()
    ORDER BY fecha ASC
  `;
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
    db.query(sql, [doc], (err, results) => {
      if (err) {
        console.error('Error al obtener citas por propietario:', err);
        return res.status(500).json({ error: 'Error al obtener citas del propietario' });
      }
      res.status(200).json(results);
    });
  });
});


  // Obtener todas las citas
  router.get('/', (req, res) => {
@@ -79,5 +79,58 @@ router.get('/propietario/:doc', (req, res) => {
    });
  });

  // ✅ CORREGIDO: Obtener horas ocupadas por fecha y veterinario
  router.get('/ocupadas', (req, res) => {
    const { fecha, vet_id } = req.query;
    if (!fecha || !vet_id) {
      return res.status(400).json({ message: 'Parámetros requeridos: fecha y vet_id' });
    }

    const sql = `SELECT hora FROM citas WHERE fecha = ? AND veterinario_id = ?`;
    db.query(sql, [fecha, vet_id], (err, results) => {
      if (err) {
        console.error('Error consultando citas ocupadas:', err);
        return res.status(500).json({ message: 'Error al consultar horas ocupadas' });
      }
      const horasOcupadas = results.map(row => row.hora.slice(0, 5));
      res.json(horasOcupadas);
    });
  });

  // Obtener todas las citas (pasadas y futuras) de un propietario
router.get('/todas/:doc', (req, res) => {
  const { doc } = req.params;

  const sql = `
    SELECT * FROM citas
    WHERE propietario_doc = ?
    ORDER BY fecha DESC, hora DESC
  `;

  db.query(sql, [doc], (err, results) => {
    if (err) {
      console.error('Error al obtener todas las citas:', err);
      return res.status(500).json({ error: 'Error al obtener las citas' });
    }
    res.status(200).json(results);
  });
});


router.put('/cancelar/:id', (req, res) => {
  const { id } = req.params;

  const sql = `UPDATE citas SET estado = 'cancelada' WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al cancelar cita:', err);
      return res.status(500).json({ error: 'No se pudo cancelar la cita' });
    }
    res.status(200).json({ message: 'Cita cancelada exitosamente' });
  });
});


  return router;
};