import { useState, useEffect } from 'react'
import { api } from '../../services/api.js'

export default function MiPerfil() {
  const [form, setForm] = useState(null)
  const [catalogo, setCatalogo] = useState([])
  const [obrasSeleccionadas, setObrasSeleccionadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/perfil/mi-perfil').then(d => {
      const p = d.profesional
      setForm({
        nombre: p.nombre || '',
        apellido: p.apellido || '',
        matricula: p.matricula || '',
        telefono: p.telefono || '',
        slug: p.slug || '',
        descripcion: p.descripcion || '',
        orientacion: p.orientacion || '',
        modalidad: p.modalidad || '',
        zona: p.zona || '',
        precio_consulta: p.precio_consulta || '',
        perfil_publicado: p.perfil_publicado || false,
      })
      setCatalogo(d.catalogo || [])
      setObrasSeleccionadas(d.obras_sociales_seleccionadas || [])
    }).finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  function toggleObra(id) {
    setObrasSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setGuardando(true)
    setError(null)
    setExito(false)
    try {
      await api.patch('/perfil/mi-perfil', {
        ...form,
        precio_consulta: form.precio_consulta ? Number(form.precio_consulta) : null,
        obras_sociales: obrasSeleccionadas,
      })
      setExito(true)
      setTimeout(() => setExito(false), 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  if (loading) return <p style={{ padding: 28, color: '#9b8878' }}>Cargando...</p>

  const urlPublica = form.slug ? `${window.location.origin}/p/${form.slug}` : null

  return (
    <div style={{ padding: 28, maxWidth: 640, fontFamily: 'Georgia, serif' }}>
      <h2 style={{ color: '#3b2a1a', marginBottom: 6 }}>Mi perfil</h2>
      <p style={{ color: '#9b8878', fontSize: 14, marginBottom: 24 }}>
        Completá tu perfil para aparecer en el buscador de Kalma.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Datos básicos */}
        <Seccion titulo="Datos personales">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Campo label="Nombre"><input name="nombre" value={form.nombre} onChange={handleChange} style={sInput} /></Campo>
            <Campo label="Apellido"><input name="apellido" value={form.apellido} onChange={handleChange} style={sInput} /></Campo>
          </div>
          <Campo label="Matrícula">
            <input name="matricula" value={form.matricula} onChange={handleChange} placeholder="Ej: MN 12345" style={sInput} />
          </Campo>
          <Campo label="Teléfono de contacto">
            <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Ej: +54 9 11 1234-5678" style={sInput} />
          </Campo>
        </Seccion>

        {/* Perfil público */}
        <Seccion titulo="Perfil público">
          <Campo label="URL de tu perfil (slug)">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#9b8878', whiteSpace: 'nowrap' }}>/p/</span>
              <input name="slug" value={form.slug} onChange={handleChange} placeholder="tu-nombre" style={sInput} />
            </div>
            {urlPublica && (
              <a href={urlPublica} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#c47a4a', marginTop: 4, display: 'block' }}>
                {urlPublica}
              </a>
            )}
          </Campo>
          <Campo label="Descripción (sobre vos)">
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} style={{ ...sInput, resize: 'vertical' }} placeholder="Contá brevemente quién sos y cómo trabajás..." />
          </Campo>
          <Campo label="Orientación / especialidad">
            <input name="orientacion" value={form.orientacion} onChange={handleChange} placeholder="Ej: TCC, Psicoanalítica, Sistémica..." style={sInput} />
          </Campo>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Campo label="Modalidad">
              <select name="modalidad" value={form.modalidad} onChange={handleChange} style={sInput}>
                <option value="">—</option>
                <option value="presencial">Presencial</option>
                <option value="online">Online</option>
                <option value="ambas">Presencial y online</option>
              </select>
            </Campo>
            <Campo label="Zona / ciudad">
              <input name="zona" value={form.zona} onChange={handleChange} placeholder="Ej: CABA, Palermo" style={sInput} />
            </Campo>
          </div>
          <Campo label="Precio de consulta ($)">
            <input type="number" name="precio_consulta" value={form.precio_consulta} onChange={handleChange} placeholder="Opcional" style={sInput} />
          </Campo>
        </Seccion>

        {/* Obras sociales */}
        <Seccion titulo="Obras sociales que aceptás">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {catalogo.map(o => (
              <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 13, background: obrasSeleccionadas.includes(o.id) ? '#f0e4d8' : 'white', border: `1px solid ${obrasSeleccionadas.includes(o.id) ? '#c47a4a' : '#ddd0c4'}`, borderRadius: 20, padding: '5px 12px', userSelect: 'none' }}>
                <input type="checkbox" checked={obrasSeleccionadas.includes(o.id)} onChange={() => toggleObra(o.id)} style={{ display: 'none' }} />
                {o.nombre}
              </label>
            ))}
          </div>
        </Seccion>

        {/* Publicar */}
        <div style={{ background: 'white', border: '1px solid #f0e4d8', borderRadius: 10, padding: '14px 18px', marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input type="checkbox" name="perfil_publicado" checked={form.perfil_publicado} onChange={handleChange} style={{ width: 18, height: 18 }} />
            <div>
              <div style={{ fontSize: 14, color: '#3b2a1a', fontWeight: 500 }}>Publicar mi perfil</div>
              <div style={{ fontSize: 12, color: '#9b8878' }}>Tu perfil aparecerá en el buscador de Kalma</div>
            </div>
          </label>
        </div>

        {error && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        {exito && <p style={{ color: '#065f46', fontSize: 13, marginBottom: 12 }}>¡Perfil guardado correctamente!</p>}

        <button type="submit" disabled={guardando} style={{ background: '#c47a4a', color: 'white', border: 'none', borderRadius: 8, padding: '11px 28px', cursor: 'pointer', fontSize: 15, fontWeight: 500 }}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}

function Seccion({ titulo, children }) {
  return (
    <div style={{ background: 'white', border: '1px solid #f0e4d8', borderRadius: 10, padding: '18px 20px', marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: '#9b8878', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>{titulo}</div>
      {children}
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

const sInput = { padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd0c4', background: 'white', fontSize: 14, color: '#3b2a1a', width: '100%', boxSizing: 'border-box' }
