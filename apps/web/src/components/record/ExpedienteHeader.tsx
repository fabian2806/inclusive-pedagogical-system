import { ArrowLeft, Calendar, Plus, User } from "lucide-react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AlumnoResponse } from "@/types/api"

interface Props {
  alumno: AlumnoResponse
}

export function ExpedienteHeader({ alumno }: Props) {
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
      <div className="flex gap-2">
        <Link to={`/dashboard/estudiantes/${alumno.id}/perfil`}>
          <Button variant="ghost" className="gap-2 text-[#6B7280] hover:text-[#1E3A5F]">
            <User size={16} />
            Ver perfil
          </Button>
        </Link>
        <Button variant="outline" className="gap-2 border-[#E5E7EB] text-[#374151]">
          <Calendar size={16} />
          Programar evento
        </Button>
        <Button className="gap-2 bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white">
          <Plus size={16} />
          Nueva entrada
        </Button>
      </div>
    </div>
  )
}
