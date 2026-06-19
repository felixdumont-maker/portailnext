'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const STATUT_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  brouillon: { bg: 'var(--color-light-border)',  text: 'var(--color-dark-text-2)', label: 'Brouillon' },
  soumise:   { bg: 'var(--color-warning-bg)',    text: 'var(--color-warning-text)', label: 'Soumise' },
  approuvée: { bg: 'var(--color-info-bg)',       text: 'var(--color-info-text)',    label: 'Approuvée' },
  payée:     { bg: 'var(--color-success-bg)',    text: 'var(--color-success-text)', label: 'Payée' },
}

interface LigneFacture {
  id: number
  description: string
  quantite: number
  taux: number
  montant: number
}

interface FacturePigiste {
  id: number
  numero: string
  statut: string
  date_emission: string | null
  id_pigiste: number
  nom_pigiste: string
  adresse_pigiste: string | null
  ville_pigiste: string | null
  province_pigiste: string | null
  code_postal_pigiste: string | null
  numero_tps: string | null
  numero_tvq: string | null
  titre_mandat: string | null
  id_mandat: number | null
  lignes: LigneFacture[]
  montant_ht: number
  tps: number
  tvq: number
  montant_total: number
}

const cad = (n: number) => n.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })
const fmt = (d: string | null) => d
  ? new Date(d).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })
  : '—'

