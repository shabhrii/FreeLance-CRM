import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function ProtectedRoute() {
  const { user, loading } = useAuthStore()

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
