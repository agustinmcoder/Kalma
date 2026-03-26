import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../services/supabase.js'
import { api } from '../../services/api.js'
import { useAuth } from '../../hooks/useAuth.js'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const PAGO_ESTADO_LABEL = { pendiente: 'Sin comprobante', aprobado: 'Pago aprobado', rechazado: 'Pago rechazado' }
const PAGO_ESTADO_COLOR = { pendiente: '#9b8878', aprobado: '#065f46', rechazado: '#991b1b' }

export default function PacienteDashboard() {
  const { signOut } = useAuth()
  const [sesiones, setSesiones] = useState([])
  const [loading, setLoading] = useState(true)
  const [subiendo, setSubiendo] = useState(null) // sesion_id activo
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
        // 1. Subir archivo a Supabase Storage
        const ext = file.name.split('.').pop()
        const path = `${sesion.profesional_id}/${sesion.paciente_id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('comprobantes')
          .upload(path, file)
        if (uploadError) throw new Error('Error al subir el archivo: ' + uploadError.message)

        // 2. Registrar en la DB via backend
        await api.post('/comprobantes', {
          sesion_id: sesion.id,
          archivo_path: path,
          archivo_nombre: file.name,
          comentario: comentario || null,
        })

        setSubiendo(null)
        setComentario('')
        // Refrescar sesiones
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
    <div style={{ minHeight: '100vh', background: '#fdf8f3', fontFamily: 'Georgia, serif' }}>
      <header style={{ background: '#3b2a1a', color: '#f5e6d8', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>Kalma</span>
        <button onClick={signOut} style={{ background: 'none', border: '1px solid #6b5040', color: '#c9b8aa', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>
          Salir
        </button>
      </header>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
        <h2 style={{ color: '#3b2a1a', marginBottom: 20 }}>Mis sesiones</h2>

        {loading && <p style={{ color: '#9b8878' }}>Cargando...</p>}

        {!loading && proximas.length === 0 && (
          <p style={{ color: '#9b8878' }}>No tenés sesiones agendadas.</p>
        )}

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
                <a href={s.link_videollamada} target="_blank" rel="noreferrer" style={btnLink}>
                  Entrar a la sesión
                </a>
              )}
              {s.pago_estado === 'pendiente' && (
                subiendo === s.id ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Comentario opcional"
                      value={comentario}
                      onChange={e => setComentario(e.target.value)}
                      style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd0c4', fontSize: 13, width: 200 }}
                    />
                    <button onClick={() => handleSubir(s)} disabled={uploadLoading} style={btnPrimario}>
                      {uploadLoading ? 'Subiendo...' : 'Elegir archivo'}
                    </button>
                    <button onClick={() => setSubiendo(null)} style={btnSecundario}>Cancelar</button>
                  </div>
                ) : (
                  <button onClick={() => setSubiendo(s.id)} style={btnSecundario}>
                    Subir comprobante
                  </button>
                )
              )}
            </div>
            {error && subiendo === s.id && <p style={{ color: '#c0392b', fontSize: 12, marginTop: 8 }}>{error}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

const card = { background: 'white', borderRadius: 8, padding: '16px 18px', marginBottom: 12, boxShadow: '0 1px 4px rgba(80,40,0,0.08)', border: '1px solid #f0e4d8' }
const btnPrimario = { background: '#c47a4a', color: 'white', border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13 }
const btnSecundario = { background: 'white', color: '#7a5c45', border: '1px solid #ddd0c4', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13 }
const btnLink = { background: '#7a9e7e', color: 'white', border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13, textDecoration: 'none' }
