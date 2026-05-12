-- Safe migration for existing databases.
-- Do NOT run supabase_schema.sql again in production databases.

CREATE TABLE IF NOT EXISTS public.email_templates (
  type text PRIMARY KEY,
  subject text NOT NULL,
  body text NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.email_templates
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'email_templates'
      AND policyname = 'Allow authenticated full access on email templates'
  ) THEN
    CREATE POLICY "Allow authenticated full access on email templates"
      ON public.email_templates
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

INSERT INTO public.email_templates (type, subject, body, updated_at)
VALUES
(
  'overdue_every_3_days',
  'Servicio vencido hace {{dias_vencido}} dias: {{servicio}}',
  'Hola {{nombre}},<br><br>Tu servicio <strong>{{servicio}}</strong> se encuentra vencido desde hace <strong>{{dias_vencido}} dias</strong>.<br><br>Dominio: {{dominio}}<br>Monto pendiente: {{monto}}<br><br>Este recordatorio se enviara cada 3 dias hasta registrar el pago.',
  timezone('utc'::text, now())
),
(
  'payment_registered',
  'Pago recibido - {{servicio}}',
  'Hola {{nombre}},<br><br>Te confirmamos que registramos correctamente tu pago para <strong>{{servicio}}</strong>.<br><br>Dominio: {{dominio}}<br>Monto: {{monto}}<br><br>Gracias por trabajar con Impakto Creative.',
  timezone('utc'::text, now())
)
ON CONFLICT (type)
DO UPDATE SET
  subject = EXCLUDED.subject,
  body = EXCLUDED.body,
  updated_at = timezone('utc'::text, now());
