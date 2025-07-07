// index.js

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Conexión a la base de datos
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'veterinaria',
  port: '3306',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error fatal al configurar el pool de la base de datos:', err);
    process.exit(1);
  }
  console.log('✅ Pool de conexiones a la base de datos listo.');
  connection.release();
});

console.log("Cargando rutas...");

// Importaciones de todos los módulos de rutas
const adminRoutes = require('./api/administrador');
const clienteRoutes = require('./api/Cliente');
const vet_adminRoutes = require('./api/Vet_Admin');
const rolesRoutes = require('./api/Roles');
const autenticacionRoutes = require('./api/autenticacion');
const notificacionesRoutes = require('./api/notificaciones')
const authRoutes = require('./api/auth');
const mascotaRoutes = require('./api/mascotas');
const propietarioRoutes = require('./api/propietario'); 
const servicioRoutes = require('./api/servicios');
const consultasvetRoutes = require('./api/consultasvet');
const veterinarioRoutes = require('./api/veterinario'); 
const citasvetRoutes = require('./api/citasvet');
const citasRoutes =require('./api/citas');
const historialRoutes = require('./api/historial');



// Montaje de todos los routers en la aplicación
app.use('/api/admin', adminRoutes(db));
app.use('/api/Cliente', clienteRoutes(db));
app.use('/api/vet_Admin', vet_adminRoutes(db));
app.use('/api/roles', rolesRoutes(db));
app.use('/api/autenticacion', autenticacionRoutes(db));
app.use('/api/notificacion', notificacionesRoutes(db));
app.use('/api/auth', authRoutes(db));
app.use('/api/mascotas', mascotaRoutes(db));
app.use('/api/propietarios', propietarioRoutes(db)); 
app.use('/api/servicios', servicioRoutes(db));
app.use('/api/consultas', consultasvetRoutes(db));
app.use('/api/veterinarios', veterinarioRoutes(db));
app.use('/api/citasvet', citasvetRoutes(db));
app.use('/api/citas', citasRoutes(db));
app.use('/api/historial', historialRoutes(db));


console.log("✅ Todas las rutas han sido cargadas.");

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
