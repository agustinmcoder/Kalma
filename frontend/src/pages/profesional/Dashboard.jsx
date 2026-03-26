import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import Agenda from './Agenda.jsx'
import Pacientes from './Pacientes.jsx'
import Pagos from './Pagos.jsx'
import Documentos from './Documentos.jsx'
import Reportes from './Reportes.jsx'
import MiPerfil from './MiPerfil.jsx'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const nombre = user?.user_metadata?.nombre || 'Profesional'

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>Kalma</div>
        <nav style={styles.nav}>
          <NavLink to="/profesional/agenda" style={navStyle}>Agenda</NavLink>
          <NavLink to="/profesional/pacientes" style={navStyle}>Pacientes</NavLink>
          <NavLink to="/profesional/documentos" style={navStyle}>Documentos</NavLink>
          <NavLink to="/profesional/pagos" style={navStyle}>Pagos</NavLink>
          <NavLink to="/profesional/reportes" style={navStyle}>Reportes</NavLink>
          <NavLink to="/profesional/mi-perfil" style={navStyle}>Mi perfil</NavLink>
        </nav>
        <div style={styles.footer}>
          <span style={{ fontSize: 13 }}>{nombre}</span>
          <button onClick={signOut} style={styles.signOut}>Salir</button>
        </div>
      </aside>

      <main style={styles.main}>
        <Routes>
          <Route index element={<Navigate to="agenda" replace />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="documentos" element={<Documentos />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="mi-perfil" element={<MiPerfil />} />
          <Route path="pagos" element={<Pagos />} />
        </Routes>
      </main>
    </div>
  )
}

function PlaceholderPage({ title }) {
  return <div style={{ padding: 16 }}><h2>{title}</h2><p>En construcción.</p></div>
}

function navStyle({ isActive }) {
  return {
    display: 'block',
    padding: '10px 16px',
    borderRadius: 8,
    textDecoration: 'none',
    color: isActive ? '#3b2a1a' : '#c9b8aa',
    background: isActive ? '#f5e6d8' : 'transparent',
    marginBottom: 4,
    fontSize: 14,
    fontWeight: isActive ? 600 : 400,
  }
}

const styles = {
  layout: { display: 'flex', height: '100vh', fontFamily: 'Georgia, "Times New Roman", serif' },
  sidebar: { width: 210, background: '#3b2a1a', display: 'flex', flexDirection: 'column', padding: '20px 12px', flexShrink: 0 },
  logo: { color: '#f5e6d8', fontSize: 22, fontWeight: 700, marginBottom: 28, paddingLeft: 8, letterSpacing: 1 },
  nav: { flex: 1 },
  footer: { display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 8 },
  signOut: { background: 'none', border: '1px solid #6b5040', color: '#c9b8aa', borderRadius: 6, padding: '7px 0', cursor: 'pointer', fontSize: 13 },
  main: { flex: 1, overflowY: 'auto', background: '#fdf8f3' },
}
