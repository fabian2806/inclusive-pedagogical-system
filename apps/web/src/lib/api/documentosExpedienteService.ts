import apiClient from './client'
import type {
  DocumentoExpedienteCreateRequest,
  DocumentoExpedienteResponse,
} from '@/types/api'

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

/**
 * Extrae el nombre de archivo de un header Content-Disposition.
 * Soporta el formato RFC 5987 (filename*=UTF-8''...) que usa Spring para
 * caracteres no-ASCII, y el formato clásico filename="..." como fallback.
 */
function extraerFilename(contentDisposition?: string): string | null {
  if (!contentDisposition) return null

  const m5987 = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(contentDisposition)
  if (m5987) {
    const raw = m5987[1].trim().replace(/^"|"$/g, '')
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }

  const m = /filename\s*=\s*"?([^";]+)"?/i.exec(contentDisposition)
  return m ? m[1].trim() : null
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
