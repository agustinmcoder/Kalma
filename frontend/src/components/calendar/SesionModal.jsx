import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api.js'
import { format } from 'date-fns'

const MINUTOS = ['00', '15', '30', '45']
const DURACIONES = [
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '50 min', value: 50 },
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 },
]
const RECURRENCIA = [
  { label: 'Puntual', value: 'puntual' },
  { label: 'Semanal', value: 'semanal' },
  { label: 'Quincenal', value: 'quincenal' },
]

function parseFecha(isoString) {
  const d = new Date(isoString)
  return {
    fecha: format(d, 'yyyy-MM-dd'),
    hora: String(d.getHours()).padStart(2, '0'),
    minutos: String(Math.round(d.getMinutes() / 15) * 15).padStart(2, '0').replace('60', '00'),
  }
}

function buildISO(fecha, hora, minutos) {
  return new Date(`${fecha}T${hora}:${minutos}:00`).toISOString()
}

export default function SesionModal({ sesion, slotInicio, onGuardar, onCancelar, onEliminar }) {
  const navigate = useNavigate()
  const [pacientes, setPacientes] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const defaultFecha = slotInicio ? format(new Date(slotInicio), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  const defaultHora = slotInicio ? String(new Date(slotInicio).getHours()).padStart(2, '0') : '09'
  const defaultMin = slotInicio
    ? String(Math.round(new Date(slotInicio).getMinutes() / 15) * 15).padStart(2, '0').replace('60', '00')
    : '00'

  const [fecha, setFecha] = useState(sesion ? parseFecha(sesion.fecha_inicio).fecha : defaultFecha)
  const [hora, setHora] = useState(sesion ? parseFecha(sesion.fecha_inicio).hora : defaultHora)
  const [minutos, setMinutos] = useState(sesion ? parseFecha(sesion.fecha_inicio).minutos : defaultMin)
  const [duracion, setDuracion] = useState(50)
  const [form, setForm] = useState({
    paciente_id: sesion?.paciente_id || '',
    modalidad: sesion?.modalidad || 'online',
    monto: sesion?.monto || '',
    notas: sesion?.notas || '',
    recurrencia: 'puntual',
  })

  useEffect(() => {
    api.get('/pacientes').then(d => setPacientes(d.pacientes || [])).catch(() => {})
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  function calcularFin() {
    const inicio = new Date(`${fecha}T${hora}:${minutos}:00`)
    return new Date(inicio.getTime() + duracion * 60000).toISOString()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const fecha_inicio = buildISO(fecha, hora, minutos)
      const fecha_fin = calcularFin()
      const esRecurrente = form.recurrencia !== 'puntual'
      // Semanal: 52 sesiones (1 año) — Quincenal: 26 sesiones (1 año)
      const semanas = form.recurrencia === 'quincenal' ? 26 : 52

      await onGuardar({
        paciente_id: form.paciente_id,
        fecha_inicio,
        fecha_fin,
        modalidad: form.modalidad,
        monto: form.monto ? Number(form.monto) : null,
        notas: form.notas,
        es_recurrente: esRecurrente,
        semanas: esRecurrente ? semanas : 1,
        intervalo_dias: form.recurrencia === 'quincenal' ? 14 : 7,
      })
    } catch (e) {
      setError(e.message.includes('Superposición') ? 'Ya tenés una sesión en ese horario.' : e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.header}>
          <h2 style={s.titulo}>{sesion ? 'Editar sesión' : 'Nueva sesión'}</h2>
          <button onClick={onCancelar} style={s.btnCerrar}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>

          {!sesion && (
            <Campo label="Paciente *">
              <select name="paciente_id" value={form.paciente_id} onChange={handleChange} style={s.input} required>
                <option value="">Seleccioná un paciente</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                ))}
              </select>
            </Campo>
          )}

          <Campo label="Fecha *">
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={s.input} required />
          </Campo>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Campo label="Hora">
              <select value={hora} onChange={e => setHora(e.target.value)} style={s.input}>
                {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                  <option key={h} value={h}>{h}hs</option>
                ))}
              </select>
            </Campo>
            <Campo label="Minutos">
              <select value={minutos} onChange={e => setMinutos(e.target.value)} style={s.input}>
                {MINUTOS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Campo>
            <Campo label="Duración">
              <select value={duracion} onChange={e => setDuracion(Number(e.target.value))} style={s.input}>
                {DURACIONES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </Campo>
          </div>

          <Campo label="Modalidad">
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              {['online', 'presencial'].map(m => (
                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                  <input type="radio" name="modalidad" value={m} checked={form.modalidad === m} onChange={handleChange} />
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </label>
              ))}
            </div>
          </Campo>

          <Campo label="Honorario ($)">
            <input type="number" name="monto" value={form.monto} onChange={handleChange} placeholder="Opcional" style={s.input} />
          </Campo>

          {!sesion && (
            <Campo label="Frecuencia">
              <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                {RECURRENCIA.map(r => (
                  <label key={r.value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                    <input type="radio" name="recurrencia" value={r.value} checked={form.recurrencia === r.value} onChange={handleChange} />
                    {r.label}
                  </label>
                ))}
              </div>
            </Campo>
          )}

          <Campo label="Notas internas">
            <textarea name="notas" value={form.notas} onChange={handleChange} rows={2} style={{ ...s.input, resize: 'vertical' }} />
          </Campo>

          {error && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 8 }}>{error}</p>}

          <div style={s.actions}>
            {sesion && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {sesion.link_videollamada && (
                  <button type="button" onClick={() => navigate(`/video/${sesion.id}`)} style={{ ...s.btnPrimario, background: '#7a9e7e' }}>
                    Entrar a la sesión
                  </button>
                )}
                <button type="button" onClick={() => onEliminar(sesion.id)} style={s.btnEliminar}>
                  Cancelar sesión
                </button>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={onCancelar} style={s.btnSecundario} disabled={loading}>Cancelar</button>
              <button type="submit" style={s.btnPrimario} disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function Campo({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14, fontSize: 13, color: '#5c4a3a', fontWeight: 500 }}>
      {label}
      {children}
    </label>
  )
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(60,40,20,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fffaf6', padding: 28, borderRadius: 12, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(80,40,0,0.15)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  titulo: { margin: 0, fontSize: 18, color: '#3b2a1a', fontWeight: 600 },
  btnCerrar: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9b8878', lineHeight: 1 },
  input: { padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd0c4', background: 'white', fontSize: 14, color: '#3b2a1a', width: '100%', boxSizing: 'border-box' },
  actions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid #ede0d4' },
  btnPrimario: { background: '#c47a4a', color: 'white', border: 'none', borderRadius: 6, padding: '9px 20px', cursor: 'pointer', fontWeight: 500, fontSize: 14 },
  btnSecundario: { background: 'white', color: '#7a5c45', border: '1px solid #ddd0c4', borderRadius: 6, padding: '9px 16px', cursor: 'pointer', fontSize: 14 },
  btnEliminar: { background: 'none', border: 'none', color: '#b94040', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' },
}
