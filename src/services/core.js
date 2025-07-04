// const express = require('express');
// const mysql = require('mysql2/promise'); // Usamos la versión promise-based
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const multer = require('multer');
// const path = require('path');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// const app = express();
// const port = 3000;

// // Middlewares
// app.use(bodyParser.json());
// app.use(cors({
//   origin: 'http://localhost:3000', // Ajusta según tu frontend
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
// app.use('/uploads', express.static('uploads'));

// // Configuración de la base de datos MySQL
// const db = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'veterinaria',
//   port: '3306',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// // Configuración de Multer para imágenes
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, 'mascota-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Solo se permiten imágenes (JPEG/PNG)'), false);
//     }
//   },
//   limits: {
//     fileSize: 5 * 1024 * 1024 // 5MB
//   }
// });

// // Middleware de autenticación JWT
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
  
//   if (!token) return res.sendStatus(401);

//   jwt.verify(token, 'secreto', (err, user) => {
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
// };

// // -------------------------- RUTAS DE PROPIETARIO --------------------------

// // Registro de propietarios (Mejorado)
// app.post('/api/registro-propietario', async (req, res) => {
//   const { tipoDocumento, documento, nombre, fechaNacimiento, telefono, email, direccion, password } = req.body;

//   // Validaciones básicas
//   if (!tipoDocumento || !documento || !nombre || !password || !email || !fechaNacimiento) {
//     return res.status(400).json({ 
//       error: 'Faltan campos obligatorios',
//       required: ['tipoDocumento', 'documento', 'nombre', 'email', 'password', 'fechaNacimiento']
//     });
//   }

//   try {
//     // Verificar si el documento o email ya existen
//     const [existingUser] = await db.query(
//       'SELECT id FROM propietarios WHERE documento = ? OR email = ?',
//       [documento, email]
//     );

//     if (existingUser.length > 0) {
//       return res.status(409).json({ 
//         error: 'El documento o email ya está registrado',
//         code: 'USER_EXISTS'
//       });
//     }

//     // Encriptar contraseña
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insertar nuevo propietario
//     const [result] = await db.query(
//       `INSERT INTO propietarios 
//       (tipoDocumento, documento, nombre, fechaNacimiento, telefono, email, direccion, password) 
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//       [tipoDocumento, documento, nombre, fechaNacimiento, telefono, email, direccion, hashedPassword]
//     );

//     // Generar token JWT
//     const token = jwt.sign(
//       { id: result.insertId, email }, 
//       'secreto', 
//       { expiresIn: '24h' }
//     );

//     res.status(201).json({
//       success: true,
//       message: 'Propietario registrado exitosamente',
//       token,
//       user: {
//         id: result.insertId,
//         nombre,
//         email,
//         tipoDocumento
//       }
//     });

//   } catch (error) {
//     console.error('Error en registro de propietario:', error);
    
//     // Manejo específico de errores de MySQL
//     if (error.code === 'ER_DUP_ENTRY') {
//       return res.status(409).json({ 
//         error: 'El documento o email ya está registrado',
//         code: 'DUPLICATE_ENTRY'
//       });
//     }
    
//     res.status(500).json({ 
//       error: 'Error en el servidor',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined,
//       code: 'SERVER_ERROR'
//     });
//   }
// });

// // Login de propietarios (Mejorado)
// app.post('/api/login', async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ 
//       error: 'Email y contraseña son requeridos',
//       code: 'MISSING_FIELDS'
//     });
//   }

//   try {
//     // Buscar usuario en la base de datos
//     const [users] = await db.query(
//       'SELECT id, nombre, email, password, tipoDocumento FROM propietarios WHERE email = ?', 
//       [email]
//     );

//     if (users.length === 0) {
//       return res.status(401).json({ 
//         error: 'Credenciales incorrectas',
//         code: 'INVALID_CREDENTIALS'
//       });
//     }

//     const user = users[0];

