-- Active: 1750373550338@@localhost@3306@veterinaria
DROP DATABASE IF EXISTS veterinaria;
CREATE DATABASE veterinaria;
USE veterinaria;

-- -----------------------------------------------------
-- Tablas
-- -----------------------------------------------------

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_Doc VARCHAR(10) NOT NULL,
    doc VARCHAR(15) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    fecha_Nac DATE,
    tel VARCHAR(15),
    email VARCHAR(100) NOT NULL UNIQUE,
    direccion VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo', -- NUEVA COLUMNA PARA ESTADO
    fecha_Regis TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 SELECT*FROM usuarios;

CREATE TABLE propietarios (
    id_prop VARCHAR(15) PRIMARY KEY,
    FOREIGN KEY (id_prop) REFERENCES usuarios(doc) ON DELETE CASCADE
);

CREATE TABLE veterinarios (
    vet_id INT PRIMARY KEY,
    especialidad VARCHAR(50) NOT NULL,
    FOREIGN KEY (vet_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE administradores (
    admin_id INT PRIMARY KEY,
    nivel_acceso ENUM('basico', 'medio', 'alto') DEFAULT 'medio',
    FOREIGN KEY (admin_id) REFERENCES usuarios(id) ON DELETE CASCADE
);


CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

CREATE TABLE asignacion_rol (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doc_usu VARCHAR(15) NOT NULL UNIQUE,
    rol_id INT NOT NULL,
    asignado_por INT COMMENT 'ID del admin que asignó el rol',
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doc_usu) REFERENCES usuarios(doc) ON DELETE CASCADE,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (asignado_por) REFERENCES administradores(admin_id) ON DELETE SET NULL
);

CREATE TABLE notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(30) NOT NULL COMMENT 'Tipo de notificación',
  mensaje VARCHAR(150) NOT NULL,
  usuario_id INT COMMENT 'ID del usuario relacionado',
  leida BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE mascotas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doc_pro VARCHAR(15) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raza VARCHAR(50) NOT NULL,
    genero ENUM('Macho', 'Hembra') NOT NULL,
    color VARCHAR(30),
    fecha_nac DATE NOT NULL,
    peso DECIMAL(5,2),
    tamano ENUM('Pequeño', 'Mediano', 'Grande') NOT NULL,
    estado_reproductivo ENUM('Intacto', 'Esterilizado', 'Castrado') NOT NULL,
    vacunado BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doc_pro) REFERENCES usuarios(doc) ON DELETE CASCADE
);

CREATE TABLE servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    duracion_estimada INT,
    estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo'
);

CREATE TABLE citas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    propietario_doc VARCHAR(50) NOT NULL,
    mascota_id INT NOT NULL,
    servicio VARCHAR(100) NOT NULL,
    veterinario_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    notas TEXT,
    estado ENUM('programada', 'confirmada', 'cancelada', 'completada') DEFAULT 'programada',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (propietario_doc) REFERENCES usuarios(doc) ON DELETE CASCADE,
    FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE CASCADE,
    FOREIGN KEY (veterinario_id) REFERENCES veterinarios(vet_id) ON DELETE CASCADE
);

