import { Hono } from 'hono'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { injectTenant } from '../middleware/tenant.js'

const app = new Hono()

// GET /pacientes/invitacion/:token — público, valida un token de invitación
// Devuelve solo nombre y apellido del paciente (sin datos sensibles)
app.get('/invitacion/:token', async (c) => {
  const { token } = c.req.param()

  const res = await fetch(
    `${c.env.SUPABASE_URL}/rest/v1/pacientes?invitation_token=eq.${token}&select=id,nombre,apellido&limit=1`,
    { headers: { apikey: c.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${c.env.SUPABASE_SERVICE_ROLE_KEY}` } }
  )
  const rows = await res.json()
  if (!rows.length) return c.json({ error: 'Invitación inválida o ya utilizada' }, 404)

  return c.json({ nombre: rows[0].nombre, apellido: rows[0].apellido })
})

app.use('*', requireAuth, injectTenant)

// GET /pacientes — lista pacientes del profesional
app.get('/', async (c) => {
  // TODO: implementar
  return c.json({ pacientes: [] })
})

// GET /pacientes/:id — ficha de un paciente
app.get('/:id', async (c) => {
  // TODO: implementar
  return c.json({ paciente: null })
})

// POST /pacientes — crear paciente
app.post('/', requireRole('profesional'), async (c) => {
  // TODO: implementar
  return c.json({ message: 'Paciente creado' }, 201)
})

// PATCH /pacientes/:id — editar paciente
app.patch('/:id', requireRole('profesional'), async (c) => {
  // TODO: implementar
  return c.json({ message: 'Paciente actualizado' })
})

export default app
