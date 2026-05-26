// ============================================================
// Tipos alineados a los DTOs del backend Spring Boot
// Fuente de verdad: signaedu-backend/dto/request y dto/response
// ============================================================

// --- Enums compartidos ---

export type TipoRol = 'ADMIN' | 'DOCENTE' | 'PADRE' | 'SAANEE'
export type EstadoUsuario = 'ACTIVO' | 'INACTIVO'
export type EstadoAlumno = 'ACTIVO' | 'INACTIVO'

// --- Response DTOs ---

export interface LoginResponse {
  accessToken: string
  authorities: string[]
}

export interface UsuarioResponse {
  id: number
  nombre: string
  apellido: string
  correo: string
  telefono: string | null
  estado: EstadoUsuario
  roles: TipoRol[]
  authorities: string[]
}

export interface UsuarioSimpleResponse {
  id: number
  nombre: string
  apellido: string
  correo: string
  telefono: string | null
}

export interface AlumnoResponse {
  id: number
  nombre: string
  apellido: string
  idFotoPerfil: number | null
  fechaNacimiento: string
  grado: string
  seccion: string
  estado: EstadoAlumno
  docentes: UsuarioSimpleResponse[]
  padres: UsuarioSimpleResponse[]
}

export interface TipoDocumentoResponse {
  id: number
  nombre: string
  esObligatorio: boolean
  esVersionable: boolean
  esPeriodico: boolean
  periodicidad: string | null
  esPredefinido: boolean
}

export interface ErrorResponse {
  status: number
  mensaje: string
  timestamp: string
  errores?: Record<string, string>
}

// --- Request DTOs ---

export interface LoginRequest {
  correo: string
  password: string
}

export interface UsuarioCreateRequest {
  nombre: string
  apellido: string
  correo: string
  telefono?: string
  password: string
  rol: TipoRol
}

export interface UsuarioUpdateRequest {
  nombre: string
  apellido: string
  correo: string
  telefono?: string
  password?: string
  rol?: TipoRol
}

export interface AlumnoCreateRequest {
  nombre: string
  apellido: string
  fechaNacimiento: string
  grado: string
  seccion: string
}

export interface AlumnoUpdateRequest {
  nombre: string
  apellido: string
  fechaNacimiento: string
  grado: string
  seccion: string
}

export interface TipoDocumentoCreateRequest {
  nombre: string
  esObligatorio: boolean
  esVersionable: boolean
  esPeriodico: boolean
  periodicidad?: string
}

export interface TipoDocumentoUpdateRequest {
  nombre: string
  esObligatorio: boolean
  esVersionable: boolean
  esPeriodico: boolean
  periodicidad?: string
}

// --- Perfil Discapacidad Auditiva ---

export interface PerfilDiscapacidadResponse {
  id: number
  alumnoId: number
  modoComunicacionPreferido: string | null
  observacionesGenerales: string | null
  barreras: BarreraResponse[]
  fortalezas: FortalezaResponse[]
  apoyos: ApoyoResponse[]
}

export interface BarreraResponse {
  id: number
  tipo: string
  descripcion: string
}

export interface FortalezaResponse {
  id: number
  dimension: string
  descripcion: string
}

export interface ApoyoResponse {
  id: number
  intensidad: string
  funcion: string
  descripcion: string
  fuente: string
}

export interface PerfilDiscapacidadRequest {
  modoComunicacionPreferido?: string
  observacionesGenerales?: string
  barreras: BarreraRequest[]
  fortalezas: FortalezaRequest[]
  apoyos: ApoyoRequest[]
}

export interface BarreraRequest {
  tipo: string
  descripcion: string
}

export interface FortalezaRequest {
  dimension: string
  descripcion: string
}

export interface ApoyoRequest {
  intensidad: string
  funcion: string
  descripcion: string
  fuente: string
}

// --- Bitácora / Entrada Expediente ---

export type TipoEntrada =
  | 'OBSERVACION_PEDAGOGICA'
  | 'COMUNICACION_FAMILIAR'
  | 'INCIDENCIA_COMUNICACION'
  | 'APOYO_O_AJUSTE'
  | 'EVALUACION_INDICADOR'
  | 'EVENTO_AGENDA'
  | 'DOCUMENTO_ADJUNTADO'
  | 'FEEDBACK_SAANEE'

