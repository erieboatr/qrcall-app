"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function SignupForm() {
  const searchParams = useSearchParams()
  const plantId = searchParams.get("plant") || "QRcall"

  const [plantName, setPlantName] = useState("QRcall")
  const [logoUrl, setLogoUrl] = useState("/logo.png")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [language, setLanguage] = useState("en")
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!plantId) return
    supabase
      .from("plants")
      .select("name, logo_url")
      .eq("id", plantId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.name) setPlantName(data.name)
        if (data?.logo_url) setLogoUrl(data.logo_url)
      })
  }, [plantId])

  useEffect(() => {
    if (localStorage.getItem("signup_terms") !== "true" || localStorage.getItem("signup_privacy") !== "true") {
      window.location.href = "/signup/terms"
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consent) {
      setError("You must agree to receive messages.")
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
    if (error) setError(error.message)
    else setDone(true)
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <img src={logoUrl} alt="logo" className="h-14 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">You’re signed up</h1>
        <p>You will now receive service-call alerts from {plantName}.</p>
        <p className="mt-2 text-sm text-gray-600">Reply STOP at any time to opt out.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-6">
        <img src={logoUrl} alt="logo" className="h-12 mb-4" />
        <h1 className="text-2xl font-bold mb-1">Join {plantName} Alerts</h1>
        <p className="text-gray-600 mb-6">
          Receive service-call alerts when equipment needs attention. Only on-duty technicians are notified.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input
              required
              className="w-full border rounded-lg px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mobile Number</label>
            <input
              required
              type="tel"
              placeholder="(555) 555-5555"
              className="w-full border rounded-lg px-3 py-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Language</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
            </select>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1"
            />
            <label className="text-sm text-gray-700">
              By checking this box and submitting this form, you consent to receive transactional text messages for repair and diagnostics alerts from QRcall.app. 
              Reply STOP to opt out. Reply HELP for help. 
              Standard message and data rates may apply. Message frequency may vary.
            </label>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Submitting…" : "SUBSCRIBE"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <a href="/privacy" className="text-red-600 hover:underline">Privacy Policy</a>
          <span className="mx-2 text-gray-400">|</span>
          <a href="/terms" className="text-red-600 hover:underline">Terms of Service</a>
        </div>
      </div>
    </div>
  )
}

export default function TechSignupPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
      <SignupForm />
    </Suspense>
  )
}