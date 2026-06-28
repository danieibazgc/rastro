// src/app/page.tsx
// Redirige la raíz al mapa
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/mapa')
}
