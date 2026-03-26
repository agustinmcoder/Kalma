import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase.js'

// Hook central de autenticación
// Devuelve: { user, role, loading, signOut }
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sesión actual al montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escucha cambios de sesión (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const role = user?.user_metadata?.role ?? null

  const signOut = () => supabase.auth.signOut()

  return { user, role, loading, signOut }
}
