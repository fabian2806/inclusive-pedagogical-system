-- Documentos formales del expediente (PEP, IPP, IB, IS, OTRO).
-- Versionado por tupla logica (alumno, tipo, periodo): la version y el
-- archivado se gestionan en servicio (ver DocumentoExpedienteService).
-- Toda subida formal crea ademas una entrada_expediente de tipo
-- DOCUMENTO_ADJUNTADO (FK NOT NULL).
CREATE TABLE documento_expediente (
    id BIGSERIAL PRIMARY KEY,
    entrada_expediente_id BIGINT NOT NULL REFERENCES entrada_expediente(id),
    tipo_documento_id BIGINT NOT NULL REFERENCES tipo_documento(id),
    archivo_id BIGINT NOT NULL UNIQUE REFERENCES archivo_adjunto(id),
    titulo VARCHAR(255) NOT NULL,
    periodo VARCHAR(50),
    version INTEGER,
    fecha_emision DATE NOT NULL,
    fecha_subida TIMESTAMP NOT NULL,
    id_usuario_subido BIGINT NOT NULL REFERENCES usuario(id),
    estado VARCHAR(20) NOT NULL
);

CREATE INDEX idx_documento_expediente_entrada
    ON documento_expediente (entrada_expediente_id);

CREATE INDEX idx_documento_expediente_tipo_periodo_estado
    ON documento_expediente (tipo_documento_id, periodo, estado);
