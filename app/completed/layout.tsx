import { pageMetadata } from '@/lib/site'

export const metadata = pageMetadata({
  title: 'Completed Calls',
  description: 'Completed QRcall service calls.',
  path: '/completed',
})

export default function CompletedLayout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>
}
