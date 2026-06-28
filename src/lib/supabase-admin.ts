// src/lib/supabase-admin.ts
// Cliente Supabase de servidor con service role key.
// NUNCA importar en componentes de cliente ni prefijar con NEXT_PUBLIC_.
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Faltan variables de entorno de servidor: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
}

// Este cliente bypasea RLS — solo usar en Route Handlers del servidor
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
