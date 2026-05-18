-- Esquema de base de datos para Sistema de Gestión de Clientes Impakto Creative
-- También ver supabase_expenses_migration.sql para tablas de gastos y balance

-- 1. Tabla de Clientes
CREATE TABLE public.clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_name text NOT NULL,
  brand_name text NOT NULL,
  email text,
  phone text,
  website_url text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Catálogo de Servicios
CREATE TABLE public.services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  duration_months integer NOT NULL,
  price_ars numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Servicios Contratados
CREATE TABLE public.client_services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE RESTRICT,
  domain_name text,
  server_info text,
  price_ars numeric NOT NULL,
  duration_months integer NOT NULL,
  last_payment_date date,
  next_payment_date date,
  notes text,
  status text DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'vencido')),
  receiver text CHECK (receiver IN ('sergio', 'rodrigo')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Historial de Pagos
CREATE TABLE public.payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_service_id uuid REFERENCES public.client_services(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_date date NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5a. Catálogo de Gastos Recurrentes
CREATE TABLE public.expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'ARS',
  duration_months integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5b. Pagos de Gastos Realizados
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

-- 6. Tabla de Registro de Correos (Logs)
CREATE TABLE public.email_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_service_id uuid REFERENCES public.client_services(id) ON DELETE CASCADE,
  reminder_type text NOT NULL, -- '10_days', '5_days', '24_hours', 'overdue_every_3_days'
  sent_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas de Seguridad RLS (Row Level Security)
-- Como es un sistema de uso interno con un único admin, 
-- podemos permitir acceso completo solo a usuarios autenticados.

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON public.client_services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON public.email_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON public.expense_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insertar algunos servicios base de ejemplo
INSERT INTO public.services (name, duration_months, price_ars) VALUES
('Hosting Mensual', 1, 15000),
('Hosting Anual', 12, 150000),
('Renovación Dominio .com', 12, 25000),
('Renovación Dominio .com.ar', 12, 10000);
