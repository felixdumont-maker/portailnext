'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ToolsHub from '@/app/_components/outils/ToolsHub'

export default function ClientOutilsPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/v1/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data || !data.has_outils) { router.replace('/dashboard'); return; }
        setAllowed(true)
      })
      .catch(() => router.replace('/dashboard'))
  }, [router])

  if (!allowed) return null
  return <ToolsHub basePath="/outils" />
}
