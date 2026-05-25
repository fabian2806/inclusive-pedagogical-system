import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, GraduationCap, ShieldCheck, UserCog, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

//Data mock de estados del sistema
const systemStats = [
  { title: "Total Usuarios", value: "47", change: "+3 este mes", icon: Users, color: "#3B82F6" },
  { title: "Estudiantes", value: "32", change: "+5 este mes", icon: GraduationCap, color: "#8B5CF6" },
  { title: "Docentes", value: "8", change: "Sin cambios", icon: UserCog, color: "#059669" },
  { title: "Especialistas", value: "4", change: "+1 este mes", icon: ShieldCheck, color: "#F59E0B" },
]

// Data mock de actividad reciente
const recentActivity = [
  { id: 1, action: "Usuario creado", target: "Carlos Mendoza (Docente)", time: "Hace 2 horas" },
  { id: 2, action: "Estudiante registrado", target: "Ana Torres", time: "Hace 5 horas" },
  { id: 3, action: "Rol actualizado", target: "María García → SAANEE", time: "Ayer" },
  { id: 4, action: "Usuario desactivado", target: "Pedro Ruiz (Padre)", time: "Hace 2 días" },
]

// Data mock de tareas pendientes
const pendingTasks = [
  { id: 1, title: "3 usuarios pendientes de aprobación", type: "warning" },
  { id: 2, title: "2 estudiantes sin docente asignado", type: "error" },
  { id: 3, title: "Backup semanal programado", type: "info" },
]

// Data mock de resumen de usuarios por rol
const userSummary = [
  { role: "docente", label: "Docentes", count: 8, color: "bg-[#3B82F6]" },
  { role: "padre", label: "Padres/Tutores", count: 24, color: "bg-[#8B5CF6]" },
  { role: "saanee", label: "SAANEE", count: 4, color: "bg-[#059669]" },
  { role: "admin", label: "Administradores", count: 2, color: "bg-[#1E3A5F]" },
]

export default function AdminDashboard({ userName }: { userName: string }) {
  const firstName = userName.split(" ")[0] || "Usuario"

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado principal (quizá agrandar títulos?) */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Panel de Administración</h1>
          <p className="text-sm text-[#6B7280]">
            Bienvenido, {firstName}. Gestiona usuarios, estudiantes y configuración del sistema.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="admin/usuarios">
            <Button variant="outline" className="border-[#E5E7EB] text-[#374151]">
              Gestionar usuarios
            </Button>
          </Link>
          <Link to="admin/estudiantes">
            <Button className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white">
              Gestionar estudiantes
            </Button>
          </Link>
        </div>
      </div>

      {/* Grilla de estadísticas (algo sencillo; número de usuarios por rol) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemStats.map((stat) => (
          <Card key={stat.title} className="border-[#E5E7EB]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-[#1E3A5F] mt-1">{stat.value}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{stat.change}</p>
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

      {/* Grilla principal, priorizando aspectos sencillos pero útiles */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Usuarios por rol */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#1E3A5F]">
              Usuarios por rol
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userSummary.map((item) => (
              <div key={item.role} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-[#374151]">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-[#1E3A5F]">{item.count}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#374151]">Total</span>
                <span className="text-sm font-bold text-[#1E3A5F]">38</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tareas pendientes (considerar agregar tabla adicional) */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#1E3A5F] flex items-center gap-2">
              Tareas pendientes
              <Badge variant="outline" className="text-[10px] border-[#F59E0B] text-[#F59E0B] bg-[#FEF3C7]">
                {pendingTasks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-lg border flex items-start gap-3 ${
                  task.type === "error"
                    ? "bg-[#FEF2F2] border-[#FECACA]"
                    : task.type === "warning"
                    ? "bg-[#FEF3C7] border-[#FDE68A]"
                    : "bg-[#EEF2FF] border-[#C7D2FE]"
                }`}
              >
                <AlertCircle
                  size={16}
                  className={`mt-0.5 shrink-0 ${
                    task.type === "error"
                      ? "text-[#DC2626]"
                      : task.type === "warning"
                      ? "text-[#D97706]"
                      : "text-[#3B82F6]"
                  }`}
                />
                <p className="text-sm text-[#374151]">{task.title}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actividad reciente (considerar agregar tabla adicional) */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#1E3A5F]">
              Actividad reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#3B82F6] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#374151]">
                    <span className="font-medium">{activity.action}:</span> {activity.target}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas orientadas a creación (súper útil) */}
      <Card className="border-[#E5E7EB]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[#1E3A5F]">
            Acciones rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link to="admin/usuarios?action=new&role=docente">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-[#E5E7EB] hover:border-[#3B82F6] hover:bg-[#EEF2FF]">
                <UserCog size={20} className="text-[#3B82F6]" />
                <span className="text-xs text-[#374151]">Nuevo Docente</span>
              </Button>
            </Link>
            <Link to="admin/usuarios?action=new&role=padre">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-[#E5E7EB] hover:border-[#8B5CF6] hover:bg-[#F3E8FF]">
                <Users size={20} className="text-[#8B5CF6]" />
                <span className="text-xs text-[#374151]">Nuevo Padre</span>
              </Button>
            </Link>
            <Link to="admin/usuarios?action=new&role=saanee">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-[#E5E7EB] hover:border-[#059669] hover:bg-[#ECFDF5]">
                <ShieldCheck size={20} className="text-[#059669]" />
                <span className="text-xs text-[#374151]">Nuevo SAANEE</span>
              </Button>
            </Link>
            <Link to="admin/estudiantes?action=new">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-[#E5E7EB] hover:border-[#F59E0B] hover:bg-[#FEF3C7]">
                <GraduationCap size={20} className="text-[#F59E0B]" />
                <span className="text-xs text-[#374151]">Nuevo Estudiante</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  
}