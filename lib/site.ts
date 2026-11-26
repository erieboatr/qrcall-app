import type { Metadata } from 'next'

export const SITE_URL = 'https://www.qrcall.app'
export const SITE_NAME = 'QRcall'
export const HOME_TITLE = 'QRcall — QR Code Service Calls for Maintenance Teams'
export const DEFAULT_DESCRIPTION =
  'Technicians scan a QR code on equipment to log a service call in seconds. Calls show on a live color-coded shop board, and only on-duty techs get SMS alerts. English and Spanish.'

export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  absolute = false,
}: {
  title: string
  description?: string
  path: string
  absolute?: boolean
}): Metadata {
  const url = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}
