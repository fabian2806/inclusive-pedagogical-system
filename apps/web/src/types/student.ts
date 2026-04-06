import type { EstadoAlumno, UsuarioSimpleResponse } from './api'

export interface Student {
  id: number
  nombre: string
  apellido: string
  fechaNacimiento: string
  grado: string
  seccion: string
  estado: EstadoAlumno
  docentes: UsuarioSimpleResponse[]
  padres: UsuarioSimpleResponse[]
}

export interface StudentFormData {
  nombre: string
  apellido: string
  fechaNacimiento: string
  grado: string
  seccion: string
  docenteId: string
  padreId: string
}