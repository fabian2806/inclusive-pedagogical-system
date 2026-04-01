-- Roles del sistema
INSERT INTO rol (nombre) VALUES ('ADMIN');
INSERT INTO rol (nombre) VALUES ('DOCENTE');
INSERT INTO rol (nombre) VALUES ('PADRE');
INSERT INTO rol (nombre) VALUES ('SAANEE');

-- Usuario admin semilla (password: admin123)
-- Hash BCrypt generado para 'admin123'
INSERT INTO usuario (nombre, apellido, correo, telefono, password_hash, estado)
VALUES ('Admin', 'Sistema', 'admin@signaedu.pe', NULL,
        '$2a$10$HoDvRWqC70cStGZRgASczODT1F..AWTRXcE4tPsJ1BOuIk9YunAa.', 'ACTIVO');

-- Asignar rol ADMIN al usuario semilla
INSERT INTO usuario_rol (usuario_id, rol_id)
VALUES (1, 1);
