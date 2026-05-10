-- Adjuntos casuales a una entrada de la bitacora (Fase 2d).
-- Espejo de evento_archivo (Fase 3) salvo el campo "tipo", que no aplica
-- aqui. Cada adjunto corresponde a un solo archivo (1-1) y solo se permite
-- sobre entradas raiz (validado en servicio).
CREATE TABLE entrada_archivo (
    id BIGSERIAL PRIMARY KEY,
    entrada_id BIGINT NOT NULL REFERENCES entrada_expediente(id),
    archivo_id BIGINT NOT NULL UNIQUE REFERENCES archivo_adjunto(id),
    descripcion TEXT,
    id_usuario_subido BIGINT NOT NULL REFERENCES usuario(id),
    fecha_subida TIMESTAMP NOT NULL
);

CREATE INDEX idx_entrada_archivo_entrada
    ON entrada_archivo (entrada_id);
