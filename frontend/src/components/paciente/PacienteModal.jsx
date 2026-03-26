import { useState } from 'react'

const FRECUENCIAS = [
  { value: '', label: 'Sin definir' },
  { value: 'puntual', label: 'Puntual' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
]

const OBRAS_SOCIALES = [
  '', 'OSDE', 'Swiss Medical', 'Galeno', 'Medifé', 'IOMA', 'PAMI',
  'Accord Salud', 'OSPEDYC', 'OSECAC', 'Federada Salud', 'Sancor Salud',
  'Omint', 'Particular / Sin obra social',
]

export default function PacienteModal({ paciente, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    nombre: paciente?.nombre || '',
    apellido: paciente?.apellido || '',
    email: paciente?.email || '',
    telefono: paciente?.telefono || '',
    fecha_nacimiento: paciente?.fecha_nacimiento || '',
    dni: paciente?.dni || '',
    obra_social: paciente?.obra_social || '',
    frecuencia: paciente?.frecuencia || '',
    arancel: paciente?.arancel || '',
    fecha_inicio: paciente?.fecha_inicio || '',
    notas: paciente?.notas || '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onGuardar({
        ...form,
        arancel: form.arancel ? Number(form.arancel) : null,
        fecha_nacimiento: form.fecha_nacimiento || null,
        fecha_inicio: form.fecha_inicio || null,
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.header}>
          <h2 style={s.titulo}>{paciente ? 'Editar paciente' : 'Nuevo paciente'}</h2>
          <button onClick={onCerrar} style={s.btnCerrar}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={s.grid2}>
            <Campo label="Nombre *">
              <input name="nombre" value={form.nombre} onChange={handleChange} style={s.input} required />
            </Campo>
            <Campo label="Apellido *">
              <input name="apellido" value={form.apellido} onChange={handleChange} style={s.input} required />
            </Campo>
          </div>

          <div style={s.grid2}>
            <Campo label="Email">
              <input name="email" type="email" value={form.email} onChange={handleChange} style={s.input} />
            </Campo>
            <Campo label="Teléfono">
              <input name="telefono" value={form.telefono} onChange={handleChange} style={s.input} />
            </Campo>
          </div>

          <div style={s.grid2}>
            <Campo label="Fecha de nacimiento">
              <input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} style={s.input} />
            </Campo>
            <Campo label="DNI">
              <input name="dni" value={form.dni} onChange={handleChange} style={s.input} />
            </Campo>
          </div>

          <Campo label="Obra social">
            <select name="obra_social" value={form.obra_social} onChange={handleChange} style={s.input}>
              {OBRAS_SOCIALES.map(o => <option key={o} value={o}>{o || 'Sin especificar'}</option>)}
            </select>
          </Campo>

          <div style={s.grid3}>
            <Campo label="Frecuencia">
              <select name="frecuencia" value={form.frecuencia} onChange={handleChange} style={s.input}>
                {FRECUENCIAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </Campo>
            <Campo label="Arancel ($)">
              <input name="arancel" type="number" value={form.arancel} onChange={handleChange} style={s.input} placeholder="0" />
            </Campo>
            <Campo label="Inicio tratamiento">
              <input name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={handleChange} style={s.input} />
            </Campo>
          </div>

          <Campo label="Notas internas">
            <textarea name="notas" value={form.notas} onChange={handleChange} rows={3} style={{ ...s.input, resize: 'vertical' }} />
          </Campo>

          {error && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 8 }}>{error}</p>}

          <div style={s.actions}>
            <button type="button" onClick={onCerrar} style={s.btnSecundario} disabled={loading}>Cancelar</button>
            <button type="submit" style={s.btnPrimario} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Campo({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12, fontSize: 13, color: '#5c4a3a', fontWeight: 500 }}>
      {label}
      {children}
    </label>
  )
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(60,40,20,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fffaf6', padding: 28, borderRadius: 12, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(80,40,0,0.15)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  titulo: { margin: 0, fontSize: 18, color: '#3b2a1a', fontWeight: 600 },
  btnCerrar: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9b8878', lineHeight: 1 },
  input: { padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd0c4', background: 'white', fontSize: 14, color: '#3b2a1a', width: '100%', boxSizing: 'border-box' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid #ede0d4' },
  btnPrimario: { background: '#c47a4a', color: 'white', border: 'none', borderRadius: 6, padding: '9px 20px', cursor: 'pointer', fontWeight: 500, fontSize: 14 },
  btnSecundario: { background: 'white', color: '#7a5c45', border: '1px solid #ddd0c4', borderRadius: 6, padding: '9px 16px', cursor: 'pointer', fontSize: 14 },
}
