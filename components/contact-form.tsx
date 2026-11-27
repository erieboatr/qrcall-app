'use client'

import { useState } from 'react'

export function ContactForm() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
  }

  if (sent) {
    return (
      <div className="rounded border border-green-200 bg-green-50 p-6 text-center">
        <p className="font-semibold">Message sent!</p>
        <p className="mt-2 text-sm">We’ll get back to you shortly.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="mb-1 block text-sm font-medium">
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="w-full rounded border p-2"
        />
      </div>
      <div>
        <label htmlFor="contact-company" className="mb-1 block text-sm font-medium">
          Company
        </label>
        <input
          id="contact-company"
          name="company"
          type="text"
          autoComplete="organization"
          className="w-full rounded border p-2"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded border p-2"
        />
      </div>
      <div>
        <label htmlFor="contact-phone" className="mb-1 block text-sm font-medium">
          Phone
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="w-full rounded border p-2"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1 block text-sm font-medium">
          What are you looking for?
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={4}
          className="w-full rounded border p-2"
        />
      </div>
      <button type="submit" className="w-full rounded-lg bg-red-600 py-3 font-semibold text-white">
        Send Message
      </button>
    </form>
  )
}
