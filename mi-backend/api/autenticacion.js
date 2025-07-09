const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

module.exports = function (db) {

  //************************************************************************* */
  //*********************ACCESO A VETERINARIOS AL SISTEMA******************** */
  //************************************************************************* */
  router.post('/login-veterinario', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    const query = `
      SELECT u.*, v.* 
      FROM usuarios u 
      INNER JOIN veterinarios v ON u.id = v.vet_id 
      WHERE u.email = ?
    `;

    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error('Error en login veterinario:', err);
        return res.status(500).json({
          success: false,
          message: 'Error del servidor'
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Correo o contraseña incorrectos o no es veterinario'
        });
      }

      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Correo o contraseña incorrectos'
        });
      }

      const vetData = {
        vet_id: user.vet_id,
        especialidad: user.especialidad,
        registro_profesional: user.registro_profesional
      };

      return res.status(200).json({
        success: true,
        message: 'Login exitoso como veterinario',
        usuario: {
          id: user.id,
          nombre: user.nombre,
          doc: user.doc,
          email: user.email,
          rol: 'veterinario'
        },
        veterinario: vetData,
        redirect: '/VeterinarioPer'
      });
    });
  });

  //************************************************************************** */
  //*************************ACCESO A ADMINISTRADORES************************* */
  //*************************************************************************** */
  router.post('/login-admin', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    const query = `
      SELECT u.*, a.* 
      FROM usuarios u 
      INNER JOIN administradores a ON u.id = a.admin_id 
      WHERE u.email = ?
    `;

    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error('Error en login administrador:', err);
        return res.status(500).json({
          success: false,
          message: 'Error del servidor'
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales incorrectas o el usuario no es administrador'
        });
      }

      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Correo o contraseña incorrectos'
        });
      }

      const adminData = {
        admin_id: user.admin_id,
        nivel_acceso: user.nivel_acceso,
        departamento: user.departamento
      };

      return res.status(200).json({
        success: true,
        message: 'Login exitoso como administrador',
        usuario: {
          id: user.id,
          nombre: user.nombre,
          doc: user.doc,
          email: user.email,
          rol: 'admin'
        },
        administrador: adminData,
        redirect: '/InicioAdmin'
      });
    });
  });

  //******************************************************************** */
  //********************* LOGIN UNIFICADO ****************************** */
  //******************************************************************** */
  router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    const queryUsuario = "SELECT * FROM usuarios WHERE email = ?";
    db.query(queryUsuario, [email], async (err, results) => {
      if (err) {
        console.error("❌ Error al buscar usuario:", err);
        return res.status(500).json({
          success: false,
          message: 'Error del servidor'
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Correo no registrado'
        });
      }

      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña incorrecta'
        });
      }

      // Buscar si es veterinario
      const queryVet = "SELECT * FROM veterinarios WHERE vet_id = ?";
      db.query(queryVet, [user.id], (err, vetResults) => {
        if (err) {
          console.error("❌ Error al buscar veterinario:", err);
          return res.status(500).json({ success: false, message: 'Error del servidor' });
        }

        if (vetResults.length > 0) {
          const vet = vetResults[0];
          return res.status(200).json({
            success: true,
            message: 'Login exitoso como veterinario',
            usuario: {
              id: user.id,
              nombre: user.nombre,
              doc: user.doc,
              email: user.email,
              rol: 'veterinario'
            },
            veterinario: {
              vet_id: vet.vet_id,
              especialidad: vet.especialidad,
              registro_profesional: vet.registro_profesional
            },
            redirect: '/VeterinarioPer'
          });
        }

        // Buscar si es administrador
        const queryAdmin = "SELECT * FROM administradores WHERE admin_id = ?";
        db.query(queryAdmin, [user.id], (err, adminResults) => {
          if (err) {
            console.error("❌ Error al buscar administrador:", err);
            return res.status(500).json({ success: false, message: 'Error del servidor' });
          }

          if (adminResults.length > 0) {
            const admin = adminResults[0];
            return res.status(200).json({
              success: true,
              message: 'Login exitoso como administrador',
              usuario: {
                id: user.id,
                nombre: user.nombre,
                doc: user.doc,
                email: user.email,
                rol: 'admin'
              },
              administrador: {
                admin_id: admin.admin_id,
                nivel_acceso: admin.nivel_acceso,
                departamento: admin.departamento
              },
              redirect: '/InicioAdmin'
            });
          }

          // Si no es ni veterinario ni admin, es propietario
          return res.status(200).json({
            success: true,
            message: 'Login exitoso como propietario',
            usuario: {
              id: user.id,
              nombre: user.nombre,
              doc: user.doc,
              email: user.email,
              rol: 'propietario'
            },
            redirect: '/UserWelcome'
          });
        });
      });
    });
  });

  return router;
};
