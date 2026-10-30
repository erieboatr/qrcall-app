"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function TechSignup() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [language, setLanguage] = useState("en")
  const [plantId, setPlantId] = useState("")
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consent) {
      setError("You must consent to receive messages.")
      return
    }
    setLoading(true)
    setError("")

    const { error } = await supabase.from("technicians").insert({
      name,
      phone,
      language,
      plant_id: plantId || null,
      active: true,
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">You’re signed up</h1>
        <p>You will now receive service-call alerts. Reply STOP at any time to opt out.</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Technician Signup</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            required
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone (with country code)</label>
          <input
            required
            type="tel"
            placeholder="+1..."
            className="w-full border rounded px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Language</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Plant ID (optional)</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={plantId}
            onChange={(e) => setPlantId(e.target.value)}
          />
        </div>
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1"
          />
          <label className="text-sm">
            I consent to receive SMS service-call alerts from QRcall. Message frequency varies. Message and data rates may apply. Reply STOP to opt out at any time.
          </label>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium disabled:opacity-50"
        >
          {loading ? "Submitting…" : "Sign Up"}
        </button>
      </form>
    </div>
  )
}