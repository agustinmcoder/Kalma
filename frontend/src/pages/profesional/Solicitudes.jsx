import { useState, useEffect } from 'react'
import { api } from '../../services/api.js'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ESTADO_COLOR = { pendiente: '#9b8878', confirmada: '#065f46', rechazada: '#991b1b' }
const ESTADO_LABEL = { pendiente: 'Pendiente', confirmada: 'Confirmada', rechazada: 'Rechazada' }

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('pendiente')

  useEffect(() => {
    api.get('/solicitudes').then(d => setSolicitudes(d.solicitudes || [])).finally(() => setLoading(false))
  }, [])

  async function cambiarEstado(id, estado) {
    await api.patch(`/solicitudes/${id}`, { estado })
    setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estado } : s))
  }

  const filtradas = solicitudes.filter(s => filtro === 'todas' || s.estado === filtro)
  const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length

  return (
    <div style={{ padding: 28, fontFamily: 'Georgia, serif', maxWidth: 740 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: '#3b2a1a' }}>Solicitudes de turno</h2>
        {pendientes > 0 && (
          <span style={{ background: '#c47a4a', color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: 13, fontWeight: 600 }}>
            {pendientes} nueva{pendientes > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {[['pendiente', 'Pendientes'], ['confirmada', 'Confirmadas'], ['rechazada', 'Rechazadas'], ['todas', 'Todas']].map(([val, label]) => (
          <button key={val} onClick={() => setFiltro(val)} style={{ background: filtro === val ? '#3b2a1a' : 'white', color: filtro === val ? '#f5e6d8' : '#7a5c45', border: '1px solid #ddd0c4', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontSize: 13 }}>
            {label}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#9b8878' }}>Cargando...</p>}
      {!loading && filtradas.length === 0 && <p style={{ color: '#9b8878' }}>No hay solicitudes.</p>}

      {filtradas.map(s => (
        <div key={s.id} style={{ background: 'white', border: '1px solid #f0e4d8', borderRadius: 10, padding: '16px 18px', marginBottom: 12, boxShadow: '0 1px 4px rgba(80,40,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#3b2a1a', fontSize: 15 }}>{s.nombre_contacto}</div>
              <div style={{ fontSize: 13, color: '#7a5c45', marginTop: 2 }}>
                {s.email_contacto}
                {s.telefono_contacto && <span style={{ marginLeft: 10 }}>· {s.telefono_contacto}</span>}
              </div>
              <div style={{ fontSize: 13, color: '#9b8878', marginTop: 4 }}>
                Fecha solicitada: <strong style={{ color: '#3b2a1a' }}>
                  {format(new Date(s.fecha_solicitada), "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })}
                </strong>
              </div>
              {s.mensaje && <p style={{ fontSize: 13, color: '#5c4a3a', margin: '8px 0 0', fontStyle: 'italic' }}>"{s.mensaje}"</p>}
            </div>
            <span style={{ fontSize: 12, color: ESTADO_COLOR[s.estado], fontWeight: 500, whiteSpace: 'nowrap' }}>
              {ESTADO_LABEL[s.estado]}
            </span>
          </div>

          {s.estado === 'pendiente' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={() => cambiarEstado(s.id, 'confirmada')} style={{ background: '#7a9e7e', color: 'white', border: 'none', borderRadius: 7, padding: '7px 16px', cursor: 'pointer', fontSize: 13 }}>
                Confirmar
              </button>
              <button onClick={() => cambiarEstado(s.id, 'rechazada')} style={{ background: 'white', color: '#b94040', border: '1px solid #e8c4c4', borderRadius: 7, padding: '7px 16px', cursor: 'pointer', fontSize: 13 }}>
                Rechazar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
