'use client'

import { useEffect, useState } from 'react'

const demoCalls = [
  { equip: 'Rooftop Unit 3', loc: 'North Wing', priority: 'Critical', status: 'Open', color: 'bg-red-500' },
  { equip: 'Walk-in Cooler', loc: 'Kitchen', priority: 'High', status: 'Arrived', color: 'bg-orange-500' },
  { equip: 'Boiler #2', loc: 'Mechanical Room', priority: 'Medium', status: 'Open', color: 'bg-yellow-400' },
]

export default function Home() {
  const [visible, setVisible] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible((v) => (v + 1) % (demoCalls.length + 1))
    }, 1800)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          Qrcall
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          QR-code service calls and a live status board for maintenance, HVAC, plumbing, appliance repair, and more.
        </p>

        {/* Animated demo board */}
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-4 text-left mb-8">
          <div className="text-sm font-semibold text-slate-500 mb-3">Live Status Board</div>
          <div className="space-y-2">
            {demoCalls.slice(0, visible).map((call, i) => (
              <div
                key={i}
                className={`${call.color} text-white p-3 rounded-lg text-sm animate-pulse`}
              >
                <div className="font-medium">{call.equip} — {call.loc}</div>
                <div className="text-xs opacity-90">{call.priority} • {call.status}</div>
              </div>
            ))}
            {visible === 0 && (
              <div className="text-slate-400 text-sm py-4 text-center">Waiting for calls…</div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/call?plant=ppi"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Try a Service Call
          </a>
          <a
            href="/board?plant=ppi"
            className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50"
          >
            See Real Board
          </a>
        </div>
      </section>

      {/* Markets */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold text-center mb-8">Works for any service team</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
          {['HVAC', 'Plumbing', 'Appliance Repair', 'Industrial Maintenance', 'Property Management', 'Facilities', 'Restaurants', 'Hotels'].map((m) => (
            <div key={m} className="bg-white rounded-lg py-3 shadow-sm">{m}</div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Scan & Submit</h3>
            <p className="text-slate-600 text-sm">
              Scan a QR code on any unit and submit a call in seconds. English or Spanish.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Live Status Board</h3>
            <p className="text-slate-600 text-sm">
              Color-coded calls appear instantly so the whole team sees what’s open or in progress.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-lg mb-2">On-Duty Alerts</h3>
            <p className="text-slate-600 text-sm">
              Only technicians who are actually on duty get the SMS. No more missed calls.
            </p>
          </div>
        </div>
      </section>

      <footer className="text-center py-8 text-sm text-slate-500">
        Faster response. Less downtime. Clear visibility.
      </footer>
    </div>
  )
}
