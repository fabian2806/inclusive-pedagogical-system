import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '@/lib/api/client'
import { contactosService } from '@/lib/api/contactosService'

vi.mock('@/lib/api/client')

const mockedClient = vi.mocked(apiClient)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('contactosService', () => {
  it('obtenerContactosDelAlumno consulta /alumnos/{id}/contactos', async () => {
    mockedClient.get.mockResolvedValue({ data: [] })

    await contactosService.obtenerContactosDelAlumno(7)

    expect(mockedClient.get).toHaveBeenCalledWith('/alumnos/7/contactos')
  })

  it('listarSaaneeActivos consulta /usuarios/saanee', async () => {
    mockedClient.get.mockResolvedValue({ data: [] })

    await contactosService.listarSaaneeActivos()

    expect(mockedClient.get).toHaveBeenCalledWith('/usuarios/saanee')
  })
})
