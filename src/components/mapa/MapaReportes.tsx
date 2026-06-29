'use client'
// src/components/mapa/MapaReportes.tsx
// Componente Leaflet — solo se importa via next/dynamic con ssr:false
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Reporte, TipoReporte } from '@/types'
import { TIPO_LABELS, TIPO_HEX, formatFecha } from '@/lib/utils'

// Paleta de colores por tipo
const COLORES: Record<TipoReporte, string> = {
  rescate: '#EF4444',
  suministro: '#22C55E',
  via: '#F59E0B',
}

// Crear ícono SVG custom para cada tipo
function crearIcono(tipo: TipoReporte) {
  const color = TIPO_HEX[tipo]
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${color}" flood-opacity="0.5"/>
        </filter>
      </defs>
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z"
        fill="${color}" filter="url(#shadow)"/>
      <circle cx="14" cy="13" r="6" fill="white" opacity="0.9"/>
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  })
}

// Componente auxiliar para centrar el mapa en Venezuela
function MapaInicio() {
  const mapa = useMap()
  useEffect(() => {
    // Venezuela centrada
    mapa.setView([10.48, -66.9], 12)
  }, [mapa])
  return null
}

interface MapaReportesProps {
  reportes: Reporte[]
}

const ESTADO_LABEL: Record<string, string> = {
  publicado: '✅ Verificado',
  sin_verificar: '⚠️ Sin verificar',
}

export default function MapaReportes({ reportes }: MapaReportesProps) {
  return (
    <MapContainer
      center={[10.48, -66.9]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <MapaInicio />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reportes.map((reporte) => (
        <Marker
          key={reporte.id}
          position={[reporte.lat, reporte.lng]}
          icon={crearIcono(reporte.tipo)}
        >
          <Popup maxWidth={280} minWidth={220}>
            <div className="font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              {/* Tipo y estado */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span
                  style={{
                    background: COLORES[reporte.tipo] + '22',
                    color: COLORES[reporte.tipo],
                    border: `1px solid ${COLORES[reporte.tipo]}44`,
                    borderRadius: 4,
                    padding: '2px 8px',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {TIPO_LABELS[reporte.tipo]}
                </span>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>
                  {ESTADO_LABEL[reporte.estado] ?? reporte.estado}
                </span>
              </div>

              {/* Descripción */}
              <p style={{ color: '#E2E8F0', fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>
                {reporte.descripcion}
              </p>

              {/* Ubicación */}
              <p style={{ color: '#64748B', fontSize: 11, marginBottom: 4 }}>
                📍 {reporte.ubicacion_texto}
                {reporte.municipio && ` · ${reporte.municipio}`}
              </p>

              {/* Foto */}
              {reporte.foto_url && (
                <img
                  src={reporte.foto_url}
                  alt="Foto del reporte"
                  style={{ width: '100%', borderRadius: 8, marginTop: 8, objectFit: 'cover', maxHeight: 120 }}
                />
              )}

              {/* Footer */}
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: '#475569' }}>
                  {formatFecha(reporte.created_at)}
                </span>
                <span style={{ fontSize: 11, color: '#3B82F6' }}>
                  👍 {reporte.upvotes}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
