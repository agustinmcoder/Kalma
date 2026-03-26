import { useState, useEffect, useRef } from 'react'
import { api } from '../../services/api.js'
import Editor from '../../components/documents/Editor.jsx'
import { exportarDocx } from '../../components/documents/utils/exportDocx.js'
import mammoth from 'mammoth'

export default function Documentos() {
  const [documentos, setDocumentos] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [filtroPaciente, setFiltroPaciente] = useState('')
  const [docActual, setDocActual] = useState(null) // doc abierto en el editor
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const [nuevoTitulo, setNuevoTitulo] = useState('')
  const [nuevoPaciente, setNuevoPaciente] = useState('')
  const [creando, setCreando] = useState(false)
  const importRef = useRef()
  const autoSaveRef = useRef(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setLoading(true)
    const [docsRes, pacsRes] = await Promise.all([
      api.get('/documentos'),
      api.get('/pacientes'),
    ])
    setDocumentos(docsRes.documentos || [])
    setPacientes(pacsRes.pacientes || [])
    setLoading(false)
  }

  async function cargarDocumentos() {
    const url = filtroPaciente ? `/documentos?paciente_id=${filtroPaciente}` : '/documentos'
    const res = await api.get(url)
    setDocumentos(res.documentos || [])
  }

  useEffect(() => {
    if (!loading) cargarDocumentos()
  }, [filtroPaciente])

  async function crearDocumento(e) {
    e.preventDefault()
    if (!nuevoTitulo.trim()) return
    setCreando(true)
    try {
      const res = await api.post('/documentos', {
        titulo: nuevoTitulo.trim(),
        paciente_id: nuevoPaciente || null,
      })
      const doc = res.documento
      setDocumentos(prev => [doc, ...prev])
      setDocActual({ ...doc, contenido: null })
      setNuevoTitulo('')
      setNuevoPaciente('')
    } catch (e) {
      setError('Error al crear documento')
    } finally {
      setCreando(false)
    }
  }

  async function abrirDocumento(doc) {
    const res = await api.get(`/documentos/${doc.id}`)
    setDocActual(res.documento)
  }

  function handleContenidoCambio(json) {
    setDocActual(prev => ({ ...prev, contenido: json }))
    // Auto-save con debounce de 2 segundos
    clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => guardarDocumento(json), 2000)
  }

  async function guardarDocumento(contenidoOverride) {
    if (!docActual) return
    setGuardando(true)
    try {
      const res = await api.patch(`/documentos/${docActual.id}`, {
        titulo: docActual.titulo,
        contenido: contenidoOverride ?? docActual.contenido,
      })
      setDocActual(res.documento)
      setDocumentos(prev => prev.map(d => d.id === res.documento.id ? { ...d, titulo: res.documento.titulo } : d))
    } catch (e) {
      setError('Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  async function eliminarDocumento(id) {
    if (!confirm('¿Eliminar este documento?')) return
    await api.delete(`/documentos/${id}`)
    setDocumentos(prev => prev.filter(d => d.id !== id))
    if (docActual?.id === id) setDocActual(null)
  }

  async function importarWord(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.convertToHtml({ arrayBuffer })
      const html = result.value
      // Crear nuevo documento con contenido importado como texto plano del HTML
      const titulo = file.name.replace(/\.docx?$/, '')
      const res = await api.post('/documentos', {
        titulo,
        paciente_id: filtroPaciente || null,
        contenido: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: stripHtml(html) }] }] },
      })
      setDocumentos(prev => [res.documento, ...prev])
      const full = await api.get(`/documentos/${res.documento.id}`)
      setDocActual(full.documento)
    } catch (e) {
      setError('Error al importar archivo Word')
    }
  }

  function stripHtml(html) {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }

  const docsVisibles = documentos

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', fontFamily: 'Georgia, serif' }}>
      {/* Panel izquierdo — lista */}
      <div style={{ width: 280, borderRight: '1px solid #ede0d4', display: 'flex', flexDirection: 'column', background: '#fffaf6' }}>
        <div style={{ padding: '16px 14px', borderBottom: '1px solid #ede0d4' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 16, color: '#3b2a1a' }}>Documentos</h2>

          {/* Filtro por paciente */}
          <select
            value={filtroPaciente}
            onChange={e => setFiltroPaciente(e.target.value)}
            style={sInput}
          >
            <option value="">Todos los pacientes</option>
            {pacientes.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
            ))}
          </select>
        </div>

        {/* Nuevo documento */}
        <form onSubmit={crearDocumento} style={{ padding: '12px 14px', borderBottom: '1px solid #ede0d4' }}>
          <input
            placeholder="Título del nuevo documento"
            value={nuevoTitulo}
            onChange={e => setNuevoTitulo(e.target.value)}
            style={{ ...sInput, marginBottom: 8 }}
          />
          <select value={nuevoPaciente} onChange={e => setNuevoPaciente(e.target.value)} style={{ ...sInput, marginBottom: 8 }}>
            <option value="">Sin paciente asignado</option>
            {pacientes.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="submit" disabled={creando || !nuevoTitulo.trim()} style={sBtnPrimario}>
              + Crear
            </button>
            <button type="button" onClick={() => importRef.current.click()} style={sBtnSecundario}>
              Importar .docx
            </button>
          </div>
          <input ref={importRef} type="file" accept=".doc,.docx" style={{ display: 'none' }} onChange={importarWord} />
        </form>

        {/* Lista de documentos */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && <p style={{ padding: 14, color: '#9b8878', fontSize: 13 }}>Cargando...</p>}
          {!loading && docsVisibles.length === 0 && (
            <p style={{ padding: 14, color: '#9b8878', fontSize: 13 }}>No hay documentos.</p>
          )}
          {docsVisibles.map(doc => (
            <div
              key={doc.id}
              onClick={() => abrirDocumento(doc)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0e4d8',
                background: docActual?.id === doc.id ? '#f0e4d8' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <div style={{ fontSize: 14, color: '#3b2a1a', fontWeight: 500, marginBottom: 2 }}>{doc.titulo}</div>
              {doc.paciente && (
                <div style={{ fontSize: 12, color: '#9b8878' }}>{doc.paciente.nombre} {doc.paciente.apellido}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho — editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {docActual ? (
          <>
            {/* Barra superior del editor */}
            <div style={{ padding: '10px 20px', borderBottom: '1px solid #ede0d4', display: 'flex', alignItems: 'center', gap: 12, background: '#fffaf6' }}>
              <input
                value={docActual.titulo}
                onChange={e => setDocActual(prev => ({ ...prev, titulo: e.target.value }))}
                onBlur={() => guardarDocumento()}
                style={{ fontSize: 16, fontWeight: 600, color: '#3b2a1a', border: 'none', background: 'transparent', outline: 'none', flex: 1 }}
              />
              <span style={{ fontSize: 12, color: '#9b8878', fontStyle: 'italic' }}>
                {guardando ? 'Guardando...' : 'Guardado'}
              </span>
              <button onClick={() => guardarDocumento()} style={sBtnSecundario}>Guardar</button>
              <button onClick={() => exportarDocx(docActual.titulo, docActual.contenido)} style={sBtnSecundario}>
                Exportar .docx
              </button>
              <button onClick={() => eliminarDocumento(docActual.id)} style={{ ...sBtnSecundario, color: '#b94040', borderColor: '#e8c4c4' }}>
                Eliminar
              </button>
            </div>

            {error && <p style={{ margin: '8px 20px', color: '#c0392b', fontSize: 13 }}>{error}</p>}

            {/* Editor TipTap */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              <Editor
                key={docActual.id}
                content={docActual.contenido}
                onChange={handleContenidoCambio}
              />
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b8878' }}>
            <p>Seleccioná un documento o creá uno nuevo</p>
          </div>
        )}
      </div>
    </div>
  )
}

const sInput = { padding: '7px 10px', borderRadius: 6, border: '1px solid #ddd0c4', background: 'white', fontSize: 13, color: '#3b2a1a', width: '100%', boxSizing: 'border-box' }
const sBtnPrimario = { background: '#c47a4a', color: 'white', border: 'none', borderRadius: 6, padding: '7px 12px', cursor: 'pointer', fontSize: 13, flex: 1 }
const sBtnSecundario = { background: 'white', color: '#7a5c45', border: '1px solid #ddd0c4', borderRadius: 6, padding: '7px 12px', cursor: 'pointer', fontSize: 13 }
