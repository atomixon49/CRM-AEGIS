import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth'

export function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="p-6">Cargando…</div>
  if (!session) return <Navigate to="/login" replace />
  return children
}
