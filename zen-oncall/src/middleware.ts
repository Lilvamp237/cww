// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // --- Allow auth callback routes without authentication ---
  if (pathname.startsWith('/auth/callback') || pathname.startsWith('/auth/confirm')) {
    return res;
  }

  // --- Logic for Logged-In Users ---
  if (session) {
    // Only redirect from auth pages or root to dashboard
    if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // Allow access to all other protected routes (dashboard, circles, scheduler, wellness)
  }

  // --- Logic for Anonymous Users ---
  if (!session) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/circles') || pathname.startsWith('/scheduler') || pathname.startsWith('/wellness') || pathname === '/') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/circles/:path*', '/scheduler/:path*', '/wellness/:path*', '/login', '/signup', '/auth/:path*'],
};
