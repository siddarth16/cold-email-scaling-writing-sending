import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { LoadingSpinner } from './LoadingSpinner'
import { isSupabaseConfigured } from '../lib/supabase'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  // If Supabase is not configured, allow access without authentication
  if (!isSupabaseConfigured) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
} 