'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || ''

interface Projet {
  id: number
  nom_projet: string
  titre_affiche: string | null
  statut: string
  lien_gdrive: string | null
  date_livraison_estimee: string | null
  client_id: number
  client_nom: string
  client_email: string
  client_telephone: string
  nom_service: string | null
  is_archived: boolean
}

interface ChecklistItem {
  id: number
  nom_item: string
  est_coche: boolean
  requires_file: boolean
  is_required: boolean
  is_revision: boolean
  item_type: string
  file_category: string
}

interface EditItem {
  id: number
  nom: string
  type: string
  is_required: boolean
}

interface Pigiste {
  id: number
  nom_complet: string
  email: string
  specialite: string | null
}

interface Mandat {
  id: number
  titre: string
  nom_pigiste: string | null
  montant_convenu: number
  date_echeance: string | null
  statut: string
}

const PIPELINE_STEPS = [
  'Documents à donner',
  'Documents reçus',
  'Travaux en cours',
  'En révision',
  'Complété',
]

const STEP_INDEX: Record<string, number> = {
  'Documents à donner': 0,
  'Documents reçus': 1,
  'Travaux en cours': 2,
  'En révision': 3,
  'Complété': 4,
}

const STATUTS = [
  'Documents à donner',
  'En attente de rendez-vous',
  'Documents reçus',
  'Travaux en cours',
  'En révision',
  'Complété',
  'Annulé',
]

const STATUT_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'Documents à donner':        { bg: 'bg-red-50',     text: 'text-red-600',    dot: 'bg-red-500' },
  'En attente de rendez-vous': { bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400' },
  'Documents reçus':           { bg: 'bg-blue-50',    text: 'text-blue-600',   dot: 'bg-blue-500' },
  'Travaux en cours':          { bg: 'bg-orange-50',  text: 'text-orange-600', dot: 'bg-orange-500' },
  'En révision':               { bg: 'bg-yellow-50',  text: 'text-yellow-600', dot: 'bg-yellow-500' },
  'Complété':                  { bg: 'bg-green-50',   text: 'text-green-600',  dot: 'bg-green-500' },
  'Annulé':                    { bg: 'bg-gray-100',   text: 'text-gray-500',   dot: 'bg-gray-400' },
}

const TYPE_OPTIONS = [
  { value: 'photo',      label: '📷 Photo' },
  { value: 'vecteur',    label: '🎨 Vecteur' },
  { value: 'video_file', label: '🎬 Vidéo (fichier)' },
  { value: 'document',   label: '📄 Document' },
  { value: 'donnees',    label: '📊 Données' },
  { value: 'archive',    label: '📦 Archive' },
  { value: 'video_url',  label: '▶ Vidéo (lien)' },
  { value: 'autre',      label: '📁 Autre' },
]

const MANDAT_BADGE: Record<string, string> = {
  en_attente: 'bg-orange-100 text-orange-700',
  en_cours:   'bg-blue-100 text-blue-700',
  remis:      'bg-green-100 text-green-700',
  approuve:   'bg-green-100 text-green-700',
  annule:     'bg-gray-100 text-gray-500',
}

function inferType(item: ChecklistItem): string {
  if (item.item_type === 'video') return 'video_url'
  if (item.file_category) return item.file_category === 'video' ? 'video_file' : item.file_category
  return 'autre'
}

