import { FileText, CalendarCheck, MessageSquare } from "lucide-react"
import { FeatureCard } from "@/components/FeatureCard"

const modules = [
  {
    icon: FileText,
    title: "Expediente Nominal Digital",
    description:
      "Historial pedagógico completo, evolución, indicadores e informes en un solo lugar.",
  },
  {
    icon: CalendarCheck,
    title: "Coordinación y Eventos",
    description:
      "Agenda compartida, citaciones, confirmación de asistencia y registro de resultados.",
  },
  {
    icon: MessageSquare,
    title: "Comunicación en Tiempo Real",
    description:
      "Observaciones diarias, notificaciones y seguimiento conjunto con las familias.",
  },
]

export function FeaturesSection() {
  return (
    <section id="modulos" className="bg-[#F3F4F6] py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-xl font-bold text-[#1E3A5F] text-center mb-8">
          ¿Qué incluye el sistema?
        </h2>

        <div className="grid md:grid-cols-3 gap-5">
          {modules.map((mod) => (
            <FeatureCard
              key={mod.title}
              title={mod.title}
              description={mod.description}
              icon={mod.icon}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
