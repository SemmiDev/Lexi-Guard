import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isApiAuthRoute = request.nextUrl.pathname.startsWith('/api/auth');
  const isPublicApiRoute = request.nextUrl.pathname.startsWith('/api/public');

  // Redirect to home if trying to access auth page while logged in
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow access to auth pages and auth API routes
  if (isAuthPage || isApiAuthRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // Redirect to auth page if not logged in
  if (!token) {
    const url = new URL('/auth', request.url);
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
