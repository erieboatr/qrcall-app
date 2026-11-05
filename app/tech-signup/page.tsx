'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TechSignupRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/tech-signup/terms')
  }, [router])

  return <div className="p-6 text-center">Loading…</div>
}
