import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";


export function DashboardTopbar() {

    const [currentDate, setCurrentDate] = useState<string>("")

    useEffect(() => {
        setCurrentDate(
            new Date().toLocaleDateString("es-PE", {
                weekday: "long",
                day: "numeric",
                month: "long",
            })
        )
    }, [])

    return (
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-[#E5E7EB] bg-white px-4">
            {/*Para colapsar el sidebar*/}
            <SidebarTrigger className="text-[#6B7280] hover:text-[#1E3A5F]" />

            {/* Sección de búsqueda. Considerar si realmente será utilizada... */}
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                <Input
                    placeholder="Buscar..."
                    className="pl-9 h-9 bg-[#F9FAFB] border-[#E5E7EB] text-sm focus-visible:ring-[#3B82F6]"
                />
            </div>

            {/* Notificaciones con dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative text-[#6B7280] hover:text-[#1E3A5F]">
                        <Bell size={18} />
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#EF4444] text-[10px] font-semibold text-white flex items-center justify-center">
                            3
                        </span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="text-[#1E3A5F]">Notificaciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* 3 notificaciones mock */}
                    <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                        <p className="text-sm font-medium text-[#1E3A5F]">Nueva entrada en bitácora</p>
                        <p className="text-xs text-[#6B7280]">Especialista SAANEE agregó observación para Sofía R.</p>
                        <p className="text-xs text-[#9CA3AF]">Hace 15 minutos</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                        <p className="text-sm font-medium text-[#1E3A5F]">Evento programado</p>
                        <p className="text-xs text-[#6B7280]">Reunión con familia de Carlos M. - Mañana 10:00 AM</p>
                        <p className="text-xs text-[#9CA3AF]">Hace 1 hora</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                        <p className="text-sm font-medium text-[#1E3A5F]">Archivo compartido</p>
                        <p className="text-xs text-[#6B7280]">Informe mensual de Ana G. disponible</p>
                        <p className="text-xs text-[#9CA3AF]">Hace 3 horas</p>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Current date */}
            {currentDate && (
                <div className="hidden sm:block text-xs text-[#6B7280]">
                    {currentDate}
                </div>
            )}
        </header>
    );
}