//     // Verificar contraseña
//     const passwordMatch = await bcrypt.compare(password, user.password);
//     if (!passwordMatch) {
//       return res.status(401).json({ 
//         error: 'Credenciales incorrectas',
//         code: 'INVALID_CREDENTIALS'
//       });
//     }

//     // Generar token JWT
//     const token = jwt.sign(
//       { id: user.id, email: user.email }, 
//       'secreto', 
//       { expiresIn: '24h' }
//     );

//     res.json({
//       success: true,
//       message: 'Inicio de sesión exitoso',
//       token,
//       user: {
//         id: user.id,
//         nombre: user.nombre,
//         email: user.email,
//         tipoDocumento: user.tipoDocumento
//       }
//     });

//   } catch (error) {
//     console.error('Error en login:', error);
//     res.status(500).json({ 
//       error: 'Error en el servidor',
//       code: 'SERVER_ERROR'
//     });
//   }
// });

// // Obtener información completa del propietario (protegida)
// app.get('/api/propietario', authenticateToken, async (req, res) => {
//   try {
//     const [users] = await db.query(
//       'SELECT id, tipoDocumento, documento, nombre, fechaNacimiento, telefono, email, direccion FROM propietarios WHERE id = ?',
//       [req.user.id]
//     );

//     if (users.length === 0) {
//       return res.status(404).json({ 
//         error: 'Usuario no encontrado',
//         code: 'USER_NOT_FOUND'
//       });
//     }

//     res.json({
//       success: true,
//       data: users[0]
//     });
//   } catch (error) {
//     console.error('Error al obtener datos del propietario:', error);
//     res.status(500).json({ 
//       error: 'Error en el servidor',
//       code: 'SERVER_ERROR'
//     });
//   }
// });

// // Actualizar información del propietario (protegida)
// app.put('/api/propietario', authenticateToken, async (req, res) => {
//   const { nombre, telefono, direccion } = req.body;
//   const userId = req.user.id;

//   if (!nombre) {
//     return res.status(400).json({ 
//       error: 'El nombre es obligatorio',
//       code: 'MISSING_FIELDS'
//     });
//   }

//   try {
//     await db.query(
//       'UPDATE propietarios SET nombre = ?, telefono = ?, direccion = ? WHERE id = ?',
//       [nombre, telefono, direccion, userId]
//     );
    
//     res.json({
//       success: true,
//       message: 'Información actualizada exitosamente'
//     });
//   } catch (error) {
//     console.error('Error al actualizar propietario:', error);
//     res.status(500).json({ 
//       error: 'Error en el servidor',
//       code: 'SERVER_ERROR'
//     });
//   }
// });

// // Cambiar contraseña (protegida)
// app.put('/api/propietario/cambiar-password', authenticateToken, async (req, res) => {
//   const { currentPassword, newPassword } = req.body;
//   const userId = req.user.id;

//   if (!currentPassword || !newPassword) {
//     return res.status(400).json({ 
//       error: 'Ambas contraseñas son requeridas',
//       code: 'MISSING_FIELDS'
//     });
//   }

//   try {
//     // 1. Verificar contraseña actual
//     const [users] = await db.query(
//       'SELECT password FROM propietarios WHERE id = ?',
//       [userId]
//     );
    
//     const passwordMatch = await bcrypt.compare(currentPassword, users[0].password);
//     if (!passwordMatch) {
//       return res.status(401).json({ 
//         error: 'Contraseña actual incorrecta',
//         code: 'INVALID_PASSWORD'
//       });
//     }

