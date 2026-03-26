import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth.js'
import { injectTenant } from '../middleware/tenant.js'

const app = new Hono()
app.use('*', requireAuth, injectTenant)

// GET /sesiones — lista sesiones del profesional (o del paciente)
app.get('/', async (c) => {
  // TODO: implementar
  return c.json({ sesiones: [] })
})

// POST /sesiones — crear sesión
app.post('/', async (c) => {
  // TODO: implementar
  return c.json({ message: 'Sesión creada' }, 201)
})

// PATCH /sesiones/:id — editar sesión
app.patch('/:id', async (c) => {
  // TODO: implementar
  return c.json({ message: 'Sesión actualizada' })
})

// DELETE /sesiones/:id — cancelar sesión
app.delete('/:id', async (c) => {
  // TODO: implementar
  return c.json({ message: 'Sesión cancelada' })
})

export default app