export interface UsuarioBitacoraResponse {
  id: number
  nombre: string
  apellido: string
  rol: TipoRol
}

export interface EntradaExpedienteRequest {
  tipo: TipoEntrada
  titulo?: string | null
  descripcion: string
  entradaRaizId?: number | null
  nivelImportancia?: string | null
  dirigidoAUsuarioId?: number | null
  severidad?: string | null
  resultado?: string | null
  indicadorId?: number | null
  resultadoLogrado?: boolean | null
}

export interface EntradaExpedienteResponse {
  id: number
  expedienteId: number
  tipo: TipoEntrada
  autor: UsuarioBitacoraResponse
  fecha: string
  titulo: string | null
  descripcion: string
  entradaRaizId: number | null
  nivelImportancia: string | null
  dirigidoA: UsuarioBitacoraResponse | null
  severidad: string | null
  resultado: string | null
  indicador: IndicadorBitacoraResponse | null
  resultadoLogrado: boolean | null
}

export interface BitacoraListarFiltros {
  tipo?: TipoEntrada
  desde?: string
  hasta?: string
}

// --- Indicadores (Fase 2c) ---

export type AreaCurricular =
  | 'COMUNICACION'
  | 'MATEMATICA'
  | 'ED_FISICA'
  | 'PERSONAL_SOCIAL'
  | 'OTRO'

export interface IndicadorResponse {
  id: number
  nombre: string
  descripcion: string | null
  categoria: string | null
  areaCurricular: AreaCurricular
  usuarioCreador: UsuarioSimpleResponse
  activo: boolean
}

export interface IndicadorBitacoraResponse {
  id: number
  nombre: string
  descripcion: string | null
  areaCurricular: AreaCurricular
  categoria: string | null
}

export interface IndicadorCreateRequest {
  nombre: string
  descripcion?: string | null
  categoria?: string | null
  areaCurricular: AreaCurricular
}

export interface IndicadorUpdateRequest {
  nombre: string
  descripcion?: string | null
  categoria?: string | null
  areaCurricular: AreaCurricular
}

export interface IndicadoresListarFiltros {
  areaCurricular?: AreaCurricular
  q?: string
  activo?: boolean
}

// --- Documentos del expediente (Fase 2d) ---

export type EstadoDocumento = 'VIGENTE' | 'ARCHIVADO'

export interface ArchivoAdjuntoResponse {
  id: number
  nombreOriginal: string
  mimeType: string
  tamano: number
}

export interface DocumentoExpedienteResponse {
  id: number
  tipoDocumento: TipoDocumentoResponse
  titulo: string
  periodo: string | null
  version: number | null
  estado: EstadoDocumento
  fechaEmision: string  // LocalDate ISO yyyy-mm-dd
  fechaSubida: string   // LocalDateTime ISO yyyy-mm-ddThh:mm:ss
  usuarioSubido: UsuarioSimpleResponse
  archivo: ArchivoAdjuntoResponse
  entradaExpedienteId: number
}

export interface DocumentoExpedienteCreateRequest {
  tipoDocumentoId: number
  titulo: string
  periodo?: string | null
  fechaEmision: string  // yyyy-mm-dd
}

// Adjuntos casuales a entradas de bitácora (no son documentos formales).
export interface EntradaArchivoResponse {
  id: number
  entradaId: number
  archivo: ArchivoAdjuntoResponse
  descripcion: string | null
  usuarioSubido: UsuarioSimpleResponse
  fechaSubida: string
}

export interface EntradaArchivoCreateRequest {
  descripcion?: string | null
}

// --- Configuración / Periodo Lectivo ---

export interface ConfiguracionPeriodoResponse {
  periodoLectivoVigente: string
  periodoAbierto: boolean
  expedientesActivos: number
}

export interface PeriodoLectivoRequest {
  periodoLectivo: string
}

export interface AperturaPeriodoResponse {
  periodoLectivo: string
  expedientesCreados: number
}

export interface CierrePeriodoResponse {
  periodoLectivo: string
  expedientesCerrados: number
}