//     // 2. Actualizar contraseña
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     await db.query(
//       'UPDATE propietarios SET password = ? WHERE id = ?',
//       [hashedPassword, userId]
//     );

//     res.json({
//       success: true,
//       message: 'Contraseña actualizada exitosamente'
//     });
//   } catch (error) {
//     console.error('Error al cambiar contraseña:', error);
//     res.status(500).json({ 
//       error: 'Error en el servidor',
//       code: 'SERVER_ERROR'
//     });
//   }
// });

// // Obtener mascotas del propietario (protegida)
// app.get('/api/propietario/mascotas', authenticateToken, async (req, res) => {
//   try {
//     const [mascotas] = await db.query(
//       'SELECT id, nombre, especie, raza, foto FROM mascotas WHERE propietario_id = ?',
//       [req.user.id]
//     );
    
//     res.json({
//       success: true,
//       data: mascotas
//     });
//   } catch (error) {
//     console.error('Error al obtener mascotas del propietario:', error);
//     res.status(500).json({ 
//       error: 'Error en el servidor',
//       code: 'SERVER_ERROR'
//     });
//   }
// });

// // -------------------------- RUTAS DE MASCOTAS --------------------------

// // Registro de mascotas (protegido)
// app.post('/api/registro-mascota', authenticateToken, upload.single('foto'), async (req, res) => {
//   const {
//     nombre, especie, raza, genero, fechaNacimiento, 
//     peso, color, tamano, estadoReproductivo, 
//     vacunado, observaciones
//   } = req.body;

//   const propietarioId = req.user.id;

//   // Validaciones
//   if (!nombre || !especie || !genero || !fechaNacimiento) {
//     return res.status(400).json({ 
//       error: 'Faltan campos obligatorios',
//       required: ['nombre', 'especie', 'genero', 'fechaNacimiento'],
//       code: 'MISSING_FIELDS'
//     });
//   }

//   if (isNaN(parseFloat(peso))) {
//     return res.status(400).json({ 
//       error: 'El peso debe ser un número válido',
//       code: 'INVALID_WEIGHT'
//     });
//   }

//   try {
//     // Verificar que el propietario existe
//     const [propietario] = await db.query(
//       'SELECT id FROM propietarios WHERE id = ?',
//       [propietarioId]
//     );

//     if (propietario.length === 0) {
//       return res.status(404).json({ 
//         error: 'Propietario no encontrado',
//         code: 'OWNER_NOT_FOUND'
//       });
//     }

//     const fotoPath = req.file ? req.file.filename : null;

//     // Insertar mascota
//     const [result] = await db.query(
//       `INSERT INTO mascotas (
//         nombre, especie, raza, genero, fecha_nacimiento, peso, color,
//         tamano, estado_reproductivo, vacunado, observaciones, foto, propietario_id
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         nombre, especie, raza, genero, fechaNacimiento, 
//         parseFloat(peso), color, tamano, estadoReproductivo,
//         vacunado ? 1 : 0, observaciones, fotoPath, propietarioId
//       ]
//     );

//     res.status(201).json({
//       success: true,
//       message: 'Mascota registrada exitosamente',
//       data: {
//         mascotaId: result.insertId,
//         foto: fotoPath
//       }
//     });

//   } catch (error) {
//     console.error('Error al registrar mascota:', error);
    
//     if (error.code === 'ER_DUP_ENTRY') {
//       return res.status(409).json({ 
//         error: 'Mascota ya registrada',
//         code: 'PET_EXISTS'
//       });
//     }
    
//     res.status(500).json({ 
//       error: 'Error en el servidor',
//       code: 'SERVER_ERROR'
//     });
//   }
// });

// // -------------------------- RUTAS ADICIONALES --------------------------

// // Listado de propietarios (protegido, para administración)
// app.get('/api/propietarios', authenticateToken, async (req, res) => {
//   try {
//     const [propietarios] = await db.query(
//       'SELECT id, tipoDocumento, documento, nombre, email, telefono FROM propietarios'
//     );
    
//     res.json({
//       success: true,
//       data: propietarios
//     });
//   } catch (error) {
//     console.error('Error al obtener propietarios:', error);
//     res.status(500).json({ 
//       error: 'Error en el servidor',
//       code: 'SERVER_ERROR'
//     });
//   }
// });

// // Iniciamos el servidor
// app.listen(port, () => {
//   console.log(`Servidor corriendo en http://localhost:${port}`);
// });