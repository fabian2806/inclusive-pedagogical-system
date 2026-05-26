import apiClient from './client'
import type {
  AlumnoCreateRequest,
  AlumnoUpdateRequest,
  AlumnoResponse,
} from '@/types/api'

export const alumnosService = {
  async crear(data: AlumnoCreateRequest): Promise<AlumnoResponse> {
    const response = await apiClient.post<AlumnoResponse>('/admin/alumnos', data)
    return response.data
  },

  async listar(): Promise<AlumnoResponse[]> {
    const response = await apiClient.get<AlumnoResponse[]>('/alumnos')
    return response.data
  },

  async obtener(id: number): Promise<AlumnoResponse> {
    const response = await apiClient.get<AlumnoResponse>(`/alumnos/${id}`)
    return response.data
  },

  async actualizar(id: number, data: AlumnoUpdateRequest): Promise<AlumnoResponse> {
    const response = await apiClient.put<AlumnoResponse>(`/admin/alumnos/${id}`, data)
    return response.data
  },

  async desactivar(id: number): Promise<void> {
    await apiClient.patch(`/admin/alumnos/${id}/desactivar`)
  },

  async asignarDocente(alumnoId: number, docenteId: number): Promise<AlumnoResponse> {
    const response = await apiClient.post<AlumnoResponse>(
      `/admin/alumnos/${alumnoId}/docentes/${docenteId}`
    )
    return response.data
  },

  async removerDocente(alumnoId: number, docenteId: number): Promise<AlumnoResponse> {
    const response = await apiClient.delete<AlumnoResponse>(
      `/admin/alumnos/${alumnoId}/docentes/${docenteId}`
    )
    return response.data
  },

  async asignarPadre(alumnoId: number, padreId: number): Promise<AlumnoResponse> {
    const response = await apiClient.post<AlumnoResponse>(
      `/admin/alumnos/${alumnoId}/padres/${padreId}`
    )
    return response.data
  },

  async removerPadre(alumnoId: number, padreId: number): Promise<AlumnoResponse> {
    const response = await apiClient.delete<AlumnoResponse>(
      `/admin/alumnos/${alumnoId}/padres/${padreId}`
    )
    return response.data
  },
}
