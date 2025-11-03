import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Example static mapping for testing
const customDomainMap: Record<string, string> = {
  "test.mnreddyconstructions.in": "tomy",
};

export async function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";

  // Handle custom domain mapping
  if (customDomainMap[host]) {
    const sub = customDomainMap[host];
    const url = req.nextUrl.clone();
    url.hostname = `${sub}.nexpetcare.site`; // rewrite internally
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
