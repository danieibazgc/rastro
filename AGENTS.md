# AGENTS.md — Rastro

Reglas de ingeniería persistentes para este proyecto. **Léelas completas antes de planificar o escribir código.**

## 0. Fuentes de verdad

- **`DESIGN.md`** → fuente de verdad de **producto, UX y diseño visual** (qué construimos, cómo se ve, copy, flujos). Léelo **siempre** al inicio de cada sesión.
- **`AGENTS.md`** (este archivo) → fuente de verdad de **stack, arquitectura, seguridad y convenciones**. Manda en lo técnico.
- Si `DESIGN.md` y este archivo entran en conflicto en algo técnico, **gana este archivo**. Si el conflicto es de producto/UX, gana `DESIGN.md`. Ante duda real, **pregunta antes de asumir**.

## 1. Qué es Rastro

Plataforma de respuesta a emergencias post-terremoto con tres módulos:

1. **Mapa colaborativo** — reportes geolocalizados (rescate / suministro / vía) en tiempo real.
2. **Buscador de personas** — registro y búsqueda de personas en refugios (por nombre o cédula).
3. **Panel de moderación** — aprobar/rechazar reportes antes de publicarlos.

Contexto: es un **MVP de hackathon con 1 día de plazo**. Optimiza para **enviar un flujo vertical funcional**, no para perfección. Publicar con advertencia > silencio.

Principios: offline-friendly, fricción mínima (ningún flujo crítico exige login), degradación elegante (si el mapa falla, los listados de texto siguen sirviendo).

## 2. Stack (BLOQUEADO — no proponer alternativas)

| Capa | Tecnología |
|---|---|
| Framework | **Next.js 14, App Router, `src/`** |
| Lenguaje | **TypeScript estricto** |
| Estilos | **Tailwind CSS** |
| Datos / Auth / Storage / Realtime | **Supabase** |
| Mapa | **Leaflet + `react-leaflet` + tiles de OpenStreetMap** |
| Hosting + Cron | **Vercel** |
| Formularios | `react-hook-form` + `zod` |
| Búsqueda fuzzy | `fuse.js` |
| Íconos | `lucide-react` |

## 3. Restricciones duras (NO violar)

- **Todo debe operar en tiers gratuitos.** Prohibido introducir cualquier servicio de pago o que exija tarjeta. Si una tarea parece necesitar algo de pago, **detente y pregunta**.
- **Mapa: NO usar Mapbox ni ningún proveedor con token/billing.** Solo Leaflet + OSM. Para subir volumen en el futuro se cambiará la URL del `TileLayer`, no la librería.
- **No inventes valores de entorno, claves ni URLs.** Usa los nombres de variables de la sección 6 y deja placeholders. Nunca hardcodees secretos en el código.
- **`SUPABASE_SERVICE_ROLE_KEY` es solo de servidor.** Jamás importarla en componentes de cliente ni prefijarla con `NEXT_PUBLIC_`.
- **No ejecutes acciones destructivas** (borrar tablas, `DROP`, `rm -rf`, reset de migraciones) sin confirmación explícita.

## 4. Arquitectura y reglas de código

- **App Router** con `src/app`. Páginas de datos públicas pueden ser Server Components; lo interactivo (mapa, formularios, búsqueda) son Client Components (`'use client'`).
- **Mutaciones vía Route Handlers** en `src/app/api/**`. El cliente nunca escribe estados sensibles directo; pasa por una API route que valida con `zod`.
- **Leaflet toca `window`** → el componente del mapa se importa con `next/dynamic` y `{ ssr: false }` mediante un wrapper `MapaLoader`. Las páginas importan `MapaLoader`, nunca el componente Leaflet directo. (Esto evita el clásico `window is not defined`.)
- **Realtime de Supabase** para el mapa: suscríbete a cambios de la tabla `reportes` en lugar de hacer polling. Al aprobar un reporte, el pin debe aparecer sin recargar.
- **TypeScript estricto**: nada de `any` salvo en límites inevitables y comentado. Define tipos en `src/types`.
- **Validación**: todo input de usuario pasa por un esquema `zod` antes de persistir.
- **Idioma**: el dominio se nombra en español (`reportes`, `personas`, `refugios`, `estado`, `municipio`); mantén consistencia con lo ya escrito.
- **Tailwind**: usa los tokens de color definidos en `tailwind.config.ts` (`rescate`, `suministro`, `via`, `verificado`). No metas hex sueltos en JSX salvo casos puntuales.
- **Un feature por archivo/carpeta.** No engordar `page.tsx` con lógica que debería estar en `components/` o `lib/`.

## 5. Estructura objetivo

