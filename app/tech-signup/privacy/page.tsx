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
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h2 className="font-semibold text-lg mb-2">SMS / Text Message Program</h2>
          <p className="text-sm text-gray-700 leading-relaxed font-bold">
            By providing your mobile phone number and enrolling in the program, you agree to receive recurring repair and diagnostics alert text messages from QRcall.app. Message frequency varies. Message and data rates may apply. Reply STOP to cancel or HELP for help. For additional assistance, contact sales@qrcall.app. Wireless carriers are not liable for delayed or undelivered messages. Participation in this program is subject to our Privacy Policy.
          </p>
        </div>

        <div className="prose prose-sm text-gray-700 space-y-4">
          <p>QRcall.app (“we”, “us”, or “our”) respects your privacy. This Privacy Policy explains how we collect, use, and protect your information.</p>
          
          <h2 className="font-semibold text-base">Information We Collect</h2>
          <p>When you sign up for SMS alerts we collect your name, mobile phone number, and preferred language. We also collect plant/company information you provide.</p>

          <h2 className="font-semibold text-base">How We Use Your Information</h2>
          <p>We use your information solely to send service call alerts and related transactional messages. We do not sell or share your mobile number with third parties for marketing purposes.</p>

          <h2 className="font-semibold text-base">Your Rights</h2>
          <p>You may opt out of messages at any time by replying STOP. You can also contact us at sales@qrcall.app to request deletion of your information.</p>

          <h2 className="font-semibold text-base">Contact</h2>
          <p>Questions about this policy can be sent to sales@qrcall.app.</p>
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