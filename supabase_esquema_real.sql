-- Esquema real de la base, al 2026-08-21.
--
-- Los archivos supabase_schema.sql y las migraciones sueltas quedaron
-- desactualizados: varias columnas se agregaron directamente desde el editor
-- SQL de Supabase y nunca se escribió el archivo correspondiente. Leer
-- supabase_schema.sql para saber qué hay en la base lleva a error — por
-- ejemplo dice `price_ars` donde la base tiene `price`, y no menciona
-- `currency`, `receiver`, `deduct_bank_fee` ni `cuit`.
--
-- Este archivo documenta lo que hay de verdad. Es idempotente: correrlo
-- sobre la base actual no cambia nada, y sirve para levantar una base nueva
-- equivalente. La fuente de verdad sigue siendo la base; esto es el reflejo.

-- ---------------------------------------------------------------------------
-- Divergencias respecto de supabase_schema.sql
-- ---------------------------------------------------------------------------
-- services:        price_ars -> price. Agregadas description, currency.
-- client_services: price_ars -> price. Agregadas currency, receiver,
--                  deduct_bank_fee.
-- payments:        agregadas currency, net_amount, receiver.
-- clients:         agregada cuit.
-- email_templates: PK real es id; type es único.

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'ARS';

ALTER TABLE public.client_services
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'ARS',
  ADD COLUMN IF NOT EXISTS receiver text,
  ADD COLUMN IF NOT EXISTS deduct_bank_fee boolean DEFAULT false;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'ARS',
  ADD COLUMN IF NOT EXISTS net_amount numeric,
  ADD COLUMN IF NOT EXISTS receiver text;

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS cuit text;

-- ---------------------------------------------------------------------------
-- Restricciones que el código asume
-- ---------------------------------------------------------------------------
-- `removeClientServiceAction` escribía 'archived', que no está en el CHECK.
-- Ya se corrigió a 'inactivo'; esto deja constancia de cuáles son válidos.

-- 'suspendido' se agrega al CHECK: el cron lo aplica cuando un servicio
-- pasa los 15 días de mora y avisa a los administradores.
ALTER TABLE public.client_services
  DROP CONSTRAINT IF EXISTS client_services_status_check;

ALTER TABLE public.client_services
  ADD CONSTRAINT client_services_status_check
  CHECK (status IN ('activo','inactivo','vencido','suspendido'));

-- ---------------------------------------------------------------------------
-- Índices que faltaban
-- ---------------------------------------------------------------------------
-- El cron recorre los servicios por estado y vencimiento en cada corrida, y
-- consulta email_logs por servicio y tipo. Sin estos índices son escaneos
-- completos: con 18 filas no se nota, con 500 sí.

CREATE INDEX IF NOT EXISTS client_services_vencimiento_idx
  ON public.client_services (status, next_payment_date);

CREATE INDEX IF NOT EXISTS email_logs_servicio_tipo_idx
  ON public.email_logs (client_service_id, reminder_type, sent_at DESC);

CREATE INDEX IF NOT EXISTS payments_servicio_fecha_idx
  ON public.payments (client_service_id, payment_date DESC);

CREATE INDEX IF NOT EXISTS expense_payments_gasto_fecha_idx
  ON public.expense_payments (expense_id, payment_date DESC);
