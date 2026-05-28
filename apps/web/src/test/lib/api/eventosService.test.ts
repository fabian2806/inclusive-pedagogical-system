import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '@/lib/api/client'
import { eventosService } from '@/lib/api/eventosService'
import type { EventoResponse, ResultadoEventoResponse } from '@/types/api'

vi.mock('@/lib/api/client')

const mockedClient = vi.mocked(apiClient)

const eventoMock: EventoResponse = {
  id: 1,
  titulo: 'Reunion con familia Rodriguez',
  descripcion: null,
  fechaInicio: '2026-06-10T10:00:00',
  fechaFin: '2026-06-10T11:00:00',
  tipoEvento: 'REUNION_PADRES',
  modalidad: 'PRESENCIAL',
  ubicacion: 'Sala A',
  estado: 'ACTIVO',
  motivoCancelacion: null,
  alumno: { id: 1, nombre: 'Sofia', apellido: 'Rodriguez', grado: '3ro', seccion: 'A' },
  usuarioCreador: { id: 5, nombre: 'Maria', apellido: 'Castro', rol: 'DOCENTE' },
  fechaCreacion: '2026-05-27T10:00:00',
  fechaActualizacion: null,
  invitados: [],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('eventosService', () => {
  it('listar pasa filtros como query params', async () => {
    mockedClient.get.mockResolvedValue({ data: [eventoMock] })

    await eventosService.listar({ alumnoId: 1, estado: 'ACTIVO' })

    expect(mockedClient.get).toHaveBeenCalledWith('/eventos', {
      params: { alumnoId: 1, estado: 'ACTIVO' },
    })
  })

  it('obtener consulta /eventos/{id}', async () => {
    mockedClient.get.mockResolvedValue({ data: eventoMock })

    const result = await eventosService.obtener(1)

    expect(mockedClient.get).toHaveBeenCalledWith('/eventos/1')
    expect(result.titulo).toBe('Reunion con familia Rodriguez')
  })

  it('crear envia el request al POST /eventos', async () => {
    mockedClient.post.mockResolvedValue({ data: eventoMock })

    await eventosService.crear({
      titulo: 'X',
      fechaInicio: '2026-06-10T10:00:00',
      fechaFin: '2026-06-10T11:00:00',
      tipoEvento: 'REUNION_PADRES',
      modalidad: 'PRESENCIAL',
      alumnoId: 1,
      invitadosUsuarioIds: [2, 3],
    })

    expect(mockedClient.post).toHaveBeenCalledWith('/eventos', expect.objectContaining({
      titulo: 'X',
      invitadosUsuarioIds: [2, 3],
    }))
  })

  it('cancelar envia patch con motivo cuando se proporciona', async () => {
    mockedClient.patch.mockResolvedValue({ data: { ...eventoMock, estado: 'CANCELADO' } })

    await eventosService.cancelar(1, { motivoCancelacion: 'Feriado' })

    expect(mockedClient.patch).toHaveBeenCalledWith(
      '/eventos/1/cancelar',
      { motivoCancelacion: 'Feriado' },
    )
  })

  it('cancelar sin motivo envia body vacio (no undefined) para evitar 415', async () => {
    mockedClient.patch.mockResolvedValue({ data: eventoMock })

    await eventosService.cancelar(1)

    expect(mockedClient.patch).toHaveBeenCalledWith('/eventos/1/cancelar', {})
  })

  it('responder envia patch /eventos/{id}/respuesta', async () => {
    mockedClient.patch.mockResolvedValue({ data: eventoMock })

    await eventosService.responder(1, { estadoAsistencia: 'CONFIRMADO' })

    expect(mockedClient.patch).toHaveBeenCalledWith(
      '/eventos/1/respuesta',
      { estadoAsistencia: 'CONFIRMADO' },
    )
  })

  it('registrarResultado arma multipart con data + archivos', async () => {
    const resultadoMock: ResultadoEventoResponse = {
      eventoId: 1,
      entradaId: 50,
      titulo: null,
      descripcion: 'Acordamos plan',
      fecha: '2026-06-10T11:00:00',
      autor: { id: 5, nombre: 'Maria', apellido: 'Castro', rol: 'DOCENTE' },
      archivos: [],
    }
    mockedClient.post.mockResolvedValue({ data: resultadoMock })

    const archivo = new File(['contenido'], 'acta.pdf', { type: 'application/pdf' })
    await eventosService.registrarResultado(
      1,
      { descripcion: 'Acordamos plan' },
      [archivo],
    )

    expect(mockedClient.post).toHaveBeenCalledTimes(1)
    const [url, body, config] = mockedClient.post.mock.calls[0]
    expect(url).toBe('/eventos/1/resultado')
    expect(body).toBeInstanceOf(FormData)
    const form = body as FormData
    expect(form.get('data')).toBeInstanceOf(Blob)
    expect(form.getAll('archivos')).toHaveLength(1)
    // Override del Content-Type para que axios use multipart con boundary
    // en lugar del application/json default del apiClient.
    expect((config as { headers?: Record<string, string> } | undefined)?.headers?.['Content-Type']).toBe(
      'multipart/form-data',
    )
  })

  it('obtenerResultado consulta /eventos/{id}/resultado', async () => {
    mockedClient.get.mockResolvedValue({
      data: {
        eventoId: 1,
        entradaId: 50,
        titulo: null,
        descripcion: 'X',
        fecha: '2026-06-10T11:00:00',
        autor: { id: 5, nombre: 'M', apellido: 'C', rol: 'DOCENTE' },
        archivos: [],
      },
    })

    const result = await eventosService.obtenerResultado(1)

    expect(mockedClient.get).toHaveBeenCalledWith('/eventos/1/resultado')
    expect(result.entradaId).toBe(50)
  })
})
