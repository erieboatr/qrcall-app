"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

// Temporary plant passwords (move to plants table later)
const PLANT_PASSWORDS: Record<string, string> = {
  ppi: "ppi2026",
  QRcall: "qrcall2026",
}

function PlantAdmin() {
  const searchParams = useSearchParams()
  const plantId = searchParams.get("plant") || "ppi"

  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState("")
  const [plantName, setPlantName] = useState("")
  const [logoUrl, setLogoUrl] = useState("/logo.png")
  const [techs, setTechs] = useState<any[]>([])
  const [schedule, setSchedule] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  // New tech form
  const [newName, setNewName] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newLang, setNewLang] = useState("en")

  useEffect(() => {
    if (!plantId) return
    supabase
      .from("plants")
      .select("name, logo_url")
      .eq("id", plantId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.name) setPlantName(data.name)
        if (data?.logo_url) setLogoUrl(data.logo_url)
      })
  }, [plantId])

  useEffect(() => {
    if (unlocked) load()
  }, [unlocked, plantId])

  async function load() {
    const { data: techData } = await supabase
      .from("technicians")
      .select("id, name, phone, language, active")
      .eq("plant_id", plantId)
      .order("name")
    setTechs(techData || [])

    const { data: schedData } = await supabase
      .from("schedules")
      .select("*")
      .eq("plant_id", plantId)
    setSchedule(schedData || [])
  }

  function tryUnlock(e: React.FormEvent) {
    e.preventDefault()
    const expected = PLANT_PASSWORDS[plantId] || "admin"
    if (password === expected) {
      setUnlocked(true)
    } else {
      alert("Wrong password")
    }
  }

  function getShift(day: number) {
    return schedule.find(s => s.day_of_week === day) || {
      day_of_week: day,
      technician_id: "",
      start_time: "08:00",
      end_time: "16:00",
      plant_id: plantId
    }
  }

  function updateShift(day: number, field: string, value: string) {
    setSchedule(prev => {
      const existing = prev.find(s => s.day_of_week === day)
      if (existing) {
        return prev.map(s => s.day_of_week === day ? { ...s, [field]: value } : s)
      }
      return [...prev, { day_of_week: day, technician_id: "", start_time: "08:00", end_time: "16:00", plant_id: plantId, [field]: value }]
    })
  }

  async function saveSchedule() {
    setSaving(true)
    setMessage("")
    await supabase.from("schedules").delete().eq("plant_id", plantId)
    const rows = schedule
      .filter(s => s.technician_id)
      .map(s => ({
        plant_id: plantId,
        technician_id: s.technician_id,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time
      }))
    const { error } = await supabase.from("schedules").insert(rows)
    setSaving(false)
    setMessage(error ? error.message : "Schedule saved")
    if (!error) load()
  }

  async function addTech(e: React.FormEvent) {
    e.preventDefault()
    if (!newName || !newPhone) return
    const { error } = await supabase.from("technicians").insert({
      name: newName,
      phone: newPhone,
      language: newLang,
      plant_id: plantId,
      active: true
    })
    if (error) {
      alert(error.message)
      return
    }
    setNewName("")
    setNewPhone("")
    load()
  }

  async function toggleTech(id: string, active: boolean) {
    await supabase.from("technicians").update({ active: !active }).eq("id", id)
    load()
  }

  if (!unlocked) {
    return (
      <div className="max-w-sm mx-auto p-6 mt-20">
        <img src={logoUrl} alt="logo" className="h-12 mb-4" />
        <h1 className="text-xl font-bold mb-4">{plantName || plantId} Admin</h1>
        <form onSubmit={tryUnlock} className="space-y-3">
          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded">Unlock</button>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <img src={logoUrl} alt="logo" className="h-12 mb-4" />
      <h1 className="text-2xl font-bold mb-1">{plantName} Admin</h1>
      <p className="text-gray-600 mb-6">Manage technicians and the weekly schedule.</p>

      {/* Technicians */}
      <div className="mb-8 border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Technicians</h2>
        <div className="space-y-2 mb-4">
          {techs.map(t => (
            <div key={t.id} className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">{t.name}</span>
                <span className="text-gray-500 ml-2">{t.phone}</span>
                <span className="text-gray-400 ml-2">({t.language})</span>
              </div>
              <button
                onClick={() => toggleTech(t.id, t.active)}
                className={`text-xs px-2 py-1 rounded ${t.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
              >
                {t.active ? "Active" : "Inactive"}
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={addTech} className="flex gap-2 items-end">
          <input
            placeholder="Name"
            className="border rounded px-2 py-1 flex-1"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <input
            placeholder="Phone"
            className="border rounded px-2 py-1 w-36"
            value={newPhone}
            onChange={e => setNewPhone(e.target.value)}
          />
          <select
            className="border rounded px-2 py-1"
            value={newLang}
            onChange={e => setNewLang(e.target.value)}
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
          <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Add</button>
        </form>
      </div>

      {/* Schedule Editor */}
      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Weekly Schedule</h2>
        <div className="space-y-3">
          {DAYS.map((dayName, day) => {
            const shift = getShift(day)
            return (
              <div key={day} className="flex items-center gap-3">
                <div className="w-24 font-medium">{dayName}</div>
                <select
                  className="border rounded px-2 py-1 flex-1"
                  value={shift.technician_id || ""}
                  onChange={e => updateShift(day, "technician_id", e.target.value)}
                >
                  <option value="">— Off —</option>
                  {techs.filter(t => t.active).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <input
                  type="time"
                  className="border rounded px-2 py-1"
                  value={shift.start_time}
                  onChange={e => updateShift(day, "start_time", e.target.value)}
                />
                <span>to</span>
                <input
                  type="time"
                  className="border rounded px-2 py-1"
                  value={shift.end_time}
                  onChange={e => updateShift(day, "end_time", e.target.value)}
                />
              </div>
            )
          })}
        </div>

        <button
          onClick={saveSchedule}
          disabled={saving}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Schedule"}
        </button>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </div>

      {/* Current Saved Schedule */}
      <div className="mt-8 border rounded-lg p-4 bg-gray-50">
        <h2 className="font-semibold mb-3">Current Saved Schedule</h2>
        {schedule.filter(s => s.technician_id).length === 0 ? (
          <p className="text-gray-500 text-sm">No schedule saved yet.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {DAYS.map((dayName, day) => {
              const shift = schedule.find(s => s.day_of_week === day && s.technician_id)
              if (!shift) return null
              const tech = techs.find(t => t.id === shift.technician_id)
              return (
                <div key={day} className="flex justify-between">
                  <span className="font-medium">{dayName}</span>
                  <span>{tech?.name || "Unknown"} — {shift.start_time} to {shift.end_time}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PlantAdminPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <PlantAdmin />
    </Suspense>
  )
}