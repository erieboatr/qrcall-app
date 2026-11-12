"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

// Temporary plant passwords
const PLANT_PASSWORDS: Record<string, string> = {
  ppi: "ppi2026",
  QRcall: "qrcall2026",
}

type Tech = {
  id: string
  name: string
  phone: string
  language: string
  active: boolean
}

type ScheduleRow = {
  technician_id: string
  day_of_week: number
  start_time: string
  end_time: string
  plant_id: string
}

function PlantAdmin() {
  const searchParams = useSearchParams()
  const plantId = searchParams.get("plant") || "ppi"

  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState("")
  const [plantName, setPlantName] = useState("")
  const [logoUrl, setLogoUrl] = useState("/logo.png")
  const [techs, setTechs] = useState<Tech[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  // Temporary schedule edits (per tech)
  const [techSchedules, setTechSchedules] = useState<
    Record<string, { days: number[]; start: string; end: string }>
  >({})

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

    const techsList = techData || []
    setTechs(techsList)

    const { data: schedData } = await supabase
      .from("schedules")
      .select("*")
      .eq("plant_id", plantId)

    const scheduleList = schedData || []

    // Build easy-to-edit structure from existing schedule rows
    const byTech: Record<string, { days: number[]; start: string; end: string }> = {}

    techsList.forEach((t) => {
      const rows = scheduleList.filter((s) => s.technician_id === t.id)
      if (rows.length > 0) {
        byTech[t.id] = {
          days: rows.map((r) => r.day_of_week).sort(),
          start: rows[0].start_time?.slice(0, 5) || "06:00",
          end: rows[0].end_time?.slice(0, 5) || "14:30",
        }
      } else {
        byTech[t.id] = { days: [], start: "06:00", end: "14:30" }
      }
    })

    setTechSchedules(byTech)
  }

  function tryUnlock(e: React.FormEvent) {
    e.preventDefault()
    const expected = PLANT_PASSWORDS[plantId] || "admin"
    if (password === expected) setUnlocked(true)
    else alert("Wrong password")
  }

  function toggleDay(techId: string, day: number) {
    setTechSchedules((prev) => {
      const current = prev[techId] || { days: [], start: "06:00", end: "14:30" }
      const days = current.days.includes(day)
        ? current.days.filter((d) => d !== day)
        : [...current.days, day].sort()
      return { ...prev, [techId]: { ...current, days } }
    })
  }

  function updateTime(techId: string, field: "start" | "end", value: string) {
    setTechSchedules((prev) => {
      const current = prev[techId] || { days: [], start: "06:00", end: "14:30" }
      return { ...prev, [techId]: { ...current, [field]: value } }
    })
  }

  async function saveSchedule() {
    setSaving(true)
    setMessage("")

    // Delete existing schedules for this plant
    await supabase.from("schedules").delete().eq("plant_id", plantId)

    // Build new rows from the simple per-tech form
    const rows: ScheduleRow[] = []
    Object.entries(techSchedules).forEach(([techId, conf]) => {
      conf.days.forEach((day) => {
        rows.push({
          plant_id: plantId,
          technician_id: techId,
          day_of_week: day,
          start_time: conf.start,
          end_time: conf.end,
        })
      })
    })

    const { error } = await supabase.from("schedules").insert(rows)
    setSaving(false)
    setMessage(error ? error.message : "Schedule saved successfully")
    if (!error) load()
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
            onChange={(e) => setPassword(e.target.value)}
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
      <p className="text-gray-600 mb-6">Manage technicians and their weekly schedules.</p>

      {/* Technicians */}
      <div className="mb-8 border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Technicians</h2>
          <a
            href={`/tech-signup/sms?plant=${plantId}`}
            target="_blank"
            className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700"
          >
            + Invite Technician
          </a>
        </div>

        {techs.length === 0 ? (
          <p className="text-sm text-gray-500">
            No technicians yet. Use the “Invite Technician” button so they can sign up with SMS consent.
          </p>
        ) : (
          <div className="space-y-2">
            {techs.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm border-b pb-2">
                <div>
                  <span className="font-medium">{t.name}</span>
                  <span className="text-gray-500 ml-2">{t.phone}</span>
                  <span className="text-gray-400 ml-2">({t.language})</span>
                </div>
                <button
                  onClick={() => toggleTech(t.id, t.active)}
                  className={`text-xs px-2 py-1 rounded ${
                    t.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {t.active ? "Active" : "Inactive"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simple Schedule Editor - per employee */}
      <div className="border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-1">Weekly Schedule</h2>
        <p className="text-sm text-gray-500 mb-4">
          For each person, check the days they work and set their hours.
        </p>

        <div className="space-y-6">
          {techs
            .filter((t) => t.active)
            .map((tech) => {
              const conf = techSchedules[tech.id] || {
                days: [],
                start: "06:00",
                end: "14:30",
              }

              return (
                <div key={tech.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="font-medium text-lg mb-3">{tech.name}</div>

                  {/* Days */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {DAYS.map((dayName, dayIndex) => {
                      const checked = conf.days.includes(dayIndex)
                      return (
                        <label
                          key={dayIndex}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded border cursor-pointer text-sm ${
                            checked
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white border-gray-300 hover:border-blue-400"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={checked}
                            onChange={() => toggleDay(tech.id, dayIndex)}
                          />
                          {dayName.slice(0, 3)}
                        </label>
                      )
                    })}
                  </div>

                  {/* Times */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600">Hours:</label>
                    <input
                      type="time"
                      className="border rounded px-2 py-1"
                      value={conf.start}
                      onChange={(e) => updateTime(tech.id, "start", e.target.value)}
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      className="border rounded px-2 py-1"
                      value={conf.end}
                      onChange={(e) => updateTime(tech.id, "end", e.target.value)}
                    />
                  </div>
                </div>
              )
            })}
        </div>

        {techs.filter((t) => t.active).length === 0 && (
          <p className="text-gray-500 text-sm">No active technicians yet.</p>
        )}

        <button
          onClick={saveSchedule}
          disabled={saving || techs.filter((t) => t.active).length === 0}
          className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Schedule"}
        </button>
        {message && <p className="mt-2 text-sm">{message}</p>}
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