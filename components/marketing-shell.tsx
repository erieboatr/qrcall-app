import { MarketingFooter } from '@/components/marketing-footer'
import { MarketingHeader, type MarketingSection } from '@/components/marketing-header'

export function MarketingShell({
  children,
  current,
  tone = 'white',
}: {
  children: React.ReactNode
  current?: MarketingSection
  tone?: 'white' | 'gray'
}) {
  return (
    <div
      className={`flex min-h-screen flex-col text-gray-900 ${
        tone === 'gray' ? 'bg-gray-50' : 'bg-white'
      }`}
    >
      <MarketingHeader current={current} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}
