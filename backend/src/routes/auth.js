import { Hono } from 'hono'

const app = new Hono()

// POST /auth/register — registro de profesional
app.post('/register', async (c) => {
  const { email, password, nombre, apellido, tipo_profesional } = await c.req.json()

  const res = await fetch(`${c.env.SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: c.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({
      email,
      password,
      data: { role: 'profesional', nombre, apellido, tipo_profesional },
    }),
  })

  const data = await res.json()
  if (!res.ok) return c.json({ error: data.msg || 'Error al registrar' }, 400)
  return c.json({ message: 'Registro exitoso. Revisá tu email para confirmar.' })
})

// POST /auth/login — login (lo maneja Supabase directamente desde el frontend)
// Este endpoint es solo por si necesitamos server-side login en el futuro
app.post('/login', async (c) => {
  return c.json({ message: 'Usar Supabase Auth directamente desde el frontend' })
})

export default app
