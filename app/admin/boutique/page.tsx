'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Marchand {
  id: number
  slug: string
  actif: boolean
  nom_complet: string
  nom_entreprise: string | null
  client_email: string
  square_configure: boolean
  interac_configure: boolean
  created_at: string
}

export default function AdminBoutiquePage() {
  const router = useRouter()
  const [marchands, setMarchands] = useState<Marchand[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    fetch('/api/v1/admin/boutique/marchands', { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .then(data => { setMarchands(data); setLoading(false) })
  }, [])

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-light-text)', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
            BOUTIQUE EN LIGNE
          </h1>
          <p style={{ color: 'var(--color-light-text-3)', marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
            {marchands.length} marchand{marchands.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/boutique/nouveau"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
            background: 'var(--color-brand)', color: 'white',
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textTransform: 'uppercase',
            textDecoration: 'none', padding: '12px 24px', borderRadius: 'var(--radius-full)',
          }}
        >
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          Nouveau marchand
        </Link>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-light-text-3)', fontSize: 'var(--text-sm)' }}>Chargement…</p>
      ) : marchands.length === 0 ? (
        <div style={{
          background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-16)',
          textAlign: 'center',
        }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--color-light-text-3)', display: 'block', marginBottom: 'var(--space-4)' }}>storefront</span>
          <p style={{ color: 'var(--color-light-text-3)', fontFamily: 'var(--font-body)', margin: 0 }}>
            Aucun marchand pour l&apos;instant.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {marchands.map(m => (
            <div
              key={m.id}
              onClick={() => router.push(`/admin/boutique/${m.id}`)}
              style={{
                background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
                borderRadius: 'var(--radius-md)', padding: 'var(--space-5) var(--space-6)',
                display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                cursor: 'pointer', transition: 'border-color var(--duration-fast)',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-light-border)')}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 20, color: '#16a34a' }}>storefront</span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-light-text)', margin: 0, textTransform: 'uppercase' }}>
                  {m.nom_entreprise || m.nom_complet}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: '2px 0 0', fontFamily: 'var(--font-body)' }}>
                  {m.slug} · {m.client_email}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {m.square_configure && (
                  <span title="Square configuré" style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-body)', color: 'var(--color-light-text-3)', background: 'var(--color-light-3)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>Square</span>
                )}
                {m.interac_configure && (
                  <span title="Interac configuré" style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-body)', color: 'var(--color-light-text-3)', background: 'var(--color-light-3)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>Interac</span>
                )}
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                padding: '4px 12px', borderRadius: 'var(--radius-full)',
                background: m.actif ? 'var(--color-success)18' : 'var(--color-dark-text-2)18',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: m.actif ? 'var(--color-success)' : 'var(--color-dark-text-2)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {m.actif ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
