// src/app/api/moderacion/login/route.ts
// POST: Valida la clave de moderación y setea la cookie mod_token
import { NextRequest, NextResponse } from 'next/server'
import { loginModeracionSchema } from '@/lib/validaciones'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const parsed = loginModeracionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Clave requerida' }, { status: 422 })
  }

  const secret = process.env.MODERACION_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Servidor no configurado' }, { status: 500 })
  }

  if (parsed.data.secret !== secret) {
    return NextResponse.json({ error: 'Clave incorrecta' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('mod_token', secret, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 horas
    path: '/',
    // secure: true en producción (Vercel lo aplica automáticamente)
  })

  return res
}

// DELETE: Logout — elimina la cookie
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('mod_token', '', { maxAge: 0, path: '/' })
  return res
}
