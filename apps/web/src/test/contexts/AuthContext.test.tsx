import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'
import { renderWithProviders } from '../helpers/renderWithProviders'
import type { User } from '@/types/auth'

function Sonda() {
  const { hasPermission, hasAnyPermission } = useAuth()
  return (
    <div>
      <p>alumno_leer: {String(hasPermission('ALUMNO_LEER'))}</p>
      <p>usuario_crear: {String(hasPermission('USUARIO_CREAR'))}</p>
      <p>cualquiera: {String(hasAnyPermission('USUARIO_CREAR', 'ALUMNO_LEER'))}</p>
      <p>ninguno: {String(hasAnyPermission('FOO', 'BAR'))}</p>
    </div>
  )
}

const docente: User = {
  id: 2,
  nombre: 'María',
  apellido: 'Torres',
  correo: 'maria@signaedu.pe',
  telefono: null,
  rol: 'docente',
  authorities: ['ALUMNO_LEER', 'BITACORA_ESCRIBIR'],
}

describe('AuthContext helpers de permisos', () => {
  it('hasPermission devuelve true si el usuario tiene el permiso', () => {
    renderWithProviders(<Sonda />, { user: docente })
    expect(screen.getByText('alumno_leer: true')).toBeInTheDocument()
  })

  it('hasPermission devuelve false si el usuario NO tiene el permiso', () => {
    renderWithProviders(<Sonda />, { user: docente })
    expect(screen.getByText('usuario_crear: false')).toBeInTheDocument()
  })

  it('hasAnyPermission devuelve true si tiene al menos uno de los permisos pedidos', () => {
    renderWithProviders(<Sonda />, { user: docente })
    expect(screen.getByText('cualquiera: true')).toBeInTheDocument()
  })

  it('hasAnyPermission devuelve false si no tiene ninguno', () => {
    renderWithProviders(<Sonda />, { user: docente })
    expect(screen.getByText('ninguno: false')).toBeInTheDocument()
  })

  it('hasPermission devuelve false cuando no hay usuario autenticado', () => {
    renderWithProviders(<Sonda />)
    expect(screen.getByText('alumno_leer: false')).toBeInTheDocument()
    expect(screen.getByText('cualquiera: false')).toBeInTheDocument()
  })
})
