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
  photo_url?: string
  plant_id?: string
}

function BoardContent() {
  const searchParams = useSearchParams()
  const [calls, setCalls] = useState<Call[]>([])
  const [plant, setPlant] = useState('default')

  useEffect(() => {
    const p = searchParams.get('plant') || 'default'
    setPlant(p)
    fetchCalls(p)

    const channel = supabase
      .channel('service_calls_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_calls' },
        () => fetchCalls(p)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [searchParams])

  async function fetchCalls(plantId: string) {
    const { data } = await supabase
      .from('service_calls')
      .select('*')
      .eq('plant_id', plantId)
      .in('status', ['Open', 'Arrived'])
      .order('submitted_at', { ascending: false })
    if (data) setCalls(data)
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-1">Live Status Board</h1>
      <p className="text-sm text-gray-600 mb-4">Plant: {plant}</p>
      <div className="space-y-3">
        {calls.map((call) => (
          <div key={call.id} className={`p-4 rounded text-white ${priorityColor(call.priority)}`}>
            <div className="font-bold">{call.equipment_name} — {call.location}</div>
            <div className="text-sm">{call.priority} • {call.status}</div>
            <div className="mt-1">{call.description}</div>
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
