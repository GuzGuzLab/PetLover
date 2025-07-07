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

        router.put('/estado_cliente/:doc', async (req, res) => {
            const { doc } = req.params;
            try {
                const [cliente] = await db.promise().query(
                    'SELECT id, motivo_inactivo FROM usuarios WHERE doc = ? AND tipo_usuario = "cliente"',
                    [doc]
                );
                if (!cliente.length) {
                    return res.status(404).json({ error: 'Cliente no encontrado' });
                }
                const estaActivo = cliente[0].motivo_inactivo === null;
                const nuevoMotivo = estaActivo ? 'Desactivado por administrador' : null;
                await db.promise().query(
                    'UPDATE usuarios SET motivo_inactivo = ? WHERE doc = ?',
                    [nuevoMotivo, doc]
                );
                const [clienteActualizado] = await db.promise().query(
                    'SELECT id, doc, nombre, email, motivo_inactivo FROM usuarios WHERE doc = ?',
                    [doc]
                );
                res.status(200).json({
                    success: true,
                    message: `Cliente ${estaActivo ? 'desactivado' : 'activado'}`,
                    data: {
                        ...clienteActualizado[0],
                        activo: nuevoMotivo === null
                    }
                });
            } catch (error) {
                console.error('Error al cambiar estado:', error);
                res.status(500).json({ 
                    error: 'Error interno al cambiar estado',
                    details: error.message 
                });
            }
        });



        return router;
}