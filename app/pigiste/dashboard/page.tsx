'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const S_MANDAT: Record<string, { label: string; color: string }> = {
  'en_attente': { label: 'En attente', color: 'var(--color-light-text-3)' },
  'en_cours':   { label: 'En cours',   color: 'oklch(72% 0.14 72)' },
  'remis':      { label: 'Remis',      color: 'oklch(68% 0.12 240)' },
  'approuvé':   { label: 'Approuvé',   color: 'oklch(65% 0.15 145)' },
  'annulé':     { label: 'Annulé',     color: 'oklch(55% 0.10 25)' },
}

const S_FACTURE: Record<string, { label: string; color: string }> = {
  'brouillon': { label: 'Brouillon', color: 'var(--color-light-text-3)' },
  'soumise':   { label: 'Soumise',   color: 'oklch(72% 0.14 72)' },
  'approuvée': { label: 'Approuvée', color: 'oklch(68% 0.12 240)' },
  'payée':     { label: 'Payée',     color: 'oklch(65% 0.15 145)' },
}

interface Mandat { id: number; titre: string; statut: string; date_echeance: string; montant_convenu: number; nom_projet: string }
interface Facture { id: number; numero: string; statut: string; montant_total: number }
interface Dashboard { mandats_actifs: Mandat[]; factures_en_attente: Facture[]; nb_mandats_actifs: number; nb_factures_en_attente: number }

export default function PigisteDashboard() {
  const [data, setData]   = useState<Dashboard | null>(null)
  const [nom, setNom]     = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/auth/me', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/v1/pigiste/dashboard', { credentials: 'include' }).then(r => r.json()),
    ]).then(([me, dash]) => {
      setNom(me.nom ?? '')
      setData(dash)
      setReady(true)
    }).catch(() => setReady(true))
  }, [])

  const prenom = nom.split(' ')[0] || ''

  return (
    <>
      <style>{`
        @keyframes pg-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pg-anim { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      <div style={{ opacity: ready ? 1 : 0, transition: 'opacity 200ms' }}>

        {/* ── Greeting ── */}
        <div className="pg-anim" style={{ marginBottom: 'var(--space-12)', animation: 'pg-fade-up 400ms var(--ease-out-quart) both' }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
            color: 'var(--color-light-text-3)', letterSpacing: '0.06em',
            textTransform: 'uppercase', margin: '0 0 var(--space-2)',
          }}>
            Bonjour,
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(3rem, 8vw, 5.5rem)',
            lineHeight: 1.0, margin: 0, letterSpacing: '-0.02em',
            color: 'var(--color-light-text)',
          }}>
            {prenom || '—'}
          </h1>
        </div>

        {/* ── Stats row ── */}
        <div className="pg-anim" style={{
          display: 'flex', gap: 'var(--space-12)', marginBottom: 'var(--space-16)',
          paddingBottom: 'var(--space-12)',
          borderBottom: '1px solid var(--color-light-border)',
          animation: 'pg-fade-up 400ms 80ms var(--ease-out-quart) both',
        }}>
          {[
            { val: data?.nb_mandats_actifs ?? '—', label: 'mandats actifs', href: '/pigiste/mandats' },
            { val: data?.nb_factures_en_attente ?? '—', label: 'factures en attente', href: '/pigiste/factures' },
          ].map(s => (
            <Link key={s.label} href={s.href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1,
                color: 'var(--color-light-text)',
              }}>{s.val}</span>
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                color: 'var(--color-light-text-3)', letterSpacing: '0.03em',
              }}>{s.label}</span>
            </Link>
          ))}
        </div>

        {/* ── Content ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-12)' }}>

          {/* Mandats */}
          <div className="pg-anim" style={{ animation: 'pg-fade-up 400ms 160ms var(--ease-out-quart) both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-6)' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)',
                color: 'var(--color-light-text)', margin: 0, letterSpacing: '-0.01em',
              }}>Mandats actifs</h2>
              <Link href="/pigiste/mandats" style={{
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
                color: 'var(--color-brand)', textDecoration: 'none', fontWeight: 600,
              }}>Tous →</Link>
            </div>

            {!data ? (
              <p style={{ color: 'var(--color-light-text-3)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>Chargement…</p>
            ) : data.mandats_actifs.length === 0 ? (
              <div style={{ padding: 'var(--space-8) 0' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-2)', lineHeight: 'var(--leading-relaxed)' }}>
                  Tes mandats apparaîtront ici dès qu&apos;un projet te sera assigné.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {data.mandats_actifs.map((m, i) => {
                  const s = S_MANDAT[m.statut] ?? S_MANDAT['en_attente']
                  return (
                    <Link key={m.id} href={`/pigiste/mandats/${m.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        padding: 'var(--space-4) 0',
                        borderBottom: i < data.mandats_actifs.length - 1 ? '1px solid var(--color-light-border)' : 'none',
                        display: 'flex', flexDirection: 'column', gap: 'var(--space-2)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                          <p style={{
                            fontFamily: 'var(--font-body)', fontWeight: 600,
                            fontSize: 'var(--text-base)', color: 'var(--color-light-text)',
                            margin: 0, flex: 1, lineHeight: 'var(--leading-snug)',
                          }}>{m.titre}</p>
                          <span style={{
                            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
                            fontWeight: 700, color: s.color,
                            flexShrink: 0, paddingTop: '2px',
                          }}>{s.label}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>
                            {m.nom_projet || (m.date_echeance ? `Échéance ${m.date_echeance}` : '')}
                          </span>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-light-text)' }}>
                            {m.montant_convenu.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Factures */}
          <div className="pg-anim" style={{ animation: 'pg-fade-up 400ms 240ms var(--ease-out-quart) both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-6)' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)',
                color: 'var(--color-light-text)', margin: 0, letterSpacing: '-0.01em',
              }}>Factures récentes</h2>
              <Link href="/pigiste/factures/new" style={{
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
                color: 'var(--color-brand)', textDecoration: 'none', fontWeight: 600,
              }}>+ Nouvelle</Link>
            </div>

            {!data ? (
              <p style={{ color: 'var(--color-light-text-3)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>Chargement…</p>
            ) : data.factures_en_attente.length === 0 ? (
              <div style={{ padding: 'var(--space-8) 0' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-4)', lineHeight: 'var(--leading-relaxed)' }}>
                  Crée une facture pour un mandat complété et soumets-la directement à Cocktail Média.
                </p>
                <Link href="/pigiste/factures/new" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600,
                  color: 'var(--color-brand)', textDecoration: 'none',
                }}>
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                  Créer une facture
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {data.factures_en_attente.map((f, i) => {
                  const s = S_FACTURE[f.statut] ?? S_FACTURE['brouillon']
                  return (
                    <Link key={f.id} href={`/pigiste/factures/${f.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        padding: 'var(--space-4) 0',
                        borderBottom: i < data.factures_en_attente.length - 1 ? '1px solid var(--color-light-border)' : 'none',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)',
                      }}>
                        <div>
                          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', margin: '0 0 4px' }}>{f.numero}</p>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: s.color, fontWeight: 600 }}>{s.label}</span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-light-text)' }}>
                          {f.montant_total.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
