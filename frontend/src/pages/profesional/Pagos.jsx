import { useState, useEffect } from 'react'
import { api } from '../../services/api.js'
import { supabase } from '../../services/supabase.js'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ESTADO_STYLE = {
  pendiente:  { background: '#fef3c7', color: '#92400e' },
  aprobado:   { background: '#d1fae5', color: '#065f46' },
  rechazado:  { background: '#fee2e2', color: '#991b1b' },
}

export default function Pagos() {
  const [comprobantes, setComprobantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('pendiente')
  const [urlsVista, setUrlsVista] = useState({}) // id → signed URL

  async function fetchComprobantes(estado) {
    setLoading(true)
    try {
      const data = await api.get(`/comprobantes${estado !== 'todos' ? `?estado=${estado}` : ''}`)
      setComprobantes(data.comprobantes || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchComprobantes(filtro) }, [filtro])

  async function verArchivo(comprobante) {
    if (urlsVista[comprobante.id]) {
      window.open(urlsVista[comprobante.id], '_blank')
      return
    }
    const { data, error } = await supabase.storage
      .from('comprobantes')
      .createSignedUrl(comprobante.archivo_url, 3600)
    if (error) { alert('No se pudo abrir el archivo'); return }
    setUrlsVista(u => ({ ...u, [comprobante.id]: data.signedUrl }))
    window.open(data.signedUrl, '_blank')
  }

  async function cambiarEstado(id, estado) {
    await api.patch(`/comprobantes/${id}/estado`, { estado })
    fetchComprobantes(filtro)
  }

  return (
    <div style={{ padding: 24, fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: '#3b2a1a' }}>Comprobantes de pago</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {['pendiente', 'aprobado', 'rechazado', 'todos'].map(e => (
            <button key={e} onClick={() => setFiltro(e)} style={{
              ...btnFiltro,
              background: filtro === e ? '#c47a4a' : 'white',
              color: filtro === e ? 'white' : '#7a5c45',
            }}>
              {e.charAt(0).toUpperCase() + e.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#9b8878' }}>Cargando...</p>
      ) : comprobantes.length === 0 ? (
        <p style={{ color: '#9b8878' }}>No hay comprobantes {filtro !== 'todos' ? filtro + 's' : ''}.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {comprobantes.map(c => (
            <div key={c.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#3b2a1a', fontSize: 15 }}>
                    {c.paciente?.apellido}, {c.paciente?.nombre}
                  </span>
                  {c.sesion && (
                    <span style={{ marginLeft: 12, fontSize: 13, color: '#9b8878' }}>
                      Sesión: {format(new Date(c.sesion.fecha_inicio), "d 'de' MMMM", { locale: es })}
                    </span>
                  )}
                </div>
                <span style={{ ...estadoBadge, ...ESTADO_STYLE[c.estado] }}>
                  {c.estado.charAt(0).toUpperCase() + c.estado.slice(1)}
                </span>
              </div>

              {c.comentario && (
                <p style={{ margin: '8px 0 0', fontSize: 13, color: '#7a5c45', fontStyle: 'italic' }}>
                  "{c.comentario}"
                </p>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#c4b5a5' }}>
                  {format(new Date(c.created_at), "d/MM/yyyy HH:mm")}
                </span>
                <button onClick={() => verArchivo(c)} style={btnMini}>Ver archivo</button>
                {c.estado === 'pendiente' && (
                  <>
                    <button onClick={() => cambiarEstado(c.id, 'aprobado')} style={{ ...btnMini, background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' }}>
                      Aprobar
                    </button>
                    <button onClick={() => cambiarEstado(c.id, 'rechazado')} style={{ ...btnMini, background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>
                      Rechazar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const btnFiltro = { border: '1px solid #ddd0c4', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13 }
const btnMini = { background: 'white', color: '#7a5c45', border: '1px solid #ddd0c4', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }
const card = { background: 'white', borderRadius: 8, padding: '14px 18px', boxShadow: '0 1px 4px rgba(80,40,0,0.08)', border: '1px solid #f0e4d8' }
const estadoBadge = { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }
