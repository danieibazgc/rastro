// src/app/moderacion/login/page.tsx
import type { Metadata } from 'next'
import LoginClientPage from './LoginClientPage'

export const metadata: Metadata = {
  title: 'Acceso de Moderación',
  description: 'Acceso restringido para moderadores de la plataforma Rastro.',
}

export default function LoginModeracionPage() {
  return <LoginClientPage />
}
