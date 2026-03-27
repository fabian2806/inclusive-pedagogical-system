export type UserRole = 'docente' | 'padre' | 'saanee' | 'admin'

export interface User {
  id: string
  email: string
  nombre: string
  rol: UserRole
  telefono?: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}