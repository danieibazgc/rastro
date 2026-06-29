// src/app/api/moderacion/route.ts
// GET: Lista reportes por estado (panel de moderación)
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

function validarToken(): boolean {
  const cookieStore = cookies()
  const token = cookieStore.get('mod_token')?.value
  const secret = process.env.MODERACION_SECRET
  return !!secret && token === secret
}

const ESTADOS_VALIDOS = ['pendiente', 'publicado', 'rechazado', 'sin_verificar', 'archivado'] as const
type EstadoDB = typeof ESTADOS_VALIDOS[number]

export async function GET(req: NextRequest) {
  if (!validarToken()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const estado = (req.nextUrl.searchParams.get('estado') ?? 'pendiente') as EstadoDB
  if (!ESTADOS_VALIDOS.includes(estado)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('reportes')
    .select('*')
    .eq('estado', estado)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Error al obtener reportes' }, { status: 500 })
  }

  return NextResponse.json(data)
}
