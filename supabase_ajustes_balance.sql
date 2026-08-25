-- Ajustes de liquidación entre socios.
--
-- Un mes se liquida repartiendo el neto por mitades: cada socio se queda con
-- la mitad de lo que entró, sin importar quién lo cobró. Eso funciona mientras
-- todo el movimiento del mes esté cargado como ingreso o como gasto.
--
-- Hay cosas que no lo están. Un adelanto de un socio al otro, una compra que
-- uno pagó de su bolsillo y no se cargó como gasto del estudio, la mitad de
-- algo que se acordó de palabra. Para eso está esta tabla: una línea suelta,
-- con monto, a favor de quién y por qué.
--
-- El monto se aplica ENTERO a la liquidación, después del reparto por mitades.
-- No entra por ingresos ni por gastos: si entrara, un ajuste de 100.000 a favor
-- de Sergio movería la liquidación 50.000 y para el lado contrario, porque el
-- reparto se lleva la mitad. "A favor de" tiene que significar exactamente eso.
--
-- Idempotente: se puede correr de nuevo sin romper nada.

create table if not exists balance_adjustments (
  id uuid primary key default gen_random_uuid(),

  -- Mes al que pertenece, en el mismo formato que usa usd_rates y que la clave
  -- con la que el balance agrupa: 'YYYY-MM'.
  month text not null check (month ~ '^\d{4}-\d{2}$'),

  -- A favor de quién queda el monto. La dirección va acá y el monto va siempre
  -- positivo: un monto con signo más una dirección son dos formas de decir lo
  -- mismo, y tarde o temprano se contradicen.
  favor text not null check (favor in ('sergio', 'rodrigo')),

  amount numeric(14, 2) not null check (amount > 0),

  -- Se convierte con la cotización del mes, igual que todo el resto del
  -- balance. Un ajuste en pesos dentro de un mes que se liquidó en dólares
  -- sería el único número del mes que no respeta su cotización.
  currency text not null default 'ARS' check (currency in ('ARS', 'USD')),

  -- Obligatoria a propósito. Un ajuste sin explicación es un número que nadie
  -- va a poder defender dentro de seis meses.
  description text not null check (length(trim(description)) > 0),

  created_at timestamptz not null default now()
);

create index if not exists balance_adjustments_month_idx
  on balance_adjustments (month desc);

alter table balance_adjustments enable row level security;

-- Mismo criterio que el resto del panel: solo sesión autenticada.
drop policy if exists "balance_adjustments authenticated" on balance_adjustments;
create policy "balance_adjustments authenticated"
  on balance_adjustments
  for all
  to authenticated
  using (true)
  with check (true);

select
  count(*) as ajustes_cargados,
  (select count(*) from information_schema.columns
    where table_name = 'balance_adjustments') as columnas
from balance_adjustments;
