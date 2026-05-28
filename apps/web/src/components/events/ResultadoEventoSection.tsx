import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Download, FileText, Loader2 } from 'lucide-react'
import { AxiosError } from 'axios'
import { entradaArchivosService, eventosService } from '@/lib/api'
import { formatTamano } from '@/lib/archivos'
import type { ErrorResponse, ResultadoEventoResponse } from '@/types/api'

interface ResultadoEventoSectionProps {
  eventoId: number
  /** alumnoId del evento, necesario para construir la URL de descarga de
   *  los EntradaArchivo (el endpoint es /alumnos/{alumnoId}/bitacora/archivos/{id}/descargar). */
  alumnoId: number
}

/**
 * Sección que muestra el resultado registrado de un evento FINALIZADO.
 * Se monta dentro del modal de detalle cuando evento.estado === FINALIZADO.
 */
export function ResultadoEventoSection({
  eventoId,
  alumnoId,
}: ResultadoEventoSectionProps) {
  const [resultado, setResultado] = useState<ResultadoEventoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [descargandoId, setDescargandoId] = useState<number | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await eventosService.obtenerResultado(eventoId)
      setResultado(data)
    } catch (err) {
      if (err instanceof AxiosError) {
        const apiError = err.response?.data as ErrorResponse | undefined
        // 404: evento FINALIZADO sin resultado registrado (caso raro: solo
        // ocurre si la transaccion del registro se rollbackeo a medias).
        setError(apiError?.mensaje ?? 'No hay resultado registrado todavía')
      } else {
        setError('No se pudo cargar el resultado')
      }
    } finally {
      setLoading(false)
    }
  }, [eventoId])

  useEffect(() => {
    cargar()
  }, [cargar])

  const descargar = async (archivoId: number) => {
    setDescargandoId(archivoId)
    try {
      await entradaArchivosService.descargar(alumnoId, archivoId)
    } catch {
      // Si la descarga falla, el blob no se materializa; sin estado visual
      // de error puntual mas alla de la limpieza del spinner.
    } finally {
      setDescargandoId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#6B7280]">
        <Loader2 size={14} className="animate-spin" />
        Cargando resultado…
      </div>
    )
  }

  if (error || !resultado) {
    return (
      <div className="flex items-start gap-2 text-xs text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-2.5">
        <AlertCircle size={14} className="shrink-0 mt-0.5" />
        <span>{error ?? 'Sin resultado registrado'}</span>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0]">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={18} className="text-[#059669] shrink-0" />
        <p className="text-sm font-semibold text-[#065F46]">Resultado registrado</p>
      </div>

      {resultado.titulo && (
        <p className="text-sm font-medium text-[#1E3A5F]">{resultado.titulo}</p>
      )}

      <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">
        {resultado.descripcion}
      </p>

      <p className="text-[11px] text-[#6B7280]">
        Por {resultado.autor.nombre} {resultado.autor.apellido} ·{' '}
        {new Date(resultado.fecha).toLocaleString('es-PE', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>

      {resultado.archivos.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <p className="text-[10px] font-semibold text-[#065F46] uppercase tracking-wide">
            Adjuntos ({resultado.archivos.length})
          </p>
          {resultado.archivos.map((archivo) => (
            <div
              key={archivo.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#D1FAE5]"
            >
              <FileText size={14} className="text-[#059669] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#374151] truncate">
                  {archivo.archivo.nombreOriginal}
                </p>
                <p className="text-[11px] text-[#9CA3AF]">
                  {formatTamano(archivo.archivo.tamano)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => descargar(archivo.id)}
                disabled={descargandoId === archivo.id}
                className="text-[#059669] hover:text-[#047857] disabled:opacity-50 p-1"
                aria-label={`Descargar ${archivo.archivo.nombreOriginal}`}
              >
                {descargandoId === archivo.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
