import apiClient from './client'
import type {
  CancelarEventoRequest,
  EventoCreateRequest,
  EventoResponse,
  EventoUpdateRequest,
  EventosListarFiltros,
  InvitarUsuarioRequest,
  RegistrarResultadoRequest,
  ResponderAsistenciaRequest,
  ResultadoEventoResponse,
} from '@/types/api'

export const eventosService = {
  async listar(filtros?: EventosListarFiltros): Promise<EventoResponse[]> {
    const response = await apiClient.get<EventoResponse[]>('/eventos', {
      params: filtros,
    })
    return response.data
  },

  async obtener(id: number): Promise<EventoResponse> {
    const response = await apiClient.get<EventoResponse>(`/eventos/${id}`)
    return response.data
  },

  async crear(data: EventoCreateRequest): Promise<EventoResponse> {
    const response = await apiClient.post<EventoResponse>('/eventos', data)
    return response.data
  },

  async editar(id: number, data: EventoUpdateRequest): Promise<EventoResponse> {
    const response = await apiClient.put<EventoResponse>(`/eventos/${id}`, data)
    return response.data
  },

  async cancelar(id: number, data?: CancelarEventoRequest): Promise<EventoResponse> {
    const response = await apiClient.patch<EventoResponse>(
      `/eventos/${id}/cancelar`,
      data ?? {},
    )
    return response.data
  },

  async responder(id: number, data: ResponderAsistenciaRequest): Promise<EventoResponse> {
    const response = await apiClient.patch<EventoResponse>(
      `/eventos/${id}/respuesta`,
      data,
    )
    return response.data
  },

  async agregarInvitado(id: number, data: InvitarUsuarioRequest): Promise<EventoResponse> {
    const response = await apiClient.post<EventoResponse>(
      `/eventos/${id}/invitados`,
      data,
    )
    return response.data
  },

  async removerInvitado(id: number, usuarioId: number): Promise<EventoResponse> {
    const response = await apiClient.delete<EventoResponse>(
      `/eventos/${id}/invitados/${usuarioId}`,
    )
    return response.data
  },

  async registrarResultado(
    id: number,
    data: RegistrarResultadoRequest,
    archivos?: File[],
  ): Promise<ResultadoEventoResponse> {
    const form = new FormData()
    form.append(
      'data',
      new Blob([JSON.stringify(data)], { type: 'application/json' }),
    )
    archivos?.forEach((archivo) => form.append('archivos', archivo))

    const response = await apiClient.post<ResultadoEventoResponse>(
      `/eventos/${id}/resultado`,
      form,
    )
    return response.data
  },

  async obtenerResultado(id: number): Promise<ResultadoEventoResponse> {
    const response = await apiClient.get<ResultadoEventoResponse>(
      `/eventos/${id}/resultado`,
    )
    return response.data
  },
}
