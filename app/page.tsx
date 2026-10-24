export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Qrcall
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Simple QR-code alerts and live status board for maintenance teams
        </p>

        <div className="bg-white rounded-lg shadow p-8 text-left space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">How it works</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Scan a QR code on any piece of equipment</li>
              <li>Submit a service call in seconds (English or Spanish)</li>
              <li>Call appears instantly on the live status board</li>
              <li>Only on-duty technicians get an SMS alert</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">Key features</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Color-coded priority (Critical / High / Medium / Low)</li>
              <li>Photo upload</li>
              <li>Arrived and Completed timestamps</li>
              <li>Works with the tools plants already have</li>
            </ul>
          </div>

          <div className="pt-4 text-center">
            <a
              href="/board"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              View Live Board
            </a>
          </div>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Faster response. Less downtime. Clear visibility.
        </p>
      </div>
    </div>
  )
}
