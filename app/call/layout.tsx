import { pageMetadata } from '@/lib/site'

export const metadata = pageMetadata({
  title: 'Service Call',
  description: 'Log a QRcall service call from a QR code on equipment. English and Spanish.',
  path: '/call',
})

export default function CallLayout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>
}
