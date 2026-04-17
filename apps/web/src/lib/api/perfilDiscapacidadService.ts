import apiClient from './client'
import type {
  PerfilDiscapacidadResponse,
  PerfilDiscapacidadRequest,
} from '@/types/api'

export const perfilDiscapacidadService = {
  async obtener(alumnoId: number): Promise<PerfilDiscapacidadResponse> {
    const response = await apiClient.get<PerfilDiscapacidadResponse>(
      `/alumnos/${alumnoId}/perfil-discapacidad`
    )
    return response.data
  },

  async guardar(alumnoId: number, data: PerfilDiscapacidadRequest): Promise<PerfilDiscapacidadResponse> {
    const response = await apiClient.put<PerfilDiscapacidadResponse>(
      `/alumnos/${alumnoId}/perfil-discapacidad`,
      data
    )
    return response.data
  },
}
