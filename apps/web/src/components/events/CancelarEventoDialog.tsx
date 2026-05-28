import { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { AxiosError } from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { eventosService } from '@/lib/api'
import type { ErrorResponse } from '@/types/api'

interface CancelarEventoDialogProps {
  open: boolean
  eventoId: number
  titulo: string
  onClose: () => void
  /** Se invoca tras una cancelacion exitosa. El parent decide refrescar
   *  y/o cerrar el modal de detalle. */
  onCanceled: () => void
}

export function CancelarEventoDialog({
  open,
  eventoId,
  titulo,
  onClose,
  onCanceled,
}: CancelarEventoDialogProps) {
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setSaving(true)
    setError(null)
    try {
      await eventosService.cancelar(eventoId, {
        motivoCancelacion: motivo.trim() || null,
      })
      onCanceled()
    } catch (err) {
      if (err instanceof AxiosError) {
        const apiError = err.response?.data as ErrorResponse | undefined
        setError(apiError?.mensaje ?? err.message)
      } else {
        setError('No se pudo cancelar el evento')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="sm:max-w-105">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-[#1E3A5F]">
            ¿Cancelar este evento?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <p className="text-sm text-[#374151]">
            Se cancelará <span className="font-medium">&quot;{titulo}&quot;</span> y se notificará
            a todos los invitados. Esta acción no se puede deshacer.
          </p>

          <div className="space-y-1.5">
            <label className="text-sm text-[#374151]">Motivo (opcional)</label>
            <Textarea
              placeholder="Ej: postergamos por feriado, conflicto de horario…"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="border-[#E5E7EB] resize-none h-20 text-sm"
              maxLength={500}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-xs text-[#7F1D1D] bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-2.5">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={saving}
              className="border-[#E5E7EB] text-xs"
            >
              Volver
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={saving}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs gap-1.5"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              Cancelar evento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
