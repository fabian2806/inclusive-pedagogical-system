-- Tabla de entradas del expediente (bitácora)
CREATE TABLE entrada_expediente (
    id BIGSERIAL PRIMARY KEY,
    expediente_id BIGINT NOT NULL REFERENCES expediente(id),
    tipo_entrada VARCHAR(50) NOT NULL,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id),
    fecha TIMESTAMP NOT NULL,
    descripcion TEXT NOT NULL,
    entrada_raiz_id BIGINT REFERENCES entrada_expediente(id),
    nivel_importancia VARCHAR(20),
    dirigido_a_usuario_id BIGINT REFERENCES usuario(id),
    severidad VARCHAR(20),
    resultado TEXT
);

CREATE INDEX idx_entrada_expediente_expediente_fecha
    ON entrada_expediente (expediente_id, fecha DESC);

CREATE INDEX idx_entrada_expediente_raiz
    ON entrada_expediente (entrada_raiz_id)
    WHERE entrada_raiz_id IS NOT NULL;
