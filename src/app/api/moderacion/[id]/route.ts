// src/app/api/moderacion/[id]/route.ts
// PATCH: Cambia el estado de un reporte (service role)
// Valida cookie mod_token en cada request
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { moderarReporteSchema } from '@/lib/validaciones'
import { cookies } from 'next/headers'

function validarToken(): boolean {
  const cookieStore = cookies()
  const token = cookieStore.get('mod_token')?.value
  const secret = process.env.MODERACION_SECRET
  if (!secret) {
    console.error('MODERACION_SECRET no configurado')
    return false
  }
  return token === secret
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validar autenticación de moderador
  if (!validarToken()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = params
  if (!id) {
    return NextResponse.json({ error: 'ID de reporte requerido' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const parsed = moderarReporteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', detalles: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('reportes')
    .update({
      estado: parsed.data.estado,
      nota_moderacion: parsed.data.nota_moderacion ?? null,
      moderado_por: parsed.data.moderado_por ?? 'moderador',
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[PATCH /api/moderacion]', error)
    return NextResponse.json({ error: 'Error al moderar reporte' }, { status: 500 })
  }

  return NextResponse.json(data)
}

// GET: Lista reportes pendientes (para el panel de moderación)
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
