import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

// Wrapper que protege rutas por rol
// Uso: <ProtectedRoute role="profesional"><Dashboard /></ProtectedRoute>
export default function ProtectedRoute({ children, role }) {
  const { user, role: userRole, loading } = useAuth()

  if (loading) return <p>Cargando...</p>
  if (!user) return <Navigate to="/login" replace />
  if (role && userRole !== role) return <Navigate to="/login" replace />

  return children
}
