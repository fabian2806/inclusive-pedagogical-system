"use client"

import { Calendar, Users, Clock, ChevronRight, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

// ── Mock data ────────────────────────────────────────────────────────────────

const kpis = [
  {
    label: "Solicitudes activas",
    value: "5",
    sub: "2 sin responder",
    icon: Calendar,
    color: { bg: "#FDF4FF", icon: "#D946EF", text: "#A21CAF", sub: "#C026D3" },
  },
  {
    label: "Estudiantes activos",
    value: "9",
    sub: "3 prioritarios",
    icon: Users,
    color: { bg: "#EFF6FF", icon: "#3B82F6", text: "#1D4ED8", sub: "#2563EB" },
  },
]

const solicitudes = [
  {
    id: "s1",
    title: "Evaluación auditiva — Sofía Rodríguez",
    docente: "Prof. María Castro",
    date: "6 May 2026",
    time: "9:00 AM",
    student: "SR",
    studentPriority: false,
    status: "pendiente",
  },
  {
    id: "s2",
    title: "Ajuste de estrategias LSP — Carlos Mendoza",
    docente: "Prof. Ana Torres",
    date: "8 May 2026",
    time: "11:00 AM",
    student: "CM",
    studentPriority: true,
    status: "pendiente",
  },
  {
    id: "s3",
    title: "Taller comunicación visual — Ana García",
    docente: "Prof. María Castro",
    date: "9 May 2026",
    time: "2:00 PM",
    student: "AG",
    studentPriority: false,
    status: "confirmado",
  },
  {
    id: "s4",
    title: "Seguimiento plan — Luis Vargas",
    docente: "Prof. Rosa Lima",
    date: "12 May 2026",
    time: "10:30 AM",
    student: "LV",
    studentPriority: true,
    status: "pendiente",
  },
]

const proximosEventos = [
  {
    id: "e1",
    title: "Evaluación auditiva — Sofía R.",
    date: "Mié 6",
    time: "9:00 AM",
    type: "solicitud_saanee",
  },
  {
    id: "e2",
    title: "Ajuste estrategias — Carlos M.",
    date: "Vie 8",
    time: "11:00 AM",
    type: "solicitud_saanee",
  },
  {
    id: "e3",
    title: "Taller comunicación — Ana G.",
    date: "Sáb 9",
    time: "2:00 PM",
    type: "solicitud_saanee",
  },
]

// ── Component ────────────────────────────────────────────────────────────────

export default function SaaaneeDashboard({ userName }: { userName: string }) {
  const firstName = userName.split(" ")[0]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Bienvenido, {firstName}</h1>
          <p className="text-sm text-[#6B7280]">
            Aquí están tus solicitudes de apoyo pendientes y tus próximos eventos.
          </p>
        </div>
        <Link to="/dashboard/eventos">
          <Button className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white text-sm gap-2">
            <Calendar size={15} />
            Ver todos los eventos
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

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Solicitudes de apoyo recibidas */}
        <Card className="lg:col-span-2 border-[#E5E7EB]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-[#1E3A5F]">Solicitudes de apoyo</CardTitle>
                <p className="text-xs text-[#6B7280] mt-0.5">Apoyo SAANEE solicitado por docentes</p>
              </div>
              <Link to="/dashboard/eventos">
                <Button variant="ghost" size="sm" className="text-[#3B82F6] text-xs gap-1">
                  Ver todas
                  <ChevronRight size={13} />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {solicitudes.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[#F3F4F6] hover:border-[#E5E7EB] hover:bg-[#FAFAFA] transition-colors cursor-pointer"
              >
                {/* Avatar estudiante */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                  s.studentPriority ? "bg-[#FEF3C7] text-[#D97706]" : "bg-[#EFF6FF] text-[#2563EB]"
                }`}>
                  {s.student}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1E3A5F] truncate">{s.title}</p>
                  <p className="text-xs text-[#9CA3AF]">{s.docente}</p>
                </div>

                {/* Fecha */}
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-[#374151]">{s.date}</p>
                  <p className="text-xs text-[#9CA3AF]">{s.time}</p>
                </div>

                {/* Estado */}
                {s.status === "pendiente" ? (
                  <div className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" title="Pendiente" />
                ) : (
                  <CheckCircle size={15} className="text-[#059669] shrink-0" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Próximos eventos */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-[#1E3A5F]">Próximos eventos</CardTitle>
              <Link to="/dashboard/eventos">
                <Button variant="ghost" size="sm" className="text-[#3B82F6] text-xs gap-1">
                  Ver todos
                  <ChevronRight size={13} />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {proximosEventos.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar size={28} className="mx-auto text-[#D1D5DB] mb-2" />
                <p className="text-xs text-[#9CA3AF]">Sin eventos próximos</p>
              </div>
            ) : (
              proximosEventos.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[#FDF4FF] border border-[#F5D0FE] cursor-pointer hover:border-[#E879F9] transition-colors"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D946EF] mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#1E3A5F] leading-tight">{ev.title}</p>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5 flex items-center gap-1">
                      <Clock size={10} />
                      {ev.date} · {ev.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
