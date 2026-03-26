// Middleware: inyecta el profesional_id del usuario autenticado
// Así cada query está scoped al profesional que hace el request
export async function injectTenant(c, next) {
  const user = c.get('user')

  if (!user) return c.json({ error: 'No autorizado' }, 401)

  const role = user.user_metadata?.role
  const profesionalId = role === 'profesional'
    ? user.id
    : user.user_metadata?.profesional_id // pacientes tienen este campo

  if (!profesionalId) {
    return c.json({ error: 'Tenant no encontrado' }, 400)
  }

  c.set('profesionalId', profesionalId)
  await next()
}
