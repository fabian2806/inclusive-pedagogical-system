import { useCallback } from "react"
import { Link } from "react-router-dom"
import { Calendar, Loader2, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApiQuery } from "@/hooks/useApiQuery"
import { dashboardService } from "@/lib/api/dashboardService"

export default function SaaneeDashboard({ userName }: { userName: string }) {
  const firstName = userName.split(" ")[0] || "Usuario"

  const fetchResumen = useCallback(() => dashboardService.getSaaneeResumen(), [])
  const { data: resumen, isLoading, error } = useApiQuery(fetchResumen)

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
            {/* Solicitudes activas — placeholder Fase 4 */}
            <Card className="border-[#E5E7EB]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest">
                        Solicitudes activas
                      </p>
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">
                        Próximamente
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold text-[#A21CAF] opacity-50">—</p>
                    <p className="text-xs font-medium text-[#C026D3]">
                      Disponible en Fase 4
                    </p>
                  </div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center opacity-50"
                    style={{ backgroundColor: "#FDF4FF" }}
                  >
                    <Calendar size={22} style={{ color: "#D946EF" }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estudiantes activos — real */}
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

          {/* Grilla: Solicitudes de apoyo + Próximos eventos (ambos Fase 4) */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-[#E5E7EB]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-[#1E3A5F] flex items-center gap-2">
                      Solicitudes de apoyo
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">
                        Próximamente
                      </Badge>
                    </CardTitle>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Apoyo SAANEE solicitado por docentes
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Calendar size={32} className="text-[#9CA3AF] mb-3" />
                  <p className="text-sm text-[#6B7280] max-w-md">
                    La gestión de solicitudes de apoyo se incorpora junto al módulo de
                    coordinación en una fase posterior.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Próximos eventos — placeholder Fase 4 */}
            <Card className="border-[#E5E7EB]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-[#1E3A5F]">Próximos eventos</CardTitle>
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
        </>
      )}
    </div>
  )
}
