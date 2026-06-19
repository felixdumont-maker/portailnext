'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Site {
  id: number
  business_name: string
  template: string
  slug: string
  status: string
  vercel_url: string | null
  github_repo: string | null
  sanity_project_id: string | null
  created_at: string
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  creating:  { label: 'En création…', color: 'var(--color-warning)' },
  active:    { label: 'Prêt',         color: 'var(--color-success)' },
  deployed:  { label: 'Déployé',      color: 'var(--color-info)' },
  error:     { label: 'Erreur',       color: 'var(--color-brand)' },
  draft:     { label: 'Brouillon',    color: 'var(--color-dark-text-2)' },
}

const TEMPLATE_LABEL: Record<string, string> = {
  reservation: 'Réservation',
  vitrine:     'Vitrine',
}

export default function AdminSitesPage() {
  const router = useRouter()
  const [sites, setSites]     = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/v1/admin/sites', { credentials: 'include' })
    if (res.ok) setSites(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Poll les sites en création
  useEffect(() => {
    const creating = sites.some(s => s.status === 'creating')
    if (!creating) return
    const id = setTimeout(load, 3000)
    return () => clearTimeout(id)
  }, [sites])

  return (
    <div style={{ maxWidth: 900 }}>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-light-text)', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
            SITES CLIENTS
          </h1>
          <p style={{ color: 'var(--color-light-text-3)', marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
            {sites.length} site{sites.length !== 1 ? 's' : ''} généré{sites.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/sites/nouveau"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
            background: 'var(--color-brand)', color: 'white',
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textTransform: 'uppercase',
            textDecoration: 'none', padding: '12px 24px', borderRadius: 'var(--radius-full)',
          }}
        >
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          Nouveau site
        </Link>
      </div>

      {/* Liste */}
      {loading ? (
        <p style={{ color: 'var(--color-light-text-3)', fontSize: 'var(--text-sm)' }}>Chargement…</p>
      ) : sites.length === 0 ? (
        <div style={{
          background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-16)',
          textAlign: 'center',
        }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--color-light-text-3)', display: 'block', marginBottom: 'var(--space-4)' }}>web</span>
          <p style={{ color: 'var(--color-light-text-3)', fontFamily: 'var(--font-body)', margin: 0 }}>
            Aucun site créé pour l&apos;instant.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {sites.map(site => {
            const st = STATUS_LABEL[site.status] ?? { label: site.status, color: 'var(--color-dark-text-2)' }
            return (
              <div
                key={site.id}
                onClick={() => router.push(`/admin/sites/${site.id}`)}
                style={{
                  background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
                  borderRadius: 'var(--radius-md)', padding: 'var(--space-5) var(--space-6)',
                  display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                  cursor: 'pointer', transition: 'border-color var(--duration-fast)',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-light-border)')}
              >
                {/* Icône template */}
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                  background: site.template === 'reservation' ? '#fdf2f8' : '#f0fdf4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 20, color: site.template === 'reservation' ? '#c026d3' : '#16a34a' }}>
                    {site.template === 'reservation' ? 'event_available' : 'web'}
                  </span>
                </div>

                {/* Infos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-light-text)', margin: 0, textTransform: 'uppercase' }}>
                    {site.business_name}
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: '2px 0 0', fontFamily: 'var(--font-body)' }}>
                    {TEMPLATE_LABEL[site.template]} · {site.slug}
                  </p>
                </div>

                {/* Liens rapides */}
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  {site.vercel_url && (
                    <a
                      href={site.vercel_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      title="Voir le site"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-light-3)', color: 'var(--color-light-text-2)',
                        textDecoration: 'none',
                      }}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span>
                    </a>
                  )}
                  {site.github_repo && (
                    <a
                      href={`https://github.com/${site.github_repo}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      title="Voir le repo"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-light-3)', color: 'var(--color-light-text-2)',
                        textDecoration: 'none',
                      }}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 16 }}>code</span>
                    </a>
                  )}
                </div>

                {/* Statut */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                  padding: '4px 12px', borderRadius: 'var(--radius-full)',
                  background: `${st.color}18`,
                  flexShrink: 0,
                }}>
                  {site.status === 'creating' && (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, animation: 'pulse 1.5s infinite' }} />
                  )}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: st.color, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {st.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
