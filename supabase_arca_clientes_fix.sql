-- SUPERSEDIDO por supabase_pendientes.sql.
-- Ninguna tabla arca_* llegó a existir en la base, así que migrar de un
-- emisor a dos no aplica: las tablas se crean directamente con los dos.
-- Este archivo queda solo como registro. No correrlo.
--
-- Columnas fiscales de clients.
--
-- Este bloque forma parte de supabase_arca_facturacion_migration.sql pero
-- no llegó a aplicarse: las tablas arca_* se crearon y este ALTER no.
-- Correrlo solo, desde el editor SQL de Supabase.
--
-- Es idempotente: si alguna columna ya existe, la saltea.

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS razon_social text,
  ADD COLUMN IF NOT EXISTS cond_iva_receptor integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS facturar boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.clients.cond_iva_receptor IS
  'Código de FEParamGetCondicionIvaReceptor. 1 RI, 4 exento, 5 consumidor final, 6 monotributo.';
COMMENT ON COLUMN public.clients.facturar IS
  'Solo los clientes marcados disparan emisión automática al registrar un cobro.';
