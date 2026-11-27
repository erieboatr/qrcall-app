import { cache } from 'react'
import { createClient } from '@supabase/supabase-js'

export type PlantRecord = {
  id: string
  name: string
  logo_url: string | null
}

const DEMO_PLANT: PlantRecord = {
  id: 'demo',
  name: 'Demo',
  logo_url: null,
}

type PlantRow = {
  id: string
  name: string | null
  logo_url: string | null
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`)
}

function toRecord(row: PlantRow): PlantRecord {
  return {
    id: row.id,
    name: row.name?.trim() || row.id,
    logo_url: row.logo_url,
  }
}

/**
 * Resolve a plant portal slug.
 * Real plants come from the `plants` table (matched case-insensitively; callers
 * should redirect to the canonical id). `/demo` stays available as the public
 * demo even when that slug is not a database row. Unknown slugs return null.
 */
export const getPlant = cache(async (slug: string): Promise<PlantRecord | null> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Supabase environment variables are not configured.')
  }

  const supabase = createClient(url, key)
  const { data, error } = await supabase
    .from('plants')
    .select('id, name, logo_url')
    .ilike('id', escapeLike(slug))

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as PlantRow[]
  const match =
    rows.find((row) => row.id === slug) ??
    rows.find((row) => row.id.toLowerCase() === slug.toLowerCase())

  if (match) return toRecord(match)
  if (slug.toLowerCase() === 'demo') return DEMO_PLANT
  return null
})
