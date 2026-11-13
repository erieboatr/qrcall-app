'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function SignupForm() {
  const searchParams = useSearchParams()
  const plantId = searchParams.get('plant') || 'QRcall'

  const [plantName, setPlantName] = useState('QRcall')
  const [logoUrl, setLogoUrl] = useState('/logo.png')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [language, setLanguage] = useState('en')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('plants')
      .select('name, logo_url')
      .eq('id', plantId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.name) setPlantName(data.name)
        if (data?.logo_url) setLogoUrl(data.logo_url)
      })
  }, [plantId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
  
    if (!consent) {
      setError('You must agree to receive messages.')
      return
    }
  
    setLoading(true)
  
    // Check if this phone already exists
    const { data: existing } = await supabase
      .from('technicians')
      .select('id, plant_id')
      .eq('phone', phone)
      .maybeSingle()
  
    if (existing) {
      // Phone already exists — update name/language/consent but keep their current plant
      const { error: updateError } = await supabase
        .from('technicians')
        .update({
          name,
          language,
          sms_consent: true,
          active: true,
        })
        .eq('id', existing.id)
  
      if (updateError) {
        setLoading(false)
        setError(updateError.message)
        return
      }
    } else {
      // New technician — insert with the plant from the signup link
      const { error: insertError } = await supabase
        .from('technicians')
        .insert({
          name,
          phone,
          language,
          plant_id: plantId,
          active: true,
          sms_consent: true,
        })
  
      if (insertError) {
        setLoading(false)
        setError(insertError.message)
        return
      }
    }
  
    // Send confirmation SMS
    try {
      await fetch("https://slrxmogriwsnbondquwq.supabase.co/functions/v1/send-signup-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name }),
      })
    } catch (err) {
      console.error("Confirmation SMS failed:", err)
    }
  
    setLoading(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow p-8 max-w-md text-center">
          <a href="/">
            <img src={logoUrl} alt="logo" className="h-16 mx-auto mb-4" />
          </a>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">You’re Signed Up</h1>
          <p className="text-gray-700">You will now receive service call alerts when you are on duty.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6">
        <div className="text-center mb-6">
          <a href="/">
            <img src={logoUrl} alt={`${plantName} logo`} className="h-16 mx-auto" />
          </a>
          <h1 className="text-2xl font-bold mt-4 text-gray-900">Join QRcall Alerts</h1>
          <p className="text-gray-700 text-sm mt-1">
            Receive service-call alerts when equipment needs attention. Only on-duty technicians are notified.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800">Mobile Number</label>
            <input
              type="tel"
              required
              placeholder="(555) 555-5555"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>

          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Communication Preferences</h2>
            <p className="text-sm text-gray-700 mb-3">How and why do you prefer we contact you.</p>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1"
              />
              <div className="text-sm text-gray-900">
                <span className="font-medium">Service Communications</span>
                <div className="mt-1 font-bold">
                  By checking this box, you agree to receive service communications via SMS notifications from <strong>QRcall</strong>.
                  <ul className="list-disc ml-5 mt-2 space-y-1 font-bold">
                    <li>These messages may include important information about equipment service calls.</li>
                    <li>Message frequency may vary.</li>
                    <li>Message and data rates may apply.</li>
                    <li>Your mobile phone number will not be sold or shared with third parties for promotional or marketing purposes.</li>
                    <li>Reply STOP to opt out. Reply HELP for help.</li>
                  </ul>
                </div>
              </div>
            </label>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Submitting…' : 'SUBSCRIBE'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <a href="/tech-signup/privacy" className="text-red-600 hover:underline font-medium">Privacy Policy</a>
          <span className="mx-2 text-gray-400">|</span>
          <a href="/tech-signup/terms" className="text-red-600 hover:underline font-medium">Terms and Conditions</a>
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