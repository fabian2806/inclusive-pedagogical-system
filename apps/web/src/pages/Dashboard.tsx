import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const getDashboardContent = () => {
    switch (user?.rol) {
      case 'docente':
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
              Panel del Docente
            </h2>
          </div>
        )
      case 'padre':
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
              Panel de Familia
            </h2>
          </div>
        )
      case 'saanee':
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
              Panel SAANEE
            </h2>
          </div>
        )
      case 'admin':
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
              Panel Administrador
            </h2>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#1E3A5F] text-white p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">SignaEdu</h1>
            <p className="text-sm text-white/70">
              {user?.rol.charAt(0).toUpperCase()}{user?.rol.slice(1)} • {user?.email}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="gap-2 text-[#1E3A5F]"
          >
            <LogOut size={16} />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {getDashboardContent()}
      </main>
    </div>
  )
}