import AdminDashboard from "@/components/dashboard/AdminDashboard"
import ParentDashboard from "@/components/dashboard/ParentDashboard"
import SaaneeDashboard from "@/components/dashboard/SaaneeDashboard"
import TeacherDashboard from "@/components/dashboard/TeacherDashboard"
import { useAuth } from "@/hooks/useAuth"


{/*Para el dashboard, considerando las diferencias marcadas entre roles para esta sección (cada uno 
  espera ver información diferente), definimos 4 componentes diferentes para cada vista por rol*/}
export default function Dashboard() {
  const { user } = useAuth()

  const getDashboardContent = () => {
    switch (user?.rol) {
      case 'docente':
        return (
          <TeacherDashboard />
        )
      case 'padre':
        return (
          <ParentDashboard />
        )
      case 'saanee':
        return (
          <SaaneeDashboard userName={user?.nombre} />
        )
      case 'admin':
        return (
          <AdminDashboard />
        )
      default:
        return null
    }
  }

  return (
    <section>
      {getDashboardContent()}
    </section>
  )
}