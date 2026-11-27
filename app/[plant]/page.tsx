import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getPlant } from '@/lib/plants'
import { pageMetadata } from '@/lib/site'

export const instant = false

type PlantRouteProps = {
  params: Promise<{ plant: string }>
}

export async function generateMetadata({ params }: PlantRouteProps): Promise<Metadata> {
  const { plant } = await params
  const record = await getPlant(plant)
  if (!record) {
    return { title: 'Plant not found' }
  }
  return pageMetadata({
    title: record.name,
    description: `QRcall service alerts for ${record.name}. Open the live status board or sign technicians up for on-duty SMS alerts.`,
    path: `/${record.id}`,
  })
}

export default async function PlantPage({ params }: PlantRouteProps) {
  const { plant } = await params
  const record = await getPlant(plant)
  if (!record) notFound()
  if (record.id !== plant) redirect(`/${record.id}`)

  const logo = record.logo_url || '/logo.png'

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        <img src={logo} alt={`${record.name} logo`} className="mx-auto mb-6 h-20 w-auto" />
        <h1 className="mb-2 text-3xl font-bold">{record.name}</h1>
        <p className="mb-8 text-gray-600">QRcall Service Alerts</p>

        <div className="space-y-3">
          <a
            href={`/board?plant=${encodeURIComponent(record.id)}`}
            className="block w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Live Status Board
          </a>
          <a
            href={`/tech-signup/sms?plant=${encodeURIComponent(record.id)}`}
            className="block w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
          >
            Tech Signup
          </a>
          <a
            href={`/${record.id}/admin`}
            className="block w-full rounded-lg bg-gray-800 py-3 font-semibold text-white hover:bg-gray-900"
          >
            Admin
          </a>
        </div>
      </div>
    </main>
  )
}
