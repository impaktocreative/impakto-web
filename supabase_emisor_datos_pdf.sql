-- Datos del emisor que van impresos en el comprobante.
--
-- Una Factura C lleva, además del CUIT y la razón social, el número de
-- Ingresos Brutos y la fecha de inicio de actividades. Sin esos dos campos el
-- PDF que genere el sistema no se parece al que hoy emite ARCA.
--
-- Idempotente.

ALTER TABLE public.arca_emisores
  ADD COLUMN IF NOT EXISTS ingresos_brutos text,
  ADD COLUMN IF NOT EXISTS inicio_actividades date;

COMMENT ON COLUMN public.arca_emisores.ingresos_brutos IS
  'Número de Ingresos Brutos tal como se imprime. Vacío en monotributo si no corresponde.';
COMMENT ON COLUMN public.arca_emisores.inicio_actividades IS
  'Fecha de inicio de actividades. Se imprime en el encabezado del comprobante.';

-- Comprobación.
SELECT 'arca_emisores.ingresos_brutos' AS que,
  EXISTS (SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='arca_emisores'
            AND column_name='ingresos_brutos') AS ok
UNION ALL SELECT 'arca_emisores.inicio_actividades',
  EXISTS (SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='arca_emisores'
            AND column_name='inicio_actividades');
