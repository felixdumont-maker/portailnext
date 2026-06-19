'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Mandat {
  id: number
  titre: string
  id_pigiste: number
  nom_pigiste: string
  nom_projet: string | null
  montant_convenu: number
  date_echeance: string | null
  statut: string
}

const STATUTS = [
  { value: 'tous',       label: 'Tous' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'en_cours',   label: 'En cours' },
  { value: 'remis',      label: 'Remis' },
  { value: 'approuvé',   label: 'Approuvé' },
  { value: 'annulé',     label: 'Annulé' },
]

const STATUT_STYLE: Record<string, { bg: string; text: string }> = {
  en_attente: { bg: 'var(--color-light-border)',  text: 'var(--color-dark-text-2)' },
  en_cours:   { bg: 'var(--color-warning-bg)',    text: 'var(--color-warning-text)' },
  remis:      { bg: 'var(--color-info-bg)',        text: 'var(--color-info-text)' },
  approuvé:   { bg: 'var(--color-success-bg)',    text: 'var(--color-success-text)' },
  annulé:     { bg: 'var(--color-error-bg)',      text: 'var(--color-error-text)' },
}

export default function AdminMandatsPigistesPage() {
  const [mandats, setMandats] = useState<Mandat[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filtre, setFiltre]   = useState('tous')
  const [toast, setToast]     = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch('/api/v1/admin/mandats-pigistes', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setMandats(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = mandats.filter(m => {
    const matchFiltre = filtre === 'tous' || m.statut === filtre
    const q = search.toLowerCase()
    const matchSearch = !q ||
      m.titre.toLowerCase().includes(q) ||
      m.nom_pigiste.toLowerCase().includes(q) ||
      (m.nom_projet ?? '').toLowerCase().includes(q)
    return matchFiltre && matchSearch
  })

  return (
    <div className="max-w-6xl mx-auto">

      {toast && (
        <div role="status" aria-live="polite" aria-atomic="true"
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-3 ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            {toast.ok ? 'check_circle' : 'error'}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] uppercase tracking-tight leading-none">
            MANDATS PIGISTES
          </h1>
          <p className="text-[var(--color-dark-text-2)] font-body text-sm mt-1">
            {mandats.length} mandat{mandats.length !== 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-dark-text-2)]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Titre, pigiste, projet..."
              aria-label="Rechercher un mandat"
              className="bg-white border border-[var(--color-light-border-2)] rounded-full pl-12 pr-6 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 w-72"
            />
          </div>
          <Link
            href="/admin/mandats-pigistes/new"
            className="inline-flex items-center gap-2 bg-[var(--color-brand)] text-white px-5 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--color-brand-hover)] transition-colors whitespace-nowrap"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">add</span>
            Nouveau mandat
          </Link>
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
                {mandats.filter(m => m.statut === s.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <p className="text-[var(--color-dark-text-2)] font-body text-center py-20">Chargement...</p>
      ) : mandats.length === 0 ? (
        <div className="text-center py-20">
          <span aria-hidden="true" className="material-symbols-outlined text-5xl text-[var(--color-light-border-2)] block mb-4">
            assignment
          </span>
          <p className="text-[var(--color-dark-text-2)] font-body">Aucun mandat encore.</p>
          <Link href="/admin/mandats-pigistes/new"
            className="inline-flex items-center gap-2 mt-4 text-[var(--color-brand)] font-body text-sm font-bold hover:underline">
            <span aria-hidden="true" className="material-symbols-outlined text-base">add</span>
            Créer le premier mandat
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--color-light-0)]">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">Titre</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden md:table-cell">Pigiste</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden lg:table-cell">Projet lié</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden md:table-cell">Montant</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden lg:table-cell">Échéance</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">Statut</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-light-0)]">
                {filtered.map(m => {
                  const style = STATUT_STYLE[m.statut] ?? { bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)' }
                  const label = STATUTS.find(s => s.value === m.statut)?.label ?? m.statut
                  return (
                    <tr key={m.id} className="hover:bg-[var(--color-light-1)] transition-colors group">

                      {/* Titre */}
                      <td className="px-6 py-4">
                        <p className="font-body font-bold text-[var(--color-dark-1)] text-sm leading-tight">{m.titre}</p>
                        <p className="font-body text-xs text-[var(--color-dark-text-2)] mt-0.5 md:hidden">{m.nom_pigiste}</p>
                      </td>

                      {/* Pigiste */}
                      <td className="px-6 py-4 hidden md:table-cell">
                        <Link href={`/admin/pigistes/${m.id_pigiste}`}
                          className="font-body text-sm text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] transition-colors">
                          {m.nom_pigiste}
                        </Link>
                      </td>

                      {/* Projet lié */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {m.nom_projet
                          ? <span className="font-body text-sm text-[var(--color-dark-text-2)]">{m.nom_projet}</span>
                          : <span className="font-body text-xs text-[var(--color-dark-text-2)] opacity-40">—</span>
                        }
                      </td>

                      {/* Montant */}
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="font-display text-base text-[var(--color-dark-1)]">
                          {m.montant_convenu.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                        </span>
                      </td>

                      {/* Échéance */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {m.date_echeance
                          ? <span className="font-body text-sm text-[var(--color-dark-text-2)]">
                              {new Date(m.date_echeance).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          : <span className="font-body text-xs text-[var(--color-dark-text-2)] opacity-40">—</span>
                        }
                      </td>

                      {/* Statut */}
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase font-body"
                          style={{ background: style.bg, color: style.text }}>
                          {label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/mandats-pigistes/${m.id}`}
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
                    <td colSpan={7} className="px-6 py-12 text-center text-[var(--color-dark-text-2)] font-body">
                      Aucun mandat trouvé pour ce filtre.
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
