'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function PlantHomeContent() {
  const params = useParams()
  const plantId = params.plant as string

  const [plant, setPlant] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!plantId) return
    supabase
      .from('plants')
      .select('*')
      .eq('id', plantId)
      .maybeSingle()
      .then(({ data }) => {
        setPlant(data)
        setLoading(false)
      })
  }, [plantId])

  if (loading) return <div className="p-8 text-center">Loading…</div>
  if (!plant) return <div className="p-8 text-center">Plant not found</div>

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <img
        src={plant.logo_url || '/logo.png'}
        alt={plant.name}
        className="h-20 mb-6"
      />
      <h1 className="text-3xl font-bold mb-2">{plant.name}</h1>
      {plant.city && (
        <p className="text-gray-600 mb-6">
          {plant.city}{plant.state ? `, ${plant.state}` : ''}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={`/board?plant=${plantId}`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-center"
        >
          View Live Board
        </Link>
        <Link
          href={`/${plantId}/admin`}
          className="bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold text-center"
        >
          Admin
        </Link>
      </div>

      {plant.poc && (
        <div className="mt-10 text-sm text-gray-600 text-center">
          <p>Contact: {plant.poc}</p>
          {plant.phone && <p>{plant.phone}</p>}
        </div>
      )}
    </div>
  )
}

export default function PlantHomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
      <PlantHomeContent />
    </Suspense>
  )
}