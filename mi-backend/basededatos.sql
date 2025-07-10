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
    fecha_Regis TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
-- Datos de Ejemplo
-- -----------------------------------------------------

-- Primero insertamos los usuarios
INSERT INTO usuarios (id, tipo_Doc, doc, nombre, fecha_Nac, tel, email, direccion, password) VALUES 
(1, 'CC', '10101010', 'Ana García', '1990-05-15', '3001112233', 'ana.garcia@email.com', 'Calle Falsa 123', 'pass_hashed'), 
(2, 'CC', '20202020', 'Carlos Martinez', '1985-11-20', '3104445566', 'carlos.martinez@email.com', 'Avenida Siempre Viva 742', 'pass_hashed'), 
(3, 'CC', '30303030', 'Dr. Ricardo Sanchez', '1988-02-10', '3207778899', 'ricardo.sanchez.vet@email.com', 'Consultorio 101', 'pass_hashed'), 
(4, 'CC', '40404040', 'Dra. Laura Torres', '1992-09-01', '3019998877', 'laura.torres.vet@email.com', 'Consultorio 102', 'pass_hashed');

-- Insertamos administrador (usuario con id 1)
INSERT INTO administradores VALUES (1, 'alto');  -- ✅ CORREGIDO: después de usuarios

INSERT INTO roles (id, nom_rol, descripcion) VALUES 
(1, 'propietario', 'Dueño de mascota'), 
(2, 'veterinario', 'Médico veterinario'), 
(3, 'administrador', 'Admin del sistema');

-- ✅ CORREGIDO: nombre de tabla y campos correctos
INSERT INTO asignacion_rol (doc_usu, rol_id, asignado_por) VALUES 
('10101010', 1, 1), 
('20202020', 1, 1), 
('30303030', 2, 1), 
('40404040', 2, 1);

INSERT INTO veterinarios (vet_id, especialidad) VALUES 
(3, 'Cirugía General'), 
(4, 'Medicina Interna');

INSERT INTO mascotas (id, doc_pro, nombre, especie, raza, genero, color, fecha_nac, peso, tamano, estado_reproductivo, vacunado) VALUES 
(1, '10101010', 'Max', 'Perro', 'Golden Retriever', 'Macho', 'Dorado', '2021-03-10', 28.5, 'Grande', 'Intacto', 1), 
(2, '10101010', 'Luna', 'Gato', 'Siamés', 'Hembra', 'Crema', '2022-01-20', 4.2, 'Pequeño', 'Esterilizado', 1), 
(3, '20202020', 'Rocky', 'Perro', 'Bulldog Francés', 'Macho', 'Negro', '2020-07-30', 12.0, 'Mediano', 'Intacto', 1);

INSERT INTO servicios (id, nombre, descripcion, precio, duracion_estimada, estado) VALUES 
(1, 'Consulta General', 'Revisión completa', 50000, 30, 'Activo'),
(2, 'Vacunación Anual', 'Plan anual de vacunas', 80000, 20, 'Activo'), 
(3, 'Limpieza Dental', 'Profilaxis dental', 150000, 60, 'Activo'), 
(4, 'Corte de Pelo y Baño', 'Servicio de grooming', 70000, 90, 'Activo');

INSERT INTO citas (id, propietario_doc, mascota_id, servicio, veterinario_id, fecha, hora, notas, estado) VALUES 
(1, '10101010', 1, 'Consulta General', 3, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '10:00:00', 'Revisión anual', 'programada'), 
(2, '20202020', 3, 'Vacunación Anual', 4, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:00:00', 'Refuerzo', 'confirmada');

INSERT INTO historias_clinicas (mascota_id, cita_id, vet_id, fecha_consulta, motivo_consulta, diagnostico) VALUES 
(1, 1, 3, '2024-05-20 10:30:00', 'Control anual', 'Dermatitis alérgica');

-- -----------------------------------------------------
-- Procedimiento almacenado
-- -----------------------------------------------------

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