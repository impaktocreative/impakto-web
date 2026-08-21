-- =============================================================================
-- PENDIENTES — correr todo junto en el editor SQL de Supabase.
--
-- Estado real de la base al momento de escribir esto, verificado contra el
-- proyecto y no contra los archivos:
--
--   ya aplicado   supabase_esquema_real.sql (columnas)
--   FALTA         supabase_arca_facturacion_migration.sql — entera, ninguna
--                 tabla arca_* existe
--   FALTA         supabase_app_settings_migration.sql
--   FALTA         supabase_ingreso_manual_migration.sql
--
-- Por eso este archivo no migra el esquema de ARCA de un emisor a dos: crea
-- las tablas directamente con los dos emisores, que es lo que hace falta.
-- `arca_config` no se crea nunca — nació obsoleta.
--
-- Todo es idempotente: correrlo dos veces no rompe ni duplica nada.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Ajustes de la app y cotización del dólar por mes
-- -----------------------------------------------------------------------------
-- La cotización vivía en estado del cliente y volvía a 1400 en cada carga.
-- Ahora cada mes guarda la suya, y un mes sin cargar hereda la anterior.

CREATE TABLE IF NOT EXISTS public.app_settings (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.usd_rates (
  month      text PRIMARY KEY CHECK (month ~ '^[0-9]{4}-[0-9]{2}$'),
  rate       numeric(15,4) NOT NULL CHECK (rate > 0),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Respaldo para los meses anteriores a cualquier carga.
INSERT INTO public.app_settings (key, value)
VALUES ('usd_rate_fallback', '1400')
ON CONFLICT (key) DO NOTHING;


-- -----------------------------------------------------------------------------
-- 2. Ingresos manuales, sin cliente ni servicio
-- -----------------------------------------------------------------------------
-- `payments.client_service_id` ya acepta null, así que un ingreso suelto entra
-- al balance como cualquier otro cobro. Falta solo el texto que explique de
-- qué se trata, porque sin servicio asociado no hay nombre que mostrar.

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS description text;

COMMENT ON COLUMN public.payments.description IS
  'Concepto del ingreso. Se usa cuando client_service_id es null: un cobro suelto que no corresponde a un servicio contratado.';

CREATE INDEX IF NOT EXISTS payments_manuales_idx
  ON public.payments (payment_date DESC)
  WHERE client_service_id IS NULL;


-- -----------------------------------------------------------------------------
-- 3. Datos fiscales del receptor
-- -----------------------------------------------------------------------------
-- La condición del receptor frente al IVA es obligatoria en todo comprobante
-- desde la RG 5616. Por defecto 5 = consumidor final.
--
-- `facturar` decide si el cliente entra en la emisión: no a todos se les
-- factura, así que arranca en false y se marca uno por uno.

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS cuit text,
  ADD COLUMN IF NOT EXISTS razon_social text,
  ADD COLUMN IF NOT EXISTS cond_iva_receptor integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS facturar boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.clients.cond_iva_receptor IS
  'Código de FEParamGetCondicionIvaReceptor. 1 RI, 4 exento, 5 consumidor final, 6 monotributo.';
COMMENT ON COLUMN public.clients.facturar IS
  'Solo los clientes marcados disparan emisión al registrar un cobro.';


-- -----------------------------------------------------------------------------
-- 4. Emisores: Sergio y Rodrigo, cada uno con su CUIT
-- -----------------------------------------------------------------------------
-- El certificado y la clave privada NO viven acá: van en variables de entorno
-- en base64, porque la base se respalda y se replica.

CREATE TABLE IF NOT EXISTS public.arca_emisores (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Coincide con `receiver` de client_services y payments, para proponer por
  -- defecto el emisor que cobró.
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
  -- Interruptor de la emisión automática al registrar un cobro.
  auto_facturar     boolean NOT NULL DEFAULT false,
  activo            boolean NOT NULL DEFAULT true,
  updated_at        timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Filas de arranque con CUIT placeholder: se completan desde el panel. El
-- placeholder es negativo para que no colisione con un CUIT real ni pase por
-- válido si alguien se olvida de cargarlo.
INSERT INTO public.arca_emisores (clave, cuit, razon_social)
VALUES
  ('sergio',  -1, 'Rodolfo Sergio Helguera'),
  ('rodrigo', -2, 'Rodrigo Zarza')
ON CONFLICT (clave) DO NOTHING;


-- -----------------------------------------------------------------------------
-- 5. Cache del ticket de acceso de WSAA
-- -----------------------------------------------------------------------------
-- ARCA entrega un ticket por certificado y servicio cada 12 horas. Si dos
-- instancias lo piden a la vez, la segunda recibe coe.alreadyAuthenticated y
-- queda sin poder facturar hasta que venza el primero. Por eso el cache va en
-- Postgres con advisory lock y nunca en memoria.
--
-- La clave incluye el emisor: son dos certificados distintos.

CREATE TABLE IF NOT EXISTS public.arca_ta_cache (
  clave       text PRIMARY KEY,
  token       text NOT NULL,
  sign        text NOT NULL,
  expira      timestamp with time zone NOT NULL,
  actualizado timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);


-- -----------------------------------------------------------------------------
-- 6. Contador correlativo, por emisor
-- -----------------------------------------------------------------------------
-- El número sale de acá, no de ARCA: dos requests simultáneos que consultan
-- FECompUltimoAutorizado obtienen el mismo valor. Se inicializa una sola vez
-- con lo que devuelve ARCA y después vive en la base.
--
-- La serie es por emisor, punto de venta y tipo: dos CUIT llevan numeraciones
-- independientes ante ARCA y mezclarlas rompe la correlatividad.

CREATE TABLE IF NOT EXISTS public.arca_contadores (
  emisor_id      uuid NOT NULL REFERENCES public.arca_emisores(id) ON DELETE RESTRICT,
  pto_vta        integer NOT NULL,
  cbte_tipo      integer NOT NULL,
  ultimo_numero  integer NOT NULL DEFAULT 0,
  PRIMARY KEY (emisor_id, pto_vta, cbte_tipo)
);


-- -----------------------------------------------------------------------------
-- 7. Comprobantes emitidos
-- -----------------------------------------------------------------------------
-- Traza completa. No se borra nunca: la normativa exige conservarlos, y ante
-- una discusión con un cliente el request y la respuesta son la única
-- evidencia de qué se envió. Un comprobante se corrige con nota de crédito.
--
-- El detalle y el receptor se guardan con el comprobante en vez de derivarse
-- del cobro, porque el administrador los ajusta antes de emitir y el PDF debe
-- reflejar lo que se emitió, no lo que dice el servicio hoy.

CREATE TABLE IF NOT EXISTS public.arca_comprobantes (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emisor_id          uuid NOT NULL REFERENCES public.arca_emisores(id) ON DELETE RESTRICT,
  payment_id         uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  client_id          uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  pto_vta            integer NOT NULL,
  cbte_tipo          integer NOT NULL,
  numero             integer NOT NULL,
  estado             text NOT NULL
                     CHECK (estado IN ('pendiente','autorizado','rechazado','anulado')),
  entorno            text NOT NULL DEFAULT 'homologacion',
  doc_tipo           integer NOT NULL,
  doc_nro            bigint NOT NULL,
  cond_iva_receptor  integer NOT NULL,
  receptor_nombre    text,
  receptor_domicilio text,
  concepto           integer NOT NULL DEFAULT 2,
  detalle            jsonb,
  importe_total      numeric(15,2) NOT NULL,
  importe_neto       numeric(15,2) NOT NULL,
  moneda             text NOT NULL DEFAULT 'PES',
  cotizacion         numeric(15,6) NOT NULL DEFAULT 1,
  cae                text,
  cae_vto            date,
  observaciones      jsonb,
  request_xml        text,
  response_json      jsonb,
  created_at         timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at         timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (emisor_id, entorno, pto_vta, cbte_tipo, numero)
);

-- Red de seguridad contra la doble facturación de un mismo cobro. Si el lock
-- falla por lo que sea, la base rechaza el duplicado antes de llegar a ARCA.
CREATE UNIQUE INDEX IF NOT EXISTS arca_comprobantes_payment_uk
  ON public.arca_comprobantes (payment_id)
  WHERE payment_id IS NOT NULL AND estado IN ('pendiente','autorizado');

CREATE INDEX IF NOT EXISTS arca_comprobantes_pendientes_idx
  ON public.arca_comprobantes (created_at)
  WHERE estado = 'pendiente';


-- -----------------------------------------------------------------------------
-- 8. Reserva de número con lock de fila
-- -----------------------------------------------------------------------------
-- `update ... returning` toma el lock de fila solo: dos transacciones
-- concurrentes se serializan y cada una recibe un número distinto. No hace
-- falta un select for update explícito.

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


-- -----------------------------------------------------------------------------
-- 9. RLS
-- -----------------------------------------------------------------------------
-- Mismo criterio que el resto del panel: solo usuarios autenticados. El cron
-- entra con la service role key, que salta RLS por diseño.

ALTER TABLE public.app_settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usd_rates         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arca_emisores     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arca_ta_cache     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arca_contadores   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arca_comprobantes ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'app_settings','usd_rates',
    'arca_emisores','arca_ta_cache','arca_contadores','arca_comprobantes'
  ]
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


-- -----------------------------------------------------------------------------
-- 10. Estado `suspendido`
-- -----------------------------------------------------------------------------
-- El cron lo aplica cuando un servicio pasa los 15 días de mora y avisa a los
-- administradores. Sin esto en el CHECK, el update falla y el servicio queda
-- figurando vencido para siempre.
--
-- Los estados en uso hoy son activo, inactivo y vencido, así que agregar la
-- restricción no puede fallar por filas existentes.

ALTER TABLE public.client_services
  DROP CONSTRAINT IF EXISTS client_services_status_check;

ALTER TABLE public.client_services
  ADD CONSTRAINT client_services_status_check
  CHECK (status IN ('activo','inactivo','vencido','suspendido'));


-- =============================================================================
-- Comprobación. Las ocho filas tienen que dar true.
-- =============================================================================
SELECT 'app_settings'         AS que, to_regclass('public.app_settings')      IS NOT NULL AS ok
UNION ALL SELECT 'usd_rates',         to_regclass('public.usd_rates')         IS NOT NULL
UNION ALL SELECT 'arca_emisores',     to_regclass('public.arca_emisores')     IS NOT NULL
UNION ALL SELECT 'arca_comprobantes', to_regclass('public.arca_comprobantes') IS NOT NULL
UNION ALL SELECT 'payments.description',
  EXISTS (SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='payments' AND column_name='description')
UNION ALL SELECT 'clients.facturar',
  EXISTS (SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='clients' AND column_name='facturar')
-- to_regprocedure y no pg_get_function_identity_arguments: esa función
-- devuelve los argumentos con nombre ('p_emisor_id uuid, ...'), así que
-- compararla contra la lista de tipos siempre da falso negativo.
UNION ALL SELECT 'arca_reservar_numero(uuid,int,int)',
  to_regprocedure('public.arca_reservar_numero(uuid,integer,integer)') IS NOT NULL
UNION ALL SELECT 'estado suspendido permitido',
  EXISTS (SELECT 1 FROM pg_constraint
          WHERE conname='client_services_status_check'
            AND pg_get_constraintdef(oid) LIKE '%suspendido%');
