'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Projet {
  id: number
  nom_projet: string
  statut: string
  date_livraison_estimee: string
  created_at: string
  is_archived: number
  checklist: { ready: number; done: number; total: number }
}

interface DashboardData {
  projets_actifs: Projet[]
  projets_archives: Projet[]
  user: { id: number; nom: string; is_admin: boolean }
}

const STATUT_STYLES: Record<string, { bg: string; text: string }> = {
  'Documents à donner': { bg: 'var(--color-fire-bg)',    text: 'var(--color-fire-text)'  },
  'Documents reçus':    { bg: 'var(--color-info-bg-2)',   text: 'var(--color-info-text)' },
  'Travaux en cours':   { bg: 'var(--color-brand-muted)', text: 'var(--color-brand-hover)' },
  'En révision':        { bg: 'var(--color-warning-bg-2)',    text: 'var(--color-warning-mid-2)'  },
  'Travaux terminés':   { bg: 'var(--color-success-bg-2)',   text: 'var(--color-success-text-2)' },
  'Complété':           { bg: 'var(--color-success-bg-2)',   text: 'var(--color-success-text-2)' },
  'Annulé':             { bg: 'var(--color-light-0)',   text: 'var(--color-light-text-3)' },
}

const MOCK: DashboardData = {
  projets_actifs: [
    { id: 1, nom_projet: 'Refonte de Logo', statut: 'En révision', date_livraison_estimee: '2026-04-27', created_at: '2026-04-10', is_archived: 0, checklist: { ready: 3, done: 3, total: 5 } },
    { id: 2, nom_projet: 'Vidéo Corporative', statut: 'Documents reçus', date_livraison_estimee: '2026-04-15', created_at: '2026-04-05', is_archived: 0, checklist: { ready: 5, done: 5, total: 5 } },
    { id: 3, nom_projet: 'Plan de Communication', statut: 'Documents à donner', date_livraison_estimee: '2026-05-30', created_at: '2026-04-12', is_archived: 0, checklist: { ready: 1, done: 1, total: 10 } },
  ],
  projets_archives: [
    { id: 4, nom_projet: 'Campagne Réseaux Sociaux 2025', statut: 'Complété', date_livraison_estimee: '', created_at: '2025-01-01', is_archived: 1, checklist: { ready: 0, done: 0, total: 0 } },
  ],
  user: { id: 1, nom: 'Félix', is_admin: false }
}