export default function AdminFacturePigisteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [facture, setFacture]     = useState<FacturePigiste | null>(null)
  const [approving, setApproving] = useState(false)
  const [paying, setPaying]       = useState(false)
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500) }

  const load = () =>
    fetch(`/api/v1/admin/factures-pigistes/${id}`, { credentials: 'include' })
      .then(r => { if (!r.ok) { router.push('/admin/factures-pigistes'); return null } return r.json() })
      .then(data => { if (data) setFacture(data) })

  useEffect(() => { load() }, [id])

  const handleApprouver = async () => {
    setApproving(true)
    try {
      const res = await fetch(`/api/v1/admin/factures-pigistes/${id}/approuver`, {
        method: 'POST', credentials: 'include',
      })
      if (res.ok) { showToast('Facture approuvée.'); load() }
      else showToast('Erreur lors de l\'approbation', false)
    } catch { showToast('Erreur de connexion', false) }
    finally { setApproving(false) }
  }

  const handlePayer = async () => {
    setPaying(true)
    try {
      const res = await fetch(`/api/v1/admin/factures-pigistes/${id}/payer`, {
        method: 'POST', credentials: 'include',
      })
      if (res.ok) { showToast('Facture marquée payée.'); load() }
      else showToast('Erreur lors du paiement', false)
    } catch { showToast('Erreur de connexion', false) }
    finally { setPaying(false) }
  }

  if (!facture) return <p className="text-[var(--color-dark-text-2)] font-body p-8">Chargement...</p>

  const style = STATUT_STYLE[facture.statut] ?? { bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)', label: facture.statut }
  const hasTps = facture.tps > 0
  const hasTvq = facture.tvq > 0

  return (
    <div className="max-w-4xl mx-auto">
      {toast && (
        <div role="status" aria-live="polite" aria-atomic="true"
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-3 print:hidden ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            {toast.ok ? 'check_circle' : 'error'}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Barre actions — masquée à l'impression */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link href="/admin/factures-pigistes"
          className="flex items-center gap-2 text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-1)] transition-colors font-body text-sm">
          <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_back</span>
          Retour aux factures
        </Link>
        <div className="flex items-center gap-3">
          {facture.statut === 'soumise' && (
            <button
              onClick={handleApprouver}
              disabled={approving}
              className="flex items-center gap-2 bg-[var(--color-info-bg)] text-[var(--color-info-text)] font-body font-bold px-5 py-2.5 rounded-full text-sm uppercase tracking-wide hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-sm">thumb_up</span>
              {approving ? 'Approbation…' : 'Approuver'}
            </button>
          )}
          {facture.statut === 'approuvée' && (
            <button
              onClick={handlePayer}
              disabled={paying}
              className="flex items-center gap-2 bg-[var(--color-success-bg)] text-[var(--color-success-text)] font-body font-bold px-5 py-2.5 rounded-full text-sm uppercase tracking-wide hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-sm">payments</span>
              {paying ? 'Traitement…' : 'Marquer payée'}
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-[var(--color-light-1)] border border-[var(--color-light-border)] text-[var(--color-dark-1)] font-body font-bold px-5 py-2.5 rounded-full text-sm uppercase tracking-wide hover:bg-[var(--color-light-0)] transition-colors"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-sm">print</span>
            Imprimer
          </button>
        </div>
      </div>

      {/* Document facture */}
      <div className="bg-white rounded-3xl shadow-sm p-10 print:shadow-none print:rounded-none print:p-0">

        {/* En-tête facture */}
        <div className="flex items-start justify-between gap-6 mb-10">
          <div>
            <p className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] uppercase tracking-tight leading-none mb-1">
              FACTURE
            </p>
            <p className="font-body text-sm text-[var(--color-dark-text-2)] font-bold tracking-widest">
              {facture.numero}
            </p>
          </div>
          <div className="text-right flex flex-col gap-1">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold font-body uppercase"
              style={{ background: style.bg, color: style.text }}>
              {style.label}
            </span>
            <p className="font-body text-sm text-[var(--color-dark-text-2)] mt-2">
              Date d'émission : <span className="font-semibold text-[var(--color-dark-1)]">{fmt(facture.date_emission)}</span>
            </p>
          </div>
        </div>

        {/* Émetteur + destinataire */}
        <div className="grid grid-cols-2 gap-8 mb-10 pb-10 border-b border-[var(--color-light-0)]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand)] font-body mb-3">Émis par</p>
            <Link href={`/admin/pigistes/${facture.id_pigiste}`}
              className="font-body font-bold text-[var(--color-dark-1)] hover:text-[var(--color-brand)] transition-colors text-sm print:no-underline">
              {facture.nom_pigiste}
            </Link>
            {facture.adresse_pigiste && (
              <p className="font-body text-sm text-[var(--color-dark-text-2)] mt-1">{facture.adresse_pigiste}</p>
            )}
            {(facture.ville_pigiste || facture.province_pigiste) && (
              <p className="font-body text-sm text-[var(--color-dark-text-2)]">
                {[facture.ville_pigiste, facture.province_pigiste, facture.code_postal_pigiste].filter(Boolean).join(', ')}
              </p>
            )}
            {facture.numero_tps && (
              <p className="font-body text-xs text-[var(--color-dark-text-2)] mt-2">TPS : {facture.numero_tps}</p>
            )}
            {facture.numero_tvq && (
              <p className="font-body text-xs text-[var(--color-dark-text-2)]">TVQ : {facture.numero_tvq}</p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand)] font-body mb-3">Facturé à</p>
            <p className="font-body font-bold text-[var(--color-dark-1)] text-sm">Cocktail Média</p>
            {facture.titre_mandat && (
              <p className="font-body text-sm text-[var(--color-dark-text-2)] mt-1">
                Mandat : {facture.titre_mandat}
              </p>
            )}
          </div>
        </div>

        {/* Lignes de facture */}
        <div className="mb-8">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-light-0)]">
                <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body">Description</th>
                <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body text-right w-20">Qté</th>
                <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body text-right w-32">Prix unit.</th>
                <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body text-right w-32">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-light-0)]">
              {facture.lignes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center font-body text-sm text-[var(--color-dark-text-2)] opacity-50 italic">
                    Aucune ligne de facturation.
                  </td>
                </tr>
              ) : (
                facture.lignes.map(l => (
                  <tr key={l.id}>
                    <td className="py-4 font-body text-sm text-[var(--color-dark-1)] pr-6">{l.description}</td>
                    <td className="py-4 font-body text-sm text-[var(--color-dark-text-2)] text-right">{l.quantite}</td>
                    <td className="py-4 font-body text-sm text-[var(--color-dark-text-2)] text-right">{cad(l.taux)}</td>
                    <td className="py-4 font-body font-semibold text-sm text-[var(--color-dark-1)] text-right">{cad(l.montant)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="flex justify-end mb-8">
          <div className="w-72 space-y-2">
            <div className="flex justify-between font-body text-sm">
              <span className="text-[var(--color-dark-text-2)]">Sous-total</span>
              <span className="font-semibold text-[var(--color-dark-1)]">{cad(facture.montant_ht)}</span>
            </div>
            {hasTps && (
              <div className="flex justify-between font-body text-sm">
                <span className="text-[var(--color-dark-text-2)]">TPS (5 %)</span>
                <span className="font-semibold text-[var(--color-dark-1)]">{cad(facture.tps)}</span>
              </div>
            )}
            {hasTvq && (
              <div className="flex justify-between font-body text-sm">
                <span className="text-[var(--color-dark-text-2)]">TVQ (9,975 %)</span>
                <span className="font-semibold text-[var(--color-dark-1)]">{cad(facture.tvq)}</span>
              </div>
            )}
            <div className="flex justify-between font-body pt-3 border-t border-[var(--color-light-0)]">
              <span className="font-bold text-[var(--color-dark-1)] uppercase tracking-wide text-sm">Total</span>
              <span className="font-display text-[var(--text-xl)] text-[var(--color-dark-1)]">{cad(facture.montant_total)}</span>
            </div>
          </div>
        </div>

        {/* Mention légale */}
        <div className="pt-8 border-t border-[var(--color-light-0)]">
          <p className="font-body text-xs text-[var(--color-dark-text-2)] opacity-60 text-center italic">
            Facture générée via CocktailOS au nom du pigiste
          </p>
        </div>

      </div>
    </div>
  )
}
