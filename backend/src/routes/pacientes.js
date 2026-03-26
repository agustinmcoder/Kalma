import { Hono } from 'hono'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { injectTenant } from '../middleware/tenant.js'

const app = new Hono()
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
