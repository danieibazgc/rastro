// src/app/personas/registrar/page.tsx
import type { Metadata } from 'next'
import RegistrarClientPage from './RegistrarClientPage'

export const metadata: Metadata = {
  title: 'Registrar Persona',
  description: 'Registra a una persona en un refugio para que sus familiares puedan encontrarla.',
}

export default function RegistrarPage() {
  return <RegistrarClientPage />
}
