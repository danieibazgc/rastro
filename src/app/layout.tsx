// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/ui/Navbar'

export const metadata: Metadata = {
  title: {
    default: 'Rastro — Respuesta a Emergencias',
    template: '%s | Rastro',
  },
  description:
    'Plataforma colaborativa de respuesta a emergencias post-terremoto en Venezuela. Reporta incidentes, encuentra personas y coordina ayuda en tiempo real.',
  keywords: ['emergencias', 'terremoto', 'Venezuela', 'rescate', 'ayuda humanitaria', 'personas desaparecidas'],
  openGraph: {
    title: 'Rastro — Respuesta a Emergencias',
    description: 'Plataforma colaborativa de respuesta a emergencias post-terremoto.',
    type: 'website',
    locale: 'es_VE',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-800/50 py-4 px-6 text-center text-slate-600 text-xs">
          Rastro · Plataforma de emergencias post-terremoto · Datos colaborativos — verifica antes de actuar
        </footer>
      </body>
    </html>
  )
}
