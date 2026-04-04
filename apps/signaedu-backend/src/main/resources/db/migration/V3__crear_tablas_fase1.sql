-- Tabla de alumnos
CREATE TABLE alumno (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    id_foto_perfil BIGINT,
    fecha_nacimiento DATE NOT NULL,
    grado VARCHAR(50) NOT NULL,
    seccion VARCHAR(50) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
);

-- Tabla de tipos de documento
CREATE TABLE tipo_documento (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    es_obligatorio BOOLEAN NOT NULL DEFAULT FALSE,
    es_versionable BOOLEAN NOT NULL DEFAULT FALSE,
    es_periodico BOOLEAN NOT NULL DEFAULT FALSE,
    periodicidad VARCHAR(50),
    es_predefinido BOOLEAN NOT NULL DEFAULT FALSE
);

-- Tabla puente docente-alumno
CREATE TABLE docente_alumno (
    id BIGSERIAL PRIMARY KEY,
    docente_id BIGINT NOT NULL REFERENCES usuario(id),
    alumno_id BIGINT NOT NULL REFERENCES alumno(id),
    UNIQUE (docente_id, alumno_id)
);

-- Tabla puente padre-alumno
CREATE TABLE padre_alumno (
    id BIGSERIAL PRIMARY KEY,
    padre_id BIGINT NOT NULL REFERENCES usuario(id),
    alumno_id BIGINT NOT NULL REFERENCES alumno(id),
    UNIQUE (padre_id, alumno_id)
);
