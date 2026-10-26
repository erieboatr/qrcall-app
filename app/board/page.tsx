'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Call = {
  id: string
  equipment_name: string
  location: string
  priority: string
  description: string
  status: string
  submitted_at: string
  arrived_at?: string
  photo_url?: string
  plant_id?: string
  submitter_name?: string
}

function BoardContent() {
  const searchParams = useSearchParams()
  const [calls, setCalls] = useState<Call[]>([])
  const [plant, setPlant] = useState('default')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [onDuty, setOnDuty] = useState<string[]>([])

  useEffect(() => {
    const p = searchParams.get('plant') || 'default'
    setPlant(p)
    fetchCalls(p)
    fetchOnDuty(p)
    loadPlantLogo(p)

    const channel = supabase
      .channel('service_calls_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_calls' }, () => {
        fetchCalls(p)
        fetchOnDuty(p)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [searchParams])

  async function loadPlantLogo(plantId: string) {
    const { data } = await supabase
      .from('plants')
      .select('logo_url')
      .eq('id', plantId)
      .maybeSingle()
    if (data?.logo_url) setLogoUrl(data.logo_url)
  }

  async function fetchCalls(plantId: string) {
    const { data } = await supabase
      .from('service_calls')
      .select('*')
      .eq('plant_id', plantId)
      .in('status', ['Waiting', 'Arrived', 'Needs More Work'])
      .order('submitted_at', { ascending: false })
    if (data) setCalls(data)
  }

  async function fetchOnDuty(plantId: string) {
    const now = new Date()
    const dayOfWeek = now.getUTCDay()
    const currentTime = now.toISOString().slice(11, 16)

    const { data } = await supabase
      .from('schedules')
      .select('technicians(name)')
      .eq('plant_id', plantId)
      .eq('day_of_week', dayOfWeek)
      .lte('start_time', currentTime)
      .gte('end_time', currentTime)

    if (data) {
      const names = data.map((row: any) => row.technicians?.name).filter(Boolean)
      setOnDuty(names)
    }
  }

  function priorityColor(priority: string) {
    switch (priority) {
      case 'Critical': return 'bg-red-500'
      case 'High': return 'bg-orange-500'
      case 'Medium': return 'bg-yellow-400'
      case 'Low': return 'bg-green-500'
      default: return 'bg-gray-400'
    }
  }

  function formatTime(iso?: string) {
    if (!iso) return ''
    return new Date(iso).toLocaleString()
  }

  return (
    <div className="p-4">
      <img src={logoUrl || '/logo.png'} alt="logo" className="h-12 mb-4" />
      <h1 className="text-2xl font-bold mb-1">Live Status Board</h1>
      <p className="text-sm text-gray-600 mb-1">Plant: {plant}</p>
      <p className="text-sm mb-4">
        On duty: {onDuty.length > 0 ? onDuty.join(', ') : 'No one currently scheduled'}
      </p>
      <div className="space-y-3">
        {calls.map((call) => (
          <div key={call.id} className={`p-4 rounded text-white ${priorityColor(call.priority)}`}>
            <div className="font-bold">{call.equipment_name} — {call.location}</div>
            <div className="text-sm">{call.priority} • {call.status}</div>
            <div className="mt-1">{call.description}</div>
            {call.submitter_name && <div className="text-xs mt-1">Submitted by: {call.submitter_name}</div>}
            <div className="text-xs mt-2 opacity-90">
              Submitted: {formatTime(call.submitted_at)}
              {call.arrived_at && <> • Arrived: {formatTime(call.arrived_at)}</>}
            </div>
            {call.photo_url && <img src={call.photo_url} alt="issue" className="mt-2 max-h-40 rounded" />}
          </div>
        ))}
        {calls.length === 0 && <p className="text-gray-600">No open calls for this plant.</p>}
      </div>
    </div>
  )
}

export default function BoardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <BoardContent />
    </Suspense>
  )
}
