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
    saveNote: 'Save Additional Work Note',
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
    saveNote: 'Guardar Nota de Trabajo',
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
      const { error: uploadError } = await supabase.storage.from('call-photos').upload(fileName, photo)
      if (!uploadError) {
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