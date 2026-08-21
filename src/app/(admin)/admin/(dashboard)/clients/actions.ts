'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionState } from '@/types/admin'
import { cuitValido } from '@/lib/cuit'
import { condicionIvaValida } from '@/lib/arca-receptor'

export async function updateClientAction(prevState: ActionState | null, formData: FormData) {
  const id = formData.get('id') as string
  const contact_name = formData.get('contact_name') as string
  const brand_name = formData.get('brand_name') as string
  const email = (formData.get('email') as string) || null
  const phone = (formData.get('phone') as string) || null
  const website_url = (formData.get('website_url') as string) || null
  const notes = (formData.get('notes') as string) || null
  const cuit = (formData.get('cuit') as string)?.trim() || null
  const razon_social = (formData.get('razon_social') as string)?.trim() || null
  const facturar = formData.get('facturar') === 'on'

  if (!id || !contact_name || !brand_name) {
    return { success: false, message: 'Nombre y marca son requeridos.' }
  }

  // Un CUIT mal tipeado hace que ARCA rechace el comprobante entero, y para
  // entonces ya se consumió un número de la serie.
  if (cuit && !cuitValido(cuit)) {
    return { success: false, message: 'El CUIT no es válido. Revisá los 11 dígitos.' }
  }

  const cond = Number(formData.get('cond_iva_receptor'))
  const cond_iva_receptor = condicionIvaValida(cond) ? cond : 5

  const supabase = await createClient()
  const { error } = await supabase
    .from('clients')
    .update({
      contact_name, brand_name, email, phone, website_url, notes,
      cuit, razon_social, cond_iva_receptor, facturar,
    })
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
