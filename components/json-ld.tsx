import { DEFAULT_DESCRIPTION, SITE_URL } from '@/lib/site'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'QRcall',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      email: 'sales@qrcall.app',
      telephone: '+1-216-200-3264',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '1269 Highbridge Road',
        addressLocality: 'Vermilion',
        addressRegion: 'OH',
        postalCode: '44089',
        addressCountry: 'US',
      },
    },
    {
      '@type': 'WebSite',
      name: 'QRcall',
      url: SITE_URL,
      description: DEFAULT_DESCRIPTION,
    },
    {
      '@type': 'SoftwareApplication',
      name: 'QRcall',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: SITE_URL,
      description: DEFAULT_DESCRIPTION,
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '149',
        highPrice: '199',
        priceCurrency: 'USD',
        offerCount: 3,
        description: 'Per-plant monthly plans. Contact sales to start.',
      },
    },
  ],
}

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  )
}
