-- Lo que falta en la base para poder emitir.
--
-- Idempotente.

-- ---------------------------------------------------------------------------
-- 1. Idempotencia de la emisión
-- ---------------------------------------------------------------------------
-- `referencia` identifica el hecho que originó el comprobante: el id de un
-- cobro, o una marca manual. Si la respuesta de ARCA se pierde y el
-- administrador vuelve a intentar, la referencia evita emitir dos veces.

ALTER TABLE public.arca_comprobantes
  ADD COLUMN IF NOT EXISTS referencia text;

CREATE UNIQUE INDEX IF NOT EXISTS arca_comprobantes_referencia_uk
  ON public.arca_comprobantes (emisor_id, referencia)
  WHERE referencia IS NOT NULL AND estado IN ('pendiente', 'autorizado');

-- ---------------------------------------------------------------------------
-- 2. Cache del ticket de acceso
-- ---------------------------------------------------------------------------
-- ARCA entrega un solo ticket por certificado y servicio cada 12 horas. Si dos
-- instancias lo piden a la vez, la segunda recibe coe.alreadyAuthenticated y
-- queda sin poder facturar hasta que el primero venza.
--
-- El skill original resuelve esto con un advisory lock sostenido durante la
-- llamada a WSAA. Acá no hay conexión directa a Postgres — se entra por
-- PostgREST — así que el lock se reemplaza por una reserva con vencimiento:
-- una instancia se adjudica el derecho a pedir el ticket por 60 segundos y
-- las demás esperan a que lo deje cacheado.

ALTER TABLE public.arca_ta_cache
  ADD COLUMN IF NOT EXISTS reservado_hasta timestamp with time zone;

-- Devuelve el ticket si está vigente. Si no, intenta reservar el derecho a
-- pedirlo: `reservado` en true significa "pedilo vos", false significa "otro
-- lo está pidiendo, esperá y volvé a consultar".
CREATE OR REPLACE FUNCTION public.arca_ta_tomar(
  p_clave text,
  p_margen_segundos integer DEFAULT 900,
  p_reserva_segundos integer DEFAULT 60
)
RETURNS TABLE (token text, sign text, expira timestamp with time zone, reservado boolean)
LANGUAGE plpgsql
AS $$
DECLARE fila public.arca_ta_cache%ROWTYPE;
BEGIN
  -- FOR UPDATE serializa a las instancias que llegan juntas.
  SELECT * INTO fila FROM public.arca_ta_cache c
   WHERE c.clave = p_clave FOR UPDATE;

  IF FOUND AND fila.expira > now() + make_interval(secs => p_margen_segundos) THEN
    RETURN QUERY SELECT fila.token, fila.sign, fila.expira, false;
    RETURN;
  END IF;

  IF FOUND AND fila.reservado_hasta IS NOT NULL AND fila.reservado_hasta > now() THEN
    -- Otra instancia ya se adjudicó el pedido.
    RETURN QUERY SELECT NULL::text, NULL::text, NULL::timestamptz, false;
    RETURN;
  END IF;

  INSERT INTO public.arca_ta_cache (clave, token, sign, expira, reservado_hasta)
  VALUES (p_clave, '', '', now() - interval '1 second',
          now() + make_interval(secs => p_reserva_segundos))
  ON CONFLICT (clave) DO UPDATE
    SET reservado_hasta = now() + make_interval(secs => p_reserva_segundos);

  RETURN QUERY SELECT NULL::text, NULL::text, NULL::timestamptz, true;
END $$;

CREATE OR REPLACE FUNCTION public.arca_ta_guardar(
  p_clave text,
  p_token text,
  p_sign text,
  p_expira timestamp with time zone
)
RETURNS void
LANGUAGE sql
AS $$
  INSERT INTO public.arca_ta_cache (clave, token, sign, expira, actualizado, reservado_hasta)
  VALUES (p_clave, p_token, p_sign, p_expira, now(), NULL)
  ON CONFLICT (clave) DO UPDATE
    SET token = excluded.token,
        sign = excluded.sign,
        expira = excluded.expira,
        actualizado = now(),
        reservado_hasta = NULL;
$$;

-- ---------------------------------------------------------------------------
-- 3. Sincronizar el contador con lo que ARCA ya tiene
-- ---------------------------------------------------------------------------
-- El punto de venta puede venir con comprobantes emitidos desde otro sistema.
-- El contador local se inicializa una vez con FECompUltimoAutorizado.

CREATE OR REPLACE FUNCTION public.arca_fijar_contador(
  p_emisor_id uuid,
  p_pto_vta integer,
  p_cbte_tipo integer,
  p_ultimo integer
)
RETURNS void
LANGUAGE sql
AS $$
  INSERT INTO public.arca_contadores (emisor_id, pto_vta, cbte_tipo, ultimo_numero)
  VALUES (p_emisor_id, p_pto_vta, p_cbte_tipo, p_ultimo)
  ON CONFLICT (emisor_id, pto_vta, cbte_tipo)
    DO UPDATE SET ultimo_numero = excluded.ultimo_numero;
$$;

-- ---------------------------------------------------------------------------
-- Comprobación.
-- ---------------------------------------------------------------------------
SELECT 'arca_comprobantes.referencia' AS que,
  EXISTS (SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='arca_comprobantes'
            AND column_name='referencia') AS ok
UNION ALL SELECT 'arca_ta_cache.reservado_hasta',
  EXISTS (SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='arca_ta_cache'
            AND column_name='reservado_hasta')
UNION ALL SELECT 'arca_ta_tomar()',
  to_regprocedure('public.arca_ta_tomar(text,integer,integer)') IS NOT NULL
UNION ALL SELECT 'arca_ta_guardar()',
  to_regprocedure('public.arca_ta_guardar(text,text,text,timestamptz)') IS NOT NULL
UNION ALL SELECT 'arca_fijar_contador()',
  to_regprocedure('public.arca_fijar_contador(uuid,integer,integer,integer)') IS NOT NULL;
