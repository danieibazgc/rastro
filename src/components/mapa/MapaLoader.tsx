'use client'
// src/components/mapa/MapaLoader.tsx
// Wrapper que carga el mapa con next/dynamic + ssr:false para evitar
// el error "window is not defined" de Leaflet en SSR
import dynamic from 'next/dynamic'
import type { Reporte } from '@/types'

const MapaReportesLazy = dynamic(
  () => import('./MapaReportes'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Cargando mapa…</p>
        </div>
      </div>
    ),
  }
)

interface MapaLoaderProps {
  reportes: Reporte[]
}

export default function MapaLoader({ reportes }: MapaLoaderProps) {
  return <MapaReportesLazy reportes={reportes} />
}
