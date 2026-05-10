import apiClient from './client'
import type {
  DocumentoExpedienteCreateRequest,
  DocumentoExpedienteResponse,
} from '@/types/api'
import { extraerFilename, triggerDownload } from '@/lib/downloadFile'

export const documentosExpedienteService = {
  async listar(alumnoId: number): Promise<DocumentoExpedienteResponse[]> {
    const response = await apiClient.get<DocumentoExpedienteResponse[]>(
      `/alumnos/${alumnoId}/documentos`,
    )
    return response.data
  },

  async subir(
    alumnoId: number,
    request: DocumentoExpedienteCreateRequest,
    archivo: File,
  ): Promise<DocumentoExpedienteResponse> {
    const formData = new FormData()
    formData.append(
      'data',
      new Blob([JSON.stringify(request)], { type: 'application/json' }),
    )
    formData.append('archivo', archivo)

    const response = await apiClient.post<DocumentoExpedienteResponse>(
      `/alumnos/${alumnoId}/documentos`,
      formData,
      // Forzamos el header para que axios regenere el Content-Type
      // multipart/form-data con boundary correcto (el cliente tiene
      // application/json como default, ver lib/api/client.ts).
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return response.data
  },

  async descargar(alumnoId: number, documentoId: number): Promise<void> {
    const response = await apiClient.get(
      `/alumnos/${alumnoId}/documentos/${documentoId}/descargar`,
      { responseType: 'blob' },
    )
    const filename =
      extraerFilename(response.headers['content-disposition']) ??
      `documento-${documentoId}`
    triggerDownload(response.data as Blob, filename)
  },
}
