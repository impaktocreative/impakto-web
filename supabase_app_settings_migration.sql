-- Ajustes de la aplicación y cotización del dólar por mes.
--
-- La cotización vivía en estado del cliente y volvía a 1400 en cada carga:
-- el administrador la corregía y al reentrar la encontraba igual. Además una
-- sola cotización para doce meses distorsiona: los dólares que entraron en
-- mayo no valen los pesos de hoy.
--
-- Ahora cada mes guarda la suya, y el total de doce meses es la suma de cada
-- mes convertido a su propia cotización. Un mes sin cargar hereda la última
-- cotización anterior a ese mes.
--
-- Idempotente.

CREATE TABLE IF NOT EXISTS public.app_settings (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Una fila por mes, con el mes en formato YYYY-MM.
CREATE TABLE IF NOT EXISTS public.usd_rates (
  month      text PRIMARY KEY CHECK (month ~ '^[0-9]{4}-[0-9]{2}$'),
  rate       numeric(15,4) NOT NULL CHECK (rate > 0),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usd_rates ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['app_settings','usd_rates']
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

-- Respaldo para los meses anteriores a cualquier carga: el mismo valor que
-- estaba escrito en el componente.
INSERT INTO public.app_settings (key, value)
VALUES ('usd_rate_fallback', '1400')
ON CONFLICT (key) DO NOTHING;
