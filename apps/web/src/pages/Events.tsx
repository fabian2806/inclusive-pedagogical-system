import { useState, useEffect } from "react"
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Video,
  User,
  X,
  Search,
  Check,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// ─── Tipos de evento ───────────────────────────────────────────────────────────
const EVENT_TYPES = [
  {
    id: "solicitud_saanee",
    label: "Solicitud de apoyo SAANEE",
    short: "SAANEE",
    color: { bg: "#FDF4FF", border: "#E879F9", text: "#A21CAF", badge: "bg-[#FDF4FF] text-[#A21CAF]" },
  },
  {
    id: "reunion_padres",
    label: "Reunión con padres",
    short: "Reunión",
    color: { bg: "#F0F9FF", border: "#7DD3FC", text: "#0284C7", badge: "bg-[#F0F9FF] text-[#0284C7]" },
  },
]

function getEventTypeConfig(type: string) {
  return EVENT_TYPES.find(t => t.id === type) ?? null
}

// ─── Datos mock ────────────────────────────────────────────────────────────────
const students = [
  {
    id: "1",
    name: "Sofía Rodríguez",
    grade: "3° Primaria",
    initials: "SR",
    family: [
      { id: "f1", name: "Elena Pérez de Rodríguez", relation: "Madre" },
      { id: "f2", name: "Juan Rodríguez Torres", relation: "Padre" },
    ],
  },
  {
    id: "2",
    name: "Carlos Mendoza",
    grade: "4° Primaria",
    initials: "CM",
    family: [
      { id: "f3", name: "Rosa Ruiz de Mendoza", relation: "Madre" },
      { id: "f4", name: "Jorge Mendoza Paredes", relation: "Padre" },
    ],
  },
  {
    id: "3",
    name: "Ana Torres",
    grade: "2° Primaria",
    initials: "AT",
    family: [],
  },
]

const saaneeStaff = [
  { id: "s1", name: "Roberto Quispe", specialty: "Especialista SAANEE", initials: "RQ" },
  { id: "s2", name: "Ana Flores",     specialty: "Psicóloga educativa",  initials: "AF" },
  { id: "s3", name: "Luis Ramírez",   specialty: "Terapista de lenguaje", initials: "LR" },
]

// "viewer" simulates who is currently looking at the app:
// "docente" = Prof. María Castro (creator), "saanee" = Roberto Quispe,
// "padre" = Elena Pérez (tiene eventos), "padre_vacio" = Rosa Mendoza (sin eventos)
// In a real app this would come from auth context.
type ViewerRole = "docente" | "saanee" | "padre" | "padre_vacio"

const DEMO_ROLES: { id: ViewerRole; label: string; subtitle: string }[] = [
  { id: "docente",     label: "Docente",             subtitle: "Prof. María Castro" },
  { id: "saanee",      label: "Especialista SAANEE",  subtitle: "Roberto Quispe" },
  { id: "padre",       label: "Familiar (con eventos)", subtitle: "Elena Pérez" },
  { id: "padre_vacio", label: "Familiar (sin eventos)", subtitle: "Rosa Mendoza" },
]

