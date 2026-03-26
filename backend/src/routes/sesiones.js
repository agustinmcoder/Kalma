import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth.js'
import { injectTenant } from '../middleware/tenant.js'
import { createSupabaseClient } from '../lib/supabase.js'

const app = new Hono()
app.use('*', requireAuth, injectTenant)

// GET /sesiones?desde=ISO&hasta=ISO
// El profesional ve todas las suyas; el paciente ve solo las propias
app.get('/', async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')
  const user = c.get('user')
  const role = user.user_metadata?.role

  const { desde, hasta } = c.req.query()

  let query = `profesional_id=eq.${profesionalId}&order=fecha_inicio.asc`
  if (desde) query += `&fecha_inicio=gte.${desde}`
  if (hasta) query += `&fecha_inicio=lte.${hasta}`

  // Si es paciente, filtrar solo sus sesiones
  if (role === 'paciente') {
    const pacienteId = user.user_metadata?.paciente_id
    if (!pacienteId) return c.json({ sesiones: [] })
    query += `&paciente_id=eq.${pacienteId}`
  }

  // Traer también datos del paciente (join via select)
  query += '&select=*,paciente:pacientes(id,nombre,apellido)'

  const sesiones = await db.get('sesiones', query)
  return c.json({ sesiones })
})

// POST /sesiones
app.post('/', async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')
  const body = await c.req.json()

  const { paciente_id, fecha_inicio, fecha_fin, modalidad, monto, notas, es_recurrente, semanas, intervalo_dias = 7 } = body

  if (!paciente_id || !fecha_inicio || !fecha_fin) {
    return c.json({ error: 'Faltan campos obligatorios: paciente_id, fecha_inicio, fecha_fin' }, 400)
  }

  // Detectar superposición con otras sesiones del profesional
  const conflictos = await db.get('sesiones',
    `profesional_id=eq.${profesionalId}&estado=neq.cancelada&fecha_inicio=lt.${fecha_fin}&fecha_fin=gt.${fecha_inicio}&select=id,fecha_inicio,fecha_fin`
  )
  if (conflictos.length > 0) {
    return c.json({ error: 'Superposición de horarios con otra sesión', conflictos }, 409)
  }

  const sesionBase = { profesional_id: profesionalId, paciente_id, fecha_inicio, fecha_fin, modalidad, monto, notas, es_recurrente: !!es_recurrente }

  // Si es recurrente, crear múltiples sesiones con el mismo recurrencia_id
  if (es_recurrente && semanas > 1) {
    const recurrencia_id = crypto.randomUUID()
    const sesiones = []

    for (let i = 0; i < semanas; i++) {
      const inicio = new Date(fecha_inicio)
      const fin = new Date(fecha_fin)
      inicio.setDate(inicio.getDate() + i * intervalo_dias)
      fin.setDate(fin.getDate() + i * intervalo_dias)

      sesiones.push({ ...sesionBase, recurrencia_id, fecha_inicio: inicio.toISOString(), fecha_fin: fin.toISOString() })
    }

    const { ok, data } = await db.post('sesiones', sesiones)
    if (!ok) return c.json({ error: 'Error al crear sesiones' }, 500)
    return c.json({ sesiones: data }, 201)
  }

  // Sesión única
  const { ok, data } = await db.post('sesiones', sesionBase)
  if (!ok) return c.json({ error: 'Error al crear la sesión' }, 500)
  return c.json({ sesion: data[0] }, 201)
})

// PATCH /sesiones/:id
app.patch('/:id', async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')
  const { id } = c.req.param()
  const body = await c.req.json()

  // Si cambia el horario, verificar superposición (excluyendo la sesión actual)
  if (body.fecha_inicio && body.fecha_fin) {
    const conflictos = await db.get('sesiones',
      `profesional_id=eq.${profesionalId}&id=neq.${id}&estado=neq.cancelada&fecha_inicio=lt.${body.fecha_fin}&fecha_fin=gt.${body.fecha_inicio}&select=id`
    )
    if (conflictos.length > 0) {
      return c.json({ error: 'Superposición de horarios con otra sesión', conflictos }, 409)
    }
  }

  const { ok, data } = await db.patch('sesiones', `id=eq.${id}&profesional_id=eq.${profesionalId}`, body)
  if (!ok) return c.json({ error: 'Error al actualizar' }, 500)
  if (!data.length) return c.json({ error: 'Sesión no encontrada' }, 404)
  return c.json({ sesion: data[0] })
})

// DELETE /sesiones/:id — cancela (no borra)
app.delete('/:id', async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')
  const { id } = c.req.param()

  const { ok, data } = await db.patch('sesiones', `id=eq.${id}&profesional_id=eq.${profesionalId}`, { estado: 'cancelada' })
  if (!ok) return c.json({ error: 'Error al cancelar' }, 500)
  if (!data.length) return c.json({ error: 'Sesión no encontrada' }, 404)
  return c.json({ message: 'Sesión cancelada' })
})

export default app
