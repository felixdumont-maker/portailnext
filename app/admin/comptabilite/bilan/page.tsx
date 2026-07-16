'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface CategorieLigne { categorie: string; ligne_t2125: string; ligne_tp80: string; total: number; nb: number }
interface Bilan {
  periode: string
  revenus: { total: number; nb: number }
  depenses: { total: number; nb: number }
  profit_net: number
  revenus_par_categorie: CategorieLigne[]
  depenses_par_categorie: CategorieLigne[]
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

function CategorieTable({ titre, lignes, accentColor }: { titre: string; lignes: CategorieLigne[]; accentColor: string }) {
  return (
    <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--color-light-border)]">
        <h2 className="font-display text-base uppercase tracking-wide text-[var(--color-dark-1)]">{titre}</h2>
      </div>
      {lignes.length === 0 ? (
        <p className="text-[var(--color-dark-text-2)] font-body text-sm text-center py-8">Aucune donnée pour cette période.</p>
      ) : (
        <div className="overflow-x-auto"><table className="w-full text-left">
          <thead className="bg-[var(--color-light-1)]">
            <tr>
              {['Catégorie', 'Ligne fiscale', 'Montant'].map(h => (
                <th key={h} className="px-6 py-3 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-light-border)]">
            {lignes.map(l => (
              <tr key={l.categorie} className="hover:bg-[var(--color-light-1)] transition-colors">
                <td className="px-6 py-3 font-body text-sm text-[var(--color-dark-1)] font-semibold">{l.categorie}</td>
                <td className="px-6 py-3 font-body text-xs text-[var(--color-dark-text-2)]">
                  {l.ligne_t2125 && <span className="mr-2">T2125 : {l.ligne_t2125}</span>}
                  {l.ligne_tp80 && <span>TP-80 : {l.ligne_tp80}</span>}
                </td>
                <td className="px-6 py-3 font-body font-bold text-sm tabular-nums" style={{ color: accentColor }}>{money(l.total)}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </div>
  )
}

export default function BilanPage() {
  const [modePeriode, setModePeriode] = useState<ModePeriode>('annee')
  const [annee, setAnnee] = useState(String(ANNEE_COURANTE))
  const [mois, setMois] = useState(String(new Date().getMonth() + 1).padStart(2, '0'))
  const [bilan, setBilan] = useState<Bilan | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const vueTaxes = searchParams.get('vue') === 'taxes'
  const [menuOuvert, setMenuOuvert] = useState(false)

  const chargerBilan = () => {
    setLoading(true)
    const params = new URLSearchParams({ annee })
    if (modePeriode === 'mois') params.set('mois', mois)
    fetch(`/api/v1/admin/bilan?${params.toString()}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setBilan(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { chargerBilan() }, [modePeriode, annee, mois])

  const chargeTaxes = bilan && (bilan.taxes.tps_percue !== 0 || bilan.taxes.tvq_percue !== 0 || bilan.taxes.tps_payee !== 0 || bilan.taxes.tvq_payee !== 0)

  useEffect(() => {
    if (vueTaxes && !loading && bilan) {
      document.getElementById('taxes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [vueTaxes, loading, bilan])

  const urlExport = (rapport: 'bilan' | 'revenus' | 'depenses', format: 'pdf' | 'xlsx' | 'csv') => {
    const params = new URLSearchParams({ annee, format, rapport })
    if (modePeriode === 'mois') params.set('mois', mois)
    return `/api/v1/admin/bilan/export?${params.toString()}`
  }

  return (
    <div className="max-w-5xl mx-auto">

      <nav className="flex items-center gap-1.5 text-xs font-body text-[var(--color-dark-text-2)] mb-5">
        <span className="font-bold uppercase tracking-wide text-[var(--color-brand)]">Comptabilité</span>
        <span aria-hidden="true" className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-[var(--color-dark-1)] font-semibold">Bilan</span>
      </nav>

      <header className="mb-6">
        <h1 className="font-display text-[var(--color-dark-0)] leading-tight" style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Bilan
        </h1>
        <p className="font-body text-[13px] text-[var(--color-dark-text-2)] mt-1">Comment va votre année, en un coup d&apos;œil.</p>
      </header>

      {/* Sélecteur de période */}
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

      <section className="relative mb-6">
        <button onClick={() => setMenuOuvert(o => !o)}
          className="inline-flex items-center gap-2 bg-[var(--color-brand)] text-white font-body font-bold px-5 py-2.5 rounded-full hover:bg-[var(--color-brand-hover)] transition-colors text-sm">
          <span aria-hidden="true" className="material-symbols-outlined text-base">download</span>
          Télécharger un rapport
          <span aria-hidden="true" className="material-symbols-outlined text-base">{menuOuvert ? 'expand_less' : 'expand_more'}</span>
        </button>

        {menuOuvert && (
          <div className="absolute z-20 mt-2 w-[380px] bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] shadow-2xl p-2">
            {[
              { rapport: 'bilan' as const, titre: 'Bilan complet' },
              { rapport: 'revenus' as const, titre: 'Revenus par catégorie' },
              { rapport: 'depenses' as const, titre: 'Dépenses par catégorie' },
            ].map(section => (
              <div key={section.rapport} className="p-3 border-b border-[var(--color-light-border)] last:border-b-0">
                <p className="font-body text-xs font-bold uppercase tracking-wide text-[var(--color-dark-text-2)] mb-2">{section.titre}</p>
                <div className="flex flex-col gap-1">
                  <a href={urlExport(section.rapport, 'pdf')}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--color-light-0)] transition-colors">
                    <span className="font-body text-sm font-semibold text-[var(--color-dark-1)]">Rapport visuel (.pdf)</span>
                    <span className="font-body text-[10px] text-[var(--color-dark-text-2)]">à consulter ou imprimer</span>
                  </a>
                  <a href={urlExport(section.rapport, 'xlsx')}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--color-light-0)] transition-colors">
                    <span className="font-body text-sm font-semibold text-[var(--color-dark-1)]">Fichier comptable (.xlsx)</span>
                    <span className="font-body text-[10px] text-[var(--color-dark-text-2)]">pour votre comptable</span>
                  </a>
                  <a href={urlExport(section.rapport, 'csv')}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--color-light-0)] transition-colors">
                    <span className="font-body text-sm font-semibold text-[var(--color-dark-1)]">Données brutes (.csv)</span>
                    <span className="font-body text-[10px] text-[var(--color-dark-text-2)]">pour un autre logiciel</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {loading ? (
        <p className="text-[var(--color-dark-text-2)] font-body text-center py-16">Chargement…</p>
      ) : !bilan ? (
        <p className="text-[var(--color-dark-text-2)] font-body text-center py-16">Erreur de chargement.</p>
      ) : (
        <div className="flex flex-col gap-6">

          {/* Grands chiffres */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-[18px] bg-[var(--color-light-2)] border border-[var(--color-light-border)] p-5">
              <p className="font-display font-extrabold text-3xl leading-none" style={{ color: 'var(--color-success-text)' }}>{money(bilan.revenus.total)}</p>
              <p className="font-body text-xs uppercase tracking-wide text-[var(--color-dark-text-2)] mt-2">Revenus ({bilan.revenus.nb})</p>
            </div>
            <div className="rounded-[18px] bg-[var(--color-light-2)] border border-[var(--color-light-border)] p-5">
              <p className="font-display font-extrabold text-3xl leading-none" style={{ color: 'var(--color-error-text, #c0321a)' }}>{money(bilan.depenses.total)}</p>
              <p className="font-body text-xs uppercase tracking-wide text-[var(--color-dark-text-2)] mt-2">Dépenses ({bilan.depenses.nb})</p>
            </div>
            <div className="rounded-[18px] p-5 text-white" style={{ background: 'linear-gradient(160deg, var(--color-dark-1), var(--color-dark-0))' }}>
              <p className="font-display font-extrabold text-3xl leading-none">{money(bilan.profit_net)}</p>
              <p className="font-body text-xs uppercase tracking-wide text-white/60 mt-2">Profit net — {bilan.periode}</p>
            </div>
          </div>

          {/* Taxes, affiché seulement si applicable */}
          {chargeTaxes && (
            <div id="taxes" className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-6">
              <h2 className="font-display text-base uppercase tracking-wide text-[var(--color-dark-1)] mb-1">Taxes (estimation)</h2>
              <p className="font-body text-xs text-[var(--color-dark-text-2)] mb-4">Ces montants sont une estimation. Confirmez avec votre comptable avant de remettre.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="font-display font-bold text-lg text-[var(--color-dark-1)]">{money(bilan.taxes.tps_percue)}</p>
                  <p className="font-body text-[10px] uppercase text-[var(--color-dark-text-2)] mt-1">TPS perçue</p>
                </div>
                <div>
                  <p className="font-display font-bold text-lg text-[var(--color-dark-1)]">{money(bilan.taxes.tvq_percue)}</p>
                  <p className="font-body text-[10px] uppercase text-[var(--color-dark-text-2)] mt-1">TVQ perçue</p>
                </div>
                <div>
                  <p className="font-display font-bold text-lg" style={{ color: 'var(--color-brand)' }}>{money(bilan.taxes.tps_a_remettre)}</p>
                  <p className="font-body text-[10px] uppercase text-[var(--color-dark-text-2)] mt-1">TPS à remettre</p>
                </div>
                <div>
                  <p className="font-display font-bold text-lg" style={{ color: 'var(--color-brand)' }}>{money(bilan.taxes.tvq_a_remettre)}</p>
                  <p className="font-body text-[10px] uppercase text-[var(--color-dark-text-2)] mt-1">TVQ à remettre</p>
                </div>
              </div>
            </div>
          )}

          <CategorieTable titre="Revenus par catégorie" lignes={bilan.revenus_par_categorie} accentColor="var(--color-success-text)" />
          <CategorieTable titre="Dépenses par catégorie" lignes={bilan.depenses_par_categorie} accentColor="var(--color-error-text, #c0321a)" />
        </div>
      )}
    </div>
  )
}
