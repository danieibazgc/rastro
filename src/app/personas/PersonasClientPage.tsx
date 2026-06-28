'use client'
// src/app/personas/PersonasClientPage.tsx
import { useState, useRef } from 'react'
import { usePersonas } from '@/hooks/usePersonas'
import { SALUD_LABELS, SALUD_COLORS } from '@/lib/utils'
import type { Persona } from '@/types'
import { Search, UserX, Users, Phone, MapPin, Loader2, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function PersonasClientPage() {
  const [query, setQuery] = useState('')
  const { personas, loading, error, buscado, buscar } = usePersonas()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    buscar(query.trim())
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        {/* Encabezado */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-3 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-3">
            <Users size={14} className="text-blue-400" />
            <span className="text-blue-400 text-xs font-medium">Buscador de personas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">¿Buscas a alguien?</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Busca por nombre, apellido o número de cédula. Las personas son registradas por voluntarios en los refugios.
          </p>
        </div>

        {/* Buscador */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
              <input
                ref={inputRef}
                id="busqueda-persona"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input-base pl-10 pr-4"
                placeholder="Nombre, apellido o cédula (V-12345678)"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 sm:whitespace-nowrap sm:px-5"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Buscar
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rescate/10 border border-rescate/20 text-rescate text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Resultados */}
        {!buscado && (
          <div className="text-center py-16">
            <Users size={48} className="text-slate-800 mx-auto mb-4" />
            <p className="text-slate-600">Escribe un nombre o cédula para comenzar la búsqueda</p>
          </div>
        )}

        {buscado && !loading && personas.length === 0 && !error && (
          <div className="text-center py-16">
            <UserX size={48} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 font-medium mb-2">No se encontró ninguna persona</p>
            <p className="text-slate-600 text-sm mb-6">
              Puede que aún no haya sido registrada. ¿Estás en el refugio con ella?
            </p>
            <Link href="/personas/registrar" className="btn-primary inline-flex items-center gap-2">
              <UserPlus size={16} />
              Registrar persona
            </Link>
          </div>
        )}

        {personas.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-500 text-sm">
                {personas.length} persona{personas.length !== 1 ? 's' : ''} encontrada{personas.length !== 1 ? 's' : ''}
              </p>
              <Link href="/personas/registrar" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1.5 transition-colors">
                <UserPlus size={14} />
                Registrar nueva
              </Link>
            </div>
            <div className="space-y-3">
              {personas.map((p) => (
                <PersonaCard key={p.id} persona={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PersonaCard({ persona: p }: { persona: Persona }) {
  const [expandido, setExpandido] = useState(false)

  return (
    <div className="glass-card p-4 animate-fade-in">
      <div
        className="flex items-start justify-between gap-3 cursor-pointer"
        onClick={() => setExpandido((v) => !v)}
      >
        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-white font-medium text-base">
              {p.nombre} {p.apellido}
            </h3>
            <span className={`badge ${SALUD_COLORS[p.estado_salud]}`}>
              {SALUD_LABELS[p.estado_salud]}
            </span>
          </div>
          <p className="text-slate-500 text-xs">🪪 {p.ci}</p>
          {p.refugio && (
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
              <MapPin size={12} className="text-blue-400 shrink-0" />
              {p.refugio.nombre}
              {p.refugio.municipio && ` · ${p.refugio.municipio}`}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-slate-600 text-xs hidden sm:block">
            {p.puede_comunicarse ? '📞 Puede comunicarse' : '🔇 No puede'}
          </span>
          <span className="text-slate-600 text-xs sm:hidden">
            {p.puede_comunicarse ? '📞' : '🔇'}
          </span>
          <span className="text-slate-600 text-xs">{expandido ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Detalles expandibles */}
      {expandido && (
        <div className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-slide-up">
          <div>
            <p className="text-slate-500 uppercase tracking-wide text-xs mb-0.5">Edad</p>
            <p className="text-slate-300">
              {new Date().getFullYear() - new Date(p.fecha_nacimiento).getFullYear()} años
            </p>
          </div>
          <div>
            <p className="text-slate-500 uppercase tracking-wide text-xs mb-0.5">Sexo</p>
            <p className="text-slate-300">{{ F: 'Femenino', M: 'Masculino', N: 'No especificado' }[p.sexo]}</p>
          </div>
          <div>
            <p className="text-slate-500 uppercase tracking-wide text-xs mb-0.5">Nacionalidad</p>
            <p className="text-slate-300 capitalize">{p.nacionalidad}</p>
          </div>
          {p.refugio?.direccion && (
            <div>
              <p className="text-slate-500 uppercase tracking-wide text-xs mb-0.5">Dirección del refugio</p>
              <p className="text-slate-300">{p.refugio.direccion}</p>
            </div>
          )}
          {p.senas_fisicas && (
            <div className="col-span-2">
              <p className="text-slate-500 uppercase tracking-wide text-xs mb-0.5">Señas físicas</p>
              <p className="text-slate-300">{p.senas_fisicas}</p>
            </div>
          )}
          {p.necesidades_especiales && (
            <div className="col-span-2">
              <p className="text-slate-500 uppercase tracking-wide text-xs mb-0.5">Necesidades especiales</p>
              <p className="text-slate-300">{p.necesidades_especiales}</p>
            </div>
          )}
          {p.familiar_nombre && (
            <div className="col-span-2 pt-2 border-t border-slate-800/60">
              <p className="text-slate-500 uppercase tracking-wide text-xs mb-1">Familiar de contacto</p>
              <p className="text-slate-300 font-medium">{p.familiar_nombre}</p>
              {p.familiar_telefono && (
                <a
                  href={`tel:${p.familiar_telefono}`}
                  className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 mt-1 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone size={12} />
                  {p.familiar_telefono}
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
