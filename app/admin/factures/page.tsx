'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Facture {
  id: number
  numero: string
  statut: 'ouverte' | 'envoyee' | 'payee'
  client_nom: string
  date_emission: string | null
  date_echeance: string | null
  total: number
  is_test_client: boolean
}

const STATUT_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  ouverte:  { bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)', label: 'OUVERTE' },
  envoyee:  { bg: 'var(--color-info-bg)',    text: 'var(--color-info-text)',    label: 'ENVOYÉE' },
  payee:    { bg: 'var(--color-success-bg)', text: 'var(--color-success-text)', label: 'PAYÉE' },
}

const FILTRES = ['TOUTES', 'OUVERTES', 'ENVOYÉES', 'PAYÉES']
const FILTRE_MAP: Record<string, string> = {
  'OUVERTES': 'ouverte',
  'ENVOYÉES': 'envoyee',
  'PAYÉES': 'payee',
}

const fmt = (n: number) => n.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })

export default function FacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState('TOUTES')

  useEffect(() => {
    fetch('/api/v1/admin/factures', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setFactures(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const visibles = filtre === 'TOUTES'
    ? factures
    : factures.filter(f => f.statut === FILTRE_MAP[filtre])

  // KPI en tête de page : exclut les comptes de test (la liste ci-dessous reste inchangée)
  const facturesPourStats = factures.filter(f => !f.is_test_client)
  const total    = facturesPourStats.reduce((s, f) => s + f.total, 0)
  const envoyees = facturesPourStats.filter(f => f.statut === 'envoyee').length
  const payees   = facturesPourStats.filter(f => f.statut === 'payee').length
  const ouvertes = facturesPourStats.filter(f => f.statut === 'ouverte').length

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-[var(--text-3xl)] uppercase tracking-tight leading-none text-[var(--color-dark-1)]">
            FACTURATION
          </h1>
          <p className="font-body text-[var(--color-dark-text-2)] text-sm mt-1">
            Gestion des factures clients
          </p>
        </div>
        <Link
          href="/admin/factures/nouvelle"
          className="inline-flex items-center gap-2 bg-[var(--color-brand)] text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--color-brand-hover)] transition-colors font-body whitespace-nowrap"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">add</span>
          Nouvelle facture
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <p className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase tracking-wider mb-3 font-body">Total</p>
          <p className="font-display text-[var(--text-xl)] text-[var(--color-dark-1)]">{fmt(total)}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <p className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase tracking-wider mb-3 font-body">Ouvertes</p>
          <p className="font-display text-[var(--text-xl)] text-[var(--color-dark-1)]">{ouvertes}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <p className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase tracking-wider mb-3 font-body">Envoyées</p>
          <p className="font-display text-[var(--text-xl)] text-[var(--color-info-text)]">{envoyees}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <p className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase tracking-wider mb-3 font-body">Payées</p>
          <p className="font-display text-[var(--text-xl)] text-[var(--color-success-text)]">{payees}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-8">
        {FILTRES.map(f => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            className={`px-6 py-2 rounded-full text-xs font-bold tracking-wide font-body transition-all ${
              filtre === f
                ? 'bg-[var(--color-brand)] text-white'
                : 'bg-white border border-[var(--color-light-border-2)] text-[var(--color-dark-1)] hover:bg-stone-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Liste factures */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
        <h2 className="font-display text-[var(--text-xl)] uppercase tracking-widest text-[var(--color-dark-1)] mb-8">
          FACTURES
        </h2>

        {loading ? (
          <p className="text-[var(--color-dark-text-2)] font-body text-center py-8">Chargement...</p>
        ) : visibles.length === 0 ? (
          <div className="text-center py-12">
            <span aria-hidden="true" className="material-symbols-outlined text-4xl text-[var(--color-light-border)] block mb-3">receipt_long</span>
            <p className="text-[var(--color-dark-text-2)] font-body text-sm">Aucune facture pour l&apos;instant.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {visibles.map(f => {
              const style = STATUT_STYLES[f.statut]
              return (
                <div key={f.id}
                  className="flex flex-col md:flex-row md:items-center justify-between py-6 gap-4">
                  <div className="flex-1">
                    <p className="font-display text-xl text-[var(--color-dark-1)] tracking-wide">{f.numero}</p>
                    <p className="text-sm text-[var(--color-dark-text-2)] font-body">{f.client_nom}</p>
                  </div>
                  <div className="flex-1 md:text-center">
                    <p className="font-display text-xl text-[var(--color-dark-1)]">{fmt(f.total)}</p>
                    <p className="text-xs text-[var(--color-dark-text-2)] font-body">
                      {f.date_echeance ? `Échéance ${new Date(f.date_echeance).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Brouillon'}
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-4 flex-1">
                    <span
                      className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-tight font-body"
                      style={{ backgroundColor: style.bg, color: style.text }}
                    >
                      {style.label}
                    </span>
                    <Link href={`/admin/factures/${f.id}`} className="border border-[var(--color-brand)] text-[var(--color-brand)] px-5 py-1 rounded-full text-xs font-bold hover:bg-[var(--color-brand)] hover:text-white transition-all uppercase tracking-wide font-body">
                      VOIR
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
