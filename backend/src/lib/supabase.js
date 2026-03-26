// Helper para hacer queries a Supabase desde el Worker
// Evita repetir los headers en cada ruta

export function createSupabaseClient(env) {
  const headers = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  }

  const base = `${env.SUPABASE_URL}/rest/v1`

  return {
    async get(table, query = '') {
      const res = await fetch(`${base}/${table}?${query}`, { headers })
      return res.json()
    },
    async post(table, body) {
      const res = await fetch(`${base}/${table}`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'return=representation' },
        body: JSON.stringify(body),
      })
      return { ok: res.ok, data: await res.json() }
    },
    async patch(table, query, body) {
      const res = await fetch(`${base}/${table}?${query}`, {
        method: 'PATCH',
        headers: { ...headers, Prefer: 'return=representation' },
        body: JSON.stringify(body),
      })
      return { ok: res.ok, data: await res.json() }
    },
    async delete(table, query) {
      const res = await fetch(`${base}/${table}?${query}`, {
        method: 'DELETE',
        headers,
      })
      return { ok: res.ok }
    },
  }
}
