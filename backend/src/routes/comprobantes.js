import { Hono } from 'hono'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { injectTenant } from '../middleware/tenant.js'

const app = new Hono()
app.use('*', requireAuth, injectTenant)

// GET /comprobantes — lista comprobantes (filtrados por paciente o sesión)
app.get('/', async (c) => {
  // TODO: implementar
  return c.json({ comprobantes: [] })
})

// POST /comprobantes — paciente sube comprobante
app.post('/', requireRole('paciente'), async (c) => {
  // TODO: subir imagen/PDF a Supabase Storage y registrar en DB
  return c.json({ message: 'Comprobante subido' }, 201)
})

// PATCH /comprobantes/:id/estado — profesional aprueba o rechaza
app.patch('/:id/estado', requireRole('profesional'), async (c) => {
  // TODO: implementar (estado: 'aprobado' | 'rechazado')
  return c.json({ message: 'Estado actualizado' })
})

export default app
