'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()

  const data = {
    contact_name: formData.get('contact_name') as string,
    brand_name: formData.get('brand_name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    website_url: formData.get('website_url') as string,
    notes: formData.get('notes') as string,
    cuit: (formData.get('cuit') as string) || null,
  }

  const { error } = await supabase.from('clients').insert([data])

  if (error) {
    redirect('/admin/clients/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/clients')
  redirect('/admin/clients')
}
