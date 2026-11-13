"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PlantPage() {
  const params = useParams()
  const plantId = params.plant as string

  const [plantName, setPlantName] = useState("")
  const [logoUrl, setLogoUrl] = useState("/logo.png")

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <img src={logoUrl} alt="logo" className="h-20 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-2">{plantName || plantId}</h1>
        <p className="text-gray-600 mb-8">QRcall Service Alerts</p>

        <div className="space-y-3">
          <a
            href={`/board?plant=${plantId}`}
            className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Live Status Board
          </a>
          <a
            href={`/tech-signup/sms?plant=${plantId}`}
            className="block w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            Tech Signup
          </a>
          <a
            href={`/${plantId}/admin`}
            className="block w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900"
          >
            Admin
          </a>
        </div>
      </div>
    </div>
  )
}