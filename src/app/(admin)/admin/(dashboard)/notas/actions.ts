'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import type { ActionState } from '@/types/admin'

/** Tope de la nota. Alto de sobra para lo que se escribe, pero acotado. */
const LARGO_MAXIMO = 5000

export async function crearNotaAction(
  _prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const body = String(formData.get('body') ?? '').trim()

  if (!body) return { success: false, message: 'La nota está vacía.' }
  if (body.length > LARGO_MAXIMO) {
    return { success: false, message: `La nota no puede pasar de ${LARGO_MAXIMO} caracteres.` }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('notes').insert({ body })

  if (error) return { success: false, message: `No se pudo guardar: ${error.message}` }

  revalidatePath('/admin/notas')
  return { success: true, message: 'Nota guardada.' }
}

/**
 * Edita una nota.
 *
 * `updated_at` se escribe a mano porque la tabla no tiene trigger: sin esto la
 * columna quedaría clavada en la fecha de creación y la lista nunca diría que
 * la nota se editó.
 */
export async function editarNotaAction(
  _prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get('id') ?? '')
  const body = String(formData.get('body') ?? '').trim()

  if (!id) return { success: false, message: 'Falta la nota a editar.' }
  if (!body) return { success: false, message: 'La nota no puede quedar vacía.' }
  if (body.length > LARGO_MAXIMO) {
    return { success: false, message: `La nota no puede pasar de ${LARGO_MAXIMO} caracteres.` }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('notes')
    .update({ body, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { success: false, message: `No se pudo guardar: ${error.message}` }

  revalidatePath('/admin/notas')
  return { success: true, message: 'Nota actualizada.' }
}

export async function eliminarNotaAction(id: string): Promise<ActionState> {
  if (!id) return { success: false, message: 'Falta la nota a eliminar.' }

  const supabase = await createClient()
  const { error } = await supabase.from('notes').delete().eq('id', id)

  if (error) return { success: false, message: `No se pudo eliminar: ${error.message}` }

  revalidatePath('/admin/notas')
  return { success: true, message: 'Nota eliminada.' }
}
