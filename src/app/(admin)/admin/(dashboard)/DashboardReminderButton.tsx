'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { sendManualReminderAction } from './clients/[id]/actions'
import { IconButton } from '@/app/(admin)/admin/ui/IconButton'

export function DashboardReminderButton({ clientServiceId }: { clientServiceId: string }) {
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)
  const [, startTransition] = useTransition()

  const handleClick = () => {
    if (!confirm('¿Enviar aviso de vencimiento a este cliente?')) return
    setSending(true)
    startTransition(async () => {
      const result = await sendManualReminderAction(clientServiceId)
      setSending(false)
      setFeedback({ ok: result.success, text: result.message })
      setTimeout(() => setFeedback(null), 3000)
      router.refresh()
    })
  }

  return (
    <div className="relative inline-flex">
      <IconButton
        icon={Bell}
        label="Enviar aviso de vencimiento"
        tono="aviso"
        ocupado={sending}
        onClick={handleClick}
      />
      {feedback && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap z-10 pointer-events-none">
          <p className={`text-xs px-2 py-1 rounded-md shadow-lg ${feedback.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {feedback.text}
          </p>
        </div>
      )}
    </div>
  )
}
