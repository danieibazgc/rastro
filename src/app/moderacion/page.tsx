// src/app/moderacion/page.tsx
import type { Metadata } from 'next'
import ModeracionClientPage from './ModeracionClientPage'

export const metadata: Metadata = {
  title: 'Panel de Moderación',
  description: 'Panel de moderación de reportes de la plataforma Rastro.',
}

export default function ModeracionPage() {
  return <ModeracionClientPage />
}
