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
  is_test_client: boolean
}

const STAGES: { key: string; label: string }[] = [
  { key: 'prospect', label: 'Prospect' },
  { key: 'contacte', label: 'Contacté' },
  { key: 'devis_envoye', label: 'Devis envoyé' },
  { key: 'actif', label: 'Actif' },
  { key: 'inactif', label: 'Inactif' },
]

const STAGE_STYLES: Record<string, { bg: string; text: string; accent: string }> = {
  prospect:      { bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)', accent: 'var(--color-dark-text-2)' },
  contacte:      { bg: 'var(--color-info-bg)',      text: 'var(--color-info-text)',    accent: 'var(--color-info)' },
  devis_envoye:  { bg: 'var(--color-warning-bg)',   text: 'var(--color-warning-text)', accent: 'var(--color-warning)' },
  actif:         { bg: 'var(--color-success-bg)',   text: 'var(--color-success-text)', accent: 'var(--color-success)' },
  inactif:       { bg: 'var(--color-error-bg)',     text: 'var(--color-error-text)',   accent: 'var(--color-error)' },
}

const stageIndex = (key: string) => {
  const i = STAGES.findIndex(s => s.key === key)
  return i === -1 ? STAGES.length : i
}

type SortKey = 'nom' | 'etape' | 'projets' | 'depuis'

// ── Modale création / édition d'un client ──────────────────────────────
interface ModalState {
  mode: 'create' | 'edit'
  client: Client | null
}

