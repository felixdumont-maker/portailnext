'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Ligne {
  id: number
  description: string
  date_service: string | null
  localisation: string | null
  quantite: number
  prix_unitaire: number
  total_ligne: number
}

interface Client {
  id: number
  nom_complet: string
  nom_entreprise: string | null
  email: string
  adresse_facturation: string | null
  ville_facturation: string | null
  province_facturation: string | null
  code_postal_facturation: string | null
}

interface Facture {
  id: number
  numero: string
  statut: 'ouverte' | 'envoyee' | 'payee'
  periode_mois: string | null
  date_emission: string | null
  date_echeance: string | null
  sous_total: number
  tps: number
  tvq: number
  total: number
  pdf_path: string | null
  client: Client | null
  lignes: Ligne[]
}

const fmt = (n: number) => n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

const STATUT_STYLE: Record<string, string> = {
  ouverte:  'bg-[#fff4e5] text-[#b26a00]',
  envoyee:  'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]',
  payee:    'bg-[var(--color-success-bg)] text-[var(--color-success-text)]',
}
const STATUT_LABEL: Record<string, string> = {
  ouverte:  'Ouverte',
  envoyee:  'Envoyée',
  payee:    'Payée',
}

const inputCls = "bg-[var(--color-light-0)] border-none rounded-lg px-3 py-2 font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none"

