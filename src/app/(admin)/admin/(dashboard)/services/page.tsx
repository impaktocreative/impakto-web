import { createClient } from '@/utils/supabase/server'
import { ServicesClient } from './NewServiceButton'

export default async function ServicesPage() {
  const supabase = await createClient()

  const { data: services } = await supabase
    .from('services')
    .select('id, name, duration_months, price, currency, description')
    .order('created_at', { ascending: false })

  return <ServicesClient initialServices={services ?? []} />
}
