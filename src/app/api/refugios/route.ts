// src/app/api/refugios/route.ts
// GET: Lista refugios activos (para el selector del formulario de registro)
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('refugios')
    .select('id, nombre, direccion, municipio, lat, lng, capacidad, personas_count, activo')
    .eq('activo', true)
    .order('nombre')

  if (error) {
    console.error('[GET /api/refugios]', error)
    return NextResponse.json({ error: 'Error al obtener refugios' }, { status: 500 })
  }

  return NextResponse.json(data)
}