const initialEvents = [
  // ── Evento 1: Reunión padres — vista docente, una madre confirmó, padre pendiente
  {
    id: "1",
    title: "Reunión con familia Rodríguez",
    date: "2026-05-07",
    time: "10:00 AM",
    duration: "45 min",
    type: "reunion_padres",
    modality: "Presencial",
    location: "Sala de reuniones",
    student: "Sofía Rodríguez",
    studentId: "1",
    notes: "Revisar avances del trimestre y metas para el siguiente período.",
    participants: [
      { id: "f1", name: "Elena Pérez de Rodríguez", role: "Madre", status: "confirmado", confirmedAt: "28 Abr 2025", rejectReason: null },
      { id: "f2", name: "Juan Rodríguez Torres",    role: "Padre", status: "pendiente",  confirmedAt: null,            rejectReason: null },
    ],
    createdBy: "Prof. María Castro",
    status: "pendiente",
    viewerRole: "docente" as ViewerRole,
  },
  // ── Evento 2: Solicitud SAANEE — vista docente, SAANEE pendiente
  {
    id: "2",
    title: "Solicitud apoyo SAANEE — Carlos",
    date: "2026-05-08",
    time: "11:30 AM",
    duration: "30 min",
    type: "solicitud_saanee",
    modality: "Presencial",
    location: "Aula 3B",
    student: "Carlos Mendoza",
    studentId: "2",
    notes: "Evaluación de estrategias de comunicación con LSP.",
    participants: [
      { id: "s1", name: "Roberto Quispe", role: "Especialista SAANEE", status: "pendiente", confirmedAt: null, rejectReason: null },
    ],
    createdBy: "Prof. María Castro",
    status: "pendiente",
    viewerRole: "docente" as ViewerRole,
  },
  // ── Evento 3: Vista del SAANEE — pendiente de responder
  {
    id: "3",
    title: "Evaluación auditiva — Sofía Rodríguez",
    date: "2026-05-06",
    time: "9:00 AM",
    duration: "60 min",
    type: "solicitud_saanee",
    modality: "Presencial",
    location: "Sala SAANEE",
    student: "Sofía Rodríguez",
    studentId: "1",
    notes: "Revisión semestral del plan de atención y ajuste de estrategias de comunicación.",
    participants: [
      { id: "s1", name: "Roberto Quispe", role: "Especialista SAANEE", status: "pendiente", confirmedAt: null, rejectReason: null },
    ],
    createdBy: "Prof. María Castro",
    status: "pendiente",
    viewerRole: "saanee" as ViewerRole,
  },
  // ── Evento 4: Vista del padre — pendiente de responder
  {
    id: "4",
    title: "Reunión de seguimiento — Carlos Mendoza",
    date: "2026-05-09",
    time: "3:00 PM",
    duration: "45 min",
    type: "reunion_padres",
    modality: "Presencial",
    location: "Sala de reuniones",
    student: "Carlos Mendoza",
    studentId: "2",
    notes: "Presentación de los avances del bimestre y coordinación de estrategias en casa.",
    participants: [
      { id: "f3", name: "Rosa Ruiz de Mendoza",   role: "Madre", status: "pendiente", confirmedAt: null, rejectReason: null },
      { id: "f4", name: "Jorge Mendoza Paredes",   role: "Padre", status: "pendiente", confirmedAt: null, rejectReason: null },
    ],
    createdBy: "Prof. María Castro",
    status: "pendiente",
    viewerRole: "padre" as ViewerRole,
  },
  // ── Evento 5: Confirmado — vista docente
  {
    id: "5",
    title: "Taller de estrategias LSP — Ana Torres",
    date: "2026-05-05",
    time: "2:00 PM",
    duration: "60 min",
    type: "solicitud_saanee",
    modality: "Virtual",
    location: "https://meet.google.com/abc-defg",
    student: "Ana Torres",
    studentId: "3",
    notes: "Revisión de técnicas de comunicación visual y señas básicas con la docente.",
    participants: [
      { id: "s2", name: "Ana Flores", role: "Psicóloga educativa", status: "confirmado", confirmedAt: "5 May 2025", rejectReason: null },
    ],
    createdBy: "Prof. María Castro",
    status: "confirmado",
    viewerRole: "docente" as ViewerRole,
  },
  // ── Evento 6: Rechazado con motivo y fecha — vista docente
  {
    id: "6",
    title: "Reunión bimestral — Familia Torres",
    date: "2026-05-04",
    time: "11:00 AM",
    duration: "30 min",
    type: "reunion_padres",
    modality: "Presencial",
    location: "Sala de reuniones",
    student: "Ana Torres",
    studentId: "3",
    notes: "Seguimiento del plan de comunicación establecido al inicio del año.",
    participants: [
      { id: "f5", name: "Carmen Torres Vidal", role: "Madre", status: "rechazado", confirmedAt: "3 May 2025", rejectReason: "No tengo disponibilidad ese día" },
    ],
    createdBy: "Prof. María Castro",
    status: "rechazado",
    viewerRole: "docente" as ViewerRole,
  },
]

