-- =============================================
-- V15: Ajuste de tipos documentales para Fase 2d
-- =============================================
-- Corrige inconsistencias del seed V4 detectadas durante el desarrollo de
-- Fase 2d:
--   * PEP: ANUAL -> no periódico (el año queda implícito en el expediente).
--   * IPP: sin cambios (ya era no periódico, versionable).
--   * IB:  no periódico/no versionable -> bimestral, versionable.
--   * IS:  Informe de Salida -> no periódico (antes seedeado SEMESTRAL).
--   * OTRO: sin cambios.
--
-- Adicionalmente normaliza documentos legacy y resuelve duplicados que
-- pueden aparecer cuando un tipo deja de ser periódico (todos sus
-- documentos colapsan a la misma tupla (expediente, tipo, NULL)).

-- 1. Corregir definicion de tipos documentales.
UPDATE tipo_documento
SET es_obligatorio = TRUE,
    es_versionable = TRUE,
    es_periodico = FALSE,
    periodicidad = NULL
WHERE nombre = 'PEP';

UPDATE tipo_documento
SET es_obligatorio = TRUE,
    es_versionable = TRUE,
    es_periodico = FALSE,
    periodicidad = NULL
WHERE nombre = 'IPP';

UPDATE tipo_documento
SET es_obligatorio = TRUE,
    es_versionable = TRUE,
    es_periodico = TRUE,
    periodicidad = 'BIMESTRAL'
WHERE nombre = 'IB';

UPDATE tipo_documento
SET es_obligatorio = TRUE,
    es_versionable = TRUE,
    es_periodico = FALSE,
    periodicidad = NULL
WHERE nombre = 'IS';

UPDATE tipo_documento
SET es_obligatorio = FALSE,
    es_versionable = FALSE,
    es_periodico = FALSE,
    periodicidad = NULL
WHERE nombre = 'OTRO';

-- 2. Normalizar documentos ya creados para tipos no periodicos.
-- Si PEP/IPP/IS/OTRO dejan de ser periódicos, sus documentos no deben
-- tener periodo.
UPDATE documento_expediente d
SET periodo = NULL
FROM tipo_documento t
WHERE d.tipo_documento_id = t.id
  AND t.nombre IN ('PEP', 'IPP', 'IS', 'OTRO');

-- 3. Evitar duplicados VIGENTE despues de normalizar periodo.
-- Mantiene vigente el documento mas reciente por (expediente, tipo, periodo).
-- No aplica a OTRO, porque OTRO permite múltiples vigentes simultaneos.
WITH ranked AS (
    SELECT
        d.id,
        ROW_NUMBER() OVER (
            PARTITION BY ee.expediente_id, d.tipo_documento_id, d.periodo
            ORDER BY d.fecha_subida DESC, d.id DESC
        ) AS rn
    FROM documento_expediente d
    JOIN entrada_expediente ee ON ee.id = d.entrada_expediente_id
    JOIN tipo_documento td ON td.id = d.tipo_documento_id
    WHERE d.estado = 'VIGENTE'
      AND td.nombre <> 'OTRO'
)
UPDATE documento_expediente d
SET estado = 'ARCHIVADO'
FROM ranked r
WHERE d.id = r.id
  AND r.rn > 1;
