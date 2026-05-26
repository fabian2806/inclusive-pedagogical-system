export type UserRole = 'docente' | 'padre' | 'saanee' | 'admin'

export interface User {
  id: number
  nombre: string
  apellido: string
  correo: string
  telefono: string | null
  rol: UserRole
  authorities: string[]
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (correo: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (...permissions: string[]) => boolean
}
