// src/hooks/useGeolocalizacion.ts
'use client'
import { useState, useCallback } from 'react'

interface Coordenadas {
  lat: number
  lng: number
}

interface EstadoGeo {
  coordenadas: Coordenadas | null
  cargando: boolean
  error: string | null
}

export function useGeolocalizacion() {
  const [estado, setEstado] = useState<EstadoGeo>({
    coordenadas: null,
    cargando: false,
    error: null,
  })

  const obtener = useCallback(() => {
    if (!navigator.geolocation) {
      setEstado((prev) => ({
        ...prev,
        error: 'Tu dispositivo no soporta geolocalización',
      }))
      return
    }

    setEstado({ coordenadas: null, cargando: true, error: null })

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setEstado({
          coordenadas: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
          cargando: false,
          error: null,
        })
      },
      (err) => {
        let mensaje = 'No se pudo obtener la ubicación'
        if (err.code === 1) mensaje = 'Permiso de ubicación denegado'
        if (err.code === 2) mensaje = 'Ubicación no disponible'
        if (err.code === 3) mensaje = 'Tiempo de espera agotado'
        setEstado({ coordenadas: null, cargando: false, error: mensaje })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  return { ...estado, obtener }
}
