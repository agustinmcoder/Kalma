import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://kalma-api.agusmcoder.workers.dev'

const TIPO_LABEL = { psicologo: 'Psicólogo/a', psiquiatra: 'Psiquiatra', nutricionista: 'Nutricionista' }
const MODALIDAD_LABEL = { presencial: 'Presencial', online: 'Online', ambas: 'Presencial y online' }

export default function PerfilPublico() {
  const { slug } = useParams()
  const [profesional, setProfesional] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [solicitud, setSolicitud] = useState({ nombre_contacto: '', email_contacto: '', telefono_contacto: '', fecha_solicitada: '', mensaje: '' })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [errorSolicitud, setErrorSolicitud] = useState(null)
  const formRef = useRef()

  useEffect(() => {
    fetch(`${API_URL}/perfil/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setNotFound(true)
        else setProfesional(d.profesional)
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div style={sPage}>
      <Header />
      <p style={{ padding: 28, color: '#9b8878' }}>Cargando...</p>
    </div>
  )

  if (notFound) return (
    <div style={sPage}>
      <Header />
      <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center', color: '#9b8878' }}>
        <p>Perfil no encontrado.</p>
        <Link to="/buscar" style={{ color: '#c47a4a' }}>← Volver al buscador</Link>
      </div>
    </div>
  )

  const p = profesional

  return (
    <div style={sPage}>
      <Header />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 28 }}>
        <Link to="/buscar" style={{ fontSize: 13, color: '#9b8878', textDecoration: 'none' }}>← Volver al buscador</Link>

        <div style={{ background: 'white', border: '1px solid #f0e4d8', borderRadius: 12, padding: 28, marginTop: 16, boxShadow: '0 2px 8px rgba(80,40,0,0.08)' }}>
          {/* Cabecera */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#e8d5c4', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
              {p.foto_url ? <img src={p.foto_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
            </div>
            <div>
              <h1 style={{ margin: '0 0 4px', fontSize: 22, color: '#3b2a1a' }}>{p.nombre} {p.apellido}</h1>
              <div style={{ fontSize: 14, color: '#9b8878' }}>{TIPO_LABEL[p.tipo] || p.tipo}</div>
              {p.matricula && <div style={{ fontSize: 13, color: '#9b8878', marginTop: 2 }}>Mat. {p.matricula}</div>}
            </div>
          </div>

          {/* Info rápida */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            {p.modalidad && <Chip icon="💻">{MODALIDAD_LABEL[p.modalidad]}</Chip>}
            {p.zona && <Chip icon="📍">{p.zona}</Chip>}
            {p.precio_consulta && <Chip icon="💰">${Number(p.precio_consulta).toLocaleString('es-AR')} / sesión</Chip>}
          </div>

          {/* Descripción */}
          {p.descripcion && (
            <Section titulo="Sobre mí">
              <p style={{ margin: 0, color: '#5c4a3a', fontSize: 15, lineHeight: 1.6 }}>{p.descripcion}</p>
            </Section>
          )}

          {/* Orientación */}
          {p.orientacion && (
            <Section titulo="Orientación / especialidad">
              <p style={{ margin: 0, color: '#5c4a3a', fontSize: 15, lineHeight: 1.6 }}>{p.orientacion}</p>
            </Section>
          )}

          {/* Obras sociales */}
          {p.obras_sociales?.length > 0 && (
            <Section titulo="Obras sociales">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {p.obras_sociales.map(o => (
                  <span key={o.id} style={{ background: '#f5ede6', color: '#7a5c45', borderRadius: 20, padding: '4px 12px', fontSize: 13 }}>
                    {o.nombre}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Formulario de solicitud de turno */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #ede0d4' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#3b2a1a' }}>Solicitar turno</h3>
            {enviado ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '14px 18px', color: '#065f46', fontSize: 14 }}>
                ¡Solicitud enviada! {p.nombre} se va a comunicar con vos a la brevedad.
              </div>
            ) : (
              <form ref={formRef} onSubmit={async e => {
                e.preventDefault()
                setEnviando(true)
                setErrorSolicitud(null)
                try {
                  const res = await fetch(`${API_URL}/solicitudes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...solicitud, profesional_id: p.id }),
                  })
                  const data = await res.json()
                  if (!res.ok) throw new Error(data.error || 'Error al enviar')
                  setEnviado(true)
                } catch (e) {
                  setErrorSolicitud(e.message)
                } finally {
                  setEnviando(false)
                }
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <input required placeholder="Tu nombre *" value={solicitud.nombre_contacto} onChange={e => setSolicitud(s => ({ ...s, nombre_contacto: e.target.value }))} style={sFormInput} />
                  <input required type="email" placeholder="Email *" value={solicitud.email_contacto} onChange={e => setSolicitud(s => ({ ...s, email_contacto: e.target.value }))} style={sFormInput} />
                  <input placeholder="Teléfono" value={solicitud.telefono_contacto} onChange={e => setSolicitud(s => ({ ...s, telefono_contacto: e.target.value }))} style={sFormInput} />
                  <input required type="datetime-local" value={solicitud.fecha_solicitada} onChange={e => setSolicitud(s => ({ ...s, fecha_solicitada: e.target.value }))} style={sFormInput} />
                </div>
                <textarea placeholder="Mensaje (opcional)" value={solicitud.mensaje} onChange={e => setSolicitud(s => ({ ...s, mensaje: e.target.value }))} rows={2} style={{ ...sFormInput, width: '100%', resize: 'vertical', marginBottom: 12, boxSizing: 'border-box' }} />
                {errorSolicitud && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 8 }}>{errorSolicitud}</p>}
                <button type="submit" disabled={enviando} style={{ background: '#c47a4a', color: 'white', border: 'none', borderRadius: 8, padding: '11px 24px', cursor: 'pointer', fontSize: 15, fontWeight: 500 }}>
                  {enviando ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header style={{ background: '#3b2a1a', color: '#f5e6d8', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/buscar" style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1, color: '#f5e6d8', textDecoration: 'none' }}>Kalma</Link>
      <Link to="/login" style={{ color: '#c9b8aa', fontSize: 13, textDecoration: 'none', border: '1px solid #6b5040', borderRadius: 6, padding: '6px 14px' }}>Ingresar</Link>
    </header>
  )
}

function Section({ titulo, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 12, color: '#9b8878', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{titulo}</div>
      {children}
    </div>
  )
}

function Chip({ icon, children }) {
  return (
    <span style={{ background: '#f5ede6', color: '#5c4a3a', borderRadius: 20, padding: '5px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
      {icon} {children}
    </span>
  )
}

const sPage = { minHeight: '100vh', background: '#fdf8f3', fontFamily: 'Georgia, serif' }
const sFormInput = { padding: '9px 11px', borderRadius: 7, border: '1px solid #ddd0c4', background: 'white', fontSize: 14, color: '#3b2a1a', width: '100%' }
