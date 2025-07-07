// routes/admin.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

module.exports = function (db) {

    //**************************************************************************/
     //*****************TRAER A SOLO LOS USUARIO veterinarios*******************/
    //**************************************************************************/
    
    router.get('/obtener_veterinarios', async (req, res) => {
        try {
            const [veterinarios] = await db.promise().query(`
                SELECT u.*, v.especialidad
                FROM usuarios u
                JOIN veterinarios v ON u.id = v.vet_id
            `);
            res.status(200).json(veterinarios);
        } catch (error) {
            console.error('Error al obtener veterinarios:', error);
            res.status(500).json({ error: 'Error en el servidor al obtener los veterinarios' });
        }
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
        

    //**************************************************************************/
    //************************* ACTUALIZAR VETERINARIO *************************/
    //**************************************************************************/
        router.put('/actualizar_veterinario/:doc', async (req, res) => {
            try {
                const { doc } = req.params;
                const { tipo_Doc, nombre, email, especialidad, tel, direccion, password, fecha_Nac } = req.body;
            
                if (!tipo_Doc || !nombre || !email) {
                    return res.status(400).json({ error: 'Campos requeridos faltantes (tipo_Doc, nombre, email).' });
                }
                const updateParts = [
                    'u.tipo_Doc = ?',
                    'u.nombre = ?',
                    'u.email = ?',
                    'v.especialidad = ?'
                ];
                const queryParams = [
                    tipo_Doc,
                    nombre,
                    email,
                    especialidad || 'General' 
                ];
                if (tel !== undefined && tel !== null) { // Usar !== undefined para verificar si el campo fue enviado
                    updateParts.push('u.tel = ?');
                    queryParams.push(tel);
                }
                if (direccion !== undefined && direccion !== null) {
                    updateParts.push('u.direccion = ?');
                    queryParams.push(direccion);
                }
                if (password !== undefined && password !== null && password !== '') { // Asegurarse de que no sea solo un string vacío
                    updateParts.push('u.password = ?');
                    queryParams.push(password);
                }
                updateParts.push('u.fecha_Nac = IFNULL(?, u.fecha_Nac)');
                queryParams.push(fecha_Nac || null); 
                const setClause = updateParts.join(', ');
                const sqlQuery = `
                    UPDATE usuarios u
                    JOIN veterinarios v ON u.id = v.vet_id
                    SET 
                        ${setClause}
                    WHERE u.doc = ?
                `;
                queryParams.push(doc); 
                const [result] = await db.promise().query(sqlQuery, queryParams);
            
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Veterinario no encontrado' });
                }
                res.status(200).json({ success: true, message: 'Veterinario actualizado' });
            
            } catch (error) {
                console.error('Error en la API de actualización:', error);
                res.status(500).json({ 
                    error: error.code === 'ER_DUP_ENTRY' 
                         ? 'Email/documento ya existe' 
                         : 'Error al actualizar' 
                });
            }
        });

       return router;
}
