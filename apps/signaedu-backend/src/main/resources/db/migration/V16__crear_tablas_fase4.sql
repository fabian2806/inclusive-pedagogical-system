-- ============================================================
-- V16: Fase 4 - Coordinacion e Interoperabilidad
--
-- Crea las tablas del modulo de eventos y notificaciones,
-- agrega evento_id a entrada_expediente para vincular el
-- resultado del evento, y registra el permiso EVENTO_ACTUALIZAR
-- (solo DOCENTE).
-- ============================================================

-- 1. Eventos individuales por alumno
CREATE TABLE evento (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion VARCHAR(1000),
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    tipo_evento VARCHAR(40) NOT NULL,
    modalidad VARCHAR(20) NOT NULL,
    ubicacion VARCHAR(500),
    estado VARCHAR(20) NOT NULL,
    motivo_cancelacion VARCHAR(500),
    alumno_id BIGINT NOT NULL REFERENCES alumno(id),
    usuario_creador_id BIGINT NOT NULL REFERENCES usuario(id),
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_actualizacion TIMESTAMP
);

CREATE INDEX idx_evento_alumno ON evento (alumno_id);
CREATE INDEX idx_evento_creador ON evento (usuario_creador_id);
CREATE INDEX idx_evento_fecha_inicio ON evento (fecha_inicio);
CREATE INDEX idx_evento_estado ON evento (estado);

-- 2. Invitados al evento (asistentes) con respuesta de asistencia
CREATE TABLE evento_usuario (
    id BIGSERIAL PRIMARY KEY,
    evento_id BIGINT NOT NULL REFERENCES evento(id),
    usuario_id BIGINT NOT NULL REFERENCES usuario(id),
    estado_asistencia VARCHAR(20) NOT NULL,
    fecha_respuesta TIMESTAMP,
    motivo_rechazo VARCHAR(500),
    CONSTRAINT uq_evento_usuario UNIQUE (evento_id, usuario_id)
);

CREATE INDEX idx_evento_usuario_usuario ON evento_usuario (usuario_id);

-- 3. Archivos adjuntos pre-evento (agenda, materiales). Sin UI en Fase 4.
CREATE TABLE evento_archivo (
    id BIGSERIAL PRIMARY KEY,
    evento_id BIGINT NOT NULL REFERENCES evento(id),
    archivo_id BIGINT NOT NULL REFERENCES archivo_adjunto(id),
    tipo VARCHAR(50),
    descripcion VARCHAR(500),
    id_usuario_subido BIGINT NOT NULL REFERENCES usuario(id),
    CONSTRAINT uq_evento_archivo UNIQUE (evento_id, archivo_id)
);

CREATE INDEX idx_evento_archivo_evento ON evento_archivo (evento_id);

-- 4. Notificaciones. La creacion se hace automaticamente desde los
--    servicios que disparan acciones notificables (4c).
CREATE TABLE notificacion (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id),
    mensaje VARCHAR(500) NOT NULL,
    referencia_tipo VARCHAR(20) NOT NULL,
    referencia_id BIGINT,
    id_usuario_creador BIGINT REFERENCES usuario(id),
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_lectura TIMESTAMP
);

CREATE INDEX idx_notificacion_usuario_lectura ON notificacion (usuario_id, fecha_lectura);

-- 5. Vincular la entrada de bitacora "EVENTO_AGENDA" con su evento de origen
--    (columna prevista en el DER desde Fase 2b, se materializa ahora).
ALTER TABLE entrada_expediente
    ADD COLUMN evento_id BIGINT REFERENCES evento(id);

CREATE INDEX idx_entrada_expediente_evento
    ON entrada_expediente (evento_id)
    WHERE evento_id IS NOT NULL;

-- 6. Permiso nuevo: EVENTO_ACTUALIZAR (decision de Fase 4, solo DOCENTE).
INSERT INTO permiso (nombre, descripcion)
    VALUES ('EVENTO_ACTUALIZAR', 'Editar campos editables de un evento existente');

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id
FROM rol r, permiso p
WHERE r.nombre = 'DOCENTE'
  AND p.nombre = 'EVENTO_ACTUALIZAR';
