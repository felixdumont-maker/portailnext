'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STATUTS: Record<string, { label: string; color: string }> = {
  'en_attente': { label: 'En attente', color: 'var(--color-light-text-3)' },
  'en_cours':   { label: 'En cours',   color: 'oklch(72% 0.14 72)' },
  'remis':      { label: 'Remis',      color: 'oklch(68% 0.12 240)' },
  'approuvé':   { label: 'Approuvé',   color: 'oklch(65% 0.15 145)' },
  'annulé':     { label: 'Annulé',     color: 'oklch(55% 0.10 25)' },
}

const FILTRES = [
  { key: 'tous',       label: 'Tous' },
  { key: 'en_attente', label: 'En attente' },
  { key: 'en_cours',   label: 'En cours' },
  { key: 'remis',      label: 'Remis' },
  { key: 'approuvé',   label: 'Approuvé' },
  { key: 'annulé',     label: 'Annulé' },
]

interface Mandat { id: number; titre: string; statut: string; date_debut: string; date_echeance: string; montant_convenu: number; nom_projet: string; description: string }

export default function PigisteMandats() {
  const [mandats, setMandats] = useState<Mandat[]>([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre]   = useState('tous')

  useEffect(() => {
    fetch('/api/v1/pigiste/mandats', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setMandats(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const affiches = filtre === 'tous' ? mandats : mandats.filter(m => m.statut === filtre)

  return (
    <>
      <style>{`
        @keyframes pg-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) { .pg-anim { animation: none !important; } }
      `}</style>

      <div className="pg-anim" style={{ animation: 'pg-fade-up 350ms var(--ease-out-quart) both' }}>

        {/* Header */}
        <div style={{ marginBottom: 'var(--space-10)' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            lineHeight: 1.0, letterSpacing: '-0.02em',
            color: 'var(--color-light-text)', margin: '0 0 var(--space-2)',
          }}>Mes mandats</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-3)', margin: 0 }}>
            {mandats.length} mandat{mandats.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
          {FILTRES.map(f => (
            <button key={f.key} onClick={() => setFiltre(f.key)} style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 600,
              letterSpacing: '0.04em',
              padding: '5px 14px', borderRadius: 'var(--radius-full)',
              cursor: 'pointer', transition: `background var(--duration-fast), color var(--duration-fast)`,
              background: filtre === f.key ? 'var(--color-brand)' : 'var(--color-light-border)',
              color: filtre === f.key ? 'white' : 'var(--color-light-text-2)',
              border: 'none',
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <p style={{ color: 'var(--color-light-text-3)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>Chargement…</p>
        ) : affiches.length === 0 ? (
          <div style={{ paddingTop: 'var(--space-16)', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-light-text-3)', margin: '0 0 var(--space-3)' }}>—</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-3)' }}>Aucun mandat{filtre !== 'tous' ? ' dans cette catégorie' : ''}.</p>
          </div>
        ) : (
          <div>
            {affiches.map((m, i) => {
              const s = STATUTS[m.statut] ?? STATUTS['en_attente']
              return (
                <Link key={m.id} href={`/pigiste/mandats/${m.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    padding: 'var(--space-6) 0',
                    borderBottom: '1px solid var(--color-light-border)',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 'var(--space-6)',
                    alignItems: 'start',
                    transition: `opacity var(--duration-fast)`,
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: s.color }}>
                          {s.label}
                        </span>
                        {m.nom_projet && (
                          <>
                            <span style={{ color: 'var(--color-light-border)', fontSize: '10px' }}>·</span>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>
                              {m.nom_projet}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 style={{
                        fontFamily: 'var(--font-display)', fontWeight: 700,
                        fontSize: 'var(--text-xl)', lineHeight: 'var(--leading-snug)',
                        color: 'var(--color-light-text)', margin: '0 0 var(--space-2)', letterSpacing: '-0.01em',
                      }}>{m.titre}</h3>
                      {m.description && (
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-3)', margin: 0, lineHeight: 'var(--leading-relaxed)', maxWidth: '60ch' }}>
                          {m.description.length > 120 ? m.description.slice(0, 120) + '…' : m.description}
                        </p>
                      )}
                      {m.date_echeance && (
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 'var(--space-3) 0 0' }}>
                          Échéance : {m.date_echeance}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', paddingTop: 'var(--space-1)' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-light-text)', whiteSpace: 'nowrap' }}>
                        {m.montant_convenu.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                      </span>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 'var(--space-1) 0 0', textAlign: 'right' }}>convenu</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
