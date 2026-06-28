'use client'
// src/components/mapa/SelectorUbicacion.tsx
// Mini-mapa de Leaflet para seleccionar coordenadas con un click
// También se importa con next/dynamic + ssr:false
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Ícono de pin azul para la selección
const pinoAzul = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20S24 20 24 12C24 5.373 18.627 0 12 0z" fill="#3B82F6"/>
    <circle cx="12" cy="11" r="5" fill="white" opacity="0.9"/>
  </svg>`,
  className: '',
  iconSize: [24, 32],
  iconAnchor: [12, 32],
})

interface ClickHandlerProps {
  onSelect: (lat: number, lng: number) => void
}

function ClickHandler({ onSelect }: ClickHandlerProps) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

interface SelectorUbicacionProps {
  lat: number | null
  lng: number | null
  onSelect: (lat: number, lng: number) => void
}

export default function SelectorUbicacion({ lat, lng, onSelect }: SelectorUbicacionProps) {
  const [listo, setListo] = useState(false)
  useEffect(() => { setListo(true) }, [])
  if (!listo) return null

  return (
    <MapContainer
      center={[10.48, -66.9]}
      zoom={12}
      style={{ height: '100%', width: '100%', borderRadius: 8 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
      <ClickHandler onSelect={onSelect} />
      {lat !== null && lng !== null && (
        <Marker position={[lat, lng]} icon={pinoAzul} />
      )}
    </MapContainer>
  )
}
