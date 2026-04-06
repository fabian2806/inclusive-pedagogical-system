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
}

export function renderWithProviders(ui: ReactNode, options: RenderOptions = {}) {
  const {
    user = null,
    isAuthenticated = !!user,
    isLoading = false,
    route = '/',
    login = async () => {},
    logout = () => {},
  } = options

  const authValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </AuthContext.Provider>
  )
}
