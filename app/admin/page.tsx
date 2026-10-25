'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_PASSWORD = 'MyPlant2026' // change to your password

type Tech = { id: string; name: string; phone: string }

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
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
  const [techs, setTechs] = useState<Tech[]>([])

  // Plant form
  const [plantId, setPlantId] = useState('')
  const [plantName, setPlantName] = useState('')
  const [plantCity, setPlantCity] = useState('')
  const [plantState, setPlantState] = useState('')
  const [plantPoc, setPlantPoc] = useState('')
  const [plantPhone, setPlantPhone] = useState('')

  useEffect(() => {
    if (authed) loadTechs()
  }, [authed])

  async function loadTechs() {
    const { data } = await supabase.from('technicians').select('id, name, phone').order('name')
    if (data) setTechs(data)
  }

  function checkPassword(e: React.FormEvent) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) setAuthed(true)
    else setMessage('Wrong password')
  }

  async function addTechnician(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('technicians').insert({ name: techName, phone: techPhone, active: true })
    setMessage(error ? error.message : 'Technician added')
    setTechName('')
    setTechPhone('')
    loadTechs()
  }

  async function deleteTech(id: string) {
    if (!confirm('Delete this technician?')) return
    const { error } = await supabase.from('technicians').delete().eq('id', id)
    setMessage(error ? error.message : 'Technician deleted')
    loadTechs()
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

  async function addPlant(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('plants').insert({
      id: plantId,
      name: plantName,
      city: plantCity,
      state: plantState,
      poc: plantPoc,
      phone: plantPhone,
    })
    setMessage(error ? error.message : 'Plant added')
    setPlantId('')
    setPlantName('')
    setPlantCity('')
    setPlantState('')
    setPlantPoc('')
    setPlantPhone('')
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto p-8">
        <h1 className="text-xl font-bold mb-4">Admin Login</h1>
        <form onSubmit={checkPassword} className="space-y-3">
          <input type="password" className="w-full border p-2" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="w-full bg-blue-600 text-white py-2 rounded">Enter</button>
          {message && <p className="text-red-600 text-sm">{message}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Admin</h1>
      {message && <p className="text-sm text-green-600">{message}</p>}

      <form onSubmit={addPlant} className="space-y-2 border p-4 rounded">
        <h2 className="font-semibold">Add Plant</h2>
        <input className="w-full border p-2" placeholder="Plant ID (e.g. ppi)" value={plantId} onChange={e => setPlantId(e.target.value)} required />
        <input className="w-full border p-2" placeholder="Plant Name" value={plantName} onChange={e => setPlantName(e.target.value)} required />
        <input className="w-full border p-2" placeholder="City" value={plantCity} onChange={e => setPlantCity(e.target.value)} />
        <input className="w-full border p-2" placeholder="State" value={plantState} onChange={e => setPlantState(e.target.value)} />
        <input className="w-full border p-2" placeholder="Point of Contact" value={plantPoc} onChange={e => setPlantPoc(e.target.value)} />
        <input className="w-full border p-2" placeholder="Phone" value={plantPhone} onChange={e => setPlantPhone(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Plant</button>
      </form>

      <div className="border p-4 rounded">
        <h2 className="font-semibold mb-2">Current Technicians</h2>
        {techs.length === 0 && <p className="text-sm text-gray-500">None yet.</p>}
        <ul className="space-y-2">
          {techs.map(t => (
            <li key={t.id} className="flex justify-between items-center text-sm border-b pb-1">
              <span>{t.name} — {t.phone}<br /><span className="text-xs text-gray-500">{t.id}</span></span>
              <button onClick={() => deleteTech(t.id)} className="text-red-600 text-xs">Delete</button>
            </li>
          ))}
        </ul>
      </div>

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
        <select className="w-full border p-2" value={techId} onChange={e => setTechId(e.target.value)} required>
          <option value="">Select technician</option>
          {techs.map(t => (
            <option key={t.id} value={t.id}>{t.name} ({t.id.slice(0, 8)}…)</option>
          ))}
        </select>
        <input className="w-full border p-2" type="number" placeholder="Day (0-6)" value={day} onChange={e => setDay(Number(e.target.value))} />
        <input className="w-full border p-2" placeholder="Start (HH:MM:SS)" value={start} onChange={e => setStart(e.target.value)} />
        <input className="w-full border p-2" placeholder="End (HH:MM:SS)" value={end} onChange={e => setEnd(e.target.value)} />
        <input className="w-full border p-2" placeholder="Plant ID" value={plant} onChange={e => setPlant(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Schedule</button>
      </form>
    </div>
  )
}
