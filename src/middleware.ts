import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware: Verify JWT token (if needed)
 * Currently allows all requests through, token verification happens in tRPC context
 */
export function middleware(request: NextRequest) {
  // Additional middleware logic can be added here
  // For example: check authentication requirements for specific routes
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 