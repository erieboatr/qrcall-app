import Link from 'next/link'
import { MarketingShell } from '@/components/marketing-shell'

export function NotFoundContent() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-3 text-gray-600">That address isn’t a QRcall page or a plant we recognize.</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
        >
          Back to home
        </Link>
      </div>
    </MarketingShell>
  )
}
