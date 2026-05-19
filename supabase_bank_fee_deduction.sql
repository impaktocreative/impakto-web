-- Migración: Agregar soporte para deducción del 3.5% por depósito/transferencia bancaria
-- y campo net_amount en pagos para reflejar el ingreso real

ALTER TABLE public.client_services ADD COLUMN IF NOT EXISTS deduct_bank_fee boolean DEFAULT false;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS net_amount numeric;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS receiver text;