```
src/
  app/
    page.tsx                 # redirect a /mapa
    mapa/page.tsx
    reportar/page.tsx
    personas/page.tsx
    personas/registrar/page.tsx
    moderacion/page.tsx
    moderacion/login/page.tsx
    api/
      reportes/route.ts                 # GET lista / POST crear
      reportes/[id]/upvote/route.ts
      personas/route.ts
      upload/route.ts                   # foto -> Supabase Storage
      moderacion/[id]/route.ts          # PATCH estado (service role)
      cron/archivar/route.ts            # Vercel Cron
  components/{mapa,reportes,personas,moderacion,ui}/
  hooks/{useReportes,usePersonas,useGeolocalizacion}.ts
  lib/{supabase,supabase-admin,validaciones,utils}.ts
  types/index.ts
supabase/schema.sql          # esquema + RLS + funciones (materializar aqui)
vercel.json                  # cron
```

## 6. Variables de entorno (`.env.local`)

Crea `.env.local` y un `.env.example` con estos nombres y **placeholders** (sin valores reales):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # solo servidor
MODERACION_SECRET=
```

## 7. Modelo de datos (canónico)

Materializa el esquema en `supabase/schema.sql`. Tablas y reglas clave:

- **`reportes`**: `id uuid pk`, `tipo` en {rescate, suministro, via}, `descripcion`, `ubicacion_texto`, `lat`, `lng`, `foto_url?`, `estado` en {pendiente, publicado, sin_verificar, rechazado, archivado} (default `pendiente`), `upvotes int default 0`, `campo_extra?`, `municipio?`, `moderado_por?`, `nota_moderacion?`, `created_at`, `updated_at` (trigger que la actualiza).
- **`refugios`**: `id uuid pk`, `nombre`, `direccion`, `municipio`, `lat`, `lng`, `capacidad?`, `personas_count int default 0`, `activo bool default true`.
- **`personas`**: `id uuid pk`, `nombre`, `apellido`, `ci` (índice; formato `V-12345678`), `fecha_nacimiento`, `sexo` en {F,M,N}, `nacionalidad` en {venezolano, extranjero}, `refugio_id -> refugios`, `ultima_direccion?`, `estado_salud` en {estable, herido_leve, herido_grave, atencion_urgente}, `puede_comunicarse bool`, `senas_fisicas?`, `necesidades_especiales?`, `familiar_nombre?`, `familiar_telefono?`, `created_at`, `updated_at`.

Incluye una función SQL `incrementar_upvote(reporte_id uuid)` para incremento atómico.

## 8. Seguridad (RLS)

Activa **Row Level Security** en las tres tablas:

- `reportes`: SELECT público solo de `publicado`/`sin_verificar`; INSERT público forzado a `estado = 'pendiente'`; **sin** policies de UPDATE/DELETE para `anon` (los cambios de estado solo ocurren vía service role en `api/moderacion`).
- `personas`: SELECT e INSERT abiertos (es el objetivo del módulo).
- `refugios`: SELECT público.

Moderación: el panel y sus API routes validan `MODERACION_SECRET` (cookie `mod_token`) en **cada** request del lado servidor. Rate-limit del upvote por cookie de dispositivo. Sanitiza/valida texto con `zod` antes de persistir.

## 9. Definición de "hecho" (por feature)

Un módulo está listo cuando: (a) compila sin errores de TypeScript, (b) el flujo funciona de punta a punta en local, (c) los estados de error y vacío están manejados (loading, "no encontrado", fallo de geolocalización), (d) no rompe los otros módulos. Para el cierre, el **flujo de demo** de la sección 10 debe correr sin tocar nada raro.

## 10. Flujo de demo (criterio de aceptación final)

1. Abrir `/mapa` -> se ven pines de reportes verificados.
2. Desde "celular" un ciudadano crea un reporte en `/reportar`.
3. El moderador en `/moderacion` lo aprueba en segundos.
4. El pin aparece en el mapa **en tiempo real** (sin recargar).
5. Un familiar busca un nombre en `/personas` y lo encuentra en un refugio.

Debe poder demostrarse con **dos pestañas abiertas** (ciudadano + moderador) mostrando el realtime.

## 11. Cómo trabajar (acuerdo con el agente)

- **Planifica primero**: produce un plan y un checklist de tareas antes de codear; pide aprobación del plan.
- **Construye en slices verticales** en este orden: setup -> mapa (lectura) -> crear reporte -> buscar personas -> registrar persona -> moderación + RLS -> fotos + geolocalización -> realtime/upvotes -> pulido. No empieces el slice N+1 hasta que el N corra.
- **Atajos válidos del hackathon** (úsalos si el tiempo aprieta): empezar sin RLS y activarla en el slice de moderación; fotos primero por URL externa y luego Storage; seed de 5-6 reportes y ~10 personas para que el demo no se vea vacío; auto-archivado manual si el cron se complica.
- **Verifica con el agente de navegador** el flujo de la sección 10 antes de declarar terminado.
- Cuando termines un slice, **resume en 2-3 líneas** qué quedó y qué sigue.
- No reintroduzcas tecnologías eliminadas (PocketBase, Fly.io, Cloudinary, Mapbox, Upstash).
