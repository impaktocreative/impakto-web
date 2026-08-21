-- Movimientos que no computan en los totales.
--
-- Hay ingresos y egresos que hay que dejar registrados pero que no
-- corresponden al resultado del mes: una devolución, un movimiento entre
-- cuentas propias, un adelanto que ya se contó, plata que pasa por la cuenta
-- sin ser de la agencia.
--
-- Se marcan en vez de no cargarlos: el movimiento existió y borrarlo del
-- registro deja la cuenta bancaria sin explicar. Siguen apareciendo en la
-- lista, marcados, y quedan afuera de las sumas.
--
-- Idempotente.

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS exclude_from_totals boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.payments.exclude_from_totals IS
  'El cobro queda registrado pero no suma a los totales mensuales ni al balance.';

ALTER TABLE public.expense_payments
  ADD COLUMN IF NOT EXISTS exclude_from_totals boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.expense_payments.exclude_from_totals IS
  'El pago queda registrado pero no resta en los totales mensuales ni en el balance.';

-- Los totales filtran por esta columna en cada consulta mensual.
CREATE INDEX IF NOT EXISTS payments_computables_idx
  ON public.payments (payment_date DESC)
  WHERE exclude_from_totals = false;

CREATE INDEX IF NOT EXISTS expense_payments_computables_idx
  ON public.expense_payments (payment_date DESC)
  WHERE exclude_from_totals = false;

-- Comprobación.
SELECT 'payments.exclude_from_totals' AS que,
  EXISTS (SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='payments'
            AND column_name='exclude_from_totals') AS ok
UNION ALL SELECT 'expense_payments.exclude_from_totals',
  EXISTS (SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='expense_payments'
            AND column_name='exclude_from_totals');
