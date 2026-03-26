import { useState } from 'react'
import { supabase } from '../../services/supabase.js'
import { useAuth } from '../../hooks/useAuth.js'

export default function Cuenta() {
  const { user } = useAuth()
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (nuevaPassword !== confirmar) { setError('Las contraseñas no coinciden'); return }
    if (nuevaPassword.length < 6) { setError('Mínimo 6 caracteres'); return }
    setLoading(true)
    setError(null)
    setExito(false)
    const { error: err } = await supabase.auth.updateUser({ password: nuevaPassword })
    if (err) setError(err.message)
    else { setExito(true); setNuevaPassword(''); setConfirmar('') }
    setLoading(false)
  }

  return (
    <div style={{ padding: 28, maxWidth: 480, fontFamily: 'Georgia, serif' }}>
      <h2 style={{ color: '#3b2a1a', marginBottom: 24 }}>Mi cuenta</h2>

      <div style={{ background: 'white', border: '1px solid #f0e4d8', borderRadius: 10, padding: '20px 22px', marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: '#9b8878', marginBottom: 4 }}>Email</div>
        <div style={{ fontSize: 15, color: '#3b2a1a' }}>{user?.email}</div>
      </div>

      <div style={{ background: 'white', border: '1px solid #f0e4d8', borderRadius: 10, padding: '20px 22px' }}>
        <div style={{ fontSize: 13, color: '#5c4a3a', fontWeight: 600, marginBottom: 14 }}>Cambiar contraseña</div>
        <form onSubmit={handleSubmit}>
          <input type="password" placeholder="Nueva contraseña" value={nuevaPassword} onChange={e => setNuevaPassword(e.target.value)} style={sInput} />
          <input type="password" placeholder="Confirmar contraseña" value={confirmar} onChange={e => setConfirmar(e.target.value)} style={{ ...sInput, marginTop: 10 }} />
          {error && <p style={{ color: '#c0392b', fontSize: 13, margin: '10px 0 0' }}>{error}</p>}
          {exito && <p style={{ color: '#065f46', fontSize: 13, margin: '10px 0 0' }}>¡Contraseña actualizada!</p>}
          <button type="submit" disabled={loading} style={{ marginTop: 16, background: '#c47a4a', color: 'white', border: 'none', borderRadius: 7, padding: '10px 24px', cursor: 'pointer', fontSize: 14 }}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const sInput = { padding: '9px 11px', borderRadius: 7, border: '1px solid #ddd0c4', background: 'white', fontSize: 14, color: '#3b2a1a', width: '100%', boxSizing: 'border-box', display: 'block' }
