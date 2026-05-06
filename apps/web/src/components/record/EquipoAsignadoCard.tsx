import { User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { iniciales } from "@/lib/student"
import type { UsuarioSimpleResponse } from "@/types/api"

interface Props {
  docentes: UsuarioSimpleResponse[]
  padres: UsuarioSimpleResponse[]
}

export function EquipoAsignadoCard({ docentes, padres }: Props) {
  const vacio = docentes.length === 0 && padres.length === 0

  return (
    <Card className="border-[#E5E7EB]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-[#1E3A5F] flex items-center gap-2">
          <User size={16} className="text-[#3B82F6]" />
          Equipo asignado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {vacio && (
          <p className="text-xs text-[#9CA3AF] italic">Sin equipo asignado.</p>
        )}
        {docentes.map((d) => (
          <div key={`doc-${d.id}`} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#3B82F6] flex items-center justify-center">
              <span className="text-xs text-white font-semibold">
                {iniciales(d.nombre, d.apellido)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#374151]">
                {d.nombre} {d.apellido}
              </p>
              <p className="text-xs text-[#6B7280]">Docente</p>
            </div>
          </div>
        ))}
        {padres.map((p) => (
          <div key={`pad-${p.id}`} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center">
              <span className="text-xs text-white font-semibold">
                {iniciales(p.nombre, p.apellido)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#374151]">
                {p.nombre} {p.apellido}
              </p>
              <p className="text-xs text-[#6B7280]">Familia</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
