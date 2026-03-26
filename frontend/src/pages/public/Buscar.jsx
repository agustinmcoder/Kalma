import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://kalma-api.agusmcoder.workers.dev'

const TIPOS = [
  { value: '', label: 'Todos' },
  { value: 'psicologo', label: 'Psicólogo/a' },
  { value: 'psiquiatra', label: 'Psiquiatra' },
  { value: 'nutricionista', label: 'Nutricionista' },
]

export default function Buscar() {
  const [profesionales, setProfesionales] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({ q: '', tipo: '', zona: '' })

  useEffect(() => {
    buscar()
  }, [filtros.tipo])

  async function buscar(e) {
    if (e) e.preventDefault()
    setLoading(true)
    const params = new URLSearchParams()
    if (filtros.tipo) params.set('tipo', filtros.tipo)
    if (filtros.zona) params.set('zona', filtros.zona)
    if (filtros.q) params.set('q', filtros.q)
    const res = await fetch(`${API_URL}/perfil/buscar?${params}`)
    const data = await res.json()
    setProfesionales(data.profesionales || [])
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fdf8f3', fontFamily: 'Georgia, serif' }}>
      <header style={{ background: '#3b2a1a', color: '#f5e6d8', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1, color: '#f5e6d8', textDecoration: 'none' }}>Kalma</Link>
        <Link to="/login" style={{ color: '#c9b8aa', fontSize: 13, textDecoration: 'none', border: '1px solid #6b5040', borderRadius: 6, padding: '6px 14px' }}>
          Ingresar
        </Link>
      </header>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: 28 }}>
        <h2 style={{ color: '#3b2a1a', marginBottom: 20 }}>Encontrá tu profesional</h2>

        {/* Filtros */}
        <form onSubmit={buscar} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
          <input
            placeholder="Nombre..."
            value={filtros.q}
            onChange={e => setFiltros(f => ({ ...f, q: e.target.value }))}
            style={sInput}
          />
          <input
            placeholder="Zona / ciudad..."
            value={filtros.zona}
            onChange={e => setFiltros(f => ({ ...f, zona: e.target.value }))}
            style={sInput}
          />
          <select value={filtros.tipo} onChange={e => setFiltros(f => ({ ...f, tipo: e.target.value }))} style={sInput}>
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <button type="submit" style={sBtn}>Buscar</button>
        </form>

        {loading && <p style={{ color: '#9b8878' }}>Buscando...</p>}

        {!loading && profesionales.length === 0 && (
          <p style={{ color: '#9b8878' }}>No se encontraron profesionales.</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {profesionales.map(p => (
            <Link key={p.id} to={`/p/${p.slug}`} style={{ textDecoration: 'none' }}>
              <div style={sCard}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e8d5c4', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#9b8878' }}>
                    {p.foto_url ? <img src={p.foto_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#3b2a1a', fontSize: 15 }}>{p.nombre} {p.apellido}</div>
                    <div style={{ fontSize: 12, color: '#9b8878', marginTop: 2 }}>{TIPOS.find(t => t.value === p.tipo)?.label || p.tipo}</div>
                    {p.zona && <div style={{ fontSize: 12, color: '#9b8878' }}>📍 {p.zona}</div>}
                  </div>
                </div>
                {p.orientacion && <p style={{ fontSize: 13, color: '#7a5c45', margin: '10px 0 0', lineHeight: 1.4 }}>{p.orientacion}</p>}
                {p.precio_consulta && (
                  <div style={{ marginTop: 8, fontSize: 13, color: '#065f46', fontWeight: 500 }}>
                    ${Number(p.precio_consulta).toLocaleString('es-AR')} / sesión
                  </div>
                )}
                <div style={{ marginTop: 10, fontSize: 12, color: '#c47a4a', fontWeight: 500 }}>Ver perfil →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

const sInput = { padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd0c4', background: 'white', fontSize: 14, color: '#3b2a1a', flex: '1 1 180px' }
const sBtn = { background: '#c47a4a', color: 'white', border: 'none', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontSize: 14 }
const sCard = { background: 'white', border: '1px solid #f0e4d8', borderRadius: 10, padding: '16px 18px', boxShadow: '0 1px 4px rgba(80,40,0,0.07)', transition: 'box-shadow 0.15s', cursor: 'pointer' }
