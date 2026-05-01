'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function assignServiceAction(prevState: any, formData: FormData) {
  const client_id = formData.get('client_id') as string
  const service_id = formData.get('service_id') as string
  const domain_name = (formData.get('domain_name') as string) || null
  const price = parseFloat(formData.get('price') as string)
  const currency = formData.get('currency') as string
  const duration_months = parseInt(formData.get('duration_months') as string)
  const last_payment_date = (formData.get('last_payment_date') as string) || null
  const notes = (formData.get('notes') as string) || null
  const status = (formData.get('status') as string) || 'activo'

  // Always compute next_payment_date from last_payment_date + duration_months
  let next_payment_date: string | null = null
  if (last_payment_date && duration_months) {
    const d = new Date(last_payment_date)
    d.setMonth(d.getMonth() + duration_months)
    next_payment_date = d.toISOString().split('T')[0]
  }

  if (!client_id || !service_id || !price || !currency || !duration_months) {
    return { success: false, message: 'Servicio, precio y duración son requeridos.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('client_services').insert({
    client_id,
    service_id,
    domain_name,
    price,
    currency,
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

export async function editClientServiceAction(prevState: any, formData: FormData) {
  const id = formData.get('id') as string
  const client_id = formData.get('client_id') as string
  const domain_name = (formData.get('domain_name') as string) || null
  const price = parseFloat(formData.get('price') as string)
  const currency = formData.get('currency') as string
  const duration_months = parseInt(formData.get('duration_months') as string)
  const last_payment_date = (formData.get('last_payment_date') as string) || null
  const notes = (formData.get('notes') as string) || null
  const status = (formData.get('status') as string) || 'activo'

  let next_payment_date: string | null = null
  if (last_payment_date && duration_months) {
    const d = new Date(last_payment_date)
    d.setMonth(d.getMonth() + duration_months)
    next_payment_date = d.toISOString().split('T')[0]
  }

  if (!id || !client_id || !price || !currency || !duration_months) {
    return { success: false, message: 'ID, precio y duración son requeridos.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('client_services').update({
    domain_name,
    price,
    currency,
    duration_months,
    last_payment_date,
    next_payment_date,
    notes,
    status,
  }).eq('id', id)

  if (error) return { success: false, message: `Error: ${error.message}` }

  revalidatePath(`/admin/clients/${client_id}`)
  revalidatePath('/admin')
  return { success: true, message: 'Servicio actualizado correctamente.' }
}
