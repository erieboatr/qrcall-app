"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function TermsPage() {
  const [agreed, setAgreed] = useState(false)
  const router = useRouter()

  function handleContinue() {
    if (!agreed) return
    localStorage.setItem("signup_terms", "true")
    router.push("/tech-signup/privacy")
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
      <div className="border rounded p-4 h-64 overflow-y-auto text-sm mb-4 space-y-3">
        <p>By using QRcall.app you agree to the following:</p>
        <p>1. QRcall.app is a service notification tool. It sends text messages to technicians about equipment service calls.</p>
        <p>2. You must provide accurate contact information.</p>
        <p>3. You can stop receiving messages at any time by replying STOP.</p>
        <p>4. QRcall.app is not responsible for missed messages due to carrier issues or incorrect phone numbers.</p>
        <p>5. We may update these terms. Continued use means you accept the changes.</p>
      </div>
      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        I have read and agree to the Terms of Service
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