import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { type UserRole } from '@/types/auth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  requiredPermissions?: string[]
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermissions,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1E3A5F]" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />
  }

  if (requiredPermissions && requiredPermissions.length > 0 && user) {
    const tieneTodos = requiredPermissions.every((p) => user.authorities.includes(p))
    if (!tieneTodos) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}
