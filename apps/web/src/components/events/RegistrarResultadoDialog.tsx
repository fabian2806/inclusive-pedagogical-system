import { useCallback, useState } from 'react'
import { AlertCircle, FileText, Info, Loader2, Paperclip, X } from 'lucide-react'
import { AxiosError } from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { eventosService } from '@/lib/api'
import {
  ACCEPT_EXTENSIONS,
  ACCEPT_HINT,
  formatTamano,
  validarArchivo,
} from '@/lib/archivos'
import type { ErrorResponse } from '@/types/api'

interface RegistrarResultadoDialogProps {
  open: boolean
  eventoId: number
  eventoTitulo: string
  onClose: () => void
  /** Se invoca tras el registro exitoso. El parent decide refrescar y cerrar
   *  el modal de detalle. */
  onRegistered: () => void
}

export function RegistrarResultadoDialog({
  open,
  eventoId,
  eventoTitulo,
  onClose,
  onRegistered,
}: RegistrarResultadoDialogProps) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [archivos, setArchivos] = useState<File[]>([])
  const [archivoError, setArchivoError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setTitulo('')
    setDescripcion('')
    setArchivos([])
    setArchivoError(null)
    setError(null)
  }

  const handleAddFiles = useCallback((seleccionados: FileList | null) => {
    if (!seleccionados) return
    setArchivoError(null)
    const aceptados: File[] = []
    for (let i = 0; i < seleccionados.length; i++) {
      const f = seleccionados.item(i)
      if (!f) continue
      const err = validarArchivo(f)
      if (err) {
        setArchivoError(err)
        continue
      }
      aceptados.push(f)
    }
    if (aceptados.length > 0) {
      setArchivos((prev) => [...prev, ...aceptados])
    }
  }, [])

  const removeArchivo = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index))
  }

  const valido = descripcion.trim().length > 0

  const handleSubmit = async () => {
    if (!valido) return
    setSaving(true)
    setError(null)
    try {
      await eventosService.registrarResultado(
        eventoId,
        {
          titulo: titulo.trim() || null,
          descripcion: descripcion.trim(),
        },
        archivos.length > 0 ? archivos : undefined,
      )
      reset()
      onRegistered()
    } catch (err) {
      if (err instanceof AxiosError) {
        const apiError = err.response?.data as ErrorResponse | undefined
        setError(apiError?.mensaje ?? err.message)
      } else {
        setError('No se pudo registrar el resultado')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && !saving) {
          reset()
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-130 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#1E3A5F]">
            Registrar resultado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-[#6B7280]">
            Evento: <span className="font-medium text-[#374151]">{eventoTitulo}</span>
          </p>

          <div className="space-y-1.5">
            <Label className="text-sm text-[#374151]">Título (opcional)</Label>
            <Input
              placeholder="Ej: Acuerdos de la reunión…"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={150}
              className="border-[#E5E7EB]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-[#374151]">
              Descripción del resultado <span className="text-[#DC2626]">*</span>
            </Label>
            <Textarea
              placeholder="Resume qué se acordó, decisiones tomadas, próximos pasos…"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="border-[#E5E7EB] resize-none h-32"
            />
          </div>

          {/* Adjuntos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-[#374151]">Adjuntos (opcional)</Label>
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept={ACCEPT_EXTENSIONS}
                  onChange={(e) => {
                    handleAddFiles(e.target.files)
                    // reset para permitir re-seleccionar el mismo archivo si se removio
                    e.target.value = ''
                  }}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-1.5 text-xs text-[#3B82F6] hover:text-[#2563EB] font-medium">
                  <Paperclip size={13} />
                  Agregar archivo
                </span>
              </label>
            </div>

            <p className="text-[11px] text-[#9CA3AF]">{ACCEPT_HINT}</p>

            {archivoError && (
              <div className="flex items-start gap-2 text-xs text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-2.5">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{archivoError}</span>
              </div>
            )}

            {archivos.length > 0 && (
              <div className="space-y-1.5">
                {archivos.map((f, i) => (
                  <div
                    key={`${f.name}-${i}`}
                    className="flex items-center gap-2 p-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]"
                  >
                    <FileText size={14} className="text-[#6B7280] shrink-0" />
                    <span className="text-sm text-[#374151] flex-1 truncate">{f.name}</span>
                    <span className="text-[11px] text-[#9CA3AF]">{formatTamano(f.size)}</span>
                    <button
                      type="button"
                      onClick={() => removeArchivo(i)}
                      disabled={saving}
                      className="text-[#9CA3AF] hover:text-[#DC2626] transition-colors"
                      aria-label={`Quitar ${f.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aviso de cierre del evento */}
          <div className="flex items-start gap-2 text-xs text-[#0C4A6E] bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-2.5">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>
              Al registrar el resultado, el evento se marca como{' '}
              <span className="font-semibold">FINALIZADO</span> y se notifica a los
              invitados que confirmaron o quedaron pendientes.
            </span>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-xs text-[#7F1D1D] bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-2.5">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="border-[#E5E7EB] text-[#374151]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !valido}
              className="bg-[#059669] hover:bg-[#047857] text-white gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Registrar resultado
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
