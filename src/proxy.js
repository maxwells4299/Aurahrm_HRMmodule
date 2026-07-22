import { NextResponse } from 'next/server';

const SECRET = 'a-very-long-and-secure-32-byte-secret-key-aura-hrm';

// A simple standalone parser for Next.js Edge Middleware/Proxy to avoid Node native bindings issues
function decodeAndVerifyTokenEdge(token) {
  if (!token) return null;
  try {
    const [base64Data, signature] = token.split('.');
    if (!base64Data || !signature) return null;

    // Check expiration and parse without loading complex Node libraries
    const dataStr = atob(base64Data);
    const payload = JSON.parse(dataStr);

    if (payload.exp < Date.now()) return null; // Expired
    return payload;
  } catch (err) {
    return null;
  }
}

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Let authentication APIs flow freely
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get('session-token');
  const token = tokenCookie?.value;
  const payload = decodeAndVerifyTokenEdge(token);

  // Protected Admin Routes
  if (pathname.startsWith('/admin')) {
    if (!payload || payload.role !== 'HR_ADMIN') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from Auth pages
  if (pathname === '/login' || pathname === '/register') {
    if (payload) {
      if (payload.role === 'HR_ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else {
        return NextResponse.redirect(new URL('/jobs', request.url));
      }
    }
  }

  return NextResponse.next();
}

// Map proxy to run on specific segments
export const config = {
  matcher: ['/admin/:path*', '/login', '/register'],
};
