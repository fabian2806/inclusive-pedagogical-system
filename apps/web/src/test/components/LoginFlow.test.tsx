import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import Login from '@/pages/Login'
import { renderWithProviders } from '../helpers/renderWithProviders'

function LoginTestApp(_props: { login: (correo: string, password: string) => Promise<void> }) {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<p>Dashboard</p>} />
    </Routes>
  )
}

describe('Flujo de login', () => {
  it('login exitoso redirige a /dashboard', async () => {
    const user = userEvent.setup()
    const login = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(<LoginTestApp login={login} />, {
      route: '/login',
      login,
    })

    await user.type(screen.getByLabelText('Correo electrónico'), 'admin@test.com')
    await user.type(screen.getByLabelText('Contraseña'), 'pass123')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(login).toHaveBeenCalledWith('admin@test.com', 'pass123')
    expect(await screen.findByText('Dashboard')).toBeInTheDocument()
  })

  it('login fallido muestra mensaje de error', async () => {
    const user = userEvent.setup()
    const login = vi.fn().mockRejectedValue(new Error('Credenciales inválidas'))

    renderWithProviders(<LoginTestApp login={login} />, {
      route: '/login',
      login,
    })

    await user.type(screen.getByLabelText('Correo electrónico'), 'admin@test.com')
    await user.type(screen.getByLabelText('Contraseña'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument()
  })
})
