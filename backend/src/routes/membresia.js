import { Hono } from 'hono'
import { requireAuth, requireRole } from '../middleware/auth.js'

const app = new Hono()

// GET /membresia/estado — estado de membresía del profesional
app.get('/estado', requireAuth, requireRole('profesional'), async (c) => {
  return c.json({ estado: 'activa', vence: null })
})

// POST /membresia/webhook — webhook de MercadoPago (sin auth, firmado por MP)
app.post('/webhook', async (c) => {
  // TODO: validar firma de MercadoPago y actualizar estado
  return c.json({ received: true })
})

export default app
