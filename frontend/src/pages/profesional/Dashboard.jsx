import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import Agenda from './Agenda.jsx'

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
          <Route path="pacientes" element={<PlaceholderPage title="Pacientes" />} />
          <Route path="documentos" element={<PlaceholderPage title="Documentos" />} />
          <Route path="pagos" element={<PlaceholderPage title="Pagos" />} />
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
    borderRadius: 6,
    textDecoration: 'none',
    color: isActive ? 'white' : '#cbd5e1',
    background: isActive ? '#3b82f6' : 'transparent',
    marginBottom: 4,
    fontSize: 14,
  }
}

const styles = {
  layout: { display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' },
  sidebar: { width: 200, background: '#1e293b', display: 'flex', flexDirection: 'column', padding: 16, flexShrink: 0 },
  logo: { color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 24 },
  nav: { flex: 1 },
  footer: { display: 'flex', flexDirection: 'column', gap: 8 },
  signOut: { background: 'none', border: '1px solid #475569', color: '#94a3b8', borderRadius: 4, padding: '6px 0', cursor: 'pointer', fontSize: 13 },
  main: { flex: 1, overflowY: 'auto', background: '#f8fafc' },
}
