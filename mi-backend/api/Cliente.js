const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

module.exports = function (db) {



    //**************************************************************************/
     //*********************Odtener cuantos clientes hay************************/
    //**************************************************************************/
        router.get("/clientes_registrados", (req, res) => {
            const query = "SELECT COUNT(*) AS total_clientes FROM propietarios;";
                
            db.query(query, (err, results) => {
                if (err) {
                    console.error("Error al obtener la cantidad de clientes:", err);
                    return res.status(500).json({ message: "Hubo un problema al obtener los clientes" });
                }
                res.status(200).json(results);
            });
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
     //****************ACTUALIZAR A SOLO LOS USUARIO CLIENTES*******************/
    //**************************************************************************/
        router.put('/actualizar_cliente/:doc', async (req, res) => {
            try {
                const { doc } = req.params; 
                const { tipo_Doc, nombre, email, tel, direccion, password, fecha_Nac } = req.body;

                if (!tipo_Doc || !nombre || !email) {
                    return res.status(400).json({ error: 'Campos requeridos faltantes (tipo_Doc, nombre, email).' });
                }
                let fechaFormateada = null;
                if (fecha_Nac) {
                    if (typeof fecha_Nac === 'string' && fecha_Nac.includes('T')) {
                        fechaFormateada = fecha_Nac.split('T')[0];
                    } 
                    else if (/^\d{4}-\d{2}-\d{2}$/.test(fecha_Nac)) {
                        fechaFormateada = fecha_Nac;
                    }
                    else {
                        const fecha = new Date(fecha_Nac);
                        if (!isNaN(fecha.getTime())) {
                            fechaFormateada = fecha.toISOString().split('T')[0];
                        }
                    }
                }
                const updateParts = [
                    'tipo_Doc = ?', 
                    'nombre = ?',
                    'email = ?'
                ];
                const queryParams = [
                    tipo_Doc,
                    nombre,
                    email
                ];
                if (tel !== undefined && tel !== null) {
                    updateParts.push('tel = ?');
                    queryParams.push(tel);
                }
                if (direccion !== undefined && direccion !== null) {
                    updateParts.push('direccion = ?');
                    queryParams.push(direccion);
                }
                if (password !== undefined && password !== null && password !== '') {
                    updateParts.push('password = ?');
                    queryParams.push(password);
                }
                updateParts.push('fecha_Nac = IFNULL(?, fecha_Nac)');
                queryParams.push(fechaFormateada || null);
            
                const setClause = updateParts.join(', ');
                const sqlQuery = `
                    UPDATE usuarios
                    SET 
                        ${setClause}
                    WHERE doc = ?
                `;
                queryParams.push(doc);
                const [result] = await db.promise().query(sqlQuery, queryParams);
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Cliente/Propietario no encontrado.' });
                }
                res.status(200).json({ success: true, message: 'Cliente/Propietario actualizado correctamente.' });
            
            } catch (error) {
                console.error('Error en la API de actualización de cliente/propietario:', error);

                if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
                    return res.status(400).json({ 
                        error: 'Formato de fecha inválido. Use YYYY-MM-DD' 
                    });
                }
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ 
                        error: 'Email/documento ya existe.' 
                    });
                }
                res.status(500).json({ 
                    error: 'Error interno al actualizar el cliente/propietario.',
                    details: error.message 
                });
            }
        });

        //**************************************************************************/
        //*******************CAMBIAR ESTADO A LOS USUARIO CLIENTES******************/
        //**************************************************************************/

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