import apiClient from './client'
import type {
  EventoArchivoCreateRequest,
  EventoArchivoResponse,
} from '@/types/api'

/**
 * Adjuntos pre-evento (agenda, materiales). Sin UI en Fase 4 segun plan,
 * pero el cliente queda listo para enchufarse cuando se decida exponerlo.
 */
export const eventoArchivosService = {
  async listar(eventoId: number): Promise<EventoArchivoResponse[]> {
    const response = await apiClient.get<EventoArchivoResponse[]>(
      `/eventos/${eventoId}/archivos`,
    )
    return response.data
  },

  async adjuntar(
    eventoId: number,
    archivo: File,
    metadata?: EventoArchivoCreateRequest,
  ): Promise<EventoArchivoResponse> {
    const form = new FormData()
    if (metadata) {
      form.append(
        'data',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
      )
    }
    form.append('archivo', archivo)

    const response = await apiClient.post<EventoArchivoResponse>(
      `/eventos/${eventoId}/archivos`,
      form,
    )
    return response.data
  },

  /**
   * Devuelve la URL relativa de descarga (el cliente axios la resuelve contra
   * baseURL). Util cuando se quiere construir un href directo en la UI.
   */
  descargaUrl(eventoId: number, archivoId: number): string {
    return `/eventos/${eventoId}/archivos/${archivoId}/descargar`
  },
}
