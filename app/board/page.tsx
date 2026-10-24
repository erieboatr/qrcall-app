'use client'

import { useEffect, useState } from 'react'
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
}

export default function BoardPage() {
  const [calls, setCalls] = useState<Call[]>([])

  useEffect(() => {
    fetchCalls()
    const channel = supabase
      .channel('service_calls_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_calls' }, () => fetchCalls())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchCalls() {
    const { data } = await supabase
      .from('service_calls')
      .select('*')
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
      <h1 className="text-2xl font-bold mb-4">Live Status Board</h1>
      <div className="space-y-3">
        {calls.map((call) => (
          <div key={call.id} className={`p-4 rounded text-white ${priorityColor(call.priority)}`}>
            <div className="font-bold">{call.equipment_name} — {call.location}</div>
            <div className="text-sm">{call.priority} • {call.status}</div>
            <div className="mt-1">{call.description}</div>
            {call.photo_url && <img src={call.photo_url} alt="issue" className="mt-2 max-h-40 rounded" />}
          </div>
        ))}
        {calls.length === 0 && <p className="text-gray-600">No open calls.</p>}
      </div>
    </div>
  )
}
