import apiClient from './client'
import type {
  IndicadorCreateRequest,
  IndicadorUpdateRequest,
  IndicadorResponse,
  IndicadoresListarFiltros,
} from '@/types/api'

export const indicadoresService = {
  async listar(filtros: IndicadoresListarFiltros = {}): Promise<IndicadorResponse[]> {
    const params: Record<string, string | boolean> = {}
    if (filtros.areaCurricular) params.areaCurricular = filtros.areaCurricular
    if (filtros.q && filtros.q.trim()) params.q = filtros.q.trim()
    if (filtros.activo !== undefined) params.activo = filtros.activo

    const response = await apiClient.get<IndicadorResponse[]>('/indicadores', { params })
    return response.data
  },

  async obtener(id: number): Promise<IndicadorResponse> {
    const response = await apiClient.get<IndicadorResponse>(`/indicadores/${id}`)
    return response.data
  },

  async crear(data: IndicadorCreateRequest): Promise<IndicadorResponse> {
    const response = await apiClient.post<IndicadorResponse>('/indicadores', data)
    return response.data
  },

  async actualizar(id: number, data: IndicadorUpdateRequest): Promise<IndicadorResponse> {
    const response = await apiClient.put<IndicadorResponse>(`/indicadores/${id}`, data)
    return response.data
  },

  async desactivar(id: number): Promise<IndicadorResponse> {
    const response = await apiClient.patch<IndicadorResponse>(`/indicadores/${id}/desactivar`)
    return response.data
  },

  async activar(id: number): Promise<IndicadorResponse> {
    const response = await apiClient.patch<IndicadorResponse>(`/indicadores/${id}/activar`)
    return response.data
  },
}
