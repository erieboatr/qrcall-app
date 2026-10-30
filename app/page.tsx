import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <img src="/logo.png" alt="QRcall" className="h-16 mx-auto mb-8" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          QR Call
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Simple QR-code service calls and a live status board for maintenance teams.
          Scan a code, submit a call, and alert only the technicians who are on duty.
        </p>
        <div className="space-x-4">
          <Link
            href="/pricing"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            See Pricing
          </Link>
          <Link
            href="/contact"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  )
}