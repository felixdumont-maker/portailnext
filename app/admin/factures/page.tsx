'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Facture {
  id: number
  numero: string
  client_nom: string
  projet_nom: string
  total: number
  date_echeance: string
  statut: 'ouverte' | 'envoyee' | 'payee' | 'en_retard'
}

const MOCK_FACTURES: Facture[] = [
  { id: 1, numero: 'FAC-2024-042', client_nom: 'Tech Solutions Intl.', projet_nom: 'Refonte Plateforme E-commerce', total: 1250, date_echeance: '2024-11-15', statut: 'payee' },
  { id: 2, numero: 'FAC-2024-041', client_nom: 'Studio Horizon', projet_nom: 'Branding & Stratégie', total: 2800, date_echeance: '2024-11-10', statut: 'en_retard' },
  { id: 3, numero: 'FAC-2024-040', client_nom: 'Lumina Agency', projet_nom: 'Audit SEO Trimestriel', total: 850, date_echeance: '2024-11-08', statut: 'envoyee' },
  { id: 4, numero: 'FAC-2024-039', client_nom: 'Urban Design Co', projet_nom: 'Support Mobile App', total: 1100, date_echeance: '2024-11-05', statut: 'ouverte' },
  { id: 5, numero: 'FAC-2024-038', client_nom: 'Green Life NGO', projet_nom: 'Design Rapport Annuel', total: 3200, date_echeance: '2024-11-01', statut: 'payee' },
]

const STATUT_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  ouverte:   { bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)', label: 'OUVERTE' },
  envoyee:   { bg: 'var(--color-info-bg)', text: 'var(--color-info-text)', label: 'ENVOYÉE' },
  payee:     { bg: 'var(--color-success-bg)', text: 'var(--color-success-text)', label: 'PAYÉE' },
  en_retard: { bg: 'var(--color-error-bg)', text: 'var(--color-error-text)', label: 'EN RETARD' },
}

const FILTRES = ['TOUTES', 'OUVERTES', 'ENVOYÉES', 'PAYÉES', 'EN RETARD']
const FILTRE_MAP: Record<string, string> = {
  'OUVERTES': 'ouverte',
  'ENVOYÉES': 'envoyee',
  'PAYÉES': 'payee',
  'EN RETARD': 'en_retard',
}

export default function FacturesPage() {
  const [filtre, setFiltre] = useState('TOUTES')

  const factures = filtre === 'TOUTES'
    ? MOCK_FACTURES
    : MOCK_FACTURES.filter(f => f.statut === FILTRE_MAP[filtre])

  const total = MOCK_FACTURES.reduce((s, f) => s + f.total, 0)
  const envoyees = MOCK_FACTURES.filter(f => f.statut === 'envoyee').length
  const payees = MOCK_FACTURES.filter(f => f.statut === 'payee').length
  const retard = MOCK_FACTURES.filter(f => f.statut === 'en_retard').length

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-[var(--text-3xl)] uppercase tracking-tight leading-none text-[var(--color-dark-1)]">
          FACTURATION
        </h1>
        <p className="font-body text-[var(--color-dark-text-2)] text-sm mt-1">
          Gestion des factures clients
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <p className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase tracking-wider mb-3 font-body">
            Total ce mois
          </p>
          <p className="font-display text-[var(--text-xl)] text-[var(--color-dark-1)]">
            {total.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <p className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase tracking-wider mb-3 font-body">
            Envoyées
          </p>
          <p className="font-display text-[var(--text-xl)] text-[var(--color-info-text)]">{envoyees}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <p className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase tracking-wider mb-3 font-body">
            Payées
          </p>
          <p className="font-display text-[var(--text-xl)] text-[var(--color-success-text)]">{payees}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <p className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase tracking-wider mb-3 font-body">
            En retard
          </p>
          <p className="font-display text-[var(--text-xl)] text-[var(--color-error-text)]">{retard}</p>
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
          FACTURES RÉCENTES
        </h2>
        <div className="divide-y divide-stone-100">
          {factures.map(f => {
            const style = STATUT_STYLES[f.statut]
            return (
              <div key={f.id}
                className="flex flex-col md:flex-row md:items-center justify-between py-6 gap-4">
                {/* Numéro + client */}
                <div className="flex-1">
                  <p className="font-display text-xl text-[var(--color-dark-1)] tracking-wide">
                    {f.numero}
                  </p>
                  <p className="text-sm text-[var(--color-dark-text-2)] font-body">{f.client_nom}</p>
                </div>
                {/* Projet */}
                <div className="flex-1">
                  <p className="text-sm text-[var(--color-dark-1)] font-body font-medium">
                    {f.projet_nom}
                  </p>
                </div>
                {/* Montant + échéance */}
                <div className="flex-1 md:text-center">
                  <p className="font-display text-xl text-[var(--color-dark-1)]">
                    {f.total.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                  </p>
                  <p className="text-xs text-[var(--color-dark-text-2)] font-body">
                    Échéance {new Date(f.date_echeance).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {/* Badge + action */}
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
      </div>
    </div>
  )
}
