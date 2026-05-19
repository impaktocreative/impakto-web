'use client'

import { useEffect } from 'react'

export function AdminBodyClass() {
  useEffect(() => {
    document.body.classList.add('is-admin')
    return () => document.body.classList.remove('is-admin')
  }, [])

  return null
}
