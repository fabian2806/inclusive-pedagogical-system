-- Tabla de archivos fisicos almacenados (Fase 2d).
-- Cada fila representa un archivo en el storage (filesystem en dev, S3 en prod).
-- La envoltura logica vive en documento_expediente (formal) o en
-- entrada_archivo (adjunto casual a una entrada). Un archivo pertenece a una
-- sola envoltura; se garantiza por aplicacion (no es expresable en SQL puro).
CREATE TABLE archivo_adjunto (
    id BIGSERIAL PRIMARY KEY,
    nombre_original VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    tamano BIGINT NOT NULL,
    ruta_almacenamiento VARCHAR(500) NOT NULL UNIQUE,
    fecha_subida TIMESTAMP NOT NULL
);
