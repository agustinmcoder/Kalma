import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase.js'
import { api } from '../../services/api.js'
import { useAuth } from '../../hooks/useAuth.js'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const PAGO_ESTADO_LABEL = { pendiente: 'Sin comprobante', aprobado: 'Pago aprobado', rechazado: 'Pago rechazado' }
const PAGO_ESTADO_COLOR = { pendiente: '#9b8878', aprobado: '#065f46', rechazado: '#991b1b' }

export default function PacienteDashboard() {
  const { user, signOut } = useAuth()
  const [seccion, setSeccion] = useState('sesiones')

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Georgia, serif' }}>
      {/* Sidebar */}
      <aside style={{ width: 200, background: '#3b2a1a', display: 'flex', flexDirection: 'column', padding: '20px 12px', flexShrink: 0 }}>
        <div style={{ color: '#f5e6d8', fontSize: 20, fontWeight: 700, marginBottom: 28, paddingLeft: 8, letterSpacing: 1 }}>Kalma</div>
        <nav style={{ flex: 1 }}>
          {[['sesiones', 'Mis sesiones'], ['documentos', 'Documentos'], ['comprobantes', 'Comprobantes'], ['cuenta', 'Mi cuenta']].map(([id, label]) => (
            <button key={id} onClick={() => setSeccion(id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', marginBottom: 4, fontSize: 14, background: seccion === id ? '#f5e6d8' : 'transparent', color: seccion === id ? '#3b2a1a' : '#c9b8aa', fontWeight: seccion === id ? 600 : 400 }}>
              {label}
            </button>
          ))}
        </nav>
        <div style={{ paddingLeft: 8 }}>
          <div style={{ fontSize: 12, color: '#9b8878', marginBottom: 6 }}>{user?.email}</div>
          <button onClick={signOut} style={{ background: 'none', border: '1px solid #6b5040', color: '#c9b8aa', borderRadius: 6, padding: '7px 0', cursor: 'pointer', fontSize: 13, width: '100%' }}>Salir</button>
        </div>
      </aside>

      {/* Contenido */}
      <main style={{ flex: 1, overflowY: 'auto', background: '#fdf8f3' }}>
        {seccion === 'sesiones' && <SeccionSesiones />}
        {seccion === 'documentos' && <SeccionDocumentos />}
        {seccion === 'comprobantes' && <SeccionComprobantes />}
        {seccion === 'cuenta' && <SeccionCuenta user={user} />}
      </main>
    </div>
  )
}

// ─── Sesiones ────────────────────────────────────────────────
function SeccionSesiones() {
  const navigate = useNavigate()
  const [sesiones, setSesiones] = useState([])
  const [loading, setLoading] = useState(true)
  const [subiendo, setSubiendo] = useState(null)
  const [comentario, setComentario] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileRef = useRef()

  useEffect(() => {
    api.get('/sesiones').then(d => setSesiones(d.sesiones || [])).finally(() => setLoading(false))
  }, [])

  async function handleSubir(sesion) {
    fileRef.current.click()
    fileRef.current.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      e.target.value = ''
      setError(null)
      setUploadLoading(true)
      try {
        const ext = file.name.split('.').pop()
        const path = `${sesion.profesional_id}/${sesion.paciente_id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage.from('comprobantes').upload(path, file)
        if (uploadError) throw new Error('Error al subir el archivo: ' + uploadError.message)
        await api.post('/comprobantes', { sesion_id: sesion.id, archivo_path: path, archivo_nombre: file.name, comentario: comentario || null })
        setSubiendo(null)
        setComentario('')
        const data = await api.get('/sesiones')
        setSesiones(data.sesiones || [])
      } catch (e) {
        setError(e.message)
      } finally {
        setUploadLoading(false)
      }
    }
  }

  const proximas = sesiones.filter(s => s.estado !== 'cancelada').sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))

  return (
    <div style={{ padding: 28 }}>
      <h2 style={{ color: '#3b2a1a', marginBottom: 20 }}>Mis sesiones</h2>
      {loading && <p style={{ color: '#9b8878' }}>Cargando...</p>}
      {!loading && proximas.length === 0 && <p style={{ color: '#9b8878' }}>No tenés sesiones agendadas.</p>}
      <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} />
      {proximas.map(s => (
        <div key={s.id} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#3b2a1a', fontSize: 15 }}>
                {format(new Date(s.fecha_inicio), "EEEE d 'de' MMMM", { locale: es })}
              </div>
              <div style={{ color: '#7a5c45', fontSize: 14, marginTop: 2 }}>
                {format(new Date(s.fecha_inicio), 'HH:mm')} — {format(new Date(s.fecha_fin), 'HH:mm')}
                {s.modalidad && <span style={{ marginLeft: 8, fontSize: 12, color: '#9b8878' }}>· {s.modalidad}</span>}
              </div>
            </div>
            <span style={{ fontSize: 12, color: PAGO_ESTADO_COLOR[s.pago_estado] || '#9b8878', fontStyle: 'italic' }}>
              {PAGO_ESTADO_LABEL[s.pago_estado] || ''}
            </span>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {s.link_videollamada && (
              <button onClick={() => navigate(`/video/${s.id}`)} style={btnLink}>Entrar a la sesión</button>
            )}
            {s.pago_estado === 'pendiente' && (
              subiendo === s.id ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Comentario opcional" value={comentario} onChange={e => setComentario(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd0c4', fontSize: 13, width: 200 }} />
                  <button onClick={() => handleSubir(s)} disabled={uploadLoading} style={btnPrimario}>{uploadLoading ? 'Subiendo...' : 'Elegir archivo'}</button>
                  <button onClick={() => setSubiendo(null)} style={btnSecundario}>Cancelar</button>
                </div>
              ) : (
                <button onClick={() => setSubiendo(s.id)} style={btnSecundario}>Subir comprobante</button>
              )
            )}
          </div>
          {error && subiendo === s.id && <p style={{ color: '#c0392b', fontSize: 12, marginTop: 8 }}>{error}</p>}
        </div>
      ))}
    </div>
  )
}

// ─── Documentos ──────────────────────────────────────────────
function SeccionDocumentos() {
  const [documentos, setDocumentos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/documentos/compartidos').then(d => setDocumentos(d.documentos || [])).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ padding: 28 }}>
      <h2 style={{ color: '#3b2a1a', marginBottom: 6 }}>Documentos</h2>
      <p style={{ color: '#9b8878', fontSize: 14, marginBottom: 20 }}>Documentos compartidos por tu profesional.</p>
      {loading && <p style={{ color: '#9b8878' }}>Cargando...</p>}
      {!loading && documentos.length === 0 && <p style={{ color: '#9b8878' }}>No hay documentos compartidos todavía.</p>}
      {documentos.map(d => (
        <div key={d.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#3b2a1a', fontSize: 15 }}>{d.titulo}</div>
            <div style={{ fontSize: 12, color: '#9b8878', marginTop: 3 }}>
              {format(new Date(d.updated_at), "d 'de' MMMM yyyy", { locale: es })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Comprobantes ─────────────────────────────────────────────
function SeccionComprobantes() {
  const [comprobantes, setComprobantes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/comprobantes').then(d => setComprobantes(d.comprobantes || [])).finally(() => setLoading(false))
  }, [])

  const ESTADO_COLOR = { pendiente: '#9b8878', aprobado: '#065f46', rechazado: '#991b1b' }
  const ESTADO_LABEL = { pendiente: 'Pendiente', aprobado: 'Aprobado', rechazado: 'Rechazado' }

  return (
    <div style={{ padding: 28 }}>
      <h2 style={{ color: '#3b2a1a', marginBottom: 20 }}>Mis comprobantes</h2>
      {loading && <p style={{ color: '#9b8878' }}>Cargando...</p>}
      {!loading && comprobantes.length === 0 && <p style={{ color: '#9b8878' }}>No subiste comprobantes todavía.</p>}
      {comprobantes.map(c => (
        <div key={c.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500, color: '#3b2a1a', fontSize: 14 }}>{c.archivo_nombre}</div>
            <div style={{ fontSize: 12, color: '#9b8878', marginTop: 3 }}>
              {c.created_at && format(new Date(c.created_at), "d 'de' MMMM yyyy", { locale: es })}
              {c.comentario && <span style={{ marginLeft: 8, fontStyle: 'italic' }}>"{c.comentario}"</span>}
            </div>
          </div>
          <span style={{ fontSize: 12, color: ESTADO_COLOR[c.estado], fontWeight: 500 }}>{ESTADO_LABEL[c.estado]}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Mi cuenta ────────────────────────────────────────────────
function SeccionCuenta({ user }) {
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (nuevaPassword !== confirmar) { setError('Las contraseñas no coinciden'); return }
    if (nuevaPassword.length < 6) { setError('Mínimo 6 caracteres'); return }
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.updateUser({ password: nuevaPassword })
    if (err) setError(err.message)
    else { setExito(true); setNuevaPassword(''); setConfirmar('') }
    setLoading(false)
  }

  return (
    <div style={{ padding: 28, maxWidth: 480 }}>
      <h2 style={{ color: '#3b2a1a', marginBottom: 24 }}>Mi cuenta</h2>
      <div style={{ background: 'white', border: '1px solid #f0e4d8', borderRadius: 10, padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9b8878', marginBottom: 4 }}>Email</div>
        <div style={{ fontSize: 15, color: '#3b2a1a' }}>{user?.email}</div>
      </div>
      <div style={{ background: 'white', border: '1px solid #f0e4d8', borderRadius: 10, padding: '20px 22px' }}>
        <div style={{ fontSize: 13, color: '#5c4a3a', fontWeight: 600, marginBottom: 14 }}>Cambiar contraseña</div>
        <form onSubmit={handleSubmit}>
          <input type="password" placeholder="Nueva contraseña" value={nuevaPassword} onChange={e => setNuevaPassword(e.target.value)} style={{ ...sInput, marginBottom: 10 }} />
          <input type="password" placeholder="Confirmar contraseña" value={confirmar} onChange={e => setConfirmar(e.target.value)} style={{ ...sInput, marginBottom: 14 }} />
          {error && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 10 }}>{error}</p>}
          {exito && <p style={{ color: '#065f46', fontSize: 13, marginBottom: 10 }}>¡Contraseña actualizada!</p>}
          <button type="submit" disabled={loading} style={{ background: '#c47a4a', color: 'white', border: 'none', borderRadius: 7, padding: '9px 22px', cursor: 'pointer', fontSize: 14 }}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const card = { background: 'white', borderRadius: 8, padding: '16px 18px', marginBottom: 12, boxShadow: '0 1px 4px rgba(80,40,0,0.08)', border: '1px solid #f0e4d8' }
const btnPrimario = { background: '#c47a4a', color: 'white', border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13 }
const btnSecundario = { background: 'white', color: '#7a5c45', border: '1px solid #ddd0c4', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13 }
const btnLink = { background: '#7a9e7e', color: 'white', border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13 }
const sInput = { padding: '9px 11px', borderRadius: 7, border: '1px solid #ddd0c4', background: 'white', fontSize: 14, color: '#3b2a1a', width: '100%', boxSizing: 'border-box', display: 'block' }
