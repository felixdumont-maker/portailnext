import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Reçu — CocktailOS',
  manifest: '/manifest-capture.json',
  appleWebApp: { capable: true, title: 'Reçu', statusBarStyle: 'black-translucent' },
}

export const viewport: Viewport = {
  themeColor: '#111111',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function CaptureLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
