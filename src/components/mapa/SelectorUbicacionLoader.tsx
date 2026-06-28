'use client'
// src/components/mapa/SelectorUbicacionLoader.tsx
import dynamic from 'next/dynamic'

const SelectorUbicacionLazy = dynamic(
  () => import('./SelectorUbicacion'),
  { ssr: false, loading: () => (
    <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center">
      <p className="text-slate-600 text-sm">Cargando mapa…</p>
    </div>
  )}
)

interface Props {
  lat: number | null
  lng: number | null
  onSelect: (lat: number, lng: number) => void
}

export default function SelectorUbicacionLoader(props: Props) {
  return <SelectorUbicacionLazy {...props} />
}
