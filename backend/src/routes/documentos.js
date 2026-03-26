import { Hono } from 'hono'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { injectTenant } from '../middleware/tenant.js'
import { createSupabaseClient } from '../lib/supabase.js'

const app = new Hono()
app.use('*', requireAuth, injectTenant)

// GET /documentos?paciente_id=X
app.get('/', async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')
  const { paciente_id } = c.req.query()

  let query = `profesional_id=eq.${profesionalId}&order=updated_at.desc&select=id,titulo,paciente_id,created_at,updated_at,paciente:pacientes(id,nombre,apellido)`
  if (paciente_id) query += `&paciente_id=eq.${paciente_id}`

  const documentos = await db.get('documentos', query)
  return c.json({ documentos })
})

// GET /documentos/:id
app.get('/:id', async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')
  const { id } = c.req.param()

  const rows = await db.get('documentos', `id=eq.${id}&profesional_id=eq.${profesionalId}&limit=1`)
  if (!rows.length) return c.json({ error: 'Documento no encontrado' }, 404)
  return c.json({ documento: rows[0] })
})

// POST /documentos
app.post('/', requireRole('profesional'), async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')
  const { titulo, contenido, paciente_id } = await c.req.json()

  if (!titulo) return c.json({ error: 'El título es obligatorio' }, 400)

  const { ok, data } = await db.post('documentos', {
    profesional_id: profesionalId,
    paciente_id: paciente_id || null,
    titulo,
    contenido: contenido || null,
  })
  if (!ok) return c.json({ error: 'Error al crear documento' }, 500)
  return c.json({ documento: data[0] }, 201)
})

// PATCH /documentos/:id
app.patch('/:id', requireRole('profesional'), async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')
  const { id } = c.req.param()
  const body = await c.req.json()

  const { ok, data } = await db.patch('documentos', `id=eq.${id}&profesional_id=eq.${profesionalId}`, body)
  if (!ok || !data.length) return c.json({ error: 'Documento no encontrado' }, 404)
  return c.json({ documento: data[0] })
})

// DELETE /documentos/:id
app.delete('/:id', requireRole('profesional'), async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')
  const { id } = c.req.param()

  const { ok } = await db.delete('documentos', `id=eq.${id}&profesional_id=eq.${profesionalId}`)
  if (!ok) return c.json({ error: 'Error al eliminar' }, 500)
  return c.json({ message: 'Documento eliminado' })
})

export default app
