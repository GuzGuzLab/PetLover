const express = require('express');
const bcrypt = require('bcrypt');

module.exports = function (db) {
  const router = express.Router();

  // ✅ Obtener TODOS los propietarios con sus mascotas usando el Procedimiento Almacenado
  router.get('/', (req, res) => {
    console.log("📢 [GET /api/propietarios] Petición de lista detallada de propietarios recibida.");
    const doc = req.query.doc || null;

    db.query('CALL GetOwnersWithDetails(?)', [doc], (err, results) => {
      if (err) {
        console.error("Error al ejecutar el procedimiento GetOwnersWithDetails:", err);
        return res.status(500).json({ error: 'Error en el servidor.' });
      }

      const ownersWithParsedPets = results[0].map(owner => {
        try {
          return {
            ...owner,
            pets: JSON.parse(owner.pets) || []
          };
        } catch (e) {
          return { ...owner, pets: [] };
        }
      });

      res.status(200).json(ownersWithParsedPets);
    });
  });

  // ✅ Registro de propietario completo
  router.post('/registro', (req, res) => { 
    const { tipo_Doc, doc, nombre, fecha_Nac, tel, email, direccion, password } = req.body;

    if (!tipo_Doc || !doc || !nombre || !fecha_Nac || !tel || !email || !direccion || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const checkEmailQuery = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(checkEmailQuery, [email], async (err, results) => {
      if (err) return res.status(500).json({ message: 'Error al validar email' });
      if (results.length > 0) return res.status(400).json({ message: 'El correo ya está registrado' });

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertUsuarioQuery = `
          INSERT INTO usuarios (tipo_Doc, doc, nombre, fecha_Nac, tel, email, direccion, password)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(insertUsuarioQuery, [tipo_Doc, doc, nombre, fecha_Nac, tel, email, direccion, hashedPassword], (err2) => {
          if (err2) return res.status(500).json({ message: 'Error al registrar el usuario' });

          // ✅ Insertar en asignacion_rol
          db.query('INSERT INTO asignacion_rol (doc_usu, rol_id, asignado_por) VALUES (?, ?, ?)', [doc, 1, 1], (err3) => {
            if (err3) return res.status(500).json({ message: 'Usuario creado, pero error al asignar rol de propietario' });

            // ✅ Insertar en propietarios
            db.query('INSERT INTO propietarios (id_prop) VALUES (?)', [doc], (err4) => {
              if (err4) return res.status(500).json({ message: 'Usuario creado, pero error al registrar como propietario' });

              return res.status(201).json({ message: 'Propietario registrado exitosamente' });
            });
          });
        });
      } catch (error) {
        res.status(500).json({ message: 'Error del servidor' });
      }
    });
  });

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
