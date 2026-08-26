import { createClient } from '@/utils/supabase/server'
import { NotasClient } from './NotasClient'

export const metadata = { title: 'Notas' }

type RawNoteRow = {
  id: string
  body: string
  created_at: string
  updated_at: string
}

export default async function NotasPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('notes')
    .select('id, body, created_at, updated_at')
    .order('created_at', { ascending: false })

  return <NotasClient initialNotas={(data ?? []) as RawNoteRow[]} />
}
