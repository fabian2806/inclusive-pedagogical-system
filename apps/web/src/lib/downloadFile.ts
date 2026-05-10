// Helpers compartidos para descargar archivos servidos por el backend con
// Content-Disposition. Usados por documentosExpedienteService y
// entradaArchivosService.

/**
 * Extrae el nombre de archivo de un header Content-Disposition.
 * Soporta el formato RFC 5987 (filename*=UTF-8''...) que usa Spring para
 * caracteres no-ASCII, y el formato clásico filename="..." como fallback.
 */
export function extraerFilename(contentDisposition?: string): string | null {
  if (!contentDisposition) return null

  const m5987 = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(contentDisposition)
  if (m5987) {
    const raw = m5987[1].trim().replace(/^"|"$/g, "")
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }

  const m = /filename\s*=\s*"?([^";]+)"?/i.exec(contentDisposition)
  return m ? m[1].trim() : null
}

/**
 * Dispara la descarga de un Blob como archivo del nombre indicado.
 * Crea un <a download> efímero y revoca la URL después.
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
