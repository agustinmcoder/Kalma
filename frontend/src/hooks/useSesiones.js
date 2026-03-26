import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api.js'

// Hook que maneja el estado de las sesiones
export function useSesiones(desde, hasta) {
  const [sesiones, setSesiones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSesiones = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (desde) params.set('desde', desde)
      if (hasta) params.set('hasta', hasta)
      const data = await api.get(`/sesiones?${params}`)
      setSesiones(data.sesiones || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [desde, hasta])

  useEffect(() => { fetchSesiones() }, [fetchSesiones])

  async function crearSesion(datos) {
    const data = await api.post('/sesiones', datos)
    await fetchSesiones()
    return data
  }

  async function editarSesion(id, datos) {
    const data = await api.patch(`/sesiones/${id}`, datos)
    await fetchSesiones()
    return data
  }

  async function cancelarSesion(id) {
    await api.delete(`/sesiones/${id}`)
    await fetchSesiones()
  }

  return { sesiones, loading, error, crearSesion, editarSesion, cancelarSesion, refetch: fetchSesiones }
}
