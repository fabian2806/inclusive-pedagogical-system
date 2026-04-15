-- =============================================
-- V5: Seed de permisos RBAC y asociaciones rol_permiso
-- Catálogo completo: 30 permisos, 4 roles
-- =============================================

-- Módulo Admin (Fase 1)
INSERT INTO permiso (nombre, descripcion) VALUES ('USUARIO_CREAR', 'Crear usuarios');
INSERT INTO permiso (nombre, descripcion) VALUES ('USUARIO_LEER', 'Listar y ver usuarios');
INSERT INTO permiso (nombre, descripcion) VALUES ('USUARIO_ACTUALIZAR', 'Editar usuarios');
INSERT INTO permiso (nombre, descripcion) VALUES ('USUARIO_DESACTIVAR', 'Desactivar usuarios');
INSERT INTO permiso (nombre, descripcion) VALUES ('ALUMNO_CREAR', 'Crear alumnos');
INSERT INTO permiso (nombre, descripcion) VALUES ('ALUMNO_LEER', 'Ver alumnos');
INSERT INTO permiso (nombre, descripcion) VALUES ('ALUMNO_ACTUALIZAR', 'Editar datos generales del alumno');
INSERT INTO permiso (nombre, descripcion) VALUES ('ALUMNO_DESACTIVAR', 'Desactivar alumnos');
INSERT INTO permiso (nombre, descripcion) VALUES ('TIPO_DOCUMENTO_GESTIONAR', 'CRUD de tipos de documento');

-- Módulo Expediente — Fase 2a (Perfil discapacidad)
INSERT INTO permiso (nombre, descripcion) VALUES ('PERFIL_DISCAPACIDAD_ESCRIBIR', 'Crear y editar perfil auditivo, barreras, fortalezas, apoyos');
INSERT INTO permiso (nombre, descripcion) VALUES ('PERFIL_DISCAPACIDAD_LEER', 'Consultar perfil de discapacidad');

-- Módulo Expediente — Fase 2b (Bitácora / EntradaExpediente)
INSERT INTO permiso (nombre, descripcion) VALUES ('EXPEDIENTE_CREAR', 'Crear expediente');
INSERT INTO permiso (nombre, descripcion) VALUES ('EXPEDIENTE_LEER', 'Consultar expediente');
INSERT INTO permiso (nombre, descripcion) VALUES ('EXPEDIENTE_ACTUALIZAR', 'Cerrar expediente');
INSERT INTO permiso (nombre, descripcion) VALUES ('BITACORA_ESCRIBIR', 'Crear entradas en el expediente');
INSERT INTO permiso (nombre, descripcion) VALUES ('BITACORA_LEER', 'Consultar entradas de la bitácora');

-- Módulo Expediente — Fase 2c (Indicadores)
INSERT INTO permiso (nombre, descripcion) VALUES ('INDICADOR_GESTIONAR', 'Crear, editar, desactivar indicadores');
INSERT INTO permiso (nombre, descripcion) VALUES ('INDICADOR_LEER', 'Consultar indicadores y su estado');

-- Módulo Expediente — Fase 2d (Documentos del expediente)
INSERT INTO permiso (nombre, descripcion) VALUES ('DOCUMENTO_EXPEDIENTE_ESCRIBIR', 'Subir y actualizar documentos del expediente');
INSERT INTO permiso (nombre, descripcion) VALUES ('DOCUMENTO_EXPEDIENTE_LEER', 'Consultar y descargar documentos del expediente');
INSERT INTO permiso (nombre, descripcion) VALUES ('EXPEDIENTE_EXPORTAR', 'Exportar expediente y documentos');

-- Módulo Coordinación (Fase 3)
INSERT INTO permiso (nombre, descripcion) VALUES ('EVENTO_CREAR', 'Crear eventos');
INSERT INTO permiso (nombre, descripcion) VALUES ('EVENTO_LEER', 'Ver eventos y calendario');
INSERT INTO permiso (nombre, descripcion) VALUES ('EVENTO_CANCELAR', 'Cancelar eventos');
INSERT INTO permiso (nombre, descripcion) VALUES ('EVENTO_RESPONDER', 'Confirmar o rechazar asistencia a eventos');
INSERT INTO permiso (nombre, descripcion) VALUES ('EVENTO_RESULTADO_ESCRIBIR', 'Registrar resultados y adjuntar documentos a eventos');
INSERT INTO permiso (nombre, descripcion) VALUES ('EVENTO_RESULTADO_LEER', 'Consultar resultados y descargar documentos de eventos');
INSERT INTO permiso (nombre, descripcion) VALUES ('NOTIFICACION_LEER', 'Ver notificaciones propias');
INSERT INTO permiso (nombre, descripcion) VALUES ('CONTACTO_LEER', 'Ver información de contacto de actores');

