import { Hono } from 'hono'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { injectTenant } from '../middleware/tenant.js'
import { createSupabaseClient } from '../lib/supabase.js'

const app = new Hono()

// GET /pacientes/invitacion/:token — público, valida token de invitación
app.get('/invitacion/:token', async (c) => {
  const db = createSupabaseClient(c.env)
  const { token } = c.req.param()

  const rows = await db.get('pacientes', `invitation_token=eq.${token}&select=id,nombre,apellido&limit=1`)
  if (!rows.length) return c.json({ error: 'Invitación inválida o ya utilizada' }, 404)

  return c.json({ nombre: rows[0].nombre, apellido: rows[0].apellido })
})

app.use('*', requireAuth, injectTenant)

// GET /pacientes
app.get('/', async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')
  const { q } = c.req.query()

  let query = `profesional_id=eq.${profesionalId}&order=apellido.asc,nombre.asc&select=*`
  if (q) query += `&or=(nombre.ilike.*${q}*,apellido.ilike.*${q}*)`

  const pacientes = await db.get('pacientes', query)
  return c.json({ pacientes })
})

// GET /pacientes/:id
app.get('/:id', async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')
  const { id } = c.req.param()

  const rows = await db.get('pacientes', `id=eq.${id}&profesional_id=eq.${profesionalId}&limit=1`)
  if (!rows.length) return c.json({ error: 'Paciente no encontrado' }, 404)
  return c.json({ paciente: rows[0] })
})

// POST /pacientes — crear uno
app.post('/', requireRole('profesional'), async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')
  const body = await c.req.json()

  if (!body.nombre || !body.apellido) {
    return c.json({ error: 'Nombre y apellido son obligatorios' }, 400)
  }

  const { ok, data } = await db.post('pacientes', { ...body, profesional_id: profesionalId })
  if (!ok) return c.json({ error: 'Error al crear paciente' }, 500)
  return c.json({ paciente: data[0] }, 201)
})

// POST /pacientes/importar — importar lista desde Excel (ya parseado en frontend)
app.post('/importar', requireRole('profesional'), async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')
  const { pacientes } = await c.req.json()

  if (!Array.isArray(pacientes) || !pacientes.length) {
    return c.json({ error: 'No se recibieron pacientes' }, 400)
  }

  const registros = pacientes
    .filter(p => p.nombre && p.apellido)
    .map(p => ({
      profesional_id: profesionalId,
      nombre: String(p.nombre).trim(),
      apellido: String(p.apellido).trim(),
      frecuencia: ['puntual', 'semanal', 'quincenal', 'a demanda'].includes(String(p.frecuencia || '').trim().toLowerCase()) ? String(p.frecuencia).trim().toLowerCase() : null,
      arancel: p.arancel ? Number(p.arancel) : null,
      fecha_inicio: p.fecha_inicio || null,
    }))

  if (!registros.length) return c.json({ error: 'Ningún registro válido (se requiere Nombre y Apellido)' }, 400)

  const { ok, data } = await db.post('pacientes', registros)
  if (!ok) {
    console.error('Supabase error en importar:', JSON.stringify(data))
    return c.json({ error: 'Error al importar', detalle: data }, 500)
  }
  return c.json({ importados: data.length, pacientes: data }, 201)
})

// PATCH /pacientes/:id
app.patch('/:id', requireRole('profesional'), async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')
  const { id } = c.req.param()
  const body = await c.req.json()

  const { ok, data } = await db.patch('pacientes', `id=eq.${id}&profesional_id=eq.${profesionalId}`, body)
  if (!ok) return c.json({ error: 'Error al actualizar' }, 500)
  if (!data.length) return c.json({ error: 'Paciente no encontrado' }, 404)
  return c.json({ paciente: data[0] })
})

export default app
