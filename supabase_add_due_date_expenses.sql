-- Migración: Agregar fecha de vencimiento a gastos

ALTER TABLE public.expenses ADD COLUMN due_date date NOT NULL DEFAULT '2026-01-01';
-- Luego de agregar la columna con default temporal, removemos el default para que sea obligatorio explicitamente
ALTER TABLE public.expenses ALTER COLUMN due_date DROP DEFAULT;
