import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
  const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');
  const isPublicRoute = req.nextUrl.pathname === '/';
  const isAdminRoute = req.nextUrl.pathname === '/admin';

  // Allow API auth routes to pass through
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Allow public routes, admin, and auth pages for non-logged-in users
  if (isPublicRoute || isAuthPage || isAdminRoute) {
    return NextResponse.next();
  }

  // Redirect non-logged-in users to sign-in page
  if (!isLoggedIn) {
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
