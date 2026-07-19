'use client'

import { useEffect } from 'react'

// Filet de sécurité pour une erreur dans le root layout lui-même (app/error.tsx ne la
// rattrape pas). Doit fournir son propre <html>/<body> et éviter toute dépendance au
// layout planté (pas de next/image, pas de tokens CSS globaux — juste du inline).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      import('@sentry/nextjs').then(Sentry => Sentry.captureException(error))
    }
    console.error('[CocktailOS Global Error]', error)
  }, [error])

  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <main style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#16181d',
          color: '#eceae3',
          padding: '24px',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '440px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 12px' }}>
              Une erreur est survenue
            </h1>
            <p style={{ fontSize: '15px', color: '#abadb8', margin: '0 0 28px', lineHeight: 1.5 }}>
              Quelque chose s&apos;est mal passé au chargement de la page. Réessaie ou contacte le support si le problème persiste.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={reset}
                style={{
                  padding: '12px 24px', background: '#e83b14', color: 'white',
                  borderRadius: '999px', fontWeight: 700, fontSize: '14px',
                  border: 'none', cursor: 'pointer',
                }}
              >
                Réessayer
              </button>
              <a
                href="/"
                style={{
                  padding: '12px 24px', background: '#262930', color: '#abadb8',
                  borderRadius: '999px', fontWeight: 700, fontSize: '14px', textDecoration: 'none',
                }}
              >
                Accueil
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
