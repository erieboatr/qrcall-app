import { pageMetadata } from '@/lib/site'

export const metadata = pageMetadata({
  title: 'Plant Admin',
  description: 'Manage a plant’s technicians and on-duty schedule in QRcall.',
  path: '/plant-admin',
})

export default function PlantAdminLayout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>
}