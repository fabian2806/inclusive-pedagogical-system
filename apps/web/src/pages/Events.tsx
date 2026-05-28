import { useCallback, useMemo, useState } from 'react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  User,
  Video,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { NuevoEventoDialog } from '@/components/events/NuevoEventoDialog'
import { useApiQuery } from '@/hooks/useApiQuery'
import { useAuth } from '@/hooks/useAuth'
import { eventosService } from '@/lib/api'
import type {
  EstadoAsistencia,
  EstadoEvento,
  EventoResponse,
  EventoUsuarioResponse,
  TipoEvento,
} from '@/types/api'

// ─── Catalogo de tipos de evento ──────────────────────────────────────────────
// Mantiene el lookup visual (color + label) desacoplado del enum del backend.

type TipoEventoConfig = {
  label: string
  short: string
  bg: string
  border: string
  text: string
  badge: string
}

const TIPO_EVENTO_CONFIG: Record<TipoEvento, TipoEventoConfig> = {
  SOLICITUD_APOYO_SAANEE: {
    label: 'Solicitud de apoyo SAANEE',
    short: 'SAANEE',
    bg: '#FDF4FF',
    border: '#E879F9',
    text: '#A21CAF',
    badge: 'bg-[#FDF4FF] text-[#A21CAF]',
  },
  REUNION_PADRES: {
    label: 'Reunión con padres',
    short: 'Reunión',
    bg: '#F0F9FF',
    border: '#7DD3FC',
    text: '#0284C7',
    badge: 'bg-[#F0F9FF] text-[#0284C7]',
  },
}

// ─── Estilos por estado del evento ────────────────────────────────────────────

