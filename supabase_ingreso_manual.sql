-- Ingreso manual: cliente existente y medio de cobro.
--
-- Dos columnas nuevas en `payments`:
--
--   client_id       para poder atar un ingreso suelto a un cliente que ya
--                   existe, sin inventarle un servicio contratado. Va aparte
--                   de client_service_id a propósito: un cobro puede ser de un
--                   cliente conocido y no corresponder a ningún servicio del
--                   catálogo (un logo, una consultoría, una venta puntual).
--
--   payment_method  por dónde entró la plata. Importa porque no todos los
--                   medios pasan por el circuito declarado: una transferencia
--                   a cuenta bancaria tiene retención y computa impuestos,
--                   el efectivo no.
--
-- ON DELETE SET NULL y no CASCADE: si se borra el cliente, el ingreso ya
-- ocurrió y tiene que seguir sumando al balance. Perder plata cobrada del
-- histórico por borrar una ficha sería peor que quedarse con una fila huérfana.
--
-- Idempotente: se puede correr de nuevo sin romper nada.

alter table public.payments
  add column if not exists client_id uuid references public.clients(id) on delete set null;

alter table public.payments
  add column if not exists payment_method text;

comment on column public.payments.client_id is
  'Cliente del ingreso cuando no cuelga de un servicio contratado. Nulo en ingresos sin cliente.';

comment on column public.payments.payment_method is
  'Medio por el que se recibió: transferencia, efectivo, mercadopago, paypal, wise, cripto, otro.';

create index if not exists payments_client_idx on public.payments (client_id);

-- Comprobación: la Management API devuelve el resultado de la última
-- sentencia, así que el archivo cierra con un select verificable.
select
  count(*) filter (where column_name = 'client_id')      as tiene_client_id,
  count(*) filter (where column_name = 'payment_method') as tiene_payment_method
from information_schema.columns
where table_schema = 'public' and table_name = 'payments';
