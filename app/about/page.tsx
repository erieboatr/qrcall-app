import Link from 'next/link'

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="QRcall" className="h-10" />
            <span className="font-bold text-xl">QRcall</span>
          </Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/about" className="hover:underline font-semibold">About</Link>
            <Link href="/pricing" className="hover:underline">Pricing</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">About QRcall.app</h1>
        <p className="mb-4">
          QRcall.app is a simple QR-code service call system built for maintenance teams in manufacturing, packaging, food processing, HVAC, plumbing, and appliance repair.
        </p>
        <p className="mb-4">
          Technicians scan a QR code on any piece of equipment to submit a service call in seconds. The call appears instantly on a live color-coded status board in the shop. Only the technicians who are actually on duty receive an SMS alert.
        </p>
        <p className="mb-4">
          We help plants reduce downtime, eliminate missed calls, and give supervisors clear visibility without adding complicated software.
        </p>
        <p className="mt-8 text-sm text-gray-600">
          QRcall.app<br />
          1269 Highbridge Road<br />
          Vermilion, Ohio 44089<br />
          sales@qrcall.app<br />
          +1 (216) 200-3264
        </p>
      </main>
      <footer className="border-t mt-12 py-6 text-center text-sm text-gray-600">
  <div className="space-x-4">
    <a href="/tech-signup/terms" className="text-red-700 underline font-medium hover:text-red-900">
      Terms and Conditions
    </a>
    <span className="text-gray-400">|</span>
    <a href="/tech-signup/privacy" className="text-red-700 underline font-medium hover:text-red-900">
      Privacy Policy
    </a>
  </div>
  <p className="mt-2">&copy; 2026 QRcall.app. All rights reserved.</p>
</footer>
    </div>
  )
}
