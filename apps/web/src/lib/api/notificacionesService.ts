import apiClient from './client'
import type { NotificacionResponse } from '@/types/api'

export const notificacionesService = {
  async listarMias(): Promise<NotificacionResponse[]> {
    const response = await apiClient.get<NotificacionResponse[]>(
      '/notificaciones/mias',
    )
    return response.data
  },

  async marcarLeida(id: number): Promise<NotificacionResponse> {
    const response = await apiClient.patch<NotificacionResponse>(
      `/notificaciones/${id}/marcar-leida`,
    )
    return response.data
  },

  async marcarTodasLeidas(): Promise<{ marcadas: number }> {
    const response = await apiClient.patch<{ marcadas: number }>(
      '/notificaciones/marcar-todas-leidas',
    )
    return response.data
  },
}
