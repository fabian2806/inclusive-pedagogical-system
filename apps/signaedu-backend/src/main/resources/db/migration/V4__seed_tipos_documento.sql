-- Tipos de documento predefinidos del sistema
INSERT INTO tipo_documento (nombre, es_obligatorio, es_versionable, es_periodico, periodicidad, es_predefinido)
VALUES
    ('PEP', TRUE, TRUE, TRUE, 'ANUAL', TRUE),
    ('IPP', TRUE, TRUE, FALSE, NULL, TRUE),
    ('IB', TRUE, FALSE, FALSE, NULL, TRUE),
    ('IS', TRUE, TRUE, TRUE, 'SEMESTRAL', TRUE),
    ('OTRO', FALSE, FALSE, FALSE, NULL, TRUE);
