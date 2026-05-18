'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createExpenseAction(prevState: unknown, formData: FormData) {
  const name = formData.get('name') as string
  const amount = parseFloat(formData.get('amount') as string)
  const currency = formData.get('currency') as string
  const duration_months = parseInt(formData.get('duration_months') as string)
  const due_date = formData.get('due_date') as string
  const description = (formData.get('description') as string) || null

  if (!name || !amount || amount <= 0 || !currency || !duration_months || duration_months < 1 || !due_date) {
    return { success: false, message: 'Todos los campos son requeridos.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('expenses').insert({ name, amount, currency, duration_months, due_date, description })

  if (error) return { success: false, message: `Error al crear gasto: ${error.message}` }

  revalidatePath('/admin/expenses')
  return { success: true, message: 'Gasto creado correctamente.' }
}

export async function updateExpenseAction(prevState: unknown, formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const amount = parseFloat(formData.get('amount') as string)
  const currency = formData.get('currency') as string
  const duration_months = parseInt(formData.get('duration_months') as string)
  const due_date = formData.get('due_date') as string
  const description = (formData.get('description') as string) || null

  if (!id || !name || !amount || amount <= 0 || !currency || !duration_months || duration_months < 1 || !due_date) {
    return { success: false, message: 'Todos los campos son requeridos.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('expenses')
    .update({ name, amount, currency, duration_months, due_date, description })
    .eq('id', id)

  if (error) return { success: false, message: `Error al actualizar gasto: ${error.message}` }

  revalidatePath('/admin/expenses')
  return { success: true, message: 'Gasto actualizado correctamente.' }
}

export async function deleteExpenseAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('expenses').delete().eq('id', id)

  if (error) return { success: false, message: `Error al eliminar gasto: ${error.message}` }

  revalidatePath('/admin/expenses')
  return { success: true }
}

export async function registerExpensePaymentAction(prevState: unknown, formData: FormData) {
  const expense_id = formData.get('expense_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const currency = formData.get('currency') as string
  const payment_date = formData.get('payment_date') as string
  const paid_by = formData.get('paid_by') as string
  const notes = (formData.get('notes') as string) || null

  if (!expense_id || !amount || amount <= 0 || !currency || !payment_date || !paid_by) {
    return { success: false, message: 'Todos los campos son requeridos.' }
  }

  if (!['sergio', 'rodrigo'].includes(paid_by)) {
    return { success: false, message: 'El pagador debe ser Sergio o Rodrigo.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('expense_payments').insert({
    expense_id,
    amount,
    currency,
    payment_date,
    paid_by,
    notes,
  })

  if (error) return { success: false, message: `Error al registrar pago: ${error.message}` }

  revalidatePath('/admin/expenses')
  return { success: true, message: 'Pago registrado correctamente.' }
}
