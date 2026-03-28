import { AppSidebar } from "@/components/AppSidebar"
import { DashboardTopbar } from "@/components/DashboardTopbar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Outlet } from "react-router-dom"

export default function DashboardLayout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <DashboardTopbar />
                <main className="flex-1 overflow-auto bg-[#F9FAFB]">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}