import Image from 'next/image'
import Link from 'next/link'

const links = [
  { href: '/about', label: 'About', id: 'about' },
  { href: '/pricing', label: 'Pricing', id: 'pricing' },
  { href: '/contact', label: 'Contact', id: 'contact' },
  { href: '/tech-signup', label: 'Tech Signup', id: 'tech-signup' },
] as const

export type MarketingSection = (typeof links)[number]['id']

export function MarketingHeader({ current }: { current?: MarketingSection }) {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-gray-900">
          <Image
            src="/logo.png"
            alt=""
            width={46}
            height={40}
            priority
            sizes="46px"
            className="h-10 w-auto"
          />
          <span className="text-xl font-bold">QRcall</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={
                current === link.id
                  ? 'font-semibold text-gray-900 underline'
                  : 'text-gray-700 hover:text-gray-900 hover:underline'
              }
              aria-current={current === link.id ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
