// src/lib/utils.ts
// Utilidades generales del proyecto

import { type ClassValue } from 'clsx'
import { TipoReporte, EstadoSalud } from '@/types'

// Combinar clases de Tailwind (sin necesidad de twMerge para este MVP)
export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ')
    .trim()
}

// Etiquetas legibles para tipo de reporte
export const TIPO_LABELS: Record<TipoReporte, string> = {
  rescate: '🆘 Rescate',
  suministro: '📦 Suministro',
  via: '🚧 Vía',
}

// Colores Tailwind por tipo
export const TIPO_COLORS: Record<TipoReporte, string> = {
  rescate: 'bg-rescate/20 text-rescate border-rescate/30',
  suministro: 'bg-suministro/20 text-suministro border-suministro/30',
  via: 'bg-via/20 text-via border-via/30',
}

// Colores hex de marcadores en el mapa
export const TIPO_HEX: Record<TipoReporte, string> = {
  rescate: '#EF4444',
  suministro: '#22C55E',
  via: '#F59E0B',
}

// Etiquetas de estado de salud
export const SALUD_LABELS: Record<EstadoSalud, string> = {
  estable: 'Estable',
  herido_leve: 'Herido leve',
  herido_grave: 'Herido grave',
  atencion_urgente: '⚠️ Atención urgente',
}

// Colores de badge de salud
export const SALUD_COLORS: Record<EstadoSalud, string> = {
  estable: 'bg-suministro/20 text-suministro',
  herido_leve: 'bg-via/20 text-via',
  herido_grave: 'bg-rescate/20 text-rescate',
  atencion_urgente: 'bg-rescate text-white animate-pulse-slow',
}

// Formato de fecha
export function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
