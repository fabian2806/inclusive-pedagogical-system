import apiClient from './client'
import type {
  AdminDashboardResponse,
  DocenteDashboardResponse,
  PadreDashboardResponse,
  SaaneeDashboardResponse,
  ActividadEntradaResponse,
} from '@/types/api'

export const dashboardService = {
  async getAdminResumen(): Promise<AdminDashboardResponse> {
    const response = await apiClient.get<AdminDashboardResponse>('/dashboard/admin/resumen')
    return response.data
  },

  async getDocenteResumen(): Promise<DocenteDashboardResponse> {
    const response = await apiClient.get<DocenteDashboardResponse>('/dashboard/docente/resumen')
    return response.data
  },

  async getPadreResumen(): Promise<PadreDashboardResponse> {
    const response = await apiClient.get<PadreDashboardResponse>('/dashboard/padre/resumen')
    return response.data
  },

  async getSaaneeResumen(): Promise<SaaneeDashboardResponse> {
    const response = await apiClient.get<SaaneeDashboardResponse>('/dashboard/saanee/resumen')
    return response.data
  },

  async getActividadRecienteDocente(limit = 5): Promise<ActividadEntradaResponse[]> {
    const response = await apiClient.get<ActividadEntradaResponse[]>(
      '/dashboard/docente/actividad-reciente',
      { params: { limit } },
    )
    return response.data
  },
}
