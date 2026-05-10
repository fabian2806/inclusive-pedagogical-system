import apiClient from './client'
import type {
  TipoDocumentoCreateRequest,
  TipoDocumentoUpdateRequest,
  TipoDocumentoResponse,
} from '@/types/api'

export const tiposDocumentoService = {
  async crear(data: TipoDocumentoCreateRequest): Promise<TipoDocumentoResponse> {
    const response = await apiClient.post<TipoDocumentoResponse>('/admin/tipos-documento', data)
    return response.data
  },

  async listar(): Promise<TipoDocumentoResponse[]> {
    const response = await apiClient.get<TipoDocumentoResponse[]>('/admin/tipos-documento')
    return response.data
  },

  /**
   * Catálogo de solo lectura para roles del expediente (DOCENTE/PADRE/SAANEE).
   * No requiere TIPO_DOCUMENTO_GESTIONAR; usa DOCUMENTO_EXPEDIENTE_LEER.
   */
  async listarCatalogo(): Promise<TipoDocumentoResponse[]> {
    const response = await apiClient.get<TipoDocumentoResponse[]>('/tipos-documento')
    return response.data
  },

  async obtener(id: number): Promise<TipoDocumentoResponse> {
    const response = await apiClient.get<TipoDocumentoResponse>(`/admin/tipos-documento/${id}`)
    return response.data
  },

  async actualizar(id: number, data: TipoDocumentoUpdateRequest): Promise<TipoDocumentoResponse> {
    const response = await apiClient.put<TipoDocumentoResponse>(`/admin/tipos-documento/${id}`, data)
    return response.data
  },

  async eliminar(id: number): Promise<void> {
    await apiClient.delete(`/admin/tipos-documento/${id}`)
  },
}
