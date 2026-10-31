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
    submitter: 'Your Name',
    submit: 'Submit Call',
    submitting: 'Submitting...',
    successTitle: 'Call Submitted',
    successMsg: 'A technician has been notified.',
    arrived: 'Arrived',
    completed: 'Completed',
    needsMore: 'Needs More Work',
    moreWorkNote: 'What additional work is needed?',
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
    submitter: 'Su Nombre',
    submit: 'Enviar Llamada',
    submitting: 'Enviando...',
    successTitle: 'Llamada Enviada',
    successMsg: 'Se ha notificado a un técnico.',
    arrived: 'Llegué',
    completed: 'Completado',
    needsMore: 'Necesita Más Trabajo',
    moreWorkNote: '¿Qué trabajo adicional se necesita?',
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
  const [plant, setPlant] = useState('default')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [equip, setEquip] = useState('')
  const [loc, setLoc] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [description, setDescription] = useState('')
  const [submitter, setSubmitter] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [honeypot, setHoneypot] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [existingCall, setExistingCall] = useState<any>(null)
  const [moreWorkNote, setMoreWorkNote] = useState('')
  const t = translations[lang]

  useEffect(() => {
    const p = searchParams.get('plant') || 'default'
    const eq = searchParams.get('equip') || ''
    const lc = searchParams.get('loc') || ''
    setPlant(p)
    setEquip(eq)
    setLoc(lc)
    loadPlantLogo(p)
    if (eq) checkExistingCall(eq, p)
  }, [searchParams])

  async function loadPlantLogo(plantId: string) {
    const { data } = await supabase
      .from('plants')
      .select('logo_url')
      .eq('id', plantId)
      .maybeSingle()
    if (data?.logo_url) setLogoUrl(data.logo_url)
  }

  async function checkExistingCall(equipmentName: string, plantId: string) {
    const { data } = await supabase
      .from('service_calls')
      .select('*')
      .eq('equipment_name', equipmentName)
      .eq('plant_id', plantId)
      .in('status', ['Open', 'Waiting', 'Arrived', 'Needs More Work'])
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (data) setExistingCall(data)
  }

  function isRateLimited() {
    const key = 'qrcall_last_submit'
    const last = localStorage.getItem(key)
    const now = Date.now()
    if (last && now - parseInt(last) < 60_000) return true
    localStorage.setItem(key, now.toString())
    return false
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (honeypot) return
    if (isRateLimited()) {
      alert('Please wait a minute before submitting another call.')
      return
    }
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
      status: 'Waiting',
      language: lang,
      plant_id: plant,
      submitter_name: submitter,
    })
    setLoading(false)
    if (!error) setSubmitted(true)
    else alert('Error: ' + (error.message || JSON.stringify(error)))
  }

  async function updateStatus(newStatus: string) {
    if (!existingCall) return
    const updates: any = { status: newStatus }
    if (newStatus === 'Arrived') updates.arrived_at = new Date().toISOString()
    if (newStatus === 'Needs More Work') {
      updates.updated_at = new Date().toISOString()
      if (moreWorkNote) updates.description = moreWorkNote
    }
    if (newStatus === 'Completed') updates.completed_at = new Date().toISOString()

    await supabase.from('service_calls').update(updates).eq('id', existingCall.id)

    if (newStatus === 'Completed') {
      setExistingCall(null)
    } else {
      setExistingCall({ ...existingCall, status: newStatus, description: moreWorkNote || existingCall.description })
    }
    setMoreWorkNote('')
  }

  if (submitted) {
    return (
      <div className="p-6 text-center">
        <img src={logoUrl || '/logo.png'} alt="logo" className="h-12 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-green-600">{t.successTitle}</h1>
        <p className="mt-2">{t.successMsg}</p>
        <div className="mt-6 space-y-3">
          <a href={`/call?plant=${plant}&equip=${encodeURIComponent(equip)}&loc=${encodeURIComponent(loc)}`} className="block w-full bg-blue-600 text-white py-2 rounded font-medium">
            Back to this machine
          </a>
          <a href={`/board?plant=${plant}`} className="block w-full bg-gray-600 text-white py-2 rounded font-medium">
            View Status Board
          </a>
        </div>
      </div>
    )
  }

  if (existingCall) {
    return (
      <div className="max-w-md mx-auto p-4">
        <img src={logoUrl || '/logo.png'} alt="logo" className="h-12 mx-auto mb-4" />
        <div className="flex justify-end mb-2">
          <button type="button" onClick={() => setLang(lang === 'en' ? 'es' : 'en')} className="text-sm px-3 py-1 border rounded">
            {lang === 'en' ? 'Español' : 'English'}
          </button>
        </div>
        <h1 className="text-2xl font-bold mb-4">{t.currentCall}</h1>
        <div className="bg-white border rounded p-4 space-y-2">
          <div><strong>{existingCall.equipment_name}</strong> — {existingCall.location}</div>
          <div>{existingCall.priority} • {existingCall.status}</div>
          <div>{existingCall.description}</div>
          {existingCall.submitter_name && <div className="text-sm">Submitted by: {existingCall.submitter_name}</div>}
          {existingCall.photo_url && <img src={existingCall.photo_url} alt="issue" className="mt-2 max-h-40 rounded" />}

          <div className="space-y-3 pt-3">
            {/* Arrived button only shows while still Waiting */}
            {existingCall.status === 'Waiting' && (
              <button
                onClick={() => updateStatus('Arrived')}
                className="w-full bg-blue-600 text-white py-2 rounded font-medium"
              >
                {t.arrived}
              </button>
            )}

            {/* Needs More Work + note + Completed show after Arrived */}
            {(existingCall.status === 'Arrived' || existingCall.status === 'Needs More Work') && (
              <>
                <button
                  onClick={() => updateStatus('Needs More Work')}
                  className="w-full bg-orange-600 text-white py-2 rounded font-medium"
                >
                  {t.needsMore}
                </button>

                {existingCall.status === 'Needs More Work' && (
                  <textarea
                    placeholder={t.moreWorkNote}
                    value={moreWorkNote}
                    onChange={(e) => setMoreWorkNote(e.target.value)}
                    className="w-full border rounded p-2"
                    rows={3}
                  />
                )}

                <button
                  onClick={() => updateStatus('Completed')}
                  className="w-full bg-green-600 text-white py-2 rounded font-medium"
                >
                  {t.completed}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <img src={logoUrl || '/logo.png'} alt="logo" className="h-12 mx-auto mb-4" />
      <div className="flex justify-end mb-2">
        <button type="button" onClick={() => setLang(lang === 'en' ? 'es' : 'en')} className="text-sm px-3 py-1 border rounded">
          {lang === 'en' ? 'Español' : 'English'}
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4">{t.title}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={e => setHoneypot(e.target.value)}
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
        />
        <div>
          <label className="block text-sm font-medium">{t.submitter}</label>
          <input className="w-full border rounded p-2" value={submitter} onChange={(e) => setSubmitter(e.target.value)} required />
        </div>
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