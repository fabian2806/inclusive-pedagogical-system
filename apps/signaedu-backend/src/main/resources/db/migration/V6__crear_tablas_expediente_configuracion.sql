-- Tabla de expedientes
CREATE TABLE expediente (
    id BIGSERIAL PRIMARY KEY,
    alumno_id BIGINT NOT NULL REFERENCES alumno(id),
    fecha_apertura DATE NOT NULL,
    periodo_lectivo VARCHAR(10) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    UNIQUE (alumno_id, periodo_lectivo)
);

-- Tabla de configuración global (key-value)
CREATE TABLE configuracion (
    id BIGSERIAL PRIMARY KEY,
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor VARCHAR(255) NOT NULL
);

-- Seed: periodo lectivo vigente
INSERT INTO configuracion (clave, valor) VALUES ('periodo_lectivo_vigente', '2026');
