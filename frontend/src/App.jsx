import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ui/ProtectedRoute.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import RegisterPaciente from './pages/auth/RegisterPaciente.jsx'
import Dashboard from './pages/profesional/Dashboard.jsx'
import PacienteDashboard from './pages/paciente/Dashboard.jsx'
import VideoLlamada from './pages/VideoLlamada.jsx'
import Buscar from './pages/public/Buscar.jsx'
import PerfilPublico from './pages/public/PerfilPublico.jsx'
import Landing from './pages/public/Landing.jsx'
function AdminDashboard() { return <h1>Dashboard Admin (en construcción)</h1> }

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/registro-paciente" element={<RegisterPaciente />} />
        <Route path="/buscar" element={<Buscar />} />
        <Route path="/p/:slug" element={<PerfilPublico />} />

        {/* Profesional */}
        <Route path="/profesional/*" element={
          <ProtectedRoute role="profesional">
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Paciente */}
        <Route path="/paciente/*" element={
          <ProtectedRoute role="paciente">
            <PacienteDashboard />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/*" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Videollamada — accesible para profesional y paciente */}
        <Route path="/video/:sesionId" element={
          <ProtectedRoute>
            <VideoLlamada />
          </ProtectedRoute>
        } />

        {/* Redirect default */}
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