export default function FactureDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [facture, setFacture] = useState<Facture | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Nouvelle ligne
  const today = new Date().toISOString().split('T')[0]
  const [newDesc, setNewDesc] = useState('')
  const [newDate, setNewDate] = useState(today)
  const [newLoc, setNewLoc] = useState('')
  const [newPrix, setNewPrix] = useState('')
  const [newQte, setNewQte] = useState('1')
  const [addError, setAddError] = useState('')

  // Édition en ligne
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editDesc, setEditDesc] = useState('')
  const [editPrix, setEditPrix] = useState('')
  const [editQte, setEditQte] = useState('')

  const loadFacture = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/admin/facture/${id}`, { credentials: 'include' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setFacture(data)
    } catch {
      setError('Impossible de charger la facture.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadFacture() }, [loadFacture])

  async function action(url: string, label: string, confirmMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return
    setActionLoading(label)
    try {
      const res = await fetch(url, { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (!data.success) { setError(data.error || 'Erreur.'); return }
      await loadFacture()
    } catch {
      setError('Erreur réseau.')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleAddLigne(e: React.FormEvent) {
    e.preventDefault()
    setAddError('')
    if (!newDesc.trim()) { setAddError('La description est obligatoire.'); return }
    setActionLoading('add')
    try {
      const res = await fetch(`/api/v1/admin/facture/${id}/ajouter_ligne`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newDesc.trim(),
          date_service: newDate,
          localisation: newLoc.trim() || null,
          prix_unitaire: parseFloat(newPrix) || 0,
          quantite: parseInt(newQte) || 1,
        }),
      })
      const data = await res.json()
      if (!data.success) { setAddError(data.error || 'Erreur.'); return }
      setNewDesc(''); setNewDate(today); setNewLoc(''); setNewPrix(''); setNewQte('1')
      await loadFacture()
    } catch {
      setAddError('Erreur réseau.')
    } finally {
      setActionLoading(null)
    }
  }

  function startEdit(l: Ligne) {
    setEditingId(l.id)
    setEditDesc(l.description)
    setEditPrix(String(l.prix_unitaire))
    setEditQte(String(l.quantite))
  }

  async function handleSaveLigne(ligneId: number) {
    setActionLoading(`edit-${ligneId}`)
    try {
      const res = await fetch(`/api/v1/admin/ligne/${ligneId}/modifier`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editDesc, prix_unitaire: parseFloat(editPrix) || 0, quantite: parseInt(editQte) || 1 }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error || 'Erreur.'); return }
      setEditingId(null)
      await loadFacture()
    } catch {
      setError('Erreur réseau.')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDeleteFacture() {
    if (!confirm(`Supprimer définitivement la facture ${facture?.numero} ? Cette action est irréversible.`)) return
    setActionLoading('delete-facture')
    try {
      const res = await fetch(`/api/v1/admin/facture/${id}/supprimer`, { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (data.success) router.push('/admin/factures')
      else setError(data.error || 'Erreur.')
    } catch {
      setError('Erreur réseau.')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <p className="text-[var(--color-dark-text-2)] font-body text-center mt-20">Chargement...</p>
  if (!facture) return <p className="text-[var(--color-brand)] font-body text-center mt-20">{error || 'Facture introuvable.'}</p>

  const isOuverte = facture.statut === 'ouverte'
  const isPayee   = facture.statut === 'payee'

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Retour */}
      <Link href="/admin/factures"
        className="inline-flex items-center gap-2 text-[var(--color-dark-text-2)] font-body text-sm hover:text-[var(--color-dark-1)] transition-colors">
        ← Retour aux factures
      </Link>

      {error && (
        <div className="bg-[var(--color-error-bg)] text-[var(--color-error-text)] px-4 py-3 rounded-lg text-sm font-medium font-body">
          {error}
          <button onClick={() => setError('')} className="ml-3 underline">Fermer</button>
        </div>
      )}

      {/* En-tête */}
      <section className="bg-white rounded-3xl p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] tracking-tight leading-none uppercase">
              {facture.numero}
            </h1>
            {facture.client && (
              <div className="mt-2">
                <p className="font-body font-semibold text-[var(--color-dark-1)]">{facture.client.nom_complet}</p>
                {facture.client.nom_entreprise && (
                  <p className="text-[var(--color-dark-text-2)] text-sm font-body">{facture.client.nom_entreprise}</p>
                )}
                {facture.client.adresse_facturation && (
                  <p className="text-[var(--color-dark-text-2)] text-sm font-body mt-1">
                    {facture.client.adresse_facturation}<br />
                    {[facture.client.ville_facturation, facture.client.province_facturation, facture.client.code_postal_facturation].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-3">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest font-body ${STATUT_STYLE[facture.statut]}`}>
              {STATUT_LABEL[facture.statut]}{facture.periode_mois ? ` — ${facture.periode_mois}` : ''}
            </span>
            <div className="text-right text-sm text-[var(--color-dark-text-2)] font-body space-y-0.5">
              {facture.date_emission && <p>Émise le {facture.date_emission}</p>}
              {facture.date_echeance && <p>Échéance : {facture.date_echeance}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Lignes */}
      <section className="bg-white rounded-3xl p-8">
        <h2 className="font-display text-[var(--text-xl)] text-[var(--color-dark-text-2)] uppercase mb-6 tracking-wide">
          LIGNES DE FACTURE
        </h2>

        {facture.lignes.length === 0 ? (
          <p className="text-[var(--color-dark-text-2)] font-body text-sm text-center py-8">Aucune ligne pour l&apos;instant.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-body">
              <thead>
                <tr className="border-b border-[var(--color-light-0)]">
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)]">Description</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] hidden md:table-cell">Date</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] hidden md:table-cell">Localisation</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] text-right">Qté</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] text-right">Prix unit.</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] text-right">Total</th>
                  <th className="pb-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-light-0)]">
                {facture.lignes.map(l => (
                  <tr key={l.id} className="group">
                    {editingId === l.id ? (
                      <>
                        <td className="py-3 pr-2">
                          <input aria-label="Description de la ligne" value={editDesc} onChange={e => setEditDesc(e.target.value)} className={inputCls + ' w-full'} />
                        </td>
                        <td className="py-3 hidden md:table-cell text-[var(--color-dark-text-2)]">{l.date_service || '—'}</td>
                        <td className="py-3 hidden md:table-cell text-[var(--color-dark-text-2)]">{l.localisation || '—'}</td>
                        <td className="py-3 pr-2 text-right">
                          <input aria-label="Quantité" type="number" min="1" value={editQte} onChange={e => setEditQte(e.target.value)} className={inputCls + ' w-16 text-right'} />
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <input aria-label="Prix unitaire" type="number" step="0.01" min="0" value={editPrix} onChange={e => setEditPrix(e.target.value)} className={inputCls + ' w-24 text-right'} />
                        </td>
                        <td className="py-3 text-right font-semibold text-[var(--color-dark-1)]">
                          {fmt((parseFloat(editPrix) || 0) * (parseInt(editQte) || 1))} $
                        </td>
                        <td className="py-3 pl-2">
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => handleSaveLigne(l.id)} disabled={actionLoading === `edit-${l.id}`}
                              className="bg-[var(--color-brand)] text-white rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-50">
                              ✓
                            </button>
                            <button onClick={() => setEditingId(null)}
                              className="bg-[var(--color-light-0)] text-[var(--color-dark-3)] rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-[var(--color-light-border)] transition-colors">
                              ✕
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 text-[var(--color-dark-1)]">{l.description}</td>
                        <td className="py-3 text-[var(--color-dark-text-2)] hidden md:table-cell">{l.date_service || '—'}</td>
                        <td className="py-3 text-[var(--color-dark-text-2)] hidden md:table-cell">{l.localisation || '—'}</td>
                        <td className="py-3 text-right text-[var(--color-dark-text-2)]">{l.quantite}</td>
                        <td className="py-3 text-right text-[var(--color-dark-text-2)]">{fmt(l.prix_unitaire)} $</td>
                        <td className="py-3 text-right font-semibold text-[var(--color-dark-1)]">{fmt(l.total_ligne)} $</td>
                        <td className="py-3 pl-2">
                          <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(l)}
                              className="bg-[var(--color-light-0)] text-[var(--color-dark-3)] rounded-lg px-2 py-1.5 hover:bg-[var(--color-light-border)] transition-colors">
                              <span aria-hidden="true" className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button onClick={() => action(`/api/v1/admin/ligne/${l.id}/supprimer`, `del-${l.id}`, 'Supprimer cette ligne ?')}
                              disabled={actionLoading === `del-${l.id}`}
                              className="bg-[var(--color-error-bg)] text-[var(--color-brand)] rounded-lg px-2 py-1.5 hover:bg-[#fbd5d1] transition-colors disabled:opacity-50">
                              <span aria-hidden="true" className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totaux */}
        <div className="mt-6 pt-6 border-t border-[var(--color-light-0)] space-y-1.5 text-right font-body">
          <p className="text-sm text-[var(--color-dark-text-2)]">
            Sous-total : <span className="font-semibold text-[var(--color-dark-1)]">{fmt(facture.sous_total)} $CA</span>
          </p>
          <p className="text-sm text-[var(--color-dark-text-2)]">
            TPS + TVQ : <span className="font-semibold text-[var(--color-dark-1)]">{fmt(facture.tps + facture.tvq)} $CA</span>
          </p>
          <p className="text-base font-bold text-[var(--color-dark-1)] pt-1">
            Total TTC : <span className="text-[var(--color-brand)]">{fmt(facture.total)} $CA</span>
          </p>
        </div>
      </section>

      {/* Ajouter une ligne */}
      <section className="bg-white rounded-3xl p-8">
        <h2 className="font-display text-[var(--text-xl)] text-[var(--color-dark-text-2)] uppercase mb-6 tracking-wide">
          AJOUTER UNE LIGNE
        </h2>
        <form onSubmit={handleAddLigne} className="space-y-4">
          {addError && (
            <div className="bg-[var(--color-error-bg)] text-[var(--color-error-text)] px-4 py-3 rounded-lg text-sm font-body">{addError}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body">
                Description <span className="text-[var(--color-brand)]">*</span>
              </label>
              <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Ex: Photo immobilière" className={inputCls + ' w-full'} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body">Date service</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className={inputCls + ' w-full'} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body">Localisation <span className="text-[var(--color-dark-text-2)] font-normal">(optionnel)</span></label>
              <input type="text" value={newLoc} onChange={e => setNewLoc(e.target.value)} placeholder="Adresse ou ville" className={inputCls + ' w-full'} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body">Prix unitaire ($)</label>
                <input type="number" step="0.01" min="0" value={newPrix} onChange={e => setNewPrix(e.target.value)} placeholder="0.00" className={inputCls + ' w-full'} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body">Quantité</label>
                <input type="number" min="1" value={newQte} onChange={e => setNewQte(e.target.value)} className={inputCls + ' w-full'} />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={actionLoading === 'add'}
              className="bg-[var(--color-brand)] text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-50 font-body flex items-center gap-2">
              {actionLoading === 'add' ? 'Ajout…' : (
                <><span aria-hidden="true" className="material-symbols-outlined text-base">add</span> Ajouter la ligne</>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Actions */}
      <section className="bg-white rounded-3xl p-8">
        <h2 className="font-display text-[var(--text-xl)] text-[var(--color-dark-text-2)] uppercase mb-6 tracking-wide">ACTIONS</h2>
        <div className="flex flex-wrap gap-3">

          {isOuverte && (
            <button
              onClick={() => action(`/api/v1/admin/facture/${id}/fermer`, 'fermer', 'Fermer et envoyer cette facture par email au client ?')}
              disabled={actionLoading === 'fermer'}
              className="bg-[var(--color-brand)] text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-50 font-body">
              {actionLoading === 'fermer' ? 'Envoi…' : 'Fermer et envoyer'}
            </button>
          )}

          {!isPayee && (
            <button
              onClick={() => action(`/api/v1/admin/facture/${id}/payee`, 'payee', 'Marquer cette facture comme payée ?')}
              disabled={actionLoading === 'payee'}
              className="bg-[var(--color-success-bg)] text-[var(--color-success-text)] px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-success-bg)] transition-colors disabled:opacity-50 font-body">
              {actionLoading === 'payee' ? '…' : '✓ Marquer payée'}
            </button>
          )}

          {facture.pdf_path && (
            <a
              href={`/admin/facture/${id}/download`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[var(--color-light-0)] text-[var(--color-dark-3)] px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-light-border)] transition-colors font-body flex items-center gap-2">
              <span aria-hidden="true" className="material-symbols-outlined text-base">download</span>
              Télécharger PDF
            </a>
          )}

        </div>
      </section>

      {/* Zone dangereuse */}
      <section className="rounded-3xl p-8 border-2 border-dashed border-red-300 bg-red-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-[var(--text-xl)] text-[var(--color-brand)] tracking-wide uppercase">ZONE DANGEREUSE</h2>
            <p className="text-[var(--color-dark-text-2)] text-sm font-body mt-1 max-w-md">
              La suppression de cette facture est irréversible. Toutes les lignes associées seront également supprimées.
            </p>
          </div>
          <button
            onClick={handleDeleteFacture}
            disabled={actionLoading === 'delete-facture'}
            className="border-2 border-[var(--color-brand)] text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white transition-all px-8 py-3 rounded-full font-body text-xs font-bold uppercase tracking-widest whitespace-nowrap disabled:opacity-50">
            {actionLoading === 'delete-facture' ? 'Suppression…' : 'SUPPRIMER LA FACTURE'}
          </button>
        </div>
      </section>

    </div>
  )
}
