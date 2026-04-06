import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '@/lib/api/client'
import { usuariosService } from '@/lib/api/usuariosService'

vi.mock('@/lib/api/client')

const mockedClient = vi.mocked(apiClient)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('usuariosService', () => {
  it('crear envía POST con datos del usuario', async () => {
    const nuevoUsuario = {
      nombre: 'Juan', apellido: 'Pérez', correo: 'juan@test.com',
      password: 'pass123', rol: 'DOCENTE' as const,
    }
    mockedClient.post.mockResolvedValue({ data: { id: 1, ...nuevoUsuario, estado: 'ACTIVO', roles: ['DOCENTE'] } })

    const result = await usuariosService.crear(nuevoUsuario)

    expect(mockedClient.post).toHaveBeenCalledWith('/admin/usuarios', nuevoUsuario)
    expect(result.id).toBe(1)
  })

  it('listar sin filtro llama GET sin params', async () => {
    mockedClient.get.mockResolvedValue({ data: [] })

    await usuariosService.listar()

    expect(mockedClient.get).toHaveBeenCalledWith('/admin/usuarios', { params: undefined })
  })

  it('listar con filtro de rol envía el param', async () => {
    mockedClient.get.mockResolvedValue({ data: [] })

    await usuariosService.listar('DOCENTE')

    expect(mockedClient.get).toHaveBeenCalledWith('/admin/usuarios', { params: { rol: 'DOCENTE' } })
  })

  it('desactivar envía PATCH al endpoint correcto', async () => {
    mockedClient.patch.mockResolvedValue({})

    await usuariosService.desactivar(5)

    expect(mockedClient.patch).toHaveBeenCalledWith('/admin/usuarios/5/desactivar')
  })
})
