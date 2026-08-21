'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cuitValido } from '@/lib/cuit'
import { condicionIvaValida } from '@/lib/arca-receptor'

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()

  const cuit = (formData.get('cuit') as string)?.trim() || null
  if (cuit && !cuitValido(cuit)) {
    redirect('/admin/clients/new?error=' + encodeURIComponent('El CUIT no es válido. Revisá los 11 dígitos.'))
  }
  const cond = Number(formData.get('cond_iva_receptor'))

  const data = {
    contact_name: formData.get('contact_name') as string,
    brand_name: formData.get('brand_name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    website_url: formData.get('website_url') as string,
    notes: formData.get('notes') as string,
    cuit,
    razon_social: (formData.get('razon_social') as string)?.trim() || null,
    cond_iva_receptor: condicionIvaValida(cond) ? cond : 5,
    facturar: formData.get('facturar') === 'on',
  }

  const { error } = await supabase.from('clients').insert([data])

  if (error) {
    redirect('/admin/clients/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/clients')
  redirect('/admin/clients')
}
