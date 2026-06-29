'use client'
// src/app/moderacion/ModeracionClientPage.tsx
import { useState, useEffect, useCallback } from 'react'
import type { Reporte } from '@/types'
import { TIPO_LABELS, TIPO_COLORS, formatFecha } from '@/lib/utils'
import Toast, { type ToastType } from '@/components/ui/Toast'
import { Shield, CheckCircle, XCircle, AlertTriangle, RefreshCw, LogOut, Loader2, Clock, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ModeracionClientPage() {
  const router = useRouter()
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; tipo: ToastType } | null>(null)
  const [vista, setVista] = useState<'pendientes' | 'publicados'>('pendientes')
  const [procesando, setProcesando] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [notas, setNotas] = useState<Record<string, string>>({})

  const cargar = useCallback(async (estadoFiltro: 'pendiente' | 'publicado') => {
    setLoading(true)
    setError(null)
    setConfirmando(null)
    try {
      const res = await fetch(`/api/moderacion?estado=${estadoFiltro}`)
      if (res.status === 401) {
        router.push('/moderacion/login')
        return
      }
      if (!res.ok) throw new Error('Error al cargar reportes')
      const data: Reporte[] = await res.json()
      setReportes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    cargar(vista === 'publicados' ? 'publicado' : 'pendiente')
  }, [cargar, vista])

  async function moderar(id: string, estado: 'publicado' | 'rechazado' | 'sin_verificar') {
    setProcesando(id)
    try {
      const res = await fetch(`/api/moderacion/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado,
          nota_moderacion: notas[id] || undefined,
          moderado_por: 'moderador',
        }),
      })

      if (res.status === 401) {
        router.push('/moderacion/login')
        return
      }
      if (!res.ok) throw new Error('Error al moderar')

      const etiqueta = estado === 'publicado' ? 'publicado' : estado === 'rechazado' ? 'rechazado' : 'marcado sin verificar'
      setToast({ msg: `✅ Reporte ${etiqueta} exitosamente`, tipo: 'success' })
      setReportes((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setToast({
        msg: err instanceof Error ? err.message : 'Error desconocido',
        tipo: 'error',
      })
    } finally {
      setProcesando(null)
    }
  }

  async function eliminar(id: string) {
    if (confirmando !== id) {
      setConfirmando(id)
      return
    }
    setProcesando(id)
    setConfirmando(null)
    try {
      const res = await fetch(`/api/moderacion/${id}`, { method: 'DELETE' })
      if (res.status === 401) {
        router.push('/moderacion/login')
        return
      }
      if (!res.ok) throw new Error('Error al eliminar')
      setToast({ msg: 'Reporte eliminado permanentemente', tipo: 'success' })
      setReportes((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setToast({ msg: err instanceof Error ? err.message : 'Error desconocido', tipo: 'error' })
    } finally {
      setProcesando(null)
    }
  }

  async function logout() {
    await fetch('/api/moderacion/login', { method: 'DELETE' })
    router.push('/moderacion/login')
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={20} className="text-amber-400" />
              <h1 className="text-lg sm:text-xl font-semibold text-white">Panel de moderación</h1>
            </div>
            <p className="text-slate-500 text-sm">
              {loading ? 'Cargando…' : `${reportes.length} reporte${reportes.length !== 1 ? 's' : ''} ${vista === 'publicados' ? 'publicado' : 'pendiente'}${reportes.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => cargar(vista === 'publicados' ? 'publicado' : 'pendiente')}
              disabled={loading}
              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
              title="Recargar"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors px-2 sm:px-3 py-2 rounded-lg hover:bg-slate-800"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => setVista('pendientes')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-150 ${
              vista === 'pendientes' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setVista('publicados')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-150 ${
              vista === 'publicados' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Publicados
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rescate/10 border border-rescate/20 text-rescate text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="text-slate-600 animate-spin" />
            <p className="text-slate-600">Cargando reportes pendientes…</p>
          </div>
        )}

        {/* Vacío */}
        {!loading && !error && reportes.length === 0 && (
          <div className="text-center py-20">
            <CheckCircle size={48} className="text-suministro mx-auto mb-4" />
            <p className="text-white font-medium mb-2">
              {vista === 'publicados' ? 'Sin reportes publicados' : '¡Todo al día!'}
            </p>
            <p className="text-slate-500 text-sm">
              {vista === 'publicados'
                ? 'No hay reportes publicados en este momento.'
                : 'No hay reportes pendientes de moderación.'}
            </p>
          </div>
        )}

        {/* Lista de reportes */}
        <div className="space-y-4">
          {reportes.map((r) => (
            <div key={r.id} className="glass-card-accent p-5 animate-fade-in">
              {/* Tipo + tiempo */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className={`badge ${TIPO_COLORS[r.tipo]}`}>
                  {TIPO_LABELS[r.tipo]}
                </span>
                <span className="text-slate-600 text-xs flex items-center gap-1">
                  <Clock size={11} />
                  {formatFecha(r.created_at)}
                </span>
              </div>

              {/* Descripción */}
              <p className="text-slate-200 text-sm leading-relaxed mb-3">{r.descripcion}</p>

              {/* Ubicación */}
              <p className="text-slate-500 text-xs mb-1">
                📍 {r.ubicacion_texto}
                {r.municipio && ` · ${r.municipio}`}
              </p>

              {/* Coordenadas */}
              <p className="text-slate-600 text-xs mb-3">
                🌐 {r.lat.toFixed(5)}, {r.lng.toFixed(5)}
              </p>

              {/* Foto */}
              {r.foto_url && (
                <img
                  src={r.foto_url}
                  alt="Foto adjunta"
                  className="w-full max-h-40 object-cover rounded-lg mb-3 border border-slate-800"
                />
              )}

              {vista === 'pendientes' ? (
                <>
                  {/* Nota de moderación */}
                  <div className="mb-4">
                    <label htmlFor={`nota-${r.id}`} className="label-base">
                      Nota (opcional)
                    </label>
                    <input
                      id={`nota-${r.id}`}
                      type="text"
                      value={notas[r.id] ?? ''}
                      onChange={(e) => setNotas((prev) => ({ ...prev, [r.id]: e.target.value }))}
                      className="input-base text-sm"
                      placeholder="Motivo del rechazo, observación…"
                    />
                  </div>

                  {/* Acciones de moderación */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => moderar(r.id, 'publicado')}
                      disabled={procesando === r.id}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-suministro/20 hover:bg-suministro/30 text-suministro border border-suministro/30 text-sm font-medium transition-all duration-150 disabled:opacity-50 active:scale-95"
                    >
                      {procesando === r.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      Publicar
                    </button>

                    <button
                      onClick={() => moderar(r.id, 'sin_verificar')}
                      disabled={procesando === r.id}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-via/10 hover:bg-via/20 text-via border border-via/30 text-sm font-medium transition-all duration-150 disabled:opacity-50 active:scale-95"
                    >
                      <AlertTriangle size={14} />
                      Sin verificar
                    </button>

                    <button
                      onClick={() => moderar(r.id, 'rechazado')}
                      disabled={procesando === r.id}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rescate/10 hover:bg-rescate/20 text-rescate border border-rescate/30 text-sm font-medium transition-all duration-150 disabled:opacity-50 active:scale-95"
                    >
                      <XCircle size={14} />
                      Rechazar
                    </button>
                  </div>
                </>
              ) : (
                /* Eliminar (vista publicados) */
                <div className="flex items-center justify-end gap-2 mt-2">
                  {confirmando === r.id ? (
                    <>
                      <span className="text-slate-400 text-sm">¿Eliminar permanentemente?</span>
                      <button
                        onClick={() => setConfirmando(null)}
                        disabled={procesando === r.id}
                        className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-800 text-sm transition-all duration-150"
                      >
                        No
                      </button>
                      <button
                        onClick={() => eliminar(r.id)}
                        disabled={procesando === r.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rescate/20 hover:bg-rescate/30 text-rescate border border-rescate/30 text-sm font-medium transition-all duration-150 disabled:opacity-50"
                      >
                        {procesando === r.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        Sí, eliminar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => eliminar(r.id)}
                      disabled={procesando === r.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rescate/10 hover:bg-rescate/20 text-rescate border border-rescate/30 text-sm font-medium transition-all duration-150 disabled:opacity-50 active:scale-95"
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Link al mapa */}
        {!loading && (
          <div className="mt-8 text-center">
            <Link href="/mapa" className="text-slate-600 hover:text-slate-400 text-sm transition-colors">
              ← Ir al mapa
            </Link>
          </div>
        )}
      </div>

      {toast && (
        <Toast message={toast.msg} type={toast.tipo} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
