import { useState, useEffect, useRef } from 'react'
import * as XLSX from 'xlsx'
import { api } from '../../services/api.js'
import PacienteModal from '../../components/paciente/PacienteModal.jsx'

const API_URL = import.meta.env.VITE_API_URL
const FRECUENCIA_LABEL = { semanal: 'Semanal', quincenal: 'Quincenal', puntual: 'Puntual', 'a demanda': 'A demanda' }

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState(null) // null | { paciente? }
  const [copiado, setCopiado] = useState(null) // id del paciente cuyo link se copió
  const [importError, setImportError] = useState(null)
  const fileRef = useRef()

  async function fetchPacientes(q = '') {
    setLoading(true)
    try {
      const data = await api.get(`/pacientes${q ? `?q=${encodeURIComponent(q)}` : ''}`)
      setPacientes(data.pacientes || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPacientes() }, [])

  // Búsqueda con debounce simple
  useEffect(() => {
    const t = setTimeout(() => fetchPacientes(busqueda), 300)
    return () => clearTimeout(t)
  }, [busqueda])

  async function handleGuardar(datos) {
    if (modal.paciente) {
      await api.patch(`/pacientes/${modal.paciente.id}`, datos)
    } else {
      await api.post('/pacientes', datos)
    }
    setModal(null)
    fetchPacientes(busqueda)
  }

  function copiarLinkInvitacion(paciente) {
    const link = `${window.location.origin}/registro-paciente?token=${paciente.invitation_token}`
    navigator.clipboard.writeText(link)
    setCopiado(paciente.id)
    setTimeout(() => setCopiado(null), 2000)
  }

  // ── Importar Excel ──────────────────────────────────────────
  function descargarTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Nombre', 'Apellido', 'Frecuencia', 'Arancel', 'Fecha de inicio'],
      ['María', 'González', 'semanal', 5000, '2024-03-01'],
    ])
    ws['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 16 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Pacientes')
    XLSX.writeFile(wb, 'template_pacientes_kalma.xlsx')
  }

  async function handleImportar(e) {
    setImportError(null)
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''

    try {
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const filas = XLSX.utils.sheet_to_json(ws, { header: 1 })

      // Validar encabezados
      const encabezados = filas[0]?.map(h => String(h).trim())
      const esperados = ['Nombre', 'Apellido', 'Frecuencia', 'Arancel', 'Fecha de inicio']
      const validos = esperados.every((e, i) => encabezados?.[i] === e)
      if (!validos) {
        setImportError('El archivo no tiene el formato correcto. Descargá el template y usalo como base.')
        return
      }

      // Convertir filas a objetos (saltando encabezado)
      const pacientesImport = filas.slice(1)
        .filter(f => f[0] || f[1])
        .map(f => ({
          nombre: f[0] ? String(f[0]).trim() : '',
          apellido: f[1] ? String(f[1]).trim() : '',
          frecuencia: f[2] ? String(f[2]).trim().toLowerCase() : null,
          arancel: f[3] ? Number(f[3]) : null,
          fecha_inicio: f[4] ? excelFechaAISO(f[4]) : null,
        }))

      if (!pacientesImport.length) {
        setImportError('El archivo no tiene filas de datos.')
        return
      }

      const data = await api.post('/pacientes/importar', { pacientes: pacientesImport })
      alert(`✓ Se importaron ${data.importados} pacientes.`)
      fetchPacientes()
    } catch (err) {
      setImportError('Error al procesar el archivo: ' + err.message)
    }
  }

  // Excel guarda fechas como número serial — convertir a ISO string
  function excelFechaAISO(valor) {
    if (!valor) return null
    if (typeof valor === 'string' && valor.includes('-')) return valor // ya es ISO
    if (typeof valor === 'number') {
      const fecha = XLSX.SSF.parse_date_code(valor)
      if (!fecha) return null
      return `${fecha.y}-${String(fecha.m).padStart(2,'0')}-${String(fecha.d).padStart(2,'0')}`
    }
    return String(valor)
  }

  return (
    <div style={{ padding: 24, fontFamily: 'Georgia, serif' }}>

      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0, color: '#3b2a1a' }}>Pacientes</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={descargarTemplate} style={btn.secundario}>↓ Template Excel</button>
          <button onClick={() => fileRef.current.click()} style={btn.secundario}>↑ Importar Excel</button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleImportar} style={{ display: 'none' }} />
          <button onClick={() => setModal({})} style={btn.primario}>+ Nuevo paciente</button>
        </div>
      </div>

      {/* Búsqueda */}
      <input
        type="search"
        placeholder="Buscar por nombre o apellido..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        style={{ ...inputStyle, maxWidth: 320, marginBottom: 16 }}
      />

      {importError && (
        <div style={{ background: '#fff0ee', border: '1px solid #f5c0b0', borderRadius: 6, padding: '10px 14px', marginBottom: 16, color: '#8b2020', fontSize: 13 }}>
          {importError}
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <p style={{ color: '#9b8878' }}>Cargando...</p>
      ) : pacientes.length === 0 ? (
        <p style={{ color: '#9b8878' }}>No hay pacientes. Podés agregar uno o importar desde Excel.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tabla.base}>
            <thead>
              <tr>
                {['Paciente', 'Obra social', 'Frecuencia', 'Arancel', 'Inicio', 'Acciones'].map(h => (
                  <th key={h} style={tabla.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pacientes.map(p => (
                <tr key={p.id} style={tabla.tr}>
                  <td style={tabla.td}>
                    <span style={{ fontWeight: 600, color: '#3b2a1a' }}>{p.apellido}, {p.nombre}</span>
                    {p.email && <div style={{ fontSize: 12, color: '#9b8878' }}>{p.email}</div>}
                  </td>
                  <td style={tabla.td}>{p.obra_social || <span style={{ color: '#c4b5a5' }}>—</span>}</td>
                  <td style={tabla.td}>{FRECUENCIA_LABEL[p.frecuencia] || <span style={{ color: '#c4b5a5' }}>—</span>}</td>
                  <td style={tabla.td}>{p.arancel ? `$${Number(p.arancel).toLocaleString('es-AR')}` : <span style={{ color: '#c4b5a5' }}>—</span>}</td>
                  <td style={tabla.td}>{p.fecha_inicio ? new Date(p.fecha_inicio + 'T12:00:00').toLocaleDateString('es-AR') : <span style={{ color: '#c4b5a5' }}>—</span>}</td>
                  <td style={{ ...tabla.td, whiteSpace: 'nowrap' }}>
                    <button onClick={() => setModal({ paciente: p })} style={btn.mini}>Editar</button>
                    {!p.user_id && (
                      <button onClick={() => copiarLinkInvitacion(p)} style={{ ...btn.mini, marginLeft: 6 }}>
                        {copiado === p.id ? '✓ Copiado' : 'Copiar link'}
                      </button>
                    )}
                    {p.user_id && <span style={{ fontSize: 12, color: '#7a9e7e', marginLeft: 8 }}>✓ Activo</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <PacienteModal
          paciente={modal.paciente || null}
          onGuardar={handleGuardar}
          onCerrar={() => setModal(null)}
        />
      )}
    </div>
  )
}

const inputStyle = { padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd0c4', background: 'white', fontSize: 14, color: '#3b2a1a', width: '100%', boxSizing: 'border-box' }

const btn = {
  primario: { background: '#c47a4a', color: 'white', border: 'none', borderRadius: 6, padding: '9px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 500 },
  secundario: { background: 'white', color: '#7a5c45', border: '1px solid #ddd0c4', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 13 },
  mini: { background: 'white', color: '#7a5c45', border: '1px solid #ddd0c4', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12 },
}

const tabla = {
  base: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(80,40,0,0.08)' },
  th: { padding: '12px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#9b8878', background: '#fdf3ec', borderBottom: '1px solid #ede0d4', fontFamily: 'system-ui, sans-serif' },
  td: { padding: '12px 14px', fontSize: 14, color: '#5c4a3a', borderBottom: '1px solid #f5ede4' },
  tr: {},
}
