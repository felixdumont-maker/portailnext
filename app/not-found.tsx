'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
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
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(4rem, 15vw, 8rem)',
          fontWeight: 800,
          color: 'var(--color-brand)',
          lineHeight: 1,
          margin: '0 0 var(--space-4)',
          letterSpacing: '-0.04em',
        }}>404</p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-xl)',
          fontWeight: 700,
          color: 'var(--color-dark-text)',
          margin: '0 0 var(--space-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Page introuvable
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          color: 'var(--color-dark-text-2)',
          margin: '0 0 var(--space-8)',
          lineHeight: 'var(--leading-relaxed)',
        }}>
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
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
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
