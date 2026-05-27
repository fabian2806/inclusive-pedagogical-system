import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '@/lib/api/client'
import { notificacionesService } from '@/lib/api/notificacionesService'

vi.mock('@/lib/api/client')

const mockedClient = vi.mocked(apiClient)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('notificacionesService', () => {
  it('listarMias consulta /notificaciones/mias', async () => {
    mockedClient.get.mockResolvedValue({ data: [] })

    await notificacionesService.listarMias()

    expect(mockedClient.get).toHaveBeenCalledWith('/notificaciones/mias')
  })

  it('marcarLeida envia patch al endpoint individual', async () => {
    mockedClient.patch.mockResolvedValue({ data: { id: 1 } })

    await notificacionesService.marcarLeida(1)

    expect(mockedClient.patch).toHaveBeenCalledWith('/notificaciones/1/marcar-leida')
  })

  it('marcarTodasLeidas envia patch al endpoint masivo', async () => {
    mockedClient.patch.mockResolvedValue({ data: { marcadas: 5 } })

    const result = await notificacionesService.marcarTodasLeidas()

    expect(mockedClient.patch).toHaveBeenCalledWith('/notificaciones/marcar-todas-leidas')
    expect(result.marcadas).toBe(5)
  })
})
