import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import PlantAdminPage from './admin-client'
import { getPlant } from '@/lib/plants'
import { pageMetadata } from '@/lib/site'

export const instant = false

type PlantAdminRouteProps = {
  params: Promise<{ plant: string }>
}

export async function generateMetadata({ params }: PlantAdminRouteProps): Promise<Metadata> {
  const { plant } = await params
  const record = await getPlant(plant)
  if (!record) {
    return { title: 'Plant not found' }
  }
  return pageMetadata({
    title: `${record.name} Admin`,
    description: `Manage technicians and on-duty schedules for ${record.name}.`,
    path: `/${record.id}/admin`,
  })
}

export default async function PlantAdminRoute({ params }: PlantAdminRouteProps) {
  const { plant } = await params
  const record = await getPlant(plant)
  if (!record) notFound()
  if (record.id !== plant) redirect(`/${record.id}/admin`)

  return (
    <main>
      <PlantAdminPage />
    </main>
  )
}
