import Link from 'next/link'

export function MarketingFooter() {
  return (
    <footer className="border-t bg-white py-8 text-center text-sm text-gray-600">
      <div className="mx-auto max-w-5xl px-4">
        <nav className="mb-4 flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Footer">
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/pricing" className="hover:underline">
            Pricing
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
        </nav>
        <p>QRcall.app · 1269 Highbridge Road, Vermilion, Ohio 44089</p>
        <p className="mt-2">&copy; 2026 QRcall.app. All rights reserved.</p>
      </div>
    </footer>
  )
}
