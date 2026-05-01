'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createServiceAction(prevState: any, formData: FormData) {
  const name = formData.get('name') as string
  const duration_months = parseInt(formData.get('duration_months') as string)
  const price = parseFloat(formData.get('price') as string)
  const currency = formData.get('currency') as string
  const description = (formData.get('description') as string) || null

  if (!name || !duration_months || !price || !currency) {
    return { success: false, message: 'Nombre, duración, precio y moneda son requeridos.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('services').insert({ name, duration_months, price, currency, description })

  if (error) return { success: false, message: `Error al guardar: ${error.message}` }

  revalidatePath('/admin/services')
  return { success: true, message: 'Servicio creado correctamente.' }
}

export async function updateServiceAction(prevState: any, formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const duration_months = parseInt(formData.get('duration_months') as string)
  const price = parseFloat(formData.get('price') as string)
  const currency = formData.get('currency') as string
  const description = (formData.get('description') as string) || null

  if (!id || !name || !duration_months || !price || !currency) {
    return { success: false, message: 'Todos los campos son requeridos.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('services')
    .update({ name, duration_months, price, currency, description })
    .eq('id', id)

  if (error) return { success: false, message: `Error al actualizar: ${error.message}` }

  revalidatePath('/admin/services')
  return { success: true, message: 'Servicio actualizado.' }
}

export async function deleteServiceAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('services').delete().eq('id', id)

  if (error) return { success: false, message: `Error al eliminar: ${error.message}` }

  revalidatePath('/admin/services')
  return { success: true }
}
