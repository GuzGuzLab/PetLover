// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

module.exports = function(db) {
  // LOGIN
  router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const query = `
      SELECT u.* 
      FROM usuarios u 
      INNER JOIN propietarios p ON u.id = p.id_prop 
      WHERE u.email = ?
    `;

    db.query(query, [email], async (err, results) => {
      if (err) return res.status(500).json({ message: 'Error del servidor' });

      if (results.length === 0) {
        return res.status(401).json({ message: 'Correo o contraseña incorrectos o no es propietario' });
      }

      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
      }

      return res.status(200).json({
        message: 'Login exitoso',
        nombre: user.nombre,
        doc: user.doc,
        email: user.email,
        rol: 'propietario'
      });
    });
  });

   //**************************************************************************/
    //*******************para que verifique login segun el rol *****************/
    //**************************************************************************/

  router.post('/login_con_roles', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  // Primero buscar al usuario en la tabla usuarios
  const userQuery = 'SELECT * FROM usuarios WHERE email = ?';
  
  db.query(userQuery, [email], async (err, userResults) => {
    if (err) {
      console.error('Error en la consulta:', err);
      return res.status(500).json({ message: 'Error del servidor' });
    }

    if (userResults.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const user = userResults[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Verificar en qué tablas de roles existe el usuario
    const docUsuario = user.doc;
    let rol = '';

    // Consultar todas las tablas de roles en paralelo
    try {
      const [propietarioResult, veterinarioResult, adminResult] = await Promise.all([
        db.promise().query('SELECT 1 FROM propietarios WHERE id_prop = ?', [docUsuario]),
        db.promise().query('SELECT 1 FROM veterinarios WHERE vet_id = ?', [docUsuario]),
        db.promise().query('SELECT 1 FROM administradores WHERE admin_id = ?', [docUsuario])
      ]);

      // Determinar el rol (prioridad: admin > veterinario > propietario)
      if (adminResult[0].length > 0) {
        rol = 'administrador';
      } else if (veterinarioResult[0].length > 0) {
        rol = 'veterinario';
      } else if (propietarioResult[0].length > 0) {
        rol = 'cliente';
      } else {
        return res.status(401).json({ message: 'Usuario no tiene un rol asignado' });
      }

      return res.status(200).json({
        message: 'Login exitoso',
        usuario: {
          id: user.id,
          doc: user.doc,
          nombre: user.nombre,
          email: user.email,
          rol: rol
        }
      });

    } catch (error) {
      console.error('Error al verificar roles:', error);
      return res.status(500).json({ message: 'Error al verificar roles del usuario' });
    }
  });
});

  //*********************************************** */
  // ***************RESET PASSWORD*****************
  //*********************************************** */

  router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email y nueva contraseña son requeridos' });
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      db.query("CALL ModifyPassword(?, ?)", [email, hashedPassword], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Error al actualizar la contraseña' });

        res.status(200).json({ message: 'Tu contraseña fue cambiada correctamente' });
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error del servidor al restablecer la contraseña' });
    }
  });

  return router;
};
