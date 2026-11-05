
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const [agreed, setAgreed] = useState(false)
  const router = useRouter()

  function handleContinue() {
    if (agreed) {
      localStorage.setItem('signup_terms', 'true')
      router.push('/tech-signup/privacy')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
        <div className="border rounded p-4 h-72 overflow-y-auto text-sm mb-4 space-y-3">
          <p><strong>QRcall.app Service Call Alerts</strong></p>
          <p>
            By providing your mobile phone number and enrolling in the program, you agree to receive recurring Service Call text messages from QRcall.app. Message frequency varies. Message and data rates may apply. Reply <strong>STOP</strong> to cancel or <strong>HELP</strong> for help. For additional assistance, contact sales@qrcall.app or +1 (216) 200-3264. Wireless carriers are not liable for delayed or undelivered messages. Participation in this program is subject to our <a href="/tech-signup/privacy" className="underline">Privacy Policy</a>.
          </p>
          <p>1. QRcall.app sends transactional SMS alerts about equipment service calls to technicians who have opted in and are scheduled on duty.</p>
          <p>2. You must provide accurate contact information.</p>
          <p>3. Message frequency varies based on service call volume at your plant.</p>
          <p>4. Message and data rates may apply.</p>
          <p>5. Reply <strong>STOP</strong> to unsubscribe. Reply <strong>HELP</strong> for help.</p>
          <p>6. Carriers are not liable for any delayed or undelivered messages.</p>
          <p>7. Continued use of the service constitutes acceptance of these terms.</p>
        </div>
        <div className="flex items-start gap-2 mb-4">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1"
          />
          <label className="text-sm">I have read and agree to the Terms of Service</label>
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
