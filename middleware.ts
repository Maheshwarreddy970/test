import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rootDomain } from '@/lib/utils';
import { redis } from '@/lib/redis';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  // Check if hostname is root or www
  const isRootDomain =
    hostname === rootDomain ||
    hostname === `www.${rootDomain}`;

  // If it’s a subdomain (e.g., tomy.nexpetcare.site)
  if (hostname.endsWith(`.${rootDomain}`) && !isRootDomain) {
    const subdomain = hostname.replace(`.${rootDomain}`, '');

    // Block /admin from subdomain
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Rewrite root path to the subdomain page
    if (pathname === '/') {
      return NextResponse.rewrite(new URL(`/s/${subdomain}`, request.url));
    }
  }

  // Handle custom domains like tomy.com
  if (!hostname.endsWith(rootDomain)) {
    // Lookup tenant by custom domain
    const tenant = await redis.get(`custom-domain:${hostname}`);

    if (tenant) {
      const url = request.nextUrl.clone();
      url.pathname = `/s/${tenant}${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // Default behavior for root domain
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|[\\w-]+\\.\\w+).*)'
  ]
};
