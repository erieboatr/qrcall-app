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
  arrived_at?: string
  completed_at?: string
  photo_url?: string
}

export default function CompletedPage() {
  const [calls, setCalls] = useState<Call[]>([])

  useEffect(() => {
    fetchCompleted()
  }, [])

  async function fetchCompleted() {
    const { data } = await supabase
      .from('service_calls')
      .select('*')
      .eq('status', 'Completed')
      .order('completed_at', { ascending: false })
    if (data) setCalls(data)
  }

  function formatTime(iso?: string) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString()
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Completed Calls</h1>
      <div className="space-y-3">
        {calls.map((call) => (
          <div key={call.id} className="p-4 rounded bg-gray-200">
            <div className="font-bold">{call.equipment_name} — {call.location}</div>
            <div className="text-sm">{call.priority} • Completed</div>
            <div className="mt-1">{call.description}</div>
            <div className="text-xs mt-2 text-gray-700">
              Submitted: {formatTime(call.submitted_at)}<br />
              Arrived: {formatTime(call.arrived_at)}<br />
              Completed: {formatTime(call.completed_at)}
            </div>
            {call.photo_url && <img src={call.photo_url} alt="issue" className="mt-2 max-h-40 rounded" />}
          </div>
        ))}
        {calls.length === 0 && <p className="text-gray-600">No completed calls yet.</p>}
      </div>
    </div>
  )
}
