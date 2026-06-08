import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import apiClient from '@/lib/api/client'
import { bitacoraService } from '@/lib/api/bitacoraService'

vi.mock('@/lib/api/client')

const mockedClient = vi.mocked(apiClient)

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('bitacoraService.exportarCsv', () => {
  it('hace GET al endpoint /export con responseType blob', async () => {
    mockedClient.get.mockResolvedValue({
      data: new Blob(['id,fecha\r\n'], { type: 'text/csv' }),
      headers: { 'content-disposition': 'attachment; filename="bitacora.csv"' },
    })

    await bitacoraService.exportarCsv(7)

    expect(mockedClient.get).toHaveBeenCalledWith(
      '/alumnos/7/bitacora/export',
      { params: undefined, responseType: 'blob' },
    )
  })

  it('propaga el filtro de tipo como query param', async () => {
    mockedClient.get.mockResolvedValue({
      data: new Blob([''], { type: 'text/csv' }),
      headers: {},
    })

    await bitacoraService.exportarCsv(7, { tipo: 'OBSERVACION_PEDAGOGICA' })

    expect(mockedClient.get).toHaveBeenCalledWith(
      '/alumnos/7/bitacora/export',
      {
        params: { tipo: 'OBSERVACION_PEDAGOGICA' },
        responseType: 'blob',
      },
    )
  })

  it('extrae el filename del Content-Disposition en formato RFC 5987 (UTF-8)', async () => {
    mockedClient.get.mockResolvedValue({
      data: new Blob(['x'], { type: 'text/csv' }),
      headers: {
        'content-disposition':
          "attachment; filename*=UTF-8''bitacora_alumno_5_20260605.csv",
      },
    })

    const result = await bitacoraService.exportarCsv(5)

    expect(result.filename).toBe('bitacora_alumno_5_20260605.csv')
  })

  it('extrae el filename del Content-Disposition en formato ASCII tradicional', async () => {
    mockedClient.get.mockResolvedValue({
      data: new Blob(['x'], { type: 'text/csv' }),
      headers: {
        'content-disposition':
          'attachment; filename="bitacora_alumno_3_20260605.csv"',
      },
    })

    const result = await bitacoraService.exportarCsv(3)

    expect(result.filename).toBe('bitacora_alumno_3_20260605.csv')
  })

  it('usa filename fallback con la fecha actual cuando el header no viene', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-05T12:00:00'))

    mockedClient.get.mockResolvedValue({
      data: new Blob(['x'], { type: 'text/csv' }),
      headers: {},
    })

    const result = await bitacoraService.exportarCsv(9)

    expect(result.filename).toBe('bitacora_alumno_9_20260605.csv')
  })
})
