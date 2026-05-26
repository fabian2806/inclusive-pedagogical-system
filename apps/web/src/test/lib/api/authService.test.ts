import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '@/lib/api/client'
import { authService } from '@/lib/api/authService'

vi.mock('@/lib/api/client')

const mockedClient = vi.mocked(apiClient)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('authService', () => {
  it('login envía correo y password, retorna accessToken y authorities', async () => {
    mockedClient.post.mockResolvedValue({
      data: { accessToken: 'jwt-token-123', authorities: ['USUARIO_LEER'] },
    })

    const result = await authService.login({ correo: 'admin@test.com', password: 'pass123' })

    expect(mockedClient.post).toHaveBeenCalledWith('/auth/login', {
      correo: 'admin@test.com',
      password: 'pass123',
    })
    expect(result.accessToken).toBe('jwt-token-123')
    expect(result.authorities).toContain('USUARIO_LEER')
  })

  it('getMe retorna el usuario autenticado con sus authorities', async () => {
    const mockUsuario = {
      id: 1, nombre: 'Admin', apellido: 'Test',
      correo: 'admin@test.com', telefono: null,
      estado: 'ACTIVO', roles: ['ADMIN'],
      authorities: ['USUARIO_LEER', 'ALUMNO_LEER'],
    }
    mockedClient.get.mockResolvedValue({ data: mockUsuario })

    const result = await authService.getMe()

    expect(mockedClient.get).toHaveBeenCalledWith('/auth/me')
    expect(result.nombre).toBe('Admin')
    expect(result.roles).toContain('ADMIN')
    expect(result.authorities).toEqual(['USUARIO_LEER', 'ALUMNO_LEER'])
  })
})
