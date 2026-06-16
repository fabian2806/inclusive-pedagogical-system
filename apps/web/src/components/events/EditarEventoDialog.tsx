import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Info, Loader2 } from 'lucide-react'
import { AxiosError } from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { eventosService } from '@/lib/api'
import { toast } from '@/lib/toast'
import type {
  ErrorResponse,
  EventoResponse,
  ModalidadEvento,
} from '@/types/api'

interface EditarEventoDialogProps {
  open: boolean
  evento: EventoResponse
  onClose: () => void
  /** Se invoca tras una edicion exitosa. El parent refresca la lista y/o
   *  cierra el modal de detalle. */
  onSaved: () => void
}

interface FormState {
  titulo: string
  descripcion: string
  fecha: string
  hora: string
  duracion: string
  modalidad: ModalidadEvento
  ubicacion: string
}

const DURACIONES = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1.5 horas' },
  { value: '120', label: '2 horas' },
]

export function EditarEventoDialog({
  open,
  evento,
  onClose,
  onSaved,
}: EditarEventoDialogProps) {
  const valoresIniciales = useMemo<FormState>(() => fromEvento(evento), [evento])
  const [form, setForm] = useState<FormState>(valoresIniciales)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Resincronizar cuando se reabre o cuando el evento subyacente cambia.
  useEffect(() => {
    if (open) {
      setForm(valoresIniciales)
      setError(null)
    }
  }, [open, valoresIniciales])

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setError(null)
  }, [])

  // Detecta cambio de fechas vs los valores originales del evento, para avisar
  // que las respuestas de los invitados se resetearan (regla del backend).
  const cambioFecha =
    form.fecha !== valoresIniciales.fecha ||
    form.hora !== valoresIniciales.hora ||
    form.duracion !== valoresIniciales.duracion

  const validacion = useMemo(() => {
    if (!form.titulo.trim()) return 'Ingresa un titulo'
    if (!form.fecha || !form.hora) return 'Indica fecha y hora'
    return null
  }, [form])

  const handleSubmit = async () => {
    if (validacion) return
    setSaving(true)
    setError(null)
    try {
      const fechaInicio = new Date(`${form.fecha}T${form.hora}:00`)
      const fechaFin = new Date(fechaInicio.getTime() + Number(form.duracion) * 60_000)

      await eventosService.editar(evento.id, {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || null,
        fechaInicio: toLocalIso(fechaInicio),
        fechaFin: toLocalIso(fechaFin),
        modalidad: form.modalidad,
        ubicacion: form.ubicacion.trim() || null,
      })
      toast.success('Evento actualizado')
      onSaved()
    } catch (err) {
      if (err instanceof AxiosError) {
        const apiError = err.response?.data as ErrorResponse | undefined
        setError(apiError?.mensaje ?? err.message)
      } else {
        setError('No se pudo actualizar el evento')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="sm:max-w-130 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#1E3A5F]">
            Editar evento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <Field label="Título" required>
            <Input
              value={form.titulo}
              onChange={(e) => setField('titulo', e.target.value)}
              className="border-[#E5E7EB]"
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Fecha" required>
              <Input
                type="date"
                value={form.fecha}
                onChange={(e) => setField('fecha', e.target.value)}
                className="border-[#E5E7EB]"
              />
            </Field>
            <Field label="Hora" required>
              <Input
                type="time"
                value={form.hora}
                onChange={(e) => setField('hora', e.target.value)}
                className="border-[#E5E7EB]"
              />
            </Field>
            <Field label="Duración">
              <Select
                value={form.duracion}
                onValueChange={(v) => setField('duracion', v)}
              >
                <SelectTrigger className="border-[#E5E7EB]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURACIONES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Aviso de reset de respuestas */}
          {cambioFecha && (
            <div className="flex items-start gap-2 text-xs text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-2.5">
              <Info size={14} className="shrink-0 mt-0.5" />
              <span>
                Al cambiar la fecha u hora, las respuestas de los invitados se
                resetearán y se les pedirá reconfirmar asistencia.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Modalidad">
              <Select
                value={form.modalidad}
                onValueChange={(v: ModalidadEvento) => setField('modalidad', v)}
              >
                <SelectTrigger className="border-[#E5E7EB]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                  <SelectItem value="VIRTUAL">Virtual</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={form.modalidad === 'VIRTUAL' ? 'Enlace' : 'Ubicación'}>
              <Input
                placeholder={
                  form.modalidad === 'VIRTUAL'
                    ? 'https://meet.google.com/...'
                    : 'Sala de reuniones'
                }
                value={form.ubicacion}
                onChange={(e) => setField('ubicacion', e.target.value)}
                className="border-[#E5E7EB]"
              />
            </Field>
          </div>

          <Field label="Notas (opcional)">
            <Textarea
              value={form.descripcion}
              onChange={(e) => setField('descripcion', e.target.value)}
              className="border-[#E5E7EB] resize-none h-20"
              maxLength={1000}
            />
          </Field>

          {validacion && (
            <div className="flex items-start gap-2 text-xs text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-2.5">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{validacion}</span>
            </div>
          )}
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
              Volver
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || validacion !== null}
              className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Guardar cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-[#374151]">
        {label}
        {required && <span className="text-[#DC2626]"> *</span>}
      </Label>
      {children}
    </div>
  )
}

function fromEvento(evento: EventoResponse): FormState {
  const inicio = new Date(evento.fechaInicio)
  const fin = new Date(evento.fechaFin)
  const duracionMin = Math.round((fin.getTime() - inicio.getTime()) / 60_000)
  // Si la duracion del evento no coincide con uno de los presets, se elige el
  // mas cercano para que el select no quede sin valor.
  const duracion = DURACIONES.find((d) => Number(d.value) === duracionMin)?.value
    ?? closestDuracion(duracionMin)
  return {
    titulo: evento.titulo,
    descripcion: evento.descripcion ?? '',
    fecha: formatLocalDate(inicio),
    hora: formatLocalTime(inicio),
    duracion,
    modalidad: evento.modalidad,
    ubicacion: evento.ubicacion ?? '',
  }
}

function closestDuracion(min: number): string {
  let best = DURACIONES[0].value
  let bestDelta = Math.abs(Number(best) - min)
  for (const d of DURACIONES) {
    const delta = Math.abs(Number(d.value) - min)
    if (delta < bestDelta) {
      best = d.value
      bestDelta = delta
    }
  }
  return best
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatLocalTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toLocalIso(d: Date): string {
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
  )
}
