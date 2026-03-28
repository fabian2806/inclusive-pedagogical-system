import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Outlet } from "react-router-dom"

export default function DashboardLayout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <main className="flex-1 overflow-auto bg-[#F9FAFB]">
                    <p>Hola</p>
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}