'use client'

import { useParams, useRouter } from 'next/navigation'
import { IdentiteVisuelleContent } from './IdentiteVisuelleContent'

export default function IdentiteVisuelleClientPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 var(--space-6)', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-24)' }}>

      <button
        onClick={() => router.push(`/projet/${id}`)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
          textTransform: 'uppercase' as const, letterSpacing: '0.1em',
          color: 'var(--color-light-text-3)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          marginBottom: 'var(--space-4)', minHeight: '44px',
          transition: 'color var(--duration-fast)',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-light-text)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-light-text-3)')}
      >
        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
        Retour au projet
      </button>

      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '36px',
          lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--color-light-text)',
        }}>
          Identité visuelle
        </h1>
      </header>

      <IdentiteVisuelleContent projetId={id} showHeader />

    </div>
  )
}
