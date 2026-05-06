-- Tabla de indicadores pedagógicos (Fase 2c).
-- El docente que crea el indicador queda como "creador" (ownership):
-- editar/desactivar solo lo puede hacer el creador. Lectura para docente/padre/saanee.
CREATE TABLE indicador (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50),
    area_curricular VARCHAR(30) NOT NULL,
    usuario_creador_id BIGINT NOT NULL REFERENCES usuario(id),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_indicador_area_curricular
    ON indicador (area_curricular);

CREATE INDEX idx_indicador_creador
    ON indicador (usuario_creador_id);

CREATE INDEX idx_indicador_activo
    ON indicador (activo)
    WHERE activo = TRUE;
