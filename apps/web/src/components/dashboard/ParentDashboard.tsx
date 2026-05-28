import { useCallback, useMemo } from "react"
import { Link } from "react-router-dom"
import { Calendar, ChevronRight, Clock, FileText, Loader2, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useApiQuery } from "@/hooks/useApiQuery"
import { useAuth } from "@/hooks/useAuth"
import { dashboardService } from "@/lib/api/dashboardService"
import { eventosService } from "@/lib/api/eventosService"
import type { EventoResponse } from "@/types/api"

export default function ParentDashboard({ userName }: { userName: string }) {
  const firstName = userName.split(" ")[0] || "Usuario"
  const { user } = useAuth()

  const fetchResumen = useCallback(() => dashboardService.getPadreResumen(), [])
  const fetchEventos = useCallback(() => eventosService.listar(), [])
  const { data: resumen, isLoading, error } = useApiQuery(fetchResumen)
  const { data: eventos, isLoading: loadingEventos } = useApiQuery(fetchEventos)

  // Reuniones por confirmar: eventos ACTIVO con fecha futura donde este
  // padre figura como invitado con estadoAsistencia PENDIENTE.
  const reunionesPorConfirmar = useMemo(() => {
    if (!user || !eventos) return []
    const ahora = Date.now()
    return eventos
      .filter((ev) => ev.estado === "ACTIVO" && new Date(ev.fechaInicio).getTime() >= ahora)
      .filter((ev) =>
        ev.invitados.some(
          (inv) => inv.usuario.id === user.id && inv.estadoAsistencia === "PENDIENTE",
        ),
      )
      .sort(
        (a, b) =>
          new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime(),
      )
  }, [eventos, user])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Bienvenida, {firstName}</h1>
          <p className="text-sm text-[#6B7280]">
            Sigue el progreso educativo de tu(s) hijo(s) y consulta sus expedientes.
          </p>
        </div>
        <Button asChild variant="outline" className="border-[#E5E7EB] text-[#374151] shrink-0">
          <Link to="/dashboard/estudiantes">Ver mis hijos</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8 text-[#6B7280]">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Cargando resumen...
        </div>
      )}

      {error && (
        <Card className="border-[#FECACA] bg-[#FEF2F2]">
          <CardContent className="p-4 text-sm text-[#B91C1C]">
            No se pudo cargar el resumen: {error}
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && resumen && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <KpiCard
              label="Hijos registrados"
              value={resumen.hijos.length}
              sub={resumen.hijos.length > 0 ? "En seguimiento activo" : "Sin hijos vinculados"}
              icon={Users}
              tone={{ bg: "#ECFDF5", icon: "#10B981", text: "#059669", sub: "#047857" }}
            />
            <KpiCard
              label="Entradas nuevas hoy"
              value={resumen.entradasNuevasHoy}
              sub={
                resumen.entradasNuevasHoy > 0
                  ? "Nuevas en el expediente"
                  : "Sin actualizaciones hoy"
              }
              icon={FileText}
              tone={{ bg: "#EFF6FF", icon: "#3B82F6", text: "#1D4ED8", sub: "#2563EB" }}
            />
          </div>

          {/* Mis hijos */}
          <Card className="border-[#E5E7EB]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-[#1E3A5F]">Mis hijos</CardTitle>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Accede al expediente y perfil de cada uno
              </p>
            </CardHeader>
            <CardContent>
              {resumen.hijos.length === 0 ? (
                <div className="py-10 flex flex-col items-center text-center">
                  <Users size={28} className="text-[#D1D5DB] mb-2" />
                  <p className="text-sm font-medium text-[#374151]">
                    Aún no tienes hijos vinculados
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    El administrador puede vincularte a tu hijo/a.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resumen.hijos.map((hijo) => {
                    const initials = `${hijo.nombre.charAt(0)}${hijo.apellido.charAt(0)}`
                    return (
                      <div
                        key={hijo.id}
                        className="flex items-center gap-4 p-3 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                      >
                        <Avatar className="h-11 w-11">
                          <AvatarFallback className="text-sm font-semibold bg-[#EEF2FF] text-[#3B82F6]">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1E3A5F]">
                            {hijo.nombre} {hijo.apellido}
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            {hijo.grado} · Sección {hijo.seccion}
                          </p>
                          {hijo.expedienteId === null && (
                            <Badge
                              variant="outline"
                              className="mt-1 text-[10px] border-[#FDE68A] text-[#92400E] bg-[#FEF3C7]"
                            >
                              Sin expediente vigente
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Link to={`/dashboard/estudiantes/${hijo.id}/perfil`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#6B7280] hover:text-[#1E3A5F]"
                            >
                              Perfil
                            </Button>
                          </Link>
                          <Link to={`/dashboard/estudiantes/${hijo.id}/expediente`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[#3B82F6] border-[#3B82F6] hover:bg-[#EEF2FF] gap-1"
                            >
                              Expediente
                              <ChevronRight size={13} />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reuniones por confirmar (Fase 4) */}
          <Card className="border-[#E5E7EB]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-[#1E3A5F]">
                  Reuniones por confirmar
                  {reunionesPorConfirmar.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                      {reunionesPorConfirmar.length}
                    </span>
                  )}
                </CardTitle>
                <Link to="/dashboard/eventos">
                  <Button variant="ghost" size="sm" className="text-[#3B82F6] hover:text-[#2563EB] text-xs">
                    Ver eventos
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Invitaciones del docente que requieren tu respuesta
              </p>
            </CardHeader>
            <CardContent>
              {loadingEventos && (
                <p className="text-sm text-[#9CA3AF] py-4 text-center">Cargando reuniones…</p>
              )}
              {!loadingEventos && reunionesPorConfirmar.length === 0 && (
                <div className="py-8 flex flex-col items-center text-center">
                  <Calendar size={28} className="text-[#D1D5DB] mb-2" />
                  <p className="text-sm text-[#6B7280] max-w-60">
                    No tienes reuniones pendientes de confirmar.
                  </p>
                </div>
              )}
              {!loadingEventos && reunionesPorConfirmar.length > 0 && (
                <div className="space-y-2">
                  {reunionesPorConfirmar.map((ev) => (
                    <ReunionPorConfirmarRow key={ev.id} evento={ev} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function ReunionPorConfirmarRow({ evento }: { evento: EventoResponse }) {
  return (
    <Link
      to="/dashboard/eventos"
      className="flex items-center gap-3 p-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] hover:bg-[#FEF3C7] transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1E3A5F] truncate">{evento.titulo}</p>
        <p className="text-[11px] text-[#6B7280] flex items-center gap-1 mt-0.5">
          <Clock size={10} />
          {new Date(evento.fechaInicio).toLocaleString("es-PE", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
          <span className="text-[#D1D5DB]">·</span>
          {evento.alumno.nombre} {evento.alumno.apellido}
        </p>
      </div>
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706]">
        Pendiente
      </span>
      <ChevronRight size={14} className="text-[#9CA3AF] shrink-0" />
    </Link>
  )
}

interface KpiCardProps {
  label: string
  value: number
  sub: string
  icon: typeof Users
  tone: { bg: string; icon: string; text: string; sub: string }
}

function KpiCard({ label, value, sub, icon: Icon, tone }: KpiCardProps) {
  return (
    <Card className="border-[#E5E7EB]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest">
              {label}
            </p>
            <p className="text-3xl font-bold" style={{ color: tone.text }}>
              {value}
            </p>
            <p className="text-xs font-medium" style={{ color: tone.sub }}>
              {sub}
            </p>
          </div>
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: tone.bg }}
          >
            <Icon size={22} style={{ color: tone.icon }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
