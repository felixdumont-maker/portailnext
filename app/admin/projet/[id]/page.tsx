'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { statutMeta, pipelineStepIndex, STATUTS_CANONIQUES } from '@/lib/statuts'

const API = process.env.NEXT_PUBLIC_API_URL || ''

interface Projet {
  id: number
  nom_projet: string
  titre_affiche: string | null
  statut: string
  pipeline_steps: string[]
  progress_pct: number
  is_site_web: boolean
  lien_gdrive: string | null
  date_livraison_estimee: string | null
  localisation: string | null
  lien_site_test: string | null
  client_id: number
  client_nom: string
  client_email: string
  client_telephone: string
  nom_service: string | null
  is_archived: boolean
  facturation_mode: string | null
  logo_fichiers: { id: number; filename: string }[]
}

interface ChecklistItem {
  id: number
  nom_item: string
  est_coche: boolean
  requires_file: boolean
  is_required: boolean
  is_revision: boolean
  admin_resolu: boolean
  item_type: string
  file_category: string
  field_type: string
  text_value: string | null
  has_file: boolean
  file_name: string | null
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
  is_producteur_principal: boolean
}

interface Mandat {
  id: number
  titre: string
  nom_pigiste: string | null
  montant_convenu: number
  date_echeance: string | null
  statut: string
}

interface RessourceDisponible {
  id: number
  titre: string
  categorie: string
  bundle_id: number | null
  is_global: boolean
  already_assigned: boolean
}

interface RessourceBundleLite {
  id: number
  nom: string
  icone: string
}

const STATUTS = STATUTS_CANONIQUES

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
  en_attente: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]',
  en_cours:   'bg-[var(--color-info-bg)] text-[var(--color-info-text)]',
  remis:      'bg-[var(--color-success-bg)] text-[var(--color-success-text)]',
  approuve:   'bg-[var(--color-success-bg)] text-[var(--color-success-text)]',
  annule:     'bg-[var(--color-light-border)] text-[var(--color-dark-text-2)]',
}

// Type de service → icône + couleur (même détection par mot-clé que la page Liste des projets)
function serviceType(nom: string | null): { label: string; color: string; icon: string } {
  const s = (nom || '').toLowerCase()
  if (/(vid[ée]o|short|reel|a[ée]rien)/.test(s))          return { label: 'Vidéo', color: 'var(--color-brand)', icon: 'videocam' }
  if (/photo|portrait|drone/.test(s))                      return { label: 'Photo', color: 'var(--color-info)', icon: 'photo_camera' }
  if (/(site|web|shopify|vercel|transactionnel|vitrine)/.test(s)) return { label: 'Web', color: 'var(--color-success)', icon: 'language' }
  if (/(marketing|r[ée]seaux|plan d.affaires|campagne)/.test(s))  return { label: 'Marketing', color: 'oklch(55% 0.17 300)', icon: 'campaign' }
  if (/(logo|identit[ée]|design|visuel|support|pr[ée]sentation|powerpoint|graph|imprim)/.test(s)) return { label: 'Design', color: 'var(--color-warning-mid-2)', icon: 'palette' }
  return { label: nom ? 'Service' : '—', color: 'var(--color-dark-text-2)', icon: 'category' }
}

interface Member { name: string; title: string; desc: string }

interface RevisionDraftItem { key: string; label: string; included: boolean }

let revisionKeySeq = 0
const newRevisionKey = () => `rev-${Date.now()}-${revisionKeySeq++}`

const REVISION_CHECKLIST_SITE_WEB_VITRINE = [
  'Orthographe et contenu textuel de toutes les pages',
  'Coordonnées (téléphone, courriel, adresse)',
  'Formulaire de contact (envoi et réception)',
  'Affichage sur mobile et tablette',
  'Liens (menu, boutons, réseaux sociaux)',
  "Section Équipe (noms, titres, photos, descriptions)",
  'Images du site (qualité et pertinence)',
  "Heures d'ouverture affichées",
  'Nom de domaine et certificat SSL (https)',
]

const inputCls = "w-full bg-[var(--color-light-0)] border-none rounded-xl px-4 py-3 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40"

