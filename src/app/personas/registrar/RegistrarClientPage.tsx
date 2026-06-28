'use client'
// src/app/personas/registrar/RegistrarClientPage.tsx
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { personaSchema, type PersonaInput } from '@/lib/validaciones'
import Toast, { type ToastType } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'
import type { Refugio } from '@/types'
import { UserPlus, Loader2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function RegistrarClientPage() {
  const router = useRouter()
  const [toast, setToast] = useState<{ msg: string; tipo: ToastType } | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [refugios, setRefugios] = useState<Refugio[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonaInput>({
    resolver: zodResolver(personaSchema),
    defaultValues: {
      sexo: 'M',
      nacionalidad: 'venezolano',
      estado_salud: 'estable',
      puede_comunicarse: true,
    },
  })

  // Cargar refugios activos vía API route
  useEffect(() => {
    fetch('/api/refugios')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRefugios(data as Refugio[])
      })
      .catch(console.error)
  }, [])

  async function onSubmit(data: PersonaInput) {
    setEnviando(true)
    try {
      const res = await fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Error al registrar')
      }

      setToast({ msg: '✅ Persona registrada exitosamente.', tipo: 'success' })
      setTimeout(() => router.push('/personas'), 2200)
    } catch (err) {
      setToast({
        msg: err instanceof Error ? err.message : 'Error desconocido',
        tipo: 'error',
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="mb-8">
          <Link href="/personas" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-4 transition-colors">
            <ChevronLeft size={15} /> Volver a búsqueda
          </Link>
          <h1 className="text-2xl font-semibold text-white mb-1">Registrar persona</h1>
          <p className="text-slate-400 text-sm">
            Completa los datos de la persona. Los campos marcados con * son obligatorios.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Nombre y apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="label-base">Nombre *</label>
              <input id="nombre" {...register('nombre')} className="input-base" placeholder="María" />
              {errors.nombre && <p className="field-error">{errors.nombre.message}</p>}
            </div>
            <div>
              <label htmlFor="apellido" className="label-base">Apellido *</label>
              <input id="apellido" {...register('apellido')} className="input-base" placeholder="González" />
              {errors.apellido && <p className="field-error">{errors.apellido.message}</p>}
            </div>
          </div>

          {/* Cédula y fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ci" className="label-base">Cédula *</label>
              <input id="ci" {...register('ci')} className="input-base" placeholder="V-12345678" />
              {errors.ci && <p className="field-error">{errors.ci.message}</p>}
            </div>
            <div>
              <label htmlFor="fecha_nacimiento" className="label-base">Fecha de nacimiento *</label>
              <input id="fecha_nacimiento" {...register('fecha_nacimiento')} type="date" className="input-base" />
              {errors.fecha_nacimiento && <p className="field-error">{errors.fecha_nacimiento.message}</p>}
            </div>
          </div>

          {/* Sexo y nacionalidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sexo" className="label-base">Sexo *</label>
              <select id="sexo" {...register('sexo')} className="input-base">
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
                <option value="N">No especificado</option>
              </select>
            </div>
            <div>
              <label htmlFor="nacionalidad" className="label-base">Nacionalidad *</label>
              <select id="nacionalidad" {...register('nacionalidad')} className="input-base">
                <option value="venezolano">Venezolano</option>
                <option value="extranjero">Extranjero</option>
              </select>
            </div>
          </div>

          {/* Refugio */}
          <div>
            <label htmlFor="refugio_id" className="label-base">Refugio donde se encuentra *</label>
            <select id="refugio_id" {...register('refugio_id')} className="input-base">
              <option value="">— Selecciona un refugio —</option>
              {refugios.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre} · {r.municipio}
                </option>
              ))}
            </select>
            {errors.refugio_id && <p className="field-error">{errors.refugio_id.message}</p>}
          </div>

          {/* Estado de salud */}
          <div>
            <label htmlFor="estado_salud" className="label-base">Estado de salud *</label>
            <select id="estado_salud" {...register('estado_salud')} className="input-base">
              <option value="estable">Estable</option>
              <option value="herido_leve">Herido leve</option>
              <option value="herido_grave">Herido grave</option>
              <option value="atencion_urgente">⚠️ Atención urgente</option>
            </select>
          </div>

          {/* Puede comunicarse */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <input
              id="puede_comunicarse"
              type="checkbox"
              {...register('puede_comunicarse')}
              className="w-4 h-4 accent-blue-500"
            />
            <label htmlFor="puede_comunicarse" className="text-slate-300 text-sm cursor-pointer">
              La persona puede comunicarse por sí misma
            </label>
          </div>

          {/* Señas físicas */}
          <div>
            <label htmlFor="senas_fisicas" className="label-base">Señas físicas (opcional)</label>
            <textarea
              id="senas_fisicas"
              {...register('senas_fisicas')}
              className="input-base resize-none"
              rows={2}
              placeholder="Estatura, color de cabello, ropa que vestía…"
            />
          </div>

          {/* Necesidades especiales */}
          <div>
            <label htmlFor="necesidades_especiales" className="label-base">Necesidades especiales (opcional)</label>
            <textarea
              id="necesidades_especiales"
              {...register('necesidades_especiales')}
              className="input-base resize-none"
              rows={2}
              placeholder="Medicamentos, movilidad reducida, dieta especial…"
            />
          </div>

          {/* Última dirección */}
          <div>
            <label htmlFor="ultima_direccion" className="label-base">Última dirección conocida (opcional)</label>
            <input
              id="ultima_direccion"
              {...register('ultima_direccion')}
              className="input-base"
              placeholder="Calle, barrio, municipio…"
            />
          </div>

          {/* Familiar */}
          <div className="glass-card p-4 space-y-4">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Familiar de contacto (opcional)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="familiar_nombre" className="label-base">Nombre</label>
                <input
                  id="familiar_nombre"
                  {...register('familiar_nombre')}
                  className="input-base"
                  placeholder="Carlos González"
                />
              </div>
              <div>
                <label htmlFor="familiar_telefono" className="label-base">Teléfono</label>
                <input
                  id="familiar_telefono"
                  {...register('familiar_telefono')}
                  className="input-base"
                  placeholder="+58 412-1234567"
                  type="tel"
                />
                {errors.familiar_telefono && <p className="field-error">{errors.familiar_telefono.message}</p>}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={enviando}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {enviando ? (
              <><Loader2 size={16} className="animate-spin" /> Registrando…</>
            ) : (
              <><UserPlus size={16} /> Registrar persona</>
            )}
          </button>
        </form>
      </div>

      {toast && (
        <Toast message={toast.msg} type={toast.tipo} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
