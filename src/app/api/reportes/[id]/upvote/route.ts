// src/app/api/reportes/[id]/upvote/route.ts
// POST: Incrementa el upvote de un reporte (atómico via función SQL)
// Rate-limit simple por cookie de dispositivo
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'
import { z } from 'zod'

const uuidSchema = z.string().uuid()

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  // Rate-limit por cookie — evitar spam de upvotes
  const cookieStore = cookies()
  const votosKey = `upvote_${id}`
  const yaVoto = cookieStore.get(votosKey)

  if (yaVoto) {
    return NextResponse.json({ error: 'Ya votaste por este reporte' }, { status: 429 })
  }

  const { error } = await supabaseAdmin.rpc('incrementar_upvote', { reporte_id: id })

  if (error) {
    console.error('[POST /api/reportes/[id]/upvote]', error)
    return NextResponse.json({ error: 'Error al registrar voto' }, { status: 500 })
  }

  const res = NextResponse.json({ ok: true })
  // Cookie de 24 horas para evitar re-voto
  res.cookies.set(votosKey, '1', {
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
    path: '/',
  })

  return res
}
