-- supabase/schema.sql
-- Esquema canónico de Rastro — ejecutar en Supabase SQL Editor
-- Incluye tablas, triggers, función de upvote, RLS y seed de datos

-- =============================================
-- EXTENSIONES
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: refugios
-- =============================================
CREATE TABLE IF NOT EXISTS refugios (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre        TEXT NOT NULL,
  direccion     TEXT NOT NULL,
  municipio     TEXT NOT NULL,
  lat           DOUBLE PRECISION NOT NULL,
  lng           DOUBLE PRECISION NOT NULL,
  capacidad     INTEGER,
  personas_count INTEGER NOT NULL DEFAULT 0,
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLA: reportes
-- =============================================
CREATE TABLE IF NOT EXISTS reportes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo             TEXT NOT NULL CHECK (tipo IN ('rescate', 'suministro', 'via')),
  descripcion      TEXT NOT NULL,
  ubicacion_texto  TEXT NOT NULL,
  lat              DOUBLE PRECISION NOT NULL,
  lng              DOUBLE PRECISION NOT NULL,
  foto_url         TEXT,
  estado           TEXT NOT NULL DEFAULT 'pendiente'
                     CHECK (estado IN ('pendiente', 'publicado', 'sin_verificar', 'rechazado', 'archivado')),
  upvotes          INTEGER NOT NULL DEFAULT 0,
  campo_extra      TEXT,
  municipio        TEXT,
  moderado_por     TEXT,
  nota_moderacion  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reportes_updated_at ON reportes;
CREATE TRIGGER reportes_updated_at
  BEFORE UPDATE ON reportes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================
-- TABLA: personas
-- =============================================
CREATE TABLE IF NOT EXISTS personas (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre                TEXT NOT NULL,
  apellido              TEXT NOT NULL,
  ci                    TEXT NOT NULL,
  fecha_nacimiento      DATE NOT NULL,
  sexo                  TEXT NOT NULL CHECK (sexo IN ('F', 'M', 'N')),
  nacionalidad          TEXT NOT NULL CHECK (nacionalidad IN ('venezolano', 'extranjero')),
  refugio_id            UUID NOT NULL REFERENCES refugios(id),
  ultima_direccion      TEXT,
  estado_salud          TEXT NOT NULL DEFAULT 'estable'
                          CHECK (estado_salud IN ('estable', 'herido_leve', 'herido_grave', 'atencion_urgente')),
  puede_comunicarse     BOOLEAN NOT NULL DEFAULT TRUE,
  senas_fisicas         TEXT,
  necesidades_especiales TEXT,
  familiar_nombre       TEXT,
  familiar_telefono     TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsqueda por cédula
CREATE INDEX IF NOT EXISTS personas_ci_idx ON personas(ci);
-- Índice para búsqueda por nombre+apellido
CREATE INDEX IF NOT EXISTS personas_nombre_idx ON personas(nombre, apellido);

-- Trigger updated_at para personas
DROP TRIGGER IF EXISTS personas_updated_at ON personas;
CREATE TRIGGER personas_updated_at
  BEFORE UPDATE ON personas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================
-- FUNCIÓN: incrementar upvote atómicamente
-- =============================================
CREATE OR REPLACE FUNCTION incrementar_upvote(reporte_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE reportes
  SET upvotes = upvotes + 1
  WHERE id = reporte_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE reportes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE refugios    ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas    ENABLE ROW LEVEL SECURITY;

-- --- REPORTES ---
-- Lectura pública solo de estados visibles
DROP POLICY IF EXISTS "reportes_select_publico" ON reportes;
CREATE POLICY "reportes_select_publico" ON reportes
  FOR SELECT
  TO anon, authenticated
  USING (estado IN ('publicado', 'sin_verificar'));

-- INSERT público forzado a estado=pendiente
DROP POLICY IF EXISTS "reportes_insert_publico" ON reportes;
CREATE POLICY "reportes_insert_publico" ON reportes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (estado = 'pendiente');

-- Sin policies UPDATE/DELETE para anon (solo service role puede cambiar estado)

-- --- REFUGIOS ---
-- Solo lectura pública de refugios activos
DROP POLICY IF EXISTS "refugios_select_publico" ON refugios;
CREATE POLICY "refugios_select_publico" ON refugios
  FOR SELECT
  TO anon, authenticated
  USING (activo = TRUE);

-- --- PERSONAS ---
-- SELECT e INSERT abiertos (no hay datos sensibles críticos)
DROP POLICY IF EXISTS "personas_select_publico" ON personas;
CREATE POLICY "personas_select_publico" ON personas
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "personas_insert_publico" ON personas;
CREATE POLICY "personas_insert_publico" ON personas
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- =============================================
-- SEED: Refugios
-- =============================================
INSERT INTO refugios (id, nombre, direccion, municipio, lat, lng, capacidad, personas_count) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Escuela Básica Simón Bolívar', 'Av. Principal, Los Cortijos', 'Sucre', 10.4806, -66.9036, 200, 0),
  ('22222222-2222-2222-2222-222222222222', 'Polideportivo Municipal Chacao', 'Calle La Paz, Chacao', 'Chacao', 10.4931, -66.8499, 350, 0),
  ('33333333-3333-3333-3333-333333333333', 'Centro Comunal El Paraíso', 'Urb. El Paraíso, Bloque 4', 'Libertador', 10.4697, -66.9352, 150, 0)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SEED: Reportes (5-6 publicados para el demo)
-- =============================================
INSERT INTO reportes (tipo, descripcion, ubicacion_texto, lat, lng, estado, municipio, upvotes) VALUES
  ('rescate', 'Familia atrapada en edificio dañado. Escombros en planta baja bloqueando salida. Se escuchan voces.', 'Av. Francisco de Miranda, frente al CC Sambil', 10.4966, -66.8520, 'publicado', 'Chacao', 5),
  ('rescate', 'Adulto mayor con herida en pierna, no puede caminar. Requiere transporte médico urgente.', 'Urb. Colinas de Bello Monte, Calle 12, casa #45', 10.4712, -66.8798, 'publicado', 'Baruta', 3),
  ('suministro', 'Punto de distribución de agua potable. Camión cisterna IMAS. Capacidad para unas 300 personas.', 'Plaza Altamira, adyacente a la estatua central', 10.4944, -66.8523, 'publicado', 'Chacao', 8),
  ('suministro', 'Comedor comunitario improvisado. Sirven almuerzo de 12 a 3pm. Buscan voluntarios para la tarde.', 'Parroquia La Vega, Sector El Cementerio', 10.4570, -66.9480, 'publicado', 'Libertador', 2),
  ('via', 'Derrumbe en calzada derecha. Vía completamente bloqueada en ambos sentidos. Desviarse por Av. Sucre.', 'Autopista Francisco Fajardo, altura de la salida Los Ruices', 10.5000, -66.8700, 'publicado', 'Sucre', 4),
  ('via', 'Puente con grietas visibles. Autoridades colocaron conos pero sigue parcialmente transitable.', 'Av. Boyacá (Cota Mil), entre Los Palos Grandes y Altamira', 10.5066, -66.8603, 'sin_verificar', 'Chacao', 1)
ON CONFLICT DO NOTHING;

-- =============================================
-- SEED: Personas (~10 personas en refugios)
-- =============================================
INSERT INTO personas (nombre, apellido, ci, fecha_nacimiento, sexo, nacionalidad, refugio_id, estado_salud, puede_comunicarse, familiar_nombre, familiar_telefono) VALUES
  ('María', 'González', 'V-12345678', '1985-03-15', 'F', 'venezolano', '11111111-1111-1111-1111-111111111111', 'estable', TRUE, 'Carlos González', '+58 412-1234567'),
  ('José', 'Rodríguez', 'V-87654321', '1978-07-22', 'M', 'venezolano', '11111111-1111-1111-1111-111111111111', 'herido_leve', TRUE, 'Ana Rodríguez', '+58 414-7654321'),
  ('Carmen', 'Pérez', 'V-11223344', '1945-11-30', 'F', 'venezolano', '22222222-2222-2222-2222-222222222222', 'estable', FALSE, 'Pedro Pérez', '+58 416-1122334'),
  ('Luis', 'Martínez', 'V-55667788', '1990-01-08', 'M', 'venezolano', '22222222-2222-2222-2222-222222222222', 'herido_grave', TRUE, NULL, NULL),
  ('Sofía', 'Hernández', 'E-99887766', '1995-06-18', 'F', 'extranjero', '22222222-2222-2222-2222-222222222222', 'estable', TRUE, 'Roberto Hernández', '+58 424-9988776'),
  ('Miguel', 'López', 'V-33445566', '1962-09-05', 'M', 'venezolano', '33333333-3333-3333-3333-333333333333', 'atencion_urgente', FALSE, 'Isabel López', '+58 412-3344556'),
  ('Valentina', 'Torres', 'V-22334455', '2001-12-25', 'F', 'venezolano', '33333333-3333-3333-3333-333333333333', 'estable', TRUE, 'Ramón Torres', '+58 414-2233445'),
  ('Andrés', 'Ramírez', 'V-44556677', '1988-04-14', 'M', 'venezolano', '11111111-1111-1111-1111-111111111111', 'herido_leve', TRUE, 'Lucía Ramírez', '+58 416-4455667'),
  ('Isabella', 'Flores', 'V-66778899', '1975-08-30', 'F', 'venezolano', '22222222-2222-2222-2222-222222222222', 'estable', TRUE, NULL, NULL),
  ('Daniel', 'Vargas', 'V-77889900', '2003-02-17', 'M', 'venezolano', '33333333-3333-3333-3333-333333333333', 'estable', TRUE, 'Marina Vargas', '+58 424-7788990')
ON CONFLICT DO NOTHING;

-- Actualizar contadores de personas por refugio
UPDATE refugios SET personas_count = (
  SELECT COUNT(*) FROM personas WHERE personas.refugio_id = refugios.id
);
