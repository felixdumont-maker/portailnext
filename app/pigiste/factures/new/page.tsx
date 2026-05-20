'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Ligne { description: string; quantite: number; taux: number; montant: number; id_mandat?: number }
interface Mandat { id: number; titre: string; montant_convenu: number; statut: string }

function NouvelleFactureForm() {
  const router    = useRouter()
  const params    = useSearchParams()
  const mandatId  = params.get('mandat')

  const [mandats, setMandats]           = useState<Mandat[]>([])
  const [lignes, setLignes]             = useState<Ligne[]>([{ description: '', quantite: 1, taux: 0, montant: 0 }])
  const [notes, setNotes]               = useState('')
  const [dateEcheance, setDateEcheance] = useState('')
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')

  useEffect(() => {
    const d30 = new Date(); d30.setDate(d30.getDate() + 30)
    setDateEcheance(d30.toISOString().slice(0, 10))

    fetch('/api/v1/pigiste/mandats', { credentials: 'include' })
      .then(r => r.json()).then(data => {
        const actifs: Mandat[] = Array.isArray(data) ? data.filter((m: Mandat) => m.statut !== 'annulé') : []
        setMandats(actifs)
        if (mandatId) {
          const m = actifs.find((x: Mandat) => String(x.id) === mandatId)
          if (m) setLignes([{ description: m.titre, quantite: 1, taux: m.montant_convenu, montant: m.montant_convenu, id_mandat: m.id }])
        }
      }).catch(() => {})
  }, [mandatId])

  const updateLigne = (i: number, field: keyof Ligne, val: string | number) => {
    setLignes(prev => {
      const next = [...prev]
      const l = { ...next[i], [field]: val }
      if (field === 'quantite' || field === 'taux') l.montant = Math.round(Number(l.quantite) * Number(l.taux) * 100) / 100
      if (field === 'montant') l.montant = Number(val)
      next[i] = l
      return next
    })
  }

  const addLigne    = () => setLignes(p => [...p, { description: '', quantite: 1, taux: 0, montant: 0 }])
  const removeLigne = (i: number) => setLignes(p => p.filter((_, idx) => idx !== i))
  const totalHT     = lignes.reduce((s, l) => s + (l.montant || 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lignes.some(l => l.description.trim())) { setError('Ajoute au moins une ligne.'); return }
    setSaving(true); setError('')
    try {
      const res  = await fetch('/api/v1/pigiste/factures', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lignes, notes, date_echeance: dateEcheance }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur'); return }
      router.push(`/pigiste/factures/${data.id}`)
    } catch { setError('Erreur de connexion') }
    finally   { setSaving(false) }
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
    background: 'var(--color-light-border)', color: 'var(--color-light-text)',
    border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-sm)',
    padding: '8px 12px', outline: 'none', width: '100%',
    transition: `border-color var(--duration-fast)`,
  }

  return (
    <>
      <style>{`
        @keyframes pg-fade-up { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @media (prefers-reduced-motion:reduce) { .pg-anim { animation:none !important } }
        .pg-input:focus { border-color: 'var(--color-brand)' !important; }
      `}</style>

      <div className="pg-anim" style={{ maxWidth: '760px', animation: 'pg-fade-up 350ms var(--ease-out-quart) both' }}>

        <Link href="/pigiste/factures" style={{
          display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
          color: 'var(--color-light-text-3)', textDecoration: 'none',
          marginBottom: 'var(--space-8)',
        }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
          Retour
        </Link>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.0,
          letterSpacing: '-0.02em', color: 'var(--color-light-text)',
          margin: '0 0 var(--space-10)',
        }}>Nouvelle facture</h1>

        {error && (
          <div style={{
            padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)',
            background: 'var(--color-error-muted)', outline: '1px solid oklch(54% 0.20 25 / 0.4)',
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'oklch(70% 0.14 25)',
            marginBottom: 'var(--space-6)',
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Lignes */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 64px 96px 96px 32px',
              gap: 'var(--space-2)', padding: '0 0 var(--space-3)',
              borderBottom: '1px solid var(--color-light-border)',
              marginBottom: 'var(--space-3)',
            }}>
              {['Description', 'Qté', 'Taux', 'Montant', ''].map(h => (
                <p key={h} style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text-3)', margin: 0, textAlign: h === 'Qté' || h === 'Taux' || h === 'Montant' ? 'right' : 'left' }}>{h}</p>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {lignes.map((l, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 64px 96px 96px 32px', gap: 'var(--space-2)', alignItems: 'start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <input aria-label="Description de la prestation" className="pg-input" type="text" value={l.description} placeholder="Description de la prestation"
                      onChange={e => updateLigne(i, 'description', e.target.value)}
                      style={{ ...inputStyle }} />
                    {mandats.length > 0 && (
                      <select value={l.id_mandat ?? ''} onChange={e => updateLigne(i, 'id_mandat', e.target.value ? Number(e.target.value) : '')}
                        style={{ ...inputStyle, padding: '4px 8px', fontSize: '11px', color: l.id_mandat ? 'var(--color-light-text)' : 'var(--color-light-text-3)' }}>
                        <option value="">Lier à un mandat (optionnel)</option>
                        {mandats.map(m => <option key={m.id} value={m.id}>{m.titre}</option>)}
                      </select>
                    )}
                  </div>
                  <input className="pg-input" type="number" value={l.quantite} min={0} step="0.5"
                    onChange={e => updateLigne(i, 'quantite', parseFloat(e.target.value) || 0)}
                    style={{ ...inputStyle, textAlign: 'right' }} />
                  <input aria-label="0,00" className="pg-input" type="number" value={l.taux} min={0} step="0.01" placeholder="0,00"
                    onChange={e => updateLigne(i, 'taux', parseFloat(e.target.value) || 0)}
                    style={{ ...inputStyle, textAlign: 'right' }} />
                  <input className="pg-input" type="number" value={l.montant} min={0} step="0.01"
                    onChange={e => updateLigne(i, 'montant', parseFloat(e.target.value) || 0)}
                    style={{ ...inputStyle, textAlign: 'right', fontWeight: 600 }} />
                  <button type="button" onClick={() => removeLigne(i)} disabled={lignes.length === 1}
                    style={{
                      background: 'none', border: 'none', cursor: lignes.length === 1 ? 'not-allowed' : 'pointer',
                      color: 'var(--color-light-text-3)', opacity: lignes.length === 1 ? 0.2 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px',
                      transition: `color var(--duration-fast)`,
                    }}
                    onMouseEnter={e => { if (lignes.length > 1) e.currentTarget.style.color = 'oklch(54% 0.20 25)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-light-text-3)' }}
                  >
                    <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Add + total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-light-border)' }}>
              <button type="button" onClick={addLigne} style={{
                display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
                background: 'none', border: '1px dashed var(--color-light-border)',
                borderRadius: 'var(--radius-sm)', padding: '7px 14px', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-3)',
                transition: `color var(--duration-fast), border-color var(--duration-fast)`,
              }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-light-text)'; e.currentTarget.style.borderColor = 'var(--color-light-text-2)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-light-text-3)'; e.currentTarget.style.borderColor = 'var(--color-light-border)' }}
              >
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                Ajouter une ligne
              </button>

              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-1)' }}>Sous-total HT</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-light-text)', margin: 0, lineHeight: 1 }}>
                  {totalHT.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-light-text-3)', margin: 'var(--space-1) 0 0' }}>
                  + taxes selon ton profil
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-5)', marginBottom: 'var(--space-10)' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text-3)', display: 'block', marginBottom: 'var(--space-2)' }}>Échéance</label>
              <input className="pg-input" type="date" value={dateEcheance} onChange={e => setDateEcheance(e.target.value)} style={{ ...inputStyle }} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text-3)', display: 'block', marginBottom: 'var(--space-2)' }}>Notes de paiement</label>
              <textarea className="pg-input" value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="Ex. : virement Interac à pigiste@email.com"
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </div>

          <button type="submit" disabled={saving} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)',
            width: '100%', padding: '14px', borderRadius: 'var(--radius-full)',
            background: saving ? 'var(--color-light-border-2)' : 'var(--color-brand)', color: 'white', border: 'none',
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, letterSpacing: '0.05em',
            cursor: saving ? 'not-allowed' : 'pointer', transition: `background var(--duration-fast)`,
          }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = 'var(--color-brand-hover)' }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = 'var(--color-brand)' }}
          >
            {saving ? 'Création…' : 'Créer la facture'}
          </button>

        </form>
      </div>
    </>
  )
}

export default function NouvelleFacturePage() {
  return <Suspense><NouvelleFactureForm /></Suspense>
}
