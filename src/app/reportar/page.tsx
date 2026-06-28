// src/app/reportar/page.tsx
import type { Metadata } from 'next'
import ReportarClientPage from './ReportarClientPage'

export const metadata: Metadata = {
  title: 'Crear Reporte',
  description: 'Reporta un incidente de rescate, suministro o vía afectada. Ayuda a coordinar la respuesta a la emergencia.',
}

export default function ReportarPage() {
  return <ReportarClientPage />
}
