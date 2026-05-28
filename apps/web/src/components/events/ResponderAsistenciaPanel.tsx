import { useState } from 'react'
import { AlertCircle, Check, Loader2, X } from 'lucide-react'
import { AxiosError } from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { eventosService } from '@/lib/api'
import type {
  ErrorResponse,
  EventoResponse,
  EventoUsuarioResponse,
} from '@/types/api'

interface ResponderAsistenciaPanelProps {
  evento: EventoResponse
  invitado: EventoUsuarioResponse
  /** Se invoca tras un cambio exitoso de respuesta. El parent decide si
   *  refrescar la lista, cerrar el modal, etc. */
  onResponded: () => void
}

const MOTIVOS_PREDEFINIDOS = [
  'No tengo disponibilidad ese día',
  'Necesito más tiempo para preparar la reunión',
  'Otro',
]

/**
 * Panel de respuesta de asistencia. Visible solo cuando:
 * - el usuario autenticado es invitado del evento (encontrado por el parent),
 * - el evento esta ACTIVO,
 * - la fechaInicio aun no paso.
 *
 * Permite confirmar / rechazar y tambien cambiar la respuesta previa.
 * El backend ya valida los tres puntos; aqui hay guardas locales para
 * evitar peticiones obviamente fallidas.
 */
export function ResponderAsistenciaPanel({
  evento,
  invitado,
  onResponded,
}: ResponderAsistenciaPanelProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rechazoOpen, setRechazoOpen] = useState(false)

  const eventoYaInicio = new Date(evento.fechaInicio).getTime() <= Date.now()
  const cerrado = evento.estado !== 'ACTIVO' || eventoYaInicio

  if (cerrado) {
    // Cuando el evento ya no admite respuestas, solo mostramos el estado
    // actual del invitado sin botones.
    return <EstadoBadge estado={invitado.estadoAsistencia} />
  }

  const submit = async (
    estadoAsistencia: 'CONFIRMADO' | 'RECHAZADO',
    motivoRechazo?: string,
  ) => {
    setSaving(true)
    setError(null)
    try {
      await eventosService.responder(evento.id, {
        estadoAsistencia,
        motivoRechazo: motivoRechazo ?? null,
      })
      setRechazoOpen(false)
      onResponded()
    } catch (err) {
      if (err instanceof AxiosError) {
        const apiError = err.response?.data as ErrorResponse | undefined
        setError(apiError?.mensaje ?? err.message)
      } else {
        setError('No se pudo registrar la respuesta')
      }
    } finally {
      setSaving(false)
    }
  }

  const estado = invitado.estadoAsistencia

  return (
    <>
      <div className="space-y-3">
        {/* Pista contextual segun estado actual */}
        {estado === 'PENDIENTE' && (
          <p className="text-xs text-[#6B7280] text-center">
            El docente te invita a este evento. Responde abajo.
          </p>
        )}
        {estado === 'CONFIRMADO' && (
          <p className="text-xs text-[#059669] text-center flex items-center justify-center gap-1.5">
            <Check size={14} /> Confirmaste tu asistencia
          </p>
        )}
        {estado === 'RECHAZADO' && (
          <p className="text-xs text-[#DC2626] text-center flex items-center justify-center gap-1.5">
            <X size={14} /> Rechazaste la invitación
          </p>
        )}

        {/* Acciones: ambos botones siempre visibles para permitir cambio */}
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRechazoOpen(true)}
            disabled={saving}
            className={`text-xs gap-1.5 ${
              estado === 'RECHAZADO'
                ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5] hover:bg-[#FEE2E2]'
                : 'text-[#DC2626] border-[#FECACA] hover:bg-[#FEF2F2]'
            }`}
          >
            <X size={13} />
            {estado === 'RECHAZADO' ? 'Cambiar motivo' : 'Rechazar'}
          </Button>
          <Button
            size="sm"
            onClick={() => submit('CONFIRMADO')}
            disabled={saving || estado === 'CONFIRMADO'}
            className={`text-xs gap-1.5 ${
              estado === 'CONFIRMADO'
                ? 'bg-[#059669] hover:bg-[#059669] text-white opacity-90'
                : 'bg-[#059669] hover:bg-[#047857] text-white'
            }`}
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            {estado === 'CONFIRMADO' ? 'Confirmado' : 'Confirmar asistencia'}
          </Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-xs text-[#7F1D1D] bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-2.5">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {rechazoOpen && (
        <RechazoDialog
          motivoPrevio={invitado.motivoRechazo}
          saving={saving}
          onCancel={() => setRechazoOpen(false)}
          onSubmit={(motivo) => submit('RECHAZADO', motivo)}
        />
      )}
    </>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: EventoUsuarioResponse['estadoAsistencia'] }) {
  const config =
    estado === 'CONFIRMADO'
      ? { bg: 'bg-[#D1FAE5]', text: 'text-[#059669]', label: 'Confirmado', icon: <Check size={14} /> }
      : estado === 'RECHAZADO'
        ? { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', label: 'Rechazado', icon: <X size={14} /> }
        : { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', label: 'Pendiente', icon: null }
  return (
    <div
      className={`flex items-center justify-center gap-1.5 text-xs font-medium ${config.bg} ${config.text} rounded-lg py-2`}
    >
      {config.icon}
      Tu respuesta: {config.label}
    </div>
  )
}

function RechazoDialog({
  motivoPrevio,
  saving,
  onCancel,
  onSubmit,
}: {
  motivoPrevio: string | null
  saving: boolean
  onCancel: () => void
  onSubmit: (motivo: string | undefined) => void
}) {
  // Si hay un motivo previo y coincide con uno predefinido, lo seleccionamos;
  // si es texto libre, lo cargamos en "Otro" + textarea.
  const motivoCoincide = motivoPrevio && MOTIVOS_PREDEFINIDOS.includes(motivoPrevio)
  const [motivo, setMotivo] = useState<string>(
    motivoPrevio ? (motivoCoincide ? motivoPrevio : 'Otro') : '',
  )
  const [custom, setCustom] = useState<string>(
    motivoPrevio && !motivoCoincide ? motivoPrevio : '',
  )

  const motivoFinal = motivo === 'Otro' ? custom.trim() : motivo
  const valido = motivo !== '' && (motivo !== 'Otro' || custom.trim().length > 0)

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-95">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-[#1E3A5F]">
            ¿Por qué rechazas la invitación?
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <Select value={motivo} onValueChange={setMotivo}>
            <SelectTrigger className="border-[#E5E7EB]">
              <SelectValue placeholder="Seleccionar motivo (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {MOTIVOS_PREDEFINIDOS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {motivo === 'Otro' && (
            <Textarea
              placeholder="Describe el motivo…"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="border-[#E5E7EB] resize-none h-20 text-sm"
            />
          )}

          <p className="text-[11px] text-[#9CA3AF]">
            Puedes rechazar sin indicar motivo: deja la selección vacía y
            confirma el rechazo.
          </p>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={saving}
              className="border-[#E5E7EB] text-xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() => onSubmit(valido ? motivoFinal : undefined)}
              disabled={saving || (motivo === 'Otro' && custom.trim().length === 0)}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs gap-1.5"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              Confirmar rechazo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
