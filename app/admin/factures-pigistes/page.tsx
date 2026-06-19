'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface FacturePigiste {
  id: number
  numero: string
  id_pigiste: number
  nom_pigiste: string
  titre_mandat: string | null
  montant_ht: number
  tps: number
  tvq: number
  montant_total: number
  statut: string
  date_emission: string | null
}

const STATUTS = [
  { value: 'tous',      label: 'Tous' },
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'soumise',   label: 'Soumise' },
  { value: 'approuvée', label: 'Approuvée' },
  { value: 'payée',     label: 'Payée' },
]

const STATUT_STYLE: Record<string, { bg: string; text: string }> = {
  brouillon: { bg: 'var(--color-light-border)',  text: 'var(--color-dark-text-2)' },
  soumise:   { bg: 'var(--color-warning-bg)',    text: 'var(--color-warning-text)' },
  approuvée: { bg: 'var(--color-info-bg)',       text: 'var(--color-info-text)' },
  payée:     { bg: 'var(--color-success-bg)',    text: 'var(--color-success-text)' },
}

const cad = (n: number) => n.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })

export default function AdminFacturesPigistesPage() {
  const [factures, setFactures] = useState<FacturePigiste[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filtre, setFiltre]     = useState('tous')

  useEffect(() => {
    fetch('/api/v1/admin/factures-pigistes', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setFactures(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = factures.filter(f => {
    const matchFiltre = filtre === 'tous' || f.statut === filtre
    const q = search.toLowerCase()
    const matchSearch = !q ||
      f.numero.toLowerCase().includes(q) ||
      f.nom_pigiste.toLowerCase().includes(q)
    return matchFiltre && matchSearch
  })

  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] uppercase tracking-tight leading-none">
            FACTURES PIGISTES
          </h1>
          <p className="text-[var(--color-dark-text-2)] font-body text-sm mt-1">
            {factures.length} facture{factures.length !== 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="relative">
          <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-dark-text-2)]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Numéro ou pigiste..."
            aria-label="Rechercher une facture"
            className="bg-white border border-[var(--color-light-border-2)] rounded-full pl-12 pr-6 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 w-72"
          />
        </div>
      </div>

      {/* Filtres statut */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUTS.map(s => (
          <button
            key={s.value}
            onClick={() => setFiltre(s.value)}
            className={`px-4 py-2 rounded-full text-xs font-bold font-body uppercase tracking-wide transition-colors border ${
              filtre === s.value
                ? 'bg-[var(--color-dark-1)] text-white border-[var(--color-dark-1)]'
                : 'bg-white text-[var(--color-dark-text-2)] border-[var(--color-light-border-2)] hover:border-[var(--color-dark-1)]'
            }`}
          >
            {s.label}
            {s.value !== 'tous' && (
              <span className="ml-1.5 opacity-60">
                {factures.filter(f => f.statut === s.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <p className="text-[var(--color-dark-text-2)] font-body text-center py-20">Chargement...</p>
      ) : factures.length === 0 ? (
        <div className="text-center py-20">
          <span aria-hidden="true" className="material-symbols-outlined text-5xl text-[var(--color-light-border-2)] block mb-4">
            receipt_long
          </span>
          <p className="text-[var(--color-dark-text-2)] font-body">Aucune facture pigiste.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--color-light-0)]">
                <tr>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">Numéro</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">Pigiste</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden lg:table-cell">Mandat lié</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden xl:table-cell text-right">Sous-total</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden xl:table-cell text-right">TPS</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden xl:table-cell text-right">TVQ</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest text-right">Total</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">Statut</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden md:table-cell">Date</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-light-0)]">
                {filtered.map(f => {
                  const style = STATUT_STYLE[f.statut] ?? { bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)' }
                  const label = STATUTS.find(s => s.value === f.statut)?.label ?? f.statut
                  return (
                    <tr key={f.id} className="hover:bg-[var(--color-light-1)] transition-colors">

                      {/* Numéro */}
                      <td className="px-5 py-4">
                        <p className="font-body font-bold text-sm text-[var(--color-dark-1)] tracking-wide">{f.numero}</p>
                      </td>

                      {/* Pigiste */}
                      <td className="px-5 py-4">
                        <Link href={`/admin/pigistes/${f.id_pigiste}`}
                          className="font-body text-sm text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] transition-colors">
                          {f.nom_pigiste}
                        </Link>
                      </td>

                      {/* Mandat lié */}
                      <td className="px-5 py-4 hidden lg:table-cell">
                        {f.titre_mandat
                          ? <span className="font-body text-sm text-[var(--color-dark-text-2)] truncate max-w-[180px] block">{f.titre_mandat}</span>
                          : <span className="font-body text-xs text-[var(--color-dark-text-2)] opacity-40">—</span>
                        }
                      </td>

                      {/* Sous-total */}
                      <td className="px-5 py-4 hidden xl:table-cell text-right">
                        <span className="font-body text-sm text-[var(--color-dark-text-2)]">{cad(f.montant_ht)}</span>
                      </td>

                      {/* TPS */}
                      <td className="px-5 py-4 hidden xl:table-cell text-right">
                        <span className="font-body text-sm text-[var(--color-dark-text-2)]">{cad(f.tps)}</span>
                      </td>

                      {/* TVQ */}
                      <td className="px-5 py-4 hidden xl:table-cell text-right">
                        <span className="font-body text-sm text-[var(--color-dark-text-2)]">{cad(f.tvq)}</span>
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4 text-right">
                        <span className="font-display text-base text-[var(--color-dark-1)]">{cad(f.montant_total)}</span>
                      </td>

                      {/* Statut */}
                      <td className="px-5 py-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase font-body whitespace-nowrap"
                          style={{ background: style.bg, color: style.text }}>
                          {label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 hidden md:table-cell">
                        {f.date_emission
                          ? <span className="font-body text-sm text-[var(--color-dark-text-2)]">
                              {new Date(f.date_emission).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          : <span className="font-body text-xs text-[var(--color-dark-text-2)] opacity-40">—</span>
                        }
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/factures-pigistes/${f.id}`}
                          className="text-[var(--color-brand)] font-body text-xs font-bold uppercase tracking-wide hover:underline"
                        >
                          VOIR →
                        </Link>
                      </td>

                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-[var(--color-dark-text-2)] font-body">
                      Aucune facture trouvée pour ce filtre.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
