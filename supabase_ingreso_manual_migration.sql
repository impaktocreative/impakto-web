-- Ingresos manuales, sin cliente ni servicio.
--
-- `payments.client_service_id` ya acepta null, así que un ingreso suelto se
-- registra en la misma tabla y entra al balance como cualquier otro cobro.
-- Falta solo el texto que explique de qué se trata, porque sin servicio
-- asociado no hay nombre que mostrar.
--
-- Idempotente.

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS description text;

COMMENT ON COLUMN public.payments.description IS
  'Concepto del ingreso. Se usa cuando client_service_id es null: un cobro suelto que no corresponde a un servicio contratado.';

CREATE INDEX IF NOT EXISTS payments_manuales_idx
  ON public.payments (payment_date DESC)
  WHERE client_service_id IS NULL;
