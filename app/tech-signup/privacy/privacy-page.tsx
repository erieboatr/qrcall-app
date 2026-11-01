"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function PrivacyStep() {
  const [accepted, setAccepted] = useState(false)
  const router = useRouter()

  function next() {
    if (!accepted) return
    localStorage.setItem("signup_privacy", "true")
    router.push("/tech-signup/sms")
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <p className="text-sm text-gray-500 mb-2">Step 2 of 3</p>
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <div className="text-sm space-y-3 mb-6">
        <p>We collect only the information needed to send service-call alerts.</p>
        <p>We will not share or sell your mobile information with third parties for promotional or marketing purposes.</p>
        <p>You may opt out at any time by replying STOP.</p>
      </div>
      <label className="flex items-start gap-2 mb-6">
        <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-1" />
        <span>I have read and agree to the Privacy Policy.</span>
      </label>
      <button onClick={next} disabled={!accepted} className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50">
        Continue to SMS Consent
      </button>
    </div>
  )
}