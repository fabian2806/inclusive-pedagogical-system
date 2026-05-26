import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { renderWithProviders } from '../helpers/renderWithProviders'
import type { User } from '@/types/auth'

const adminSinPermisos: User = {
  id: 1, nombre: 'Admin', apellido: 'Test',
  correo: 'admin@test.com', telefono: null, rol: 'admin',
  authorities: [],
}

const docente: User = {
  id: 2, nombre: 'María', apellido: 'Torres',
  correo: 'maria@signaedu.pe', telefono: null, rol: 'docente',
  authorities: ['ALUMNO_LEER', 'BITACORA_ESCRIBIR'],
}

function TestApp({
  allowedRoles,
  requiredPermissions,
}: {
  allowedRoles?: User['rol'][]
  requiredPermissions?: string[]
}) {
  return (
    <Routes>
      <Route path="/login" element={<p>Página de login</p>} />
      <Route path="/dashboard" element={<p>Dashboard home</p>} />
      <Route
        path="/dashboard/area"
        element={
          <ProtectedRoute allowedRoles={allowedRoles} requiredPermissions={requiredPermissions}>
            <p>Contenido protegido</p>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

describe('ProtectedRoute', () => {
  it('redirige a /login si el usuario no está autenticado', () => {
    renderWithProviders(<TestApp />, { route: '/dashboard/area' })

    expect(screen.getByText('Página de login')).toBeInTheDocument()
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('renderiza children si el usuario está autenticado y no se exigen restricciones', () => {
    renderWithProviders(<TestApp />, { user: adminSinPermisos, route: '/dashboard/area' })

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
    expect(screen.queryByText('Página de login')).not.toBeInTheDocument()
  })

  it('redirige a /dashboard si el rol no está en allowedRoles', () => {
    renderWithProviders(
      <TestApp allowedRoles={['admin']} />,
      { user: docente, route: '/dashboard/area' },
    )

    expect(screen.getByText('Dashboard home')).toBeInTheDocument()
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('renderiza children si el rol está en allowedRoles', () => {
    renderWithProviders(
      <TestApp allowedRoles={['docente']} />,
      { user: docente, route: '/dashboard/area' },
    )

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })

  it('renderiza children si el usuario tiene TODOS los requiredPermissions', () => {
    renderWithProviders(
      <TestApp requiredPermissions={['ALUMNO_LEER', 'BITACORA_ESCRIBIR']} />,
      { user: docente, route: '/dashboard/area' },
    )

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })

  it('redirige a /dashboard si falta alguno de los requiredPermissions', () => {
    renderWithProviders(
      <TestApp requiredPermissions={['ALUMNO_LEER', 'USUARIO_CREAR']} />,
      { user: docente, route: '/dashboard/area' },
    )

    expect(screen.getByText('Dashboard home')).toBeInTheDocument()
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('redirige a /dashboard si el usuario no tiene authorities y se exigen permisos', () => {
    renderWithProviders(
      <TestApp requiredPermissions={['ALUMNO_LEER']} />,
      { user: adminSinPermisos, route: '/dashboard/area' },
    )

    expect(screen.getByText('Dashboard home')).toBeInTheDocument()
  })
})
