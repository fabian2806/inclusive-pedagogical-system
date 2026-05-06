-- Fase 2c: vincular entradas de bitácora con un indicador (cuando son evaluaciones)
-- y añadir el booleano que indica si el indicador se logró.
-- Ambas columnas son NULL para entradas que no son de tipo EVALUACION_INDICADOR.
ALTER TABLE entrada_expediente
    ADD COLUMN indicador_id BIGINT REFERENCES indicador(id),
    ADD COLUMN resultado_logrado BOOLEAN;

CREATE INDEX idx_entrada_expediente_indicador
    ON entrada_expediente (indicador_id)
    WHERE indicador_id IS NOT NULL;
