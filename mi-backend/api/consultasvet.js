// mi-backend/api/consultasvet.js

const express = require('express');
const router = express.Router();

// La función se exporta y recibe la conexión a la DB (db)
module.exports = function(db) {

  // --- Endpoint GET /api/consultas ---
  // Obtiene todas las historias clínicas con información detallada
  router.get('/', (req, res) => {
    console.log("📢 [GET /api/consultas] Petición recibida.");

    const sql = `
      SELECT 
        hc.id AS id_historia,
        hc.fecha_consulta,
        hc.motivo_consulta,
        hc.diagnostico,
        hc.tratamiento,
        hc.observaciones,
        hc.medicamentos,
        hc.signos_vitales,
        hc.proxima_cita,
        hc.archivos_adjuntos,
        m.id AS id_mascota,
        m.nombre AS nombre_mascota,
        m.especie,
        m.raza,
        m.fecha_nac AS fecha_nac_mascota,
        prop.nombre AS nombre_propietario,
        prop.tel AS telefono_propietario,
        vet_user.nombre AS nombre_veterinario,
        hc.vet_id
      FROM historias_clinicas hc
      JOIN mascotas m ON hc.mascota_id = m.id
      JOIN usuarios prop ON m.doc_pro = prop.doc
      JOIN veterinarios v ON hc.vet_id = v.vet_id
      JOIN usuarios vet_user ON v.vet_id = vet_user.id
      ORDER BY hc.fecha_consulta DESC;
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('❌ [GET /api/consultas] Error al consultar la base de datos:', err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
      }

      console.log(`✅ [GET /api/consultas] Se encontraron ${results.length} registros.`);
      
      const consultasFormateadas = results.map(row => {
        const edadAnios = new Date().getFullYear() - new Date(row.fecha_nac_mascota).getFullYear();
        
        // ===== INICIO DE LA SECCIÓN CORREGIDA =====
        // Lógica para parsear de forma segura los campos JSON desde la base de datos
        
        let medicamentosParseados = [];
        if (row.medicamentos) {
            try {
                const data = JSON.parse(row.medicamentos);
                if (Array.isArray(data)) {
                    medicamentosParseados = data;
                }
            } catch (e) {
                console.warn(`Advertencia: El campo 'medicamentos' con ID de historia ${row.id_historia} no es un JSON de array válido.`);
            }
        }

        let signosVitalesParseados = {};
        if (row.signos_vitales) {
            try {
                signosVitalesParseados = JSON.parse(row.signos_vitales);
            } catch (e) {
                console.warn(`Advertencia: El campo 'signos_vitales' con ID de historia ${row.id_historia} no es un JSON de objeto válido.`);
            }
        }
        // ===== FIN DE LA SECCIÓN CORREGIDA =====

        return {
          id: row.id_historia,
          fecha: new Date(row.fecha_consulta).toISOString().split('T')[0],
          hora: new Date(row.fecha_consulta).toTimeString().split(' ')[0].substring(0, 5),
          mascota: {
            id: row.id_mascota,
            nombre: row.nombre_mascota,
            especie: row.especie,
            raza: row.raza,
            edad: `${edadAnios} años`,
            propietario: row.nombre_propietario,
            telefono: row.telefono_propietario,
          },
          veterinario: `Dr. ${row.nombre_veterinario}`,
          vet_id: row.vet_id,
          motivo: row.motivo_consulta,
          sintomas: "Revisar motivo",
          diagnostico: row.diagnostico,
          tratamiento: row.tratamiento,
          medicamentos: medicamentosParseados, // Se usa la variable segura que siempre es un array
          signosVitales: signosVitalesParseados, // Se usa la variable segura que siempre es un objeto
          observaciones: row.observaciones,
          proximaCita: row.proxima_cita ? new Date(row.proxima_cita).toISOString().split('T')[0] : null,
          estado: "completada",
          archivos: row.archivos_adjuntos || [],
        };
      });

      res.status(200).json(consultasFormateadas);
    });
  });

  // --- Endpoint POST /api/consultas ---
  // Crea una nueva historia clínica (consulta)
  router.post('/', (req, res) => {
    console.log("📢 [POST /api/consultas] Petición para crear consulta recibida.");

    const {
      mascota_id, vet_id, fecha_consulta, motivo_consulta, signos_vitales, 
      diagnostico, tratamiento, medicamentos, observaciones, proxima_cita
    } = req.body;

    if (!mascota_id || !vet_id || !fecha_consulta || !motivo_consulta) {
      return res.status(400).json({ error: "Faltan campos obligatorios (mascota, veterinario, fecha, motivo)." });
    }

    const sql = `
      INSERT INTO historias_clinicas (
        mascota_id, vet_id, fecha_consulta, motivo_consulta, signos_vitales, 
        diagnostico, tratamiento, medicamentos, observaciones, proxima_cita
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      mascota_id, vet_id, fecha_consulta, motivo_consulta,
      JSON.stringify(signos_vitales || {}),
      diagnostico, tratamiento,
      JSON.stringify(medicamentos || []),
      observaciones, proxima_cita || null
    ];

    db.query(sql, params, (err, result) => {
      if (err) {
        console.error("❌ Error al insertar en la base de datos:", err);
        return res.status(500).json({ error: "Error interno del servidor al guardar la consulta." });
      }
      console.log("✅ Consulta creada con éxito. ID:", result.insertId);
      res.status(201).json({ message: "Consulta registrada exitosamente", consultaId: result.insertId });
    });
  });

  // --- Endpoint PUT /api/consultas/:id ---
  // Actualiza una historia clínica existente
  router.put('/:id', (req, res) => {
    const consultaId = req.params.id;
    console.log(`📢 [PUT /api/consultas/${consultaId}] Petición para actualizar consulta recibida.`);

    const {
      mascota_id, vet_id, fecha_consulta, motivo_consulta, signos_vitales,
      diagnostico, tratamiento, medicamentos, observaciones, proxima_cita
    } = req.body;

    if (!mascota_id || !vet_id || !fecha_consulta || !motivo_consulta) {
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }

    const sql = `
      UPDATE historias_clinicas SET
        mascota_id = ?, vet_id = ?, fecha_consulta = ?, motivo_consulta = ?, signos_vitales = ?,
        diagnostico = ?, tratamiento = ?, medicamentos = ?, observaciones = ?, proxima_cita = ?
      WHERE id = ?
    `;

    const params = [
      mascota_id, vet_id, fecha_consulta, motivo_consulta,
      JSON.stringify(signos_vitales || {}),
      diagnostico, tratamiento,
      JSON.stringify(medicamentos || []),
      observaciones, proxima_cita || null,
      consultaId
    ];

    db.query(sql, params, (err, result) => {
      if (err) {
        console.error("❌ Error al actualizar la base de datos:", err);
        return res.status(500).json({ error: "Error interno del servidor al actualizar la consulta." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "No se encontró una consulta con ese ID." });
      }
      console.log(`✅ Consulta con ID ${consultaId} actualizada con éxito.`);
      res.status(200).json({ message: "Consulta actualizada exitosamente." });
    });
  });

  // --- Endpoint DELETE /api/consultas/:id ---
  // Elimina una historia clínica
  router.delete('/:id', (req, res) => {
    const consultaId = req.params.id;
    console.log(`📢 [DELETE /api/consultas/${consultaId}] Petición para eliminar consulta recibida.`);

    const sql = "DELETE FROM historias_clinicas WHERE id = ?";

    db.query(sql, [consultaId], (err, result) => {
      if (err) {
        console.error("❌ Error al eliminar de la base de datos:", err);
        return res.status(500).json({ error: "Error interno del servidor al eliminar la consulta." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "No se encontró una consulta con ese ID." });
      }
      console.log(`✅ Consulta con ID ${consultaId} eliminada con éxito.`);
      res.status(200).json({ message: "Consulta eliminada exitosamente." });
    });
  });

  return router;
};