"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function SignupForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
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
    if (localStorage.getItem("signup_terms") !== "true" || localStorage.getItem("signup_privacy") !== "true") {
      router.push("/tech-signup/terms")
    }
  }, [router])

  useEffect(() => {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consent) {
      setError("You must agree to receive messages.")
      return
    }
    setLoading(true)
    setError("")

    const { error: insertError } = await supabase.from("technicians").insert({
      name,
      phone,
      language,
      plant_id: plantId,
      active: true,
      sms_consent: true,
    })

    setLoading(false)
    if (insertError) {
      setError(insertError.message)
    } else {
      localStorage.removeItem("signup_terms")
      localStorage.removeItem("signup_privacy")
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">You’re signed up</h1>
        <p>You will now receive service call alerts for {plantName}.</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <img src={logoUrl} alt="logo" className="h-12 mb-4" />
      <h1 className="text-2xl font-bold mb-1">Technician Sign-Up</h1>
      <p className="text-sm text-gray-600 mb-6">{plantName}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            required
            className="w-full border rounded p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            required
            type="tel"
            className="w-full border rounded p-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="2165551234"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Language</label>
          <select
            className="w-full border rounded p-2"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
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