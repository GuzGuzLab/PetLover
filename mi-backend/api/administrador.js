// routes/admin.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

module.exports = function (db) {
    // --- GESTIÓN DE ROLES ---
    // (Tu código de roles va aquí... sin cambios)
    router.post('/roles', (req, res) => {
        const { nom_rol, descripcion } = req.body;
        if (!nom_rol || !descripcion) return res.status(400).send("Todos los campos son obligatorios");
        const query = 'INSERT INTO roles (nom_rol, descripcion) VALUES (?, ?)';
        db.query(query, [nom_rol, descripcion], (err, results) => {
            if (err) return res.status(500).json({ message: "Hubo un problema al registrar el rol" });
            res.status(201).json({ id: results.insertId, nom_rol, descripcion });
        });
    });

    router.get('/roles', (req, res) => {
        db.query("SELECT id, nom_rol, descripcion FROM roles", (err, results) => {
            if (err) return res.status(500).json({ message: "Hubo un problema al obtener los roles" });
            res.status(200).json(results);
        });
    });

    router.put('/roles/:id', (req, res) => {
        const { id } = req.params;
        const { nom_rol, descripcion } = req.body;
        if (!nom_rol) return res.status(400).json({ message: "El nombre del rol es obligatorio" });
        const query = "UPDATE roles SET nom_rol = ?, descripcion = ? WHERE id = ?";
        db.query(query, [nom_rol, descripcion, id], (err, result) => {
            if (err) return res.status(500).json({ message: "Error al actualizar el rol" });
            if (result.affectedRows === 0) return res.status(404).json({ message: "Rol no encontrado" });
            res.status(200).json({ message: "Rol actualizado correctamente" });
        });
    });

    router.delete('/roles/:id', (req, res) => {
        const { id } = req.params;
        db.query("DELETE FROM roles WHERE id = ?", [id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: "Rol no encontrado" });
            res.json({ message: "Rol eliminado", id });
        });
    });

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
    //***************************ASIRNAR ROL A USUARIO************************ */
    //**************************************************************************/

    router.post('/asignar_roles/:usuarioId', async (req, res) => {
    const { rolesSeleccionados, asignado_por } = req.body;
    const usuarioId = req.params.usuarioId;

            if (!rolesSeleccionados || rolesSeleccionados.length === 0) {
                return res.status(400).json({ error: 'Debe seleccionar al menos un rol' });
            }
            try {
                // Verificar si el usuario existe
                const [usuario] = await db.promise().query('SELECT * FROM usuarios WHERE doc = ?', [usuarioId]);
                if (!usuario.length) {
                    return res.status(404).json({ error: 'Usuario no encontrado' });
                }
                // Asignar roles y registrar en tablas específicas
                for (const rol_id of rolesSeleccionados) {
                    // 1. Insertar en asignacion_rol (evitando duplicados)
                    await db.promise().query(
                        `INSERT IGNORE INTO asignacion_rol (doc_usu, rol_id, asignado_por) VALUES (?, ?, ?)`,
                        [usuarioId, rol_id, asignado_por]
                    );
                    // 2. Obtener nombre del rol
                    const [rol] = await db.promise().query('SELECT nom_rol FROM roles WHERE id = ?', [rol_id]);
                    const rolNombre = rol[0].nom_rol.toLowerCase();
                
                    // 3. Registrar en tabla específica según el rol
                    switch (rolNombre) {
                        case 'cliente':
                            await db.promise().query(
                                'INSERT INTO propietarios (id_prop) VALUES (?)',
                                [usuarioId]
                            );
                            break;
                        case 'veterinario':
                            const { especialidad } = req.body;
                            await db.promise().query(
                                'INSERT IGNORE INTO veterinarios (vet_id, especialidad) VALUES (?, ?)',
                                [usuarioId, especialidad || 'General']
                            );
                            break;
                        case 'administrador':
                            const { nivel_acceso } = req.body;
                            await db.promise().query(
                                'INSERT IGNORE INTO administradores (admin_id, nivel_acceso) VALUES (?, ?)',
                                [usuarioId, nivel_acceso || 'alto']
                            );
                            break;
                    }
                }
                res.status(200).json({ message: 'Roles asignados y registros actualizados correctamente' });
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Error en el servidor al asignar roles' });
            }
    });


      //**************************************************************************/
     //********************TRAER A SOLO LOS USUARIO CLIENTES*********************/
    //**************************************************************************/

    router.get('/odtener_clientes', async (req, res) => {
        try {
            const [clientes] = await db.promise().query(`
                SELECT u.*
                FROM usuarios u
                JOIN propietarios p ON u.doc = p.id_prop
            `);
            res.status(200).json(clientes);
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            res.status(500).json({ error: 'Error en el servidor al obtener los clientes' });
        }
    });

    //**************************************************************************/
     //*****************TRAER A SOLO LOS USUARIO veterinarios*******************/
    //**************************************************************************/
    
    router.get('/obtener_veterinarios', async (req, res) => {
        try {
            const [veterinarios] = await db.promise().query(`
                SELECT u.*, v.especialidad
                FROM usuarios u
                JOIN veterinarios v ON u.doc = v.vet_id
            `);
    
            res.status(200).json(veterinarios);
        } catch (error) {
            console.error('Error al obtener veterinarios:', error);
            res.status(500).json({ error: 'Error en el servidor al obtener los veterinarios' });
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
                JOIN administradores a ON u.doc = a.admin_id
            `)

            res.status(200).json(administradores)
        } catch (error) {
            console.error('❌ Error al obtener administradores:', error)
            res.status(500).json({ error: 'Error en el servidor al obtener los administradores' })
        }
    })

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
     //******************Odtener cuantos veterinarios  hay*********************/
    //**************************************************************************/
        router.get("/vet_registrados", (req, res) => {
            const query = "SELECT COUNT(*) AS total_veterinarios FROM veterinarios;";
        
            db.query(query, (err, results) => {
                if (err) {
                    console.error("Error al obtener la cantidad de veterinarios:", err);
                    return res.status(500).json({ message: "Hubo un problema al obtener los veterinarios" });
                }
                res.status(200).json(results);
            });
        });

    return router;
}
