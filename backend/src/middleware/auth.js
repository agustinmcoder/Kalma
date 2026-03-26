// Middleware: verifica el JWT de Supabase en cada request
export async function requireAuth(c, next) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No autorizado' }, 401)
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    // Validamos el JWT contra Supabase
    const res = await fetch(`${c.env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: c.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    })

    if (!res.ok) return c.json({ error: 'Token inválido' }, 401)

    const user = await res.json()
    c.set('user', user)
    await next()
  } catch {
    return c.json({ error: 'Error de autenticación' }, 401)
  }
}

// Middleware: solo permite acceso al rol indicado
export function requireRole(...roles) {
  return async (c, next) => {
    const user = c.get('user')
    const userRole = user?.user_metadata?.role

    if (!roles.includes(userRole)) {
      return c.json({ error: 'Acceso denegado' }, 403)
    }
    await next()
  }
}
