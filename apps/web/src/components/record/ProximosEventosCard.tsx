import { Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Datos mock — la integración real con eventos llega en la fase 3.
const upcomingEvents = [
  {
    id: "1",
    title: "Evaluación trimestral",
    date: "28 Mar 2025",
    time: "2:00 PM",
    type: "evaluacion",
  },
  {
    id: "2",
    title: "Sesión SAANEE",
    date: "1 Abr 2025",
    time: "10:00 AM",
    type: "saanee",
  },
]

export function ProximosEventosCard() {
  return (
    <Card className="border-[#E5E7EB]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-[#1E3A5F] flex items-center gap-2">
          <Calendar size={16} className="text-[#F59E0B]" />
          Próximos eventos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 p-2 rounded-lg bg-[#F9FAFB]"
          >
            <div
              className={`w-2 h-2 rounded-full mt-1.5 ${
                event.type === "evaluacion" ? "bg-[#8B5CF6]" : "bg-[#10B981]"
              }`}
            />
            <div>
              <p className="text-sm font-medium text-[#374151]">{event.title}</p>
              <p className="text-xs text-[#6B7280]">
                {event.date} · {event.time}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
