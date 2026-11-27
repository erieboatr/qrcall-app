import Link from 'next/link'
import { MarketingShell } from '@/components/marketing-shell'
import { pageMetadata } from '@/lib/site'

export const metadata = pageMetadata({
  title: 'Terms of Service',
  description:
    'Terms for QRcall service-call SMS alerts, including message frequency, STOP and HELP, and carrier limitations.',
  path: '/terms',
})

export default function TermsPage() {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-6 text-3xl font-bold">Terms of Service</h1>
        <h2 className="mb-3 text-xl font-semibold">QRcall.app Service Call Alerts</h2>
        <p className="leading-relaxed text-gray-800">
          By providing your mobile phone number and enrolling in the program, you agree to receive
          recurring Service Call text messages from QRcall.app. Message frequency varies. Message
          and data rates may apply. Reply STOP to cancel or HELP for help. For additional
          assistance, contact{' '}
          <a href="mailto:sales@qrcall.app" className="text-red-700 underline">
            sales@qrcall.app
          </a>{' '}
          or +1 (216) 200-3264. Wireless carriers are not liable for delayed or undelivered
          messages. Participation in this program is subject to our{' '}
          <Link href="/privacy" className="text-red-700 underline">
            Privacy Policy
          </Link>
          .
        </p>
        <p className="mt-8 text-sm text-gray-600">
          QRcall.app, 1269 Highbridge Road, Vermilion, Ohio 44089.
        </p>
        <p className="mt-4 text-sm text-gray-600">
          Continued use of this website constitutes your acceptance of these Terms of Service.
        </p>
      </article>
    </MarketingShell>
  )
}
