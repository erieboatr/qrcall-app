import Link from 'next/link'
import { MarketingShell } from '@/components/marketing-shell'
import { StatusBoardPreview } from '@/components/status-board-preview'
import { DEFAULT_DESCRIPTION, HOME_TITLE, pageMetadata } from '@/lib/site'

export const metadata = pageMetadata({
  title: HOME_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: '/',
  absolute: true,
})

export default function HomePage() {
  return (
    <MarketingShell>
      <section className="mx-auto grid max-w-5xl items-center gap-12 px-4 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            QR code service calls for maintenance teams
          </h1>
          <p className="mt-5 text-lg text-gray-600">
            Technicians scan a QR code on equipment to log a service call in seconds. Calls show
            on a live color-coded shop board, and only on-duty techs get SMS alerts. English and
            Spanish.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/board?plant=demo"
              className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
            >
              See a live demo
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-900 hover:bg-gray-50"
            >
              View pricing
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-900 hover:bg-gray-50"
            >
              Contact sales
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Technician?{' '}
            <Link href="/tech-signup" className="font-medium text-red-700 underline">
              Join SMS alerts
            </Link>
          </p>
        </div>
        <StatusBoardPreview />
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Products & Services</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-2 text-xl font-bold">QR Code Alerts</h3>
              <p>
                Scan a code on any machine to open a pre-filled service call form. English &
                Spanish supported.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-2 text-xl font-bold">Live Status Board</h3>
              <p>
                Color-coded board (Critical / High / Medium / Low) visible in the shop. Updates in
                real time.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-2 text-xl font-bold">On-Duty SMS Alerts</h3>
              <p>Only technicians scheduled on duty receive text messages. No more missed calls.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Contact Us</h2>
        <div className="space-y-2 text-center">
          <p>QRcall.app</p>
          <p>1269 Highbridge Road, Vermilion, Ohio 44089</p>
          <p>
            Email:{' '}
            <a href="mailto:sales@qrcall.app" className="text-red-600">
              sales@qrcall.app
            </a>
          </p>
          <p>Phone: +1 (216) 200-3264</p>
        </div>
      </section>
    </MarketingShell>
  )
}
