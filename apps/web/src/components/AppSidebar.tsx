import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth";
import { getRoleDisplayName, getRoleColor } from "@/lib/roles"
import { Calendar, FolderCog, GraduationCap, LayoutDashboard, LogOut, Settings, Target, UserCog, Users } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type MenuItem = {
    title: string
    url?: string
    icon: typeof LayoutDashboard
    disabled?: boolean
    badge?: string
}

// Items del sidebar por rol. Los items con `disabled: true` corresponden a
// módulos planificados para Fase 4 (eventos / coordinación) y se muestran
// como placeholders no clickeables.
const menuConfig: Record<UserRole, MenuItem[]> = {
    admin: [
        { title: "Inicio", url: "/dashboard", icon: LayoutDashboard },
        { title: "Usuarios", url: "/dashboard/admin/usuarios", icon: UserCog },
        { title: "Estudiantes", url: "/dashboard/admin/estudiantes", icon: Users },
        { title: "Tipos Documento", url: "/dashboard/admin/tipos-documento", icon: FolderCog },
        { title: "Eventos", icon: Calendar, disabled: true, badge: "Próximamente" },
        { title: "Configuración", url: "/dashboard/admin/configuracion", icon: Settings },
    ],
    docente: [
        { title: "Inicio", url: "/dashboard", icon: LayoutDashboard },
        { title: "Estudiantes", url: "/dashboard/estudiantes", icon: Users },
        { title: "Indicadores", url: "/dashboard/indicadores", icon: Target },
        { title: "Eventos", icon: Calendar, disabled: true, badge: "Próximamente" },
    ],
    padre: [
        { title: "Inicio", url: "/dashboard", icon: LayoutDashboard },
        { title: "Mis Hijos", url: "/dashboard/estudiantes", icon: Users },
        { title: "Eventos", icon: Calendar, disabled: true, badge: "Próximamente" },
    ],
    saanee: [
        { title: "Inicio", url: "/dashboard", icon: LayoutDashboard },
        { title: "Estudiantes", url: "/dashboard/estudiantes", icon: Users },
        { title: "Eventos", icon: Calendar, disabled: true, badge: "Próximamente" },
    ],
}

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
                if (item.disabled) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        disabled
                        aria-disabled="true"
                        className="opacity-50 cursor-not-allowed"
                      >
                        <item.icon size={18} />
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="ml-auto text-[9px] px-1.5 py-0 h-4 font-normal"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                const url = item.url!
                const isActive =
                  pathname === url ||
                  (pathname.startsWith(url + "/") && url !== "/dashboard")

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="data-[active=true]:bg-[#EEF2FF] data-[active=true]:text-[#3B82F6] hover:bg-[#F3F4F6]"
                    >
                      <Link to={url}>
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
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarSeparator className="mb-4" />
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className={`${rolColor.bg} ${rolColor.text} text-xs font-semibold`}>
              {((user?.nombre?.[0] ?? "") + (user?.apellido?.[0] ?? "")).toUpperCase() || "US"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1E3A5F] truncate">{user ? `${user.nombre} ${user.apellido}` : "Usuario"}</p>
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
