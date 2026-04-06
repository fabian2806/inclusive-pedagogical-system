import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '@/lib/api/client'
import { tiposDocumentoService } from '@/lib/api/tiposDocumentoService'

vi.mock('@/lib/api/client')

const mockedClient = vi.mocked(apiClient)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('tiposDocumentoService', () => {
  it('crear envía POST con datos del tipo', async () => {
    const nuevoTipo = {
      nombre: 'Certificado Médico',
      esObligatorio: false, esVersionable: true, esPeriodico: false,
    }
    mockedClient.post.mockResolvedValue({
      data: { id: 6, ...nuevoTipo, esPredefinido: false, periodicidad: null },
    })

    const result = await tiposDocumentoService.crear(nuevoTipo)

    expect(mockedClient.post).toHaveBeenCalledWith('/admin/tipos-documento', nuevoTipo)
    expect(result.id).toBe(6)
  })

  it('listar retorna array de tipos', async () => {
    mockedClient.get.mockResolvedValue({ data: [{ id: 1, nombre: 'PEP' }] })

    const result = await tiposDocumentoService.listar()

    expect(mockedClient.get).toHaveBeenCalledWith('/admin/tipos-documento')
    expect(result).toHaveLength(1)
  })

  it('eliminar envía DELETE al endpoint correcto', async () => {
    mockedClient.delete.mockResolvedValue({})

    await tiposDocumentoService.eliminar(6)

    expect(mockedClient.delete).toHaveBeenCalledWith('/admin/tipos-documento/6')
  })
})
