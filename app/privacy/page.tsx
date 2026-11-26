import Link from 'next/link'
import { MarketingShell } from '@/components/marketing-shell'
import { pageMetadata } from '@/lib/site'

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'How QRcall collects, uses, and protects technician contact information for on-duty SMS service-call alerts.',
  path: '/privacy',
})

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>
        <div className="space-y-4 text-gray-800">
          <p>
            QRcall.app (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy.
            This Privacy Policy explains how we collect, use, and protect your information.
          </p>

          <h2 className="pt-2 text-xl font-semibold">Information We Collect</h2>
          <p>
            When you sign up for SMS alerts we collect your name, mobile phone number, and
            preferred language. We also collect plant/company information you provide.
          </p>

          <h2 className="pt-2 text-xl font-semibold">How We Use Your Information</h2>
          <p>
            We use your information solely to send service call alerts and related transactional
            messages. We do not sell or share your mobile number with third parties for marketing
            purposes.
          </p>

          <h2 className="pt-2 text-xl font-semibold">Your Rights</h2>
          <p>
            You may opt out of messages at any time by replying STOP. You can also contact us at{' '}
            <a href="mailto:sales@qrcall.app" className="text-red-700 underline">
              sales@qrcall.app
            </a>{' '}
            to request deletion of your information.
          </p>

          <h2 className="pt-2 text-xl font-semibold">Contact</h2>
          <p>
            Questions about this policy can be sent to{' '}
            <a href="mailto:sales@qrcall.app" className="text-red-700 underline">
              sales@qrcall.app
            </a>
            .
          </p>
          <p className="text-sm text-gray-600">
            QRcall.app, 1269 Highbridge Road, Vermilion, Ohio 44089. Phone: +1 (216) 200-3264. See
            also our <Link href="/terms" className="text-red-700 underline">Terms of Service</Link>.
          </p>
          <p className="text-sm text-gray-600">
            Continued use of this website constitutes your acceptance of this Privacy Policy.
          </p>
        </div>
      </article>
    </MarketingShell>
  )
}
