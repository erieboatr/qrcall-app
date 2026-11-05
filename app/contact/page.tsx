'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Contact() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // In a real app this would post to your leads table or email service
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="QRcall" className="h-10" />
            <span className="font-bold text-xl">QRcall</span>
          </Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/pricing" className="hover:underline">Pricing</Link>
            <Link href="/contact" className="hover:underline font-semibold">Contact</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-gray-600 mb-8">Questions about QRcall? We’re here to help.</p>

        <div className="mb-8 space-y-1 text-sm">
          <p><strong>QRcall.app</strong></p>
          <p>1269 Highbridge Road, Vermilion, Ohio 44089</p>
          <p>Email: <a href="mailto:sales@qrcall.app" className="text-red-600">sales@qrcall.app</a></p>
          <p>Phone: +1 (216) 200-3264</p>
        </div>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded p-6 text-center">
            <p className="font-semibold">Message sent!</p>
            <p className="text-sm mt-2">We’ll get back to you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input required className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <input className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" required className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="tel" className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">What are you looking for?</label>
              <textarea required rows={4} className="w-full border rounded p-2" />
            </div>
            <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold">
              Send Message
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
