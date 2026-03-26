import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { useAuth } from '../hooks/useAuth.js'

export default function VideoLlamada() {
  const { sesionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [link, setLink] = useState(null)
  const [error, setError] = useState(null)

  const nombre = encodeURIComponent(
    `${user?.user_metadata?.nombre || ''} ${user?.user_metadata?.apellido || ''}`.trim() || 'Participante'
  )

  useEffect(() => {
    api.get(`/sesiones/${sesionId}`)
      .then(data => {
        if (!data.sesion?.link_videollamada) {
          setError('Esta sesión no tiene videollamada configurada.')
          return
        }
        setLink(data.sesion.link_videollamada)
      })
      .catch(() => setError('No se pudo cargar la sesión.'))
  }, [sesionId])

  function volver() {
    const role = user?.user_metadata?.role
    navigate(role === 'paciente' ? '/paciente' : '/profesional/agenda')
  }

  if (error) {
    return (
      <div style={s.center}>
        <p style={{ color: '#7a5c45' }}>{error}</p>
        <button onClick={volver} style={s.btn}>Volver</button>
      </div>
    )
  }

  if (!link) {
    return <div style={s.center}><p style={{ color: '#9b8878' }}>Cargando...</p></div>
  }

  // Pasamos el nombre del usuario a Jitsi via URL fragment
  const iframeSrc = `${link}#userInfo.displayName="${nombre}"`

  return (
    <div style={s.layout}>
      <div style={s.topbar}>
        <span style={s.logo}>Kalma</span>
        <button onClick={volver} style={s.btnSalir}>← Volver</button>
      </div>
      <iframe
        src={iframeSrc}
        style={s.iframe}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        allowFullScreen
        title="Videollamada"
      />
    </div>
  )
}

const s = {
  layout: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#1a1a1a' },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: '#3b2a1a' },
  logo: { color: '#f5e6d8', fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700 },
  btnSalir: { background: 'none', border: '1px solid #6b5040', color: '#c9b8aa', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13 },
  iframe: { flex: 1, border: 'none', width: '100%' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16, fontFamily: 'Georgia, serif' },
  btn: { background: '#c47a4a', color: 'white', border: 'none', borderRadius: 6, padding: '9px 20px', cursor: 'pointer', fontSize: 14 },
}
