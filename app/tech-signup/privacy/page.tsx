'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PrivacyPage() {
  const [agreed, setAgreed] = useState(false)
  const router = useRouter()

  function handleContinue() {
    if (agreed) {
      localStorage.setItem('signup_privacy', 'true')
      router.push('/tech-signup/sms')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
        <div className="border rounded p-4 h-72 overflow-y-auto text-sm mb-4 space-y-3">
          <p>QRcall.app collects your name, mobile phone number, and preferred language solely to send you transactional service-call alerts when equipment needs attention.</p>
          <p><strong>No mobile information will be sold or shared with third parties for promotional or marketing purposes.</strong> Text messaging originator opt-in data and consent will not be shared with any third parties, excluding aggregators and providers of the Text Message services.</p>
          <p>We only use your information to deliver the service you requested. You may request deletion of your data by emailing sales@qrcall.app.</p>
          <p>We do not sell, rent, or share your mobile number or opt-in consent with third parties for marketing or promotional purposes.</p>
        </div>
        <div className="flex items-start gap-2 mb-4">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1"
          />
          <label className="text-sm">I have read and agree to the Privacy Policy</label>
        </div>
        <button
          onClick={handleContinue}
          disabled={!agreed}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
