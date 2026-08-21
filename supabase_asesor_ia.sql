-- Asesor IA del sitio público.
--
-- Tres tablas:
--   app_settings   pares clave/valor de configuración editables desde el admin
--   chat_sessions  el hilo de conversación de un visitante
--   chat_messages  los turnos, colgando de la sesión
--
-- Idempotente: se puede correr de nuevo sin romper nada.

create table if not exists public.app_settings (
  key         text primary key,
  value       text,
  updated_at  timestamptz not null default now()
);

comment on table public.app_settings is
  'Configuración editable desde /admin/settings. La fila gana sobre la variable de entorno equivalente.';

-- El rol del mensaje. Solo dos: no se guarda el prompt de sistema, que se
-- rearma en cada petición y no pertenece a la conversación.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'chat_role') then
    create type public.chat_role as enum ('user', 'assistant');
  end if;
end $$;

create table if not exists public.chat_sessions (
  id             uuid primary key default gen_random_uuid(),
  -- Nulo a propósito: una conversación anónima es una fila válida, no un
  -- parche. Si el visitante deja sus datos más tarde, se completan.
  nombre         text,
  email          text,
  telefono       text,
  empresa        text,
  -- Marcada cuando el asesor derivó a una persona: es la cola de trabajo real.
  handoff        boolean not null default false,
  intencion      text[],
  referrer       text,
  utm            jsonb,
  user_agent     text,
  started_at     timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role       public.chat_role not null,
  content    text not null,
  created_at timestamptz not null default now()
);

-- Borrar la sesión borra la transcripción. Es lo que hace que la política de
-- retención sea real y no una promesa.
create index if not exists chat_messages_session_idx on public.chat_messages (session_id, created_at);
create index if not exists chat_sessions_activity_idx on public.chat_sessions (last_active_at desc);
create index if not exists chat_sessions_handoff_idx on public.chat_sessions (handoff) where handoff;

-- RLS cerrado. El sitio público nunca toca estas tablas con la anon key: todo
-- pasa por server actions y por la ruta de streaming, que usan la service role.
alter table public.app_settings   enable row level security;
alter table public.chat_sessions  enable row level security;
alter table public.chat_messages  enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'app_settings' and policyname = 'app_settings_admin') then
    create policy app_settings_admin on public.app_settings
      for all to authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'chat_sessions' and policyname = 'chat_sessions_admin') then
    create policy chat_sessions_admin on public.chat_sessions
      for all to authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'chat_messages' and policyname = 'chat_messages_admin') then
    create policy chat_messages_admin on public.chat_messages
      for all to authenticated using (true) with check (true);
  end if;
end $$;

-- Comprobación: el archivo cierra con un select para que la Management API
-- devuelva algo verificable en lugar del resultado de un `do`.
select
  to_regclass('public.app_settings')  is not null as app_settings,
  to_regclass('public.chat_sessions') is not null as chat_sessions,
  to_regclass('public.chat_messages') is not null as chat_messages;
