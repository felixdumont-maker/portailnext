'use client'

import { useEffect } from 'react'
import Image from 'next/image'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[CocktailOS Error]', error)
  }, [error])

  return (
    <main style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-dark-1)',
      padding: 'var(--space-6)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <Image
          src="/cos-logo-blanc.png"
          alt="CocktailOS"
          width={120}
          height={32}
          style={{ height: '22px', width: 'auto', objectFit: 'contain', margin: '0 auto var(--space-12)' }}
        />
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'oklch(54% 0.20 25 / 0.15)',
          border: '1px solid oklch(54% 0.20 25 / 0.30)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-6)',
        }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-error)', fontVariationSettings: "'FILL' 1" }}>
            error
          </span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-xl)',
          fontWeight: 700,
          color: 'var(--color-dark-text)',
          margin: '0 0 var(--space-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Une erreur est survenue
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          color: 'var(--color-dark-text-2)',
          margin: '0 0 var(--space-8)',
          lineHeight: 'var(--leading-relaxed)',
        }}>
          Quelque chose s&apos;est mal passé. Réessaie ou contacte le support si le problème persiste.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-6)',
              background: 'var(--color-brand)',
              color: 'white',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
            Réessayer
          </button>
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-6)',
              background: 'var(--color-dark-3)',
              color: 'var(--color-dark-text-2)',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Accueil
          </a>
        </div>
      </div>
    </main>
  )
}
