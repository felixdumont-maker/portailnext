import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'

const PROTECTED = [
  '/admin',
  '/dashboard',
  '/profile',
  '/projet',
  '/pigiste',
  '/outils',
  '/guides',
]

const FLASK_INTERNAL = 'http://127.0.0.1:18000'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED.some(prefix => pathname.startsWith(prefix))
  if (!isProtected) return NextResponse.next()

  // Flask SESSION_COOKIE_NAME = "cocktailmedia_session" (app.py:112)
  const sessionCookie = request.cookies.get('cocktailmedia_session')
  if (!sessionCookie) {
    const loginUrl = new URL('/', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Validate session against Flask — catches expired/corrupted cookies
  try {
    const res = await fetch(`${FLASK_INTERNAL}/api/v1/auth/me`, {
      headers: { Cookie: `cocktailmedia_session=${sessionCookie.value}` },
    })
    if (!res.ok) {
      const loginUrl = new URL('/', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('cocktailmedia_session')
      return response
    }
  } catch {
    // Flask unreachable — degrade gracefully rather than locking everyone out
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/projet/:path*',
    '/pigiste/:path*',
    '/outils/:path*',
    '/guides/:path*',
  ],
}