function ProjetCard({ projet }: { projet: Projet }) {
  const [hovered, setHovered] = useState(false)
  const badge = STATUT_STYLES[projet.statut] || STATUT_STYLES['Annulé']
  const pct = projet.checklist.total > 0
    ? Math.round((projet.checklist.done / projet.checklist.total) * 100)
    : 0

  return (
    <Link href={`/projet/${projet.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'var(--color-light-2)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          border: '1px solid',
          borderColor: hovered ? 'var(--color-brand-25pct)' : 'var(--color-light-border)',
          boxShadow: hovered ? '0 4px 20px var(--color-brand-6pct)' : 'none',
          transition: `border-color var(--duration-base), box-shadow var(--duration-base)`,
          cursor: 'pointer',
        }}
      >
        {/* Top row — creation date + status badge */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 'var(--space-3)',
        }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--color-light-text-3)',
          }}>
            {new Date(projet.created_at).toLocaleDateString('fr-CA')}
          </span>
          <span style={{
            background: badge.bg,
            color: badge.text,
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap' as const,
          }}>
            {projet.statut}
          </span>
        </div>

        {/* Project name */}
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'var(--text-xl)',
          lineHeight: 'var(--leading-snug)',
          letterSpacing: '-0.01em',
          textTransform: 'uppercase' as const,
          color: 'var(--color-light-text)',
          margin: '0 0 var(--space-6)',
        }}>
          {projet.nom_projet.split(' — ')[1] || projet.nom_projet}
        </h3>

        {/* Progress */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              color: 'var(--color-light-text-3)',
            }}>
              Progression
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              color: pct === 100 ? 'var(--color-success)' : 'var(--color-light-text)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {pct}%
            </span>
          </div>

          <div style={{
            height: '3px',
            background: 'var(--color-light-0)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: '100%',
              background: pct === 100 ? 'var(--color-success)' : 'var(--color-brand)',
              borderRadius: 'var(--radius-full)',
              transform: `scaleX(${pct / 100})`,
              transformOrigin: 'left',
              transition: `transform var(--duration-slow) var(--ease-out-quart)`,
            }} />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 'var(--space-1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '14px', color: 'var(--color-brand)', lineHeight: 1 }}
              >
                description
              </span>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-light-text-3)',
                fontWeight: 500,
              }}>
                {projet.checklist.done}/{projet.checklist.total} documents
              </span>
            </div>
            {projet.date_livraison_estimee && (
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-light-text-3)',
              }}>
                Livraison{' '}
                <span style={{ color: 'var(--color-light-text)', fontWeight: 600 }}>
                  {new Date(projet.date_livraison_estimee).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' })}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(MOCK)
  const [showArchives, setShowArchives] = useState(false)

  useEffect(() => {
    fetch('/api/v1/dashboard', { credentials: 'include' })
      .then(res => res.json())
      .then(setData)
      .catch(() => setData(MOCK))
  }, [])

  const prenom = data.user.nom.split(' ')[0]

  return (
    <div style={{
      maxWidth: '840px',
      margin: '0 auto',
      padding: '0 var(--space-6)',
      paddingTop: 'var(--space-12)',
    }}>

      {/* Header */}
      <header style={{ marginBottom: 'var(--space-12)' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'var(--text-3xl)',
          lineHeight: 1.0,
          letterSpacing: '-0.025em',
          textTransform: 'uppercase' as const,
          color: 'var(--color-light-text)',
          margin: '0 0 var(--space-2)',
        }}>
          Bonjour, {prenom}
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          color: 'var(--color-light-text-3)',
          margin: 0,
          lineHeight: 'var(--leading-normal)',
        }}>
          Voici vos projets en cours
        </p>
      </header>

      {/* Active projects */}
      <section>
        <h2 style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.12em',
          color: 'var(--color-light-text-3)',
          margin: '0 0 var(--space-4)',
        }}>
          Mes projets
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-4)' }}>
          {data.projets_actifs.map(p => (
            <ProjetCard key={p.id} projet={p} />
          ))}
          {data.projets_actifs.length === 0 && (
            <div style={{
              background: 'var(--color-light-2)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-12)',
              textAlign: 'center' as const,
              border: '1px solid var(--color-light-border)',
            }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '40px', color: 'var(--color-light-border-2)', display: 'block', marginBottom: 'var(--space-4)' }}
              >
                folder_open
              </span>
              <p style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--color-light-text-3)',
                margin: 0,
              }}>
                Aucun projet actif pour le moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Archives */}
      {data.projets_archives.length > 0 && (
        <section style={{ marginTop: 'var(--space-16)' }}>
          <button
            onClick={() => setShowArchives(!showArchives)}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-light-text-3)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-2) 0',
              minHeight: '44px',
              transition: `color var(--duration-fast)`,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-light-text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-light-text-3)')}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '18px',
                transform: showArchives ? 'rotate(180deg)' : 'none',
                transition: `transform var(--duration-base) var(--ease-out-quart)`,
              }}
            >
              expand_more
            </span>
            {showArchives
              ? 'Masquer les archives'
              : `Voir les archives (${data.projets_archives.length})`}
          </button>

          {showArchives && (
            <div style={{
              marginTop: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column' as const,
              gap: 'var(--space-4)',
              opacity: 0.65,
            }}>
              {data.projets_archives.map(p => (
                <ProjetCard key={p.id} projet={p} />
              ))}
            </div>
          )}
        </section>
      )}

    </div>
  )
}
