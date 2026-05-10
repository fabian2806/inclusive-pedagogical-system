import apiClient from './client'
import type {
  EntradaArchivoCreateRequest,
  EntradaArchivoResponse,
} from '@/types/api'
import { extraerFilename, triggerDownload } from '@/lib/downloadFile'

export const entradaArchivosService = {
  /**
   * Adjunta un archivo a una entrada raíz de la bitácora. El backend valida
   * que el usuario sea el autor de la entrada y que la entrada sea raíz
   * (no respuesta).
   */
  async adjuntar(
    alumnoId: number,
    entradaId: number,
    archivo: File,
    descripcion?: string | null,
  ): Promise<EntradaArchivoResponse> {
    const formData = new FormData()
    if (descripcion != null && descripcion.trim() !== '') {
      const data: EntradaArchivoCreateRequest = { descripcion: descripcion.trim() }
      formData.append(
        'data',
        new Blob([JSON.stringify(data)], { type: 'application/json' }),
      )
    }
    formData.append('archivo', archivo)

    const response = await apiClient.post<EntradaArchivoResponse>(
      `/alumnos/${alumnoId}/bitacora/${entradaId}/archivos`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return response.data
  },

  async listar(
    alumnoId: number,
    entradaId: number,
  ): Promise<EntradaArchivoResponse[]> {
    const response = await apiClient.get<EntradaArchivoResponse[]>(
      `/alumnos/${alumnoId}/bitacora/${entradaId}/archivos`,
    )
    return response.data
  },

  async descargar(alumnoId: number, archivoId: number): Promise<void> {
    const response = await apiClient.get(
      `/alumnos/${alumnoId}/bitacora/archivos/${archivoId}/descargar`,
      { responseType: 'blob' },
    )
    const filename =
      extraerFilename(response.headers['content-disposition']) ??
      `archivo-${archivoId}`
    triggerDownload(response.data as Blob, filename)
  },
}
