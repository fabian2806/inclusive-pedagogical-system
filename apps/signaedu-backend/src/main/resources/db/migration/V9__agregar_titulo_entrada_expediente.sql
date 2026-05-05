-- Agrega título opcional a las entradas de la bitácora.
-- Las entradas existentes quedan con título NULL (no se requiere migrar datos previos).
ALTER TABLE entrada_expediente
    ADD COLUMN titulo VARCHAR(150);
