'use client'

import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || ''

interface Facture {
  id: number
  numero: string
  statut: string
  en_retard: boolean
  total: number
  date_emission: string | null
  date_echeance: string | null
}

type DisplayStatut = 'Payée' | 'En attente' | 'En retard'

const STATUT_STYLES: Record<DisplayStatut, { bg: string; text: string }> = {
  'Payée':      { bg: 'var(--color-success-bg-2)', text: 'var(--color-success-text-2)' },
  'En attente': { bg: 'var(--color-warning-bg-2)', text: 'var(--color-warning-mid-2)' },
  'En retard':  { bg: 'var(--color-error-bg)',      text: 'var(--color-error-text)' },
}

function displayStatut(f: Facture): DisplayStatut {
  if (f.statut === 'payee') return 'Payée'
  return f.en_retard ? 'En retard' : 'En attente'
}

function formatMontant(v: number): string {
  return v.toLocaleString('fr-CA', { minimumFractionDigits: 2 }) + ' $'
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' })
}

const FILTERS: Array<'Toutes' | DisplayStatut> = ['Toutes', 'En attente', 'Payée', 'En retard']

function CorrectionModal({
  facture, onClose, onSent,
}: { facture: Facture; onClose: () => void; onSent: (id: number) => void }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function envoyer() {
    if (!message.trim()) return
    setSending(true)
    setError('')
    try {
      const res = await fetch(`${API}/api/v1/client/factures/${facture.id}/correction`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      })
      if (!res.ok) throw new Error()
      onSent(facture.id)
      onClose()
    } catch {
      setError("Erreur lors de l'envoi. Réessayez.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'oklch(15% 0.01 40 / 0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 'var(--z-modal)' as never, padding: 'var(--space-6)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-light-2)', borderRadius: 'var(--radius-lg)',
          width: '100%', maxWidth: '460px', boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--color-light-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-brand)' }}>flag</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg)', letterSpacing: '-0.01em', color: 'var(--color-light-text)' }}>
              Demander une correction
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{ background: 'none', border: 'none', color: 'var(--color-light-text-3)', cursor: 'pointer', display: 'flex', padding: 'var(--space-1)' }}
          >
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
          </button>
        </div>

        <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>
            Facture <strong style={{ color: 'var(--color-light-text)' }}>{facture.numero}</strong>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '10.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-light-text-3)', fontWeight: 800 }}>
              Décrivez le problème
            </span>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              placeholder="Ex. Le montant ne correspond pas à l'entente…"
              style={{
                width: '100%', border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                background: 'var(--color-light-0)', color: 'var(--color-light-text)', resize: 'vertical',
              }}
            />
          </label>
          {error && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>{error}</span>}
        </div>

        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)',
          padding: 'var(--space-5) var(--space-6)', borderTop: '1px solid var(--color-light-border)',
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'var(--color-light-1)', color: 'var(--color-light-text-2)', border: '1px solid var(--color-light-border)',
              borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-5)',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer',
            }}
          >
            Annuler
          </button>
          <button
            onClick={envoyer}
            disabled={sending || !message.trim()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
              background: 'var(--color-brand)', color: 'white', border: 'none',
              borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-6)',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)',
              cursor: sending || !message.trim() ? 'default' : 'pointer', opacity: sending || !message.trim() ? 0.7 : 1,
            }}
          >
            {sending ? 'Envoi…' : 'Envoyer la demande'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FacturationPage() {
  const [loading, setLoading] = useState(true)
  const [factures, setFactures] = useState<Facture[]>([])
  const [filter, setFilter] = useState<'Toutes' | DisplayStatut>('Toutes')
  const [search, setSearch] = useState('')
  const [modalFacture, setModalFacture] = useState<Facture | null>(null)
  const [correctionsSent, setCorrectionsSent] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetch(`${API}/api/v1/client/factures`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : { factures: [] })
      .then(d => setFactures(Array.isArray(d.factures) ? d.factures : []))
      .catch(() => setFactures([]))
      .finally(() => setLoading(false))
  }, [])

  const withDisplay = factures.map(f => ({ ...f, display: displayStatut(f) }))
  const counts: Record<'Toutes' | DisplayStatut, number> = {
    Toutes: withDisplay.length,
    'En attente': withDisplay.filter(f => f.display === 'En attente').length,
    'Payée': withDisplay.filter(f => f.display === 'Payée').length,
    'En retard': withDisplay.filter(f => f.display === 'En retard').length,
  }

  const q = search.trim().toLowerCase()
  const filtered = withDisplay
    .filter(f => filter === 'Toutes' || f.display === filter)
    .filter(f => !q || f.numero.toLowerCase().includes(q))

  const solde = withDisplay.filter(f => f.display !== 'Payée').reduce((sum, f) => sum + f.total, 0)
  const enAttenteCount = counts['En attente'] + counts['En retard']
  const currentYear = String(new Date().getFullYear())
  const payeAnnee = withDisplay
    .filter(f => f.display === 'Payée' && (f.date_emission || '').startsWith(currentYear))
    .reduce((sum, f) => sum + f.total, 0)

  function voirPdf(id: number) {
    window.open(`${API}/api/v1/client/factures/${id}/pdf?view=1`, '_blank')
  }
  function telechargerPdf(id: number) {
    window.open(`${API}/api/v1/client/factures/${id}/pdf`, '_blank')
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', paddingTop: 'var(--space-12)', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>

      <header style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '36px',
          lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--color-light-text)', marginBottom: 'var(--space-2)',
        }}>
          Facturation
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)' }}>
          Consultez, téléchargez et suivez vos factures.
        </p>
      </header>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30dvh' }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-light-border-2)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
        </div>
      ) : (
        <>
          {/* KPI strip */}
          <section style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'var(--space-4)', marginBottom: 'var(--space-8)',
          }}>
            <div style={{ background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '10.5px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--color-light-text-3)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                Solde à payer
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)', color: solde > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
                {formatMontant(solde)}
              </div>
            </div>
            <div style={{ background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '10.5px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--color-light-text-3)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                Factures en attente
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--color-light-text)' }}>
                {enAttenteCount}
              </div>
            </div>
            <div style={{ background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '10.5px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--color-light-text-3)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                Payé cette année
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--color-light-text)' }}>
                {formatMontant(payeAnnee)}
              </div>
            </div>
          </section>

          {/* Filtres + recherche */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' as const, marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'var(--space-2)' }}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)',
                    border: `1px solid ${filter === f ? 'var(--color-brand)' : 'var(--color-light-border)'}`,
                    cursor: 'pointer', background: filter === f ? 'var(--color-brand)' : 'var(--color-light-2)',
                    color: filter === f ? 'white' : 'var(--color-light-text-2)',
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 700,
                  }}
                >
                  {f} ({counts[f]})
                </button>
              ))}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
              borderRadius: 'var(--radius-full)', padding: '0 var(--space-4)',
            }}>
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-light-text-3)' }}>search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une facture…"
                aria-label="Rechercher une facture"
                style={{
                  border: 'none', background: 'none', outline: 'none', color: 'var(--color-light-text)',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', padding: 'var(--space-3) 0', width: '190px',
                }}
              />
            </div>
          </div>

          {/* Liste de factures */}
          {filtered.length === 0 ? (
            <div style={{
              background: 'var(--color-light-2)', borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-10) var(--space-6)', border: '1px solid var(--color-light-border)',
              display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-light-text-3)',
            }}>
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '30px' }}>
                {factures.length === 0 ? 'receipt_long' : 'search_off'}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
                {factures.length === 0 ? 'Aucune facture pour le moment.' : 'Aucune facture ne correspond à votre recherche.'}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-3)' }}>
              {filtered.map(f => {
                const badge = STATUT_STYLES[f.display]
                return (
                  <div key={f.id} className="rowh" style={{
                    background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
                    borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)',
                    display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' as const,
                  }}>
                    <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-light-text-3)' }}>receipt_long</span>
                    <div style={{ flex: 1, minWidth: '160px' }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-light-text)' }}>
                        {f.numero}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>
                        Émise le {formatDate(f.date_emission)} · Échéance {formatDate(f.date_echeance)}
                      </div>
                    </div>
                    <span style={{
                      display: 'inline-flex', fontSize: '10px', fontWeight: 800, letterSpacing: '0.05em',
                      textTransform: 'uppercase' as const, padding: '4px 10px', borderRadius: 'var(--radius-full)',
                      background: badge.bg, color: badge.text, whiteSpace: 'nowrap' as const,
                    }}>
                      {f.display}
                    </span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-base)', minWidth: '80px', textAlign: 'right' as const, color: 'var(--color-light-text)' }}>
                      {formatMontant(f.total)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <button onClick={() => voirPdf(f.id)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
                        background: 'var(--color-light-1)', border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-sm)',
                        padding: 'var(--space-2) var(--space-3)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-xs)',
                        color: 'var(--color-light-text)', cursor: 'pointer',
                      }}>
                        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                        Voir
                      </button>
                      <button onClick={() => telechargerPdf(f.id)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
                        background: 'var(--color-light-1)', border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-sm)',
                        padding: 'var(--space-2) var(--space-3)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-xs)',
                        color: 'var(--color-light-text)', cursor: 'pointer',
                      }}>
                        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                        PDF
                      </button>
                      <button onClick={() => setModalFacture(f)} disabled={correctionsSent.has(f.id)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
                        background: 'var(--color-light-1)', border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-sm)',
                        padding: 'var(--space-2) var(--space-3)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-xs)',
                        color: correctionsSent.has(f.id) ? 'var(--color-light-text-3)' : 'var(--color-brand)',
                        cursor: correctionsSent.has(f.id) ? 'default' : 'pointer',
                      }}>
                        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>flag</span>
                        {correctionsSent.has(f.id) ? 'Envoyée' : 'Correction'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {modalFacture && (
        <CorrectionModal
          facture={modalFacture}
          onClose={() => setModalFacture(null)}
          onSent={id => setCorrectionsSent(prev => new Set(prev).add(id))}
        />
      )}
    </main>
  )
}
