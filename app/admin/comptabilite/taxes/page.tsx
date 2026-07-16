'use client'

import { useState, useEffect } from 'react'

interface BilanTaxes {
  periode: string
  taxes: { tps_percue: number; tvq_percue: number; tps_payee: number; tvq_payee: number; tps_a_remettre: number; tvq_a_remettre: number }
}

const money = (n: number) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2 }).format(n || 0)

const MOIS = [
  { v: '01', l: 'Janvier' }, { v: '02', l: 'Février' }, { v: '03', l: 'Mars' },
  { v: '04', l: 'Avril' }, { v: '05', l: 'Mai' }, { v: '06', l: 'Juin' },
  { v: '07', l: 'Juillet' }, { v: '08', l: 'Août' }, { v: '09', l: 'Septembre' },
  { v: '10', l: 'Octobre' }, { v: '11', l: 'Novembre' }, { v: '12', l: 'Décembre' },
]

const ANNEE_COURANTE = new Date().getFullYear()
const ANNEES = [ANNEE_COURANTE, ANNEE_COURANTE - 1, ANNEE_COURANTE - 2]

type ModePeriode = 'annee' | 'mois'

export default function TaxesPage() {
  const [modePeriode, setModePeriode] = useState<ModePeriode>('annee')
  const [annee, setAnnee] = useState(String(ANNEE_COURANTE))
  const [mois, setMois] = useState(String(new Date().getMonth() + 1).padStart(2, '0'))
  const [data, setData] = useState<BilanTaxes | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ annee })
    if (modePeriode === 'mois') params.set('mois', mois)
    fetch(`/api/v1/admin/bilan?${params.toString()}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [modePeriode, annee, mois])

  return (
    <div className="max-w-4xl mx-auto">

      <nav className="flex items-center gap-1.5 text-xs font-body text-[var(--color-dark-text-2)] mb-5">
        <span className="font-bold uppercase tracking-wide text-[var(--color-brand)]">Comptabilité</span>
        <span aria-hidden="true" className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-[var(--color-dark-1)] font-semibold">Taxes</span>
      </nav>

      <header className="mb-6">
        <h1 className="font-display text-[var(--color-dark-0)] leading-tight" style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Taxes
        </h1>
        <p className="font-body text-[13px] text-[var(--color-dark-text-2)] mt-1">Suivi de vos taxes perçues et payées, pour préparer votre remise à Revenu Québec.</p>
      </header>

      <section className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-5 mb-6 flex flex-wrap items-center gap-3">
        <button onClick={() => setModePeriode('annee')}
          className={`px-5 py-2.5 rounded-full font-body text-sm font-bold transition-colors ${modePeriode === 'annee' ? 'bg-[var(--color-brand)] text-white' : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)]'}`}>
          Année complète
        </button>
        <button onClick={() => setModePeriode('mois')}
          className={`px-5 py-2.5 rounded-full font-body text-sm font-bold transition-colors ${modePeriode === 'mois' ? 'bg-[var(--color-brand)] text-white' : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)]'}`}>
          Un mois précis
        </button>
        <select value={annee} onChange={e => setAnnee(e.target.value)}
          className="bg-[var(--color-light-0)] border-none rounded-xl px-4 py-2.5 outline-none font-body text-sm">
          {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        {modePeriode === 'mois' && (
          <select value={mois} onChange={e => setMois(e.target.value)}
            className="bg-[var(--color-light-0)] border-none rounded-xl px-4 py-2.5 outline-none font-body text-sm">
            {MOIS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
          </select>
        )}
      </section>

      {loading ? (
        <p className="text-[var(--color-dark-text-2)] font-body text-center py-16">Chargement…</p>
      ) : !data ? (
        <p className="text-[var(--color-dark-text-2)] font-body text-center py-16">Erreur de chargement.</p>
      ) : (
        <div className="flex flex-col gap-6">

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[18px] bg-[var(--color-light-2)] border border-[var(--color-light-border)] p-5">
              <p className="font-display font-extrabold text-2xl text-[var(--color-dark-1)] leading-none">{money(data.taxes.tps_percue)}</p>
              <p className="font-body text-xs uppercase tracking-wide text-[var(--color-dark-text-2)] mt-2">TPS perçue</p>
            </div>
            <div className="rounded-[18px] bg-[var(--color-light-2)] border border-[var(--color-light-border)] p-5">
              <p className="font-display font-extrabold text-2xl text-[var(--color-dark-1)] leading-none">{money(data.taxes.tvq_percue)}</p>
              <p className="font-body text-xs uppercase tracking-wide text-[var(--color-dark-text-2)] mt-2">TVQ perçue</p>
            </div>
            <div className="rounded-[18px] bg-[var(--color-light-2)] border border-[var(--color-light-border)] p-5">
              <p className="font-display font-extrabold text-2xl text-[var(--color-dark-1)] leading-none">{money(data.taxes.tps_payee)}</p>
              <p className="font-body text-xs uppercase tracking-wide text-[var(--color-dark-text-2)] mt-2">TPS payée sur dépenses</p>
            </div>
            <div className="rounded-[18px] bg-[var(--color-light-2)] border border-[var(--color-light-border)] p-5">
              <p className="font-display font-extrabold text-2xl text-[var(--color-dark-1)] leading-none">{money(data.taxes.tvq_payee)}</p>
              <p className="font-body text-xs uppercase tracking-wide text-[var(--color-dark-text-2)] mt-2">TVQ payée sur dépenses</p>
            </div>
          </div>

          <div className="rounded-[18px] p-6 text-white" style={{ background: 'linear-gradient(160deg, var(--color-dark-1), var(--color-dark-0))' }}>
            <p className="font-body text-xs uppercase tracking-wide text-white/60 mb-4">Net estimé à remettre — {data.periode}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-display font-extrabold text-3xl leading-none">{money(data.taxes.tps_a_remettre)}</p>
                <p className="font-body text-xs uppercase tracking-wide text-white/60 mt-2">TPS</p>
              </div>
              <div>
                <p className="font-display font-extrabold text-3xl leading-none">{money(data.taxes.tvq_a_remettre)}</p>
                <p className="font-body text-xs uppercase tracking-wide text-white/60 mt-2">TVQ</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-5">
            <p className="font-body text-sm text-[var(--color-dark-text-2)]">
              Ces montants sont une estimation basée sur vos transactions enregistrées. Confirmez toujours le montant exact et la fréquence de remise applicable (mensuelle, trimestrielle ou annuelle) avec Revenu Québec ou votre comptable avant de produire votre déclaration.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
