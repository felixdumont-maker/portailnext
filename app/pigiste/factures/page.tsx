'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STATUTS: Record<string, { label: string; color: string }> = {
  'brouillon': { label: 'Brouillon', color: 'var(--color-light-text-3)' },
  'soumise':   { label: 'Soumise',   color: 'oklch(72% 0.14 72)' },
  'approuvée': { label: 'Approuvée', color: 'oklch(68% 0.12 240)' },
  'payée':     { label: 'Payée',     color: 'oklch(65% 0.15 145)' },
}

interface Facture { id: number; numero: string; statut: string; montant_total: number; montant_ht: number; tps: number; tvq: number; date_emission: string; date_echeance: string }

export default function PigisteFactures() {
  const [factures, setFactures] = useState<Facture[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch('/api/v1/pigiste/factures', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setFactures(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const en_attente = factures.filter(f => f.statut !== 'payée')
  const payees     = factures.filter(f => f.statut === 'payée')
  const total_a_recevoir = en_attente.reduce((s, f) => s + f.montant_total, 0)
  const total_recu       = payees.reduce((s, f) => s + f.montant_total, 0)

  return (
    <>
      <style>{`
        @keyframes pg-fade-up { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @media (prefers-reduced-motion:reduce) { .pg-anim { animation:none !important } }
      `}</style>

      <div className="pg-anim" style={{ animation: 'pg-fade-up 350ms var(--ease-out-quart) both' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-12)' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.0,
              letterSpacing: '-0.02em', color: 'var(--color-light-text)', margin: 0,
            }}>Mes factures</h1>
          </div>
          <Link href="/pigiste/factures/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
            background: 'var(--color-brand)', color: 'white', textDecoration: 'none',
            borderRadius: 'var(--radius-full)', padding: '10px 20px',
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 700,
            letterSpacing: '0.04em', transition: `background var(--duration-fast)`,
            flexShrink: 0,
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-brand-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-brand)')}
          >
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            Nouvelle
          </Link>
        </div>

        {/* Financial summary */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-8)', marginBottom: 'var(--space-12)',
          paddingBottom: 'var(--space-12)', borderBottom: '1px solid var(--color-light-border)',
        }}>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-2)' }}>À recevoir</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: en_attente.length > 0 ? 'oklch(72% 0.14 72)' : 'var(--color-light-text-3)', margin: 0, lineHeight: 1 }}>
              {total_a_recevoir.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 'var(--space-2) 0 0' }}>
              {en_attente.length} facture{en_attente.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-2)' }}>Total reçu</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: payees.length > 0 ? 'oklch(65% 0.15 145)' : 'var(--color-light-text-3)', margin: 0, lineHeight: 1 }}>
              {total_recu.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 'var(--space-2) 0 0' }}>
              {payees.length} facture{payees.length !== 1 ? 's' : ''} payée{payees.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--color-light-text-3)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>Chargement…</p>
        ) : factures.length === 0 ? (
          <div style={{ paddingTop: 'var(--space-8)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-4)', lineHeight: 'var(--leading-relaxed)', maxWidth: '50ch' }}>
              Tes factures apparaîtront ici. Crée-en une dès qu&apos;un mandat est approuvé pour être payé rapidement.
            </p>
            <Link href="/pigiste/factures/new" style={{
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)',
              color: 'var(--color-brand)', textDecoration: 'none',
            }}>Créer ma première facture →</Link>
          </div>
        ) : (
          <div>
            {factures.map((f, i) => {
              const s = STATUTS[f.statut] ?? STATUTS['brouillon']
              return (
                <Link key={f.id} href={`/pigiste/factures/${f.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'auto 1fr auto auto',
                    alignItems: 'center', gap: 'var(--space-6)',
                    padding: 'var(--space-5) 0',
                    borderBottom: i < factures.length - 1 ? '1px solid var(--color-light-border)' : 'none',
                    transition: `opacity var(--duration-fast)`,
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.65')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-light-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-light-text-3)' }}>receipt_long</span>
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--color-light-text)', margin: '0 0 3px' }}>{f.numero}</p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 0 }}>{f.date_emission}</p>
                    </div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: s.color, whiteSpace: 'nowrap' }}>
                      {s.label}
                    </span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-light-text)', whiteSpace: 'nowrap', textAlign: 'right' }}>
                      {f.montant_total.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                    </span>
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
