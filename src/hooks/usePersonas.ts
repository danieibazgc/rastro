// src/hooks/usePersonas.ts
'use client'
import { useState, useCallback } from 'react'
import type { Persona } from '@/types'

export function usePersonas() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [buscado, setBuscado] = useState(false)

  const buscar = useCallback(async (q: string) => {
    setLoading(true)
    setError(null)
    setBuscado(true)
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : ''
      const res = await fetch(`/api/personas${params}`)
      if (!res.ok) throw new Error('Error al buscar personas')
      const data: Persona[] = await res.json()
      setPersonas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  return { personas, loading, error, buscado, buscar }
}
