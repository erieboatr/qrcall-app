'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function PrivacyContent() {
  const [agreed, setAgreed] = useState(false)
  const [logoUrl, setLogoUrl] = useState('/logo.png')
  const [plantName, setPlantName] = useState('QRcall')
  const router = useRouter()
  const searchParams = useSearchParams()
  const plantId = searchParams.get('plant') || 'QRcall'

  useEffect(() => {
    supabase
      .from('plants')
      .select('name, logo_url')
      .eq('id', plantId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.name) setPlantName(data.name)
        if (data?.logo_url) setLogoUrl(data.logo_url)
      })
  }, [plantId])

  function handleContinue() {
    if (agreed) {
      localStorage.setItem('signup_privacy', 'true')
      router.push(`/tech-signup/sms?plant=${plantId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="text-center mb-6">
          <img src={logoUrl} alt={`${plantName} logo`} className="h-16 mx-auto" />
          <h1 className="text-2xl font-bold mt-4">Privacy Policy</h1>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h2 className="font-semibold text-lg mb-2">SMS / Text Message Program</h2>
          <p className="text-sm text-gray-700 leading-relaxed font-bold">
            By providing your mobile phone number and enrolling in the program, you agree to receive recurring repair and diagnostics alert text messages from QRcall.app. Message frequency varies. Message and data rates may apply. Reply STOP to cancel or HELP for help. For additional assistance, contact sales@qrcall.app. Wireless carriers are not liable for delayed or undelivered messages. Participation in this program is subject to our Privacy Policy.
          </p>
        </div>

        <div className="mt-8 flex items-start gap-2">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="agree" className="text-sm text-gray-700">
            I have read and agree to the Privacy Policy
          </label>
        </div>

        <button
          onClick={handleContinue}
          disabled={!agreed}
          className="mt-6 w-full bg-red-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          Continue
        </button>

        <footer className="border-t mt-12 py-6 text-center text-sm text-gray-600">
          <div className="space-x-4">
            <a href="/tech-signup/terms" className="text-red-700 underline font-medium hover:text-red-900">
              Terms and Conditions
            </a>
            <span className="text-gray-400">|</span>
            <a href="/tech-signup/privacy" className="text-red-700 underline font-medium hover:text-red-900">
              Privacy Policy
            </a>
          </div>
          <p className="mt-2">&copy; 2026 QRcall.app. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <PrivacyContent />
    </Suspense>
  )
}