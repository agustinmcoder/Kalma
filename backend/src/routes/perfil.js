import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth.js'
import { injectTenant } from '../middleware/tenant.js'
import { createSupabaseClient } from '../lib/supabase.js'

const app = new Hono()

// GET /perfil/buscar?tipo=&zona=&obra_social_id=&q=
// Público — no requiere auth
app.get('/buscar', async (c) => {
  const db = createSupabaseClient(c.env)
  const { tipo, zona, q } = c.req.query()

  let query = `perfil_publicado=eq.true&select=id,nombre,apellido,tipo,orientacion,modalidad,zona,precio_consulta,foto_url,slug,descripcion`
  if (tipo) query += `&tipo=eq.${tipo}`
  if (zona) query += `&zona=ilike.*${zona}*`

  const profesionales = await db.get('profesionales', query)

  // Filtro por nombre si hay q
  const filtrados = q
    ? profesionales.filter(p =>
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(q.toLowerCase())
      )
    : profesionales

  return c.json({ profesionales: filtrados })
})

// GET /perfil/:slug — público
app.get('/:slug', async (c) => {
  const db = createSupabaseClient(c.env)
  const { slug } = c.req.param()

  const rows = await db.get('profesionales', `slug=eq.${slug}&perfil_publicado=eq.true&limit=1&select=id,nombre,apellido,tipo,matricula,orientacion,modalidad,zona,precio_consulta,foto_url,descripcion`)
  if (!rows.length) return c.json({ error: 'Perfil no encontrado' }, 404)

  const prof = rows[0]

  // Obras sociales
  const obras = await db.get('profesional_obras_sociales', `profesional_id=eq.${prof.id}&select=obra_social:obras_sociales_catalogo(id,nombre)`)

  return c.json({
    profesional: {
      ...prof,
      obras_sociales: obras.map(o => o.obra_social),
    }
  })
})

// --- Rutas autenticadas para editar el propio perfil ---
app.use('/mi-perfil*', requireAuth, injectTenant)

// GET /perfil/mi-perfil
app.get('/mi-perfil', async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')

  const rows = await db.get('profesionales', `id=eq.${profesionalId}&limit=1`)
  if (!rows.length) return c.json({ error: 'Perfil no encontrado' }, 404)

  const prof = rows[0]
  const obras = await db.get('profesional_obras_sociales', `profesional_id=eq.${profesionalId}&select=obra_social_id`)
  const catalogo = await db.get('obras_sociales_catalogo', '')

  return c.json({
    profesional: prof,
    obras_sociales_seleccionadas: obras.map(o => o.obra_social_id),
    catalogo,
  })
})

// PATCH /perfil/mi-perfil
app.patch('/mi-perfil', requireAuth, injectTenant, async (c) => {
  const db = createSupabaseClient(c.env)
  const profesionalId = c.get('profesionalId')
  const body = await c.req.json()
  const { obras_sociales, ...campos } = body

  // Validar slug único si se envía
  if (campos.slug) {
    campos.slug = campos.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
    const existing = await db.get('profesionales', `slug=eq.${campos.slug}&id=neq.${profesionalId}&limit=1`)
    if (existing.length) return c.json({ error: 'Ese slug ya está en uso' }, 409)
  }

  const { ok, data } = await db.patch('profesionales', `id=eq.${profesionalId}`, campos)
  if (!ok) return c.json({ error: 'Error al actualizar perfil' }, 500)

  // Actualizar obras sociales si se envían
  if (Array.isArray(obras_sociales)) {
    await db.delete('profesional_obras_sociales', `profesional_id=eq.${profesionalId}`)
    if (obras_sociales.length > 0) {
      const rows = obras_sociales.map(id => ({ profesional_id: profesionalId, obra_social_id: id }))
      await db.post('profesional_obras_sociales', rows)
    }
  }

  return c.json({ profesional: data[0] })
})

export default app
