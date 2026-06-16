import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { AxiosError } from 'axios'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  alumnosService,
  contactosService,
  eventosService,
} from '@/lib/api'
import { toast } from '@/lib/toast'
import type {
  AlumnoResponse,
  ContactoResponse,
  ErrorResponse,
  ModalidadEvento,
  TipoEvento,
} from '@/types/api'

interface NuevoEventoDialogProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

interface FormState {
  tipo: TipoEvento | ''
  titulo: string
  descripcion: string
  alumnoId: string
  fecha: string
  hora: string
  duracion: string
  modalidad: ModalidadEvento
  ubicacion: string
  saaneeIds: number[]
}

const ESTADO_INICIAL: FormState = {
  tipo: '',
  titulo: '',
  descripcion: '',
  alumnoId: '',
  fecha: '',
  hora: '',
  duracion: '30',
  modalidad: 'PRESENCIAL',
  ubicacion: '',
  saaneeIds: [],
}

const DURACIONES: { value: string; label: string }[] = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1.5 horas' },
  { value: '120', label: '2 horas' },
]

export function NuevoEventoDialog({ open, onClose, onCreated }: NuevoEventoDialogProps) {
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [alumnos, setAlumnos] = useState<AlumnoResponse[]>([])
  const [loadingAlumnos, setLoadingAlumnos] = useState(false)

  const [contactos, setContactos] = useState<ContactoResponse[]>([])
  const [loadingContactos, setLoadingContactos] = useState(false)

  const [saaneeStaff, setSaaneeStaff] = useState<ContactoResponse[]>([])
  const [loadingSaanee, setLoadingSaanee] = useState(false)

  // Reset al abrir.
  useEffect(() => {
    if (open) {
      setForm(ESTADO_INICIAL)
      setSaveError(null)
    }
  }, [open])

  // Cargar alumnos accesibles cuando se abre el dialog.
  useEffect(() => {
    if (!open) return
    setLoadingAlumnos(true)
    alumnosService
      .listar()
      .then(setAlumnos)
      .catch(() => setAlumnos([]))
      .finally(() => setLoadingAlumnos(false))
  }, [open])

  // Cargar lista SAANEE cuando el tipo lo requiere.
  useEffect(() => {
    if (!open || form.tipo !== 'SOLICITUD_APOYO_SAANEE') return
    if (saaneeStaff.length > 0) return
    setLoadingSaanee(true)
    contactosService
      .listarSaaneeActivos()
      .then(setSaaneeStaff)
      .catch(() => setSaaneeStaff([]))
      .finally(() => setLoadingSaanee(false))
  }, [open, form.tipo, saaneeStaff.length])

  // Cargar contactos cuando se selecciona alumno + tipo REUNION_PADRES.
  useEffect(() => {
    if (!open || form.tipo !== 'REUNION_PADRES' || !form.alumnoId) {
      setContactos([])
      return
    }
    setLoadingContactos(true)
    contactosService
      .obtenerContactosDelAlumno(Number(form.alumnoId))
      .then((cs) => setContactos(cs.filter((c) => c.rol === 'PADRE')))
      .catch(() => setContactos([]))
      .finally(() => setLoadingContactos(false))
  }, [open, form.tipo, form.alumnoId])

  const alumnoSeleccionado = useMemo(
    () => alumnos.find((a) => String(a.id) === form.alumnoId) ?? null,
    [alumnos, form.alumnoId],
  )

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setSaveError(null)
  }, [])

  // Validacion final del form. El backend tambien valida; esto es para el
  // boton de submit y evitar request inutiles.
  const validacion = useMemo(() => {
    if (!form.tipo) return 'Selecciona el tipo de evento'
    if (!form.titulo.trim()) return 'Ingresa un titulo'
    if (!form.alumnoId) return 'Selecciona un estudiante'
    if (!form.fecha || !form.hora) return 'Indica fecha y hora'
    if (form.tipo === 'REUNION_PADRES' && contactos.length === 0 && !loadingContactos) {
      return 'El alumno no tiene familiares registrados; contacta al administrador'
    }
    if (form.tipo === 'SOLICITUD_APOYO_SAANEE' && form.saaneeIds.length === 0) {
      return 'Selecciona al menos un profesional SAANEE'
    }
    return null
  }, [form, contactos.length, loadingContactos])

  const handleSubmit = useCallback(async () => {
    if (validacion) return
    setSaving(true)
    setSaveError(null)
    try {
      const fechaInicio = new Date(`${form.fecha}T${form.hora}:00`)
      const fechaFin = new Date(fechaInicio.getTime() + Number(form.duracion) * 60_000)

      // Tesis: REUNION_PADRES auto-invita a todos los familiares devueltos
      // (decision del usuario). El backend soporta subset; aqui mandamos
      // todos para mantener la UI simple. SOLICITUD_APOYO_SAANEE usa la
      // seleccion explicita del docente.
      const invitadosUsuarioIds =
        form.tipo === 'REUNION_PADRES'
          ? contactos.map((c) => c.usuarioId)
          : form.saaneeIds

      await eventosService.crear({
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || null,
        fechaInicio: toLocalIso(fechaInicio),
        fechaFin: toLocalIso(fechaFin),
        tipoEvento: form.tipo as TipoEvento,
        modalidad: form.modalidad,
        ubicacion: form.ubicacion.trim() || null,
        alumnoId: Number(form.alumnoId),
        invitadosUsuarioIds,
      })

      toast.success('Evento creado')
      onCreated()
      onClose()
    } catch (err) {
      if (err instanceof AxiosError) {
        const apiError = err.response?.data as ErrorResponse | undefined
        setSaveError(apiError?.mensaje ?? err.message)
      } else {
        setSaveError('No se pudo crear el evento')
      }
    } finally {
      setSaving(false)
    }
  }, [validacion, form, contactos, onCreated, onClose])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-130 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#1E3A5F]">
            Nuevo evento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Tipo */}
          <div className="space-y-2">
            <Label className="text-sm text-[#374151] font-medium">
              Tipo de evento <span className="text-[#DC2626]">*</span>
            </Label>
            <div className="flex gap-2 flex-wrap">
              {(
                [
                  { id: 'REUNION_PADRES', label: 'Reunión con padres' },
                  { id: 'SOLICITUD_APOYO_SAANEE', label: 'Solicitud apoyo SAANEE' },
                ] as const
              ).map((t) => {
                const seleccionado = form.tipo === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setField('tipo', t.id)
                      setField('saaneeIds', [])
                    }}
                    className={`text-sm px-4 py-2 rounded-full border font-medium transition-colors ${
                      seleccionado
                        ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white'
                        : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#1E3A5F]'
                    }`}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Titulo */}
          <Field label="Título" required>
            <Input
              placeholder="Ej: Reunión con familia Rodríguez"
              value={form.titulo}
              onChange={(e) => setField('titulo', e.target.value)}
              className="border-[#E5E7EB]"
            />
          </Field>

          {/* Alumno */}
          <Field label="Estudiante" required>
            <Select
              value={form.alumnoId}
              onValueChange={(v) => setField('alumnoId', v)}
              disabled={loadingAlumnos || alumnos.length === 0}
            >
              <SelectTrigger className="border-[#E5E7EB]">
                <SelectValue
                  placeholder={loadingAlumnos ? 'Cargando…' : 'Selecciona un estudiante'}
                />
              </SelectTrigger>
              <SelectContent>
                {alumnos.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.nombre} {a.apellido} · {a.grado}
                    {a.seccion ? ` ${a.seccion}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Familiares (REUNION_PADRES) */}
          {form.tipo === 'REUNION_PADRES' && form.alumnoId && (
            <FamiliaresInvitados
              alumno={alumnoSeleccionado}
              contactos={contactos}
              loading={loadingContactos}
            />
          )}

          {/* SAANEE (SOLICITUD_APOYO_SAANEE) */}
          {form.tipo === 'SOLICITUD_APOYO_SAANEE' && (
            <SaaneeSelector
              staff={saaneeStaff}
              loading={loadingSaanee}
              seleccionados={form.saaneeIds}
              onToggle={(id) =>
                setField(
                  'saaneeIds',
                  form.saaneeIds.includes(id)
                    ? form.saaneeIds.filter((x) => x !== id)
                    : [...form.saaneeIds, id],
                )
              }
            />
          )}

          {/* Fecha / Hora / Duracion */}
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

          {/* Modalidad / Ubicacion */}
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

          {/* Descripcion */}
          <Field label="Notas (opcional)">
            <Textarea
              placeholder="Detalles adicionales del evento…"
              value={form.descripcion}
              onChange={(e) => setField('descripcion', e.target.value)}
              className="border-[#E5E7EB] resize-none h-20"
            />
          </Field>

          {/* Validacion / Error */}
          {validacion && (
            <div className="flex items-start gap-2 text-xs text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-2.5">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{validacion}</span>
            </div>
          )}
          {saveError && (
            <div className="flex items-start gap-2 text-xs text-[#7F1D1D] bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-2.5">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Footer */}
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
              disabled={saving || validacion !== null}
              className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Crear evento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

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

function FamiliaresInvitados({
  alumno,
  contactos,
  loading,
}: {
  alumno: AlumnoResponse | null
  contactos: ContactoResponse[]
  loading: boolean
}) {
  if (loading) {
    return <p className="text-xs text-[#6B7280]">Cargando familiares de {alumno?.nombre}…</p>
  }
  if (contactos.length === 0) {
    return (
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FEF3C7] border border-[#FDE68A]">
        <AlertCircle size={16} className="text-[#D97706] mt-0.5 shrink-0" />
        <p className="text-sm text-[#92400E]">
          Este estudiante no tiene familiares registrados. Contacta al administrador.
        </p>
      </div>
    )
  }
  return (
    <div className="space-y-2">
      <Label className="text-sm text-[#374151]">
        Familiares que serán invitados ({contactos.length})
      </Label>
      <div className="space-y-2">
        {contactos.map((c) => (
          <div
            key={c.usuarioId}
            className="flex items-center gap-3 p-2.5 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]"
          >
            <div>
              <p className="text-sm font-medium text-[#374151]">
                {c.nombre} {c.apellido}
              </p>
              <p className="text-xs text-[#9CA3AF]">{c.correo}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-[#9CA3AF] italic">
        Todos los familiares registrados son invitados automáticamente.
      </p>
    </div>
  )
}

function SaaneeSelector({
  staff,
  loading,
  seleccionados,
  onToggle,
}: {
  staff: ContactoResponse[]
  loading: boolean
  seleccionados: number[]
  onToggle: (id: number) => void
}) {
  if (loading) {
    return <p className="text-xs text-[#6B7280]">Cargando profesionales SAANEE…</p>
  }
  if (staff.length === 0) {
    return (
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FEF3C7] border border-[#FDE68A]">
        <AlertCircle size={16} className="text-[#D97706] mt-0.5 shrink-0" />
        <p className="text-sm text-[#92400E]">
          No hay profesionales SAANEE activos disponibles.
        </p>
      </div>
    )
  }
  return (
    <div className="space-y-2">
      <Label className="text-sm text-[#374151]">
        Profesional SAANEE <span className="text-[#DC2626]">*</span>
      </Label>
      <div className="space-y-2">
        {staff.map((s) => {
          const checked = seleccionados.includes(s.usuarioId)
          return (
            <label
              key={s.usuarioId}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] cursor-pointer hover:bg-[#F3F4F6]"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => onToggle(s.usuarioId)}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#374151]">
                  {s.nombre} {s.apellido}
                </p>
                <p className="text-xs text-[#9CA3AF]">{s.correo}</p>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convierte un Date local a una cadena ISO sin sufijo de zona horaria, que
 * Spring deserializa como LocalDateTime sin reinterpretarlo como UTC.
 */
function toLocalIso(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
  )
}
