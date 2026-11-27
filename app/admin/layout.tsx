import { pageMetadata } from '@/lib/site'

export const metadata = pageMetadata({
  title: 'Admin',
  description: 'QRcall administration for technicians, equipment, and schedules.',
  path: '/admin',
})

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>
}
