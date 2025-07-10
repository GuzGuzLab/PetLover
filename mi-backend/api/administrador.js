// routes/admin.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

module.exports = function (db) {
   
    // --- GESTIÓN DE USUARIOS (NUEVO) ---
    router.post('/usuarios', async (req, res) => {
        const { tipo_Doc, doc, nombre, fecha_Nac, tel, email, direccion, password } = req.body;

        if (!tipo_Doc || !doc || !nombre || !fecha_Nac || !tel || !email || !direccion || !password) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const query = `
                INSERT INTO usuarios (tipo_Doc, doc, nombre, fecha_Nac, tel, email, direccion, password) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [tipo_Doc, doc, nombre, fecha_Nac, tel, email, direccion, hashedPassword];

            db.query(query, values, (err, results) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ message: "El documento o correo electrónico ya se encuentra registrado." });
                    }
                    console.error("Error al registrar usuario:", err);
                    return res.status(500).json({ message: "Hubo un problema al registrar el usuario." });
                }
                
                res.status(201).json({ message: "Usuario registrado exitosamente", userId: results.insertId });
            });

        } catch (error) {
            console.error("Error al hashear la contraseña:", error);
            res.status(500).json({ message: "Error interno del servidor." });
        }
    });

    //****************************************************************************/
    // *************************** GESTIÓN DE SERVICIOS **************************/
    //****************************************************************************/
    
    router.post('/servicios', (req, res) => {
    const { nombre, descripcion, precio, duracion_estimada } = req.body;
    
    if (!nombre || !descripcion || !precio || !duracion_estimada) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const query = 'INSERT INTO servicios (nombre, descripcion, precio, duracion_estimada) VALUES (?, ?, ?, ?)';
        db.query(query, [nombre, descripcion, precio, duracion_estimada], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Error en la base de datos al registrar el servicio" });
                }
                res.status(201).json({ 
                    success: true,
                    message: "Servicio registrado exitosamente",
                    id: result.insertId 
                });
        });
    });

    router.get('/servicios', (req, res) => {
        db.query("SELECT * FROM servicios", (err, results) => {
            if (err) return res.status(500).json({ message: "Hubo un problema al obtener los servicios" });
            res.status(200).json(results);
        });
    });

    router.delete('/servicios/:id', (req, res) => {
        const { id } = req.params;
        db.query("DELETE FROM servicios WHERE id = ?", [id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: "Servicio no encontrado" });
            res.json({ message: "Servicio eliminado", id });
        });
    });

    //*********************************************************************/
    //********************GESTION DE REGISTRAR USUARIOS********************/
    //*********************************************************************/

    router.post('/usuarios', async (req, res) => {
        const { tipo_Doc, doc, nombre, fecha_Nac, tel, email, direccion, password } = req.body;
        if (!tipo_Doc || !doc || !nombre || !fecha_Nac || !tel || !email || !direccion || !password) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const query = `
                INSERT INTO usuarios
                (tipo_Doc, doc, nombre, fecha_Nac, tel, email, direccion, password) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            db.query(query, [tipo_Doc, doc, nombre, fecha_Nac, tel, email, direccion, hashedPassword], (err, results) => {
                if (err) {
                    console.error("Error al insertar los datos:", err);
                    return res.status(500).json({ message: "Hubo un problema al registrar al usuario" });
                }
                res.status(201).json({ message: "Usuario registrado exitosamente" });
            });
        } catch (error) {
            console.error("Error al encriptar la contraseña:", error);
            return res.status(500).json({ message: "Error del servidor" });
        }
    });

    

    //****************************************************************************/
    //**************TRAER LA CANTIDAD DE USUARIO REGISTRADOS**********************/
    //****************************************************************************/

    router.get("/usuarios_registrados", (req, res) => {
        const query = "SELECT COUNT(*) AS total_usuarios FROM usuarios;";

        db.query(query, (err, results) => {
            if (err) {
                console.error("Error al obtener la cantidad de usuarios:", err);
                return res.status(500).json({ message: "Hubo un problema al obtener los usuarios" });
            }
            res.status(200).json(results);
        });
    });

    //**************************************************************************/
    //****************TRAER USUARIOS REGISTRADOS PARA ASIGNAR ROL************* */
    //**************************************************************************/

    router.get("/obtener_Usuarios", async (req, res) => {
        try {
            const query = "SELECT id, tipo_Doc, doc, nombre, fecha_Nac, tel, email, direccion FROM usuarios";
            db.query(query, (err, results) => {
                if (err) {
                    console.error("Error al obtener la cantidad de usuarios:", err);
                    return res.status(500).json({ message: "Hubo un problema al obtener los usuarios" });
                }
                res.status(200).json(results);
            });
        } catch (error) {
            console.error("Error al obtener los usuarios:", error);
            res.status(500).json({ message: "Error del servidor al obtener los usuarios" });
        }
    });

    //**************************************************************************/
     //******************Odtener a todos los administradores********************/
    //**************************************************************************/
       router.get('/obtener_administradores', async (req, res) => {
            try {
                const [administradores] = await db.promise().query(`
                    SELECT u.*, a.nivel_acceso
                    FROM usuarios u
                    JOIN administradores a ON u.id = a.admin_id;
                `);
                res.status(200).json(administradores);
            } catch (error) {
                console.error('❌ Error al obtener administradores:', error);
                res.status(500).json({ error: 'Error en el servidor al obtener los administradores' });
            }
        });


    //**************************************************************************/
     //******************Odtener cuantos administradores hay********************/
    //**************************************************************************/
        router.get("/admin_registrados", (req, res) => {
            const query = "SELECT COUNT(*) AS total_administradores FROM administradores;";

            db.query(query, (err, results) => {
                if (err) {
                  console.error("Error al obtener la cantidad de administradores:", err);
                  return res.status(500).json({ message: "Hubo un problema al obtener los administradores" });
                }
                res.status(200).json(results);
            });
        });


         //**************************************************************************/
        //******************ACTUALIZAR A SOLO LOS ADMINISTRADORES********************/
        //**************************************************************************/

        router.put('/actualizar_admin/:doc', async (req, res) => {
    const { doc } = req.params;
    const { tipo_Doc, nombre, email, tel, direccion, password, nivel_acceso, fecha_Nac } = req.body;
    
    try {
        // Validación de campos requeridos
        if (!tipo_Doc || !nombre || !email) {
            return res.status(400).json({
                error: 'Campos requeridos faltantes (tipo_Doc, nombre, email)'
            });
        }

        // Validación de nivel de acceso
        if (nivel_acceso && !['basico', 'medio', 'alto'].includes(nivel_acceso)) {
            return res.status(400).json({
                error: 'Nivel de acceso inválido. Use: basico, medio o alto'
            });
        }

        // Validación y formato de fecha de nacimiento
        let fechaNacFormateada = null;
        if (fecha_Nac) {
            // Asegurarnos que es una fecha válida
            const fecha = new Date(fecha_Nac);
            if (isNaN(fecha.getTime())) {
                return res.status(400).json({
                    error: 'Formato de fecha de nacimiento inválido'
                });
            }
            // Formatear como 'YYYY-MM-DD' para MySQL
            fechaNacFormateada = fecha.toISOString().split('T')[0];
        }

        // Buscar el usuario
        const [usuario] = await db.promise().query(
            'SELECT id FROM usuarios WHERE doc = ?',
            [doc]
        );
    
        if (!usuario.length) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
    
        const userId = usuario[0].id;
        
        // Preparar la actualización
        const updateQuery = `
            UPDATE usuarios 
            SET 
                tipo_Doc = ?,
                nombre = ?,
                email = ?,
                tel = ?,
                direccion = ?,
                password = IFNULL(?, password),
                fecha_Nac = ?
            WHERE doc = ?
        `;
        
        // Ejecutar actualización
        await db.promise().query(updateQuery, [
            tipo_Doc,
            nombre,
            email,
            tel || null,
            direccion || null,
            password || null,
            fechaNacFormateada,  // Fecha formateada o null
            doc
        ]);
    
        // Actualizar nivel de acceso si es necesario
        if (nivel_acceso) {
            await db.promise().query(
                'UPDATE administradores SET nivel_acceso = ? WHERE admin_id = ?',
                [nivel_acceso, userId]
            );
        }
    
        // Obtener datos actualizados
        const [adminActualizado] = await db.promise().query(`
            SELECT
                u.id, u.tipo_Doc, u.doc, u.nombre,
                u.fecha_Nac, u.tel, u.email, u.direccion,
                u.fecha_Regis, a.nivel_acceso
            FROM usuarios u
            JOIN administradores a ON u.id = a.admin_id
            WHERE u.doc = ?
        `, [doc]);
        
        // Formatear la fecha de nacimiento en la respuesta
        const resultado = adminActualizado[0];
        if (resultado.fecha_Nac) {
            resultado.fecha_Nac = new Date(resultado.fecha_Nac).toISOString().split('T')[0];
        }
        
        res.status(200).json({
            success: true,
            message: 'Administrador actualizado correctamente',
            data: resultado
        });
    
    } catch (error) {
        console.error('Error al actualizar administrador:', error);
    
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: error.message.includes('email')
                    ? 'El email ya está registrado.'
                    : 'El documento ya está registrado.'
            });
        }
        
        res.status(500).json({
            error: 'Error interno al actualizar el administrador.',
            details: error.message
        });
    }
});
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++ cambiar estado a administrador+++++++++++++++++++++++++
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
 router.put('/toggle_estado/:doc', (req, res) => {
          const { doc } = req.params;
                
          if (!doc) {
            return res.status(400).json({ error: 'El documento del usuario es requerido.' });
          }
      
          // Primero, necesitamos el ID del usuario, ya que el procedimiento almacenado usa el ID.
          const findUserQuery = 'SELECT id FROM usuarios WHERE doc = ?';
          
          db.query(findUserQuery, [doc], (err, results) => {
            if (err) {
              console.error('Error al buscar usuario por documento:', err);
              return res.status(500).json({ error: 'Error en el servidor al buscar el usuario.' });
            }
        
            if (results.length === 0) {
              return res.status(404).json({ error: 'Usuario no encontrado con el documento proporcionado.' });
            }
        
            const userId = results[0].id;
        
            // Ahora sí, llamamos al procedimiento almacenado con el ID del usuario.
            const callProcedureQuery = 'CALL ToggleUserStatus(?)';
        
            db.query(callProcedureQuery, [userId], (err2, result) => {
              if (err2) {
                console.error('Error al ejecutar el procedimiento ToggleUserStatus:', err2);
                return res.status(500).json({ error: 'Error en el servidor al cambiar el estado del usuario.' });
              }
          
              res.status(200).json({ message: 'El estado del usuario ha sido actualizado correctamente.' });
            });
          });
        });


        

    return router;
}
