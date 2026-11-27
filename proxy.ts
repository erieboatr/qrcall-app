import { NextResponse, type NextRequest } from 'next/server'
import { getPlant } from '@/lib/plants'

/**
 * Unknown single-segment URLs match `app/[plant]` and would otherwise stream a
 * 200 shell before the plant lookup finishes. Resolve the slug here so invalid
 * plants return a real 404, and send mixed-case slugs to the canonical id.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const parts = pathname.split('/').filter(Boolean)
  const isPlant = parts.length === 1
  const isPlantAdmin = parts.length === 2 && parts[1] === 'admin'
  if (!isPlant && !isPlantAdmin) return NextResponse.next()

  const slug = parts[0]
  const record = await getPlant(decodeURIComponent(slug))
  if (!record) {
    const missingUrl = new URL('/missing', request.url)
    const missing = await fetch(missingUrl)
    const html = await missing.text()
    return new NextResponse(html, {
      status: 404,
      headers: {
        'content-type': missing.headers.get('content-type') ?? 'text/html; charset=utf-8',
        'cache-control': 'no-store',
      },
    })
  }

  if (record.id !== slug) {
    const url = request.nextUrl.clone()
    url.pathname = isPlantAdmin ? `/${record.id}/admin` : `/${record.id}`
    return NextResponse.redirect(url, 308)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|about|pricing|contact|privacy|terms|tech-signup|board|call|completed|admin|plant-admin|missing|opengraph-image|twitter-image|apple-icon|favicon.ico|robots.txt|sitemap.xml|.*\\..*).+)',
  ],
}
