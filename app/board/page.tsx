"use client"

import { Suspense, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useSearchParams } from "next/navigation"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Call = {
  id: string
  equipment_name: string
  location: string
  priority: string
  description: string
  status: string
  submitted_at: string
  arrived_at?: string
  updated_at?: string
  photo_url?: string
  plant_id?: string
  submitter_name?: string
}

function BoardContent() {
  const searchParams = useSearchParams()
  const plant = searchParams.get("plant") || ""
  const [calls, setCalls] = useState<Call[]>([])
  const [onDuty, setOnDuty] = useState<string[]>([])
  const [logoUrl, setLogoUrl] = useState("/logo.png")

  useEffect(() => {
    const p = plant || "default"

    async function loadLogo() {
      const { data } = await supabase
        .from("plants")
        .select("logo_url")
        .eq("id", p)
        .maybeSingle()
      if (data?.logo_url) setLogoUrl(data.logo_url)
    }

    async function loadCalls() {
      let query = supabase
        .from("service_calls")
        .select("*")
        .in("status", ["Waiting", "Arrived", "Needs More Work"])
        .order("submitted_at", { ascending: false })

      if (plant) query = query.eq("plant_id", plant)

      const { data } = await query
      setCalls(data || [])
    }

    async function loadOnDuty() {
      const now = new Date()
      const dayOfWeek = now.getUTCDay()
      const currentTime = now.toISOString().slice(11, 16)

      const { data } = await supabase
        .from("schedules")
        .select("technicians(name)")
        .eq("plant_id", p)
        .eq("day_of_week", dayOfWeek)
        .lte("start_time", currentTime)
        .gte("end_time", currentTime)

      if (data) {
        const names = data.map((row: any) => row.technicians?.name).filter(Boolean)
        setOnDuty(names)
      }
    }

    loadLogo()
    loadCalls()
    loadOnDuty()

    const channel = supabase
      .channel("board-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_calls" },
        () => {
          loadCalls()
          loadOnDuty()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [plant])

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-600"
      case "High": return "bg-orange-500"
      case "Medium": return "bg-yellow-500"
      case "Low": return "bg-green-600"
      default: return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <img src={logoUrl} alt="logo" className="h-16 object-contain" />
        <div className="text-right">
          <h1 className="text-4xl font-bold">Live Status Board</h1>
          <p className="text-xl text-gray-300">Plant: {plant || "All"}</p>
          <p className="text-lg text-gray-400">
            On duty: {onDuty.length > 0 ? onDuty.join(", ") : "No one currently scheduled"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {calls.length === 0 && (
          <div className="text-center text-3xl text-gray-400 py-20">
            No open service calls
          </div>
        )}

        {calls.map((call) => (
          <div
            key={call.id}
            className="flex items-stretch gap-6 bg-gray-800 rounded-xl p-5 shadow-lg"
          >
            <div className={`w-3 rounded ${priorityColor(call.priority)}`} />

            <div className="flex-1">
              <div className="text-3xl font-bold">{call.equipment_name}</div>
              <div className="text-xl text-gray-300">{call.location}</div>
              <div className="text-lg mt-1 font-semibold">
                {call.priority} • {call.status}
              </div>

              {call.description && (
                <div className={`mt-2 ${call.status === "Needs More Work" ? "p-3 bg-orange-900/40 border border-orange-500 rounded-lg" : "text-gray-300"}`}>
                  {call.status === "Needs More Work" && (
                    <div className="text-sm font-semibold text-orange-300 mb-1">Additional work needed:</div>
                  )}
                  <div>{call.description}</div>
                </div>
              )}

              {call.submitter_name && (
                <div className="text-sm mt-2 text-gray-400">
                  Submitted by: {call.submitter_name}
                </div>
              )}
            </div>

            <div className="text-right text-base text-gray-300 min-w-[220px]">
              <div>
                <span className="text-gray-400">Submitted:</span><br />
                {call.submitted_at ? new Date(call.submitted_at).toLocaleString() : "—"}
              </div>
              {call.arrived_at && (
                <div className="mt-2">
                  <span className="text-gray-400">Arrived:</span><br />
                  {new Date(call.arrived_at).toLocaleString()}
                </div>
              )}
              {call.status === "Needs More Work" && call.updated_at && (
                <div className="mt-2">
                  <span className="text-gray-400">More Work:</span><br />
                  {new Date(call.updated_at).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BoardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 text-white flex items-center justify-center text-2xl">Loading board…</div>}>
      <BoardContent />
    </Suspense>
  )
}