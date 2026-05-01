'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveTemplateAction(prevState: any, formData: FormData) {
  const type = formData.get('type') as string
  const subject = formData.get('subject') as string
  const body = formData.get('body') as string

  if (!type || !subject || !body) {
    return { success: false, message: 'Todos los campos son requeridos.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('email_templates')
    .upsert({ type, subject, body, updated_at: new Date().toISOString() }, { onConflict: 'type' })

  if (error) return { success: false, message: `Error: ${error.message}` }

  revalidatePath('/admin/settings')
  return { success: true, message: 'Plantilla guardada correctamente.' }
}
