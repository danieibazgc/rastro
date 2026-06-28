// src/app/api/cron/archivar/route.ts
// Vercel Cron Job — archiva reportes publicados con más de 7 días
// Se dispara según vercel.json: "0 3 * * *" (3am UTC diario)
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  // Verificar que el request viene de Vercel Cron (header de autorización)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET ?? ''}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const sieteAtrás = new Date()
  sieteAtrás.setDate(sieteAtrás.getDate() - 7)

  const { data, error } = await supabaseAdmin
    .from('reportes')
    .update({ estado: 'archivado' })
    .in('estado', ['publicado', 'sin_verificar'])
    .lt('created_at', sieteAtrás.toISOString())
    .select('id')

  if (error) {
    console.error('[CRON archivar]', error)
    return NextResponse.json({ error: 'Error al archivar' }, { status: 500 })
  }

  return NextResponse.json({ archivados: data?.length ?? 0 })
}
