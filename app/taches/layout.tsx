import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Tâches — CocktailOS',
  manifest: '/manifest-taches.json',
  appleWebApp: { capable: true, title: 'Tâches', statusBarStyle: 'black-translucent' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#111111' },
    { media: '(prefers-color-scheme: light)', color: '#f7f4f0' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function TachesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
