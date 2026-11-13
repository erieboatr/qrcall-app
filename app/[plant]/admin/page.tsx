"use client"

import { Suspense, useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const PLANT_PASSWORDS: Record<string, string> = {
  ppi: "ppi2026",
  QRcall: "tomatoes11",
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

type Override = {
  id?: string
  override_date: string
  technician_id: string
  start_time: string | null
  end_time: string | null
  plant_id: string
}

function PlantAdmin() {
  const params = useParams()
  const plantId = (params.plant as string) || "ppi"

  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState("")
  const [plantName, setPlantName] = useState("")
  const [logoUrl, setLogoUrl] = useState("/logo.png")
  const [techs, setTechs] = useState<Tech[]>([])
  const [techSchedules, setTechSchedules] = useState<
    Record<string, { days: number[]; start: string; end: string }>
  >({})
  const [overrides, setOverrides] = useState<Override[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [editingDay, setEditingDay] = useState<string | null>(null)

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

    const { data: overrideData } = await supabase
      .from("schedule_overrides")
      .select("*")
      .eq("plant_id", plantId)

    setOverrides(overrideData || [])
  }

  function tryUnlock(e: React.FormEvent) {
    e.preventDefault()
    const normalized = plantId.toLowerCase()
    const key = Object.keys(PLANT_PASSWORDS).find(
      (k) => k.toLowerCase() === normalized
    )
    const expected = key ? PLANT_PASSWORDS[key] : "admin"
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

  async function saveWeeklyRules() {
    setSaving(true)
    setMessage("")

    await supabase.from("schedules").delete().eq("plant_id", plantId)

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
    setMessage(error ? error.message : "Weekly rules saved")
    if (!error) load()
  }

  async function toggleTech(id: string, active: boolean) {
    await supabase.from("technicians").update({ active: !active }).eq("id", id)
    load()
  }

  function getDaysInMonth(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { year, month, daysInMonth }
  }

  function getScheduleForDate(dateStr: string) {
    const date = new Date(dateStr + "T12:00:00")
    const dayOfWeek = date.getDay()

    const overrideMap = new Map<string, Override>()
    overrides
      .filter((o) => o.override_date === dateStr)
      .forEach((o) => overrideMap.set(o.technician_id, o))

    const result: { techId: string; start: string; end: string; isOverride: boolean }[] = []

    Object.entries(techSchedules).forEach(([techId, conf]) => {
      if (conf.days.includes(dayOfWeek)) {
        const override = overrideMap.get(techId)
        if (override) {
          if (override.start_time && override.end_time) {
            result.push({
              techId,
              start: override.start_time.slice(0, 5),
              end: override.end_time.slice(0, 5),
              isOverride: true,
            })
          }
        } else {
          result.push({
            techId,
            start: conf.start,
            end: conf.end,
            isOverride: false,
          })
        }
      }
    })

    overrideMap.forEach((override, techId) => {
      if (!result.find((r) => r.techId === techId) && override.start_time && override.end_time) {
        result.push({
          techId,
          start: override.start_time.slice(0, 5),
          end: override.end_time.slice(0, 5),
          isOverride: true,
        })
      }
    })

    return result
  }

  async function saveOverride(dateStr: string, techId: string, start: string, end: string) {
    const existing = overrides.find(
      (o) => o.override_date === dateStr && o.technician_id === techId
    )

    if (existing?.id) {
      await supabase
        .from("schedule_overrides")
        .update({ start_time: start || null, end_time: end || null })
        .eq("id", existing.id)
    } else {
      await supabase.from("schedule_overrides").insert({
        plant_id: plantId,
        override_date: dateStr,
        technician_id: techId,
        start_time: start || null,
        end_time: end || null,
      })
    }
    load()
  }

  async function removeOverride(dateStr: string, techId: string) {
    await saveOverride(dateStr, techId, "", "")
  }

  function formatDate(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  function printSchedule() {
    window.print()
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

  const { year, month, daysInMonth } = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" })

  const weeks: { day: number; dateStr: string; dayName: string }[][] = []
  let currentWeek: { day: number; dateStr: string; dayName: string }[] = []
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  for (let i = 0; i < firstDayOfMonth; i++) {
    currentWeek.push({ day: 0, dateStr: "", dayName: DAYS[i].slice(0, 3) })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateStr = formatDate(year, month, day)
    currentWeek.push({
      day,
      dateStr,
      dayName: DAYS[date.getDay()].slice(0, 3),
    })

    if (currentWeek.length === 7 || day === daysInMonth) {
      while (currentWeek.length < 7) {
        currentWeek.push({ day: 0, dateStr: "", dayName: "" })
      }
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 print:p-2">
      <style jsx global>{`
        @media print {
          @page {
            size: letter landscape;
            margin: 0.4in;
          }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
          }
          .no-print { display: none !important; }
          table { font-size: 10px; }
          th, td { padding: 2px 4px !important; }
        }
      `}</style>

      <div className="no-print">
        <img src={logoUrl} alt="logo" className="h-12 mb-4" />
        <h1 className="text-2xl font-bold mb-1">{plantName} Admin</h1>
        <p className="text-gray-600 mb-6">Manage technicians and schedules.</p>

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
            <p className="text-sm text-gray-500">No technicians yet.</p>
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

        <div className="border rounded-lg p-4 mb-6">
          <h2 className="font-semibold mb-1">Weekly Rules (Normal Pattern)</h2>
          <p className="text-sm text-gray-500 mb-4">
            Set the usual days and hours. These are used when generating the month.
          </p>
          <div className="space-y-6">
            {techs.filter((t) => t.active).map((tech) => {
              const conf = techSchedules[tech.id] || { days: [], start: "06:00", end: "14:30" }
              return (
                <div key={tech.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="font-medium text-lg mb-3">{tech.name}</div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {DAYS.map((dayName, dayIndex) => {
                      const checked = conf.days.includes(dayIndex)
                      return (
                        <label
                          key={dayIndex}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded border cursor-pointer text-sm ${
                            checked
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white border-gray-300"
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
          <button
            onClick={saveWeeklyRules}
            disabled={saving}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Weekly Rules"}
          </button>
          {message && <p className="mt-2 text-sm">{message}</p>}
        </div>
      </div>

      <div className="print-area">
        <div className="flex items-center justify-between mb-4 no-print">
          <h2 className="font-semibold text-xl">{monthName}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
              className="px-3 py-1 border rounded"
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
              className="px-3 py-1 border rounded"
            >
              Next →
            </button>
            <button onClick={printSchedule} className="px-3 py-1 bg-gray-800 text-white rounded">
              Print
            </button>
          </div>
        </div>

        <div className="hidden print:block text-center mb-6">
          <h1 className="text-2xl font-bold">{plantName} — {monthName}</h1>
        </div>

        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="mb-8 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-100 text-left min-w-[140px] sticky left-0 bg-white">Name</th>
                  {week.map((d, i) => (
                    <th key={i} className="border p-2 bg-gray-100 text-center min-w-[80px]">
                      {d.day > 0 ? (
                        <>
                          <div className="font-semibold">{d.day}</div>
                          <div className="text-xs text-gray-500">{d.dayName}</div>
                        </>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {techs.filter(t => t.active).map((tech) => (
                  <tr key={tech.id}>
                    <td className="border p-2 font-medium sticky left-0 bg-white">{tech.name}</td>
                    {week.map((d, i) => {
                      if (d.day === 0) {
                        return <td key={i} className="border bg-gray-50" />
                      }

                      const shifts = getScheduleForDate(d.dateStr).filter(s => s.techId === tech.id)
                      const shift = shifts[0]
                      const isEditing = editingDay === `${d.dateStr}-${tech.id}`

                      return (
                        <td
                          key={i}
                          className="border p-1 text-center cursor-pointer relative"
                          onClick={() => setEditingDay(isEditing ? null : `${d.dateStr}-${tech.id}`)}
                        >
                          {shift ? (
                            <div className="text-xs leading-tight">
                              {shift.start}<br />{shift.end}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">OFF</span>
                          )}

                          {isEditing && (
                            <div className="absolute z-20 mt-1 left-0 bg-white border shadow-lg p-3 rounded no-print" style={{ minWidth: "180px" }}>
                              <div className="text-xs font-semibold mb-2">
                                {tech.name}<br />{d.dateStr}
                              </div>
                              <div className="flex flex-col gap-2">
                                <input
                                  type="time"
                                  defaultValue={shift?.start || "08:00"}
                                  className="border rounded px-1 text-xs"
                                  id={`edit-start-${tech.id}-${d.day}`}
                                />
                                <input
                                  type="time"
                                  defaultValue={shift?.end || "16:00"}
                                  className="border rounded px-1 text-xs"
                                  id={`edit-end-${tech.id}-${d.day}`}
                                />
                                <button
                                  className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const start = (document.getElementById(`edit-start-${tech.id}-${d.day}`) as HTMLInputElement)?.value
                                    const end = (document.getElementById(`edit-end-${tech.id}-${d.day}`) as HTMLInputElement)?.value
                                    if (start && end) {
                                      saveOverride(d.dateStr, tech.id, start, end)
                                      setEditingDay(null)
                                    }
                                  }}
                                >
                                  Save
                                </button>
                                <button
                                  className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeOverride(d.dateStr, tech.id)
                                    setEditingDay(null)
                                  }}
                                >
                                  Mark OFF
                                </button>
                                <button
                                  className="text-xs text-gray-500"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingDay(null)
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
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