import { Users, Calendar, FileText, Bell, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"

// Mock data - in production this would come from the database
const stats = [
  {
    title: "Estudiantes asignados",
    value: "12",
    description: "2 con seguimiento prioritario",
    icon: Users,
    color: "#3B82F6",
  },
  {
    title: "Eventos esta semana",
    value: "4",
    description: "Próximo: Mañana 10:00",
    icon: Calendar,
    color: "#8B5CF6",
  },
  {
    title: "Entradas pendientes",
    value: "3",
    description: "Bitácoras por actualizar",
    icon: FileText,
    color: "#F59E0B",
  },
  {
    title: "Notificaciones",
    value: "7",
    description: "3 sin leer",
    icon: Bell,
    color: "#EF4444",
  },
]

const recentStudents = [
  {
    id: "1",
    name: "Sofía Rodríguez",
    grade: "3° Primaria",
    lastUpdate: "Hace 2 horas",
    status: "activo",
    initials: "SR",
  },
  {
    id: "2",
    name: "Carlos Mendoza",
    grade: "4° Primaria",
    lastUpdate: "Hace 1 día",
    status: "prioritario",
    initials: "CM",
  },
  {
    id: "3",
    name: "Ana García",
    grade: "2° Primaria",
    lastUpdate: "Hace 3 días",
    status: "activo",
    initials: "AG",
  },
]

const upcomingEvents = [
  {
    id: "1",
    title: "Reunión con familia Mendoza",
    date: "Mañana",
    time: "10:00 AM",
    type: "reunion",
  },
  {
    id: "2",
    title: "Evaluación trimestral - Sofía R.",
    date: "Miércoles",
    time: "2:00 PM",
    type: "evaluacion",
  },
  {
    id: "3",
    title: "Sesión SAANEE - Carlos M.",
    date: "Jueves",
    time: "11:30 AM",
    type: "saanee",
  },
]

const recentActivity = [
  {
    id: "1",
    action: "Nueva observación agregada",
    student: "Sofía Rodríguez",
    by: "Esp. Roberto Quispe",
    time: "Hace 15 min",
  },
  {
    id: "2",
    action: "Archivo subido",
    student: "Carlos Mendoza",
    by: "Familia Mendoza",
    time: "Hace 1 hora",
  },
  {
    id: "3",
    action: "Evento confirmado",
    student: "Ana García",
    by: "Prof. María Castro",
    time: "Hace 3 horas",
  },
]

export default function TeacherDashboard({ userName }: { userName: string }) {
  const firstName = userName.split(" ")[0] || "Usuario"

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">
              Bienvenida, {firstName}
            </h1>
            <p className="text-sm text-[#6B7280]">
              Aquí tienes un resumen de tu actividad y estudiantes asignados.
            </p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button asChild variant="outline" className="border-[#E5E7EB] text-[#374151]">
            <Link to="/dashboard/estudiantes">
              Ver estudiantes
            </Link>
          </Button>

          <Button asChild className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white">
            <Link to="/dashboard/eventos">
              Nuevo evento
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-[#E5E7EB]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-[#1E3A5F] mt-1">{stat.value}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{stat.description}</p>
                </div>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Students */}
        <Card className="lg:col-span-2 border-[#E5E7EB]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-[#1E3A5F]">Estudiantes recientes</CardTitle>
                <CardDescription className="text-[#6B7280]">
                  Últimas actualizaciones en expedientes
                </CardDescription>
              </div>
              <Link to="/dashboard/estudiantes">
                <Button variant="ghost" size="sm" className="text-[#3B82F6] hover:text-[#2563EB]">
                  Ver todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentStudents.map((student) => (
                <Link
                  key={student.id}
                  to={`/dashboard/estudiantes/${student.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#F9FAFB] transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback
                      className={`text-xs font-semibold ${
                        student.status === "prioritario"
                          ? "bg-[#FEF3C7] text-[#D97706]"
                          : "bg-[#EEF2FF] text-[#3B82F6]"
                      }`}
                    >
                      {student.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#1E3A5F] truncate">
                        {student.name}
                      </p>
                      {student.status === "prioritario" && (
                        <Badge variant="outline" className="text-[10px] border-[#F59E0B] text-[#D97706] bg-[#FEF3C7]">
                          Prioritario
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#6B7280]">{student.grade}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                    <Clock size={12} />
                    {student.lastUpdate}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-[#1E3A5F]">Próximos eventos</CardTitle>
              <Link to="/dashboard/eventos">
                <Button variant="ghost" size="sm" className="text-[#3B82F6] hover:text-[#2563EB]">
                  Ver todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[#F9FAFB]"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      event.type === "reunion"
                        ? "bg-[#3B82F6]"
                        : event.type === "evaluacion"
                        ? "bg-[#8B5CF6]"
                        : "bg-[#10B981]"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1E3A5F] truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {event.date} · {event.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-[#E5E7EB]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-[#1E3A5F]">Actividad reciente</CardTitle>
              <CardDescription className="text-[#6B7280]">
                Últimas acciones en tus estudiantes
              </CardDescription>
            </div>
            <TrendingUp size={18} className="text-[#9CA3AF]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-[#3B82F6] mt-2" />
                  {index < recentActivity.length - 1 && (
                    <div className="absolute top-4 left-0.75 w-px h-full bg-[#E5E7EB]" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium text-[#1E3A5F]">{activity.action}</p>
                  <p className="text-xs text-[#6B7280]">
                    {activity.student} · por {activity.by}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}