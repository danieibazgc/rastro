// src/hooks/useReportes.ts
// Hook que carga reportes y se suscribe a cambios via Supabase Realtime
'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Reporte } from '@/types'

export function useReportes() {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/reportes')
      if (!res.ok) throw new Error('Error al cargar reportes')
      const data: Reporte[] = await res.json()
      setReportes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar()

    // Suscripción Realtime a cambios en la tabla reportes
    const channel = supabase
      .channel('reportes-mapa')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reportes',
        },
        (payload) => {
          const nuevo = payload.new as Reporte
          const tipo = payload.eventType

          if (tipo === 'INSERT') {
            // Solo mostrar si ya es visible
            if (['publicado', 'sin_verificar'].includes(nuevo.estado)) {
              setReportes((prev) => [nuevo, ...prev])
            }
          } else if (tipo === 'UPDATE') {
            setReportes((prev) => {
              // Si el reporte ahora es visible, añadirlo o actualizarlo
              if (['publicado', 'sin_verificar'].includes(nuevo.estado)) {
                const existe = prev.find((r) => r.id === nuevo.id)
                if (existe) {
                  return prev.map((r) => (r.id === nuevo.id ? nuevo : r))
                } else {
                  return [nuevo, ...prev]
                }
              } else {
                // Si pasó a rechazado/archivado, quitar del mapa
                return prev.filter((r) => r.id !== nuevo.id)
              }
            })
          } else if (tipo === 'DELETE') {
            const viejo = payload.old as { id: string }
            setReportes((prev) => prev.filter((r) => r.id !== viejo.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [cargar])

  return { reportes, loading, error, recargar: cargar }
}
