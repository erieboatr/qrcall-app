import { MarketingShell } from '@/components/marketing-shell'
import { pageMetadata } from '@/lib/site'

export const metadata = pageMetadata({
  title: 'About',
  description:
    'QRcall is a QR-code service call system for maintenance teams. Scan equipment, watch a live color-coded board, and alert only the technicians on duty.',
  path: '/about',
})

export default function AboutPage() {
  return (
    <MarketingShell current="about">
      <article className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-6 text-3xl font-bold">About QRcall.app</h1>
        <p className="mb-4">
          QRcall.app is a simple QR-code service call system built for maintenance teams in
          manufacturing, packaging, food processing, HVAC, plumbing, and appliance repair.
        </p>
        <p className="mb-4">
          Technicians scan a QR code on any piece of equipment to submit a service call in
          seconds. The call appears instantly on a live color-coded status board in the shop. Only
          the technicians who are actually on duty receive an SMS alert.
        </p>
        <p className="mb-4">
          We help plants reduce downtime, eliminate missed calls, and give supervisors clear
          visibility without adding complicated software.
        </p>
        <p className="mt-8 text-sm text-gray-600">
          QRcall.app
          <br />
          1269 Highbridge Road
          <br />
          Vermilion, Ohio 44089
          <br />
          <a href="mailto:sales@qrcall.app" className="text-red-700 underline">
            sales@qrcall.app
          </a>
          <br />
          +1 (216) 200-3264
        </p>
      </article>
    </MarketingShell>
  )
}