function ClientFormModal({
  state, onClose, onSaved, onDeleted, showToast,
}: {
  state: ModalState
  onClose: () => void
  onSaved: () => void
  onDeleted: (id: number, nom: string) => void
  showToast: (msg: string, ok?: boolean) => void
}) {
  const editing = state.mode === 'edit'
  const c = state.client
  const [nom, setNom] = useState(c?.nom_complet ?? '')
  const [entreprise, setEntreprise] = useState(c?.nom_entreprise ?? '')
  const [email, setEmail] = useState(c?.email ?? '')
  const [stage, setStage] = useState(c?.statut_relation || 'prospect')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const clean = nom.trim()
    if (!clean) { onClose(); return } // nom vide = no-op silencieux
    setSaving(true)
    try {
      if (editing && c) {
        // Fusion anti-écrasement : on récupère la fiche complète puis on
        // renvoie TOUS les champs (le PUT réécrit la ligne entière, y
        // compris la facturation).
        const full = await fetch(`/api/v1/admin/client/${c.id}`, { credentials: 'include' }).then(r => r.json())
        const res = await fetch(`/api/v1/admin/client/${c.id}`, {
          method: 'PUT', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...full,
            nom_complet: clean,
            nom_entreprise: entreprise.trim() || null,
            email: email.trim().toLowerCase() || null,
            statut_relation: stage,
          }),
        })
        if (!res.ok) { showToast('Erreur lors de l’enregistrement', false); return }
        showToast('Client mis à jour.')
      } else {
        const res = await fetch('/api/v1/admin/client/add', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom_complet: clean,
            email: email.trim().toLowerCase() || null,
            nom_entreprise: entreprise.trim() || null,
            statut_relation: stage,
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.id) { showToast(data.error || 'Erreur lors de la création', false); return }
        showToast('Client créé.')
      }
      onSaved()
      onClose()
    } catch {
      showToast('Erreur de connexion', false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={editing ? 'Modifier le client' : 'Nouveau client'}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-[460px] p-7"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: 'var(--color-brand)' }}>
            <span aria-hidden="true" className="material-symbols-outlined">{editing ? 'edit' : 'person_add'}</span>
          </div>
          <h2 className="flex-1 font-display text-xl text-[var(--color-dark-1)] leading-tight">
            {editing ? 'Modifier le client' : 'Nouveau client'}
          </h2>
          <button onClick={onClose} aria-label="Fermer" className="p-1.5 rounded-full text-[var(--color-dark-text-2)] hover:bg-[var(--color-light-0)]">
            <span aria-hidden="true" className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Champs */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1.5">Nom du contact</label>
            <input
              autoFocus value={nom} onChange={e => setNom(e.target.value)}
              placeholder="Marie Tremblay"
              className="w-full bg-[var(--color-light-0)] rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1.5">Entreprise</label>
            <input
              value={entreprise} onChange={e => setEntreprise(e.target.value)}
              placeholder="Acme inc."
              className="w-full bg-[var(--color-light-0)] rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1.5">Courriel</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="marie@entreprise.com"
              className="w-full bg-[var(--color-light-0)] rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1.5">Étape</label>
            <div className="grid grid-cols-2 gap-2">
              {STAGES.map(s => {
                const active = stage === s.key
                return (
                  <button
                    key={s.key} type="button" onClick={() => setStage(s.key)}
                    className={`px-3 py-2.5 rounded-xl font-body text-xs font-bold transition-colors border ${active ? 'text-[var(--color-brand)]' : 'text-[var(--color-dark-text-2)] border-transparent hover:bg-[var(--color-light-0)]'}`}
                    style={active ? { borderColor: 'var(--color-brand)', background: 'var(--color-brand-soft, rgba(0,0,0,0.03))' } : undefined}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-7">
          {editing && c ? (
            <button
              onClick={() => { onDeleted(c.id, c.nom_complet) }}
              className="font-body text-xs font-bold uppercase tracking-wide text-red-600 hover:bg-red-50 px-3 py-2 rounded-full transition-colors"
            >
              Supprimer
            </button>
          ) : <span />}
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="font-body text-xs font-bold uppercase tracking-wide text-[var(--color-dark-text-2)] px-4 py-2.5 rounded-full hover:bg-[var(--color-light-0)] transition-colors">
              Annuler
            </button>
            <button
              onClick={handleSave} disabled={saving}
              className="font-body text-xs font-bold uppercase tracking-wide text-white px-5 py-2.5 rounded-full transition-colors disabled:opacity-50"
              style={{ background: 'var(--color-brand)' }}
            >
              {saving ? '…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [vue, setVue] = useState<'pipeline' | 'liste'>('pipeline')
  const [stageFilter, setStageFilter] = useState<string | null>(null)
  const [resendingId, setResendingId] = useState<number | null>(null)
  const [movingId, setMovingId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [modal, setModal] = useState<ModalState | null>(null)
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('depuis')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const loadClients = () => {
    fetch('/api/v1/admin/clients', { credentials: 'include' })
      .then(res => res.json())
      .then(data => { setClients(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadClients() }, [])

  const handleDelete = async (id: number, nom: string) => {
    if (!confirm(`Supprimer le client "${nom}" et tous ses projets ?`)) return
    try {
      const res = await fetch(`/api/v1/admin/client/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) { showToast('Erreur suppression', false); return }
      setClients(prev => prev.filter(c => c.id !== id))
      setModal(null)
      showToast(`Client "${nom}" supprimé.`)
    } catch {
      showToast('Erreur de connexion', false)
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

  // Déplace un client vers une étape précise (utilisé par le drag & drop)
  const setStage = async (client: Client, nextStage: string) => {
    if (nextStage === client.statut_relation) return
    const snapshot = clients
    setMovingId(client.id)
    setClients(prev => prev.map(c => c.id === client.id ? { ...c, statut_relation: nextStage } : c))
    try {
      const res = await fetch(`/api/v1/admin/client/${client.id}/statut-relation`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut_relation: nextStage }),
      })
      if (!res.ok) { setClients(snapshot); showToast('Erreur lors du déplacement', false) }
    } catch {
      setClients(snapshot); showToast('Erreur de connexion', false)
    } finally {
      setMovingId(null)
    }
  }

  // Flèches ◀ ▶ (fallback accessible au drag & drop)
  const moveStage = (client: Client, direction: -1 | 1) => {
    const nextIndex = stageIndex(client.statut_relation) + direction
    if (nextIndex < 0 || nextIndex >= STAGES.length) return
    setStage(client, STAGES[nextIndex].key)
  }

  const matchesSearch = (c: Client) => {
    const q = search.toLowerCase()
    return c.nom_complet.toLowerCase().includes(q) ||
      c.nom_entreprise?.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
  }

  // Filtre recherche (les compteurs de chips se calculent là-dessus)
  const searched = clients.filter(matchesSearch)
  // + filtre d'étape actif
  const filtered = stageFilter ? searched.filter(c => (c.statut_relation || 'actif') === stageFilter) : searched

  // KPI en tête de page : exclut les comptes de test (le tableau/pipeline ci-dessous reste inchangé)
  const clientsPourStats = clients.filter(c => !c.is_test_client)
  const totalClients = clientsPourStats.length
  const dansPipeline = clientsPourStats.filter(c => !['actif', 'inactif'].includes(c.statut_relation)).length
  const devisEnCours = clientsPourStats.filter(c => c.statut_relation === 'devis_envoye').length
  const actifs = clientsPourStats.filter(c => c.statut_relation === 'actif').length
  const tauxActivation = totalClients ? Math.round(actifs / totalClients * 100) : 0

  const visibleStages = stageFilter ? STAGES.filter(s => s.key === stageFilter) : STAGES

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc') }
    else { setSortKey(key); setSortDir('asc') }
  }

  const sortedList = [...filtered].sort((a, b) => {
    let cmp = 0
    switch (sortKey) {
      case 'nom':     cmp = a.nom_complet.localeCompare(b.nom_complet, 'fr'); break
      case 'etape':   cmp = stageIndex(a.statut_relation) - stageIndex(b.statut_relation); break
      case 'projets': cmp = a.nb_projets - b.nb_projets; break
      case 'depuis':  cmp = (a.created_at || '').localeCompare(b.created_at || ''); break
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  const sortArrow = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  return (
    <div className="max-w-7xl mx-auto">

      {toast && (
        <div role="status" aria-live="polite" aria-atomic="true" className={`fixed top-6 right-6 z-[60] px-6 py-4 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-3 ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      {modal && (
        <ClientFormModal
          state={modal}
          onClose={() => setModal(null)}
          onSaved={loadClients}
          onDeleted={handleDelete}
          showToast={showToast}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="font-body font-bold text-[11px] uppercase tracking-[0.16em] text-[var(--color-brand)] mb-1">Relation client</p>
          <h1 className="font-display text-[var(--color-dark-0)] leading-none" style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.035em' }}>Clients</h1>
          <p className="text-[var(--color-dark-text-2)] font-body text-sm mt-1">
            {clients.length} clients au total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-[var(--color-light-border)] rounded-full p-1">
            <button
              onClick={() => setVue('pipeline')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-body text-xs font-bold transition-colors ${vue === 'pipeline' ? 'bg-[var(--color-brand)] text-white' : 'text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-1)]'}`}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">view_kanban</span>
              Pipeline
            </button>
            <button
              onClick={() => setVue('liste')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-body text-xs font-bold transition-colors ${vue === 'liste' ? 'bg-[var(--color-brand)] text-white' : 'text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-1)]'}`}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">view_list</span>
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
          <button
            onClick={() => setModal({ mode: 'create', client: null })}
            className="inline-flex items-center gap-2 bg-[var(--color-brand)] text-white px-5 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--color-brand-hover)] transition-colors whitespace-nowrap"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">add</span>
            Nouveau
          </button>
        </div>
      </div>

      {/* KPI band */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-[18px] bg-[var(--color-light-2)] border border-[var(--color-light-border)] p-5">
          <p className="font-display font-extrabold text-[var(--text-3xl)] text-[var(--color-dark-1)] leading-none">{totalClients}</p>
          <p className="font-body text-xs uppercase tracking-wide text-[var(--color-dark-text-2)] mt-2">Clients au total</p>
        </div>
        <div className="rounded-[18px] bg-[var(--color-light-2)] border border-[var(--color-light-border)] p-5">
          <p className="font-display font-extrabold text-[var(--text-3xl)] text-[var(--color-dark-1)] leading-none">{dansPipeline}</p>
          <p className="font-body text-xs uppercase tracking-wide text-[var(--color-dark-text-2)] mt-2">Dans le pipeline</p>
        </div>
        <div className="rounded-[18px] bg-[var(--color-light-2)] border border-[var(--color-light-border)] p-5">
          <p className="font-display font-extrabold text-[var(--text-3xl)] text-[var(--color-dark-1)] leading-none">{devisEnCours}</p>
          <p className="font-body text-xs uppercase tracking-wide text-[var(--color-dark-text-2)] mt-2">Devis en cours</p>
        </div>
        <div
          className="rounded-[18px] p-5 text-white"
          style={{ background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-hover))' }}
        >
          <p className="font-display font-extrabold text-[var(--text-3xl)] leading-none">{tauxActivation}%</p>
          <p className="font-body text-xs uppercase tracking-wide text-white/80 mt-2">Taux d&apos;activation</p>
        </div>
      </div>

      {/* Chips de filtre par étape */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <button
          onClick={() => setStageFilter(null)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-xs font-bold transition-colors ${stageFilter === null ? 'bg-[var(--color-brand)] text-white' : 'bg-white border border-[var(--color-light-border)] text-[var(--color-dark-text-2)] hover:border-[var(--color-brand)]'}`}
        >
          Tous
          <span className={`text-[11px] leading-none px-1.5 py-0.5 rounded-full ${stageFilter === null ? 'bg-white/25 text-white' : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)]'}`}>{searched.length}</span>
        </button>
        {STAGES.map(s => {
          const count = searched.filter(c => (c.statut_relation || 'actif') === s.key).length
          const active = stageFilter === s.key
          return (
            <button
              key={s.key}
              onClick={() => setStageFilter(active ? null : s.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-xs font-bold transition-colors ${active ? 'bg-[var(--color-brand)] text-white' : 'bg-white border border-[var(--color-light-border)] text-[var(--color-dark-text-2)] hover:border-[var(--color-brand)]'}`}
            >
              {s.label}
              <span className={`text-[11px] leading-none px-1.5 py-0.5 rounded-full ${active ? 'bg-white/25 text-white' : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)]'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <p className="text-[var(--color-dark-text-2)] font-body text-center py-20">Chargement...</p>
      ) : vue === 'pipeline' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {visibleStages.map(stage => {
              const stageClients = filtered.filter(c => (c.statut_relation || 'actif') === stage.key)
              const style = STAGE_STYLES[stage.key]
              const isDropTarget = dragOverStage === stage.key
              return (
                <div
                  key={stage.key}
                  className="w-72 flex-shrink-0 rounded-2xl transition-all"
                  style={isDropTarget ? { outline: '2px solid var(--color-brand)', outlineOffset: '4px' } : undefined}
                  onDragOver={e => { if (draggingId !== null) { e.preventDefault(); setDragOverStage(stage.key) } }}
                  onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverStage(prev => prev === stage.key ? null : prev) }}
                  onDrop={e => {
                    e.preventDefault()
                    setDragOverStage(null)
                    const dropped = clients.find(c => c.id === draggingId)
                    if (dropped) setStage(dropped, stage.key)
                    setDraggingId(null)
                  }}
                >
                  <div className="mb-3 px-1">
                    <div className="h-[3px] rounded-full mb-3" style={{ background: style.accent }} />
                    <div className="flex items-baseline gap-2">
                      <span className="font-display font-extrabold text-2xl leading-none" style={{ color: style.accent }}>{stageClients.length}</span>
                      <span className="font-body text-xs font-bold uppercase tracking-wide text-[var(--color-dark-text-2)]">{stage.label}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 min-h-[80px]">
                    {stageClients.map(client => {
                      const idx = stageIndex(stage.key)
                      return (
                        <div
                          key={client.id}
                          draggable
                          onDragStart={() => setDraggingId(client.id)}
                          onDragEnd={() => { setDraggingId(null); setDragOverStage(null) }}
                          className="group relative bg-white rounded-[14px] shadow-sm p-4 cursor-grab active:cursor-grabbing transition-opacity"
                          style={{ opacity: draggingId === client.id ? 0.4 : 1 }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <Link href={`/admin/client/${client.id}`} className="block min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  aria-hidden="true"
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ background: style.accent }}
                                />
                                <p className="font-body font-bold text-[var(--color-dark-1)] text-sm truncate">{client.nom_complet}</p>
                              </div>
                              {client.nom_entreprise && (
                                <p className="font-body text-xs text-[var(--color-dark-text-2)] truncate ml-4">{client.nom_entreprise}</p>
                              )}
                              {!client.is_email_confirmed && (
                                <span className="inline-flex items-center gap-1 mt-2 ml-4 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide font-body">
                                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '11px' }}>schedule</span>
                                  Invitation en attente
                                </span>
                              )}
                            </Link>
                            <span className="font-display text-lg text-[var(--color-dark-text-2)] leading-none flex-shrink-0 transition-opacity group-hover:opacity-0">{client.nb_projets}</span>
                          </div>
                          {/* Contrôles au survol : flèches (fallback DnD) + édition */}
                          <div className="absolute top-3 right-2 flex items-center gap-0.5 rounded-full bg-white/95 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => moveStage(client, -1)}
                              disabled={idx === 0 || movingId === client.id}
                              aria-label={`Reculer ${client.nom_complet} à l'étape précédente`}
                              className="p-1 rounded-full text-[var(--color-dark-text-2)] hover:bg-[var(--color-light-0)] disabled:opacity-20"
                            >
                              <span aria-hidden="true" className="material-symbols-outlined text-base">arrow_back</span>
                            </button>
                            <button
                              onClick={() => moveStage(client, 1)}
                              disabled={idx === STAGES.length - 1 || movingId === client.id}
                              aria-label={`Avancer ${client.nom_complet} à l'étape suivante`}
                              className="p-1 rounded-full text-[var(--color-dark-text-2)] hover:bg-[var(--color-light-0)] disabled:opacity-20"
                            >
                              <span aria-hidden="true" className="material-symbols-outlined text-base">arrow_forward</span>
                            </button>
                            <button
                              onClick={() => setModal({ mode: 'edit', client })}
                              aria-label={`Modifier ${client.nom_complet}`}
                              className="p-1 rounded-full text-[var(--color-dark-text-2)] hover:bg-[var(--color-light-0)] hover:text-[var(--color-brand)]"
                            >
                              <span aria-hidden="true" className="material-symbols-outlined text-base">edit</span>
                            </button>
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
                <th className="px-6 py-4">
                  <button onClick={() => toggleSort('nom')} className="text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hover:text-[var(--color-dark-1)]">Client{sortArrow('nom')}</button>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden md:table-cell">Courriel</th>
                <th className="px-6 py-4 hidden md:table-cell">
                  <button onClick={() => toggleSort('etape')} className="text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hover:text-[var(--color-dark-1)]">Étape{sortArrow('etape')}</button>
                </th>
                <th className="px-6 py-4 hidden md:table-cell">
                  <button onClick={() => toggleSort('projets')} className="text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hover:text-[var(--color-dark-1)]">Projets{sortArrow('projets')}</button>
                </th>
                <th className="px-6 py-4 hidden md:table-cell">
                  <button onClick={() => toggleSort('depuis')} className="text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hover:text-[var(--color-dark-1)]">Depuis{sortArrow('depuis')}</button>
                </th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-['var(--color-light-0)']">
              {sortedList.map(client => {
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
                          onClick={() => setModal({ mode: 'edit', client })}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] hover:bg-[var(--color-light-0)]"
                          title="Modifier ce client"
                        >
                          <span aria-hidden="true" className="material-symbols-outlined text-base">edit</span>
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
              {sortedList.length === 0 && (
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
