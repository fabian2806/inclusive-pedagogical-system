import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { type User, type UserRole, type AuthContextType } from '@/types/auth'
import { authService } from '@/lib/api'
import type { UsuarioResponse } from '@/types/api'
import { AxiosError } from 'axios'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mapea el UsuarioResponse del backend al User del frontend
function mapUsuarioToUser(usuario: UsuarioResponse): User {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    correo: usuario.correo,
    telefono: usuario.telefono,
    rol: usuario.roles[0].toLowerCase() as UserRole,
    authorities: usuario.authorities ?? [],
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Al montar, verificar si hay un token válido en localStorage
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setIsLoading(false)
      return
    }

    authService.getMe()
      .then((usuario) => {
        setUser(mapUsuarioToUser(usuario))
      })
      .catch(() => {
        localStorage.removeItem('accessToken')
        setUser(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const login = useCallback(async (correo: string, password: string) => {
    try {
      const { accessToken } = await authService.login({ correo, password })
      localStorage.setItem('accessToken', accessToken)

      const usuario = await authService.getMe()
      setUser(mapUsuarioToUser(usuario))
    } catch (err) {
      localStorage.removeItem('accessToken')
      if (err instanceof AxiosError) {
        throw new Error(err.response?.data?.mensaje ?? 'Error al iniciar sesión')
      }
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('accessToken')
  }, [])

  const hasPermission = useCallback(
    (permission: string) => user?.authorities.includes(permission) ?? false,
    [user],
  )

  const hasAnyPermission = useCallback(
    (...permissions: string[]) =>
      permissions.some((p) => user?.authorities.includes(p) ?? false),
    [user],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
