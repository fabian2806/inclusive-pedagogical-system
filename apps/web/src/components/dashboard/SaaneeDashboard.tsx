import { useCallback, useMemo } from "react"
import { Link } from "react-router-dom"
import { Calendar, ChevronRight, Clock, Loader2, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApiQuery } from "@/hooks/useApiQuery"
import { useAuth } from "@/hooks/useAuth"
import { dashboardService } from "@/lib/api/dashboardService"
import { eventosService } from "@/lib/api/eventosService"
import type { EventoResponse } from "@/types/api"

export default function SaaneeDashboard({ userName }: { userName: string }) {
  const firstName = userName.split(" ")[0] || "Usuario"
  const { user } = useAuth()

  const fetchResumen = useCallback(() => dashboardService.getSaaneeResumen(), [])
  const fetchEventos = useCallback(() => eventosService.listar(), [])
  const { data: resumen, isLoading, error } = useApiQuery(fetchResumen)
  const { data: eventos, isLoading: loadingEventos } = useApiQuery(fetchEventos)

  // Solicitudes activas: eventos SOLICITUD_APOYO_SAANEE ACTIVO con fecha
  // futura donde este SAANEE es invitado y aun no respondio.
  // Proximos eventos: todos los eventos visibles (cualquier tipo / cualquier
  // estado de asistencia) con fechaInicio futura.
  const { solicitudesActivas, proximosEventos } = useMemo(() => {
    if (!user || !eventos) {
      return { solicitudesActivas: [], proximosEventos: [] }
    }
    const ahora = Date.now()
    const futurosActivos = eventos
      .filter(
        (ev) => ev.estado === "ACTIVO" && new Date(ev.fechaInicio).getTime() >= ahora,
      )
      .sort(
        (a, b) =>
          new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime(),
      )
    return {
      solicitudesActivas: futurosActivos.filter(
        (ev) =>
          ev.tipoEvento === "SOLICITUD_APOYO_SAANEE" &&
          ev.invitados.some(
            (inv) =>
              inv.usuario.id === user.id && inv.estadoAsistencia === "PENDIENTE",
          ),
      ),
      proximosEventos: futurosActivos
        .filter((ev) => ev.invitados.some((inv) => inv.usuario.id === user.id))
        .slice(0, 5),
    }
  }, [eventos, user])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Bienvenido, {firstName}</h1>
          <p className="text-sm text-[#6B7280]">
            Consulta el seguimiento global de los estudiantes del sistema.
          </p>
        </div>
        <Button asChild variant="outline" className="border-[#E5E7EB] text-[#374151] shrink-0">
          <Link to="/dashboard/estudiantes">Ver todos los estudiantes</Link>
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
            {/* Solicitudes activas (Fase 4) */}
            <Card className="border-[#E5E7EB]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest">
                      Solicitudes activas
                    </p>
                    <p className="text-3xl font-bold text-[#A21CAF]">
                      {solicitudesActivas.length}
                    </p>
                    <p className="text-xs font-medium text-[#C026D3]">
                      {solicitudesActivas.length === 0
                        ? "Sin solicitudes pendientes"
                        : "Pendientes de tu respuesta"}
                    </p>
                  </div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#FDF4FF" }}
                  >
                    <Calendar size={22} style={{ color: "#D946EF" }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estudiantes activos (existente) */}
            <Card className="border-[#E5E7EB]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest">
                      Estudiantes activos
                    </p>
                    <p className="text-3xl font-bold text-[#1D4ED8]">{resumen.totalAlumnosActivos}</p>
                    <p className="text-xs font-medium text-[#2563EB]">En seguimiento global</p>
                  </div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#EFF6FF" }}
                  >
                    <Users size={22} style={{ color: "#3B82F6" }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grilla: Solicitudes de apoyo + Proximos eventos (Fase 4) */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-[#E5E7EB]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-[#1E3A5F]">
                      Solicitudes de apoyo
                    </CardTitle>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Apoyo SAANEE solicitado por docentes
                    </p>
                  </div>
                  {solicitudesActivas.length > 0 && (
                    <Link to="/dashboard/eventos">
                      <Button variant="ghost" size="sm" className="text-[#A21CAF] hover:text-[#86198F] text-xs">
                        Ver eventos
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loadingEventos && (
                  <p className="text-sm text-[#9CA3AF] py-4 text-center">Cargando solicitudes…</p>
                )}
                {!loadingEventos && solicitudesActivas.length === 0 && (
                  <div className="py-10 flex flex-col items-center text-center">
                    <Calendar size={28} className="text-[#D1D5DB] mb-2" />
                    <p className="text-sm text-[#6B7280] max-w-md">
                      No tienes solicitudes de apoyo pendientes.
                    </p>
                  </div>
                )}
                {!loadingEventos && solicitudesActivas.length > 0 && (
                  <div className="space-y-2">
                    {solicitudesActivas.map((ev) => (
                      <SolicitudRow key={ev.id} evento={ev} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Proximos eventos (cualquier tipo donde el SAANEE participa) */}
            <Card className="border-[#E5E7EB]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-[#1E3A5F]">Próximos eventos</CardTitle>
                  <Link to="/dashboard/eventos">
                    <Button variant="ghost" size="sm" className="text-[#3B82F6] hover:text-[#2563EB] text-xs">
                      Ver todos
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingEventos && (
                  <p className="text-sm text-[#9CA3AF] py-4 text-center">Cargando eventos…</p>
                )}
                {!loadingEventos && proximosEventos.length === 0 && (
                  <div className="py-8 flex flex-col items-center text-center">
                    <Calendar size={28} className="text-[#D1D5DB] mb-2" />
                    <p className="text-sm text-[#6B7280]">Sin eventos próximos.</p>
                  </div>
                )}
                {!loadingEventos && proximosEventos.length > 0 && (
                  <div className="space-y-2">
                    {proximosEventos.map((ev) => (
                      <ProximoEventoCompact key={ev.id} evento={ev} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function SolicitudRow({ evento }: { evento: EventoResponse }) {
  return (
    <Link
      to="/dashboard/eventos"
      className="flex items-center gap-3 p-3 rounded-lg border border-[#E879F9] bg-[#FDF4FF] hover:bg-[#FAE8FF] transition-colors"
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
          <span className="text-[#D1D5DB]">·</span>
          Solicita {evento.usuarioCreador.nombre} {evento.usuarioCreador.apellido}
        </p>
      </div>
      <Badge
        variant="outline"
        className="text-[10px] border-[#E879F9] text-[#A21CAF] bg-[#FAE8FF]"
      >
        Pendiente
      </Badge>
      <ChevronRight size={14} className="text-[#9CA3AF] shrink-0" />
    </Link>
  )
}

function ProximoEventoCompact({ evento }: { evento: EventoResponse }) {
  const tipoBadge =
    evento.tipoEvento === "REUNION_PADRES"
      ? { bg: "bg-[#F0F9FF]", text: "text-[#0284C7]", label: "Reunión" }
      : { bg: "bg-[#FDF4FF]", text: "text-[#A21CAF]", label: "SAANEE" }
  return (
    <Link
      to="/dashboard/eventos"
      className="block p-2.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
    >
      <div className="flex items-center gap-2 mb-0.5">
        <Badge
          variant="outline"
          className={`text-[9px] px-1.5 py-0 h-4 font-normal border-transparent ${tipoBadge.bg} ${tipoBadge.text}`}
        >
          {tipoBadge.label}
        </Badge>
        <p className="text-xs font-medium text-[#1E3A5F] truncate flex-1">{evento.titulo}</p>
      </div>
      <p className="text-[11px] text-[#6B7280] flex items-center gap-1">
        <Clock size={10} />
        {new Date(evento.fechaInicio).toLocaleString("es-PE", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </Link>
  )
}
