import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ui/ProtectedRoute.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import RegisterPaciente from './pages/auth/RegisterPaciente.jsx'

// Placeholders — se reemplazan a medida que se construyen
function ProfesionalDashboard() { return <h1>Dashboard Profesional (en construcción)</h1> }
function PacienteDashboard() { return <h1>Dashboard Paciente (en construcción)</h1> }
function AdminDashboard() { return <h1>Dashboard Admin (en construcción)</h1> }

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/registro-paciente" element={<RegisterPaciente />} />

        {/* Profesional */}
        <Route path="/profesional/*" element={
          <ProtectedRoute role="profesional">
            <ProfesionalDashboard />
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

        {/* Redirect default */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
