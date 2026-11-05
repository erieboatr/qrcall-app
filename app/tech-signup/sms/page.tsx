'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function SignupForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
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
    if (localStorage.getItem('signup_terms') !== 'true' || localStorage.getItem('signup_privacy') !== 'true') {
      router.replace('/tech-signup/terms')
    }
  }, [router])

  useEffect(() => {
    if (!plantId) return
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
    if (!consent) {
      setError('You must agree to receive messages.')
      return
    }
    setLoading(true)
    setError('')

    const { error: insertError } = await supabase.from('technicians').insert({
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
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-lg shadow p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">You’re subscribed!</h1>
          <p>You will now receive service-call alerts when you are on duty.</p>
          <p className="text-sm text-gray-600 mt-4">Reply STOP at any time to unsubscribe.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <img src={logoUrl} alt="logo" className="h-10" />
            <span className="font-bold">QR Call</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">Join QRcall Alerts</h1>
          <p className="text-gray-600 text-sm mb-6">
            Receive service-call alerts when equipment needs attention. Only on-duty technicians are notified.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Your Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mobile Number</label>
              <input
                required
                type="tel"
                placeholder="(555) 555-5555"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h2 className="font-bold mb-1">Communication Preferences</h2>
              <p className="text-xs text-gray-600 mb-3">How and why do you prefer we contact you.</p>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1"
                />
                <div className="text-sm">
                  <label className="font-medium">Service Communications</label>
                  <p className="text-gray-700 mt-1">
                    By checking this box, you agree to receive service communications via SMS notifications from <strong>QRcall</strong>.
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                    <li>These messages may include important information about equipment service calls.</li>
                    <li>Message frequency may vary.</li>
                    <li>Message and data rates may apply.</li>
                    <li>Your mobile phone number will not be sold or shared with third parties for promotional or marketing purposes.</li>
                    <li>Reply STOP to opt out. Reply HELP for help.</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-bold text-lg disabled:opacity-50"
            >
              {loading ? 'SUBSCRIBING…' : 'SUBSCRIBE'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <a href="/tech-signup/privacy" className="text-red-600 hover:underline">Privacy Policy</a>
            <span className="mx-2 text-gray-400">|</span>
            <a href="/tech-signup/terms" className="text-red-600 hover:underline">Terms and Conditions</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TechSignupSmsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
      <SignupForm />
    </Suspense>
  )
}
