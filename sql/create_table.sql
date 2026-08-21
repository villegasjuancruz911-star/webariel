-- =====================================================
-- SCRIPT SQL - Tabla cotizaciones
-- Supabase / PostgreSQL
-- Proyecto: Pintura Obrera e Industrial - Alto Valle
-- =====================================================

-- 1. Crear la tabla cotizaciones
CREATE TABLE IF NOT EXISTS public.cotizaciones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa         TEXT NOT NULL,
    cuit            TEXT NOT NULL,
    nombre_contacto TEXT NOT NULL,
    telefono        TEXT NOT NULL,
    tipo_obra       TEXT NOT NULL,
    ubicacion       TEXT NOT NULL,
    metros_cuadrados NUMERIC(12, 2),
    mensaje         TEXT,
    estado          TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_revision', 'cotizado', 'descartado')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_cotizaciones_created_at ON public.cotizaciones (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado ON public.cotizaciones (estado);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_cuit ON public.cotizaciones (cuit);

-- 3. Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.cotizaciones;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.cotizaciones
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;

-- 5. Política: Permitir inserción pública (anon) - solo INSERT
-- Esto permite que el formulario de la landing page envíe datos
-- sin autenticación de usuario.
CREATE POLICY "Permitir inserción pública de cotizaciones"
ON public.cotizaciones
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 6. Política: Solo usuarios autenticados (o service_role) pueden leer
-- Evita que cualquiera vea las cotizaciones de otras empresas
CREATE POLICY "Solo autenticados pueden leer cotizaciones"
ON public.cotizaciones
FOR SELECT
TO authenticated
USING (true);

-- 7. Política: Solo autenticados pueden actualizar (cambio de estado, etc.)
CREATE POLICY "Solo autenticados pueden actualizar cotizaciones"
ON public.cotizaciones
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 8. Comentarios de documentación
COMMENT ON TABLE public.cotizaciones IS 'Solicitudes de cotización corporativa desde la landing page de pintura industrial';
COMMENT ON COLUMN public.cotizaciones.empresa IS 'Razón social de la empresa solicitante';
COMMENT ON COLUMN public.cotizaciones.cuit IS 'CUIT de la empresa (formato libre, se valida en frontend)';
COMMENT ON COLUMN public.cotizaciones.tipo_obra IS 'Tipo de trabajo: epoxica, demarcacion, anticorrosivo, fachadas, otro';
COMMENT ON COLUMN public.cotizaciones.metros_cuadrados IS 'Superficie aproximada en m² (opcional)';
COMMENT ON COLUMN public.cotizaciones.estado IS 'Estado del lead: pendiente | en_revision | cotizado | descartado';

-- =====================================================
-- INSTRUCCIONES DE USO EN SUPABASE
-- =====================================================
-- 1. Ve a tu proyecto en https://supabase.com
-- 2. SQL Editor > New query
-- 3. Pega este script completo y ejecuta
-- 4. Verifica en Table Editor que la tabla existe
-- 5. En Authentication > Policies confirma que RLS está activo
-- =====================================================
