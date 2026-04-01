-- Tabla de usuarios
CREATE TABLE usuario (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
);

-- Tabla de roles
CREATE TABLE rol (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
);

-- Tabla de permisos
CREATE TABLE permiso (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

-- Tabla puente usuario-rol
CREATE TABLE usuario_rol (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id),
    rol_id BIGINT NOT NULL REFERENCES rol(id),
    UNIQUE (usuario_id, rol_id)
);

-- Tabla puente rol-permiso
CREATE TABLE rol_permiso (
    id BIGSERIAL PRIMARY KEY,
    rol_id BIGINT NOT NULL REFERENCES rol(id),
    permiso_id BIGINT NOT NULL REFERENCES permiso(id),
    UNIQUE (rol_id, permiso_id)
);
