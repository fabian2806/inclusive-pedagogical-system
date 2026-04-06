import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { renderWithProviders } from '../helpers/renderWithProviders'

const mockUser = {
  id: 1, nombre: 'Admin', apellido: 'Test',
  correo: 'admin@test.com', telefono: null, rol: 'admin' as const,
}

function TestApp() {
  return (
    <Routes>
      <Route path="/login" element={<p>Página de login</p>} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <p>Contenido protegido</p>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

describe('ProtectedRoute', () => {
  it('redirige a /login si el usuario no está autenticado', () => {
    renderWithProviders(<TestApp />, { route: '/dashboard' })

    expect(screen.getByText('Página de login')).toBeInTheDocument()
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('renderiza children si el usuario está autenticado', () => {
    renderWithProviders(<TestApp />, { user: mockUser, route: '/dashboard' })

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
    expect(screen.queryByText('Página de login')).not.toBeInTheDocument()
  })
})
