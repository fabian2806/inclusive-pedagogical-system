import { ArrowLeft, User, CalendarDays } from "lucide-react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AlumnoResponse, ExpedientePeriodoResponse } from "@/types/api"

interface Props {
  alumno: AlumnoResponse
  /** Periodos con expediente. Si hay uno solo, el selector no se muestra. */
  periodos?: ExpedientePeriodoResponse[]
  periodoSeleccionado?: string
  onPeriodoChange?: (periodo: string) => void
}

export function ExpedienteHeader({
  alumno,
  periodos = [],
  periodoSeleccionado,
  onPeriodoChange,
}: Props) {
  // Con un unico periodo el selector no aporta: el expediente vigente es el
  // unico que existe. Aparece recien cuando hay historial que consultar.
  const mostrarSelector = periodos.length > 1 && !!onPeriodoChange

  return (
    <div className="flex items-center gap-4">
      <Link to="/dashboard/estudiantes">
        <Button variant="ghost" size="icon" className="text-[#6B7280] hover:text-[#1E3A5F]">
          <ArrowLeft size={20} />
        </Button>
      </Link>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#1E3A5F]">
            {alumno.nombre} {alumno.apellido}
          </h1>
          <Badge
            variant="outline"
            className={`text-xs ${
              alumno.estado === "ACTIVO"
                ? "border-[#10B981] text-[#059669] bg-[#D1FAE5]"
                : "border-[#D1D5DB] text-[#6B7280] bg-[#F3F4F6]"
            }`}
          >
            {alumno.estado === "ACTIVO" ? "Activo" : "Inactivo"}
          </Badge>
        </div>
        <p className="text-sm text-[#6B7280]">
          {alumno.grado} · Sección {alumno.seccion}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {mostrarSelector && (
          <Select value={periodoSeleccionado} onValueChange={onPeriodoChange}>
            <SelectTrigger
              aria-label="Periodo del expediente"
              className="w-44 border-[#E5E7EB] text-[#1E3A5F]"
            >
              <CalendarDays size={15} className="text-[#6B7280] shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodos.map(periodo => (
                <SelectItem key={periodo.periodoLectivo} value={periodo.periodoLectivo}>
                  {periodo.periodoLectivo}
                  {periodo.editable ? " · vigente" : " · cerrado"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Link to={`/dashboard/estudiantes/${alumno.id}/perfil`}>
          <Button variant="ghost" className="gap-2 text-[#6B7280] hover:text-[#1E3A5F]">
            <User size={16} />
            Ver perfil
          </Button>
        </Link>
      </div>
    </div>
  )
}
