//src/contexts/AuthContext.tsx

import { createContext, useState, useCallback, type ReactNode } from 'react'
import { type User, type AuthContextType } from '@/types/auth'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users para desarrollo
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'docente@signaedu.pe': {
    password: 'docente123',
    user: {
      id: '1',
      email: 'docente@signaedu.pe',
      nombre: 'María Elena Castro',
      rol: 'docente',
      telefono: '999 000 000'
    }
  },
  'padre@signaedu.pe': {
    password: 'padre123',
    user: {
      id: '2',
      email: 'padre@signaedu.pe',
      nombre: 'Juan López',
      rol: 'padre',
      telefono: '999 000 000'
    }
  },
  'saanee@signaedu.pe': {
    password: 'saanee123',
    user: {
      id: '3',
      email: 'saanee@signaedu.pe',
      nombre: 'Carlos Rodríguez',
      rol: 'saanee',
      telefono: '999 000 000'
    }
  },
  'admin@signaedu.pe': {
    password: 'admin123',
    user: {
      id: '4',
      email: 'admin@signaedu.pe',
      nombre: 'Administrador',
      rol: 'admin',
      telefono: '999 000 000'
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (email: string, password: string) => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockUser = MOCK_USERS[email]
    if (!mockUser || mockUser.password !== password) {
      throw new Error('Credenciales inválidas')
    }

    setUser(mockUser.user)
    localStorage.setItem('user', JSON.stringify(mockUser.user))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('user')
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}