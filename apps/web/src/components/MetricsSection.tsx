import { Users, Target, Accessibility} from "lucide-react"
import { MetricCard } from "@/components/MetricCard"

const stats = [
  {
    icon: Users,
    value: "3",
    label: "Roles integrados",
    sub: "Docente · Familia · SAANEE",
  },
  {
    icon: Target,
    value: "360°",
    label: "Seguimiento longitudinal",
    sub: "Evolución pedagógica continua",
  },
  {
    icon: Accessibility,
    value: "100%",
    label: "Información centralizada",
    sub: "Gestión unificada para el seguimiento pedagógico",
  }
]

export function MetricsSection() {
  return (
    <section id="beneficios" className="bg-[#1E3A5F] py-12">
      <div className="max-w-6xl mx-auto px-6"
        style={{
          background: "linear-gradient(135deg, #1E3A5F 0%, #312e81 100%)",
          borderRadius: "1rem",
        }}
      >
        <div className="rounded-xl py-10 px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {stats.map((stat) => (
                <MetricCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
