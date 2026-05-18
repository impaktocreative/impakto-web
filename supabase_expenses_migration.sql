-- Migración: Sistema de Gastos y Balance Mensual

-- 1. Catálogo de Gastos Recurrentes
CREATE TABLE public.expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'ARS',
  duration_months integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Pagos de Gastos Realizados
CREATE TABLE public.expense_payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id uuid REFERENCES public.expenses(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'ARS',
  payment_date date NOT NULL,
  paid_by text NOT NULL CHECK (paid_by IN ('sergio', 'rodrigo')),
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Agregar receiver a client_services
ALTER TABLE public.client_services ADD COLUMN receiver text CHECK (receiver IN ('sergio', 'rodrigo'));

-- 4. RLS Policies
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access" ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON public.expense_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
