import { useState, useEffect } from 'react'
import { api } from '../../services/api.js'
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Reportes() {
  const [mes, setMes] = useState(new Date())
  const [sesiones, setSesiones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const desde = startOfMonth(mes).toISOString()
    const hasta = endOfMonth(mes).toISOString()
    setLoading(true)
    api.get(`/sesiones?desde=${desde}&hasta=${hasta}`)
      .then(d => setSesiones(d.sesiones || []))
      .finally(() => setLoading(false))
  }, [mes])

  const realizadas = sesiones.filter(s => s.estado !== 'cancelada')
  const canceladas = sesiones.filter(s => s.estado === 'cancelada')
  const ingresoTotal = realizadas.reduce((sum, s) => sum + (Number(s.monto) || 0), 0)

  // Agrupar por paciente
  const porPaciente = {}
  for (const s of realizadas) {
    const key = s.paciente_id || 'sin-paciente'
    const nombre = s.paciente ? `${s.paciente.nombre} ${s.paciente.apellido}` : 'Sin paciente'
    if (!porPaciente[key]) porPaciente[key] = { nombre, sesiones: 0, ingreso: 0 }
    porPaciente[key].sesiones++
    porPaciente[key].ingreso += Number(s.monto) || 0
  }
  const filasPaciente = Object.values(porPaciente).sort((a, b) => b.sesiones - a.sesiones)

  // Sesiones por semana del mes
  const porSemana = {}
  for (const s of realizadas) {
    const semana = `Semana ${Math.ceil(new Date(s.fecha_inicio).getDate() / 7)}`
    porSemana[semana] = (porSemana[semana] || 0) + 1
  }

  return (
    <div style={{ padding: 28, fontFamily: 'Georgia, serif', maxWidth: 860 }}>
      {/* Selector de mes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <h2 style={{ margin: 0, color: '#3b2a1a', fontWeight: 600 }}>Reportes</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <button onClick={() => setMes(m => subMonths(m, 1))} style={btnNav}>←</button>
          <span style={{ fontSize: 15, color: '#3b2a1a', fontWeight: 500, minWidth: 140, textAlign: 'center' }}>
            {format(mes, 'MMMM yyyy', { locale: es }).replace(/^\w/, c => c.toUpperCase())}
          </span>
          <button onClick={() => setMes(m => addMonths(m, 1))} style={btnNav}>→</button>
        </div>
      </div>

      {loading && <p style={{ color: '#9b8878' }}>Cargando...</p>}

      {!loading && (
        <>
          {/* Tarjetas resumen */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
            <Tarjeta titulo="Sesiones realizadas" valor={realizadas.length} />
            <Tarjeta titulo="Sesiones canceladas" valor={canceladas.length} color="#b94040" />
            <Tarjeta titulo="Ingresos estimados" valor={`$${ingresoTotal.toLocaleString('es-AR')}`} color="#065f46" />
          </div>

          {/* Tabla por paciente */}
          <div style={seccion}>
            <h3 style={subtitulo}>Detalle por paciente</h3>
            {filasPaciente.length === 0 ? (
              <p style={{ color: '#9b8878', fontSize: 14 }}>Sin sesiones este mes.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ede0d4' }}>
                    <th style={th}>Paciente</th>
                    <th style={{ ...th, textAlign: 'center' }}>Sesiones</th>
                    <th style={{ ...th, textAlign: 'right' }}>Ingreso</th>
                  </tr>
                </thead>
                <tbody>
                  {filasPaciente.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f5ede6' }}>
                      <td style={td}>{p.nombre}</td>
                      <td style={{ ...td, textAlign: 'center' }}>{p.sesiones}</td>
                      <td style={{ ...td, textAlign: 'right', color: p.ingreso > 0 ? '#065f46' : '#9b8878' }}>
                        {p.ingreso > 0 ? `$${p.ingreso.toLocaleString('es-AR')}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid #ddd0c4' }}>
                    <td style={{ ...td, fontWeight: 600 }}>Total</td>
                    <td style={{ ...td, textAlign: 'center', fontWeight: 600 }}>{realizadas.length}</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 600, color: '#065f46' }}>
                      ${ingresoTotal.toLocaleString('es-AR')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* Distribución por semana */}
          {Object.keys(porSemana).length > 0 && (
            <div style={seccion}>
              <h3 style={subtitulo}>Sesiones por semana</h3>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 100 }}>
                {Object.entries(porSemana).map(([semana, count]) => {
                  const max = Math.max(...Object.values(porSemana))
                  const height = Math.round((count / max) * 80)
                  return (
                    <div key={semana} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                      <span style={{ fontSize: 12, color: '#7a5c45' }}>{count}</span>
                      <div style={{ width: '100%', height, background: '#c47a4a', borderRadius: '4px 4px 0 0', minHeight: 4 }} />
                      <span style={{ fontSize: 11, color: '#9b8878' }}>{semana}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Tarjeta({ titulo, valor, color = '#3b2a1a' }) {
  return (
    <div style={{ background: 'white', border: '1px solid #f0e4d8', borderRadius: 10, padding: '18px 20px', boxShadow: '0 1px 4px rgba(80,40,0,0.06)' }}>
      <div style={{ fontSize: 12, color: '#9b8878', marginBottom: 6 }}>{titulo}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{valor}</div>
    </div>
  )
}

const btnNav = { background: 'white', border: '1px solid #ddd0c4', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 16, color: '#7a5c45' }
const seccion = { background: 'white', border: '1px solid #f0e4d8', borderRadius: 10, padding: '20px 22px', marginBottom: 20, boxShadow: '0 1px 4px rgba(80,40,0,0.06)' }
const subtitulo = { margin: '0 0 14px', fontSize: 14, color: '#5c4a3a', fontWeight: 600 }
const th = { padding: '8px 10px', textAlign: 'left', color: '#9b8878', fontWeight: 500, fontSize: 12 }
const td = { padding: '10px 10px', color: '#3b2a1a' }
