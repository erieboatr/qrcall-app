'use client'
import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { TechOnCall } from '@/components/tech-on-call'

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
    returnHint: 'Back to this machine shows the call status. Technicians sign in there with their mobile number and PIN.',
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
    returnHint: 'Volver a esta máquina muestra el estado. Los técnicos inician sesión ahí con su número y PIN.',
    critical: 'Crítico',
    high: 'Alto',
    medium: 'Medio',
    low: 'Bajo',
  },
}

type ExistingCall = {
  id?: string | null
  equipment_name?: string | null
  location?: string | null
  priority?: string | null
  status?: string | null
  description?: string | null
  work_notes?: string | null
  submitter_name?: string | null
  photo_url?: string | null
}

function CallForm() {
  const searchParams = useSearchParams()
  const urlPlant = searchParams.get('plant') || 'QRcall'
  const urlEquip = searchParams.get('equip') || ''
  const urlLoc = searchParams.get('loc') || ''
  const urlKey = `${urlPlant}|${urlEquip}|${urlLoc}`
  const [lang, setLang] = useState<'en' | 'es'>('en')
  const [plant, setPlant] = useState(urlPlant)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [equip, setEquip] = useState(urlEquip)
  const [loc, setLoc] = useState(urlLoc)
  const [seenUrl, setSeenUrl] = useState(urlKey)
  const [priority, setPriority] = useState('Medium')
  const [description, setDescription] = useState('')
  const [submitter, setSubmitter] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [honeypot, setHoneypot] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [existingCall, setExistingCall] = useState<ExistingCall | null>(null)
  const t = translations[lang]
  const devPreview = process.env.NODE_ENV === 'development' ? searchParams.get('preview') : null

  if (seenUrl !== urlKey) {
    setSeenUrl(urlKey)
    setPlant(urlPlant)
    setEquip(urlEquip)
    setLoc(urlLoc)
  }

  useEffect(() => {
    let ignore = false
    supabase
      .from('plants')
      .select('logo_url')
      .eq('id', urlPlant)
      .maybeSingle()
      .then(({ data }) => {
        if (!ignore && data?.logo_url) setLogoUrl(data.logo_url)
      })
    if (devPreview || !urlEquip) return () => { ignore = true }
    supabase
      .from('service_calls')
      .select('*')
      .eq('equipment_name', urlEquip)
      .eq('plant_id', urlPlant)
      .in('status', ['Open', 'Waiting', 'Arrived', 'Needs More Work'])
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!ignore && data) setExistingCall(data)
      })
    return () => { ignore = true }
  }, [urlPlant, urlEquip, devPreview])

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
      const { error: uploadError } = await supabase.storage.from('call-photos').upload(fileName, photo)
      if (uploadError) {
        console.error("Upload error:", uploadError)
        alert("Photo upload failed: " + uploadError.message)
      } else {
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
    if (!error) {
      setSubmitted(true)
    } else {
      alert('Error: ' + (error.message || JSON.stringify(error)))
    }
  }

  const previewCall = devPreview === 'open' ? {
    equipment_name: searchParams.get('equip') || 'Preview machine',
    location: searchParams.get('loc') || 'Preview location',
    priority: 'Medium',
    description: 'Preview only. This call is not saved.',
    status: 'Waiting',
    submitter_name: 'Preview operator',
  } : null
  const openCall = previewCall || existingCall

  if (submitted || devPreview === 'submitted') {
    const backPlant = devPreview === 'submitted' ? (searchParams.get('plant') || 'preview') : plant
    const backEquip = devPreview === 'submitted' ? (searchParams.get('equip') || 'Preview machine') : equip
    const backLoc = devPreview === 'submitted' ? (searchParams.get('loc') || 'Preview location') : loc
    const backHref = devPreview === 'submitted'
      ? `/call?preview=open&plant=${encodeURIComponent(backPlant)}&equip=${encodeURIComponent(backEquip)}&loc=${encodeURIComponent(backLoc)}`
      : `/call?plant=${backPlant}&equip=${encodeURIComponent(backEquip)}&loc=${encodeURIComponent(backLoc)}`
    return (
      <div className="p-6 text-center">
        <img src={logoUrl || '/logo.png'} alt="logo" className="h-12 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-green-600">{t.successTitle}</h1>
        <p className="mt-2">{t.successMsg}</p>
        <p className="mt-4 text-sm text-gray-600">{t.returnHint}</p>
        <div className="mt-6 space-y-3">
          <a href={backHref} className="block w-full bg-blue-600 text-white py-2 rounded font-medium">
            Back to this machine
          </a>
          <a href={`/board?plant=${plant}`} className="block w-full bg-gray-600 text-white py-2 rounded font-medium">
            View Status Board
          </a>
        </div>
      </div>
    )
  }

  if (openCall) {
    return (
      <div className="max-w-md mx-auto p-4">
        <img src={logoUrl || '/logo.png'} alt="logo" className="h-12 mx-auto mb-4" />
        <div className="flex justify-end mb-2">
          <button type="button" onClick={() => setLang(lang === 'en' ? 'es' : 'en')} className="text-sm px-3 py-1 border rounded">
            {lang === 'en' ? 'Español' : 'English'}
          </button>
        </div>
        <TechOnCall plantId={plant} call={openCall} lang={lang} />
        <a href={`/board?plant=${encodeURIComponent(plant)}`} className="block w-full bg-gray-600 text-white py-2 rounded font-medium text-center mt-4">
          View Status Board
        </a>
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