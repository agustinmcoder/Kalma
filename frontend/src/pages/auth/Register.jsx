import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../services/supabase.js'

const TIPOS = [
  { value: 'psicologo', label: 'Psicólogo/a' },
  { value: 'psiquiatra', label: 'Psiquiatra' },
  { value: 'nutricionista', label: 'Nutricionista' },
]

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    tipo_profesional: 'psicologo',
    email: '',
    password: '',
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

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
          role: 'profesional',
          nombre: form.nombre,
          apellido: form.apellido,
          tipo_profesional: form.tipo_profesional,
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

  if (success) {
    return (
      <div>
        <h1>¡Registro exitoso!</h1>
        <p>Revisá tu email para confirmar tu cuenta y después podés iniciar sesión.</p>
        <Link to="/login">Ir al login</Link>
      </div>
    )
  }

  return (
    <div>
      <h1>Kalma — Crear cuenta</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />
        <input
          name="apellido"
          placeholder="Apellido"
          value={form.apellido}
          onChange={handleChange}
          required
        />
        <select name="tipo_profesional" value={form.tipo_profesional} onChange={handleChange}>
          {TIPOS.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Contraseña (mínimo 6 caracteres)"
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
      <p>¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link></p>
    </div>
  )
}
