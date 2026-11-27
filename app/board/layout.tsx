import { pageMetadata } from '@/lib/site'

export const metadata = pageMetadata({
  title: 'Live Status Board',
  description:
    'Live color-coded service call board. Critical, High, Medium, and Low calls update as technicians respond.',
  path: '/board',
})

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>
}
