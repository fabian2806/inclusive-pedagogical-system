import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '@/contexts/AuthContext'
import type { AuthContextType, User } from '@/types/auth'
import type { ReactNode } from 'react'

interface RenderOptions {
  user?: User | null
  isAuthenticated?: boolean
  isLoading?: boolean
  route?: string
  login?: AuthContextType['login']
  logout?: AuthContextType['logout']
  hasPermission?: AuthContextType['hasPermission']
  hasAnyPermission?: AuthContextType['hasAnyPermission']
}

export function renderWithProviders(ui: ReactNode, options: RenderOptions = {}) {
  const {
    user = null,
    isAuthenticated = !!user,
    isLoading = false,
    route = '/',
    login = async () => {},
    logout = () => {},
    hasPermission = (p) => user?.authorities?.includes(p) ?? false,
    hasAnyPermission = (...ps) => ps.some((p) => user?.authorities?.includes(p) ?? false),
  } = options

  const authValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
  }

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </AuthContext.Provider>
  )
}
