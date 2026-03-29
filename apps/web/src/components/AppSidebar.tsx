import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth";
import { getRoleDisplayName, getRoleColor } from "@/lib/roles"
import { BarChart3, Calendar, FileText, GraduationCap, LayoutDashboard, LogOut, MessageSquare, Settings, Shield, UserCog, Users } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, 
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

//Opciones del sidebar de acuerdo al rol del usuario (por ahora algunas opciones son referenciales, pueden variar según necesidades)
const menuConfig: Record<UserRole, { title: string; url: string; icon: typeof LayoutDashboard }[]> = {
    admin: [
        { title: "Inicio", url: "/dashboard", icon: LayoutDashboard },
        { title: "Usuarios", url: "/dashboard/admin/usuarios", icon: UserCog },
        { title: "Estudiantes", url: "/dashboard/admin/estudiantes", icon: Users },
        { title: "Eventos", url: "/dashboard/admin/eventos", icon: Calendar },
        { title: "Reportes", url: "/dashboard/admin/reportes", icon: BarChart3 },
    ],
    docente: [
        { title: "Inicio", url: "/dashboard", icon: LayoutDashboard },
        { title: "Estudiantes", url: "/dashboard/estudiantes", icon: Users },
        { title: "Eventos", url: "/dashboard/eventos", icon: Calendar },
        { title: "Informes", url: "/dashboard/informes", icon: FileText },
    ],
    padre: [
        { title: "Inicio", url: "/dashboard", icon: LayoutDashboard },
        { title: "Mi Hijo/a", url: "/dashboard/estudiantes/1", icon: Users },
        { title: "Comunicación", url: "/dashboard/comunicacion", icon: MessageSquare },
        { title: "Eventos", url: "/dashboard/eventos", icon: Calendar },
    ],
    saanee: [
        { title: "Inicio", url: "/dashboard", icon: LayoutDashboard },
        { title: "Estudiantes", url: "/dashboard/estudiantes", icon: Users },
        { title: "Evaluaciones", url: "/dashboard/evaluaciones", icon: FileText },
        { title: "Eventos", url: "/dashboard/eventos", icon: Calendar },
        { title: "Coordinación", url: "/dashboard/coordinacion", icon: Shield },
    ],
}

//Opciones comunes a todos los roles (por ahora algunas opciones son referenciales, pueden variar según necesidades)
const secondaryItems = [
    { title: "Configuración", url: "/dashboard/configuracion", icon: Settings },
]

//Label a mostrar en el panel de acuerdo al rol
const panelLabels: Record<UserRole, string> = {
  admin: "Panel Admin",
  docente: "Panel Docente",
  padre: "Panel Familiar",
  saanee: "Panel SAANEE",
}

export function AppSidebar() {

    const location = useLocation()
    const pathname = location.pathname 

    const { user, logout } = useAuth()

    // Default to docente menu if no user (fallback)
    const rol = user?.rol || "docente"
    const menuItems = menuConfig[rol]
    const rolColor = getRoleColor(rol)

    return (
    <Sidebar className="border-r border-[#E5E7EB]">
      <SidebarHeader className="p-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#1E3A5F]">SignaEdu</span>
            <span className="text-[10px] text-[#6B7280]">{panelLabels[rol]}</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-semibold">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = 
                  pathname === item.url || 
                  (pathname.startsWith(item.url + "/") && item.url !== "/dashboard")
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="data-[active=true]:bg-[#EEF2FF] data-[active=true]:text-[#3B82F6] hover:bg-[#F3F4F6]"
                    >
                      <Link to={item.url}>
                        <item.icon size={18} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-semibold">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="data-[active=true]:bg-[#EEF2FF] data-[active=true]:text-[#3B82F6] hover:bg-[#F3F4F6]"
                  >
                    <Link to={item.url}>
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarSeparator className="mb-4" />
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className={`${rolColor.bg} ${rolColor.text} text-xs font-semibold`}>
              {user?.nombre?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "US"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1E3A5F] truncate">{user?.nombre || "Usuario"}</p>
            <p className="text-xs text-[#6B7280] truncate">{getRoleDisplayName(rol)}</p>
          </div>
          <button
            onClick={logout}
            className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )

}