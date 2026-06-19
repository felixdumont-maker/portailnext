'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const STATUTS: Record<string, { label: string; color: string; bg: string }> = {
  'brouillon': { label: 'Brouillon', color: 'var(--color-light-text-3)',   bg: 'var(--color-dark-3-50pct)' },
  'soumise':   { label: 'Soumise',   color: 'var(--color-warning-mid)',         bg: 'var(--color-warning-mid-bg-2)' },
  'approuvée': { label: 'Approuvée', color: 'var(--color-info-mid)',        bg: 'var(--color-info-mid-bg-2)' },
  'payée':     { label: 'Payée',     color: 'var(--color-success-mid)',        bg: 'var(--color-success-mid-bg-2)' },
}

interface Ligne { id: number; description: string; quantite: number; taux: number; montant: number; id_mandat?: number }
interface Facture {
  id: number; numero: string; statut: string
  date_emission: string; date_echeance: string
  montant_ht: number; tps: number; tvq: number; montant_total: number
  notes: string; lignes: Ligne[]; nom_pigiste: string; has_pdf: boolean
}

export default function PigisteFactureDetail() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()
  const [f, setF]             = useState<Facture | null>(null)
  const [submitting, setSubmitting]     = useState(false)
  const [downloading, setDownloading]   = useState(false)
  const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500) }

  const load = () => fetch(`/api/v1/pigiste/factures/${id}`, { credentials: 'include' })
    .then(r => { if (!r.ok) { router.push('/pigiste/factures'); return null } return r.json() })
    .then(data => { if (data) setF(data) })

  useEffect(() => { load() }, [id])

  const handleTelecharger = async () => {
    setDownloading(true)
    try {
      const res = await fetch(`/api/v1/pigiste/factures/${id}/pdf`, { credentials: 'include' })
      if (!res.ok) { showToast('PDF non disponible', false); return }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${f?.numero}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch { showToast('Erreur de téléchargement', false) }
    finally   { setDownloading(false) }
  }

  const handleSoumettre = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/v1/pigiste/factures/${id}/soumettre`, { method: 'POST', credentials: 'include' })
      if (res.ok) { showToast('Facture soumise à Cocktail Média.'); load() }
      else showToast('Erreur lors de la soumission', false)
    } catch { showToast('Erreur de connexion', false) }
    finally   { setSubmitting(false) }
  }

  if (!f) return <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-light-text-3)', paddingTop: 'var(--space-8)' }}>Chargement…</p>

  const s = STATUTS[f.statut] ?? STATUTS['brouillon']

  return (
    <>
      <style>{`
        @keyframes pg-slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion:reduce) {
          .pg-anim { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 'var(--z-toast)' as never,
          padding: '12px 18px', borderRadius: 'var(--radius-md)',
          background: toast.ok ? 'var(--color-success-mid)' : 'var(--color-error)',
          color: 'white', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          boxShadow: '0 8px 24px var(--color-black-40pct)',
        }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      <div>
        <Link href="/pigiste/factures" style={{
          display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
          color: 'var(--color-light-text-3)', textDecoration: 'none',
          marginBottom: 'var(--space-8)',
          transition: `color var(--duration-fast)`,
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-light-text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-light-text-3)')}
        >
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
          Retour aux factures
        </Link>

        {/* ── Document ── */}
        <div className="pg-anim" style={{
          maxWidth: '680px',
          background: 'var(--color-surface-warm)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 32px 64px var(--overlay-dark)',
          marginBottom: 'var(--space-6)',
          animation: 'pg-slide-up 450ms var(--ease-out-quart) both',
        }}>

          {/* Document header — dark */}
          <div style={{
            background: 'var(--color-light-0)',
            padding: 'var(--space-8)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            gap: 'var(--space-6)',
          }}>
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-2)' }}>Facture</p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--color-light-text)', margin: '0 0 var(--space-3)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {f.numero}
              </h1>
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: s.bg, color: s.color,
                fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>{s.label}</span>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-1)' }}>Émise le</p>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', margin: '0 0 var(--space-4)' }}>{f.date_emission}</p>
              {f.date_echeance && <>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-1)' }}>Échéance</p>
                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', margin: 0 }}>{f.date_echeance}</p>
              </>}
            </div>
          </div>

          {/* Document body — light */}
          <div style={{ padding: 'var(--space-8)', color: 'var(--color-light-text)' }}>

            {/* From / To */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', marginBottom: 'var(--space-8)', paddingBottom: 'var(--space-8)', borderBottom: '1px solid var(--color-light-border)' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-3)' }}>De</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-light-text)', margin: '0 0 var(--space-1)', letterSpacing: '-0.01em' }}>{f.nom_pigiste}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-2)', margin: 0 }}>Travailleur autonome</p>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-3)' }}>À</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-light-text)', margin: '0 0 var(--space-1)', letterSpacing: '-0.01em' }}>Cocktail Média</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-2)', margin: 0 }}>felix.dumont@cocktailmedia.ca</p>
              </div>
            </div>

            {/* Line items */}
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 80px 80px', gap: 'var(--space-3)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-light-border)', marginBottom: 'var(--space-2)' }}>
                {['Prestation', 'Qté', 'Taux', 'Montant'].map(h => (
                  <p key={h} style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-light-text-3)', margin: 0, textAlign: h === 'Prestation' ? 'left' : 'right' }}>{h}</p>
                ))}
              </div>
              {f.lignes.map((l, i) => (
                <div key={l.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 52px 80px 80px', gap: 'var(--space-3)',
                  padding: 'var(--space-3) 0',
                  borderBottom: i < f.lignes.length - 1 ? '1px solid var(--color-border-warm)' : 'none',
                }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', margin: 0, lineHeight: 'var(--leading-snug)' }}>{l.description}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-2)', margin: 0, textAlign: 'right' }}>{l.quantite}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-2)', margin: 0, textAlign: 'right' }}>{l.taux.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-light-text)', margin: 0, textAlign: 'right' }}>{l.montant.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: f.notes ? 'var(--space-8)' : 0 }}>
              <div style={{ minWidth: '260px' }}>
                {[
                  { label: 'Sous-total', val: f.montant_ht, small: false },
                  ...(f.tps > 0   ? [{ label: 'TPS (5 %)',       val: f.tps,   small: true }] : []),
                  ...(f.tvq > 0   ? [{ label: 'TVQ (9,975 %)',   val: f.tvq,   small: true }] : []),
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-2)' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: row.small ? 'var(--text-xs)' : 'var(--text-sm)', color: 'var(--color-light-text-2)' }}>{row.label}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: row.small ? 'var(--text-xs)' : 'var(--text-sm)', color: 'var(--color-light-text)' }}>{row.val.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 'var(--space-3)', marginTop: 'var(--space-2)', borderTop: '2px solid var(--color-light-text)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-light-text)', letterSpacing: '0.04em' }}>TOTAL</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-light-text)', lineHeight: 1, letterSpacing: '-0.01em' }}>
                    {f.montant_total.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {f.notes && (
              <div style={{ paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-light-border)', marginTop: 'var(--space-6)' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-3)' }}>Notes</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-2)', margin: 0, lineHeight: 'var(--leading-relaxed)', maxWidth: '55ch' }}>{f.notes}</p>
              </div>
            )}

          </div>
        </div>

        {/* Actions */}
        <div style={{ maxWidth: '680px' }}>
          {f.statut === 'brouillon' && (
            <button onClick={handleSoumettre} disabled={submitting} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)',
              width: '100%', padding: '14px', borderRadius: 'var(--radius-full)',
              background: submitting ? 'var(--color-light-border-2)' : 'var(--color-brand)', color: 'white', border: 'none',
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, letterSpacing: '0.05em',
              cursor: submitting ? 'not-allowed' : 'pointer', transition: `background var(--duration-fast)`,
            }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = 'var(--color-brand-hover)' }}
              onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = 'var(--color-brand)' }}
            >
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
              {submitting ? 'Envoi…' : 'Soumettre à Cocktail Média'}
            </button>
          )}

          {f.statut === 'soumise' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-5)', background: 'var(--color-warning-mid-bg-3)', borderRadius: 'var(--radius-md)', outline: '1px solid var(--color-warning-mid-ring)' }}>
              <span aria-hidden="true" className="material-symbols-outlined" style={{ color: 'var(--color-warning-mid)', fontSize: '20px' }}>hourglass_empty</span>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--color-warning-mid)', margin: 0, fontSize: 'var(--text-sm)' }}>
                Facture soumise — en attente d&apos;approbation.
              </p>
            </div>
          )}

          {f.statut === 'payée' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-5)', background: 'var(--color-success-mid-bg-3)', borderRadius: 'var(--radius-md)', outline: '1px solid var(--color-success-mid-ring)' }}>
              <span aria-hidden="true" className="material-symbols-outlined" style={{ color: 'var(--color-success-mid)', fontSize: '20px' }}>check_circle</span>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--color-success-mid)', margin: 0, fontSize: 'var(--text-sm)' }}>
                Cette facture a été payée.
              </p>
            </div>
          )}

          {f.statut !== 'brouillon' && f.has_pdf && (
            <button onClick={handleTelecharger} disabled={downloading} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)',
              width: '100%', padding: '12px', borderRadius: 'var(--radius-full)',
              background: 'transparent', color: 'var(--color-light-text-2)',
              border: '1px solid var(--color-light-border-2)',
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, letterSpacing: '0.04em',
              cursor: downloading ? 'not-allowed' : 'pointer',
              marginTop: 'var(--space-3)',
              transition: `border-color var(--duration-fast), color var(--duration-fast)`,
            }}
              onMouseEnter={e => { if (!downloading) { e.currentTarget.style.borderColor = 'var(--color-light-text-2)'; e.currentTarget.style.color = 'var(--color-light-text)' } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-light-border-2)'; e.currentTarget.style.color = 'var(--color-light-text-2)' }}
            >
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
              {downloading ? 'Téléchargement…' : 'Télécharger le PDF'}
            </button>
          )}
        </div>

      </div>
    </>
  )
}
