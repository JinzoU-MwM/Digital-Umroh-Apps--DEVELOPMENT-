import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddleware } from 'next-intl/middleware';

// Internationalization middleware
const intlMiddleware = createMiddleware({
  locales: ['id-ID', 'en-US'],
  defaultLocale: 'id-ID',
});

// Tenant resolution middleware
function tenantMiddleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];

  // Skip for localhost and main domain
  if (hostname.includes('localhost') || hostname.includes('appmu.com')) {
    // Extract tenant from subdomain
    if (subdomain !== 'www' && subdomain !== 'appmu') {
      const response = NextResponse.next();
      response.headers.set('X-Tenant-Id', subdomain);
      return response;
    }
  }

  // Extract tenant from header for API routes
  const tenantId = request.headers.get('X-Tenant-Id');
  if (tenantId) {
    const response = NextResponse.next();
    response.headers.set('X-Tenant-Id', tenantId);
    return response;
  }

  return NextResponse.next();
}

// Security middleware
function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

  return response;
}

// Rate limiting middleware (basic implementation)
function rateLimitMiddleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // In production, you'd want to use Redis or another store for rate limiting
  // This is a basic in-memory implementation for demonstration
  const rateLimitMap = new Map();
  const key = `${ip}:${userAgent}`;
  const count = (rateLimitMap.get(key) || 0) + 1;
  rateLimitMap.set(key, count);

  // Reset count after 1 minute
  setTimeout(() => rateLimitMap.delete(key), 60000);

  // Allow 100 requests per minute per IP
  if (count > 100) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  return NextResponse.next();
}

// Combined middleware
export function middleware(request: NextRequest) {
  // Apply security headers first
  const securityResponse = securityMiddleware(request);
  if (securityResponse.status === 429) {
    return securityResponse;
  }

  // Apply rate limiting
  const rateLimitResponse = rateLimitMiddleware(request);
  if (rateLimitResponse.status === 429) {
    return rateLimitResponse;
  }

  // Apply tenant resolution
  const tenantResponse = tenantMiddleware(request);

  // Apply internationalization
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};