-- Script de datos de prueba para eventos_app

-- 1. Insertar organizaciones
INSERT INTO organizaciones (nombre, descripcion) VALUES
('TechCorp', 'Empresa líder en tecnología'),
('EventosPro', 'Empresa de eventos digitales');

-- 2. Insertar categorías de asistentes
INSERT INTO categorias_asistentes (nombre, descripcion) VALUES
('VIP', 'Entrada VIP con acceso completo'),
('Estándar', 'Entrada estándar'),
('Estudiante', 'Entrada para estudiantes');

-- 3. Insertar eventos
INSERT INTO eventos (id_organizacion, nombre, descripcion, fecha_inicio, fecha_fin, estado) VALUES
(1, 'TechConf 2024', 'Conferencia anual de tecnología', '2024-06-15 09:00:00', '2024-06-17 18:00:00', 'PUBLICADO'),
(1, 'WebDeveloper Summit', 'Summit para desarrolladores web', '2024-07-20 08:00:00', '2024-07-21 17:00:00', 'BORRADOR'),
(2, 'Digital Marketing Expo', 'Exposición de marketing digital', '2024-08-10 10:00:00', '2024-08-12 19:00:00', 'PUBLICADO');

-- 4. Insertar asistentes
INSERT INTO asistentes (id_evento, id_categoria, email, nombre, apellidos, empresa, cargo, token_qr, id_registro, estado) VALUES
(1, 1, 'juan.perez@email.com', 'Juan', 'Pérez', 'TechCorp', 'Ingeniero', 'QR123ABC', 'EV-1-A1B2', 'CONFIRMADO'),
(1, 2, 'maria.garcia@email.com', 'María', 'García', 'DevStudio', 'Diseñadora', 'QR456DEF', 'EV-1-C3D4', 'CONFIRMADO'),
(1, 3, 'carlos.lopez@email.com', 'Carlos', 'López', 'Universidad XYZ', 'Estudiante', 'QR789GHI', 'EV-1-E5F6', 'PENDIENTE'),
(2, 1, 'ana.martinez@email.com', 'Ana', 'Martínez', 'WebAgency', 'Lead Developer', 'QR012JKL', 'EV-2-G7H8', 'CONFIRMADO'),
(3, 2, 'luis.fernandez@email.com', 'Luis', 'Fernández', 'Marketing Plus', 'Especialista', 'QR345MNO', 'EV-3-I9J0', 'CONFIRMADO');
