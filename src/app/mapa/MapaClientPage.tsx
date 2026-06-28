'use client'
// src/app/mapa/MapaClientPage.tsx
import { useState, useCallback } from 'react'
import MapaLoader from '@/components/mapa/MapaLoader'
import { useReportes } from '@/hooks/useReportes'
import { TIPO_LABELS, TIPO_COLORS, formatFecha } from '@/lib/utils'
import type { Reporte, TipoReporte } from '@/types'
import { RefreshCw, AlertCircle, MapPin, Radio, ThumbsUp, Plus, Menu, X, List } from 'lucide-react'
import Link from 'next/link'

const TIPOS: TipoReporte[] = ['rescate', 'suministro', 'via']

export default function MapaClientPage() {
  const { reportes, loading, error, recargar } = useReportes()
  const [filtro, setFiltro] = useState<TipoReporte | 'todos'>('todos')
  // mobile: panel cerrado por defecto; desktop (≥768px): abierto
  const [panelAbierto, setPanelAbierto] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  )

  const reportesFiltrados = filtro === 'todos'
    ? reportes
    : reportes.filter((r) => r.tipo === filtro)

  const contadores = {
    todos: reportes.length,
    rescate: reportes.filter((r) => r.tipo === 'rescate').length,
    suministro: reportes.filter((r) => r.tipo === 'suministro').length,
    via: reportes.filter((r) => r.tipo === 'via').length,
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex relative overflow-hidden">

      {/* ── Overlay mobile (click fuera = cerrar panel) ── */}
      {panelAbierto && (
        <div
          className="fixed inset-0 z-[999] bg-black/50 md:hidden"
          onClick={() => setPanelAbierto(false)}
          aria-hidden
        />
      )}

      {/* ── Panel lateral / drawer ────────────────────────
          Mobile:  posición fija, se desliza desde la izquierda
          Desktop: parte del layout flex, siempre visible       */}
      <aside
        className={`
          fixed md:relative
          top-[3.5rem] md:top-0
          left-0 bottom-0
          z-[1000]
          w-[min(320px,85vw)] md:w-80
          flex flex-col
          border-r border-slate-800/80
          bg-slate-950/95 md:bg-slate-950/90
          backdrop-blur-sm
          transition-transform duration-300 ease-in-out
          ${panelAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header del panel */}
        <div className="p-4 border-b border-slate-800/60">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-white font-semibold text-sm">Mapa en tiempo real</h1>
              <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                <Radio size={10} className="text-green-500 animate-pulse" />
                Actualizando automáticamente
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={recargar}
                disabled={loading}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                title="Recargar"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              {/* Cerrar en mobile */}
              <button
                onClick={() => setPanelAbierto(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors md:hidden"
                aria-label="Cerrar panel"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Filtros — scroll horizontal en mobile */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFiltro('todos')}
              className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
                filtro === 'todos'
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                  : 'text-slate-500 border-slate-700 hover:text-slate-300'
              }`}
            >
              Todos ({contadores.todos})
            </button>
            {TIPOS.map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltro(tipo)}
                className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
                  filtro === tipo
                    ? TIPO_COLORS[tipo]
                    : 'text-slate-500 border-slate-700 hover:text-slate-300'
                }`}
              >
                {TIPO_LABELS[tipo]} ({contadores[tipo]})
              </button>
            ))}
          </div>
        </div>

        {/* Lista de reportes */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {loading && (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-slate-600 text-xs">Cargando reportes…</p>
            </div>
          )}

          {error && (
            <div className="m-3 p-3 rounded-lg bg-rescate/10 border border-rescate/20 flex items-start gap-2">
              <AlertCircle size={14} className="text-rescate mt-0.5 shrink-0" />
              <div>
                <p className="text-rescate text-xs font-medium">Error al cargar</p>
                <p className="text-slate-500 text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && reportesFiltrados.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-center px-6">
              <MapPin size={24} className="text-slate-700" />
              <p className="text-slate-500 text-sm">Sin reportes visibles</p>
              <p className="text-slate-600 text-xs">Sé el primero en reportar</p>
            </div>
          )}

          {reportesFiltrados.map((r) => (
            <ReporteCard key={r.id} reporte={r} onSelect={() => setPanelAbierto(false)} />
          ))}
        </div>

        {/* CTA reportar */}
        <div className="p-3 border-t border-slate-800/60">
          <Link
            href="/reportar"
            className="btn-primary w-full text-center text-sm flex items-center justify-center gap-2"
          >
            <Plus size={15} />
            Crear reporte
          </Link>
        </div>
      </aside>

      {/* ── Mapa — ocupa todo el espacio en mobile ── */}
      <div className="flex-1 relative">
        <MapaLoader reportes={reportesFiltrados} />

        {/* FAB mobile — abrir lista */}
        <button
          onClick={() => setPanelAbierto(true)}
          className={`
            absolute bottom-6 left-1/2 -translate-x-1/2
            md:hidden
            flex items-center gap-2
            bg-slate-900 border border-slate-700 text-white
            px-4 py-2.5 rounded-full shadow-glass
            text-sm font-medium
            transition-all duration-200
            ${panelAbierto ? 'opacity-0 pointer-events-none' : 'opacity-100'}
          `}
          aria-label="Ver lista de reportes"
        >
          <List size={16} />
          <span>Ver reportes ({reportesFiltrados.length})</span>
        </button>

        {/* Toggle desktop — colapsar panel */}
        <button
          onClick={() => setPanelAbierto((p) => !p)}
          className="hidden md:flex absolute top-4 left-0 z-[1001] p-2 rounded-r-lg bg-slate-900/90 border border-l-0 border-slate-700 text-slate-400 hover:text-white transition-all duration-300"
          title={panelAbierto ? 'Ocultar panel' : 'Mostrar panel'}
        >
          <span className="text-xs">{panelAbierto ? '◀' : '▶'}</span>
        </button>
      </div>
    </div>
  )
}

// ─── Tarjeta de reporte con upvote interactivo ────────────────────────────────
function ReporteCard({ reporte, onSelect }: { reporte: Reporte; onSelect?: () => void }) {
  const [upvotes, setUpvotes] = useState(reporte.upvotes)
  const [votado, setVotado] = useState(false)
  const [votando, setVotando] = useState(false)

  const handleUpvote = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (votado || votando) return
    setVotando(true)
    setUpvotes((v) => v + 1)
    setVotado(true)
    try {
      const res = await fetch(`/api/reportes/${reporte.id}/upvote`, { method: 'POST' })
      if (res.status === 429) {
        setUpvotes((v) => v - 1)
        setVotado(true)
      } else if (!res.ok) {
        setUpvotes((v) => v - 1)
        setVotado(false)
      }
    } catch {
      setUpvotes((v) => v - 1)
      setVotado(false)
    } finally {
      setVotando(false)
    }
  }, [reporte.id, votado, votando])

  return (
    <div
      className="mx-3 my-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 active:bg-slate-800/60 transition-all duration-150 animate-fade-in cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className={`badge ${TIPO_COLORS[reporte.tipo]}`}>
          {TIPO_LABELS[reporte.tipo]}
        </span>
        {reporte.estado === 'sin_verificar' && (
          <span className="text-xs text-via bg-via/10 px-1.5 py-0.5 rounded shrink-0">
            Sin verificar
          </span>
        )}
      </div>
      <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">{reporte.descripcion}</p>
      <p className="text-slate-600 text-xs mt-1.5 truncate">
        📍 {reporte.ubicacion_texto}{reporte.municipio && ` · ${reporte.municipio}`}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-slate-700 text-xs">{formatFecha(reporte.created_at)}</span>
        <button
          onClick={handleUpvote}
          disabled={votado || votando}
          title={votado ? 'Ya votaste' : 'Confirmar reporte'}
          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-all duration-150 min-h-[28px] ${
            votado
              ? 'text-blue-400 bg-blue-500/10'
              : 'text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 active:scale-95'
          }`}
        >
          <ThumbsUp size={11} className={votando ? 'animate-bounce' : ''} />
          {upvotes}
        </button>
      </div>
    </div>
  )
}
