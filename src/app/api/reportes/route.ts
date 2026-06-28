// src/app/api/reportes/route.ts
// GET: Lista reportes visibles (publicado + sin_verificar)
// POST: Crea un nuevo reporte (estado siempre 'pendiente')
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { reporteSchema } from '@/lib/validaciones'

export async function GET() {
  const { data, error } = await supabase
    .from('reportes')
    .select('*')
    .in('estado', ['publicado', 'sin_verificar'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[GET /api/reportes]', error)
    return NextResponse.json({ error: 'Error al obtener reportes' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
  }

  const parsed = reporteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', detalles: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { foto_url, ...rest } = parsed.data

  // Insertar con service role para asegurar que estado='pendiente' se aplica
  const { data, error } = await supabaseAdmin
    .from('reportes')
    .insert({
      ...rest,
      foto_url: foto_url || null,
      estado: 'pendiente',
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/reportes]', error)
    return NextResponse.json({ error: 'Error al crear reporte' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
