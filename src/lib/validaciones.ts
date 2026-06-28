// src/lib/validaciones.ts
// Esquemas Zod canónicos para validar todo input de usuario antes de persistir

import { z } from 'zod'

// --- Reporte ---
export const reporteSchema = z.object({
  tipo: z.enum(['rescate', 'suministro', 'via'] as const, {
    message: 'Selecciona el tipo de reporte',
  }),
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede superar 500 caracteres'),
  ubicacion_texto: z
    .string()
    .min(3, 'Ingresa una referencia de ubicación')
    .max(200),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  foto_url: z.string().url('URL de foto inválida').optional().or(z.literal('')),
  municipio: z.string().max(100).optional(),
  campo_extra: z.string().max(300).optional(),
})

export type ReporteInput = z.infer<typeof reporteSchema>

// --- Persona ---
export const personaSchema = z.object({
  nombre: z.string().min(2, 'Nombre requerido').max(100),
  apellido: z.string().min(2, 'Apellido requerido').max(100),
  ci: z
    .string()
    .regex(/^[VEve]-\d{7,8}$/, 'Formato válido: V-12345678 o E-12345678'),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  sexo: z.enum(['F', 'M', 'N'] as const),
  nacionalidad: z.enum(['venezolano', 'extranjero'] as const),
  refugio_id: z.string().uuid('Selecciona un refugio válido'),
  ultima_direccion: z.string().max(300).optional(),
  estado_salud: z.enum([
    'estable',
    'herido_leve',
    'herido_grave',
    'atencion_urgente',
  ] as const),
  puede_comunicarse: z.boolean(),
  senas_fisicas: z.string().max(300).optional(),
  necesidades_especiales: z.string().max(300).optional(),
  familiar_nombre: z.string().max(100).optional(),
  familiar_telefono: z
    .string()
    .regex(/^\+?[\d\s\-()]{7,20}$/, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
})

export type PersonaInput = z.infer<typeof personaSchema>

// --- Login de moderación ---
export const loginModeracionSchema = z.object({
  secret: z.string().min(1, 'Ingresa la clave de moderación'),
})

export type LoginModeracionInput = z.infer<typeof loginModeracionSchema>

// --- Moderación de reporte ---
export const moderarReporteSchema = z.object({
  estado: z.enum(['publicado', 'rechazado', 'sin_verificar'] as const),
  nota_moderacion: z.string().max(300).optional(),
  moderado_por: z.string().max(100).optional(),
})

export type ModerarReporteInput = z.infer<typeof moderarReporteSchema>
