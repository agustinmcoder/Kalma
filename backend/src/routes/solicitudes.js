import { Hono } from 'hono'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { injectTenant } from '../middleware/tenant.js'
import { createSupabaseClient } from '../lib/supabase.js'

const app = new Hono()

// POST /solicitudes — público, sin auth
app.post('/', async (c) => {
  const db = createSupabaseClient(c.env)
  const { profesional_id, nombre_contacto, email_contacto, telefono_contacto, fecha_solicitada, mensaje } = await c.req.json()

  if (!profesional_id || !nombre_contacto || !email_contacto || !fecha_solicitada) {
    return c.json({ error: 'Faltan datos obligatorios' }, 400)
  }

  // Verificar que el profesional existe y tiene perfil publicado
  const prof = await db.get('profesionales', `id=eq.${profesional_id}&perfil_publicado=eq.true&limit=1`)
  if (!prof.length) return c.json({ error: 'Profesional no encontrado' }, 404)

  const { ok, data } = await db.post('solicitudes_turno', {
    profesional_id,
    nombre_contacto,
    email_contacto,
    telefono_contacto: telefono_contacto || null,
    fecha_solicitada,
    mensaje: mensaje || null,
    estado: 'pendiente',
  })
  if (!ok) return c.json({ error: 'Error al enviar solicitud' }, 500)
  return c.json({ solicitud: data[0] }, 201)
})

// Rutas autenticadas del profesional
app.use('*', requireAuth, injectTenant)

// GET /solicitudes — profesional ve las suyas
app.get('/', async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')

  const solicitudes = await db.get('solicitudes_turno',
    `profesional_id=eq.${profesionalId}&order=created_at.desc&select=*`
  )
  return c.json({ solicitudes })
})

// PATCH /solicitudes/:id — aprobar o rechazar
app.patch('/:id', requireRole('profesional'), async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')
  const { id } = c.req.param()
  const { estado } = await c.req.json()

  if (!['confirmada', 'rechazada'].includes(estado)) {
    return c.json({ error: 'Estado inválido' }, 400)
  }

  const { ok, data } = await db.patch('solicitudes_turno',
    `id=eq.${id}&profesional_id=eq.${profesionalId}`,
    { estado }
  )
  if (!ok || !data.length) return c.json({ error: 'Solicitud no encontrada' }, 404)
  return c.json({ solicitud: data[0] })
})

export default app