-- Módulo General
INSERT INTO permiso (nombre, descripcion) VALUES ('PASSWORD_CAMBIAR', 'Cambiar contraseña propia');

-- =============================================
-- Asociaciones rol_permiso
-- =============================================

-- ADMIN: permisos admin + expediente (crear/actualizar) + evento (crear/leer) + general
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM rol r, permiso p
WHERE r.nombre = 'ADMIN' AND p.nombre IN (
    'USUARIO_CREAR', 'USUARIO_LEER', 'USUARIO_ACTUALIZAR', 'USUARIO_DESACTIVAR',
    'ALUMNO_CREAR', 'ALUMNO_LEER', 'ALUMNO_ACTUALIZAR', 'ALUMNO_DESACTIVAR',
    'TIPO_DOCUMENTO_GESTIONAR',
    'EXPEDIENTE_CREAR', 'EXPEDIENTE_ACTUALIZAR',
    'EVENTO_CREAR', 'EVENTO_LEER',
    'PASSWORD_CAMBIAR'
);

-- DOCENTE: alumno leer + perfil + expediente leer + bitácora + indicadores + documentos + exportar + eventos + notificaciones + contacto + general
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM rol r, permiso p
WHERE r.nombre = 'DOCENTE' AND p.nombre IN (
    'ALUMNO_LEER',
    'PERFIL_DISCAPACIDAD_ESCRIBIR', 'PERFIL_DISCAPACIDAD_LEER',
    'EXPEDIENTE_LEER',
    'BITACORA_ESCRIBIR', 'BITACORA_LEER',
    'INDICADOR_GESTIONAR', 'INDICADOR_LEER',
    'DOCUMENTO_EXPEDIENTE_ESCRIBIR', 'DOCUMENTO_EXPEDIENTE_LEER',
    'EXPEDIENTE_EXPORTAR',
    'EVENTO_CREAR', 'EVENTO_LEER', 'EVENTO_CANCELAR',
    'EVENTO_RESULTADO_ESCRIBIR', 'EVENTO_RESULTADO_LEER',
    'NOTIFICACION_LEER', 'CONTACTO_LEER',
    'PASSWORD_CAMBIAR'
);

-- PADRE: alumno leer + perfil leer + expediente leer + bitácora + indicador leer + documento leer + exportar + eventos (leer/responder) + resultados leer + notificaciones + contacto + general
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM rol r, permiso p
WHERE r.nombre = 'PADRE' AND p.nombre IN (
    'ALUMNO_LEER',
    'PERFIL_DISCAPACIDAD_LEER',
    'EXPEDIENTE_LEER',
    'BITACORA_ESCRIBIR', 'BITACORA_LEER',
    'INDICADOR_LEER',
    'DOCUMENTO_EXPEDIENTE_LEER',
    'EXPEDIENTE_EXPORTAR',
    'EVENTO_LEER', 'EVENTO_RESPONDER',
    'EVENTO_RESULTADO_LEER',
    'NOTIFICACION_LEER', 'CONTACTO_LEER',
    'PASSWORD_CAMBIAR'
);

-- SAANEE: alumno leer + perfil leer + expediente leer + bitácora + indicador leer + documento leer + eventos (leer/responder) + resultados leer + notificaciones + contacto + general
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM rol r, permiso p
WHERE r.nombre = 'SAANEE' AND p.nombre IN (
    'ALUMNO_LEER',
    'PERFIL_DISCAPACIDAD_LEER',
    'EXPEDIENTE_LEER',
    'BITACORA_ESCRIBIR', 'BITACORA_LEER',
    'INDICADOR_LEER',
    'DOCUMENTO_EXPEDIENTE_LEER',
    'EVENTO_LEER', 'EVENTO_RESPONDER',
    'EVENTO_RESULTADO_LEER',
    'NOTIFICACION_LEER', 'CONTACTO_LEER',
    'PASSWORD_CAMBIAR'
);
