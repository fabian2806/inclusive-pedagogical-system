import apiClient from './client'
import type {
  BitacoraListarFiltros,
  EntradaExpedienteRequest,
  EntradaExpedienteResponse,
} from '@/types/api'

export const bitacoraService = {
  async listar(
    alumnoId: number,
    filtros?: BitacoraListarFiltros,
  ): Promise<EntradaExpedienteResponse[]> {
    const response = await apiClient.get<EntradaExpedienteResponse[]>(
      `/alumnos/${alumnoId}/bitacora`,
      { params: filtros },
    )
    return response.data
  },

  async crear(
    alumnoId: number,
    data: EntradaExpedienteRequest,
  ): Promise<EntradaExpedienteResponse> {
    const response = await apiClient.post<EntradaExpedienteResponse>(
      `/alumnos/${alumnoId}/bitacora`,
      data,
    )
    return response.data
  },
}
