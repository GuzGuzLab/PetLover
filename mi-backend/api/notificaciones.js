// routes/admin.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();



module.exports = function (db) {



  //************************************************************************* */
//*********************ENDPOINT PARA NOTIFICACIONES************************ */
//************************************************************************* */

// Obtener notificaciones para un usuario específico
router.get('/notificaciones/:usuarioId', (req, res) => {
    const { usuarioId } = req.params;
    
    // Verificar si el usuario es administrador
    const checkAdminQuery = 'SELECT * FROM administradores WHERE admin_id = ?';
    db.query(checkAdminQuery, [usuarioId], (err, adminResults) => {
        if (err) {
            console.error('Error al verificar rol de administrador:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Error del servidor al verificar permisos' 
            });
        }

        // Solo administradores pueden ver notificaciones de nuevos usuarios
        if (adminResults.length === 0) {
            return res.status(403).json({ 
                success: false,
                message: 'Acceso denegado. Solo para administradores' 
            });
        }

        // Consulta para obtener notificaciones
        const query = `
            SELECT n.*, u.nombre as usuario_nombre, u.email as usuario_email
            FROM notificaciones n
            LEFT JOIN usuarios u ON n.usuario_id = u.id
            WHERE n.tipo = 'nuevo_usuario' AND n.leida = FALSE
            ORDER BY n.fecha_creacion DESC
        `;
        
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error al obtener notificaciones:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Error del servidor al obtener notificaciones' 
                });
            }
            
            return res.status(200).json({
                success: true,
                notificaciones: results
            });
        });
    });
});

// Marcar notificación como leída
router.put('/notificaciones/marcar-leida/:notificacionId', (req, res) => {
    const { notificacionId } = req.params;
    const { usuarioId } = req.body; // ID del admin que marca como leída

    // Verificar si el usuario es administrador
    const checkAdminQuery = 'SELECT * FROM administradores WHERE admin_id = ?';
    db.query(checkAdminQuery, [usuarioId], (err, adminResults) => {
        if (err) {
            console.error('Error al verificar rol de administrador:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Error del servidor al verificar permisos' 
            });
        }

        if (adminResults.length === 0) {
            return res.status(403).json({ 
                success: false,
                message: 'Acceso denegado. Solo para administradores' 
            });
        }

        // Actualizar notificación
        const updateQuery = 'UPDATE notificaciones SET leida = TRUE WHERE id = ?';
        db.query(updateQuery, [notificacionId], (err, result) => {
            if (err) {
                console.error('Error al marcar notificación como leída:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Error del servidor al actualizar notificación' 
                });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Notificación no encontrada' 
                });
            }
            
            return res.status(200).json({
                success: true,
                message: 'Notificación marcada como leída'
            });
        });
    });
});


    return router; 
}