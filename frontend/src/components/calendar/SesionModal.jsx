import { useState, useEffect } from 'react'
import { api } from '../../services/api.js'
import { format } from 'date-fns'

// Modal para crear o editar una sesión
// Props:
//   sesion: objeto existente (si se está editando) o null (si se crea)
//   slotInicio: Date preseleccionada al hacer click en el calendario
//   onGuardar(datos): callback al guardar
//   onCancelar(): callback al cerrar sin guardar
//   onEliminar(id): callback al cancelar la sesión

export default function SesionModal({ sesion, slotInicio, onGuardar, onCancelar, onEliminar }) {
  const [pacientes, setPacientes] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const toDatetimeLocal = (date) => format(new Date(date), "yyyy-MM-dd'T'HH:mm")

  const inicioDefault = slotInicio ? toDatetimeLocal(slotInicio) : ''
  const finDefault = slotInicio ? toDatetimeLocal(new Date(new Date(slotInicio).getTime() + 50 * 60000)) : ''

  const [form, setForm] = useState({
    paciente_id: sesion?.paciente_id || '',
    fecha_inicio: sesion ? toDatetimeLocal(sesion.fecha_inicio) : inicioDefault,
    fecha_fin: sesion ? toDatetimeLocal(sesion.fecha_fin) : finDefault,
    modalidad: sesion?.modalidad || 'online',
    monto: sesion?.monto || '',
    notas: sesion?.notas || '',
    es_recurrente: false,
    semanas: 4,
  })

  useEffect(() => {
    api.get('/pacientes').then(d => setPacientes(d.pacientes || [])).catch(() => {})
  }, [])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const datos = {
        ...form,
        fecha_inicio: new Date(form.fecha_inicio).toISOString(),
        fecha_fin: new Date(form.fecha_fin).toISOString(),
        monto: form.monto ? Number(form.monto) : null,
        semanas: Number(form.semanas),
      }
      await onGuardar(datos)
    } catch (e) {
      setError(e.message.includes('Superposición') ? 'Ya tenés una sesión en ese horario.' : e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{sesion ? 'Editar sesión' : 'Nueva sesión'}</h2>
        <form onSubmit={handleSubmit}>

          {!sesion && (
            <label style={styles.field}>
              Paciente *
              <select name="paciente_id" value={form.paciente_id} onChange={handleChange} required>
                <option value="">Seleccioná un paciente</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                ))}
              </select>
            </label>
          )}

          <label style={styles.field}>
            Inicio *
            <input type="datetime-local" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} required />
          </label>

          <label style={styles.field}>
            Fin *
            <input type="datetime-local" name="fecha_fin" value={form.fecha_fin} onChange={handleChange} required />
          </label>

          <label style={styles.field}>
            Modalidad
            <select name="modalidad" value={form.modalidad} onChange={handleChange}>
              <option value="online">Online</option>
              <option value="presencial">Presencial</option>
            </select>
          </label>

          <label style={styles.field}>
            Honorario ($)
            <input type="number" name="monto" value={form.monto} onChange={handleChange} placeholder="Opcional" />
          </label>

          <label style={styles.field}>
            Notas internas
            <textarea name="notas" value={form.notas} onChange={handleChange} rows={2} />
          </label>

          {!sesion && (
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <input type="checkbox" name="es_recurrente" checked={form.es_recurrente} onChange={handleChange} />
              Sesión recurrente (semanal)
            </label>
          )}

          {!sesion && form.es_recurrente && (
            <label style={styles.field}>
              Cantidad de semanas
              <input type="number" name="semanas" value={form.semanas} onChange={handleChange} min={2} max={52} />
            </label>
          )}

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div style={styles.actions}>
            {sesion && (
              <button type="button" onClick={() => onEliminar(sesion.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>
                Cancelar sesión
              </button>
            )}
            <button type="button" onClick={onCancelar} disabled={loading}>Cerrar</button>
            <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'white', padding: 24, borderRadius: 8, width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' },
  field: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12, fontSize: 14 },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 },
}