const pastEvents = [
  {
    id: "p1",
    title: "Reunión inicio de año — Familia Rodríguez",
    date: "2025-03-10",
    time: "10:00 AM",
    type: "reunion_padres",
    student: "Sofía Rodríguez",
    status: "completado",
  },
  {
    id: "p2",
    title: "Apoyo SAANEE — Evaluación comunicación",
    date: "2025-03-05",
    time: "11:00 AM",
    type: "solicitud_saanee",
    student: "Sofía Rodríguez",
    status: "completado",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatusStyle(status: string) {
  switch (status) {
    case "confirmado":  return { bg: "bg-[#D1FAE5]", text: "text-[#059669]", label: "Confirmado" }
    case "pendiente":   return { bg: "bg-[#FEF3C7]", text: "text-[#D97706]", label: "Pendiente" }
    case "rechazado":   return { bg: "bg-[#FEE2E2]", text: "text-[#DC2626]", label: "Rechazado" }
    case "completado":  return { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", label: "Completado" }
    case "cancelado":   return { bg: "bg-[#FEE2E2]", text: "text-[#DC2626]", label: "Cancelado" }
    default:            return { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", label: status }
  }
}

function getInitialsColor(initials: string) {
  const colors = ["bg-[#3B82F6]", "bg-[#8B5CF6]", "bg-[#059669]", "bg-[#D97706]", "bg-[#DC2626]", "bg-[#0284C7]"]
  const idx = initials.charCodeAt(0) % colors.length
  return colors[idx]
}

function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "w-6 h-6 text-[10px]" : size === "lg" ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs"
  return (
    <div className={`${sizeClass} rounded-full ${getInitialsColor(initials)} flex items-center justify-center shrink-0`}>
      <span className="text-white font-semibold">{initials}</span>
    </div>
  )
}

// ─── Modal de detalle del evento ──────────────────────────────────────────────
type EventDetail = typeof initialEvents[0]

const REJECT_REASONS = [
  "No tengo disponibilidad ese día",
  "Necesito más tiempo para preparar la reunión",
  "Otro",
]

function EventDetailModal({
  event,
  viewerRole,
  onClose,
  onUpdate,
}: {
  event: EventDetail
  viewerRole: ViewerRole
  onClose: () => void
  onUpdate: (updated: EventDetail) => void
}) {
  const typeConfig = getEventTypeConfig(event.type)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectCustom, setRejectCustom] = useState("")

  // For participant views, find the current viewer's participant entry
  const viewerParticipantId = viewerRole === "saanee" ? "s1"
    : (viewerRole === "padre" || viewerRole === "padre_vacio") ? "f3"
    : null
  const viewerParticipant = viewerParticipantId
    ? event.participants.find((p: any) => p.id === viewerParticipantId) ?? event.participants[0]
    : null
  const viewerAlreadyResponded = viewerParticipant && viewerParticipant.status !== "pendiente"

  // Rejected event info
  const rejectedParticipant = event.participants.find((p: any) => p.status === "rechazado")

  const handleConfirmAttendance = () => {
    const updated = {
      ...event,
      status: "confirmado",
      participants: event.participants.map((p: any) =>
        p.id === viewerParticipant?.id
          ? { ...p, status: "confirmado", confirmedAt: new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }) }
          : p
      ),
    }
    onUpdate(updated)
  }

  const handleConfirmReject = () => {
    const reason = rejectReason === "Otro" ? rejectCustom : rejectReason
    const updated = {
      ...event,
      status: "rechazado",
      participants: event.participants.map((p: any) =>
        p.id === viewerParticipant?.id
          ? { ...p, status: "rechazado", confirmedAt: new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }), rejectReason: reason }
          : p
      ),
    }
    onUpdate(updated)
    setShowRejectModal(false)
  }

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-145 max-h-[90vh] overflow-y-auto p-0">
          {/* Header */}
          <div
            className="px-6 pt-6 pb-4 border-b border-[#E5E7EB]"
            style={{ borderLeft: `4px solid ${typeConfig?.color.border ?? "#E5E7EB"}` }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                {typeConfig && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeConfig.color.badge}`}
                    style={{ backgroundColor: typeConfig.color.bg, color: typeConfig.color.text }}>
                    {typeConfig.label}
                  </span>
                )}
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusStyle(event.status).bg} ${getStatusStyle(event.status).text}`}>
                  {getStatusStyle(event.status).label}
                </span>
                {viewerRole !== "docente" && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB]">
                    {viewerRole === "saanee" ? "Vista: Especialista SAANEE" : "Vista: Familiar"}
                  </span>
                )}
              </div>
            </div>
            <h2 className="text-lg font-bold text-[#1E3A5F]">{event.title}</h2>
            <p className="text-xs text-[#9CA3AF] mt-1">Creado por {(event as any).createdBy}</p>
          </div>

          <div className="px-6 py-4 space-y-5">
            {/* Alerta de rechazo — sección destacada */}
            {event.status === "rechazado" && rejectedParticipant && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-[#FEF2F2] border border-[#FECACA]">
                <AlertCircle size={18} className="text-[#DC2626] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#DC2626]">Invitación rechazada</p>
                  <p className="text-xs text-[#7F1D1D]">
                    <span className="font-medium">{rejectedParticipant.name}</span> rechazó el{" "}
                    <span className="font-medium">{rejectedParticipant.confirmedAt}</span>
                  </p>
                  {rejectedParticipant.rejectReason && (
                    <p className="text-xs text-[#991B1B]">
                      Motivo: <span className="italic">&quot;{rejectedParticipant.rejectReason}&quot;</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Info principal */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#F9FAFB] space-y-0.5">
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Fecha y hora</p>
                <p className="text-sm text-[#374151] font-medium">
                  {event.date.split("-").reverse().join("/")} · {event.time}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#F9FAFB] space-y-0.5">
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Duración</p>
                <p className="text-sm text-[#374151] font-medium">{(event as any).duration ?? "—"}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#F9FAFB] space-y-0.5">
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Modalidad</p>
                <p className="text-sm text-[#374151] font-medium">{(event as any).modality ?? "Presencial"}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#F9FAFB] space-y-0.5">
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">
                  {(event as any).location?.includes("http") ? "Enlace" : "Ubicación"}
                </p>
                <p className="text-sm text-[#374151] font-medium">{(event as any).location ?? "Por definir"}</p>
              </div>
            </div>

            {/* Estudiante */}
            <div>
              <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">Estudiante</p>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]">
                <Avatar initials={event.student.split(" ").map((n: string) => n[0]).join("").slice(0, 2)} size="sm" />
                <span className="text-sm font-medium text-[#1E3A5F]">{event.student}</span>
              </div>
            </div>

            {/* Participantes */}
            <div>
              <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">Participantes</p>
              <div className="space-y-2">
                {event.participants.map((p: any, idx: number) => {
                  const st = getStatusStyle(p.status)
                  const isViewerEntry = viewerParticipant && p.id === viewerParticipant.id
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg border bg-white ${isViewerEntry ? "border-[#BFDBFE] ring-1 ring-[#BFDBFE]" : "border-[#E5E7EB]"}`}
                    >
                      <Avatar initials={p.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-[#374151]">{p.name}</p>
                          {isViewerEntry && <span className="text-[10px] text-[#2563EB] font-medium">(tú)</span>}
                        </div>
                        <p className="text-xs text-[#9CA3AF]">{p.role}</p>
                        {p.confirmedAt && p.status === "confirmado" && (
                          <p className="text-[11px] text-[#059669]">Confirmó el {p.confirmedAt}</p>
                        )}
                        {p.confirmedAt && p.status === "rechazado" && (
                          <p className="text-[11px] text-[#DC2626]">Rechazó el {p.confirmedAt}</p>
                        )}
                      </div>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                        {st.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Notas */}
            {event.notes && (
              <div>
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">Notas</p>
                <p className="text-sm text-[#374151] leading-relaxed p-3 rounded-lg bg-[#F9FAFB]">{event.notes}</p>
              </div>
            )}
          </div>

          {/* Footer acciones */}
          <div className="px-6 py-4 border-t border-[#E5E7EB]">
            {(viewerRole === "docente") ? (
              /* Docente: editar / cancelar */
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" className="text-[#DC2626] border-[#FECACA] hover:bg-[#FEF2F2] text-xs">
                  Cancelar evento
                </Button>
                <Button size="sm" className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white text-xs">
                  Editar evento
                </Button>
              </div>
            ) : viewerAlreadyResponded ? (
              /* Participante que ya respondió */
              <div className="flex items-center gap-2 justify-center py-1">
                {viewerParticipant?.status === "confirmado" ? (
                  <>
                    <Check size={15} className="text-[#059669]" />
                    <p className="text-sm text-[#059669] font-medium">Ya confirmaste tu asistencia</p>
                  </>
                ) : (
                  <>
                    <X size={15} className="text-[#DC2626]" />
                    <p className="text-sm text-[#DC2626] font-medium">Ya rechazaste esta invitación</p>
                  </>
                )}
              </div>
            ) : (
              /* Participante pendiente */
              <div className="space-y-2">
                <p className="text-xs text-[#6B7280] text-center mb-3">
                  {viewerRole === "saanee"
                    ? "El docente solicita tu participación en este apoyo."
                    : "El docente te invita a esta reunión de seguimiento."}
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRejectModal(true)}
                    className="text-[#DC2626] border-[#FECACA] hover:bg-[#FEF2F2] text-xs"
                  >
                    Rechazar invitación
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirmAttendance}
                    className="bg-[#059669] hover:bg-[#047857] text-white text-xs gap-1.5"
                  >
                    <Check size={13} />
                    Confirmar asistencia
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-modal rechazo */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="sm:max-w-95">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[#1E3A5F]">
              {"¿Por qué rechazas la invitación?"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Select value={rejectReason} onValueChange={setRejectReason}>
              <SelectTrigger className="border-[#E5E7EB]">
                <SelectValue placeholder="Seleccionar motivo" />
              </SelectTrigger>
              <SelectContent>
                {REJECT_REASONS.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {rejectReason === "Otro" && (
              <Textarea
                placeholder="Describe el motivo..."
                value={rejectCustom}
                onChange={e => setRejectCustom(e.target.value)}
                className="border-[#E5E7EB] resize-none h-20 text-sm"
              />
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setShowRejectModal(false)} className="border-[#E5E7EB] text-xs">
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmReject}
                disabled={!rejectReason || (rejectReason === "Otro" && !rejectCustom.trim())}
                className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs"
              >
                Confirmar rechazo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Events() {
  const [currentWeek, setCurrentWeek]     = useState(0)
  const [isDialogOpen, setIsDialogOpen]   = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null)
  const [events, setEvents]               = useState(initialEvents)
  const [mounted, setMounted]             = useState(false)
  const [saaneeSearch, setSaaneeSearch]   = useState("")
  const [demoViewer, setDemoViewer]       = useState<ViewerRole>("docente")

  // Filter events by the current demo viewer role
  const visibleEvents = demoViewer === "padre_vacio"
    ? []
    : demoViewer === "docente"
    ? events.filter(e => (e as any).viewerRole === "docente")
    : events.filter(e => (e as any).viewerRole === demoViewer)

  const [newEvent, setNewEvent] = useState({
    title:       "",
    type:        "",
    date:        "",
    time:        "",
    duration:    "30",
    modality:    "Presencial",
    location:    "",
    studentId:   "",
    saaneeId:    "",
    description: "",
  })

  useEffect(() => { setMounted(true) }, [])

  const selectedStudent  = students.find(s => s.id === newEvent.studentId) ?? null
  const selectedSaanee   = saaneeStaff.find(s => s.id === newEvent.saaneeId) ?? null
  const filteredSaanee   = saaneeSearch
    ? saaneeStaff.filter(s => s.name.toLowerCase().includes(saaneeSearch.toLowerCase()) || s.specialty.toLowerCase().includes(saaneeSearch.toLowerCase()))
    : saaneeStaff
  const [saaneeOpen, setSaaneeOpen] = useState(false)

  const noFamilyWarning =
    newEvent.type === "reunion_padres" &&
    selectedStudent &&
    selectedStudent.family.length === 0

  const isFormValid =
    newEvent.title.trim() &&
    newEvent.type &&
    newEvent.date &&
    newEvent.time &&
    newEvent.studentId &&
    (newEvent.type !== "solicitud_saanee" || newEvent.saaneeId) &&
    !noFamilyWarning

  const formatDuration = (minutes: string) => {
    const min = parseInt(minutes)
    if (min < 60) return `${min} min`
    if (min === 60) return "1 hr"
    if (min === 90) return "1.5 hrs"
    return `${min / 60} hrs`
  }

  const formatTime = (time: string) => {
    if (!time) return ""
    const [hours, minutes] = time.split(":")
    const h = parseInt(hours)
    const ampm = h >= 12 ? "PM" : "AM"
    const hour12 = h % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const handleCreateEvent = () => {
    if (!isFormValid) return
    const student = students.find(s => s.id === newEvent.studentId)!
    const saanee  = saaneeStaff.find(s => s.id === newEvent.saaneeId)

  const participants =
  newEvent.type === "solicitud_saanee" && saanee
  ? [{ id: saanee.id, name: saanee.name, role: saanee.specialty, status: "pendiente", confirmedAt: null, rejectReason: null }]
  : newEvent.type === "reunion_padres"
  ? student.family.map(f => ({ id: f.id, name: f.name, role: f.relation, status: "pendiente", confirmedAt: null, rejectReason: null }))
  : []

    const event: EventDetail = {
      id:           Date.now().toString(),
      title:        newEvent.title,
      date:         newEvent.date,
      time:         formatTime(newEvent.time),
      duration:     formatDuration(newEvent.duration),
      type:         newEvent.type,
      modality:     newEvent.modality,
      location:     newEvent.location || "Por definir",
      student:      student.name,
      studentId:    student.id,
      notes:        newEvent.description,
      participants,
      createdBy:    "Prof. María Castro",
      status:       "pendiente",
      viewerRole:   "docente" as ViewerRole,
    }

    setEvents([event, ...events])
    setIsDialogOpen(false)
    setNewEvent({ title: "", type: "", date: "", time: "", duration: "30", modality: "Presencial", location: "", studentId: "", saaneeId: "", description: "" })
    setSaaneeSearch("")
  }

  const handleUpdateEvent = (updated: EventDetail) => {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
    setSelectedEvent(updated)
  }

  // Week calendar
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + 1 + currentWeek * 7)
  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    return day
  })
  const formatDate = (date: Date) =>
    date.toLocaleDateString("es-PE", { weekday: "short", day: "numeric" })
  const isToday = (date: Date) => {
    if (!mounted) return false
    return date.toDateString() === new Date().toDateString()
  }
  const timeToMinutes = (time: string) => {
    if (!time) return 0
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)?/i)
    if (!match) return 0
    let hours = parseInt(match[1])
    const minutes = parseInt(match[2])
    const period = match[3]?.toUpperCase()
    if (period === "PM" && hours !== 12) hours += 12
    if (period === "AM" && hours === 12) hours = 0
    return hours * 60 + minutes
  }
  const sortByTime = (list: typeof events) =>
    [...list].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Eventos</h1>
          <p className="text-sm text-[#6B7280]">Gestiona reuniones y solicitudes de apoyo SAANEE.</p>
        </div>
        {demoViewer === "docente" && (
          <Button className="gap-2 bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white" onClick={() => setIsDialogOpen(true)}>
            <Plus size={16} />
            Nuevo evento
          </Button>
        )}
      </div>

      {/* Demo role switcher */}
      <div className="flex items-start gap-3 p-3 rounded-lg border border-dashed border-[#D1D5DB] bg-[#F9FAFB]">
        <div className="shrink-0 mt-0.5">
          <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-1">Vista demo</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DEMO_ROLES.map(r => (
            <button
              key={r.id}
              onClick={() => setDemoViewer(r.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all flex flex-col items-start leading-tight ${
                demoViewer === r.id
                  ? "bg-[#1E3A5F] border-[#1E3A5F] text-white"
                  : "bg-white border-[#E5E7EB] text-[#374151] hover:border-[#1E3A5F]"
              }`}
            >
              <span className="font-medium">{r.label}</span>
              <span className={`text-[10px] ${demoViewer === r.id ? "text-[#93C5FD]" : "text-[#9CA3AF]"}`}>{r.subtitle}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Week calendar */}
      <Card className="border-[#E5E7EB]">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentWeek(w => w - 1)}>
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm font-medium text-[#1E3A5F]">
              {weekDays[0].toLocaleDateString("es-PE", { month: "long", year: "numeric" })}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentWeek(w => w + 1)}>
              <ChevronRight size={16} />
            </Button>
            {currentWeek !== 0 && (
              <Button variant="ghost" size="sm" className="text-xs text-[#3B82F6]" onClick={() => setCurrentWeek(0)}>
                Hoy
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {weekDays.map((day, idx) => (
              <div
                key={idx}
                className={`text-center p-2 rounded-lg ${isToday(day) ? "bg-[#1E3A5F] text-white" : "bg-[#F9FAFB] text-[#374151]"}`}
              >
                <p className="text-xs font-medium capitalize">{formatDate(day)}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2 min-h-40">
            {weekDays.map((day, idx) => {
              const dayEvents = sortByTime(visibleEvents.filter(e => e.date === day.toISOString().split("T")[0]))
              return (
                <div key={idx} className="space-y-1.5">
                  {dayEvents.length > 0
                    ? dayEvents.map(ev => {
                        const tc = getEventTypeConfig(ev.type)
                        return (
                          <div
                            key={ev.id}
                            onClick={() => setSelectedEvent(ev)}
                            className="p-2 rounded-lg border-l-2 cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: tc?.color.bg ?? "#F9FAFB", borderColor: tc?.color.border ?? "#E5E7EB" }}
                          >
                            <p className="text-[11px] font-medium text-[#1E3A5F] line-clamp-2">{ev.title}</p>
                            <p className="text-[10px] text-[#6B7280] mt-0.5">{ev.time}</p>
                          </div>
                        )
                      })
                    : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-[10px] text-[#9CA3AF]">Sin eventos</p>
                      </div>
                    )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lists */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#1E3A5F] flex items-center gap-2">
              <Calendar size={18} className="text-[#3B82F6]" />
              Próximos eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {visibleEvents.length === 0 ? (
              <div className="flex flex-col items-center py-12 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] border-2 border-dashed border-[#D1D5DB] flex items-center justify-center mb-4">
                  <Calendar size={28} className="text-[#D1D5DB]" />
                </div>
                <p className="text-sm font-semibold text-[#374151] mb-1">Sin eventos programados</p>
                <p className="text-xs text-[#9CA3AF] leading-relaxed max-w-55">
                  {demoViewer === "padre_vacio"
                    ? "El docente aún no ha programado ninguna reunión contigo."
                    : "No tienes eventos asignados por el momento."}
                </p>
                {demoViewer === "docente" && (
                  <Button
                    size="sm"
                    className="mt-4 bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white text-xs gap-1.5"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Plus size={13} />
                    Crear primer evento
                  </Button>
                )}
              </div>
            ) : sortByTime(visibleEvents).map(ev => {
              const tc = getEventTypeConfig(ev.type)
              const st = getStatusStyle(ev.status)
              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow"
                  style={{ backgroundColor: tc?.color.bg ?? "#F9FAFB", borderColor: tc?.color.border ?? "#E5E7EB" }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tc?.color.badge ?? ""}`}>
                      {tc?.short ?? "Otro"}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                      {st.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#1E3A5F] mb-2">{ev.title}</p>
                  <div className="flex flex-wrap gap-3 text-[11px] text-[#6B7280]">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {ev.date.split("-").reverse().join("/")} · {ev.time}
                    </span>
                    <span className="flex items-center gap-1">
                      {ev.location?.includes("Virtual") ? <Video size={12} /> : <MapPin size={12} />}
                      {ev.location}
                    </span>
                  </div>
                  {ev.student && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-[#2563EB]">
                      <User size={12} />
                      {ev.student}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Past */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#1E3A5F] flex items-center gap-2">
              <Clock size={18} className="text-[#6B7280]" />
              Eventos pasados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pastEvents.map(ev => {
              const tc = getEventTypeConfig(ev.type)
              return (
                <div key={ev.id} className="p-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280]">
                      {tc?.short ?? "Otro"}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF]">Completado</span>
                  </div>
                  <p className="text-sm font-medium text-[#374151] mb-1">{ev.title}</p>
                  <p className="text-[11px] text-[#9CA3AF]">
                    {ev.date.split("-").reverse().join("/")} · {ev.time}
                  </p>
                </div>
              )
            })}
            <Button variant="ghost" size="sm" className="w-full text-[#6B7280] text-xs">
              Ver historial completo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ─── Modal detalle ─────────────────────────────────────────────────────── */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          viewerRole={demoViewer}
          onClose={() => setSelectedEvent(null)}
          onUpdate={handleUpdateEvent}
        />
      )}

      {/* ─── Modal nuevo evento ────────────────────────────────────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-130 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1E3A5F]">Nuevo evento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Tipo de evento — chips */}
            <div className="space-y-2">
              <Label className="text-sm text-[#374151] font-medium">
                Tipo de evento <span className="text-[#DC2626]">*</span>
              </Label>
              <div className="flex gap-2 flex-wrap">
                {EVENT_TYPES.map(t => {
                  const selected = newEvent.type === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewEvent(f => ({ ...f, type: t.id, saaneeId: "" }))}
                      className="text-sm px-4 py-2 rounded-full border transition-all font-medium"
                      style={selected ? {
                        backgroundColor: t.color.bg,
                        borderColor: t.color.border,
                        color: t.color.text,
                        boxShadow: `0 0 0 2px ${t.color.border}`,
                      } : {
                        backgroundColor: "white",
                        borderColor: "#E5E7EB",
                        color: "#6B7280",
                      }}
                    >
                      {t.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Título */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm text-[#374151]">
                Título <span className="text-[#DC2626]">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ej: Reunión con familia Rodríguez"
                value={newEvent.title}
                onChange={e => setNewEvent(f => ({ ...f, title: e.target.value }))}
                className="border-[#E5E7EB]"
              />
            </div>

            {/* Estudiante — obligatorio */}
            <div className="space-y-1.5">
              <Label className="text-sm text-[#374151]">
                Estudiante <span className="text-[#DC2626]">*</span>
              </Label>
              <Select value={newEvent.studentId} onValueChange={v => setNewEvent(f => ({ ...f, studentId: v }))}>
                <SelectTrigger className="border-[#E5E7EB]">
                  <SelectValue placeholder="Seleccionar estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-[#9CA3AF] text-xs">· {s.grade}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campos dinámicos por tipo */}
            {newEvent.type === "solicitud_saanee" && (
              <div className="space-y-1.5">
                <Label className="text-sm text-[#374151]">
                  Profesional SAANEE <span className="text-[#DC2626]">*</span>
                </Label>
                <div className="relative">
                  <div
                    className="flex items-center gap-2 border border-[#E5E7EB] rounded-md px-3 h-9 cursor-pointer bg-white"
                    onClick={() => setSaaneeOpen(o => !o)}
                  >
                    <Search size={14} className="text-[#9CA3AF] shrink-0" />
                    {selectedSaanee ? (
                      <span className="text-sm text-[#374151]">{selectedSaanee.name} — {selectedSaanee.specialty}</span>
                    ) : (
                      <span className="text-sm text-[#9CA3AF]">Buscar profesional...</span>
                    )}
                  </div>
                  {saaneeOpen && (
                    <div className="absolute z-50 top-10 left-0 right-0 bg-white border border-[#E5E7EB] rounded-md shadow-lg">
                      <div className="p-2 border-b border-[#E5E7EB]">
                        <Input
                          placeholder="Buscar por nombre o especialidad"
                          value={saaneeSearch}
                          onChange={e => setSaaneeSearch(e.target.value)}
                          className="border-[#E5E7EB] h-8 text-sm"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredSaanee.length === 0 ? (
                          <p className="text-sm text-[#9CA3AF] text-center py-4">Sin resultados</p>
                        ) : filteredSaanee.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setNewEvent(f => ({ ...f, saaneeId: s.id }))
                              setSaaneeOpen(false)
                              setSaaneeSearch("")
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F9FAFB] transition-colors text-left"
                          >
                            <div className={`w-8 h-8 rounded-full ${getInitialsColor(s.initials)} flex items-center justify-center shrink-0`}>
                              <span className="text-white text-xs font-semibold">{s.initials}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#374151]">{s.name}</p>
                              <p className="text-xs text-[#9CA3AF]">{s.specialty}</p>
                            </div>
                            {newEvent.saaneeId === s.id && <Check size={14} className="ml-auto text-[#059669]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {newEvent.type === "reunion_padres" && newEvent.studentId && (
              <div className="space-y-2">
                <Label className="text-sm text-[#374151]">Familiares que ser&aacute;n invitados</Label>
                {noFamilyWarning ? (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FEF3C7] border border-[#FDE68A]">
                    <AlertCircle size={16} className="text-[#D97706] mt-0.5 shrink-0" />
                    <p className="text-sm text-[#92400E]">
                      Este estudiante no tiene familiares registrados. Contacta al administrador para registrarlos.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedStudent!.family.map(f => (
                      <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
                        <div className={`w-8 h-8 rounded-full ${getInitialsColor(f.name.split(" ").map(n => n[0]).join("").slice(0, 2))} flex items-center justify-center shrink-0`}>
                          <span className="text-white text-xs font-semibold">
                            {f.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#374151]">{f.name}</p>
                          <p className="text-xs text-[#9CA3AF]">({f.relation})</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fecha, Hora, Duración */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-sm text-[#374151]">
                  Fecha <span className="text-[#DC2626]">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={e => setNewEvent(f => ({ ...f, date: e.target.value }))}
                  className="border-[#E5E7EB]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time" className="text-sm text-[#374151]">
                  Hora <span className="text-[#DC2626]">*</span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={newEvent.time}
                  onChange={e => setNewEvent(f => ({ ...f, time: e.target.value }))}
                  className="border-[#E5E7EB]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-[#374151]">Duración</Label>
                <Select value={newEvent.duration} onValueChange={v => setNewEvent(f => ({ ...f, duration: v }))}>
                  <SelectTrigger className="border-[#E5E7EB]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1.5 horas</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Modalidad y Ubicación */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm text-[#374151]">Modalidad</Label>
                <Select value={newEvent.modality} onValueChange={v => setNewEvent(f => ({ ...f, modality: v }))}>
                  <SelectTrigger className="border-[#E5E7EB]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                    <SelectItem value="Virtual">Virtual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-sm text-[#374151]">Ubicación / Enlace</Label>
                <Input
                  id="location"
                  placeholder={newEvent.modality === "Virtual" ? "https://meet.google.com/..." : "Sala de reuniones"}
                  value={newEvent.location}
                  onChange={e => setNewEvent(f => ({ ...f, location: e.target.value }))}
                  className="border-[#E5E7EB]"
                />
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm text-[#374151]">Notas (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Detalles adicionales del evento..."
                value={newEvent.description}
                onChange={e => setNewEvent(f => ({ ...f, description: e.target.value }))}
                className="border-[#E5E7EB] resize-none h-20"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[#E5E7EB] text-[#374151]">
                Cancelar
              </Button>
              <Button
                className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white"
                disabled={!isFormValid}
                onClick={handleCreateEvent}
              >
                Crear evento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
