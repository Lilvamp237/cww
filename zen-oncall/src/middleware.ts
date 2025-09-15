// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // --- Logic for Logged-In Users ---
  if (session) {
    // If a logged-in user tries to visit login, signup, or the root,
    // redirect them to their dashboard.
    if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // --- Logic for Anonymous Users ---
  if (!session) {
    // If an anonymous user tries to visit any protected page (dashboard/* or the root),
    // redirect them to the login page.
    // The root '/' is now considered a protected entry point.
    if (pathname.startsWith('/dashboard') || pathname === '/') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return res;
}

// Update the matcher to include the root path '/'
export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/signup'],
};