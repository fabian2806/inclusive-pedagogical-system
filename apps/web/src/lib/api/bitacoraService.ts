import apiClient from './client'
import type {
  BitacoraListarFiltros,
  EntradaExpedienteRequest,
  EntradaExpedienteResponse,
} from '@/types/api'

export interface BitacoraExportResult {
  blob: Blob
  filename: string
}

export const bitacoraService = {
  async listar(
    alumnoId: number,
    filtros?: BitacoraListarFiltros,
  ): Promise<EntradaExpedienteResponse[]> {
    const response = await apiClient.get<EntradaExpedienteResponse[]>(
      `/alumnos/${alumnoId}/bitacora`,
      { params: filtros },
    )
    return response.data
  },

  async crear(
    alumnoId: number,
    data: EntradaExpedienteRequest,
  ): Promise<EntradaExpedienteResponse> {
    const response = await apiClient.post<EntradaExpedienteResponse>(
      `/alumnos/${alumnoId}/bitacora`,
      data,
    )
    return response.data
  },

  async exportarCsv(
    alumnoId: number,
    filtros?: BitacoraListarFiltros,
  ): Promise<BitacoraExportResult> {
    const response = await apiClient.get<Blob>(
      `/alumnos/${alumnoId}/bitacora/export`,
      { params: filtros, responseType: 'blob' },
    )
    return {
      blob: response.data,
      filename: parseFilenameDeContentDisposition(
        response.headers['content-disposition'],
      ) ?? defaultFilenameExport(alumnoId),
    }
  },
}

// Extrae el nombre de archivo de un header Content-Disposition. Soporta
// el formato RFC 5987 (filename*=UTF-8''...) y el tradicional (filename="...").
function parseFilenameDeContentDisposition(
  header: string | undefined,
): string | null {
  if (!header) return null
  const utf8 = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(header)
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1])
    } catch {
      // valor mal formado, caemos al fallback
    }
  }
  const ascii = /filename\s*=\s*"?([^";]+)"?/i.exec(header)
  return ascii?.[1] ?? null
}

function defaultFilenameExport(alumnoId: number): string {
  const ahora = new Date()
  const y = ahora.getFullYear()
  const m = String(ahora.getMonth() + 1).padStart(2, '0')
  const d = String(ahora.getDate()).padStart(2, '0')
  return `bitacora_alumno_${alumnoId}_${y}${m}${d}.csv`
}
