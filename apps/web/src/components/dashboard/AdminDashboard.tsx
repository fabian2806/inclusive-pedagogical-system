import { useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, GraduationCap, Loader2, ShieldCheck, UserCog, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiQuery } from "@/hooks/useApiQuery";
import { dashboardService } from "@/lib/api/dashboardService";
import type { TipoRol } from "@/types/api";

const ROLES_DISPLAY: { rol: TipoRol; label: string; color: string }[] = [
  { rol: "DOCENTE", label: "Docentes", color: "bg-[#3B82F6]" },
  { rol: "PADRE", label: "Padres/Tutores", color: "bg-[#8B5CF6]" },
  { rol: "SAANEE", label: "SAANEE", color: "bg-[#059669]" },
  { rol: "ADMIN", label: "Administradores", color: "bg-[#1E3A5F]" },
];

export default function AdminDashboard({ userName }: { userName: string }) {
  const firstName = userName.split(" ")[0] || "Usuario"

  const fetchResumen = useCallback(() => dashboardService.getAdminResumen(), [])
  const { data: resumen, isLoading, error } = useApiQuery(fetchResumen)

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado principal */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Panel de Administración</h1>
          <p className="text-sm text-[#6B7280]">
            Bienvenido, {firstName}. Gestiona usuarios, estudiantes y configuración del sistema.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="admin/usuarios">
            <Button variant="outline" className="border-[#E5E7EB] text-[#374151]">
              Gestionar usuarios
            </Button>
          </Link>
          <Link to="admin/estudiantes">
            <Button className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white">
              Gestionar estudiantes
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12 text-[#6B7280]">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
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
          {/* KPIs reales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total usuarios activos"
              value={resumen.totalUsuarios}
              icon={Users}
              color="#3B82F6"
            />
            <KpiCard
              title="Estudiantes activos"
              value={resumen.totalAlumnosActivos}
              icon={GraduationCap}
              color="#8B5CF6"
            />
            <KpiCard
              title="Expedientes abiertos"
              value={resumen.expedientesAbiertos}
              icon={BookOpen}
              color="#059669"
            />
            <KpiCard
              title="Periodo lectivo"
              value={resumen.periodoVigente}
              icon={Calendar}
              color="#F59E0B"
            />
          </div>

          {/* Grilla principal: Usuarios por rol + Acciones rápidas */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-[#E5E7EB]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-[#1E3A5F]">
                  Usuarios por rol
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ROLES_DISPLAY.map((item) => (
                  <div key={item.rol} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm text-[#374151]">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-[#1E3A5F]">
                      {resumen.usuariosPorRol[item.rol] ?? 0}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-[#E5E7EB]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-[#1E3A5F]">
                  Acciones rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="admin/usuarios?action=new&role=docente">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-[#E5E7EB] hover:border-[#3B82F6] hover:bg-[#EEF2FF]">
                      <UserCog size={20} className="text-[#3B82F6]" />
                      <span className="text-xs text-[#374151]">Nuevo Docente</span>
                    </Button>
                  </Link>
                  <Link to="admin/usuarios?action=new&role=padre">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-[#E5E7EB] hover:border-[#8B5CF6] hover:bg-[#F3E8FF]">
                      <Users size={20} className="text-[#8B5CF6]" />
                      <span className="text-xs text-[#374151]">Nuevo Padre</span>
                    </Button>
                  </Link>
                  <Link to="admin/usuarios?action=new&role=saanee">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-[#E5E7EB] hover:border-[#059669] hover:bg-[#ECFDF5]">
                      <ShieldCheck size={20} className="text-[#059669]" />
                      <span className="text-xs text-[#374151]">Nuevo SAANEE</span>
                    </Button>
                  </Link>
                  <Link to="admin/estudiantes?action=new">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-[#E5E7EB] hover:border-[#F59E0B] hover:bg-[#FEF3C7]">
                      <GraduationCap size={20} className="text-[#F59E0B]" />
                      <span className="text-xs text-[#374151]">Nuevo Estudiante</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

interface KpiCardProps {
  title: string
  value: number | string
  icon: typeof Users
  color: string
}

function KpiCard({ title, value, icon: Icon, color }: KpiCardProps) {
  return (
    <Card className="border-[#E5E7EB]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
              {title}
            </p>
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
  );
}
