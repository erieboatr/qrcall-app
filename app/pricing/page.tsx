"use client"

import Link from "next/link"

const tiers = [
  {
    name: "Starter",
    price: "$149",
    period: "/plant/month",
    description: "For a single plant that wants simple QR service calls and a live board.",
    features: [
      "QR codes for all equipment",
      "Mobile form (English / Spanish)",
      "Live color-coded status board",
      "SMS alerts to on-duty technicians",
      "Basic schedule management",
      "Photo upload",
      "30-day onboarding support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Plant",
    price: "$199",
    period: "/plant/month",
    description: "Most popular. Full visibility and control for maintenance teams.",
    features: [
      "Everything in Starter",
      "Priority levels (Critical → Low)",
      "Arrived & Completed timestamps",
      "Needs More Work status",
      "Plant-specific logo on forms & board",
      "Contact Sales lead notifications",
      "Priority email & SMS support",
    ],
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Multi-Plant",
    price: "$169",
    period: "/plant/month",
    description: "For companies running 3 or more plants. Volume pricing.",
    features: [
      "Everything in Plant",
      "Centralized admin across plants",
      "Plant filtering on the status board",
      "Bulk QR code generation",
      "Dedicated onboarding",
      "Quarterly business review",
    ],
    cta: "Talk to Sales",
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Simple pricing for maintenance teams</h1>
          <p className="mt-4 text-lg text-gray-600">
            One plant. One price. No per-user fees. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border bg-white p-8 shadow-sm ${
                tier.highlighted ? "border-blue-500 ring-2 ring-blue-500" : "border-gray-200"
              }`}
            >
              {tier.highlighted && (
                <div className="mb-4 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  Most Popular
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900">{tier.name}</h2>
              <p className="mt-2 text-gray-600">{tier.description}</p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                <span className="text-gray-500">{tier.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <span className="mr-2 text-green-500">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className={`mt-8 block w-full rounded-lg py-3 text-center font-semibold ${
                  tier.highlighted
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-12 text-center text-sm text-gray-500">
          All plans include SMS alerts (fair use). Setup assistance available. 
          Need a custom quote? <Link href="/contact" className="text-blue-600 hover:underline">Contact sales</Link>.
        </p>
      </div>
    </div>
  )
}