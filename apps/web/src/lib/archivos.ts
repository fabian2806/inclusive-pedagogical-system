// Constantes y helpers compartidos para upload/visualización de archivos.
// Mantener alineado con el backend (DocumentoExpedienteService /
// EntradaArchivoService): mismo tamaño máximo y misma lista de MIMEs.

export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export const ACCEPT_EXTENSIONS = ".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
export const ACCEPT_HINT = "PDF, DOCX, XLSX, PNG, JPG — máx. 10 MB"

export const ALLOWED_MIME_TYPES = new Set<string>([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
])

/**
 * Devuelve el primer error de validación o null si pasa.
 */
export function validarArchivo(file: File): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `"${file.name}" supera los ${MAX_FILE_SIZE_MB} MB.`
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return `Tipo de archivo no permitido: "${file.name}".`
  }
  return null
}

export function formatTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
