'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TechSignupRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/tech-signup/sms')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Loading opt-in form…</p>
    </div>
  )
}