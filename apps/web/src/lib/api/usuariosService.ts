import apiClient from './client'
import type {
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
  UsuarioResponse,
  TipoRol,
} from '@/types/api'

export const usuariosService = {
  async crear(data: UsuarioCreateRequest): Promise<UsuarioResponse> {
    const response = await apiClient.post<UsuarioResponse>('/admin/usuarios', data)
    return response.data
  },

  async listar(rol?: TipoRol): Promise<UsuarioResponse[]> {
    const params = rol ? { rol } : undefined
    const response = await apiClient.get<UsuarioResponse[]>('/admin/usuarios', { params })
    return response.data
  },

  async obtener(id: number): Promise<UsuarioResponse> {
    const response = await apiClient.get<UsuarioResponse>(`/admin/usuarios/${id}`)
    return response.data
  },

  async actualizar(id: number, data: UsuarioUpdateRequest): Promise<UsuarioResponse> {
    const response = await apiClient.put<UsuarioResponse>(`/admin/usuarios/${id}`, data)
    return response.data
  },

  async desactivar(id: number): Promise<void> {
    await apiClient.patch(`/admin/usuarios/${id}/desactivar`)
  },
}
