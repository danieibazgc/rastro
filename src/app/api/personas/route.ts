// src/app/api/personas/route.ts
// GET: Busca personas (fuzzy por nombre+apellido o cédula)
// POST: Registra una nueva persona en un refugio
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { personaSchema } from '@/lib/validaciones'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''

  // Usamos supabaseAdmin para evitar edge cases de RLS con joins
  const baseQuery = supabaseAdmin
    .from('personas')
    .select(`
      *,
      refugio:refugios(id, nombre, direccion, municipio, lat, lng, capacidad, personas_count, activo)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  let result

  if (q) {
    const esCedula = /^[VEve]-?\d{6,8}$/i.test(q)
    if (esCedula) {
      const ciNorm = q.toUpperCase().replace(/^([VE])(\d)/, '$1-$2')
      result = await baseQuery.ilike('ci', `%${ciNorm}%`)
    } else {
      // Búsqueda accent-insensitive: buscamos con y sin tilde
      // Supabase ILIKE no soporta unaccent directamente, usamos OR con variantes
      result = await baseQuery.or(
        `nombre.ilike.%${q}%,apellido.ilike.%${q}%`
      )

      // Si no hay resultados, intentar via SQL con unaccent
      if (!result.error && result.data?.length === 0) {
        const { data: sqlData, error: sqlError } = await supabaseAdmin.rpc(
          'buscar_personas',
          { termino: q }
        ).select()
        if (!sqlError && sqlData) {
          return NextResponse.json(sqlData)
        }
      }
    }
  } else {
    result = await baseQuery
  }

  const { data, error } = result ?? { data: null, error: new Error('Sin query') }

  if (error) {
    console.error('[GET /api/personas]', error)
    return NextResponse.json({ error: 'Error al buscar personas' }, { status: 500 })
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

  const parsed = personaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', detalles: parsed.error.flatten() },
      { status: 422 }
    )
  }

  // Normalizar CI a mayúsculas
  const datos = {
    ...parsed.data,
    ci: parsed.data.ci.toUpperCase(),
    familiar_telefono: parsed.data.familiar_telefono || null,
  }

  const { data, error } = await supabaseAdmin
    .from('personas')
    .insert(datos)
    .select()
    .single()

  if (error) {
    console.error('[POST /api/personas]', error)
    return NextResponse.json({ error: 'Error al registrar persona' }, { status: 500 })
  }

  // Actualizar contador de personas en el refugio
  await supabaseAdmin.rpc('incrementar_personas_count', { p_refugio_id: datos.refugio_id })
    .then(() => {}) // ignorar error si la función no existe aún

  return NextResponse.json(data, { status: 201 })
}
