'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface SoumissionItem {
  id: number
  titre: string
  statut: 'envoyee' | 'acceptee' | 'refusee' | 'expiree'
  date_expiration: string | null
  created_at: string
  option_acceptee_nom: string | null
}

const STATUT_CONFIG = {
  envoyee:  { label: 'En attente de votre reponse', bg: 'var(--color-info-bg-2)',    text: 'var(--color-info-text)'       },
  acceptee: { label: 'Acceptee',                    bg: 'var(--color-success-bg-2)', text: 'var(--color-success-text-2)'  },
  refusee:  { label: 'Refusee',                     bg: '#fee2e2',                   text: '#b91c1c'                       },
  expiree:  { label: 'Expiree',                     bg: 'var(--color-light-0)',      text: 'var(--color-light-text-3)'    },
}

export default function ClientSoumissionsPage() {
  const [items, setItems]     = useState<SoumissionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/client/soumissions', { credentials: 'include' })
      .then(r => r.json()).then(d => { setItems(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'var(--space-6)' }}>

      <header style={{ marginBottom: 'var(--space-10)' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-3xl)',
          lineHeight: 1, letterSpacing: '-0.025em', textTransform: 'uppercase',
          color: 'var(--color-light-text)', margin: '0 0 var(--space-2)',
        }}>
          Mes soumissions
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-3)', margin: 0 }}>
          Consultez et acceptez vos soumissions confidentielles.
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-20) 0' }}>
          <span className="material-symbols-outlined animate-spin text-3xl text-[var(--color-brand)]">progress_activity</span>
        </div>
      ) : items.length === 0 ? (
        <div style={{
          background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-16)',
          textAlign: 'center',
        }}>
          <span className="material-symbols-outlined text-5xl text-[var(--color-light-border-2)] block mb-4">description</span>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-light-text-3)', margin: 0 }}>
            Aucune soumission pour le moment.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {items.map(s => {
            const cfg = STATUT_CONFIG[s.statut] ?? STATUT_CONFIG.expiree
            const isActionable = s.statut === 'envoyee'
            return (
              <Link
                key={s.id}
                href={`/soumission/${s.id}`}
                style={{
                  display: 'block', textDecoration: 'none',
                  background: 'var(--color-light-2)',
                  border: `1px solid ${isActionable ? 'var(--color-brand-25pct)' : 'var(--color-light-border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-6)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxShadow: isActionable ? '0 2px 12px var(--color-brand-6pct)' : 'none',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-brand)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px var(--color-brand-6pct)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = isActionable ? 'var(--color-brand-25pct)' : 'var(--color-light-border)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = isActionable ? '0 2px 12px var(--color-brand-6pct)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <span style={{
                        background: cfg.bg, color: cfg.text,
                        padding: '3px 10px', borderRadius: 'var(--radius-full)',
                        fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                      }}>
                        {cfg.label}
                      </span>
                      {isActionable && (
                        <span style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: 'var(--color-brand)',
                          display: 'inline-block',
                          animation: 'pulse 2s infinite',
                        }} />
                      )}
                    </div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)',
                      textTransform: 'uppercase', letterSpacing: '-0.01em',
                      color: 'var(--color-light-text)', margin: '0 0 var(--space-2)',
                    }}>
                      {s.titre}
                    </h3>
                    {s.option_acceptee_nom && (
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 0 }}>
                        Option choisie : <strong style={{ color: 'var(--color-light-text)' }}>{s.option_acceptee_nom}</strong>
                      </p>
                    )}
                    {s.date_expiration && (
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: '4px 0 0' }}>
                        {s.statut === 'envoyee' ? 'Expire le' : 'Expirait le'}{' '}
                        {new Date(s.date_expiration).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-brand)', marginTop: '4px' }}>
                    chevron_right
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
