'use client'
// src/app/reportar/ReportarClientPage.tsx
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { reporteSchema, type ReporteInput } from '@/lib/validaciones'
import { useGeolocalizacion } from '@/hooks/useGeolocalizacion'
import SelectorUbicacionLoader from '@/components/mapa/SelectorUbicacionLoader'
import Toast, { type ToastType } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Package, Construction, MapPin, Navigation, Loader2 } from 'lucide-react'
import type { TipoReporte } from '@/types'

const TIPOS: { value: TipoReporte; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  {
    value: 'rescate',
    label: 'Rescate',
    desc: 'Personas atrapadas o en peligro',
    icon: <AlertTriangle size={20} />,
    color: 'border-rescate/50 bg-rescate/10 text-rescate',
  },
  {
    value: 'suministro',
    label: 'Suministro',
    desc: 'Agua, comida, medicamentos',
    icon: <Package size={20} />,
    color: 'border-suministro/50 bg-suministro/10 text-suministro',
  },
  {
    value: 'via',
    label: 'Vía',
    desc: 'Calles o puentes afectados',
    icon: <Construction size={20} />,
    color: 'border-via/50 bg-via/10 text-via',
  },
]

export default function ReportarClientPage() {
  const router = useRouter()
  const { coordenadas, cargando: geoLoading, error: geoError, obtener } = useGeolocalizacion()
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>({ lat: 10.48, lng: -66.9 })
  const [toast, setToast] = useState<{ msg: string; tipo: ToastType } | null>(null)
  const [enviando, setEnviando] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReporteInput>({
    resolver: zodResolver(reporteSchema),
    defaultValues: { tipo: 'rescate', lat: 10.48, lng: -66.9 },
  })

  const tipoSeleccionado = watch('tipo')

  // Cuando el hook de geo obtiene coordenadas, las aplica al formulario y al mapa
  useEffect(() => {
    if (coordenadas) {
      setLatLng(coordenadas)
      setValue('lat', coordenadas.lat)
      setValue('lng', coordenadas.lng)
    }
  }, [coordenadas, setValue])

  // Cuando se hace click en el mini-mapa
  function handleMapSelect(lat: number, lng: number) {
    setLatLng({ lat, lng })
    setValue('lat', lat)
    setValue('lng', lng)
  }

  async function onSubmit(data: ReporteInput) {
    setEnviando(true)
    try {
      const res = await fetch('/api/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Error al enviar el reporte')
      }

      setToast({ msg: '✅ Reporte enviado. Será revisado por un moderador.', tipo: 'success' })
      setTimeout(() => router.push('/mapa'), 2500)
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
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-1">Crear reporte</h1>
          <p className="text-slate-400 text-sm">
            La información será revisada antes de publicarse. Sé preciso para ayudar mejor.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo de reporte */}
          <div>
            <label className="label-base">Tipo de emergencia</label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {TIPOS.map(({ value, label, desc, icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('tipo', value)}
                  className={`
                    flex flex-col items-center gap-1.5 sm:gap-2
                    p-3 sm:p-4 rounded-xl border-2 transition-all duration-150
                    ${tipoSeleccionado === value
                      ? color
                      : 'border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                    }
                  `}
                >
                  {icon}
                  <span className="text-xs sm:text-sm font-medium">{label}</span>
                  <span className="hidden sm:block text-xs opacity-70 text-center leading-tight">{desc}</span>
                </button>
              ))}
            </div>
            {errors.tipo && <p className="field-error">{errors.tipo.message}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="label-base">Descripción</label>
            <textarea
              id="descripcion"
              {...register('descripcion')}
              className="input-base resize-none"
              rows={4}
              placeholder="Describe la situación con el mayor detalle posible. ¿Cuántas personas? ¿Qué necesitan?"
            />
            {errors.descripcion && <p className="field-error">{errors.descripcion.message}</p>}
          </div>

          {/* Ubicación texto */}
          <div>
            <label htmlFor="ubicacion_texto" className="label-base">Referencia de ubicación</label>
            <input
              id="ubicacion_texto"
              {...register('ubicacion_texto')}
              className="input-base"
              placeholder="Ej: Calle Principal con Av. Sucre, frente al banco"
            />
            {errors.ubicacion_texto && <p className="field-error">{errors.ubicacion_texto.message}</p>}
          </div>

          {/* Municipio */}
          <div>
            <label htmlFor="municipio" className="label-base">Municipio (opcional)</label>
            <input
              id="municipio"
              {...register('municipio')}
              className="input-base"
              placeholder="Ej: Chacao, Baruta, Sucre…"
            />
          </div>

          {/* Coordenadas + mini-mapa */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label-base mb-0">Ubicación en el mapa</label>
              <button
                type="button"
                onClick={obtener}
                disabled={geoLoading}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {geoLoading
                  ? <Loader2 size={12} className="animate-spin" />
                  : <Navigation size={12} />
                }
                {geoLoading ? 'Obteniendo…' : 'Usar mi ubicación'}
              </button>
            </div>

            {geoError && (
              <p className="text-xs text-via mb-2">⚠️ {geoError} — puedes marcar la ubicación en el mapa.</p>
            )}

            <div className="h-52 rounded-xl overflow-hidden border border-slate-800">
              <SelectorUbicacionLoader
                lat={latLng?.lat ?? null}
                lng={latLng?.lng ?? null}
                onSelect={handleMapSelect}
              />
            </div>

            {latLng && (
              <p className="text-xs text-slate-600 mt-1.5 flex items-center gap-1">
                <MapPin size={10} />
                {latLng.lat.toFixed(5)}, {latLng.lng.toFixed(5)}
              </p>
            )}
            {!latLng && (
              <p className="text-xs text-slate-600 mt-1.5">Haz clic en el mapa para marcar la ubicación exacta</p>
            )}
            {errors.lat && <p className="field-error">{errors.lat.message}</p>}
          </div>

          {/* URL foto */}
          <div>
            <label htmlFor="foto_url" className="label-base">URL de foto (opcional)</label>
            <input
              id="foto_url"
              {...register('foto_url')}
              className="input-base"
              placeholder="https://..."
              type="url"
            />
            {errors.foto_url && <p className="field-error">{errors.foto_url.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={enviando || !latLng}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
          >
            {enviando ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Enviando…
              </>
            ) : (
              <>
                <AlertTriangle size={16} />
                Enviar reporte
              </>
            )}
          </button>

        </form>
      </div>

      {toast && (
        <Toast
          message={toast.msg}
          type={toast.tipo}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
