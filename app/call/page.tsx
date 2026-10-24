'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const translations = {
  en: {
    title: 'Service Call',
    equipment: 'Equipment',
    location: 'Location',
    priority: 'Priority',
    description: 'Description',
    photo: 'Photo (optional)',
    submit: 'Submit Call',
    submitting: 'Submitting...',
    successTitle: 'Call Submitted',
    successMsg: 'A technician has been notified.',
    arrived: 'Arrived',
    completed: 'Completed',
    currentCall: 'Current Call',
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  },
  es: {
    title: 'Llamada de Servicio',
    equipment: 'Equipo',
    location: 'Ubicación',
    priority: 'Prioridad',
    description: 'Descripción',
    photo: 'Foto (opcional)',
    submit: 'Enviar Llamada',
    submitting: 'Enviando...',
    successTitle: 'Llamada Enviada',
    successMsg: 'Se ha notificado a un técnico.',
    arrived: 'Llegué',
    completed: 'Completado',
    currentCall: 'Llamada Actual',
    critical: 'Crítico',
    high: 'Alto',
    medium: 'Medio',
    low: 'Bajo',
  },
}

function CallForm() {
  const searchParams = useSearchParams()
  const [lang, setLang] = useState<'en' | 'es'>('en')
  const [equip, setEquip] = useState('')
  const [loc, setLoc] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [existingCall, setExistingCall] = useState<any>(null)

  const t = translations[lang]

  useEffect(() => {
    const eq = searchParams.get('equip') || ''
    const lc = searchParams.get('loc') || ''
    setEquip(eq)
    setLoc(lc)
    if (eq) checkExistingCall(eq)
  }, [searchParams])

  async function checkExistingCall(equipmentName: string) {
    const { data } = await supabase
      .from('service_calls')
      .select('*')
      .eq('equipment_name', equipmentName)
      .in('status', ['Open', 'Arrived'])
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single()
    if (data) setExistingCall(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    let photoUrl = null
    if (photo) {
      const fileName = `${Date.now()}-${photo.name}`
      const { error } = await supabase.storage.from('call-photos').upload(fileName, photo)
      if (!error) {
        const { data: urlData } = supabase.storage.from('call-photos').getPublicUrl(fileName)
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
      language: lang,
    })

    setLoading(false)
    if (!error) setSubmitted(true)
    else alert('Error submitting call')
  }

  async function updateStatus(newStatus: string) {
    if (!existingCall) return
    const updates: any = { status: newStatus }
    if (newStatus === 'Arrived') updates.arrived_at = new Date().toISOString()
    if (newStatus === 'Completed') updates.completed_at = new Date().toISOString()

    await supabase.from('service_calls').update(updates).eq('id', existingCall.id)
    if (newStatus === 'Completed') setExistingCall(null)
    else setExistingCall({ ...existingCall, status: newStatus })
  }

  if (submitted) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-green-600">{t.successTitle}</h1>
        <p className="mt-2">{t.successMsg}</p>
      </div>
    )
  }

  if (existingCall) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            className="text-sm px-3 py-1 border rounded"
          >
            {lang === 'en' ? 'Español' : 'English'}
          </button>
        </div>
        <h1 className="text-2xl font-bold mb-4">{t.currentCall}</h1>
        <div className="bg-white border rounded p-4 space-y-2">
          <div><strong>{existingCall.equipment_name}</strong> — {existingCall.location}</div>
          <div>{existingCall.priority} • {existingCall.status}</div>
          <div>{existingCall.description}</div>
          {existingCall.photo_url && (
            <img src={existingCall.photo_url} alt="issue" className="mt-2 max-h-40 rounded" />
          )}
          <div className="flex gap-2 pt-2">
            {existingCall.status === 'Open' && (
              <button
                onClick={() => updateStatus('Arrived')}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {t.arrived}
              </button>
            )}
            <button
              onClick={() => updateStatus('Completed')}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {t.completed}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
          className="text-sm px-3 py-1 border rounded"
        >
          {lang === 'en' ? 'Español' : 'English'}
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4">{t.title}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">{t.equipment}</label>
          <input className="w-full border rounded p-2" value={equip} onChange={(e) => setEquip(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">{t.location}</label>
          <input className="w-full border rounded p-2" value={loc} onChange={(e) => setLoc(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">{t.priority}</label>
          <select className="w-full border rounded p-2" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="Critical">{t.critical}</option>
            <option value="High">{t.high}</option>
            <option value="Medium">{t.medium}</option>
            <option value="Low">{t.low}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">{t.description}</label>
          <textarea className="w-full border rounded p-2" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
        <div>
          <label className="block text-sm font-medium">{t.photo}</label>
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded font-medium">
          {loading ? t.submitting : t.submit}
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
