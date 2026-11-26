import { ContactForm } from '@/components/contact-form'
import { MarketingShell } from '@/components/marketing-shell'
import { pageMetadata } from '@/lib/site'

export const metadata = pageMetadata({
  title: 'Contact',
  description:
    'Contact QRcall about QR code service calls for your maintenance team. 1269 Highbridge Road, Vermilion, Ohio.',
  path: '/contact',
})

export default function ContactPage() {
  return (
    <MarketingShell current="contact">
      <div className="mx-auto max-w-xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold">Contact Us</h1>
        <p className="mb-8 text-gray-600">Questions about QRcall? We’re here to help.</p>

        <div className="mb-8 space-y-1 text-sm">
          <p>
            <strong>QRcall.app</strong>
          </p>
          <p>1269 Highbridge Road, Vermilion, Ohio 44089</p>
          <p>
            Email:{' '}
            <a href="mailto:sales@qrcall.app" className="text-red-600">
              sales@qrcall.app
            </a>
          </p>
          <p>Phone: +1 (216) 200-3264</p>
        </div>

        <ContactForm />
      </div>
    </MarketingShell>
  )
}
