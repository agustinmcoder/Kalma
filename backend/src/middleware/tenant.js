// Middleware: inyecta profesionalId (y pacienteId si es paciente) en el contexto
export async function injectTenant(c, next) {
  const user = c.get('user')
  if (!user) return c.json({ error: 'No autorizado' }, 401)

  const role = user.user_metadata?.role

  if (role === 'profesional') {
    c.set('profesionalId', user.id)
    await next()
    return
  }

  if (role === 'paciente') {
    // Buscar el registro del paciente por user_id para obtener su id y profesional_id
    const res = await fetch(
      `${c.env.SUPABASE_URL}/rest/v1/pacientes?user_id=eq.${user.id}&select=id,profesional_id&limit=1`,
      {
        headers: {
          apikey: c.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${c.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )
    const rows = await res.json()
    if (!rows.length) return c.json({ error: 'Paciente no encontrado' }, 404)

    c.set('profesionalId', rows[0].profesional_id)
    c.set('pacienteId', rows[0].id)
    await next()
    return
  }

  if (role === 'admin') {
    c.set('profesionalId', null)
    await next()
    return
  }

  return c.json({ error: 'Rol no reconocido' }, 403)
}
