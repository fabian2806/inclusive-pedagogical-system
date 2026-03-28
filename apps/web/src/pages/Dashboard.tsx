import { useAuth } from "@/hooks/useAuth"

export default function Dashboard() {
  const { user } = useAuth()

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
    <section>
      {getDashboardContent()}
    </section>
  )
}