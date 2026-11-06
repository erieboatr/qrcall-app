'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function PrivacyContent() {
  const [logoUrl, setLogoUrl] = useState('/logo.png')
  const [plantName, setPlantName] = useState('QRcall')
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

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="text-center mb-6">
          <img src={logoUrl} alt={`${plantName} logo`} className="h-16 mx-auto" />
          <h1 className="text-2xl font-bold mt-4">Privacy Policy</h1>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="prose prose-sm text-gray-700 space-y-4 font-bold">
            <p>QRcall.app ("we", "us", or "our") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information.</p>
            
            <h2 className="font-semibold text-base">Information We Collect</h2>
            <p>When you sign up for SMS alerts we collect your name, mobile phone number, and preferred language. We also collect plant/company information you provide.</p>

            <h2 className="font-semibold text-base">How We Use Your Information</h2>
            <p>We use your information solely to send service call alerts and related transactional messages. We do not sell or share your mobile number with third parties for marketing purposes.</p>

            <h2 className="font-semibold text-base">Your Rights</h2>
            <p>You may opt out of messages at any time by replying STOP. You can also contact us at sales@qrcall.app to request deletion of your information.</p>

            <h2 className="font-semibold text-base">Contact</h2>
            <p>Questions about this policy can be sent to sales@qrcall.app.</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-8 text-center">
          Continued use of this website constitutes your acceptance of this Privacy Policy.
        </p>

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