"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function TermsStep() {
  const [accepted, setAccepted] = useState(false)
  const router = useRouter()

  function next() {
    if (!accepted) return
    localStorage.setItem("signup_terms", "true")
    router.push("/tech-signup/privacy")
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <p className="text-sm text-gray-500 mb-2">Step 1 of 3</p>
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <div className="text-sm space-y-3 mb-6">
        <p>By using QRcall.app you agree to these terms.</p>
        <p>Technicians receive operational SMS alerts. Message frequency varies. Message and data rates may apply. Reply STOP to opt out.</p>
        <p>Use the system only for legitimate maintenance purposes.</p>
      </div>
      <label className="flex items-start gap-2 mb-6">
        <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-1" />
        <span>I have read and agree to the Terms of Service.</span>
      </label>
      <button onClick={next} disabled={!accepted} className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50">
        Continue to Privacy Policy
      </button>
    </div>
  )
}