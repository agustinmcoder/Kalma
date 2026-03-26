import { Hono } from 'hono'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { injectTenant } from '../middleware/tenant.js'
import { createSupabaseClient } from '../lib/supabase.js'

const app = new Hono()
app.use('*', requireAuth, injectTenant)

// GET /comprobantes?estado=pendiente&sesion_id=X
app.get('/', async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')
  const { estado, sesion_id } = c.req.query()

  let query = `profesional_id=eq.${profesionalId}&order=created_at.desc`
  query += '&select=*,paciente:pacientes(id,nombre,apellido),sesion:sesiones(id,fecha_inicio)'
  if (estado) query += `&estado=eq.${estado}`
  if (sesion_id) query += `&sesion_id=eq.${sesion_id}`

  const comprobantes = await db.get('comprobantes', query)
  return c.json({ comprobantes })
})

// POST /comprobantes — paciente registra un comprobante ya subido a Storage
app.post('/', requireRole('paciente'), async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')
  const pacienteId = c.get('pacienteId')
  const body = await c.req.json()

  const { sesion_id, archivo_path, archivo_nombre, comentario } = body
  if (!sesion_id || !archivo_path) {
    return c.json({ error: 'Faltan sesion_id y archivo_path' }, 400)
  }

  const { ok, data } = await db.post('comprobantes', {
    sesion_id,
    paciente_id: pacienteId,
    profesional_id: profesionalId,
    archivo_url: archivo_path,
    archivo_nombre,
    comentario,
    estado: 'pendiente',
  })

  if (!ok) return c.json({ error: 'Error al guardar comprobante' }, 500)
  return c.json({ comprobante: data[0] }, 201)
})

// PATCH /comprobantes/:id/estado — profesional aprueba o rechaza
app.patch('/:id/estado', requireRole('profesional'), async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')
  const { id } = c.req.param()
  const { estado } = await c.req.json()

  if (!['aprobado', 'rechazado'].includes(estado)) {
    return c.json({ error: 'Estado inválido. Debe ser aprobado o rechazado' }, 400)
  }

  const { ok, data } = await db.patch(
    'comprobantes',
    `id=eq.${id}&profesional_id=eq.${profesionalId}`,
    { estado }
  )
  if (!ok || !data.length) return c.json({ error: 'Comprobante no encontrado' }, 404)

  // Si se aprueba, actualizar también el estado de pago de la sesión
  if (estado === 'aprobado') {
    await db.patch('sesiones', `id=eq.${data[0].sesion_id}`, { pago_estado: 'aprobado' })
  }

  return c.json({ comprobante: data[0] })
})

export default app
