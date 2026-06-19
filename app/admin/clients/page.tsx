'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Client {
  id: number
  nom_complet: string
  email: string
  nom_entreprise: string
  telephone: string
  created_at: string
  nb_projets: number
  is_email_confirmed: boolean
  statut_relation: string
}

const STAGES: { key: string; label: string }[] = [
  { key: 'prospect', label: 'Prospect' },
  { key: 'contacte', label: 'Contacté' },
  { key: 'devis_envoye', label: 'Devis envoyé' },
  { key: 'actif', label: 'Actif' },
  { key: 'inactif', label: 'Inactif' },
]

const STAGE_STYLES: Record<string, { bg: string; text: string }> = {
  prospect:      { bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)' },
  contacte:      { bg: 'var(--color-info-bg)',      text: 'var(--color-info-text)' },
  devis_envoye:  { bg: 'var(--color-warning-bg)',   text: 'var(--color-warning-text)' },
  actif:         { bg: 'var(--color-success-bg)',   text: 'var(--color-success-text)' },
  inactif:       { bg: 'var(--color-error-bg)',     text: 'var(--color-error-text)' },
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [vue, setVue] = useState<'pipeline' | 'liste'>('pipeline')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [resendingId, setResendingId] = useState<number | null>(null)
  const [movingId, setMovingId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch('/api/v1/admin/clients', { credentials: 'include' })
      .then(res => res.json())
      .then(data => { setClients(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number, nom: string) => {
    if (!confirm(`Supprimer le client "${nom}" et tous ses projets ?`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/v1/admin/client/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) { showToast('Erreur suppression', false); return }
      setClients(prev => prev.filter(c => c.id !== id))
      showToast(`Client "${nom}" supprimé.`)
    } catch {
      showToast('Erreur de connexion', false)
    } finally {
      setDeletingId(null)
    }
  }

  const handleResendInvitation = async (id: number, nom: string) => {
    setResendingId(id)
    try {
      const res = await fetch(`/api/v1/admin/client/${id}/resend-invitation`, { method: 'POST', credentials: 'include' })
      if (!res.ok) { showToast('Erreur envoi invitation', false); return }
      showToast(`Invitation renvoyée à ${nom}.`)
    } catch {
      showToast('Erreur de connexion', false)
    } finally {
      setResendingId(null)
    }
  }

  const moveStage = async (client: Client, direction: -1 | 1) => {
    const currentIndex = STAGES.findIndex(s => s.key === client.statut_relation)
    const nextIndex = currentIndex + direction
    if (nextIndex < 0 || nextIndex >= STAGES.length) return
    const nextStage = STAGES[nextIndex].key
    setMovingId(client.id)
    try {
      const res = await fetch(`/api/v1/admin/client/${client.id}/statut-relation`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut_relation: nextStage }),
      })
      if (!res.ok) { showToast('Erreur lors du déplacement', false); return }
      setClients(prev => prev.map(c => c.id === client.id ? { ...c, statut_relation: nextStage } : c))
    } catch {
      showToast('Erreur de connexion', false)
    } finally {
      setMovingId(null)
    }
  }

  const filtered = clients.filter(c =>
    c.nom_complet.toLowerCase().includes(search.toLowerCase()) ||
    c.nom_entreprise?.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto">

      {toast && (
        <div role="status" aria-live="polite" aria-atomic="true" className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-3 ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] uppercase tracking-tight leading-none">CLIENTS</h1>
          <p className="text-[var(--color-dark-text-2)] font-body text-sm mt-1">
            {clients.length} clients au total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[var(--color-light-0)] rounded-full p-1">
            <button
              onClick={() => setVue('pipeline')}
              className={`px-4 py-2 rounded-full font-body text-xs font-bold uppercase tracking-wide transition-colors ${vue === 'pipeline' ? 'bg-white shadow-sm text-[var(--color-dark-1)]' : 'text-[var(--color-dark-text-2)]'}`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setVue('liste')}
              className={`px-4 py-2 rounded-full font-body text-xs font-bold uppercase tracking-wide transition-colors ${vue === 'liste' ? 'bg-white shadow-sm text-[var(--color-dark-1)]' : 'text-[var(--color-dark-text-2)]'}`}
            >
              Liste
            </button>
          </div>
          <div className="relative">
            <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-dark-text-2)]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un client..."
              className="bg-white border border-[var(--color-light-border-2)] rounded-full pl-12 pr-6 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 w-72"
            />
          </div>
          <Link
            href="/admin/clients/new"
            className="inline-flex items-center gap-2 bg-[var(--color-brand)] text-white px-5 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--color-brand-hover)] transition-colors whitespace-nowrap"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">add</span>
            Nouveau client
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-[var(--color-dark-text-2)] font-body text-center py-20">Chargement...</p>
      ) : vue === 'pipeline' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STAGES.map(stage => {
              const stageClients = filtered.filter(c => (c.statut_relation || 'actif') === stage.key)
              const style = STAGE_STYLES[stage.key]
              return (
                <div key={stage.key} className="w-72 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span
                      className="px-3 py-1 rounded-full font-body text-xs font-bold uppercase tracking-wide"
                      style={{ background: style.bg, color: style.text }}
                    >
                      {stage.label}
                    </span>
                    <span className="font-body text-xs text-[var(--color-dark-text-2)]">{stageClients.length}</span>
                  </div>
                  <div className="flex flex-col gap-3 min-h-[80px]">
                    {stageClients.map(client => {
                      const stageIndex = STAGES.findIndex(s => s.key === stage.key)
                      return (
                        <div key={client.id} className="bg-white rounded-2xl shadow-sm p-4">
                          <Link href={`/admin/client/${client.id}`} className="block mb-3">
                            <p className="font-body font-bold text-[var(--color-dark-1)] text-sm">{client.nom_complet}</p>
                            {client.nom_entreprise && (
                              <p className="font-body text-xs text-[var(--color-dark-text-2)]">{client.nom_entreprise}</p>
                            )}
                            <p className="font-body text-xs text-[var(--color-dark-text-2)] mt-1 truncate">{client.email}</p>
                          </Link>
                          <div className="flex items-center justify-between">
                            <span className="font-body text-[10px] text-[var(--color-dark-text-2)] uppercase tracking-wide">
                              {client.nb_projets} projet{client.nb_projets === 1 ? '' : 's'}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => moveStage(client, -1)}
                                disabled={stageIndex === 0 || movingId === client.id}
                                aria-label={`Reculer ${client.nom_complet} à l'étape précédente`}
                                className="p-1 rounded-full text-[var(--color-dark-text-2)] hover:bg-[var(--color-light-0)] disabled:opacity-20"
                              >
                                <span aria-hidden="true" className="material-symbols-outlined text-base">arrow_back</span>
                              </button>
                              <button
                                onClick={() => moveStage(client, 1)}
                                disabled={stageIndex === STAGES.length - 1 || movingId === client.id}
                                aria-label={`Avancer ${client.nom_complet} à l'étape suivante`}
                                className="p-1 rounded-full text-[var(--color-dark-text-2)] hover:bg-[var(--color-light-0)] disabled:opacity-20"
                              >
                                <span aria-hidden="true" className="material-symbols-outlined text-base">arrow_forward</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {stageClients.length === 0 && (
                      <p className="font-body text-xs text-[var(--color-dark-text-2)] text-center py-6">—</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-left">
            <thead className="bg-[var(--color-light-0)]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">Client</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden md:table-cell">Email</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden md:table-cell">Étape</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden md:table-cell">Projets</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden md:table-cell">Depuis</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-['var(--color-light-0)']">
              {filtered.map(client => {
                const initiales = client.nom_complet
                  .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                const stage = STAGES.find(s => s.key === client.statut_relation) || STAGES[3]
                const stageStyle = STAGE_STYLES[stage.key]
                return (
                  <tr key={client.id} className="hover:bg-[var(--color-light-1)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-brand)] flex items-center justify-center text-white font-display text-lg flex-shrink-0">
                          {initiales}
                        </div>
                        <div>
                          <p className="font-body font-bold text-[var(--color-dark-1)] text-sm">
                            {client.nom_complet}
                          </p>
                          <p className="font-body text-xs text-[var(--color-dark-text-2)]">
                            {client.nom_entreprise}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="font-body text-sm text-[var(--color-dark-text-2)]">{client.email}</p>
                      {!client.is_email_confirmed && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide font-body">
                          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '11px' }}>schedule</span>
                          Invitation en attente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span
                        className="px-2.5 py-1 rounded-full font-body text-[10px] font-bold uppercase tracking-wide"
                        style={{ background: stageStyle.bg, color: stageStyle.text }}
                      >
                        {stage.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="font-display text-xl text-[var(--color-dark-1)]">
                        {client.nb_projets}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="font-body text-xs text-[var(--color-dark-text-2)]">
                        {client.created_at
                          ? new Date(client.created_at).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {!client.is_email_confirmed && (
                          <button
                            onClick={() => handleResendInvitation(client.id, client.nom_complet)}
                            disabled={resendingId === client.id}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full text-amber-600 hover:bg-amber-50 disabled:opacity-30"
                            title="Renvoyer l'invitation"
                          >
                            <span aria-hidden="true" className="material-symbols-outlined text-base">forward_to_inbox</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(client.id, client.nom_complet)}
                          disabled={deletingId === client.id}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full text-[var(--color-dark-text-2)] hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                          title="Supprimer ce client"
                        >
                          <span aria-hidden="true" className="material-symbols-outlined text-base">delete</span>
                        </button>
                        <Link href={`/admin/client/${client.id}`}
                          className="text-[var(--color-brand)] font-body text-xs font-bold uppercase tracking-wide hover:underline">
                          VOIR →
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-dark-text-2)] font-body">
                    Aucun client trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  )
}