function getEstadoEventoStyle(estado: EstadoEvento) {
  switch (estado) {
    case 'ACTIVO':
      return { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', label: 'Activo' }
    case 'FINALIZADO':
      return { bg: 'bg-[#D1FAE5]', text: 'text-[#059669]', label: 'Finalizado' }
    case 'CANCELADO':
      return { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', label: 'Cancelado' }
  }
}

function getEstadoAsistenciaStyle(estado: EstadoAsistencia) {
  switch (estado) {
    case 'CONFIRMADO':
      return { bg: 'bg-[#D1FAE5]', text: 'text-[#059669]', label: 'Confirmado' }
    case 'RECHAZADO':
      return { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', label: 'Rechazado' }
    case 'PENDIENTE':
      return { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', label: 'Pendiente' }
  }
}

// ─── Helpers de fecha / iniciales ─────────────────────────────────────────────

function iniciales(nombre: string, apellido?: string): string {
  const inicial = (s: string) => (s.trim().charAt(0) || '').toUpperCase()
  return (inicial(nombre) + (apellido ? inicial(apellido) : '')).slice(0, 2) || '??'
}

const COLORES_AVATAR = [
  'bg-[#3B82F6]',
  'bg-[#8B5CF6]',
  'bg-[#059669]',
  'bg-[#D97706]',
  'bg-[#DC2626]',
  'bg-[#0284C7]',
]

function colorAvatar(seed: string): string {
  return COLORES_AVATAR[(seed.charCodeAt(0) || 0) % COLORES_AVATAR.length]
}

function Avatar({ iniciales: iniText, size = 'md' }: { iniciales: string; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'
  return (
    <div
      className={`${sizeClass} rounded-full ${colorAvatar(iniText)} flex items-center justify-center shrink-0`}
    >
      <span className="text-white font-semibold">{iniText}</span>
    </div>
  )
}

function formatearFechaHora(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatearHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

function mismaFecha(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString()
}

function inicioDeSemana(referencia: Date, offsetSemanas: number): Date {
  const d = new Date(referencia)
  // Lunes como inicio: ajusta a -(getDay()-1), con domingo=0 -> retrocede 6.
  const diaSemana = d.getDay()
  const diff = diaSemana === 0 ? -6 : 1 - diaSemana
  d.setDate(d.getDate() + diff + offsetSemanas * 7)
  d.setHours(0, 0, 0, 0)
  return d
}

// ─── Modal de detalle (read-only en 4d.2) ─────────────────────────────────────
// Las acciones (responder, editar, cancelar, registrar resultado) se conectan
// en los sub-bloques siguientes; aqui solo se muestra la info real.

function EventoDetailModal({
  evento,
  onClose,
}: {
  evento: EventoResponse
  onClose: () => void
}) {
  const tipo = TIPO_EVENTO_CONFIG[evento.tipoEvento]
  const estadoStyle = getEstadoEventoStyle(evento.estado)
  const esVirtual = evento.modalidad === 'VIRTUAL'

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-145 max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div
          className="px-6 pt-6 pb-4 border-b border-[#E5E7EB]"
          style={{ borderLeft: `4px solid ${tipo.border}` }}
        >
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: tipo.bg, color: tipo.text }}
            >
              {tipo.label}
            </span>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${estadoStyle.bg} ${estadoStyle.text}`}
            >
              {estadoStyle.label}
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#1E3A5F]">{evento.titulo}</h2>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Creado por {evento.usuarioCreador.nombre} {evento.usuarioCreador.apellido}
          </p>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Aviso de cancelacion */}
          {evento.estado === 'CANCELADO' && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-[#FEF2F2] border border-[#FECACA]">
              <AlertCircle size={18} className="text-[#DC2626] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#DC2626]">Evento cancelado</p>
                {evento.motivoCancelacion && (
                  <p className="text-xs text-[#7F1D1D]">
                    Motivo: <span className="italic">&quot;{evento.motivoCancelacion}&quot;</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Info principal */}
          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="Inicio" valor={formatearFechaHora(evento.fechaInicio)} />
            <InfoBox label="Fin" valor={formatearFechaHora(evento.fechaFin)} />
            <InfoBox label="Modalidad" valor={evento.modalidad === 'PRESENCIAL' ? 'Presencial' : 'Virtual'} />
            <InfoBox label={esVirtual ? 'Enlace' : 'Ubicación'} valor={evento.ubicacion ?? 'Por definir'} />
          </div>

          {/* Alumno */}
          <div>
            <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">
              Estudiante
            </p>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]">
              <Avatar iniciales={iniciales(evento.alumno.nombre, evento.alumno.apellido)} size="sm" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1E3A5F]">
                  {evento.alumno.nombre} {evento.alumno.apellido}
                </p>
                <p className="text-xs text-[#6B7280]">
                  {evento.alumno.grado} · Sección {evento.alumno.seccion}
                </p>
              </div>
            </div>
          </div>

          {/* Descripcion */}
          {evento.descripcion && (
            <div>
              <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">
                Descripción
              </p>
              <p className="text-sm text-[#374151] leading-relaxed p-3 rounded-lg bg-[#F9FAFB]">
                {evento.descripcion}
              </p>
            </div>
          )}

          {/* Invitados */}
          <div>
            <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">
              Invitados ({evento.invitados.length})
            </p>
            {evento.invitados.length === 0 ? (
              <p className="text-xs text-[#9CA3AF] italic">Sin invitados registrados.</p>
            ) : (
              <div className="space-y-2">
                {evento.invitados.map((inv) => (
                  <InvitadoRow key={inv.id} invitado={inv} />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoBox({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="p-3 rounded-lg bg-[#F9FAFB] space-y-0.5">
      <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{label}</p>
      <p className="text-sm text-[#374151] font-medium">{valor}</p>
    </div>
  )
}

function InvitadoRow({ invitado }: { invitado: EventoUsuarioResponse }) {
  const styleAsist = getEstadoAsistenciaStyle(invitado.estadoAsistencia)
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-[#E5E7EB] bg-white">
      <Avatar iniciales={iniciales(invitado.usuario.nombre, invitado.usuario.apellido)} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#374151]">
          {invitado.usuario.nombre} {invitado.usuario.apellido}
        </p>
        <p className="text-xs text-[#9CA3AF]">{invitado.usuario.rol}</p>
        {invitado.fechaRespuesta && invitado.estadoAsistencia !== 'PENDIENTE' && (
          <p className="text-[11px] text-[#6B7280] mt-0.5">
            Respondió {formatearFechaHora(invitado.fechaRespuesta)}
          </p>
        )}
        {invitado.motivoRechazo && (
          <p className="text-[11px] text-[#DC2626] italic">Motivo: {invitado.motivoRechazo}</p>
        )}
      </div>
      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${styleAsist.bg} ${styleAsist.text}`}>
        {styleAsist.label}
      </span>
    </div>
  )
}

// ─── Tarjeta resumen del evento en la lista ───────────────────────────────────

function EventoCard({
  evento,
  onClick,
}: {
  evento: EventoResponse
  onClick: () => void
}) {
  const tipo = TIPO_EVENTO_CONFIG[evento.tipoEvento]
  const estadoStyle = getEstadoEventoStyle(evento.estado)
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg border hover:shadow-sm transition-shadow"
      style={{ backgroundColor: tipo.bg, borderColor: tipo.border }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tipo.badge}`}>
          {tipo.short}
        </span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${estadoStyle.bg} ${estadoStyle.text}`}>
          {estadoStyle.label}
        </span>
      </div>
      <p className="text-sm font-medium text-[#1E3A5F] mb-2">{evento.titulo}</p>
      <div className="flex flex-wrap gap-3 text-[11px] text-[#6B7280]">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {formatearFechaHora(evento.fechaInicio)}
        </span>
        <span className="flex items-center gap-1">
          {evento.modalidad === 'VIRTUAL' ? <Video size={12} /> : <MapPin size={12} />}
          {evento.ubicacion ?? 'Por definir'}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1 text-[11px] text-[#2563EB]">
        <User size={12} />
        {evento.alumno.nombre} {evento.alumno.apellido}
      </div>
    </button>
  )
}

// ─── Pagina principal ─────────────────────────────────────────────────────────

type Vista = 'PROXIMOS' | 'PASADOS'

export default function Events() {
  const { user } = useAuth()
  const fetcher = useCallback(() => eventosService.listar(), [])
  const { data: eventos, isLoading, error, refetch } = useApiQuery<EventoResponse[]>(fetcher)

  const [vista, setVista] = useState<Vista>('PROXIMOS')
  const [tipoFiltro, setTipoFiltro] = useState<TipoEvento | 'TODOS'>('TODOS')
  const [currentWeek, setCurrentWeek] = useState(0)
  const [selectedEvento, setSelectedEvento] = useState<EventoResponse | null>(null)
  const [nuevoEventoOpen, setNuevoEventoOpen] = useState(false)

  const puedeCrear = user?.rol === 'docente'

  const hoy = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const eventosFiltrados = useMemo(() => {
    if (!eventos) return []
    return eventos.filter((ev) => {
      if (tipoFiltro !== 'TODOS' && ev.tipoEvento !== tipoFiltro) {
        return false
      }
      const inicio = new Date(ev.fechaInicio)
      const esProximo = ev.estado === 'ACTIVO' && inicio.getTime() >= hoy.getTime()
      return vista === 'PROXIMOS' ? esProximo : !esProximo
    })
  }, [eventos, tipoFiltro, vista, hoy])

  // Calendario semanal: dias L-V con eventos del rango.
  const inicioSemana = useMemo(() => inicioDeSemana(new Date(), currentWeek), [currentWeek])
  const diasSemana = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(inicioSemana)
      d.setDate(inicioSemana.getDate() + i)
      return d
    })
  }, [inicioSemana])

  const eventosSemana = useMemo(() => {
    if (!eventos) return []
    return eventos
      .filter((ev) => ev.estado !== 'CANCELADO')
      .filter((ev) => {
        const inicio = new Date(ev.fechaInicio)
        return diasSemana.some((d) => mismaFecha(inicio, d))
      })
  }, [eventos, diasSemana])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Eventos</h1>
          <p className="text-sm text-[#6B7280]">
            Reuniones con padres y solicitudes de apoyo SAANEE.
          </p>
        </div>
        {puedeCrear && (
          <Button
            onClick={() => setNuevoEventoOpen(true)}
            className="gap-2 bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white"
          >
            <Plus size={16} />
            Nuevo evento
          </Button>
        )}
      </div>

      {/* Loading / error */}
      {isLoading && (
        <Card className="border-[#E5E7EB]">
          <CardContent className="py-10 flex flex-col items-center gap-2 text-[#6B7280]">
            <Loader2 size={24} className="animate-spin" />
            <p className="text-sm">Cargando eventos…</p>
          </CardContent>
        </Card>
      )}

      {error && !isLoading && (
        <Card className="border-[#FECACA] bg-[#FEF2F2]">
          <CardContent className="py-6 flex items-start gap-3">
            <AlertCircle size={20} className="text-[#DC2626] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#DC2626]">No se pudieron cargar los eventos</p>
              <p className="text-xs text-[#7F1D1D] mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && (
        <>
          {/* Calendario semanal */}
          <Card className="border-[#E5E7EB]">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentWeek((w) => w - 1)}>
                  <ChevronLeft size={16} />
                </Button>
                <span className="text-sm font-medium text-[#1E3A5F] capitalize">
                  {diasSemana[0].toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentWeek((w) => w + 1)}>
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
                {diasSemana.map((dia, idx) => {
                  const esHoy = mismaFecha(dia, new Date())
                  return (
                    <div
                      key={idx}
                      className={`text-center p-2 rounded-lg ${
                        esHoy ? 'bg-[#1E3A5F] text-white' : 'bg-[#F9FAFB] text-[#374151]'
                      }`}
                    >
                      <p className="text-xs font-medium capitalize">
                        {dia.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  )
                })}
              </div>
              <div className="grid grid-cols-5 gap-2 min-h-40">
                {diasSemana.map((dia, idx) => {
                  const eventosDia = eventosSemana
                    .filter((ev) => mismaFecha(new Date(ev.fechaInicio), dia))
                    .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
                  return (
                    <div key={idx} className="space-y-1.5">
                      {eventosDia.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-[10px] text-[#9CA3AF]">Sin eventos</p>
                        </div>
                      ) : (
                        eventosDia.map((ev) => {
                          const tipo = TIPO_EVENTO_CONFIG[ev.tipoEvento]
                          return (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={() => setSelectedEvento(ev)}
                              className="w-full text-left p-2 rounded-lg border-l-2 hover:opacity-80 transition-opacity"
                              style={{ backgroundColor: tipo.bg, borderColor: tipo.border }}
                            >
                              <p className="text-[11px] font-medium text-[#1E3A5F] line-clamp-2">
                                {ev.titulo}
                              </p>
                              <p className="text-[10px] text-[#6B7280] mt-0.5">
                                {formatearHora(ev.fechaInicio)}
                              </p>
                            </button>
                          )
                        })
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="inline-flex rounded-lg border border-[#E5E7EB] bg-white p-1">
              {(['PROXIMOS', 'PASADOS'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVista(v)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                    vista === v ? 'bg-[#1E3A5F] text-white' : 'text-[#374151] hover:bg-[#F3F4F6]'
                  }`}
                >
                  {v === 'PROXIMOS' ? 'Próximos' : 'Pasados / cancelados'}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {(['TODOS', 'REUNION_PADRES', 'SOLICITUD_APOYO_SAANEE'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipoFiltro(t)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    tipoFiltro === t
                      ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white'
                      : 'bg-white border-[#E5E7EB] text-[#374151] hover:border-[#1E3A5F]'
                  }`}
                >
                  {t === 'TODOS' ? 'Todos' : TIPO_EVENTO_CONFIG[t].short}
                </button>
              ))}
            </div>
          </div>

          {/* Lista */}
          <Card className="border-[#E5E7EB]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#1E3A5F] flex items-center gap-2">
                <Calendar size={18} className="text-[#3B82F6]" />
                {vista === 'PROXIMOS' ? 'Próximos eventos' : 'Eventos pasados / cancelados'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {eventosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] border-2 border-dashed border-[#D1D5DB] flex items-center justify-center mb-4">
                    <Calendar size={28} className="text-[#D1D5DB]" />
                  </div>
                  <p className="text-sm font-semibold text-[#374151] mb-1">Sin eventos</p>
                  <p className="text-xs text-[#9CA3AF] max-w-xs">
                    {vista === 'PROXIMOS'
                      ? 'No tienes eventos programados con los filtros actuales.'
                      : 'Aún no hay eventos pasados o cancelados con los filtros actuales.'}
                  </p>
                </div>
              ) : (
                eventosFiltrados
                  .sort((a, b) =>
                    vista === 'PROXIMOS'
                      ? new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()
                      : new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime(),
                  )
                  .map((ev) => (
                    <EventoCard key={ev.id} evento={ev} onClick={() => setSelectedEvento(ev)} />
                  ))
              )}
            </CardContent>
          </Card>
        </>
      )}

      {selectedEvento && (
        <EventoDetailModal evento={selectedEvento} onClose={() => setSelectedEvento(null)} />
      )}

      {puedeCrear && (
        <NuevoEventoDialog
          open={nuevoEventoOpen}
          onClose={() => setNuevoEventoOpen(false)}
          onCreated={refetch}
        />
      )}
    </div>
  )
}
