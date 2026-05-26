import { useCallback } from "react"
import { Link } from "react-router-dom"
import { AlertCircle, Calendar, Clock, FileText, Loader2, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useApiQuery } from "@/hooks/useApiQuery"
import { alumnosService } from "@/lib/api/alumnosService"
import { dashboardService } from "@/lib/api/dashboardService"
import type { ActividadEntradaResponse, TipoEntrada } from "@/types/api"

const TIPO_ENTRADA_LABEL: Record<TipoEntrada, string> = {
  OBSERVACION_PEDAGOGICA: "Observación pedagógica",
  COMUNICACION_FAMILIAR: "Comunicación familiar",
  INCIDENCIA_COMUNICACION: "Incidencia",
  APOYO_O_AJUSTE: "Apoyo o ajuste",
  EVALUACION_INDICADOR: "Evaluación de indicador",
  EVENTO_AGENDA: "Evento de agenda",
  DOCUMENTO_ADJUNTADO: "Documento adjuntado",
  FEEDBACK_SAANEE: "Feedback SAANEE",
}

function formatRelative(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000)
  if (diffMin < 1) return "Ahora"
  if (diffMin < 60) return `Hace ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `Hace ${diffH} h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `Hace ${diffD} d`
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short" })
}

export default function TeacherDashboard({ userName }: { userName: string }) {
  const firstName = userName.split(" ")[0] || "Usuario"

  const fetchResumen = useCallback(() => dashboardService.getDocenteResumen(), [])
  const fetchAlumnos = useCallback(() => alumnosService.listar(), [])
  const fetchActividad = useCallback(() => dashboardService.getActividadRecienteDocente(5), [])

  const { data: resumen, isLoading: loadingResumen, error: errorResumen } = useApiQuery(fetchResumen)
  const { data: alumnos, isLoading: loadingAlumnos } = useApiQuery(fetchAlumnos)
  const { data: actividad, isLoading: loadingActividad } = useApiQuery(fetchActividad)

  const alumnosRecientes = (alumnos ?? []).slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Bienvenida, {firstName}</h1>
          <p className="text-sm text-[#6B7280]">
            Aquí tienes un resumen de tu actividad y estudiantes asignados.
          </p>
        </div>

        <Button asChild className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white shrink-0">
          <Link to="/dashboard/estudiantes">Ver estudiantes</Link>
        </Button>
      </div>

      {/* KPIs */}
      {loadingResumen && (
        <div className="flex items-center justify-center py-8 text-[#6B7280]">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Cargando indicadores...
        </div>
      )}
      {errorResumen && (
        <Card className="border-[#FECACA] bg-[#FEF2F2]">
          <CardContent className="p-4 text-sm text-[#B91C1C]">
            No se pudo cargar el resumen: {errorResumen}
          </CardContent>
        </Card>
      )}
      {!loadingResumen && !errorResumen && resumen && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            title="Estudiantes asignados"
            value={resumen.alumnosAsignados}
            icon={Users}
            color="#3B82F6"
          />
          <KpiCard
            title="Entradas de bitácora hoy"
            value={resumen.entradasBitacoraHoy}
            icon={FileText}
            color="#8B5CF6"
          />
          <KpiCard
            title="Estudiantes sin perfil"
            value={resumen.alumnosSinPerfilDiscapacidad}
            icon={AlertCircle}
            color="#F59E0B"
            highlight={resumen.alumnosSinPerfilDiscapacidad > 0}
          />
        </div>
      )}

      {/* Estudiantes recientes + Próximos eventos (placeholder) */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-[#E5E7EB]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-[#1E3A5F]">Estudiantes recientes</CardTitle>
                <CardDescription className="text-[#6B7280]">
                  Alumnos asignados a tu seguimiento
                </CardDescription>
              </div>
              <Link to="/dashboard/estudiantes">
                <Button variant="ghost" size="sm" className="text-[#3B82F6] hover:text-[#2563EB]">
                  Ver todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loadingAlumnos && (
              <p className="text-sm text-[#9CA3AF] py-4 text-center">Cargando estudiantes...</p>
            )}
            {!loadingAlumnos && alumnosRecientes.length === 0 && (
              <p className="text-sm text-[#9CA3AF] py-6 text-center">
                Aún no tienes estudiantes asignados.
              </p>
            )}
            {!loadingAlumnos && alumnosRecientes.length > 0 && (
              <div className="space-y-3">
                {alumnosRecientes.map((alumno) => {
                  const initials = `${alumno.nombre.charAt(0)}${alumno.apellido.charAt(0)}`
                  return (
                    <Link
                      key={alumno.id}
                      to={`/dashboard/estudiantes/${alumno.id}/expediente`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#F9FAFB] transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-xs font-semibold bg-[#EEF2FF] text-[#3B82F6]">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1E3A5F] truncate">
                          {alumno.nombre} {alumno.apellido}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {alumno.grado} · Sección {alumno.seccion}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          alumno.estado === "ACTIVO"
                            ? "border-[#10B981] text-[#059669] bg-[#D1FAE5]"
                            : "border-[#9CA3AF] text-[#6B7280] bg-[#F3F4F6]"
                        }`}
                      >
                        {alumno.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                      </Badge>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximos eventos: placeholder Fase 4 */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-[#1E3A5F]">Próximos eventos</CardTitle>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">
                Próximamente
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Calendar size={32} className="text-[#9CA3AF] mb-3" />
              <p className="text-sm text-[#6B7280] max-w-50">
                La gestión de eventos llegará en una fase posterior.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actividad reciente */}
      <Card className="border-[#E5E7EB]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-[#1E3A5F]">Actividad reciente</CardTitle>
          <CardDescription className="text-[#6B7280]">
            Últimas entradas registradas en tus estudiantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingActividad && (
            <p className="text-sm text-[#9CA3AF] py-4 text-center">Cargando actividad...</p>
          )}
          {!loadingActividad && (actividad ?? []).length === 0 && (
            <p className="text-sm text-[#9CA3AF] py-6 text-center">
              Sin actividad reciente en tus estudiantes.
            </p>
          )}
          {!loadingActividad && (actividad ?? []).length > 0 && (
            <div className="space-y-4">
              {(actividad ?? []).map((item) => (
                <ActividadItem key={item.id} entrada={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface KpiCardProps {
  title: string
  value: number
  icon: typeof Users
  color: string
  highlight?: boolean
}

function KpiCard({ title, value, icon: Icon, color, highlight }: KpiCardProps) {
  return (
    <Card className={`border-[#E5E7EB] ${highlight ? "bg-[#FEF3C7] border-[#FDE68A]" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-[#1E3A5F] mt-1">{value}</p>
          </div>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon size={20} style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActividadItem({ entrada }: { entrada: ActividadEntradaResponse }) {
  return (
    <Link
      to={`/dashboard/estudiantes/${entrada.alumnoId}/expediente`}
      className="flex items-start gap-4 p-3 rounded-lg hover:bg-[#F9FAFB] transition-colors"
    >
      <div className="w-2 h-2 rounded-full bg-[#3B82F6] mt-2 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1E3A5F]">
          {TIPO_ENTRADA_LABEL[entrada.tipo]}
          <span className="text-[#6B7280] font-normal">
            {" "}
            · {entrada.alumnoNombre} {entrada.alumnoApellido}
          </span>
        </p>
        {entrada.titulo && (
          <p className="text-xs text-[#374151] mt-0.5 truncate">{entrada.titulo}</p>
        )}
        <div className="flex items-center gap-3 mt-1 text-xs text-[#9CA3AF]">
          <span>por {entrada.autor.nombre} {entrada.autor.apellido}</span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatRelative(entrada.fecha)}
          </span>
        </div>
      </div>
    </Link>
  )
}
