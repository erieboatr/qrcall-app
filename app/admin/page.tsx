'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [techName, setTechName] = useState('')
  const [techPhone, setTechPhone] = useState('')
  const [equipName, setEquipName] = useState('')
  const [equipLoc, setEquipLoc] = useState('')
  const [plant, setPlant] = useState('ppi')
  const [techId, setTechId] = useState('')
  const [day, setDay] = useState(1)
  const [start, setStart] = useState('06:00:00')
  const [end, setEnd] = useState('18:00:00')
  const [message, setMessage] = useState('')

  async function addTechnician(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('technicians').insert({ name: techName, phone: techPhone, active: true })
    setMessage(error ? error.message : 'Technician added')
    setTechName('')
    setTechPhone('')
  }

  async function addEquipment(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('equipment').insert({ name: equipName, location: equipLoc, plant_id: plant })
    setMessage(error ? error.message : 'Equipment added')
    setEquipName('')
    setEquipLoc('')
  }

  async function addSchedule(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('schedules').insert({
      technician_id: techId,
      day_of_week: day,
      start_time: start,
      end_time: end,
      plant_id: plant,
    })
    setMessage(error ? error.message : 'Schedule added')
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Admin</h1>
      {message && <p className="text-sm text-green-600">{message}</p>}

      <form onSubmit={addTechnician} className="space-y-2 border p-4 rounded">
        <h2 className="font-semibold">Add Technician</h2>
        <input className="w-full border p-2" placeholder="Name" value={techName} onChange={e => setTechName(e.target.value)} required />
        <input className="w-full border p-2" placeholder="Phone (+1...)" value={techPhone} onChange={e => setTechPhone(e.target.value)} required />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Technician</button>
      </form>

      <form onSubmit={addEquipment} className="space-y-2 border p-4 rounded">
        <h2 className="font-semibold">Add Equipment</h2>
        <input className="w-full border p-2" placeholder="Equipment name" value={equipName} onChange={e => setEquipName(e.target.value)} required />
        <input className="w-full border p-2" placeholder="Location" value={equipLoc} onChange={e => setEquipLoc(e.target.value)} />
        <input className="w-full border p-2" placeholder="Plant ID" value={plant} onChange={e => setPlant(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Equipment</button>
      </form>

      <form onSubmit={addSchedule} className="space-y-2 border p-4 rounded">
        <h2 className="font-semibold">Add Schedule</h2>
        <input className="w-full border p-2" placeholder="Technician UUID" value={techId} onChange={e => setTechId(e.target.value)} required />
        <input className="w-full border p-2" type="number" placeholder="Day (0-6)" value={day} onChange={e => setDay(Number(e.target.value))} />
        <input className="w-full border p-2" placeholder="Start (HH:MM:SS)" value={start} onChange={e => setStart(e.target.value)} />
        <input className="w-full border p-2" placeholder="End (HH:MM:SS)" value={end} onChange={e => setEnd(e.target.value)} />
        <input className="w-full border p-2" placeholder="Plant ID" value={plant} onChange={e => setPlant(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Schedule</button>
      </form>
    </div>
  )
}
