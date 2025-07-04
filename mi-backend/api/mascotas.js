// archivo: api/mascotas.js

const express = require('express');
const router = express.Router();

module.exports = function(db) {
    
    // ✅ GET todas las mascotas con info básica del propietario
    router.get('/', (req, res) => {
        console.log("📢 [GET /api/mascotas] Petición de lista completa de mascotas recibida.");
        
        const query = `
            SELECT 
                m.id,
                m.nombre,
                m.especie,
                m.raza,
                m.genero,
                m.fecha_nac,
                CONCAT(TIMESTAMPDIFF(YEAR, m.fecha_nac, CURDATE()), ' años') AS edad,
                m.peso,
                m.color,
                m.estado_reproductivo AS estadoReproductivo,
                m.vacunado,
                m.observaciones,
                m.estado,
                u.nombre AS propietario_nombre,
                u.tel AS propietario_telefono,
                (SELECT MAX(c.fecha) FROM citas c WHERE c.mascota_id = m.id) AS ultimaConsulta
            FROM mascotas m
            JOIN usuarios u ON m.doc_pro = u.doc
            ORDER BY m.estado ASC, m.fecha_registro DESC;
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error("Error al obtener la lista de mascotas:", err);
                return res.status(500).json({ error: 'Error en el servidor al obtener mascotas.' });
            }
            res.json(results);
        });
    });

    // ✅ GET mascotas por documento del propietario
    router.get('/propietario/:doc', (req, res) => {
        const { doc } = req.params;

        const query = `
            SELECT 
                m.id,
                m.nombre,
                m.especie,
                m.raza,
                m.genero,
                m.fecha_nac,
                CONCAT(TIMESTAMPDIFF(YEAR, m.fecha_nac, CURDATE()), ' años') AS edad,
                m.peso,
                m.color,
                m.estado_reproductivo AS estadoReproductivo,
                m.vacunado,
                m.observaciones,
                m.estado,
                m.tamano,
                m.fecha_registro
            FROM mascotas m
            WHERE m.doc_pro = ?
            ORDER BY m.fecha_registro DESC;
        `;

        db.query(query, [doc], (err, results) => {
            if (err) {
                console.error("❌ Error al obtener mascotas por propietario:", err);
                return res.status(500).json({ error: 'Error interno al obtener mascotas por propietario.' });
            }

            res.json(results);
        });
    });

    // ✅ PUT: Actualizar mascota
    router.put('/:id', (req, res) => {
        const { id } = req.params;
        const { nombre, raza, fecha_nac, peso, observaciones } = req.body;

        if (!nombre || !raza || !fecha_nac || !peso) {
            return res.status(400).json({ error: 'Los campos nombre, raza, fecha de nacimiento y peso son obligatorios.' });
        }

        const query = `
            UPDATE mascotas SET
                nombre = ?,
                raza = ?,
                fecha_nac = ?,
                peso = ?,
                observaciones = ?
            WHERE id = ?
        `;
        db.query(query, [nombre, raza, fecha_nac, peso, observaciones, id], (err, result) => {
            if (err) {
                console.error("Error al actualizar la mascota:", err);
                return res.status(500).json({ error: 'Error al actualizar la mascota.' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Mascota no encontrada.' });
            }
            res.json({ message: 'Mascota actualizada correctamente.' });
        });
    });

    // ✅ PATCH: Cambiar estado de mascota (Activo/Inactivo)
    router.patch('/:id/status', (req, res) => {
        const { id } = req.params;
        const { estado } = req.body;

        if (!estado || !['Activo', 'Inactivo'].includes(estado)) {
            return res.status(400).json({ error: 'El estado proporcionado no es válido.' });
        }
        
        const query = 'UPDATE mascotas SET estado = ? WHERE id = ?';
        db.query(query, [estado, id], (err, result) => {
            if (err) {
                console.error("Error al cambiar estado de mascota:", err);
                return res.status(500).json({ error: 'Error al cambiar el estado de la mascota.' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Mascota no encontrada.' });
            }
            res.json({ message: `Mascota marcada como ${estado}.` });
        });
    });

    // ✅ POST: Registro de nueva mascota
    router.post('/registro', (req, res) => {
        const {
            doc_pro, nombre, especie, raza, genero, color,
            fecha_nac, peso, tamano, estado_reproductivo, vacunado, observaciones
        } = req.body;

        if (!doc_pro || !nombre || !especie || !raza || !genero || !fecha_nac || !tamano || !estado_reproductivo) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }

        const query = `
            INSERT INTO mascotas (
                doc_pro, nombre, especie, raza, genero, color, fecha_nac,
                peso, tamano, estado_reproductivo, vacunado, observaciones
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            doc_pro, nombre, especie, raza, genero, color,
            fecha_nac, peso, tamano, estado_reproductivo, vacunado === true ? 1 : 0, observaciones
        ];

        db.query(query, params, (err, result) => {
            if (err) {
                console.error('Error al registrar la mascota:', err);
                return res.status(500).json({ error: 'Hubo un problema en el servidor.' });
            }
            res.status(201).json({ message: 'Mascota registrada exitosamente', mascotaId: result.insertId });
        });
    });

    return router;
};
