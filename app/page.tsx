'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="QRcall" className="h-10" />
            <span className="font-bold text-xl">QRcall</span>
          </div>
          <nav className="flex gap-6 text-sm">
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/pricing" className="hover:underline">Pricing</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <Link href="/tech-signup" className="bg-red-600 text-white px-4 py-2 rounded">Tech Signup</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">QR Code Service Call System</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Technicians scan a QR code on equipment to submit a service call in seconds. 
          The call appears instantly on a live status board. Only on-duty technicians receive SMS alerts.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/tech-signup" className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold">
            Join Alerts
          </Link>
          <Link href="/pricing" className="border border-gray-300 px-6 py-3 rounded-lg">
            View Pricing
          </Link>
        </div>
      </section>

      {/* Products / Services */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Products & Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-xl mb-2">QR Code Alerts</h3>
              <p>Scan a code on any machine to open a pre-filled service call form. English & Spanish supported.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-xl mb-2">Live Status Board</h3>
              <p>Color-coded board (Critical / High / Medium / Low) visible in the shop. Updates in real time.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-xl mb-2">On-Duty SMS Alerts</h3>
              <p>Only technicians scheduled on duty receive text messages. No more missed calls.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
        <div className="text-center space-y-2">
          <p>QRcall.app</p>
          <p>1269 Highbridge Road, Vermilion, Ohio 44089</p>
          <p>Email: <a href="mailto:sales@qrcall.app" className="text-red-600">sales@qrcall.app</a></p>
          <p>Phone: +1 (216) 200-3264</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-600">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-center gap-6 mb-4">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/tech-signup/privacy">Privacy Policy</Link>
            <Link href="/tech-signup/terms">Terms of Service</Link>
          </div>
          <p>&copy; 2026 QRcall.app. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
