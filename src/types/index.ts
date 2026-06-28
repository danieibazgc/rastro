// src/types/index.ts
// Tipos de dominio canónicos de Rastro

export type TipoReporte = 'rescate' | 'suministro' | 'via'

export type EstadoReporte =
  | 'pendiente'
  | 'publicado'
  | 'sin_verificar'
  | 'rechazado'
  | 'archivado'

export type EstadoSalud =
  | 'estable'
  | 'herido_leve'
  | 'herido_grave'
  | 'atencion_urgente'

export type Sexo = 'F' | 'M' | 'N'

export type Nacionalidad = 'venezolano' | 'extranjero'

export interface Reporte {
  id: string
  tipo: TipoReporte
  descripcion: string
  ubicacion_texto: string
  lat: number
  lng: number
  foto_url?: string | null
  estado: EstadoReporte
  upvotes: number
  campo_extra?: string | null
  municipio?: string | null
  moderado_por?: string | null
  nota_moderacion?: string | null
  created_at: string
  updated_at: string
}

export interface Refugio {
  id: string
  nombre: string
  direccion: string
  municipio: string
  lat: number
  lng: number
  capacidad?: number | null
  personas_count: number
  activo: boolean
}

export interface Persona {
  id: string
  nombre: string
  apellido: string
  ci: string
  fecha_nacimiento: string
  sexo: Sexo
  nacionalidad: Nacionalidad
  refugio_id: string
  refugio?: Refugio
  ultima_direccion?: string | null
  estado_salud: EstadoSalud
  puede_comunicarse: boolean
  senas_fisicas?: string | null
  necesidades_especiales?: string | null
  familiar_nombre?: string | null
  familiar_telefono?: string | null
  created_at: string
  updated_at: string
}
