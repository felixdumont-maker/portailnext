import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = [
  '/admin',
  '/dashboard',
  '/profile',
  '/projet',
  '/pigiste',
  '/outils',
  '/invitation',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED.some(prefix => pathname.startsWith(prefix))
  if (!isProtected) return NextResponse.next()

  // Flask utilise un cookie de session signé nommé "session"
  const session = request.cookies.get('session')
  if (!session) {
    const loginUrl = new URL('/', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
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
  ],
}
