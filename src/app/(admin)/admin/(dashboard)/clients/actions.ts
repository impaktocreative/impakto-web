'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateClientAction(prevState: any, formData: FormData) {
  const id = formData.get('id') as string
  const contact_name = formData.get('contact_name') as string
  const brand_name = formData.get('brand_name') as string
  const email = (formData.get('email') as string) || null
  const phone = (formData.get('phone') as string) || null
  const website_url = (formData.get('website_url') as string) || null
  const notes = (formData.get('notes') as string) || null

  if (!id || !contact_name || !brand_name) {
    return { success: false, message: 'Nombre y marca son requeridos.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('clients')
    .update({ contact_name, brand_name, email, phone, website_url, notes })
    .eq('id', id)

  if (error) return { success: false, message: `Error: ${error.message}` }

  revalidatePath('/admin/clients')
  revalidatePath(`/admin/clients/${id}`)
  return { success: true, message: 'Cliente actualizado.' }
}

export async function deleteClientAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('clients').delete().eq('id', id)

  if (error) return { success: false, message: `Error: ${error.message}` }

  revalidatePath('/admin/clients')
  return { success: true }
}