export default function AdminProjetDetailPage() {
  const params = useParams()
  const id = params.id

  const [projet, setProjet] = useState<Projet | null>(null)
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [actionLoading, setActionLoading] = useState('')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  // Panels
  const [forceStatusOpen, setForceStatusOpen] = useState(false)
  const [forcedStatut, setForcedStatut] = useState(STATUTS[0])
  const [revisionOpen, setRevisionOpen] = useState(false)
  const [revisionItems, setRevisionItems] = useState<string[]>([''])
  const [editItemsOpen, setEditItemsOpen] = useState(false)
  const [editedItems, setEditedItems] = useState<EditItem[]>([])

  // Pigiste
  const [pigistes, setPigistes] = useState<Pigiste[]>([])
  const [mandats, setMandats] = useState<Mandat[]>([])
  const [selectedPigiste, setSelectedPigiste] = useState('')
  const [mandatTitre, setMandatTitre] = useState('')
  const [mandatMontant, setMandatMontant] = useState('')
  const [mandatEcheance, setMandatEcheance] = useState('')

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchData = useCallback(async () => {
    const [projetRes, checklistRes] = await Promise.all([
      fetch(`${API}/api/v1/admin/projet/${id}`, { credentials: 'include' }),
      fetch(`${API}/api/v1/admin/projet/${id}/checklist`, { credentials: 'include' }),
    ])
    if (projetRes.ok) setProjet(await projetRes.json())
    if (checklistRes.ok) {
      const data = await checklistRes.json()
      if (Array.isArray(data)) setItems(data)
    }
  }, [id])

  const fetchMandats = useCallback(async () => {
    const res = await fetch(`${API}/api/v1/admin/projet/${id}/mandats`, { credentials: 'include' })
    if (res.ok) setMandats(await res.json())
  }, [id])

  useEffect(() => {
    fetchData()
    fetchMandats()
    fetch(`${API}/api/v1/admin/pigistes`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPigistes(data) })
  }, [fetchData, fetchMandats])

  const postAction = async (path: string, body?: object): Promise<boolean> => {
    try {
      const res = await fetch(`${API}${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        showToast(d.error || 'Erreur serveur', false)
        return false
      }
      return true
    } catch {
      showToast('Erreur de connexion', false)
      return false
    }
  }

  const handleMarkDocumentsRecus = async () => {
    if (!confirm('Marquer les documents comme reçus ?')) return
    setActionLoading('docs')
    const ok = await postAction(`/api/v1/admin/projet/${id}/force-status`, { statut: 'Documents reçus' })
    if (ok) { showToast('Documents marqués reçus !'); await fetchData() }
    setActionLoading('')
  }

  const handleStart = async () => {
    if (!confirm('Démarrer les travaux ? Un email sera envoyé au client.')) return
    setActionLoading('start')
    const ok = await postAction(`/api/v1/admin/projet/${id}/start`)
    if (ok) { showToast('Travaux démarrés !'); await fetchData() }
    setActionLoading('')
  }

  const handleRevision = async () => {
    const validItems = revisionItems.filter(s => s.trim())
    setActionLoading('revision')
    const ok = await postAction(`/api/v1/admin/projet/${id}/revision`, { items: validItems })
    if (ok) { showToast('Projet en révision — client notifié !'); setRevisionOpen(false); setRevisionItems(['']); await fetchData() }
    setActionLoading('')
  }

  const handleComplete = async () => {
    if (!confirm('Marquer le projet comme complété ?')) return
    setActionLoading('complete')
    const ok = await postAction(`/api/v1/admin/projet/${id}/complete`)
    if (ok) { showToast('Projet complété — client notifié !'); await fetchData() }
    setActionLoading('')
  }

  const handleForceStatus = async () => {
    setActionLoading('force')
    const ok = await postAction(`/api/v1/admin/projet/${id}/force-status`, { statut: forcedStatut })
    if (ok) { showToast(`Statut forcé : ${forcedStatut}`); setForceStatusOpen(false); await fetchData() }
    setActionLoading('')
  }

  const handleNotifierRevision = async () => {
    setActionLoading('notif')
    const ok = await postAction(`/api/v1/admin/projet/${id}/notifier-revision`)
    if (ok) showToast('Client notifié par email !')
    setActionLoading('')
  }

  const handleNotifierFacture = async () => {
    if (!projet?.client_id) return
    setActionLoading('facture')
    const ok = await postAction(`/api/v1/admin/client/${projet.client_id}/notifier-facture`)
    if (ok) showToast('Notification facture envoyée au client !')
    setActionLoading('')
  }

  const handleArchive = async () => {
    const archived = projet?.is_archived
    if (!confirm(archived ? 'Désarchiver ce projet ?' : 'Archiver ce projet ?')) return
    setActionLoading('archive')
    const ok = await postAction(`/api/v1/admin/projet/${id}/${archived ? 'unarchive' : 'archive'}`)
    if (ok) { showToast(archived ? 'Projet désarchivé.' : 'Projet archivé.'); await fetchData() }
    setActionLoading('')
  }

  const openEditItems = () => {
    setEditedItems(items.filter(i => !i.is_revision).map(i => ({
      id: i.id,
      nom: i.nom_item,
      type: inferType(i),
      is_required: i.is_required,
    })))
    setEditItemsOpen(true)
  }

  const handleSaveItems = async () => {
    setActionLoading('edit')
    try {
      const res = await fetch(`${API}/api/v1/admin/projet/${id}/checklist`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: editedItems }),
      })
      if (res.ok) { showToast('Items mis à jour !'); setEditItemsOpen(false); await fetchData() }
      else { const d = await res.json().catch(() => ({})); showToast(d.error || 'Erreur', false) }
    } catch { showToast('Erreur de connexion', false) }
    setActionLoading('')
  }

  const handleCreerMandat = async () => {
    if (!selectedPigiste) { showToast('Sélectionne un pigiste', false); return }
    if (!mandatTitre.trim()) { showToast('Entre un titre de mandat', false); return }
    setActionLoading('mandat')
    try {
      const res = await fetch(`${API}/api/v1/admin/mandats`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pigiste: parseInt(selectedPigiste),
          id_projet: Number(id),
          titre: mandatTitre.trim(),
          montant_convenu: parseFloat(mandatMontant) || 0,
          date_echeance: mandatEcheance || null,
        }),
      })
      if (res.ok) {
        showToast('Mandat créé !')
        setSelectedPigiste(''); setMandatTitre(''); setMandatMontant(''); setMandatEcheance('')
        await fetchMandats()
      } else {
        const d = await res.json().catch(() => ({}))
        showToast(d.error || 'Erreur', false)
      }
    } catch { showToast('Erreur de connexion', false) }
    setActionLoading('')
  }

  const statut = projet?.statut || ''
  const stepIndex = STEP_INDEX[statut] ?? -1
  const style = STATUT_STYLES[statut] || STATUT_STYLES['Annulé']

  const isDocuments = statut === 'Documents à donner'
  const isDocumentsRecus = statut === 'Documents reçus'
  const isTravaux = statut === 'Travaux en cours'
  const isRevision = statut === 'En révision'
  const isComplete = statut === 'Complété'

  const itemsNormaux = items.filter(i => !i.is_revision)
  const itemsRevision = items.filter(i => i.is_revision)
  const done = itemsNormaux.filter(i => i.est_coche).length

  return (
    <div className="max-w-6xl mx-auto">

      {/* Toast */}
      {toast && (
        <div role="status" aria-live="polite" aria-atomic="true" className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-3 transition-all ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            {toast.ok ? 'check_circle' : 'error'}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-[var(--color-brand)]/10 text-[var(--color-brand)] px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest font-body">
              #{String(id).padStart(3, '0')}
            </span>
            <span className={`${style.bg} ${style.text} px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest flex items-center gap-2 font-body`}>
              <span className={`w-2 h-2 rounded-full ${style.dot}`} />
              {statut || '...'}
            </span>
            {projet?.is_archived && (
              <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-xs font-bold font-body uppercase tracking-widest">
                Archivé
              </span>
            )}
          </div>
          <h1 className="font-display text-[var(--text-3xl)] leading-none tracking-tight text-[var(--color-dark-1)] uppercase">
            {projet?.titre_affiche || projet?.nom_projet || '...'}
          </h1>
          {projet?.nom_service && (
            <p className="text-[var(--color-dark-text-2)] font-body text-sm">{projet.nom_service}</p>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleNotifierFacture}
            disabled={actionLoading === 'facture'}
            className="bg-[var(--color-brand)] text-white px-8 py-4 rounded-2xl font-body font-bold flex items-center justify-center gap-3 hover:bg-[var(--color-brand-hover)] transition-all disabled:opacity-60">
            <span aria-hidden="true" className="material-symbols-outlined">description</span>
            {actionLoading === 'facture' ? 'ENVOI...' : 'NOTIFIER FACTURE'}
          </button>
          <Link href={`/admin/projet/${id}/edit`}
            className="border border-[var(--color-light-border-2)] text-[var(--color-dark-1)] px-8 py-3 rounded-2xl font-body font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-light-1)] transition-all text-sm">
            <span aria-hidden="true" className="material-symbols-outlined text-sm">edit</span>
            MODIFIER
          </Link>
        </div>
      </header>

      {/* Pipeline stepper */}
      <div className="bg-white rounded-2xl p-6 mb-4 overflow-x-auto">
        <div className="flex items-start min-w-max">
          {PIPELINE_STEPS.map((step, idx) => {
            const isDone = stepIndex > idx
            const isActive = stepIndex === idx
            return (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center gap-2" style={{ minWidth: 100 }}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-body font-bold text-sm border-2 transition-all
                    ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : isActive ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white shadow-[0_0_0_4px_rgba(232,59,20,0.15)]' : 'bg-white border-[var(--color-light-border-2)] text-[var(--color-light-text-3)]'}`}>
                    {isDone
                      ? <span aria-hidden="true" className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      : idx + 1}
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest text-center leading-tight font-body
                    ${isDone ? 'text-emerald-600' : isActive ? 'text-[var(--color-brand)]' : 'text-[var(--color-light-text-3)]'}`}
                    style={{ maxWidth: 90 }}>
                    {step}
                  </span>
                </div>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div className={`h-0.5 w-12 mx-1 mb-5 flex-shrink-0 rounded-full ${stepIndex > idx ? 'bg-emerald-400' : 'bg-[var(--color-light-border-2)]'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Action bar contextuelle */}
      <div className="bg-[var(--color-light-0)] p-2 rounded-2xl mb-4 flex flex-wrap gap-2">

        {/* Bouton principal selon étape */}
        {isDocuments && (
          <button onClick={handleMarkDocumentsRecus} disabled={actionLoading === 'docs'}
            className="flex-1 min-w-[160px] bg-blue-600 text-white py-4 rounded-xl font-body font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-blue-700">
            <span aria-hidden="true" className="material-symbols-outlined text-sm">inbox</span>
            {actionLoading === 'docs' ? '...' : 'DOCS REÇUS'}
          </button>
        )}
        {isDocumentsRecus && (
          <button onClick={handleStart} disabled={actionLoading === 'start'}
            className="flex-1 min-w-[160px] bg-orange-500 text-white py-4 rounded-xl font-body font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-orange-600">
            <span aria-hidden="true" className="material-symbols-outlined text-sm">play_arrow</span>
            {actionLoading === 'start' ? '...' : 'DÉMARRER TRAVAUX'}
          </button>
        )}
        {isTravaux && (
          <button onClick={() => setRevisionOpen(true)}
            className="flex-1 min-w-[160px] bg-yellow-500 text-[var(--color-dark-1)] py-4 rounded-xl font-body font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-yellow-400">
            <span aria-hidden="true" className="material-symbols-outlined text-sm">rate_review</span>
            EN RÉVISION
          </button>
        )}
        {isRevision && (
          <>
            <button onClick={handleComplete} disabled={actionLoading === 'complete'}
              className="flex-1 min-w-[160px] bg-emerald-600 text-white py-4 rounded-xl font-body font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-emerald-700">
              <span aria-hidden="true" className="material-symbols-outlined text-sm">check_circle</span>
              {actionLoading === 'complete' ? '...' : 'MARQUER COMPLÉTÉ'}
            </button>
            <button onClick={handleNotifierRevision} disabled={actionLoading === 'notif'}
              className="flex-1 min-w-[160px] bg-yellow-600 text-white py-4 rounded-xl font-body font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-yellow-700">
              <span aria-hidden="true" className="material-symbols-outlined text-sm">mail</span>
              {actionLoading === 'notif' ? '...' : 'NOTIFIER CLIENT'}
            </button>
          </>
        )}
        {isComplete && (
          <div className="flex-1 min-w-[160px] flex items-center justify-center gap-2 py-4 text-emerald-600 font-body font-bold text-xs uppercase tracking-widest">
            <span aria-hidden="true" className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            PROJET COMPLÉTÉ
          </div>
        )}

        {/* Outils toujours visibles */}
        <Link href={`/admin/projet/${id}/identite-visuelle`}
          className="flex-1 min-w-[140px] bg-[var(--color-dark-1)] text-white py-4 rounded-xl font-body font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-black">
          <span aria-hidden="true" className="material-symbols-outlined text-sm">palette</span>
          IDENTITÉ VISUELLE
        </Link>
        <Link href={`/admin/projet/${id}/decision`}
          className="flex-1 min-w-[140px] bg-[var(--color-dark-text-2)] text-white py-4 rounded-xl font-body font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-[var(--color-dark-2)]">
          <span aria-hidden="true" className="material-symbols-outlined text-sm">quiz</span>
          DECISION BOARD
        </Link>
      </div>

      {/* Actions secondaires */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => { setForcedStatut(statut || STATUTS[0]); setForceStatusOpen(v => !v) }}
          className="bg-[var(--color-light-border-2)] text-[var(--color-dark-1)] px-5 py-2.5 rounded-xl font-body font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[var(--color-light-border-2)] transition-colors">
          <span aria-hidden="true" className="material-symbols-outlined text-sm">tune</span>
          Forcer statut
        </button>
        <button onClick={handleArchive} disabled={actionLoading === 'archive'}
          className="bg-[var(--color-light-border-2)] text-[var(--color-dark-1)] px-5 py-2.5 rounded-xl font-body font-bold text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-60 hover:bg-[var(--color-light-border-2)] transition-colors">
          <span aria-hidden="true" className="material-symbols-outlined text-sm">{projet?.is_archived ? 'unarchive' : 'archive'}</span>
          {projet?.is_archived ? 'Désarchiver' : 'Archiver'}
        </button>
        <button onClick={openEditItems}
          className="bg-[var(--color-light-border-2)] text-[var(--color-dark-1)] px-5 py-2.5 rounded-xl font-body font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[var(--color-light-border-2)] transition-colors">
          <span aria-hidden="true" className="material-symbols-outlined text-sm">edit_note</span>
          Modifier items
        </button>
      </div>

      {/* Panel — Forcer statut */}
      {forceStatusOpen && (
        <div className="bg-[var(--color-light-1)] border border-[var(--color-light-border-2)] rounded-2xl p-6 mb-6">
          <h3 className="font-display text-[var(--text-lg)] text-[var(--color-dark-1)] mb-4">FORCER LE STATUT</h3>
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={forcedStatut}
              onChange={e => setForcedStatut(e.target.value)}
              className="flex-1 min-w-[220px] bg-white border border-[var(--color-light-border-2)] rounded-xl px-4 py-3 font-body text-sm text-[var(--color-dark-1)] outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
            >
              {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={handleForceStatus} disabled={actionLoading === 'force'}
              className="bg-[var(--color-brand)] text-white px-8 py-3 rounded-xl font-body font-bold text-sm disabled:opacity-60 hover:bg-[var(--color-brand-hover)] transition-colors">
              {actionLoading === 'force' ? 'Envoi...' : 'Appliquer'}
            </button>
            <button onClick={() => setForceStatusOpen(false)}
              className="bg-[var(--color-light-border-2)] text-[var(--color-dark-1)] px-6 py-3 rounded-xl font-body font-bold text-sm hover:bg-[var(--color-light-border-2)] transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Panel — Envoyer en révision */}
      {revisionOpen && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <h3 className="font-display text-[var(--text-lg)] text-amber-800 mb-4">CRÉER UNE LISTE DE RÉVISIONS</h3>
          <p className="text-amber-700 font-body text-sm mb-4">Le client recevra un courriel de notification automatiquement.</p>
          <div className="space-y-2 mb-4">
            {revisionItems.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={e => setRevisionItems(prev => { const n = [...prev]; n[idx] = e.target.value; return n })}
                  placeholder="Item de révision..."
                  className="flex-1 bg-white border border-amber-200 rounded-xl px-4 py-2 font-body text-sm outline-none focus:ring-2 focus:ring-amber-400/40"
                />
                {revisionItems.length > 1 && (
                  <button onClick={() => setRevisionItems(prev => prev.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-600 px-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setRevisionItems(prev => [...prev, ''])}
              className="border border-dashed border-amber-400 text-amber-700 px-4 py-2 rounded-xl font-body text-sm font-bold hover:bg-amber-100 transition-colors">
              + Ajouter un item
            </button>
            <button onClick={handleRevision} disabled={actionLoading === 'revision'}
              className="bg-amber-500 text-white px-8 py-2 rounded-xl font-body font-bold text-sm disabled:opacity-60 hover:bg-amber-600 transition-colors">
              {actionLoading === 'revision' ? 'Envoi...' : 'Envoyer en révision + notifier'}
            </button>
            <button onClick={() => { setRevisionOpen(false); setRevisionItems(['']) }}
              className="bg-[var(--color-light-border-2)] text-[var(--color-dark-1)] px-6 py-2 rounded-xl font-body font-bold text-sm hover:bg-[var(--color-light-border-2)] transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Panel — Modifier items checklist */}
      {editItemsOpen && (
        <div className="bg-[var(--color-light-1)] border border-[var(--color-light-border-2)] rounded-2xl p-6 mb-6">
          <h3 className="font-display text-[var(--text-lg)] text-[var(--color-dark-1)] mb-4">MODIFIER LES ITEMS DE LA CHECKLIST</h3>
          {editedItems.length === 0 ? (
            <p className="text-[var(--color-dark-text-2)] font-body text-sm">Aucun item à modifier.</p>
          ) : (
            <div className="space-y-2 mb-4">
              {editedItems.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_200px_auto] gap-2 bg-white border border-[var(--color-light-border-2)] rounded-xl p-3">
                  <input
                    type="text"
                    value={item.nom}
                    onChange={e => setEditedItems(prev => { const n = [...prev]; n[idx] = { ...n[idx], nom: e.target.value }; return n })}
                    className="bg-[var(--color-light-1)] border border-[var(--color-light-border-2)] rounded-lg px-3 py-2 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
                  />
                  <select
                    value={item.type}
                    onChange={e => setEditedItems(prev => { const n = [...prev]; n[idx] = { ...n[idx], type: e.target.value }; return n })}
                    className="bg-[var(--color-light-1)] border border-[var(--color-light-border-2)] rounded-lg px-3 py-2 font-body text-sm outline-none"
                  >
                    {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <label className="flex items-center gap-2 font-body text-sm text-[var(--color-dark-text-2)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.is_required}
                      onChange={e => setEditedItems(prev => { const n = [...prev]; n[idx] = { ...n[idx], is_required: e.target.checked }; return n })}
                      className="w-4 h-4 accent-['var(--color-brand)']"
                    />
                    Obligatoire
                  </label>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={handleSaveItems} disabled={actionLoading === 'edit'}
              className="bg-[var(--color-brand)] text-white px-8 py-3 rounded-xl font-body font-bold text-sm disabled:opacity-60 hover:bg-[var(--color-brand-hover)] transition-colors">
              {actionLoading === 'edit' ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button onClick={() => setEditItemsOpen(false)}
              className="bg-[var(--color-light-border-2)] text-[var(--color-dark-1)] px-6 py-3 rounded-xl font-body font-bold text-sm hover:bg-[var(--color-light-border-2)] transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Colonne gauche */}
        <div className="lg:col-span-8 space-y-8">

          {/* Checklist + Drive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Checklist normale */}
            <div className="bg-white p-8 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[var(--text-xl)] text-[var(--color-dark-1)]">CHECKLIST PROJET</h2>
                <span className="text-xs text-[var(--color-dark-text-2)] font-body">{done}/{itemsNormaux.length}</span>
              </div>
              <div className="h-1.5 bg-[var(--color-light-border-2)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-brand)] rounded-full transition-all"
                  style={{ width: `${itemsNormaux.length ? (done / itemsNormaux.length) * 100 : 0}%` }} />
              </div>
              <div className="space-y-3">
                {itemsNormaux.length === 0 && (
                  <p className="text-[var(--color-dark-text-2)] text-sm font-body">Aucun item.</p>
                )}
                {itemsNormaux.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center ${item.est_coche ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-white' : 'border-[var(--color-light-border-2)]'}`}>
                      {item.est_coche && <span aria-hidden="true" className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                    </div>
                    <span className={`flex-1 font-body text-sm font-medium ${item.est_coche ? 'line-through text-[var(--color-dark-text-2)]' : 'text-[var(--color-dark-1)]'}`}>
                      {item.nom_item}
                    </span>
                    {item.requires_file && (
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full font-body ${item.est_coche ? 'bg-green-100 text-green-600' : item.is_required ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                        {item.est_coche ? '✓ Reçu' : item.is_required ? 'Requis' : 'Optionnel'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Drive */}
            <div className="bg-[var(--color-brand)]/5 p-8 rounded-3xl flex flex-col justify-between overflow-hidden relative">
              <div className="relative z-10">
                <h2 className="font-display text-[var(--text-xl)] text-[var(--color-brand)] mb-2">DRIVE DU PROJET</h2>
                <p className="text-[var(--color-dark-text-2)] text-sm mb-6 font-body">
                  Accédez à tous les assets et livrables.
                </p>
                {projet?.lien_gdrive ? (
                  <a href={projet.lien_gdrive} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[var(--color-brand)] font-body font-bold hover:underline text-sm">
                    <span aria-hidden="true" className="material-symbols-outlined">folder_open</span>
                    Ouvrir dans Drive
                  </a>
                ) : (
                  <span className="text-[var(--color-dark-text-2)] text-sm font-body">Aucun lien Drive.</span>
                )}
              </div>
              <span aria-hidden="true" className="material-symbols-outlined absolute -bottom-10 -right-10 text-[120px] text-[var(--color-brand)]/10 rotate-12">
                folder
              </span>
            </div>
          </div>

          {/* Items de révision */}
          {itemsRevision.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 space-y-4">
              <h2 className="font-display text-[var(--text-xl)] text-amber-800">LISTE DE RÉVISIONS</h2>
              <div className="space-y-3">
                {itemsRevision.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center ${item.est_coche ? 'border-amber-500 bg-amber-500 text-white' : 'border-amber-300'}`}>
                      {item.est_coche && <span aria-hidden="true" className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                    </div>
                    <span className={`flex-1 font-body text-sm font-medium ${item.est_coche ? 'line-through text-amber-400' : 'text-amber-900'}`}>
                      {item.nom_item}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full font-body bg-amber-200 text-amber-700">
                      Révision
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite */}
        <div className="lg:col-span-4 space-y-6">

          {/* Client card */}
          <div className="bg-[var(--color-dark-1)] text-white p-8 rounded-3xl space-y-6">
            <div className="space-y-1">
              <span className="text-[var(--color-brand)] text-xs font-bold uppercase tracking-widest font-body">CLIENT</span>
              <h2 className="font-display text-[var(--text-2xl)] text-white">{projet?.client_nom || '...'}</h2>
            </div>
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className="material-symbols-outlined text-white/40">mail</span>
                <span className="text-sm font-body text-white/80 break-all">{projet?.client_email}</span>
              </div>
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className="material-symbols-outlined text-white/40">call</span>
                <span className="text-sm font-body text-white/80">{projet?.client_telephone}</span>
              </div>
            </div>
            <Link href={`/admin/client/${projet?.client_id}`}
              className="block w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-body font-bold text-xs uppercase tracking-widest text-center transition-colors">
              VOIR LE PROFIL CLIENT
            </Link>
          </div>

          {/* Stats */}
          <div className="bg-[var(--color-light-1)] p-8 rounded-3xl space-y-8">
            <div>
              <span className="block text-[10px] font-extrabold uppercase text-[var(--color-dark-text-2)] tracking-widest mb-2 font-body">
                ÉCHÉANCE LIVRABLE
              </span>
              <span className="font-display text-[var(--text-xl)] text-[var(--color-dark-1)]">
                {projet?.date_livraison_estimee
                  ? new Date(projet.date_livraison_estimee).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()
                  : '—'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-extrabold uppercase text-[var(--color-dark-text-2)] tracking-widest mb-2 font-body">
                PROGRESSION CHECKLIST
              </span>
              <div className="flex items-center gap-3">
                <span className="font-display text-[var(--text-xl)] text-[var(--color-dark-1)]">{done}/{itemsNormaux.length}</span>
                <div className="flex-1 h-2 bg-[var(--color-light-border-2)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-brand)] rounded-full transition-all"
                    style={{ width: `${itemsNormaux.length ? (done / itemsNormaux.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Section Pigiste */}
          <div className="bg-white border border-[var(--color-light-border-2)] rounded-3xl p-6 space-y-4">
            <h3 className="font-display text-[var(--text-lg)] text-[var(--color-dark-1)]">PIGISTE ASSIGNÉ</h3>

            {/* Formulaire */}
            <div className="space-y-2">
              <select
                value={selectedPigiste}
                onChange={e => setSelectedPigiste(e.target.value)}
                className="w-full bg-[var(--color-light-1)] border border-[var(--color-light-border-2)] rounded-xl px-3 py-2.5 font-body text-sm text-[var(--color-dark-1)] outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
              >
                <option value="">-- Sélectionner un pigiste --</option>
                {pigistes.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nom_complet}{p.specialite ? ` — ${p.specialite}` : ''}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Titre du mandat (ex: Montage vidéo)"
                value={mandatTitre}
                onChange={e => setMandatTitre(e.target.value)}
                className="w-full bg-[var(--color-light-1)] border border-[var(--color-light-border-2)] rounded-xl px-3 py-2.5 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Montant ($)"
                  value={mandatMontant}
                  onChange={e => setMandatMontant(e.target.value)}
                  min={0} step={0.01}
                  className="bg-[var(--color-light-1)] border border-[var(--color-light-border-2)] rounded-xl px-3 py-2.5 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
                />
                <input
                  type="date"
                  value={mandatEcheance}
                  onChange={e => setMandatEcheance(e.target.value)}
                  className="bg-[var(--color-light-1)] border border-[var(--color-light-border-2)] rounded-xl px-3 py-2.5 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
                />
              </div>
              <button
                onClick={handleCreerMandat}
                disabled={actionLoading === 'mandat'}
                className="w-full bg-[var(--color-brand)] text-white py-3 rounded-xl font-body font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-[var(--color-brand-hover)] transition-colors">
                <span aria-hidden="true" className="material-symbols-outlined text-sm">add</span>
                {actionLoading === 'mandat' ? 'Création...' : 'Créer le mandat'}
              </button>
            </div>

            {/* Liste mandats */}
            {mandats.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[var(--color-light-border-2)]">
                {mandats.map(m => (
                  <div key={m.id} className="flex items-start gap-3 bg-[var(--color-light-1)] rounded-xl p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-bold text-sm text-[var(--color-dark-1)] truncate">{m.titre}</p>
                      <p className="font-body text-xs text-[var(--color-dark-text-2)]">
                        {m.nom_pigiste || '—'}{m.montant_convenu ? ` · ${m.montant_convenu.toFixed(2)} $` : ''}{m.date_echeance ? ` · ${m.date_echeance}` : ''}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full font-body flex-shrink-0 ${MANDAT_BADGE[m.statut] || 'bg-gray-100 text-gray-500'}`}>
                      {m.statut.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {mandats.length === 0 && (
              <p className="text-[var(--color-dark-text-2)] font-body text-xs">Aucun mandat assigné.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
