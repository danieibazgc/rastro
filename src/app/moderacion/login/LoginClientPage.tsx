'use client'
// src/app/moderacion/login/LoginClientPage.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginModeracionSchema, type LoginModeracionInput } from '@/lib/validaciones'
import { useRouter } from 'next/navigation'
import { Shield, Loader2, Lock } from 'lucide-react'

export default function LoginClientPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginModeracionInput>({
    resolver: zodResolver(loginModeracionSchema),
  })

  async function onSubmit(data: LoginModeracionInput) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/moderacion/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Error de autenticación')
      }

      router.push('/moderacion')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 py-16 px-4">
      <div className="w-full max-w-sm">
        {/* Ícono */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-600/10 border border-amber-500/20 mb-4">
            <Shield size={28} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-1">Acceso de moderación</h1>
          <p className="text-slate-500 text-sm">Área restringida para moderadores</p>
        </div>

        {/* Formulario */}
        <div className="glass-card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="secret" className="label-base">Clave de acceso</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="secret"
                  type="password"
                  {...register('secret')}
                  className="input-base pl-9"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              {errors.secret && <p className="field-error">{errors.secret.message}</p>}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rescate/10 border border-rescate/20 text-rescate text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-medium px-4 py-3 rounded transition-all duration-150 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              {loading ? 'Verificando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
