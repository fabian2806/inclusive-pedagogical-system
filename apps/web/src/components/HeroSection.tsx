import { ShieldCheck, CheckCircle2 } from "lucide-react"
import heroStudent from "@/assets/hero-student.jpg"

export function HeroSection() {
  return (
    <section id="inicio" className="bg-white pt-6 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Badge */}
        <div className="mb-6">
          <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-[#EEF2FF] text-[#8B5CF6] border border-[#C4B5FD]">
            Garantizando el seguimiento pedagógico.
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left: Copy */}
          <div>
            <h1 className="text-3xl lg:text-[2.6rem] font-extrabold text-[#1E3A5F] leading-[1.15] text-balance mb-3">
              Sistema de Información para el Seguimiento de Estudiantes con Discapacidad Auditiva
            </h1>

            <p className="text-base font-semibold text-[#374151] mb-3">
              Gestión pedagógica longitudinal, inclusiva y centrada en la familia
            </p>

            <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
              Plataforma web que digitaliza el expediente nominal del estudiante, centraliza la
              comunicación entre docentes, familias y el equipo SAANEE, y estandariza el
              seguimiento pedagógico de estudiantes con discapacidad auditiva.
            </p>

            <p className="flex items-center gap-2 text-xs text-[#9CA3AF]">
              <ShieldCheck size={13} className="text-[#6B7280]" />
              Acceso seguro para Docentes, Familias y Equipo SAANEE.
            </p>
          </div>

          {/* Right: Photo + floating badges */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#E5E7EB] aspect-4/3">
              <img
                    src={heroStudent}
                    alt="Docente y estudiante practicando lengua de señas"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>

            {/* Bottom badges */}
            <div className="absolute -bottom-3 left-3 flex gap-2">
              <div className="bg-white rounded-lg shadow-md border border-[#E5E7EB] px-3 py-2 flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#22C55E]" />
                <span className="text-xs font-semibold text-[#374151]">Seguimiento longitudinal</span>
              </div>
              <div className="bg-white rounded-lg shadow-md border border-[#E5E7EB] px-3 py-2 flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#22C55E]" />
                <span className="text-xs font-semibold text-[#374151]">Trabajo con familias</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
