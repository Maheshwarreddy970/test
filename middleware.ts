import { NextRequest, NextResponse } from 'next/server'
import { rootDomain } from '@/lib/utils'

// Optional: map custom domains manually or load from Redis/DB
const customDomainMap: Record<string, string> = {
  'test.superworldtechnologies.com': 'tomy',
  // Add more if needed
}

/**
 * Extract the subdomain or custom domain tenant key
 */
function extractTenant(req: NextRequest): string | null {
  const host = req.headers.get('host') || ''
  const hostname = host.split(':')[0]
  const url = req.url

  // 1️⃣ Handle local dev (e.g. tomy.localhost:3000)
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    const match = url.match(/https?:\/\/([^.]+)\.localhost/)
    if (match && match[1]) return match[1]
    if (hostname.includes('.localhost')) return hostname.split('.')[0]
    return null
  }

  // 2️⃣ Handle custom domain mapping
  if (customDomainMap[hostname]) {
    return customDomainMap[hostname]
  }

  // 3️⃣ Handle standard subdomains (e.g. tomy.nexpetcare.site)
  const root = rootDomain.replace(/^www\./, '')
  const isSub =
    hostname.endsWith(`.${root}`) &&
    hostname !== root &&
    hostname !== `www.${root}`

  if (isSub) {
    return hostname.replace(`.${root}`, '')
  }

  return null
}

/**
 * Middleware: Handles subdomain + custom domain routing
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const tenant = extractTenant(req)

  // 🧱 If tenant exists (either subdomain or custom domain)
  if (tenant) {
    // Prevent access to admin from tenant sites
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Rewrite homepage of subdomain/custom domain → /s/[tenant]
    if (pathname === '/') {
      const url = req.nextUrl.clone()
      url.pathname = `/s/${tenant}`
      return NextResponse.rewrite(url)
    }

    // Allow other pages to continue
    return NextResponse.next()
  }

  // Root domain: continue as usual
  return NextResponse.next()
}

/**
 * Matcher: Apply to all routes except API, Next internals, and public files
 */
export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|static|assets).*)',
  ],
}