CREATE TABLE historias_clinicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mascota_id INT NOT NULL,
    cita_id INT,
    vet_id INT NOT NULL,
    fecha_consulta DATETIME NOT NULL,
    motivo_consulta TEXT NOT NULL,
    signos_vitales JSON NULL,
    examen_fisico TEXT,
    diagnostico TEXT,
    tratamiento TEXT,
    medicamentos JSON NULL,
    observaciones TEXT,
    recomendaciones TEXT,
    proxima_cita DATE NULL,
    archivos_adjuntos JSON NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE CASCADE,
    FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE SET NULL,
    FOREIGN KEY (vet_id) REFERENCES veterinarios(vet_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Trigger para notificaciones
-- -----------------------------------------------------

DELIMITER //
CREATE TRIGGER notificar_nuevo_usuario
AFTER INSERT ON usuarios
FOR EACH ROW
BEGIN
  INSERT INTO notificaciones (tipo, mensaje, usuario_id)
  VALUES (
    'nuevo_usuario', 
    CONCAT('Se registró el usuario: ', NEW.nombre),
    NEW.id
  );
END //
DELIMITER ;

-- =================================================================
-- INSERCIÓN DE DATOS MAESTROS (Tablas sin dependencias)
-- =================================================================

-- 1. Roles del sistema
INSERT INTO roles (id, nom_rol, descripcion) VALUES 
(1, 'propietario', 'Dueño de mascota con acceso a la información de sus animales.'), 
(2, 'veterinario', 'Médico veterinario con acceso a historias clínicas y citas.'), 
(3, 'administrador', 'Administrador con acceso total al sistema.');

-- 2. Servicios ofrecidos por la veterinaria
INSERT INTO servicios (id, nombre, descripcion, precio, duracion_estimada, estado) VALUES
(1, 'Consulta General', 'Revisión completa del estado de salud de la mascota.', 75000.00, 30, 'Activo'),
(2, 'Vacunación Anual Canina', 'Paquete de vacunas anuales para perros.', 95000.00, 20, 'Activo'),
(3, 'Esterilización Felina', 'Procedimiento quirúrgico para esterilizar gatas.', 250000.00, 90, 'Activo'),
(4, 'Control y Seguimiento', 'Cita para revisar la evolución de un tratamiento.', 50000.00, 25, 'Activo');


-- =================================================================
-- INSERCIÓN DE USUARIOS Y ASIGNACIÓN DE ROLES
-- =================================================================

-- 3. Usuarios base
INSERT INTO usuarios (id, tipo_Doc, doc, nombre, fecha_Nac, tel, email, direccion, password, estado) VALUES
(1, 'CC', '1001', 'YENIFER NOREIDY', '1990-05-15', '3101234567', 'yenifer.noreidy@email.com', 'Calle Falsa 123', 'password_hashed', 'Activo'),
(2, 'CC', '1002', 'DAVID GUZMAN', '1988-11-20', '3117654321', 'davidfernandoguzmanarias@gmail.com', 'Avenida Siempre Viva 742', 'guzVet@16', 'Activo'),
(3, 'CC', '1003', 'FELIPE NIEVES', '1995-02-10', '3209876543', 'felipe.nieves@email.com', 'Carrera 45 # 67-89', 'password_hashed', 'Activo'),
(4, 'CC', '1004', 'ALEJANDRA LINARES', '1998-07-25', '3002345678', 'alejandra.linares@email.com', 'Diagonal 12 # 34-56', 'password_hashed', 'Inactivo'); -- Usuario de ejemplo inactivo

-- 4. Creación de perfiles específicos (Administrador, Veterinario, Propietarios)
INSERT INTO administradores (admin_id, nivel_acceso) VALUES
(1, 'alto'); -- YENIFER NOREIDY (id=1) es administradora

INSERT INTO veterinarios (vet_id, especialidad) VALUES
(2, 'Medicina Interna'); -- DAVID GUZMAN (id=2) es veterinario

INSERT INTO propietarios (id_prop) VALUES
('1003'), -- FELIPE NIEVES (doc='1003') es propietario
('1004'); -- ALEJANDRA LINARES (doc='1004') es propietaria

-- 5. Asignación de roles
INSERT INTO asignacion_rol (doc_usu, rol_id, asignado_por) VALUES
('1001', 3, 1), 
('1002', 2, 1), 
('1003', 1, 1), 
('1004', 1, 1); 


-- =================================================================
-- INSERCIÓN DE DATOS RELACIONADOS (Mascotas, Citas, etc.)
-- =================================================================

-- 6. Mascotas
INSERT INTO mascotas (doc_pro, nombre, especie, raza, genero, color, fecha_nac, peso, tamano, estado_reproductivo, vacunado) VALUES
('1003', 'Thor', 'Perro', 'Golden Retriever', 'Macho', 'Dorado', '2022-01-20', 28.5, 'Grande', 'Intacto', TRUE),
('1003', 'Luna', 'Gato', 'Siamés', 'Hembra', 'Crema y marrón', '2023-05-10', 4.2, 'Mediano', 'Esterilizado', TRUE),
('1004', 'Rocky', 'Perro', 'Bulldog Francés', 'Macho', 'Negro', '2021-09-01', 12.0, 'Pequeño', 'Intacto', FALSE);

-- 7. Citas
INSERT INTO citas (propietario_doc, mascota_id, servicio, veterinario_id, fecha, hora, notas, estado) VALUES
('1003', 1, 'Consulta General', 2, '2025-07-15', '10:30:00', 'La mascota ha estado estornudando mucho últimamente.', 'programada');

-- 8. Historias Clínicas
INSERT INTO historias_clinicas (mascota_id, cita_id, vet_id, fecha_consulta, motivo_consulta, signos_vitales, diagnostico, tratamiento, recomendaciones) VALUES
(1, 1, 2, '2025-07-15 10:35:00', 'Estornudos frecuentes y secreción nasal.', 
'{"temperatura_C": "38.5", "frecuencia_cardiaca_lpm": "90", "frecuencia_respiratoria_rpm": "25"}',
'Posible rinitis alérgica.', 
'Administrar antihistamínico durante 7 días.', 
'Evitar exposición a polvo y polen. Volver a control en 10 días si no hay mejoría.');

-- 9. Notificaciones
INSERT INTO notificaciones (tipo, mensaje, usuario_id) VALUES
('Recordatorio de Cita', 'Le recordamos su cita para Thor el día 2025-07-15 a las 10:30 AM.', 3);


-- -----------------------------------------------------
-- Procedimientos Almacenados
-- -----------------------------------------------------

-- Procedimiento para verificar el login y el estado del usuario
DROP PROCEDURE IF EXISTS VerifyLogin;
DELIMITER $$
CREATE PROCEDURE `VerifyLogin`(
    IN p_email VARCHAR(100)
)
BEGIN
    SELECT
        u.id,
        u.nombre,
        u.email,
        u.password,
        u.estado, -- Devolvemos el estado para que el backend lo verifique
        r.nom_rol AS rol
    FROM
        usuarios u
    JOIN
        asignacion_rol ar ON u.doc = ar.doc_usu
    JOIN
        roles r ON ar.rol_id = r.id
    WHERE
        u.email = p_email;
END$$
DELIMITER ;

-- Procedimiento para cambiar el estado de un usuario (Activo/Inactivo)
DROP PROCEDURE IF EXISTS ToggleUserStatus;
DELIMITER $$
CREATE PROCEDURE `ToggleUserStatus`(
    IN p_user_id INT
)
BEGIN
    DECLARE current_status ENUM('Activo', 'Inactivo');

    -- Obtener el estado actual del usuario
    SELECT estado INTO current_status FROM usuarios WHERE id = p_user_id;

    -- Cambiar al estado opuesto
    IF current_status = 'Activo' THEN
        UPDATE usuarios SET estado = 'Inactivo' WHERE id = p_user_id;
    ELSE
        UPDATE usuarios SET estado = 'Activo' WHERE id = p_user_id;
    END IF;
END$$
DELIMITER ;


-- Procedimiento para modificar la contraseña de un usuario por email
DROP PROCEDURE IF EXISTS ModifyPassword;
DELIMITER $$
CREATE PROCEDURE `ModifyPassword`(
    IN p_email VARCHAR(100),
    IN p_new_password VARCHAR(255)
)
BEGIN
    UPDATE usuarios
    SET 
        password = p_new_password
    WHERE 
        email = p_email;
END$$
DELIMITER ;


-- Procedimiento para obtener detalles de los propietarios y sus mascotas
DROP PROCEDURE IF EXISTS GetOwnersWithDetails;
DELIMITER $$
CREATE PROCEDURE `GetOwnersWithDetails`(IN p_doc VARCHAR(15))
BEGIN
    SELECT
        u.id,
        u.doc,
        u.nombre,
        u.tel AS phone,
        u.email,
        u.direccion AS address,
        u.estado, -- Devolvemos también el estado del propietario
        u.fecha_Regis AS registrationDate,
        MIN(CONCAT(c.fecha, ' ', c.hora)) as nextAppointmentDate,
        IFNULL(
            CONCAT('[',
                GROUP_CONCAT(
                    DISTINCT
                    IF(m.id IS NULL, NULL,
                        JSON_OBJECT(
                            'id', m.id,
                            'name', m.nombre,
                            'species', m.especie,
                            'breed', m.raza,
                            'age', CONCAT(TIMESTAMPDIFF(YEAR, m.fecha_nac, CURDATE()), ' años'),
                            'weight', m.peso,
                            'gender', m.genero,
                            'photo', '/placeholder.svg?height=80&width=80',
                            'pendingAppointments', (SELECT COUNT(*) FROM citas c_sub WHERE c_sub.mascota_id = m.id AND c_sub.estado IN ('programada', 'confirmada') AND CONCAT(c_sub.fecha, ' ', c_sub.hora) >= NOW()),
                            'lastVisit', (SELECT MAX(hc.fecha_consulta) FROM historias_clinicas hc WHERE hc.mascota_id = m.id),
                            'nextAppointment', (
                                SELECT JSON_OBJECT('date', c_sub.fecha, 'time', c_sub.hora, 'service', c_sub.servicio, 'status', LOWER(c_sub.estado))
                                FROM citas c_sub
                                WHERE c_sub.mascota_id = m.id AND c_sub.estado IN ('programada', 'confirmada') AND CONCAT(c_sub.fecha, ' ', c_sub.hora) >= NOW()
                                ORDER BY CONCAT(c_sub.fecha, ' ', c_sub.hora) ASC LIMIT 1
                            )
                        )
                    )
                ),
            ']'),
        '[]') as pets
    FROM
        usuarios u
    JOIN
        asignacion_rol ar ON u.doc = ar.doc_usu
    JOIN
        roles r ON ar.rol_id = r.id
    LEFT JOIN
        mascotas m ON u.doc = m.doc_pro
    LEFT JOIN
        citas c ON m.id = c.mascota_id AND c.estado IN ('programada', 'confirmada') AND CONCAT(c.fecha, ' ', c.hora) >= NOW()
    WHERE
        r.nom_rol = 'propietario' AND (p_doc IS NULL OR p_doc = '' OR u.doc LIKE CONCAT('%', p_doc, '%'))
    GROUP BY
        u.id
    ORDER BY
        MIN(CONCAT(c.fecha, ' ', c.hora)) IS NULL, MIN(CONCAT(c.fecha, ' ', c.hora)) ASC;
END$$
DELIMITER ;
<<<<<<< HEAD

DELIMITER $$

CREATE PROCEDURE ModifyPassword (
    IN p_doc VARCHAR(15),
    IN p_new_password VARCHAR(255)
)
BEGIN
    UPDATE usuarios
    SET password = p_new_password
    WHERE doc = p_doc;
END $$

DELIMITER ;
=======
>>>>>>> e799c265f01b5607ab3582d82e3acf4cfa423ba3
