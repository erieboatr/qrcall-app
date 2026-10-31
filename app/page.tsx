"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Call = {
  id: string
  equipment_name: string
  location: string
  priority: string
  status: string
  submitted_at: string
  arrived_at?: string
  description?: string
  submitter_name?: string
}

export default function HomePage() {
  const [calls, setCalls] = useState<Call[]>([])
  const [logoUrl, setLogoUrl] = useState("/logo.png")

  useEffect(() => {
    async function load() {
      // Load QRcall logo
      const { data: plant } = await supabase
        .from("plants")
        .select("logo_url")
        .eq("id", "QRcall")
        .maybeSingle()
      if (plant?.logo_url) setLogoUrl(plant.logo_url)

      // Load open QRcall calls
      const { data } = await supabase
        .from("service_calls")
        .select("*")
        .eq("plant_id", "QRcall")
        .in("status", ["Waiting", "Arrived", "Needs More Work"])
        .order("submitted_at", { ascending: false })
        .limit(3)
      setCalls(data || [])
    }
    load()

    const channel = supabase
      .channel("homepage-board")
      .on("postgres_changes", { event: "*", schema: "public", table: "service_calls" }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const priorityColor = (p: string) => {
    if (p === "Critical") return "bg-red-500"
    if (p === "High") return "bg-orange-500"
    if (p === "Medium") return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <img src={logoUrl} alt="QRcall" className="h-8" />
          <span className="font-bold text-xl">QRcall.app</span>
        </div>
        <div className="flex gap-6 text-sm">
          <a href="/pricing" className="hover:text-blue-600">Pricing</a>
          <a href="/contact" className="hover:text-blue-600">Contact</a>
          <a href="/board?plant=QRcall" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Live Demo</a>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            QR Code Service Calls<br />
            <span className="text-blue-600">for Maintenance Teams</span>
          </h1>
          <p className="mt-4 text-gray-600 text-lg">
            Scan a QR code on any machine to submit a service call in seconds. 
            Technicians get instant alerts. Supervisors see a live status board.
          </p>

          {/* Demo QR */}
          <div className="mt-8 inline-block border rounded-xl p-4 bg-gray-50">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://qrcall.app/call?plant=QRcall%26equip=Centrifuge%202%26loc=FC%20Processing"
              alt="Demo QR"
              className="mx-auto"
            />
            <p className="text-center text-sm mt-2 font-medium">Scan for Service Call</p>
            <p className="text-center text-xs text-gray-500">Centrifuge 2 • Demo</p>
          </div>
        </div>

        {/* Live board preview */}
        <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Live Calls</h2>
            <span className="text-xs text-green-400">● Auto-refresh</span>
          </div>
          {calls.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No open demo calls</p>
          ) : (
            calls.map((call) => (
              <div key={call.id} className="bg-gray-800 rounded-lg p-4 mb-3 flex gap-3">
                <div className={`w-1.5 rounded ${priorityColor(call.priority)}`} />
                <div className="flex-1">
                  <div className="font-bold">{call.equipment_name}</div>
                  <div className="text-sm text-gray-300">{call.location}</div>
                  <div className="text-sm mt-1">{call.priority} • {call.status}</div>
                </div>
              </div>
            ))
          )}
          <a href="/board?plant=QRcall" className="block text-center text-sm text-blue-400 mt-2 hover:underline">
            View full board →
          </a>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-4 pb-16">
        <a href="/pricing" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium">See Pricing →</a>
        <a href="/contact" className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium">Contact Sales →</a>
      </div>
    </div>
  )
}