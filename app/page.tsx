'use client'

import { useEffect, useState } from 'react'

const demoCalls = [
  { equip: 'Demo Boiler #1', loc: 'Mechanical Room', priority: 'Critical', status: 'Open', color: 'bg-red-500' },
  { equip: 'Demo Walk-in Cooler', loc: 'Kitchen', priority: 'High', status: 'Arrived', color: 'bg-orange-500' },
  { equip: 'Demo Rooftop Unit', loc: 'North Wing', priority: 'Medium', status: 'Open', color: 'bg-yellow-400' },
]

export default function Home() {
  const [visible, setVisible] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible((v) => (v + 1) % (demoCalls.length + 1))
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-8 text-center">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img src="/logo.png" alt="Qrcall" className="h-16 mx-auto" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Service Calls Made Simple
        </h1>
        <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
          QR-code service requests and a live status board for HVAC, plumbing, appliance repair, facilities, and industrial teams.
        </p>

        {/* Fixed-height demo board */}
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-4 text-left mb-8 h-64 overflow-hidden">
          <div className="text-sm font-semibold text-slate-500 mb-3">Live Status Board</div>
          <div className="space-y-2">
            {demoCalls.slice(0, visible).map((call, i) => (
              <div key={i} className={`${call.color} text-white p-3 rounded-lg text-sm`}>
                <div className="font-medium">{call.equip} — {call.loc}</div>
                <div className="text-xs opacity-90">{call.priority} • {call.status}</div>
              </div>
            ))}
            {visible === 0 && (
              <div className="text-slate-400 text-sm py-8 text-center">Waiting for calls…</div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/call?plant=qrcall"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Try a Demo Call
          </a>
          <a
            href="/board?plant=qrcall"
            className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50"
          >
            View Demo Board
          </a>
          <a
            href="mailto:sales@qrcall.com"
            className="bg-slate-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-900"
          >
            Contact Sales
          </a>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold text-center mb-6">Works for any service team</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
          {['HVAC', 'Plumbing', 'Appliance Repair', 'Industrial', 'Facilities', 'Property Mgmt', 'Restaurants', 'Hotels'].map((m) => (
            <div key={m} className="bg-white rounded-lg py-3 shadow-sm">{m}</div>
          ))}
        </div>
      </section>

      <footer className="text-center py-8 text-sm text-slate-500">
        Faster response. Less downtime. Clear visibility.
      </footer>
    </div>
  )
}
