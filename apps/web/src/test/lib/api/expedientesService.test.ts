import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '@/lib/api/client'
import { expedientesService } from '@/lib/api/expedientesService'
import { documentosExpedienteService } from '@/lib/api/documentosExpedienteService'
import { bitacoraService } from '@/lib/api/bitacoraService'

vi.mock('@/lib/api/client')

const mockedClient = vi.mocked(apiClient)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('expedientesService.listarPeriodos', () => {
  it('hace GET a /alumnos/{id}/expedientes', async () => {
    mockedClient.get.mockResolvedValue({ data: [] })

    await expedientesService.listarPeriodos(7)

    expect(mockedClient.get).toHaveBeenCalledWith('/alumnos/7/expedientes')
  })

  it('devuelve los periodos con sus flags', async () => {
    mockedClient.get.mockResolvedValue({
      data: [
        { periodoLectivo: '2026', estado: 'ACTIVO', vigente: true, editable: true },
        { periodoLectivo: '2024', estado: 'INACTIVO', vigente: false, editable: false },
      ],
    })

    const periodos = await expedientesService.listarPeriodos(7)

    expect(periodos).toHaveLength(2)
    expect(periodos[0].editable).toBe(true)
    expect(periodos[1].editable).toBe(false)
  })
})

describe('propagacion del query param periodo', () => {
  it('documentos: sin periodo no manda params (consulta el vigente)', async () => {
    mockedClient.get.mockResolvedValue({ data: [] })

    await documentosExpedienteService.listar(7)

    expect(mockedClient.get).toHaveBeenCalledWith('/alumnos/7/documentos', {
      params: undefined,
    })
  })

  it('documentos: con periodo lo manda como query param', async () => {
    mockedClient.get.mockResolvedValue({ data: [] })

    await documentosExpedienteService.listar(7, '2024')

    expect(mockedClient.get).toHaveBeenCalledWith('/alumnos/7/documentos', {
      params: { periodo: '2024' },
    })
  })

  it('bitacora: con periodo lo manda como query param', async () => {
    mockedClient.get.mockResolvedValue({ data: [] })

    await bitacoraService.listar(7, { periodo: '2024' })

    expect(mockedClient.get).toHaveBeenCalledWith('/alumnos/7/bitacora', {
      params: { periodo: '2024' },
    })
  })
})
