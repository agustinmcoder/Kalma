import { Hono } from 'hono'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { injectTenant } from '../middleware/tenant.js'

const app = new Hono()
app.use('*', requireAuth, injectTenant)

// GET /documentos — lista documentos del paciente
app.get('/', async (c) => {
  return c.json({ documentos: [] })
})

// POST /documentos — crear documento (desde Word importado o desde cero)
app.post('/', requireRole('profesional'), async (c) => {
  return c.json({ message: 'Documento creado' }, 201)
})

// PATCH /documentos/:id — guardar cambios del editor
app.patch('/:id', requireRole('profesional'), async (c) => {
  return c.json({ message: 'Documento guardado' })
})

// DELETE /documentos/:id — eliminar documento
app.delete('/:id', requireRole('profesional'), async (c) => {
  return c.json({ message: 'Documento eliminado' })
})

export default app
