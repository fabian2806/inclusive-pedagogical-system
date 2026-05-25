import { Calendar, Users, FileText, Clock, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

// ── Mock data ────────────────────────────────────────────────────────────────

// Reuniones pendientes de confirmar por este padre
const reunionesPendientes = [
  {
    id: "r1",
    title: "Reunión de seguimiento trimestral",
    docente: "Prof. María Castro",
    student: "Sofía Rodríguez",
    studentInitials: "SR",
    date: "9 May 2026",
    time: "10:00 AM",
    modality: "Presencial",
  },
]

// Entradas nuevas hoy en el expediente del hijo
const entradasHoy = [
  {
    id: "n1",
    type: "observacion_pe",
    typeLabel: "Obs. Pedagógica",
    title: "Avance en comprensión de LSP",
    author: "Prof. María Castro",
    time: "Hace 2 horas",
    color: { bg: "#EFF6FF", border: "#93C5FD", text: "#2563EB" },
  },
  {
    id: "n2",
    type: "evaluacion_indicador",
    typeLabel: "Eval. Indicador",
    title: "COM-02: Vocabulario en LSP — 78%",
    author: "Esp. Roberto Quispe",
    time: "Hace 4 horas",
    color: { bg: "#F5F3FF", border: "#C4B5FD", text: "#7C3AED" },
  },
]

// ── Component ────────────────────────────────────────────────────────────────

export default function ParentDashboard({ userName }: { userName: string }) {
  const firstName = userName.split(" ")[0]
  const numHijos = 1
  const entradasCount = entradasHoy.length

  const kpis = [
    {
      label: "Hijos registrados",
      value: String(numHijos),
      sub: "En seguimiento activo",
      icon: Users,
      color: { bg: "#ECFDF5", icon: "#10B981", text: "#059669", sub: "#047857" },
    },
    {
      label: "Entradas hoy",
      value: String(entradasCount),
      sub: entradasCount > 0 ? "Nuevas en el expediente" : "Sin actualizaciones hoy",
      icon: FileText,
      color: { bg: "#EFF6FF", icon: "#3B82F6", text: "#1D4ED8", sub: "#2563EB" },
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Bienvenida, {firstName}</h1>
          <p className="text-sm text-[#6B7280]">
            Sigue el progreso educativo de tu hijo/a y responde a las reuniones pendientes.
          </p>
        </div>
        <Link to="/dashboard/eventos">
          <Button className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white text-sm gap-2">
            <Calendar size={15} />
            Ver eventos
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-[#E5E7EB]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest">
                    {kpi.label}
                  </p>
                  <p className="text-3xl font-bold" style={{ color: kpi.color.text }}>
                    {kpi.value}
                  </p>
                  <p className="text-xs font-medium" style={{ color: kpi.color.sub }}>
                    {kpi.sub}
                  </p>
                </div>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: kpi.color.bg }}
                >
                  <kpi.icon size={22} style={{ color: kpi.color.icon }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reuniones por confirmar */}
      <Card className="border-[#E5E7EB]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-[#1E3A5F] flex items-center gap-2">
                Reuniones por confirmar
                {reunionesPendientes.length > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#F0F9FF] border border-[#7DD3FC] text-[10px] font-bold text-[#0284C7]">
                    {reunionesPendientes.length}
                  </span>
                )}
              </CardTitle>
              <p className="text-xs text-[#6B7280] mt-0.5">Invitaciones del docente que requieren tu respuesta</p>
            </div>
            <Link to="/dashboard/eventos">
              <Button variant="ghost" size="sm" className="text-[#3B82F6] text-xs gap-1">
                Ver todas
                <ChevronRight size={13} />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {reunionesPendientes.length === 0 ? (
            <div className="py-10 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-[#F0F9FF] border-2 border-dashed border-[#BAE6FD] flex items-center justify-center mb-3">
                <Calendar size={22} className="text-[#7DD3FC]" />
              </div>
              <p className="text-sm font-medium text-[#374151]">Sin reuniones pendientes</p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                El docente no ha programado ninguna reunión contigo aún.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reunionesPendientes.map((r) => (
                <div
                  key={r.id}
                  className="flex items-start gap-4 p-4 rounded-lg border-l-4 border-[#7DD3FC] bg-[#F0F9FF]"
                >
                  {/* Estudiante avatar */}
                  <div className="w-9 h-9 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0 text-xs font-semibold text-[#2563EB]">
                    {r.studentInitials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1E3A5F]">{r.title}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{r.student} · {r.docente}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-[#374151]">
                        <Clock size={11} className="text-[#9CA3AF]" />
                        {r.date} · {r.time}
                      </span>
                      <span className="text-xs text-[#6B7280] px-2 py-0.5 bg-white rounded-full border border-[#E5E7EB]">
                        {r.modality}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link to="/dashboard/eventos" className="shrink-0 self-center">
                    <Button size="sm" className="bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs gap-1.5">
                      Responder
                      <ChevronRight size={12} />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entradas nuevas hoy */}
      <Card className="border-[#E5E7EB]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-[#1E3A5F]">Entradas nuevas hoy</CardTitle>
              <p className="text-xs text-[#6B7280] mt-0.5">Actualizaciones del expediente de tu hijo/a</p>
            </div>
            <Link to="/dashboard/estudiantes/1">
              <Button variant="ghost" size="sm" className="text-[#3B82F6] text-xs gap-1">
                Ver expediente
                <ChevronRight size={13} />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {entradasHoy.length === 0 ? (
            <div className="py-8 flex flex-col items-center text-center">
              <FileText size={28} className="text-[#D1D5DB] mb-2" />
              <p className="text-xs text-[#9CA3AF]">Sin entradas nuevas hoy</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entradasHoy.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{ backgroundColor: e.color.bg, borderColor: e.color.border }}
                >
                  <div
                    className="w-1.5 h-full min-h-8 rounded-full shrink-0"
                    style={{ backgroundColor: e.color.border }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wide"
                        style={{ color: e.color.text }}
                      >
                        {e.typeLabel}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#1E3A5F] truncate">{e.title}</p>
                    <p className="text-[11px] text-[#9CA3AF]">{e.author} · {e.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}