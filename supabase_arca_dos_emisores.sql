-- Dos emisores: Sergio y Rodrigo, cada uno con su CUIT.
--
-- La primera versión asumía un emisor único (`arca_config` con CHECK id = 1).
-- Al momento de facturar hay que poder elegir cuál de los dos emite, así que
-- la configuración pasa a una fila por emisor y todo lo que numera o guarda
-- comprobantes cuelga de esa fila.
--
-- La numeración es por emisor y punto de venta: dos CUIT distintos llevan
-- series independientes ante ARCA, mezclarlas rompe la correlatividad.
--
-- Idempotente. Correr después de supabase_arca_facturacion_migration.sql.

-- ---------------------------------------------------------------------------
-- 1. Emisores
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.arca_emisores (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Coincide con `receiver` de client_services y payments, para poder
  -- proponer por defecto el emisor que cobró.
  clave             text UNIQUE NOT NULL CHECK (clave IN ('sergio','rodrigo')),
  cuit              bigint UNIQUE NOT NULL,
  razon_social      text NOT NULL,
  condicion_fiscal  text NOT NULL DEFAULT 'monotributo'
                    CHECK (condicion_fiscal IN ('monotributo','responsable_inscripto','exento')),
  pto_vta           integer NOT NULL DEFAULT 1,
  domicilio         text,
  -- Pie editable del comprobante: alias, CBU, condiciones de pago.
  pie_comprobante   text,
  entorno           text NOT NULL DEFAULT 'homologacion'
                    CHECK (entorno IN ('homologacion','produccion')),
  activo            boolean NOT NULL DEFAULT true,
  updated_at        timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Filas de arranque, sin CUIT real: se completan desde el panel.
INSERT INTO public.arca_emisores (clave, cuit, razon_social)
VALUES
  ('sergio',  0, 'Rodolfo Sergio Helguera'),
  ('rodrigo', 1, 'Rodrigo Zarza')
ON CONFLICT (clave) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. La numeración y los comprobantes cuelgan del emisor
-- ---------------------------------------------------------------------------
ALTER TABLE public.arca_contadores
  ADD COLUMN IF NOT EXISTS emisor_id uuid REFERENCES public.arca_emisores(id);

ALTER TABLE public.arca_comprobantes
  ADD COLUMN IF NOT EXISTS emisor_id uuid REFERENCES public.arca_emisores(id);

-- Serie independiente por emisor, punto de venta y tipo.
ALTER TABLE public.arca_contadores DROP CONSTRAINT IF EXISTS arca_contadores_pkey;
CREATE UNIQUE INDEX IF NOT EXISTS arca_contadores_serie_uk
  ON public.arca_contadores (emisor_id, pto_vta, cbte_tipo);

DROP INDEX IF EXISTS arca_comprobantes_entorno_pto_vta_cbte_tipo_numero_key;
ALTER TABLE public.arca_comprobantes
  DROP CONSTRAINT IF EXISTS arca_comprobantes_entorno_pto_vta_cbte_tipo_numero_key;
CREATE UNIQUE INDEX IF NOT EXISTS arca_comprobantes_serie_uk
  ON public.arca_comprobantes (emisor_id, entorno, pto_vta, cbte_tipo, numero);

-- ---------------------------------------------------------------------------
-- 3. Detalle editable del comprobante
-- ---------------------------------------------------------------------------
-- El administrador ajusta concepto e importes antes de emitir, así que el
-- detalle se guarda con el comprobante en vez de derivarse del cobro.
ALTER TABLE public.arca_comprobantes
  ADD COLUMN IF NOT EXISTS detalle jsonb,
  ADD COLUMN IF NOT EXISTS receptor_nombre text,
  ADD COLUMN IF NOT EXISTS receptor_domicilio text;

-- ---------------------------------------------------------------------------
-- 4. La reserva de número toma el emisor
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.arca_reservar_numero(integer, integer);

CREATE OR REPLACE FUNCTION public.arca_reservar_numero(
  p_emisor_id uuid,
  p_pto_vta integer,
  p_cbte_tipo integer
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE nuevo integer;
BEGIN
  INSERT INTO public.arca_contadores (emisor_id, pto_vta, cbte_tipo, ultimo_numero)
  VALUES (p_emisor_id, p_pto_vta, p_cbte_tipo, 0)
  ON CONFLICT (emisor_id, pto_vta, cbte_tipo) DO NOTHING;

  UPDATE public.arca_contadores
     SET ultimo_numero = ultimo_numero + 1
   WHERE emisor_id = p_emisor_id AND pto_vta = p_pto_vta AND cbte_tipo = p_cbte_tipo
   RETURNING ultimo_numero INTO nuevo;

  RETURN nuevo;
END $$;

-- ---------------------------------------------------------------------------
-- 5. arca_config queda obsoleta
-- ---------------------------------------------------------------------------
-- No se borra por si tiene datos cargados; queda marcada para no confundir.
COMMENT ON TABLE public.arca_config IS
  'OBSOLETA. Reemplazada por arca_emisores, que soporta más de un CUIT.';

-- ---------------------------------------------------------------------------
-- 6. RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.arca_emisores ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'arca_emisores' AND policyname = 'auth_all'
  ) THEN
    CREATE POLICY auth_all ON public.arca_emisores
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
