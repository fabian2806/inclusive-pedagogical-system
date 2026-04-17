import { Link } from "react-router-dom"
import { MoreVertical, Eye, FileText, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { AlumnoResponse } from "@/types/api"

interface StudentCardProps {
  alumno: AlumnoResponse
}

export function StudentCard({ alumno }: StudentCardProps) {
  const initials = `${alumno.nombre.charAt(0)}${alumno.apellido.charAt(0)}`
  const esActivo = alumno.estado === "ACTIVO"

  return (
    <Card className="border-[#E5E7EB] hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header con avatar y menú */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarFallback className="text-sm font-semibold bg-[#EEF2FF] text-[#3B82F6]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-[#1E3A5F]">
                {alumno.nombre} {alumno.apellido}
              </p>
              <p className="text-xs text-[#6B7280]">
                {alumno.grado} · Sección {alumno.seccion}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#9CA3AF]">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/estudiantes/${alumno.id}/expediente`}>
                  <Eye size={14} className="mr-2" />
                  Ver expediente
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText size={14} className="mr-2" />
                Nueva entrada
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar size={14} className="mr-2" />
                Programar evento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Estado y fecha nacimiento */}
        <div className="space-y-2 mb-3">
          <p className="text-xs text-[#6B7280]">Nacimiento: {alumno.fechaNacimiento}</p>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-[10px] ${
                esActivo
                  ? "border-[#10B981] text-[#059669] bg-[#D1FAE5]"
                  : "border-[#9CA3AF] text-[#6B7280] bg-[#F3F4F6]"
              }`}
            >
              {esActivo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>

        {/* Docentes y padres asignados */}
        <div className="pt-3 border-t border-[#E5E7EB] space-y-1">
          <div className="text-xs text-[#9CA3AF]">
            <span className="font-medium text-[#374151]">Docente: </span>
            {alumno.docentes.length > 0
              ? alumno.docentes.map(d => `${d.nombre} ${d.apellido}`).join(", ")
              : "Sin asignar"}
          </div>
          <div className="text-xs text-[#9CA3AF]">
            <span className="font-medium text-[#374151]">Padre/Apoderado: </span>
            {alumno.padres.length > 0
              ? alumno.padres.map(p => `${p.nombre} ${p.apellido}`).join(", ")
              : "Sin asignar"}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <Link to={`/dashboard/estudiantes/${alumno.id}/perfil`} className="flex-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-[#6B7280] hover:text-[#1E3A5F] hover:bg-[#F3F4F6]"
            >
              Ver perfil
            </Button>
          </Link>
          <Link to={`/dashboard/estudiantes/${alumno.id}/expediente`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-[#3B82F6] border-[#3B82F6] hover:bg-[#EEF2FF]"
            >
              Ver expediente
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
