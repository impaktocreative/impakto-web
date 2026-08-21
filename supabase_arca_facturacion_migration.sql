-- SUPERSEDIDO por supabase_pendientes.sql.
-- Ninguna tabla arca_* llegó a existir en la base, así que migrar de un
-- emisor a dos no aplica: las tablas se crean directamente con los dos.
-- Este archivo queda solo como registro. No correrlo.
--
-- Facturación electrónica ARCA (ex AFIP) para el panel de Impakto.
--
-- Caso: un solo emisor, Rodolfo Sergio Helguera, monotributista, facturando
-- a sus propios clientes. No hay delegación ni multi tenant, así que la
-- configuración del emisor vive en una única fila igual que email_templates.
--
-- Idempotente: se puede correr más de una vez desde el editor SQL de Supabase.

-- ---------------------------------------------------------------------------
-- 1. Datos fiscales del receptor
-- ---------------------------------------------------------------------------
-- La condición del receptor frente al IVA es obligatoria en todo comprobante
-- desde la RG 5616. Por defecto 5 = consumidor final, que es lo que aplica a
-- una persona sin CUIT cargado.
--
-- `facturar` decide si el cliente entra en la emisión automática: no a todos
-- se les factura.

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS cuit text,
  ADD COLUMN IF NOT EXISTS razon_social text,
  ADD COLUMN IF NOT EXISTS cond_iva_receptor integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS facturar boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.clients.cond_iva_receptor IS
  'Código de FEParamGetCondicionIvaReceptor. 1 RI, 4 exento, 5 consumidor final, 6 monotributo.';
COMMENT ON COLUMN public.clients.facturar IS
  'Solo los clientes marcados disparan emisión automática al registrar un cobro.';

-- ---------------------------------------------------------------------------
-- 2. Configuración del emisor
-- ---------------------------------------------------------------------------
-- Fila única. El certificado y la clave privada NO viven acá: van en
-- variables de entorno en base64, porque la base se respalda y se replica.

CREATE TABLE IF NOT EXISTS public.arca_config (
  id                integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  cuit              bigint NOT NULL,
  razon_social      text NOT NULL,
  condicion_fiscal  text NOT NULL DEFAULT 'monotributo'
                    CHECK (condicion_fiscal IN ('monotributo','responsable_inscripto','exento')),
  pto_vta           integer NOT NULL,
  domicilio         text,
  entorno           text NOT NULL DEFAULT 'homologacion'
                    CHECK (entorno IN ('homologacion','produccion')),
  -- Interruptor de la emisión automática al registrar un cobro.
  auto_facturar     boolean NOT NULL DEFAULT false,
  updated_at        timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ---------------------------------------------------------------------------
-- 3. Cache del ticket de acceso de WSAA
-- ---------------------------------------------------------------------------
-- ARCA entrega un ticket por certificado y servicio cada 12 horas. Si dos
-- instancias lo piden a la vez, la segunda recibe coe.alreadyAuthenticated y
-- queda sin poder facturar hasta que venza el primero. Por eso el cache va en
-- Postgres con advisory lock y nunca en memoria.

CREATE TABLE IF NOT EXISTS public.arca_ta_cache (
  clave       text PRIMARY KEY,
  token       text NOT NULL,
  sign        text NOT NULL,
  expira      timestamp with time zone NOT NULL,
  actualizado timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ---------------------------------------------------------------------------
-- 4. Contador correlativo
-- ---------------------------------------------------------------------------
-- El número sale de acá, no de ARCA: dos requests simultáneos que consultan
-- FECompUltimoAutorizado obtienen el mismo valor. Se inicializa una sola vez
-- con lo que devuelve ARCA y después vive en la base.

CREATE TABLE IF NOT EXISTS public.arca_contadores (
  pto_vta        integer NOT NULL,
  cbte_tipo      integer NOT NULL,
  ultimo_numero  integer NOT NULL DEFAULT 0,
  PRIMARY KEY (pto_vta, cbte_tipo)
);

-- ---------------------------------------------------------------------------
-- 5. Comprobantes emitidos
-- ---------------------------------------------------------------------------
-- Traza completa. No se borra nunca: la normativa exige conservarlos, y ante
-- una discusión con un cliente el request y la respuesta son la única
-- evidencia de qué se envió. Un comprobante se corrige con nota de crédito.

CREATE TABLE IF NOT EXISTS public.arca_comprobantes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id        uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  client_id         uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  pto_vta           integer NOT NULL,
  cbte_tipo         integer NOT NULL,
  numero            integer NOT NULL,
  estado            text NOT NULL
                    CHECK (estado IN ('pendiente','autorizado','rechazado','anulado')),
  entorno           text NOT NULL DEFAULT 'homologacion',
  doc_tipo          integer NOT NULL,
  doc_nro           bigint NOT NULL,
  cond_iva_receptor integer NOT NULL,
  concepto          integer NOT NULL DEFAULT 2,
  importe_total     numeric(15,2) NOT NULL,
  importe_neto      numeric(15,2) NOT NULL,
  moneda            text NOT NULL DEFAULT 'PES',
  cotizacion        numeric(15,6) NOT NULL DEFAULT 1,
  cae               text,
  cae_vto           date,
  observaciones     jsonb,
  request_xml       text,
  response_json     jsonb,
  created_at        timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at        timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (entorno, pto_vta, cbte_tipo, numero)
);

-- Red de seguridad contra la doble facturación de un mismo cobro. Si el lock
-- falla por lo que sea, la base rechaza el duplicado antes de llegar a ARCA.
CREATE UNIQUE INDEX IF NOT EXISTS arca_comprobantes_payment_uk
  ON public.arca_comprobantes (payment_id)
  WHERE payment_id IS NOT NULL AND estado IN ('pendiente','autorizado');

CREATE INDEX IF NOT EXISTS arca_comprobantes_pendientes_idx
  ON public.arca_comprobantes (created_at)
  WHERE estado = 'pendiente';

-- ---------------------------------------------------------------------------
-- 6. RLS
-- ---------------------------------------------------------------------------
-- Mismo criterio que el resto del panel: solo usuarios autenticados. El cron
-- entra con la service role key, que salta RLS por diseño.

ALTER TABLE public.arca_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arca_ta_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arca_contadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arca_comprobantes ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['arca_config','arca_ta_cache','arca_contadores','arca_comprobantes']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t AND policyname = 'auth_all'
    ) THEN
      EXECUTE format(
        'CREATE POLICY auth_all ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 7. Reserva de número con lock de fila
-- ---------------------------------------------------------------------------
-- `update ... returning` toma el lock de fila solo: dos transacciones
-- concurrentes se serializan y cada una recibe un número distinto. No hace
-- falta un select for update explícito.

CREATE OR REPLACE FUNCTION public.arca_reservar_numero(p_pto_vta integer, p_cbte_tipo integer)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE nuevo integer;
BEGIN
  INSERT INTO public.arca_contadores (pto_vta, cbte_tipo, ultimo_numero)
  VALUES (p_pto_vta, p_cbte_tipo, 0)
  ON CONFLICT (pto_vta, cbte_tipo) DO NOTHING;

  UPDATE public.arca_contadores
     SET ultimo_numero = ultimo_numero + 1
   WHERE pto_vta = p_pto_vta AND cbte_tipo = p_cbte_tipo
   RETURNING ultimo_numero INTO nuevo;

  RETURN nuevo;
END $$;
