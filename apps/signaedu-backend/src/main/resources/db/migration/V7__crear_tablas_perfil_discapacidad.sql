-- Tabla principal del perfil de discapacidad auditiva (1:1 con alumno)
CREATE TABLE perfil_discapacidad_auditiva (
    id BIGSERIAL PRIMARY KEY,
    alumno_id BIGINT NOT NULL UNIQUE REFERENCES alumno(id),
    modo_comunicacion_preferido VARCHAR(255),
    observaciones_generales TEXT
);

-- Barreras identificadas
CREATE TABLE perfil_barrera (
    id BIGSERIAL PRIMARY KEY,
    perfil_discapacidad_auditiva_id BIGINT NOT NULL REFERENCES perfil_discapacidad_auditiva(id),
    tipo VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL
);

-- Fortalezas del alumno
CREATE TABLE perfil_fortaleza (
    id BIGSERIAL PRIMARY KEY,
    perfil_discapacidad_auditiva_id BIGINT NOT NULL REFERENCES perfil_discapacidad_auditiva(id),
    dimension VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL
);

-- Apoyos educativos
CREATE TABLE perfil_apoyo (
    id BIGSERIAL PRIMARY KEY,
    perfil_discapacidad_auditiva_id BIGINT NOT NULL REFERENCES perfil_discapacidad_auditiva(id),
    intensidad VARCHAR(50) NOT NULL,
    funcion VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    fuente VARCHAR(50) NOT NULL
);
