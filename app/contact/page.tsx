'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [needs, setNeeds] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('leads').insert({
      name,
      company,
      phone,
      needs,
    })
    setLoading(false)
    if (!error) setSubmitted(true)
    else alert('Something went wrong. Please try again.')
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-2">Thank you</h1>
        <p>We’ll be in touch soon.</p>
        <a href="/" className="inline-block mt-6 text-blue-600">Back to home</a>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Contact Sales</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input className="w-full border rounded p-2" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Company</label>
          <input className="w-full border rounded p-2" value={company} onChange={e => setCompany(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input className="w-full border rounded p-2" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">What are you looking for?</label>
          <textarea className="w-full border rounded p-2" rows={4} value={needs} onChange={e => setNeeds(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded font-medium">
          {loading ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  )
}
