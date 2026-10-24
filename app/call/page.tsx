'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function CallForm() {
  const searchParams = useSearchParams()
  const [equip, setEquip] = useState('')
  const [loc, setLoc] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setEquip(searchParams.get('equip') || '')
    setLoc(searchParams.get('loc') || '')
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    let photoUrl = null
    if (photo) {
      const fileName = `${Date.now()}-${photo.name}`
      const { data, error } = await supabase.storage
        .from('call-photos')
        .upload(fileName, photo)
      if (!error) {
        const { data: urlData } = supabase.storage
          .from('call-photos')
          .getPublicUrl(fileName)
        photoUrl = urlData.publicUrl
      }
    }

    const { error } = await supabase.from('service_calls').insert({
      equipment_name: equip,
      location: loc,
      priority,
      description,
      photo_url: photoUrl,
      status: 'Open',
    })

    setLoading(false)
    if (!error) setSubmitted(true)
    else alert('Error submitting call')
  }

  if (submitted) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-green-600">Call Submitted</h1>
        <p className="mt-2">A technician has been notified.</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Service Call</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Equipment</label>
          <input
            className="w-full border rounded p-2"
            value={equip}
            onChange={(e) => setEquip(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Location</label>
          <input
            className="w-full border rounded p-2"
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Priority</label>
          <select
            className="w-full border rounded p-2"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="w-full border rounded p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Photo (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium"
        >
          {loading ? 'Submitting...' : 'Submit Call'}
        </button>
      </form>
    </div>
  )
}

export default function CallPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <CallForm />
    </Suspense>
  )
}
