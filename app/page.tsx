"use client"

import { Suspense, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useSearchParams } from "next/navigation"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function BoardContent() {
  const searchParams = useSearchParams()
  const plant = searchParams.get("plant") || ""
  const [calls, setCalls] = useState<any[]>([])
  const [onDuty, setOnDuty] = useState<string>("Loading…")
  const [logo, setLogo] = useState("/logo.png")

  useEffect(() => {
    if (plant) {
      supabase
        .from("plants")
        .select("logo_url")
        .eq("id", plant)
        .single()
        .then(({ data }) => {
          if (data?.logo_url) setLogo(data.logo_url)
        })
    }

    const load = async () => {
      let query = supabase
        .from("service_calls")
        .select("*")
        .neq("status", "Completed")
        .order("created_at", { ascending: false })

      if (plant) query = query.eq("plant_id", plant)

      const { data } = await query
      setCalls(data || [])
    }

    load()

    const channel = supabase
      .channel("board")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_calls" },
        () => load()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [plant])

  const priorityColor = (p: string) => {
    if (p === "Critical") return "bg-red-600"
    if (p === "High") return "bg-orange-500"
    if (p === "Medium") return "bg-yellow-500"
    return "bg-blue-500"
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <img src={logo} alt="Plant logo" className="h-16 object-contain" />
        <div className="text-right">
          <h1 className="text-4xl font-bold">Live Status Board</h1>
          <p className="text-xl text-gray-300">Plant: {plant || "All"}</p>
          <p className="text-lg text-gray-400">On duty: {onDuty}</p>
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
            className="flex items-center gap-6 bg-gray-800 rounded-xl p-5 shadow-lg"
          >
            <div className={`w-4 h-24 rounded ${priorityColor(call.priority)}`} />
            <div className="flex-1">
              <div className="text-3xl font-bold">{call.equipment_name}</div>
              <div className="text-xl text-gray-300">{call.location}</div>
              <div className="text-lg mt-1">
                {call.priority} • {call.status}
              </div>
            </div>
            <div className="text-right text-lg text-gray-400">
              <div>{call.submitter_name}</div>
              <div>{new Date(call.created_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Board() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 text-white p-6 text-2xl">Loading board…</div>}>
      <BoardContent />
    </Suspense>
  )
}