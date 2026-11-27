import type { Metadata } from 'next'
import { NotFoundContent } from '@/components/not-found-content'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
}

export default function MissingPage() {
  return <NotFoundContent />
}
