import { Heart, Mail, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { UsuarioSimpleResponse } from "@/types/api"

interface Props {
  padres: UsuarioSimpleResponse[]
}

export function ContactosFamiliaresCard({ padres }: Props) {
  return (
    <Card className="border-[#E5E7EB]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-[#1E3A5F] flex items-center gap-2">
          <Heart size={16} className="text-[#EF4444]" />
          Contactos familiares
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {padres.length === 0 ? (
          <p className="text-xs text-[#9CA3AF] italic">
            Sin contactos familiares registrados.
          </p>
        ) : (
          padres.map((p) => (
            <div key={p.id} className="space-y-1">
              <p className="text-sm font-medium text-[#374151]">
                {p.nombre} {p.apellido}
              </p>
              <p className="text-xs text-[#6B7280]">Familia</p>
              {p.telefono && (
                <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                  <Phone size={12} />
                  {p.telefono}
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                <Mail size={12} />
                {p.correo}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
