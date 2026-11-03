"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PrivacyPage() {
  const [agreed, setAgreed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem("signup_terms") !== "true") {
      router.push("/tech-signup/terms")
    }
  }, [router])

  function handleContinue() {
    if (!agreed) return
    localStorage.setItem("signup_privacy", "true")
    router.push("/tech-signup/sms")
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <div className="border rounded p-4 h-64 overflow-y-auto text-sm mb-4 space-y-3">
        <p>We collect your name, phone number, and preferred language so we can send you service call alerts.</p>
        <p>We do not sell or share your phone number with third parties for marketing.</p>
        <p>You can request that we delete your information by contacting sales@qrcall.app.</p>
        <p>We only send messages related to service calls you are scheduled to receive.</p>
      </div>
      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        I have read and agree to the Privacy Policy
      </label>
      <button
        onClick={handleContinue}
        disabled={!agreed}
        className="bg-red-600 text-white px-6 py-2 rounded disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  )
}