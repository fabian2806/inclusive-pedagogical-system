import type { TipoRol, EstadoUsuario } from './api'

export interface User {
  id: number
  nombre: string
  apellido: string
  correo: string
  telefono: string | null
  estado: EstadoUsuario
  roles: TipoRol[]
}

export interface UserFormData {
  nombre: string
  apellido: string
  correo: string
  telefono: string
  password: string
  rol: TipoRol
}