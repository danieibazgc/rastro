// src/app/mapa/page.tsx
import type { Metadata } from 'next'
import MapaClientPage from './MapaClientPage'

export const metadata: Metadata = {
  title: 'Mapa de Emergencias',
  description: 'Mapa colaborativo en tiempo real con reportes de rescate, suministros y vías afectadas por el terremoto.',
}

export default function MapaPage() {
  return <MapaClientPage />
}
