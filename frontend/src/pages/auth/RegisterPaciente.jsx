import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase.js'

const API_URL = import.meta.env.VITE_API_URL

export default function RegisterPaciente() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [paciente, setPaciente] = useState(null)
  const [tokenError, setTokenError] = useState(null)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Validar el token al cargar la página
  useEffect(() => {
    if (!token) {
      setTokenError('Link inválido. Pedile al profesional que te envíe el link correcto.')
      return
    }

    fetch(`${API_URL}/pacientes/invitacion/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setTokenError(data.error)
        else setPaciente(data)
      })
      .catch(() => setTokenError('Error al validar el link. Intentá de nuevo.'))
  }, [token])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          role: 'paciente',
          invitation_token: token,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (tokenError) {
    return (
      <div>
        <h1>Link inválido</h1>
        <p>{tokenError}</p>
      </div>
    )
  }

  if (!paciente) {
    return <p>Validando link...</p>
  }

  if (success) {
    return (
      <div>
        <h1>¡Cuenta creada!</h1>
        <p>Revisá tu email para confirmar tu cuenta.</p>
        <a href="/login">Ir al login</a>
      </div>
    )
  }

  return (
    <div>
      <h1>Bienvenido/a, {paciente.nombre}</h1>
      <p>Creá tu cuenta para acceder a tus sesiones.</p>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Tu email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Elegí una contraseña (mínimo 6 caracteres)"
          value={form.password}
          onChange={handleChange}
          minLength={6}
          required
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  )
}
