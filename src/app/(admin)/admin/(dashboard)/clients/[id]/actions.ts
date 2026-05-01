'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function assignServiceAction(prevState: any, formData: FormData) {
  const client_id = formData.get('client_id') as string
  const service_id = formData.get('service_id') as string
  const domain_name = (formData.get('domain_name') as string) || null
  const price_ars = parseFloat(formData.get('price_ars') as string)
  const duration_months = parseInt(formData.get('duration_months') as string)
  const last_payment_date = (formData.get('last_payment_date') as string) || null
  const next_payment_date = (formData.get('next_payment_date') as string) || null
  const notes = (formData.get('notes') as string) || null
  const status = (formData.get('status') as string) || 'activo'

  if (!client_id || !service_id || !price_ars || !duration_months) {
    return { success: false, message: 'Servicio, precio y duración son requeridos.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('client_services').insert({
    client_id,
    service_id,
    domain_name,
    price_ars,
    duration_months,
    last_payment_date,
    next_payment_date,
    notes,
    status,
  })

  if (error) return { success: false, message: `Error: ${error.message}` }

  revalidatePath(`/admin/clients/${client_id}`)
  revalidatePath('/admin')
  return { success: true, message: 'Servicio asignado correctamente.' }
}

export async function removeClientServiceAction(id: string, client_id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('client_services').delete().eq('id', id)

  if (error) return { success: false, message: error.message }

  revalidatePath(`/admin/clients/${client_id}`)
  revalidatePath('/admin')
  return { success: true }
}
