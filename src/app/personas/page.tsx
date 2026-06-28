// src/app/personas/page.tsx
import type { Metadata } from 'next'
import PersonasClientPage from './PersonasClientPage'

export const metadata: Metadata = {
  title: 'Buscar Personas',
  description: 'Busca personas registradas en refugios después del terremoto. Puedes buscar por nombre, apellido o número de cédula.',
}

export default function PersonasPage() {
  return <PersonasClientPage />
}
