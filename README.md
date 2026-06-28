# Rastro - Plataforma de Respuesta a Emergencias

Rastro es una plataforma de respuesta a emergencias post-terremoto, diseñada para facilitar la comunicación y logística en situaciones críticas. Está optimizada para ofrecer fricción mínima (no requiere registro para reportar) y garantizar un flujo de información verificada.

## 🎯 ¿Para qué sirve?

La aplicación está dividida en tres módulos principales:

1. **Mapa Colaborativo (`/mapa`):** Muestra reportes geolocalizados en tiempo real sobre necesidades de rescate, suministros y estado de vías.
2. **Buscador de Personas (`/personas`):** Permite registrar y buscar personas en refugios (por nombre o cédula de identidad), facilitando la reunificación familiar.
3. **Panel de Moderación (`/moderacion`):** Un área restringida donde los moderadores revisan, aprueban o rechazan los reportes ciudadanos antes de publicarlos en el mapa, evitando desinformación.

## 🛠️ Stack Tecnológico

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Base de Datos, Auth, Storage y Realtime:** [Supabase](https://supabase.com/)
- **Mapas:** [Leaflet](https://leafletjs.com/) + `react-leaflet` + OpenStreetMap
- **Formularios y Validación:** `react-hook-form` + `zod`
- **Búsqueda:** `fuse.js` (Búsqueda fuzzy)
- **Íconos:** `lucide-react`
- **Hosting y Cron Jobs:** [Vercel](https://vercel.com/)

## 🚀 Cómo se usa

### Configuración Local

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Configura las variables de entorno. Crea un archivo `.env.local` basado en el `.env.example`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   MODERACION_SECRET=
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Flujo Principal (Demo)

1. **Ciudadano:** Abre `/mapa` y puede ver reportes verificados. Desde `/reportar`, puede crear un reporte nuevo rápidamente sin iniciar sesión.
2. **Moderador:** Accede a `/moderacion` (usando el `MODERACION_SECRET`), visualiza el reporte pendiente y lo aprueba.
3. **Tiempo Real:** Una vez aprobado, el reporte aparece automáticamente en el mapa público sin necesidad de recargar la página.
4. **Búsqueda:** Cualquier usuario puede ir a `/personas` para buscar familiares en los refugios registrados.

## 👥 Equipo (Integrantes)

- **Daniel Ibañez** - Software Developer
- **Lizbeth Davile** - Ciencias de la Comunicación
- **Nikole Alvarado** - Ciencias de la Comunicación
- **Brenda Pineda** - Ingeniería Industrial
