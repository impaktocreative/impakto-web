-- Notas internas del panel.
--
-- Un bloc compartido entre los administradores: lo que hay que acordarse, lo
-- que se habló por teléfono, lo que hay que revisar el mes que viene. Nada de
-- esto tiene lugar en clientes, servicios ni gastos, así que hasta ahora vivía
-- en WhatsApp y se perdía.
--
-- Sin título a propósito. Una nota corta con título obligatorio termina con el
-- título repitiendo la nota; el cuerpo entero se ve en la lista y alcanza.
--
-- Idempotente: se puede correr de nuevo sin romper nada.

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),

  body text not null check (length(trim(body)) > 0),

  created_at timestamptz not null default now(),

  -- Se toca solo al editar. Igual a created_at significa "nunca se editó", y
  -- así la interfaz puede callarse en vez de mostrar dos fechas iguales.
  updated_at timestamptz not null default now()
);

-- La lista siempre sale por fecha de creación descendente.
create index if not exists notes_created_at_idx on notes (created_at desc);

alter table notes enable row level security;

-- Mismo criterio que el resto del panel: solo sesión autenticada.
drop policy if exists "notes authenticated" on notes;
create policy "notes authenticated"
  on notes
  for all
  to authenticated
  using (true)
  with check (true);

select
  count(*) as notas_cargadas,
  (select count(*) from information_schema.columns
    where table_name = 'notes') as columnas
from notes;
