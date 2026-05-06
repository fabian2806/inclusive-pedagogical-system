import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { calcularEdad, iniciales } from "@/lib/student"
import type { AlumnoResponse, PerfilDiscapacidadResponse } from "@/types/api"

interface Props {
  alumno: AlumnoResponse
  perfil: PerfilDiscapacidadResponse | null
}

export function PerfilCard({ alumno, perfil }: Props) {
  const edad = calcularEdad(alumno.fechaNacimiento)

  return (
    <Card className="border-[#E5E7EB]">
      <CardContent className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-[#EEF2FF] text-[#3B82F6] text-xl font-semibold">
              {iniciales(alumno.nombre, alumno.apellido)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-[#1E3A5F]">
              {alumno.nombre} {alumno.apellido}
            </p>
            <p className="text-sm text-[#6B7280]">
              {edad} años · {alumno.fechaNacimiento}
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-1">
              Modo de comunicación
            </p>
            <p className="text-sm text-[#374151]">
              {perfil?.modoComunicacionPreferido || "—"}
            </p>
          </div>
          {perfil?.observacionesGenerales && (
            <div>
              <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-1">
                Observaciones generales
              </p>
              <p className="text-sm text-[#374151]">{perfil.observacionesGenerales}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