function ChecklistItemContent({ item, apiBase }: { item: ChecklistItem; apiBase: string }) {
  const fileUrl = `${apiBase}/api/v1/admin/item/${item.id}/file`
  const isImage = item.has_file && /\.(jpe?g|png|gif|webp|svg)$/i.test(item.file_name || '')

  if (item.field_type === 'members' && item.text_value) {
    let members: Member[] = []
    try { members = JSON.parse(item.text_value) } catch { /* skip */ }
    return (
      <div className="space-y-2">
        {members.map((m, i) => (
          <div key={i} className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-lg p-3">
            <p className="font-body font-bold text-sm text-[var(--color-dark-1)]">{m.name}</p>
            {m.title && <p className="font-body text-xs text-[var(--color-brand)]">{m.title}</p>}
            {m.desc && <p className="font-body text-xs text-[var(--color-dark-text-2)] mt-1">{m.desc}</p>}
          </div>
        ))}
      </div>
    )
  }

  if (item.has_file) {
    return (
      <div className="flex flex-col gap-2">
        {isImage && (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fileUrl} alt={item.nom_item} className="max-h-40 rounded-lg object-contain border border-[var(--color-light-border)] bg-[var(--color-light-2)]" />
          </a>
        )}
        <a href={fileUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-body font-bold text-[var(--color-brand)] hover:underline">
          <span aria-hidden="true" className="material-symbols-outlined text-sm">download</span>
          Télécharger le fichier
        </a>
      </div>
    )
  }

  if (item.text_value) {
    return (
      <p className="font-body text-sm text-[var(--color-dark-1)] bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-lg px-3 py-2 whitespace-pre-wrap">
        {item.text_value}
      </p>
    )
  }

  return null
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
  const [showComplete, setShowComplete] = useState(false)
  const [showRevisionDone, setShowRevisionDone] = useState(false)
  const [actionLoading, setActionLoading] = useState('')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  // Panels
  const [forceStatusOpen, setForceStatusOpen] = useState(false)
  const [outilsOpen, setOutilsOpen] = useState(false)
  const [startPanelOpen, setStartPanelOpen] = useState(false)
  const [startDateInput, setStartDateInput] = useState('')
  const [forcedStatut, setForcedStatut] = useState<string>(STATUTS[0])
  const [revisionOpen, setRevisionOpen] = useState(false)
  const [revisionDraft, setRevisionDraft] = useState<RevisionDraftItem[]>([])
  const [editItemsOpen, setEditItemsOpen] = useState(false)
  const [editedItems, setEditedItems] = useState<EditItem[]>([])
  const [completeOpen, setCompleteOpen] = useState(false)
  const [completeRessources, setCompleteRessources] = useState<RessourceDisponible[]>([])
  const [completeBundles, setCompleteBundles] = useState<RessourceBundleLite[]>([])
  const [selectedRessourceIds, setSelectedRessourceIds] = useState<Set<number>>(new Set())
  const [loadingRessources, setLoadingRessources] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [deletingLogoId, setDeletingLogoId] = useState<number | null>(null)

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

  const handleToggleResolu = async (itemId: number) => {
    const ok = await postAction(`/api/v1/admin/item/${itemId}/resoudre`)
    if (ok) await fetchData()
  }

  const handleMarkDocumentsRecus = async () => {
    if (!confirm('Marquer les documents comme reçus ?')) return
    setActionLoading('docs')
    const ok = await postAction(`/api/v1/admin/projet/${id}/force-status`, { statut: 'Documents reçus' })
    if (ok) { showToast('Documents marqués reçus !'); await fetchData() }
    setActionLoading('')
  }

  // Ouvre le petit panneau de confirmation (date de livraison optionnelle) au lieu de
  // démarrer directement — laisse vide pour garder le calcul automatique par défaut.
  const openStartPanel = () => { setStartDateInput(''); setStartPanelOpen(true) }

  const handleStart = async () => {
    setActionLoading('start')
    const ok = await postAction(`/api/v1/admin/projet/${id}/start`, startDateInput ? { date_livraison: startDateInput } : undefined)
    if (ok) { showToast('Travaux démarrés !'); setStartPanelOpen(false); await fetchData() }
    setActionLoading('')
  }

  // Filet de sécurité manuel — le lien automatique avec la réservation (voir booking)
  // n'a pas pu s'appliquer (aucun rendez-vous trouvé, ou plusieurs projets en attente pour
  // ce client). Avance vers l'étape suivante réelle du pipeline de ce service.
  const handleConfirmRdv = async () => {
    const requiresDocs = (projet?.pipeline_steps || []).includes('Documents à donner')
    if (requiresDocs) {
      if (!confirm('Confirmer le rendez-vous et demander les documents au client ?')) return
      setActionLoading('rdv')
      const ok = await postAction(`/api/v1/admin/projet/${id}/force-status`, { statut: 'Documents à donner' })
      if (ok) { showToast('Rendez-vous confirmé !'); await fetchData() }
      setActionLoading('')
    } else {
      openStartPanel()
    }
  }

  const handleRevision = async () => {
    const validItems = revisionDraft.filter(r => r.included && r.label.trim()).map(r => r.label.trim())
    setActionLoading('revision')
    const ok = await postAction(`/api/v1/admin/projet/${id}/revision`, { items: validItems })
    if (ok) { showToast('Projet en révision — client notifié !'); setRevisionOpen(false); setRevisionDraft([]); await fetchData() }
    setActionLoading('')
  }

  // Corrections appliquées côté équipe -> renvoie au client pour une nouvelle passe.
  // Réutilise le même item de checklist (pas de reseed, ils existent déjà depuis la 1re ronde).
  const handleBackToRevision = async () => {
    if (!confirm('Renvoyer en révision ? Le client sera notifié.')) return
    setActionLoading('backrevision')
    const ok = await postAction(`/api/v1/admin/projet/${id}/revision`, { items: [] })
    if (ok) { showToast('Renvoyé en révision — client notifié !'); await fetchData() }
    setActionLoading('')
  }

  const openRevisionPanel = () => {
    const defaults = projet?.nom_service === 'Site Web Vitrine' ? REVISION_CHECKLIST_SITE_WEB_VITRINE : []
    setRevisionDraft(defaults.length
      ? defaults.map(label => ({ key: newRevisionKey(), label, included: true }))
      : [{ key: newRevisionKey(), label: '', included: true }])
    setRevisionOpen(true)
  }

  const openCompletePanel = async () => {
    setCompleteOpen(true)
    setLoadingRessources(true)
    try {
      const res = await fetch(`${API}/api/v1/admin/projet/${id}/ressources-disponibles`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        const ressources: RessourceDisponible[] = Array.isArray(data.ressources) ? data.ressources : []
        setCompleteRessources(ressources)
        setCompleteBundles(Array.isArray(data.bundles) ? data.bundles : [])
        setSelectedRessourceIds(new Set(ressources.filter(r => r.already_assigned).map(r => r.id)))
      }
    } catch { /* ignore */ }
    setLoadingRessources(false)
  }

  const toggleRessource = (rid: number) => {
    setSelectedRessourceIds(prev => {
      const next = new Set(prev)
      if (next.has(rid)) next.delete(rid); else next.add(rid)
      return next
    })
  }

  const handleComplete = async () => {
    setActionLoading('complete')
    const ok = await postAction(`/api/v1/admin/projet/${id}/complete`, { ressource_ids: Array.from(selectedRessourceIds) })
    if (ok) {
      showToast(selectedRessourceIds.size > 0 ? `Projet complété — client notifié avec ${selectedRessourceIds.size} ressource(s) !` : 'Projet complété — client notifié !')
      setCompleteOpen(false)
      await fetchData()
    }
    setActionLoading('')
  }

  const handleForceStatus = async () => {
    setActionLoading('force')
    const ok = await postAction(`/api/v1/admin/projet/${id}/force-status`, { statut: forcedStatut })
    if (ok) { showToast(`Statut forcé : ${forcedStatut}`); setForceStatusOpen(false); await fetchData() }
    setActionLoading('')
  }

  const handleRappelDocuments = async () => {
    setActionLoading('rappel')
    const ok = await postAction(`/api/v1/admin/projet/${id}/rappel-documents`)
    if (ok) showToast('Rappel envoyé au client !')
    setActionLoading('')
  }

  const handleNotifierRevision = async () => {
    setActionLoading('notif')
    const ok = await postAction(`/api/v1/admin/projet/${id}/notifier-revision`)
    if (ok) showToast('Client notifié par email !')
    setActionLoading('')
  }

  const handleNotifierFacture = async () => {
    setActionLoading('facture')
    const ok = await postAction(`/api/v1/admin/projet/${id}/notifier-facture`)
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

  const handleUploadLogo = async (files: FileList | File[]) => {
    const list = Array.from(files)
    if (list.length === 0) return
    setUploadingLogo(true)
    try {
      const fd = new FormData()
      list.forEach(f => fd.append('files', f))
      const res = await fetch(`${API}/api/v1/admin/projet/${id}/logo`, {
        method: 'POST', credentials: 'include', body: fd,
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) { showToast(`${list.length > 1 ? 'Logos déposés' : 'Logo déposé'} !`); await fetchData() }
      else showToast(data.error || 'Erreur lors du dépôt du logo', false)
    } catch { showToast('Erreur réseau', false) }
    setUploadingLogo(false)
  }

  const handleDeleteLogo = async (fileId: number) => {
    setDeletingLogoId(fileId)
    try {
      const res = await fetch(`${API}/api/v1/admin/projet/${id}/logo/${fileId}`, {
        method: 'DELETE', credentials: 'include',
      })
      if (res.ok) { showToast('Fichier retiré.'); await fetchData() }
      else showToast('Erreur lors du retrait', false)
    } catch { showToast('Erreur réseau', false) }
    setDeletingLogoId(null)
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
  const pipelineSteps = projet?.pipeline_steps && projet.pipeline_steps.length > 0
    ? projet.pipeline_steps
    : ['Documents à donner', 'Documents reçus', 'Travaux en cours', 'En révision', 'Complété']
  const stepIndex = pipelineStepIndex(pipelineSteps, statut) - 1 // 0-based pour le rendu ci-dessous
  const meta = statutMeta(statut)
  const type = serviceType(projet?.nom_service || null)

  const isEnAttenteRdv = statut === 'En attente de rendez-vous'
  const isDocuments = statut === 'Documents à donner'
  const isDocumentsRecus = statut === 'Documents reçus'
  const isTravaux = statut === 'Travaux en cours'
  const isRevision = statut === 'En révision'
  const isCorrections = statut === 'Corrections en cours'
  const isComplete = statut === 'Complété'
  const travauxDemarres = isTravaux || isRevision || isCorrections || isComplete

  const itemsNormaux = items.filter(i => !i.is_revision)
  const itemsRevision = items.filter(i => i.is_revision)
  const done = itemsNormaux.filter(i => i.est_coche).length
  const itemsEnAttente = itemsNormaux.filter(i => !i.est_coche)
  const itemsCompletes = itemsNormaux.filter(i => i.est_coche)
  // Un item coché avec un commentaire/fichier reste une action à traiter (le client
  // a signalé un problème) — seul un item coché SANS rien joint est vraiment classé.
  const itemsRevisionEnAttente = itemsRevision.filter(i => !i.est_coche)
  const itemsRevisionACorriger = itemsRevision.filter(i => i.est_coche && (i.text_value || i.has_file))
  const itemsRevisionApprouves = itemsRevision.filter(i => i.est_coche && !i.text_value && !i.has_file)
  const itemsRevisionCompletes = itemsRevisionApprouves

  const sousTitre = projet?.localisation || projet?.lien_site_test || projet?.nom_service || ''

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

      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-xs font-body text-[var(--color-dark-text-2)] mb-5">
        <span className="font-bold uppercase tracking-wide text-[var(--color-brand)]">CRM</span>
        <span aria-hidden="true" className="material-symbols-outlined text-sm">chevron_right</span>
        <Link href="/admin/projets" className="hover:text-[var(--color-brand)] transition-colors">Projets</Link>
        <span aria-hidden="true" className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-[var(--color-dark-1)] font-semibold">#{String(id).padStart(3, '0')}</span>
      </nav>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div className="space-y-3 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[var(--color-brand-muted)] text-[var(--color-brand)] px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest font-body">
              #{String(id).padStart(3, '0')}
            </span>
            <span style={{ background: meta.bg, color: meta.text }} className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 font-body">
              <span style={{ background: meta.dot }} className="w-1.5 h-1.5 rounded-full" />
              {statut || '...'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest font-body bg-[var(--color-light-0)]" style={{ color: type.color }}>
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '13px' }}>{type.icon}</span>
              {type.label}
            </span>
            {projet?.is_archived && (
              <span className="bg-[var(--color-light-border)] text-[var(--color-dark-text-2)] px-3 py-1 rounded-full text-[10px] font-bold font-body uppercase tracking-widest">
                Archivé
              </span>
            )}
          </div>
          <h1 className="font-display text-[var(--color-dark-0)] leading-tight truncate" style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.03em' }}>
            {projet?.titre_affiche || projet?.nom_projet || '...'}
          </h1>
          {sousTitre && (
            <p className="text-[var(--color-dark-text-2)] font-body text-sm truncate">{sousTitre}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 items-stretch">
          <div className="flex items-center gap-2">
            <button disabled
              title="Intégration QuickBooks — à venir"
              className="inline-flex items-center gap-2 bg-[var(--color-light-0)] border border-[var(--color-light-border)] text-[var(--color-dark-text-2)] px-4 py-2.5 rounded-full font-body text-xs font-bold uppercase tracking-wide cursor-not-allowed opacity-60 whitespace-nowrap">
              <span aria-hidden="true" className="material-symbols-outlined text-base">account_balance</span>
              QuickBooks
            </button>
            <Link href={`/admin/projet/${id}/edit`}
              className="inline-flex items-center gap-2 bg-[var(--color-light-2)] border border-[var(--color-light-border)] text-[var(--color-dark-1)] px-4 py-2.5 rounded-full font-body text-xs font-bold uppercase tracking-wide hover:border-[var(--color-brand)] transition-colors whitespace-nowrap">
              <span aria-hidden="true" className="material-symbols-outlined text-base">edit</span>
              Modifier
            </Link>
          </div>
          {projet?.facturation_mode ? (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--color-light-0)] border border-[var(--color-light-border)] justify-center">
              <span aria-hidden="true" className="material-symbols-outlined text-sm text-[var(--color-dark-text-2)]">money_off</span>
              <span className="font-body font-bold text-[10px] uppercase tracking-wide text-[var(--color-dark-text-2)]">
                {projet.facturation_mode === 'deja_paye' && 'Déjà payé'}
                {projet.facturation_mode === 'quickbooks' && 'QuickBooks'}
                {projet.facturation_mode === 'forfait' && 'Forfait'}
              </span>
            </div>
          ) : (
            <button
              onClick={handleNotifierFacture}
              disabled={actionLoading === 'facture'}
              className="bg-[var(--color-brand)] text-white px-5 py-2.5 rounded-full font-body font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-60">
              <span aria-hidden="true" className="material-symbols-outlined text-base">description</span>
              {actionLoading === 'facture' ? 'Envoi…' : 'Notifier facture'}
            </button>
          )}
        </div>
      </header>

      {/* Pipeline stepper */}
      <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-6 mb-4 overflow-x-auto">
        <div className="flex items-start min-w-max">
          {pipelineSteps.map((step, idx) => {
            const isDone = stepIndex > idx
            const isActive = stepIndex === idx
            return (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center gap-2" style={{ minWidth: 100 }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-body font-bold text-sm border-2 transition-all"
                    style={isDone
                      ? { background: 'var(--color-success)', borderColor: 'var(--color-success)', color: 'white' }
                      : isActive
                        ? { background: 'var(--color-brand)', borderColor: 'var(--color-brand)', color: 'white', boxShadow: '0 0 0 4px var(--color-brand-muted)' }
                        : { background: 'var(--color-light-2)', borderColor: 'var(--color-light-border)', color: 'var(--color-dark-text-2)' }}>
                    {isDone
                      ? <span aria-hidden="true" className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      : idx + 1}
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-center leading-tight font-body"
                    style={{ maxWidth: 90, color: isDone ? 'var(--color-success-text)' : isActive ? 'var(--color-brand)' : 'var(--color-dark-text-2)' }}>
                    {step}
                  </span>
                </div>
                {idx < pipelineSteps.length - 1 && (
                  <div className="h-0.5 w-12 mx-1 mb-5 flex-shrink-0 rounded-full"
                    style={{ background: stepIndex > idx ? 'var(--color-success)' : 'var(--color-light-border)' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Barre d'actions unifiée : actions contextuelles + outils + utilitaires, une seule rangée */}
      <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] p-2 rounded-[18px] mb-6 flex flex-wrap items-center gap-2">

        {/* Bouton principal selon étape */}
        {isEnAttenteRdv && (
          <button onClick={handleConfirmRdv} disabled={actionLoading === 'rdv'}
            className="flex-1 min-w-[160px] text-white py-4 rounded-xl font-body font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90"
            style={{ background: 'var(--color-dark-text-2)' }}>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">event_available</span>
            {actionLoading === 'rdv' ? '...' : 'Confirmer le rendez-vous'}
          </button>
        )}
        {isDocuments && (
          <>
            <button onClick={handleMarkDocumentsRecus} disabled={actionLoading === 'docs'}
              className="flex-1 min-w-[160px] py-4 rounded-xl font-body font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-white hover:opacity-90"
              style={{ background: 'var(--color-info)' }}>
              <span aria-hidden="true" className="material-symbols-outlined text-sm">inbox</span>
              {actionLoading === 'docs' ? '...' : 'Docs reçus'}
            </button>
            <button onClick={handleRappelDocuments} disabled={actionLoading === 'rappel'}
              className="flex-1 min-w-[160px] bg-[var(--color-light-0)] border border-[var(--color-light-border)] text-[var(--color-dark-1)] py-4 rounded-xl font-body font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-[var(--color-light-1)]">
              <span aria-hidden="true" className="material-symbols-outlined text-sm">notifications</span>
              {actionLoading === 'rappel' ? '...' : 'Rappel client'}
            </button>
          </>
        )}
        {isTravaux && (
          <button onClick={openRevisionPanel}
            className="flex-1 min-w-[160px] bg-[var(--color-brand)] text-white py-4 rounded-xl font-body font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-[var(--color-brand-hover)]">
            <span aria-hidden="true" className="material-symbols-outlined text-sm">rate_review</span>
            En révision
          </button>
        )}
        {isRevision && (
          <>
            <button onClick={openCompletePanel} disabled={actionLoading === 'complete'}
              className="flex-1 min-w-[160px] text-white py-4 rounded-xl font-body font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90"
              style={{ background: 'var(--color-success)' }}>
              <span aria-hidden="true" className="material-symbols-outlined text-sm">check_circle</span>
              {actionLoading === 'complete' ? '...' : 'Marquer complété'}
            </button>
            <button onClick={handleNotifierRevision} disabled={actionLoading === 'notif'}
              className="flex-1 min-w-[160px] bg-[var(--color-light-2)] border-2 border-[var(--color-brand)] text-[var(--color-brand)] py-4 rounded-xl font-body font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-[var(--color-brand)] hover:text-white">
              <span aria-hidden="true" className="material-symbols-outlined text-sm">mail</span>
              {actionLoading === 'notif' ? '...' : 'Notifier client'}
            </button>
          </>
        )}
        {isCorrections && (
          <button onClick={handleBackToRevision} disabled={actionLoading === 'backrevision'}
            className="flex-1 min-w-[160px] text-white py-4 rounded-xl font-body font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90"
            style={{ background: 'var(--color-brand)' }}>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">rate_review</span>
            {actionLoading === 'backrevision' ? '...' : 'Renvoyer en révision'}
          </button>
        )}
        {isComplete && (
          <div className="flex-1 min-w-[160px] flex items-center justify-center gap-2 py-4 font-body font-bold text-xs uppercase tracking-widest" style={{ color: 'var(--color-success-text)' }}>
            <span aria-hidden="true" className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Projet complété
          </div>
        )}

        {/* Démarrer les travaux — visible tant que les travaux n'ont pas commencé, pour forcer
            la séquence peu importe l'étape d'avant (rdv/documents) où on est bloqué */}
        {!travauxDemarres && (
          <button onClick={openStartPanel} disabled={actionLoading === 'start'}
            className="flex-1 min-w-[160px] text-white py-4 rounded-xl font-body font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90"
            style={{ background: 'var(--color-warning)' }}>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">play_arrow</span>
            {actionLoading === 'start' ? '...' : 'Démarrer les travaux'}
          </button>
        )}

        {/* Préparer site — seulement pour un service lié au web, à partir de Documents reçus */}
        {projet?.is_site_web && isDocumentsRecus && (
          <Link href={`/admin/sites/nouveau?from_projet=${id}`}
            className="flex-1 min-w-[140px] text-white py-4 rounded-xl font-body font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:opacity-90"
            style={{ background: 'var(--color-success)' }}>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">web</span>
            Préparer site
          </Link>
        )}

        {/* Séparateur vertical entre actions et utilitaires */}
        <div className="w-px self-stretch bg-[var(--color-light-border)] mx-1 hidden md:block" />

        {/* Utilitaires */}
        <button onClick={() => { setForcedStatut(statut || STATUTS[0]); setForceStatusOpen(v => !v) }}
          className="flex-shrink-0 bg-transparent text-[var(--color-dark-text-2)] px-4 py-2.5 rounded-full font-body font-bold text-xs uppercase tracking-wide flex items-center gap-2 hover:bg-[var(--color-light-0)] transition-colors">
          <span aria-hidden="true" className="material-symbols-outlined text-sm">tune</span>
          Forcer statut
        </button>
        <button onClick={handleArchive} disabled={actionLoading === 'archive'}
          className="flex-shrink-0 bg-transparent text-[var(--color-dark-text-2)] px-4 py-2.5 rounded-full font-body font-bold text-xs uppercase tracking-wide flex items-center gap-2 disabled:opacity-60 hover:bg-[var(--color-light-0)] transition-colors">
          <span aria-hidden="true" className="material-symbols-outlined text-sm">{projet?.is_archived ? 'unarchive' : 'archive'}</span>
          {projet?.is_archived ? 'Désarchiver' : 'Archiver'}
        </button>

        {/* Dropdown Outils — Identité visuelle / Decision board / Modifier items */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setOutilsOpen(v => !v)}
            className="flex-shrink-0 bg-transparent text-[var(--color-dark-text-2)] px-4 py-2.5 rounded-full font-body font-bold text-xs uppercase tracking-wide flex items-center gap-2 hover:bg-[var(--color-light-0)] transition-colors">
            <span aria-hidden="true" className="material-symbols-outlined text-sm">apps</span>
            Outils de présentation
            <span aria-hidden="true" className="material-symbols-outlined text-sm">{outilsOpen ? 'expand_less' : 'expand_more'}</span>
          </button>
          {outilsOpen && (
            <>
              <div onClick={() => setOutilsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
              <div className="bg-white border border-[var(--color-light-border)] rounded-xl shadow-lg overflow-hidden"
                style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', minWidth: '220px', zIndex: 41 }}>
                <Link href={`/admin/projet/${id}/identite-visuelle`} onClick={() => setOutilsOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 font-body text-sm font-semibold text-[var(--color-dark-1)] hover:bg-[var(--color-light-1)] transition-colors">
                  <span aria-hidden="true" className="material-symbols-outlined text-base">palette</span>
                  Identité visuelle
                </Link>
                <Link href={`/admin/projet/${id}/decision`} onClick={() => setOutilsOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 font-body text-sm font-semibold text-[var(--color-dark-1)] hover:bg-[var(--color-light-1)] transition-colors border-t border-[var(--color-light-border)]">
                  <span aria-hidden="true" className="material-symbols-outlined text-base">quiz</span>
                  Decision board
                </Link>
                <button onClick={() => { setOutilsOpen(false); openEditItems() }}
                  className="w-full flex items-center gap-2 px-4 py-3 font-body text-sm font-semibold text-[var(--color-dark-1)] hover:bg-[var(--color-light-1)] transition-colors border-t border-[var(--color-light-border)] text-left">
                  <span aria-hidden="true" className="material-symbols-outlined text-base">edit_note</span>
                  Modifier items
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Panel — Démarrer les travaux */}
      {startPanelOpen && (
        <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-6 mb-6">
          <h3 className="font-display text-sm uppercase tracking-wide text-[var(--color-dark-1)] mb-1">Démarrer les travaux</h3>
          <p className="font-body text-xs text-[var(--color-dark-text-2)] mb-4">
            Date de livraison estimée (optionnel) — laisse vide pour garder le calcul automatique par défaut.
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="date"
              value={startDateInput}
              onChange={e => setStartDateInput(e.target.value)}
              className={`flex-1 min-w-[220px] ${inputCls}`}
            />
            <button onClick={handleStart} disabled={actionLoading === 'start'}
              className="bg-[var(--color-brand)] text-white px-6 py-3 rounded-xl font-body font-bold text-sm disabled:opacity-60 hover:bg-[var(--color-brand-hover)] transition-colors">
              {actionLoading === 'start' ? 'Envoi...' : 'Confirmer'}
            </button>
            <button onClick={() => setStartPanelOpen(false)}
              className="bg-[var(--color-light-0)] text-[var(--color-dark-1)] px-5 py-3 rounded-xl font-body font-bold text-sm hover:bg-[var(--color-light-border)] transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Panel — Forcer statut */}
      {forceStatusOpen && (
        <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-6 mb-6">
          <h3 className="font-display text-sm uppercase tracking-wide text-[var(--color-dark-1)] mb-4">Forcer le statut</h3>
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={forcedStatut}
              onChange={e => setForcedStatut(e.target.value)}
              className={`flex-1 min-w-[220px] ${inputCls}`}
            >
              {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={handleForceStatus} disabled={actionLoading === 'force'}
              className="bg-[var(--color-brand)] text-white px-6 py-3 rounded-xl font-body font-bold text-sm disabled:opacity-60 hover:bg-[var(--color-brand-hover)] transition-colors">
              {actionLoading === 'force' ? 'Envoi...' : 'Appliquer'}
            </button>
            <button onClick={() => setForceStatusOpen(false)}
              className="bg-[var(--color-light-0)] text-[var(--color-dark-1)] px-5 py-3 rounded-xl font-body font-bold text-sm hover:bg-[var(--color-light-border)] transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Panel — Envoyer en révision */}
      {revisionOpen && (
        <div className="rounded-[18px] p-6 mb-6" style={{ background: 'var(--color-warning-bg)', border: '1px solid color-mix(in oklch, var(--color-warning) 30%, transparent)' }}>
          <h3 className="font-display text-sm uppercase tracking-wide mb-3" style={{ color: 'var(--color-warning-text)' }}>Créer une liste de révisions</h3>
          <p className="font-body text-sm mb-4" style={{ color: 'var(--color-warning-text)' }}>
            Décochez les items qui ne s&apos;appliquent pas à ce projet. Le client recevra un courriel de notification automatiquement et pourra cocher chaque item ou signaler un changement (texte ou fichier).
          </p>
          <div className="space-y-2 mb-4">
            {revisionDraft.map(row => (
              <div key={row.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={row.included}
                  onChange={e => setRevisionDraft(prev => prev.map(r => r.key === row.key ? { ...r, included: e.target.checked } : r))}
                  className="w-5 h-5 flex-shrink-0"
                  style={{ accentColor: 'var(--color-warning)' }}
                />
                <input
                  type="text"
                  value={row.label}
                  onChange={e => setRevisionDraft(prev => prev.map(r => r.key === row.key ? { ...r, label: e.target.value } : r))}
                  placeholder="Item de révision..."
                  className={`flex-1 bg-[var(--color-light-2)] border-none rounded-xl px-4 py-2 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 ${!row.included ? 'opacity-50' : ''}`}
                />
                <button onClick={() => setRevisionDraft(prev => prev.filter(r => r.key !== row.key))}
                  className="px-2 hover:opacity-70" style={{ color: 'var(--color-warning-text)' }}>
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ))}
            {revisionDraft.length === 0 && (
              <p className="font-body text-sm opacity-70" style={{ color: 'var(--color-warning-text)' }}>Aucun item. Cliquez sur « + Ajouter un item ».</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setRevisionDraft(prev => [...prev, { key: newRevisionKey(), label: '', included: true }])}
              className="border border-dashed px-4 py-2 rounded-xl font-body text-sm font-bold hover:bg-[var(--color-light-2)] transition-colors"
              style={{ borderColor: 'var(--color-warning)', color: 'var(--color-warning-text)' }}>
              + Ajouter un item
            </button>
            <button onClick={handleRevision} disabled={actionLoading === 'revision'}
              className="text-white px-6 py-2 rounded-xl font-body font-bold text-sm disabled:opacity-60 hover:opacity-90 transition-colors"
              style={{ background: 'var(--color-warning)' }}>
              {actionLoading === 'revision' ? 'Envoi...' : 'Envoyer en révision + notifier'}
            </button>
            <button onClick={() => { setRevisionOpen(false); setRevisionDraft([]) }}
              className="bg-[var(--color-light-2)] px-5 py-2 rounded-xl font-body font-bold text-sm hover:bg-[var(--color-light-0)] transition-colors" style={{ color: 'var(--color-dark-1)' }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Panel — Modifier items checklist */}
      {editItemsOpen && (
        <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-6 mb-6">
          <h3 className="font-display text-sm uppercase tracking-wide text-[var(--color-dark-1)] mb-4">Modifier les items de la checklist</h3>
          {editedItems.length === 0 ? (
            <p className="text-[var(--color-dark-text-2)] font-body text-sm">Aucun item à modifier.</p>
          ) : (
            <div className="space-y-2 mb-4">
              {editedItems.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_200px_auto] gap-2 bg-[var(--color-light-0)] border border-[var(--color-light-border)] rounded-xl p-3">
                  <input
                    type="text"
                    value={item.nom}
                    onChange={e => setEditedItems(prev => { const n = [...prev]; n[idx] = { ...n[idx], nom: e.target.value }; return n })}
                    className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-lg px-3 py-2 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
                  />
                  <select
                    value={item.type}
                    onChange={e => setEditedItems(prev => { const n = [...prev]; n[idx] = { ...n[idx], type: e.target.value }; return n })}
                    className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-lg px-3 py-2 font-body text-sm outline-none"
                  >
                    {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <label className="flex items-center gap-2 font-body text-sm text-[var(--color-dark-text-2)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.is_required}
                      onChange={e => setEditedItems(prev => { const n = [...prev]; n[idx] = { ...n[idx], is_required: e.target.checked }; return n })}
                      className="w-4 h-4"
                      style={{ accentColor: 'var(--color-brand)' }}
                    />
                    Obligatoire
                  </label>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={handleSaveItems} disabled={actionLoading === 'edit'}
              className="bg-[var(--color-brand)] text-white px-6 py-3 rounded-xl font-body font-bold text-sm disabled:opacity-60 hover:bg-[var(--color-brand-hover)] transition-colors">
              {actionLoading === 'edit' ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button onClick={() => setEditItemsOpen(false)}
              className="bg-[var(--color-light-0)] text-[var(--color-dark-1)] px-5 py-3 rounded-xl font-body font-bold text-sm hover:bg-[var(--color-light-border)] transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Panel — Marquer complété + ressources à envoyer */}
      {completeOpen && (
        <div className="rounded-[18px] p-6 mb-6" style={{ background: 'var(--color-success-bg)', border: '1px solid color-mix(in oklch, var(--color-success) 30%, transparent)' }}>
          <h3 className="font-display text-sm uppercase tracking-wide mb-3" style={{ color: 'var(--color-success-text)' }}>Marquer complété — ressources à envoyer</h3>
          <p className="font-body text-sm mb-4" style={{ color: 'var(--color-success-text)' }}>
            Cochez les ressources à attribuer à {projet?.client_nom || 'la cliente'}. Elles seront ajoutées à son portail et incluses dans le courriel de livraison.
          </p>
          {loadingRessources ? (
            <p className="font-body text-sm mb-4 opacity-70" style={{ color: 'var(--color-success-text)' }}>Chargement des ressources...</p>
          ) : completeRessources.length === 0 ? (
            <p className="font-body text-sm mb-4 opacity-70" style={{ color: 'var(--color-success-text)' }}>
              Aucune ressource disponible. <Link href="/admin/ressources" className="underline font-bold">Créer une ressource</Link>.
            </p>
          ) : (
            <div className="space-y-4 mb-4">
              {completeBundles.map(b => {
                const items = completeRessources.filter(r => r.bundle_id === b.id)
                if (items.length === 0) return null
                return (
                  <div key={b.id}>
                    <p className="font-body text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-success-text)' }}>
                      <span aria-hidden="true" className="material-symbols-outlined text-sm">{b.icone}</span>
                      {b.nom}
                    </p>
                    <div className="space-y-1.5">
                      {items.map(r => (
                        <label key={r.id} className="flex items-center gap-2 bg-[var(--color-light-2)] rounded-xl px-3 py-2 cursor-pointer" style={{ border: '1px solid color-mix(in oklch, var(--color-success) 25%, transparent)' }}>
                          <input type="checkbox" checked={selectedRessourceIds.has(r.id)} onChange={() => toggleRessource(r.id)}
                            className="w-4 h-4" style={{ accentColor: 'var(--color-success)' }} />
                          <span className="flex-1 font-body text-sm text-[var(--color-dark-1)]">{r.titre}</span>
                          {r.is_global && (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[var(--color-light-border)] text-[var(--color-dark-text-2)] font-body">Tous</span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
              {(() => {
                const sansBundle = completeRessources.filter(r => !completeBundles.some(b => b.id === r.bundle_id))
                if (sansBundle.length === 0) return null
                return (
                  <div>
                    <p className="font-body text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-success-text)' }}>Sans bundle</p>
                    <div className="space-y-1.5">
                      {sansBundle.map(r => (
                        <label key={r.id} className="flex items-center gap-2 bg-[var(--color-light-2)] rounded-xl px-3 py-2 cursor-pointer" style={{ border: '1px solid color-mix(in oklch, var(--color-success) 25%, transparent)' }}>
                          <input type="checkbox" checked={selectedRessourceIds.has(r.id)} onChange={() => toggleRessource(r.id)}
                            className="w-4 h-4" style={{ accentColor: 'var(--color-success)' }} />
                          <span className="flex-1 font-body text-sm text-[var(--color-dark-1)]">{r.titre}</span>
                          {r.is_global && (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[var(--color-light-border)] text-[var(--color-dark-text-2)] font-body">Tous</span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <button onClick={handleComplete} disabled={actionLoading === 'complete'}
              className="text-white px-6 py-3 rounded-xl font-body font-bold text-sm disabled:opacity-60 hover:opacity-90 transition-colors"
              style={{ background: 'var(--color-success)' }}>
              {actionLoading === 'complete' ? 'Envoi...' : selectedRessourceIds.size > 0 ? `Attribuer (${selectedRessourceIds.size}) + Marquer complété` : 'Marquer complété'}
            </button>
            <button onClick={() => setCompleteOpen(false)}
              className="bg-[var(--color-light-2)] px-5 py-3 rounded-xl font-body font-bold text-sm hover:bg-[var(--color-light-0)] transition-colors" style={{ color: 'var(--color-dark-1)' }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Révisions du client — toujours en haut de page dès qu'il y en a : c'est
          l'action prioritaire, elle ne doit pas se perdre plus bas dans la page. */}
      {itemsRevision.length > 0 && (
        <div className="rounded-[18px] p-6 space-y-4 mb-6" style={{ background: 'var(--color-warning-bg)', border: '1px solid color-mix(in oklch, var(--color-warning) 30%, transparent)' }}>
          <div>
            <h2 className="font-display text-base uppercase tracking-wide" style={{ color: 'var(--color-warning-text)' }}>Liste de révisions</h2>
            {itemsRevisionACorriger.length > 0 && (
              <p className="font-body text-xs mt-1" style={{ color: 'var(--color-warning-text)' }}>
                {itemsRevisionACorriger.filter(i => i.admin_resolu).length}/{itemsRevisionACorriger.length} corrections cochées —
                une fois toutes cochées, le client est automatiquement renotifié pour une dernière vérification.
              </p>
            )}
          </div>
          <div className="space-y-3">
            {itemsRevisionEnAttente.map(item => (
              <div key={item.id}>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center"
                    style={{ borderColor: 'color-mix(in oklch, var(--color-warning) 50%, transparent)' }} />
                  <span className="flex-1 font-body text-sm font-medium" style={{ color: 'var(--color-warning-text)' }}>
                    {item.nom_item}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full font-body" style={{ background: 'var(--color-warning)', color: 'white' }}>
                    En attente
                  </span>
                </div>
                {(item.text_value || item.has_file) && (
                  <div className="pl-8 pt-1.5">
                    <ChecklistItemContent item={item} apiBase={API} />
                  </div>
                )}
              </div>
            ))}

            {/* Coché + commentaire/fichier joint = le client a signalé un problème — reste
                visible et actionnable ici tant que ce n'est pas coché "corrigé" par l'admin. */}
            {itemsRevisionACorriger.map(item => (
              <div key={item.id} className="rounded-xl p-2"
                style={{
                  background: item.admin_resolu ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                  border: `1px solid color-mix(in oklch, ${item.admin_resolu ? 'var(--color-success)' : 'var(--color-error)'} 30%, transparent)`,
                }}>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleResolu(item.id)}
                    title={item.admin_resolu ? 'Corrigé — cliquer pour annuler' : 'Marquer comme corrigé'}
                    className="w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center cursor-pointer"
                    style={item.admin_resolu
                      ? { borderColor: 'var(--color-success)', background: 'var(--color-success)', color: 'white' }
                      : { borderColor: 'var(--color-error)', background: 'transparent' }}
                  >
                    {item.admin_resolu && (
                      <span aria-hidden="true" className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    )}
                  </button>
                  <span className="flex-1 font-body text-sm font-medium"
                    style={{
                      color: item.admin_resolu ? 'var(--color-success-text)' : 'var(--color-error-text)',
                      textDecoration: item.admin_resolu ? 'line-through' : 'none',
                      opacity: item.admin_resolu ? 0.6 : 1,
                    }}>
                    {item.nom_item}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full font-body"
                    style={{ background: item.admin_resolu ? 'var(--color-success)' : 'var(--color-error)', color: 'white' }}>
                    {item.admin_resolu ? 'Corrigé' : 'À corriger'}
                  </span>
                </div>
                <div className="pl-8 pt-1.5">
                  <ChecklistItemContent item={item} apiBase={API} />
                </div>
              </div>
            ))}

            {itemsRevisionCompletes.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowRevisionDone(v => !v)}
                  aria-expanded={showRevisionDone}
                  className="flex items-center gap-2 py-1.5 transition-colors"
                  style={{ color: 'var(--color-warning-text)' }}
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-lg transition-transform" style={{ transform: showRevisionDone ? 'rotate(180deg)' : 'none' }}>
                    expand_more
                  </span>
                  <span className="font-body text-xs font-bold uppercase tracking-widest">
                    {showRevisionDone ? 'Masquer' : 'Voir'} approuvé ({itemsRevisionCompletes.length})
                  </span>
                </button>
                {showRevisionDone && (
                  <div className="space-y-3 mt-2">
                    {itemsRevisionCompletes.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center"
                          style={{ borderColor: 'var(--color-warning)', background: 'var(--color-warning)', color: 'white' }}>
                          <span aria-hidden="true" className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                        </div>
                        <span className="flex-1 font-body text-sm font-medium line-through opacity-50" style={{ color: 'var(--color-warning-text)' }}>
                          {item.nom_item}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full font-body" style={{ background: 'var(--color-warning)', color: 'white' }}>
                          Approuvé
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Colonne gauche */}
        <div className="lg:col-span-8 space-y-6">

          {/* Checklist + Drive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Checklist normale */}
            {itemsNormaux.length === 0 ? (
              <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] px-6 py-4 flex items-center gap-3">
                <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-dark-text-2)]">checklist</span>
                <p className="text-[var(--color-dark-text-2)] text-sm font-body">Aucun item pour ce type de service.</p>
              </div>
            ) : (
            <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] p-6 rounded-[18px] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base uppercase tracking-wide text-[var(--color-dark-1)]">Checklist projet</h2>
                <span className="text-xs text-[var(--color-dark-text-2)] font-body">{done}/{itemsNormaux.length}</span>
              </div>
              <div className="h-1.5 bg-[var(--color-light-0)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-brand)] rounded-full transition-all"
                  style={{ width: `${itemsNormaux.length ? (done / itemsNormaux.length) * 100 : 0}%` }} />
              </div>
              <div className="space-y-3">
                {itemsEnAttente.map(item => (
                  <div key={item.id} className="rounded-xl border transition-all" style={{ borderColor: 'var(--color-light-border)' }}>
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <div className="w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center" style={{ borderColor: 'var(--color-light-border)' }} />
                      <span className="flex-1 font-body text-sm font-medium text-[var(--color-dark-text-2)]">
                        {item.nom_item}
                      </span>
                      {item.requires_file && !item.has_file && (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full font-body"
                          style={item.is_required ? { background: 'var(--color-error-bg)', color: 'var(--color-error-text)' } : { background: 'var(--color-light-border)', color: 'var(--color-dark-text-2)' }}>
                          {item.is_required ? 'Requis' : 'Optionnel'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {itemsCompletes.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowComplete(v => !v)}
                      aria-expanded={showComplete}
                      className="flex items-center gap-2 py-1.5 text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-1)] transition-colors"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-lg transition-transform" style={{ transform: showComplete ? 'rotate(180deg)' : 'none' }}>
                        expand_more
                      </span>
                      <span className="font-body text-xs font-bold uppercase tracking-widest">
                        {showComplete ? 'Masquer' : 'Voir'} complété ({itemsCompletes.length})
                      </span>
                    </button>
                    {showComplete && (
                      <div className="space-y-3 mt-2">
                        {itemsCompletes.map(item => (
                          <div key={item.id} className="rounded-xl border transition-all"
                            style={{ borderColor: 'color-mix(in oklch, var(--color-brand) 20%, transparent)', background: 'var(--color-brand-muted)' }}>
                            <div className="flex items-center gap-3 px-3 py-2.5">
                              <div className="w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center"
                                style={{ borderColor: 'var(--color-brand)', background: 'var(--color-brand)', color: 'white' }}>
                                <span aria-hidden="true" className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                              </div>
                              <span className="flex-1 font-body text-sm font-medium text-[var(--color-dark-1)]">
                                {item.nom_item}
                              </span>
                            </div>
                            {(item.text_value || item.has_file) && (
                              <div className="px-3 pb-3">
                                <ChecklistItemContent item={item} apiBase={API} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Fichiers du projet — Drive + Logo vectorisé fusionnés (fond standard) */}
            <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] p-6 rounded-[18px] space-y-4">
              <div>
                <h2 className="font-display text-base uppercase tracking-wide text-[var(--color-dark-1)] mb-2">Fichiers du projet</h2>
                <div className="flex flex-col gap-2">
                  {projet?.lien_gdrive ? (
                    <a href={projet.lien_gdrive} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-body font-bold hover:underline text-sm text-[var(--color-brand)]">
                      <span aria-hidden="true" className="material-symbols-outlined text-lg">folder_open</span>
                      Drive du projet — Ouvrir →
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-[var(--color-dark-text-2)] text-sm font-body">
                      <span aria-hidden="true" className="material-symbols-outlined text-lg">folder_off</span>
                      Aucun lien Drive.
                    </span>
                  )}
                  <button
                    onClick={async () => {
                      setActionLoading('drive')
                      try {
                        const res = await fetch(`${API}/api/v1/admin/projet/${id}/recreate-drive`, { method: 'POST', credentials: 'include' })
                        const d = await res.json()
                        if (res.ok) { showToast('Dossier Drive créé !'); await fetchData() }
                        else showToast(d.error || 'Erreur Drive', false)
                      } catch { showToast('Erreur réseau', false) }
                      setActionLoading('')
                    }}
                    disabled={actionLoading === 'drive'}
                    className="inline-flex items-center gap-2 text-xs font-body text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] transition-colors disabled:opacity-50 self-start">
                    <span aria-hidden="true" className="material-symbols-outlined text-sm">
                      {actionLoading === 'drive' ? 'refresh' : 'add_circle'}
                    </span>
                    {actionLoading === 'drive' ? 'Création…' : projet?.lien_gdrive ? 'Recréer le dossier' : 'Créer le dossier Drive'}
                  </button>
                </div>
              </div>

              <div className="h-px bg-[var(--color-light-border)]" />

              <div>
                <h3 className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-2">Logo vectorisé</h3>
                <p className="text-[var(--color-dark-text-2)] text-xs font-body mb-3">
                  Déposez un ou plusieurs fichiers (logo, variantes) — ils iront dans un dossier Drive « Logo » dédié et seront proposés au téléchargement dans le courriel de livraison du projet.
                </p>
                {projet && projet.logo_fichiers.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {projet.logo_fichiers.map(f => (
                      <div key={f.id} className="flex items-center gap-3 bg-[var(--color-light-0)] rounded-xl px-3 py-2">
                        <a href={`${API}/api/v1/projet/${id}/logo/${f.id}`} target="_blank" rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center gap-2 font-body font-bold hover:underline text-sm min-w-0 truncate" style={{ color: 'var(--color-brand)' }}>
                          <span aria-hidden="true" className="material-symbols-outlined text-sm flex-shrink-0">download</span>
                          {f.filename}
                        </a>
                        <button onClick={() => handleDeleteLogo(f.id)} disabled={deletingLogoId === f.id}
                          className="text-[var(--color-dark-text-2)] hover:text-red-600 transition-colors flex-shrink-0" aria-label="Retirer">
                          <span aria-hidden="true" className="material-symbols-outlined text-base">{deletingLogoId === f.id ? 'progress_activity' : 'close'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className={`flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed rounded-xl transition-all ${uploadingLogo ? 'opacity-60 cursor-default' : 'cursor-pointer hover:border-[var(--color-brand)]'}`}
                  style={{ borderColor: 'var(--color-light-border)' }}>
                  <input type="file" accept=".svg,.ai,.eps,.pdf,.png" multiple className="hidden" disabled={uploadingLogo}
                    onChange={e => { if (e.target.files?.length) handleUploadLogo(e.target.files); e.target.value = '' }} />
                  <span aria-hidden="true" className="material-symbols-outlined text-2xl text-[var(--color-dark-text-2)]">
                    {uploadingLogo ? 'hourglass_top' : 'upload_file'}
                  </span>
                  <span className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] text-center">
                    {uploadingLogo ? 'Envoi…' : 'Déposer un ou plusieurs fichiers (SVG, AI, EPS, PDF, PNG)'}
                  </span>
                </label>
              </div>
            </div>
          </div>

        </div>

        {/* Colonne droite */}
        <div className="lg:col-span-4 space-y-6">

          {/* Client + suivi + pigiste — une seule carte à sections */}
          <div className="rounded-[18px] overflow-hidden border border-[var(--color-light-border)]">

            {/* Section Client (en-tête sombre) */}
            <div className="text-white p-6 space-y-5" style={{ background: 'linear-gradient(160deg, var(--color-dark-1), var(--color-dark-0))' }}>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest font-body" style={{ color: 'var(--color-brand)' }}>Client</span>
                <h2 className="font-display text-xl text-white">{projet?.client_nom || '...'}</h2>
              </div>
              <div className="pt-5 border-t border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="material-symbols-outlined text-white/40 text-lg">mail</span>
                  <span className="text-sm font-body text-white/80 break-all">{projet?.client_email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="material-symbols-outlined text-white/40 text-lg">call</span>
                  <span className="text-sm font-body text-white/80">{projet?.client_telephone}</span>
                </div>
              </div>
              <Link href={`/admin/client/${projet?.client_id}`}
                className="block w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-body font-bold text-xs uppercase tracking-widest text-center transition-colors">
                Voir le profil client
              </Link>
            </div>

            {/* Section Échéance */}
            <div className="bg-[var(--color-light-2)] p-6 border-t border-[var(--color-light-border)]">
              <span className="block text-[10px] font-extrabold uppercase text-[var(--color-dark-text-2)] tracking-widest mb-2 font-body">
                Échéance livrable
              </span>
              <span className="font-display text-lg text-[var(--color-dark-1)]">
                {projet?.date_livraison_estimee
                  ? new Date(projet.date_livraison_estimee).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—'}
              </span>
            </div>

            {/* Section Progression — même calcul (done/itemsNormaux) que la carte Checklist */}
            <div className="bg-[var(--color-light-2)] p-6 border-t border-[var(--color-light-border)]">
              <span className="block text-[10px] font-extrabold uppercase text-[var(--color-dark-text-2)] tracking-widest mb-2 font-body">
                Progression checklist
              </span>
              <div className="flex items-center gap-3">
                <span className="font-display text-lg text-[var(--color-dark-1)]">{done}/{itemsNormaux.length}</span>
                <div className="flex-1 h-1.5 bg-[var(--color-light-0)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-brand)] rounded-full transition-all"
                    style={{ width: `${itemsNormaux.length ? (done / itemsNormaux.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            {/* Section Pigiste assigné */}
            <div className="bg-[var(--color-light-2)] p-6 border-t border-[var(--color-light-border)] space-y-4">
              <h3 className="font-display text-base uppercase tracking-wide text-[var(--color-dark-1)]">Pigiste assigné</h3>

            {/* Formulaire */}
            <div className="space-y-2">
              <select
                value={selectedPigiste}
                onChange={e => setSelectedPigiste(e.target.value)}
                className={inputCls}
              >
                <option value="">-- Sélectionner un pigiste --</option>
                {pigistes.filter(p => p.is_producteur_principal).map(p => (
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
                className={inputCls}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Montant ($)"
                  value={mandatMontant}
                  onChange={e => setMandatMontant(e.target.value)}
                  min={0} step={0.01}
                  className={inputCls}
                />
                <input
                  type="date"
                  value={mandatEcheance}
                  onChange={e => setMandatEcheance(e.target.value)}
                  className={inputCls}
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
              <div className="space-y-2 pt-2 border-t border-[var(--color-light-border)]">
                {mandats.map(m => (
                  <div key={m.id} className="flex items-start gap-3 bg-[var(--color-light-0)] rounded-xl p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-bold text-sm text-[var(--color-dark-1)] truncate">{m.titre}</p>
                      <p className="font-body text-xs text-[var(--color-dark-text-2)]">
                        {m.nom_pigiste || '—'}{m.montant_convenu ? ` · ${m.montant_convenu.toFixed(2)} $` : ''}{m.date_echeance ? ` · ${m.date_echeance}` : ''}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full font-body flex-shrink-0 ${MANDAT_BADGE[m.statut] || 'bg-[var(--color-light-border)] text-[var(--color-dark-text-2)]'}`}>
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
    </div>
  )
}
