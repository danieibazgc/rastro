// src/app/api/moderacion/route.ts
// GET: Lista todos los reportes pendientes (panel de moderación)
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

function validarToken(): boolean {
  const cookieStore = cookies()
  const token = cookieStore.get('mod_token')?.value
  const secret = process.env.MODERACION_SECRET
  return !!secret && token === secret
}

export async function GET() {
  if (!validarToken()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('reportes')
    .select('*')
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Error al obtener pendientes' }, { status: 500 })
  }

  return NextResponse.json(data)
}
