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
}

export interface UsuarioResponse {
  id: number
  nombre: string
  apellido: string
  correo: string
  telefono: string | null
  estado: EstadoUsuario
  roles: TipoRol[]
}

export interface UsuarioSimpleResponse {
  id: number
  nombre: string
  apellido: string
  correo: string
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
