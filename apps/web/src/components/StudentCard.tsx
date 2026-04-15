import { Link } from "react-router-dom"
import { MoreVertical, Eye, FileText, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface StudentCardProps {
  id: string
  name: string
  grade: string
  age: number
  //status: "activo" | "inactivo"
  status: string; // Cambiado a string para evitar error de tipo, pero idealmente debería ser un enum o union de tipos
  priority: boolean
  lastUpdate: string
  entries: number
  initials: string
  hearingLevel: string
}

export function StudentCard({
  id,
  name,
  grade,
  age,
  status,
  priority,
  lastUpdate,
  entries,
  initials,
  hearingLevel,
}: StudentCardProps) {
  return (
    <Card
      className={`border-[#E5E7EB] hover:shadow-md transition-shadow ${
        priority ? "ring-1 ring-[#F59E0B]" : ""
      }`}
    >
      <CardContent className="p-4">
        {/* Header con avatar y menú */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarFallback
                className={`text-sm font-semibold ${
                  priority
                    ? "bg-[#FEF3C7] text-[#D97706]"
                    : "bg-[#EEF2FF] text-[#3B82F6]"
                }`}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-[#1E3A5F]">{name}</p>
              <p className="text-xs text-[#6B7280]">
                {grade} · {age} años
              </p>
            </div>
          </div>

          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#9CA3AF]"
              >
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/estudiantes/${id}`}>
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

        {/* Nivel auditivo y badges */}
        <div className="space-y-2 mb-3">
          <p className="text-xs text-[#6B7280]">{hearingLevel}</p>
          <div className="flex items-center gap-2">
            {priority && (
              <Badge
                variant="outline"
                className="text-[10px] border-[#F59E0B] text-[#D97706] bg-[#FEF3C7]"
              >
                Prioritario
              </Badge>
            )}
            <Badge
              variant="outline"
              className={`text-[10px] ${
                status === "activo"
                  ? "border-[#10B981] text-[#059669] bg-[#D1FAE5]"
                  : "border-[#9CA3AF] text-[#6B7280] bg-[#F3F4F6]"
              }`}
            >
              {status === "activo" ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>

        {/* Footer con entradas y última actualización */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
          <div className="text-xs text-[#9CA3AF]">
            <span className="font-medium text-[#374151]">{entries}</span> entradas
          </div>
          <div className="text-xs text-[#9CA3AF]">Actualizado {lastUpdate}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <Link to={`/dashboard/estudiantes/${id}/perfil`} className="flex-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-[#6B7280] hover:text-[#1E3A5F] hover:bg-[#F3F4F6]"
            >
              Ver perfil
            </Button>
          </Link>
          <Link to={`/dashboard/estudiantes/${id}/bitacora`} className="flex-1">
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