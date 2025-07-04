// archivo: api/propietario.js (Versión Corregida y Mejorada)

const express = require('express');
const bcrypt = require('bcrypt');

module.exports = function(db) {
  const router = express.Router();

  // ✅ Obtener TODOS los propietarios con sus mascotas usando el Procedimiento Almacenado
  router.get('/', (req, res) => {
    console.log("📢 [GET /api/propietarios] Petición de lista detallada de propietarios recibida.");
    const doc = req.query.doc || null; // Obtenemos el 'doc' del query string para el buscador

    db.query('CALL GetOwnersWithDetails(?)', [doc], (err, results) => {
      if (err) {
        console.error("Error al ejecutar el procedimiento GetOwnersWithDetails:", err);
        return res.status(500).json({ error: 'Error en el servidor.' });
      }
      
      // El resultado de un procedure viene en results[0].
      // También, el campo 'pets' es un string JSON, necesitamos convertirlo a un objeto.
      const ownersWithParsedPets = results[0].map(owner => {
        try {
          return {
            ...owner,
            pets: JSON.parse(owner.pets) || []
          };
        } catch (e) {
          // Si el JSON es inválido o nulo, devuelve un array vacío de mascotas
          return { ...owner, pets: [] };
        }
      });

      res.status(200).json(ownersWithParsedPets);
    });
  });

  // ✅ Registro de propietario (corregido para usar asignacion_roles)
  router.post('/registro', (req, res) => {
    const { tipo_Doc, doc, nombre, fecha_Nac, tel, email, direccion, password } = req.body;
    if (!tipo_Doc || !doc || !nombre || !fecha_Nac || !tel || !email || !direccion || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // (El resto de la lógica de registro con bcrypt es la misma...)
    const checkEmailQuery = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(checkEmailQuery, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al validar email' });
        if (results.length > 0) return res.status(400).json({ message: 'El correo ya está registrado' });
  
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const insertUsuarioQuery = `
              INSERT INTO usuarios (tipo_Doc, doc, nombre, fecha_Nac, tel, email, direccion, password)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            db.query(insertUsuarioQuery, [tipo_Doc, doc, nombre, fecha_Nac, tel, email, direccion, hashedPassword], (err2, results2) => {
              if (err2) return res.status(500).json({ message: 'Error al registrar el usuario' });
    
              const usuarioId = results2.insertId;
              // ---- AQUÍ LA CORRECCIÓN ----
              // Usamos la tabla 'asignacion_roles' para marcarlo como propietario (rol_id = 1)
              db.query('INSERT INTO asignacion_roles (usu_id, rol_id) VALUES (?, ?)', [usuarioId, 1], (err3) => {
                if (err3) return res.status(500).json({ message: 'Usuario creado, pero error al asignar rol de propietario' });
                return res.status(201).json({ message: 'Propietario registrado exitosamente' });
              });
            });
        } catch (error) {
            res.status(500).json({ message: 'Error del servidor' });
        }
    });
  });

  // (Puedes mantener las otras rutas como la de /:doc/mascotas si las necesitas en otra parte)
  // ✅ Obtener mascotas por documento del propietario
  router.get('/:doc/mascotas', (req, res) => {
    const propietarioDoc = req.params.doc;
    const sql = 'SELECT id, nombre, especie FROM mascotas WHERE doc_pro = ? ORDER BY nombre ASC';
    db.query(sql, [propietarioDoc], (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al consultar mascotas' });
      res.status(200).json(results);
    });
  });

  return router;
};