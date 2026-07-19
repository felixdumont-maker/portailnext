'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Task as Todo } from '@/lib/tasks'

interface Client {
  id: number
  nom_complet: string
  nom_entreprise: string
  email: string
  telephone: string
  created_at: string
  is_email_confirmed: boolean
  statut_relation: string
  prochain_suivi: string | null
  lien_gdrive: string | null
  source_acquisition: string | null
  site_web: string | null
  adresse: string | null
  ville: string | null
  contact_secondaire_nom: string | null
  contact_secondaire_role: string | null
  contact_secondaire_email: string | null
}

interface Projet { id: number; nom_projet: string; statut: string; created_at: string }
interface Note { id: number; contenu: string; created_at: string }
interface Facture {
  id: number; numero: string; statut: string; en_retard: boolean
  total: number; date_emission: string; date_echeance: string | null; stripe_payment_url: string | null
}
interface FacturesData { factures: Facture[]; total_paye: number; total_attente: number; nb_factures: number }
interface Activite { type: string; titre: string; detail?: string; date: string }

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

const SOURCES = [
  'Référence client', 'Site web', 'Réseaux sociaux',
  'Salon / événement', 'Publicité', 'Prospection directe',
]

const PROJET_STATUT_STYLES: Record<string, { bg: string; text: string }> = {
  'Travaux terminés':   { bg: 'bg-green-100',  text: 'text-green-700' },
  'Travaux en cours':   { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Documents à donner': { bg: 'bg-red-100',    text: 'text-red-700' },
  'Documents reçus':    { bg: 'bg-blue-100',   text: 'text-blue-700' },
  'En révision':        { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'Annulé':             { bg: 'bg-gray-100',   text: 'text-gray-600' },
}

// Badge de statut de facture (mêmes couleurs que le Dashboard)
function factureStatut(f: Facture): { label: string; bg: string; text: string } {
  if (f.en_retard) return { label: 'En retard', bg: 'var(--color-error-bg)', text: 'var(--color-error-text)' }
  switch (f.statut) {
    case 'payee':     return { label: 'Payée',    bg: 'var(--color-success-bg)', text: 'var(--color-success-text)' }
    case 'envoyee':   return { label: 'Envoyée',  bg: 'var(--color-info-bg)',    text: 'var(--color-info-text)' }
    case 'ouverte':   return { label: 'En attente', bg: 'var(--color-info-bg)',  text: 'var(--color-info-text)' }
    case 'brouillon': return { label: 'Brouillon', bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)' }
    default:          return { label: f.statut,   bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)' }
  }
}

// Timeline : type d'événement → icône + couleur
const ACTIVITE_META: Record<string, { icon: string; color: string }> = {
  creation: { icon: 'celebration',  color: 'var(--color-brand)' },
  note:     { icon: 'edit_note',    color: 'var(--color-dark-text-2)' },
  facture:  { icon: 'receipt_long', color: 'var(--color-info-text)' },
  rdv:      { icon: 'event',        color: 'var(--color-success-text)' },
  statut:   { icon: 'trending_up',  color: 'var(--color-brand)' },
}
const activiteMeta = (t: string) => ACTIVITE_META[t] || { icon: 'circle', color: 'var(--color-dark-text-2)' }

const money = (n: number) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n || 0)
const dateFr = (d: string | null) => d ? new Date(d.length <= 10 ? d + 'T12:00:00' : d).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

type Tab = 'apercu' | 'activite' | 'facturation' | 'documents'

// Label uppercase muted au-dessus d'un champ
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase tracking-wide font-body">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full bg-[var(--color-light-0)] border-none rounded-xl px-4 py-3 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40"

export default function AdminClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id

  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('apercu')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const [projets, setProjets] = useState<Projet[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [facturesData, setFacturesData] = useState<FacturesData | null>(null)
  const [todos, setTodos] = useState<Todo[]>([])
  const [showDoneTodos, setShowDoneTodos] = useState(false)
  const [activite, setActivite] = useState<Activite[]>([])

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [changingStage, setChangingStage] = useState(false)
  const [nouvelleNote, setNouvelleNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [resendingInvite, setResendingInvite] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)

  const [rdvDate, setRdvDate] = useState('')
  const [rdvHeure, setRdvHeure] = useState('09:00')
  const [creatingRdv, setCreatingRdv] = useState(false)
  const [rdvResult, setRdvResult] = useState<{ label: string; meet_link: string } | null>(null)

  const showToast = (msg: string, ok = false) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500) }
  const set = (patch: Partial<Client>) => setClient(c => c ? { ...c, ...patch } : c)

  useEffect(() => {
    fetch(`/api/v1/admin/client/${id}`, { credentials: 'include' })
      .then(r => r.json()).then(d => { setClient(d); setLoading(false) })
      .catch(() => setLoading(false))
    fetch(`/api/v1/admin/client/${id}/projets`, { credentials: 'include' })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setProjets(d) }).catch(() => {})
    fetch(`/api/v1/admin/client/${id}/notes`, { credentials: 'include' })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setNotes(d) }).catch(() => {})
    fetch(`/api/v1/admin/client/${id}/factures`, { credentials: 'include' })
      .then(r => r.json()).then(d => { if (d && Array.isArray(d.factures)) setFacturesData(d) }).catch(() => {})
    fetch(`/api/v1/admin/todos`, { credentials: 'include' })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setTodos(d) }).catch(() => {})
    fetch(`/api/v1/admin/client/${id}/activite`, { credentials: 'include' })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setActivite(d) }).catch(() => {})
  }, [id])

  // Tâches liées à ce client (via client_id_effectif renvoyé par le dashboard)
  const clientTodos = todos.filter(t => !t.is_titre && (t.client_id_effectif === Number(id) || t.client_id === Number(id)))
  const clientTodosEnAttente = clientTodos.filter(t => !t.est_coche)
  const clientTodosCompletees = clientTodos.filter(t => t.est_coche)

  const handleSave = async () => {
    if (!client) return
    setSaving(true)
    try {
      // Fusion anti-écrasement : récupère la fiche complète (facturation incluse) puis renvoie tout
      const full = await fetch(`/api/v1/admin/client/${id}`, { credentials: 'include' }).then(r => r.json())
      const res = await fetch(`/api/v1/admin/client/${id}`, {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...full,
          nom_complet: client.nom_complet,
          nom_entreprise: client.nom_entreprise,
          email: client.email,
          telephone: client.telephone,
          statut_relation: client.statut_relation,
          prochain_suivi: client.prochain_suivi,
          source_acquisition: client.source_acquisition,
          site_web: client.site_web,
          adresse: client.adresse,
          ville: client.ville,
          contact_secondaire_nom: client.contact_secondaire_nom,
          contact_secondaire_role: client.contact_secondaire_role,
          contact_secondaire_email: client.contact_secondaire_email,
        }),
      })
      if (!res.ok) { showToast('Erreur lors de l’enregistrement'); return }
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch { showToast('Erreur de connexion') }
    finally { setSaving(false) }
  }

  const handleChangeStage = async (newStage: string) => {
    if (!client) return
    const prev = client.statut_relation
    setChangingStage(true)
    set({ statut_relation: newStage }) // optimiste
    try {
      const res = await fetch(`/api/v1/admin/client/${id}/statut-relation`, {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut_relation: newStage }),
      })
      if (!res.ok) { set({ statut_relation: prev }); showToast('Erreur changement de statut') }
      else if (newStage === 'actif') {
        fetch(`/api/v1/admin/client/${id}`, { credentials: 'include' }).then(r => r.json()).then(setClient).catch(() => {})
      }
    } catch { set({ statut_relation: prev }); showToast('Erreur de connexion') }
    finally { setChangingStage(false) }
  }

  const handleAddNote = async () => {
    if (!nouvelleNote.trim()) return
    setAddingNote(true)
    try {
      const res = await fetch(`/api/v1/admin/client/${id}/notes`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenu: nouvelleNote.trim() }),
      })
      const data = await res.json()
      if (res.ok) { setNotes(p => [data, ...p]); setNouvelleNote('') }
      else showToast('Erreur ajout note')
    } catch { showToast('Erreur de connexion') }
    finally { setAddingNote(false) }
  }

  const handleDeleteNote = async (noteId: number) => {
    const snapshot = notes
    setNotes(p => p.filter(n => n.id !== noteId))
    try {
      const res = await fetch(`/api/v1/admin/client/${id}/notes/${noteId}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) { setNotes(snapshot); showToast('Erreur suppression note') }
    } catch { setNotes(snapshot); showToast('Erreur de connexion') }
  }

  const handleResendInvite = async () => {
    setResendingInvite(true)
    try {
      const res = await fetch(`/api/v1/admin/client/${id}/resend-invitation`, { method: 'POST', credentials: 'include' })
      if (res.ok) setInviteSent(true); else showToast('Erreur envoi invitation')
    } catch { showToast('Erreur de connexion') }
    finally { setResendingInvite(false) }
  }

  const handleCreerRdv = async () => {
    if (!rdvDate || !rdvHeure) return
    setCreatingRdv(true); setRdvResult(null)
    try {
      const res = await fetch(`/api/v1/admin/client/${id}/creer-rendez-vous`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: rdvDate, heure: rdvHeure }),
      })
      const data = await res.json()
      if (data.success) setRdvResult(data); else showToast(data.error || 'Erreur création RDV')
    } catch { showToast('Erreur de connexion') }
    finally { setCreatingRdv(false) }
  }

  const toggleTodo = async (todoId: number) => {
    setTodos(p => p.map(t => t.id === todoId ? { ...t, est_coche: t.est_coche ? 0 : 1 } : t))
    try {
      const res = await fetch(`/api/v1/admin/todos/${todoId}/toggle`, { method: 'POST', credentials: 'include' })
      if (!res.ok) throw new Error()
      const { est_coche } = await res.json()
      setTodos(p => p.map(t => t.id === todoId ? { ...t, est_coche: est_coche ? 1 : 0 } : t))
    } catch {
      setTodos(p => p.map(t => t.id === todoId ? { ...t, est_coche: t.est_coche ? 0 : 1 } : t))
      showToast('Erreur mise à jour tâche')
    }
  }

  const handleDelete = useCallback(async () => {
    if (!confirm('Supprimer définitivement ce client et toutes ses données associées (projets, notes) ? Cette action est irréversible.')) return
    try {
      const res = await fetch(`/api/v1/admin/client/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) { showToast('Erreur lors de la suppression'); return }
      router.push('/admin/clients')
    } catch { showToast('Erreur de connexion') }
  }, [id, router])

  const initiales = client?.nom_complet
    ? client.nom_complet.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'
  const stageStyle = client ? STAGE_STYLES[client.statut_relation] : undefined
  const valeurTotale = facturesData?.total_paye ?? 0

  if (loading) return <p className="text-[var(--color-dark-text-2)] font-body text-center py-24">Chargement…</p>
  if (!client) return <p className="text-[var(--color-dark-text-2)] font-body text-center py-24">Client introuvable.</p>

  const TABS: { key: Tab; label: string }[] = [
    { key: 'apercu', label: 'Aperçu' },
    { key: 'activite', label: 'Activité' },
    { key: 'facturation', label: 'Facturation' },
    { key: 'documents', label: 'Documents' },
  ]

  return (
    <div className="max-w-6xl mx-auto">

      {toast && (
        <div role="status" aria-live="polite" className={`fixed top-6 right-6 z-[60] px-5 py-3.5 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-2.5 ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-xs font-body text-[var(--color-dark-text-2)] mb-5">
        <span className="font-bold uppercase tracking-wide text-[var(--color-brand)]">CRM</span>
        <span aria-hidden="true" className="material-symbols-outlined text-sm">chevron_right</span>
        <Link href="/admin/clients" className="hover:text-[var(--color-brand)] transition-colors">Clients</Link>
        <span aria-hidden="true" className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-[var(--color-dark-1)] font-semibold truncate">{client.nom_complet}</span>
      </nav>

      {/* En-tête identité */}
      <header className="flex flex-wrap items-start justify-between gap-6 mb-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand)] flex items-center justify-center text-white font-display font-extrabold text-xl flex-shrink-0">
            {initiales}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-[var(--color-dark-0)] leading-tight truncate" style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em' }}>
              {client.nom_complet}
            </h1>
            {client.nom_entreprise && <p className="font-body text-[13px] text-[var(--color-dark-text-2)] truncate">{client.nom_entreprise}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={client.statut_relation}
            onChange={e => handleChangeStage(e.target.value)}
            disabled={changingStage}
            aria-label="Statut de la relation"
            className="px-4 py-2.5 rounded-full font-body text-xs font-bold uppercase tracking-wide border-none outline-none cursor-pointer disabled:opacity-50"
            style={{ background: stageStyle?.bg, color: stageStyle?.text }}
          >
            {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <Link href={`/admin/projets/new?client=${id}`}
            className="inline-flex items-center gap-2 bg-[var(--color-light-2)] border border-[var(--color-light-border)] text-[var(--color-dark-1)] px-4 py-2.5 rounded-full font-body text-xs font-bold hover:border-[var(--color-brand)] transition-colors">
            <span aria-hidden="true" className="material-symbols-outlined text-base">create_new_folder</span>
            Nouveau projet
          </Link>
          <Link href="/admin/factures"
            className="inline-flex items-center gap-2 bg-[var(--color-brand)] text-white px-4 py-2.5 rounded-full font-body text-xs font-bold hover:bg-[var(--color-brand-hover)] transition-colors">
            <span aria-hidden="true" className="material-symbols-outlined text-base">receipt_long</span>
            Nouvelle facture
          </Link>
        </div>
      </header>

      {/* Étiquettes (à venir) */}
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-light-2)] border border-dashed border-[var(--color-light-border)] font-body text-[11px] font-bold text-[var(--color-dark-text-2)]">
          <span aria-hidden="true" className="material-symbols-outlined text-sm">sell</span>
          Étiquettes — bientôt
        </span>
      </div>

      {/* Onglets */}
      <div className="flex items-center gap-6 border-b border-[var(--color-light-border)] mb-8">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`relative pb-3 font-body text-sm font-bold transition-colors ${tab === t.key ? 'text-[var(--color-dark-1)]' : 'text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-1)]'}`}>
            {t.label}
            {tab === t.key && <span className="absolute bottom-[-1.5px] left-0 right-0 h-[2.5px] rounded-full bg-[var(--color-brand)]" />}
          </button>
        ))}
      </div>

      {/* ─────────────── ONGLET APERÇU ─────────────── */}
      {tab === 'apercu' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 items-start">

          {/* Colonne gauche */}
          <div className="flex flex-col gap-6">

            {/* Informations */}
            <section className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-6">
              <h2 className="font-display text-base uppercase tracking-wide text-[var(--color-dark-1)] mb-5">Informations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nom complet"><input className={inputCls} value={client.nom_complet || ''} onChange={e => set({ nom_complet: e.target.value })} /></Field>
                <Field label="Entreprise"><input className={inputCls} value={client.nom_entreprise || ''} onChange={e => set({ nom_entreprise: e.target.value })} /></Field>
                <Field label="Email"><input type="email" className={inputCls} value={client.email || ''} onChange={e => set({ email: e.target.value })} /></Field>
                <Field label="Téléphone"><input type="tel" className={inputCls} value={client.telephone || ''} onChange={e => set({ telephone: e.target.value })} /></Field>
                <Field label="Adresse"><input className={inputCls} value={client.adresse || ''} onChange={e => set({ adresse: e.target.value })} /></Field>
                <Field label="Ville"><input className={inputCls} value={client.ville || ''} onChange={e => set({ ville: e.target.value })} /></Field>
                <Field label="Site web / réseaux"><input className={inputCls} value={client.site_web || ''} onChange={e => set({ site_web: e.target.value })} placeholder="https://" /></Field>
                <Field label="Source d'acquisition">
                  <select className={inputCls} value={client.source_acquisition || ''} onChange={e => set({ source_acquisition: e.target.value || null })}>
                    <option value="">—</option>
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Prochain suivi"><input type="date" className={inputCls} value={client.prochain_suivi || ''} onChange={e => set({ prochain_suivi: e.target.value || null })} /></Field>
              </div>

              {/* Contact secondaire */}
              <div className="mt-6 pt-5 border-t border-[var(--color-light-border)]">
                <p className="font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-3">Contact secondaire</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Nom"><input className={inputCls} value={client.contact_secondaire_nom || ''} onChange={e => set({ contact_secondaire_nom: e.target.value })} /></Field>
                  <Field label="Rôle"><input className={inputCls} value={client.contact_secondaire_role || ''} onChange={e => set({ contact_secondaire_role: e.target.value })} /></Field>
                  <Field label="Email"><input type="email" className={inputCls} value={client.contact_secondaire_email || ''} onChange={e => set({ contact_secondaire_email: e.target.value })} /></Field>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-[var(--color-brand)] text-white font-body font-bold py-3 rounded-full hover:bg-[var(--color-brand-hover)] transition-colors text-sm disabled:opacity-60">
                  {saving ? 'Enregistrement…' : saved ? '✓ Modifications enregistrées' : 'Enregistrer les modifications'}
                </button>
              </div>
            </section>

            {/* Notes */}
            <section className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-6">
              <h2 className="font-display text-base uppercase tracking-wide text-[var(--color-dark-1)] mb-4">Notes</h2>
              <div className="flex flex-col gap-3 mb-5">
                <textarea value={nouvelleNote} onChange={e => setNouvelleNote(e.target.value)} rows={3}
                  placeholder="Appel, courriel, rencontre, suivi…"
                  className="w-full bg-[var(--color-light-0)] border-none rounded-xl px-4 py-3 outline-none font-body text-sm resize-none focus:ring-2 focus:ring-[var(--color-brand)]/40" />
                <button onClick={handleAddNote} disabled={addingNote || !nouvelleNote.trim()}
                  className="self-end bg-[var(--color-brand)] text-white font-body font-bold px-6 py-2.5 rounded-full hover:bg-[var(--color-brand-hover)] transition-colors text-xs disabled:opacity-50">
                  {addingNote ? 'Ajout…' : 'Ajouter une note'}
                </button>
              </div>
              {notes.length === 0 ? (
                <p className="text-[var(--color-dark-text-2)] font-body text-sm text-center py-4">Aucune note pour l&apos;instant.</p>
              ) : (
                <div className="relative pl-6">
                  <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-[var(--color-light-border)]" />
                  <div className="flex flex-col gap-5">
                    {notes.map(note => (
                      <div key={note.id} className="relative">
                        <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[var(--color-brand)] border-2 border-[var(--color-light-2)]" />
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-body text-sm text-[var(--color-dark-1)] whitespace-pre-wrap">{note.contenu}</p>
                            <p className="text-[10px] text-[var(--color-dark-text-2)] font-body font-bold uppercase tracking-wide mt-1">{dateFr(note.created_at)}</p>
                          </div>
                          <button onClick={() => handleDeleteNote(note.id)} aria-label="Supprimer cette note"
                            className="p-1.5 rounded-full text-[var(--color-dark-text-2)] hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0">
                            <span aria-hidden="true" className="material-symbols-outlined text-base">close</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Zone de danger */}
            <section className="rounded-[18px] p-6 border border-red-200 bg-red-50/40">
              <h2 className="font-body text-xs font-bold uppercase tracking-widest text-red-600 mb-1">Zone de danger</h2>
              <p className="font-body text-sm text-[var(--color-dark-text-2)] mb-4">La suppression est irréversible et retire toutes les données associées (projets, notes).</p>
              <button onClick={handleDelete}
                className="inline-flex items-center gap-2 border border-red-300 text-red-600 font-body font-bold px-5 py-2.5 rounded-full hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors text-sm">
                <span aria-hidden="true" className="material-symbols-outlined text-base">delete</span>
                Supprimer le client
              </button>
            </section>
          </div>

          {/* Colonne droite */}
          <div className="flex flex-col gap-6">

            {/* Carte compte */}
            <div className="rounded-[18px] p-6 text-white" style={{ background: 'linear-gradient(160deg, var(--color-dark-1), var(--color-dark-0))' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-13 h-13 rounded-2xl bg-[var(--color-brand)] flex items-center justify-center font-display font-extrabold text-lg" style={{ width: '52px', height: '52px' }}>{initiales}</div>
                <div>
                  <p className="font-display text-base">Compte {STAGES.find(s => s.key === client.statut_relation)?.label || 'actif'}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: client.is_email_confirmed ? 'var(--color-success-mid, #4ade80)' : '#fbbf24' }} />
                    <span className="text-white/70 text-[11px] font-bold uppercase tracking-wide font-body">{client.is_email_confirmed ? 'Email confirmé' : 'Invitation en attente'}</span>
                  </div>
                </div>
              </div>
              {!client.is_email_confirmed && (
                inviteSent
                  ? <p className="text-emerald-300 text-xs font-body font-semibold mb-4">✓ Invitation renvoyée</p>
                  : <button onClick={handleResendInvite} disabled={resendingInvite}
                      className="text-white/70 hover:text-white text-xs font-bold uppercase font-body underline underline-offset-2 mb-4 disabled:opacity-40">
                      {resendingInvite ? 'Envoi…' : 'Renvoyer l’invitation'}
                    </button>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="font-display font-extrabold text-xl leading-none">{money(valeurTotale)}</p>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-wide font-body mt-1.5">Valeur totale</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="font-display font-extrabold text-xl leading-none">{dateFr(client.created_at)}</p>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-wide font-body mt-1.5">Client depuis</p>
                </div>
              </div>
            </div>

            {/* Dossier Drive */}
            <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]">folder_shared</span>
                <div className="min-w-0">
                  <p className="font-display text-sm uppercase text-[var(--color-dark-1)]">Dossier Drive</p>
                  <p className="text-[11px] text-[var(--color-dark-text-2)] font-body truncate">{client.lien_gdrive ? 'Documents partagés avec ce client.' : 'Créé à la promotion en client actif.'}</p>
                </div>
              </div>
              {client.lien_gdrive && (
                <a href={client.lien_gdrive} target="_blank" rel="noopener noreferrer" aria-label="Ouvrir le dossier Drive"
                  className="bg-[var(--color-light-0)] border border-[var(--color-light-border)] text-[var(--color-dark-1)] p-2.5 rounded-full hover:bg-[var(--color-brand)] hover:text-white hover:border-[var(--color-brand)] transition-all flex-shrink-0">
                  <span aria-hidden="true" className="material-symbols-outlined text-lg">open_in_new</span>
                </a>
              )}
            </div>

            {/* Créer un rendez-vous */}
            <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]">event_upcoming</span>
                <div>
                  <p className="font-display text-sm uppercase text-[var(--color-dark-1)]">Créer un rendez-vous</p>
                  <p className="text-[11px] text-[var(--color-dark-text-2)] font-body">Planifie un créneau et notifie le client.</p>
                </div>
              </div>
              {rdvResult ? (
                <div className="flex flex-col gap-2">
                  <span className="text-emerald-600 font-body text-sm font-semibold">✓ {rdvResult.label}</span>
                  {rdvResult.meet_link && <a href={rdvResult.meet_link} target="_blank" rel="noopener noreferrer" className="text-xs font-body font-bold text-[var(--color-brand)] underline underline-offset-2 truncate">{rdvResult.meet_link}</a>}
                  <button onClick={() => setRdvResult(null)} className="text-[10px] font-body text-[var(--color-dark-text-2)] underline text-left">Créer un autre</button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Date"><input type="date" value={rdvDate} onChange={e => setRdvDate(e.target.value)} className={inputCls} /></Field>
                    <Field label="Heure"><input type="time" value={rdvHeure} onChange={e => setRdvHeure(e.target.value)} className={inputCls} /></Field>
                  </div>
                  <button onClick={handleCreerRdv} disabled={creatingRdv || !rdvDate}
                    className="bg-[var(--color-brand)] text-white font-body font-bold py-2.5 rounded-full hover:bg-[var(--color-brand-hover)] transition-colors text-xs disabled:opacity-50">
                    {creatingRdv ? 'Création…' : 'Créer & envoyer'}
                  </button>
                </div>
              )}
            </div>

            {/* Projets en cours */}
            <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-display text-sm uppercase text-[var(--color-dark-1)]">Projets en cours</p>
              </div>
              {projets.length === 0 ? (
                <p className="text-[var(--color-dark-text-2)] font-body text-sm py-2">Aucun projet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {projets.slice(0, 5).map(p => {
                    const st = PROJET_STATUT_STYLES[p.statut] || { bg: 'bg-gray-100', text: 'text-gray-600' }
                    return (
                      <Link key={p.id} href={`/admin/projet/${p.id}`}
                        className="bg-[var(--color-light-0)] p-3 rounded-xl flex items-center justify-between gap-3 hover:bg-[var(--color-light-1)] transition-colors">
                        <span className="font-body font-bold text-[var(--color-dark-1)] text-sm truncate">{p.nom_projet}</span>
                        <span className={`${st.bg} ${st.text} text-[9px] font-extrabold px-2 py-1 rounded-full uppercase font-body flex-shrink-0`}>{p.statut}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
              <Link href={`/admin/projets?client=${id}`} className="mt-3 block text-center text-xs font-bold text-[var(--color-brand)] uppercase tracking-widest hover:underline font-body">Voir tous les projets →</Link>
            </div>

            {/* Tâches liées */}
            <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-5">
              <p className="font-display text-sm uppercase text-[var(--color-dark-1)] mb-4">Tâches liées</p>
              {clientTodos.length === 0 ? (
                <p className="text-[var(--color-dark-text-2)] font-body text-sm py-2">Aucune tâche liée à ce client.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {clientTodosEnAttente.map(t => (
                    <label key={t.id} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={!!t.est_coche} onChange={() => toggleTodo(t.id)}
                        className="w-4 h-4 rounded accent-[var(--color-brand)] flex-shrink-0" />
                      <span className="font-body text-sm text-[var(--color-dark-1)]">{t.texte}</span>
                    </label>
                  ))}
                  {clientTodosCompletees.length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowDoneTodos(v => !v)}
                        aria-expanded={showDoneTodos}
                        className="flex items-center gap-2 py-1.5 text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-1)] transition-colors"
                      >
                        <span aria-hidden="true" className="material-symbols-outlined text-lg transition-transform" style={{ transform: showDoneTodos ? 'rotate(180deg)' : 'none' }}>
                          expand_more
                        </span>
                        <span className="font-body text-xs font-bold uppercase tracking-widest">
                          {showDoneTodos ? 'Masquer' : 'Voir'} complété ({clientTodosCompletees.length})
                        </span>
                      </button>
                      {showDoneTodos && (
                        <div className="flex flex-col gap-2 mt-1">
                          {clientTodosCompletees.map(t => (
                            <label key={t.id} className="flex items-center gap-3 cursor-pointer group">
                              <input type="checkbox" checked={!!t.est_coche} onChange={() => toggleTodo(t.id)}
                                className="w-4 h-4 rounded accent-[var(--color-brand)] flex-shrink-0" />
                              <span className="font-body text-sm line-through text-[var(--color-dark-text-2)]">{t.texte}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────── ONGLET ACTIVITÉ (placeholder) ─────────────── */}
      {tab === 'activite' && (
        <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-6">
          {activite.length === 0 ? (
            <p className="text-[var(--color-dark-text-2)] font-body text-sm text-center py-8">Aucune activité pour l&apos;instant.</p>
          ) : (
            <div className="relative pl-8">
              <div className="absolute left-4 top-3 bottom-3 w-[2px] bg-[var(--color-light-border)]" />
              <div className="flex flex-col gap-6">
                {activite.map((e, i) => {
                  const m = activiteMeta(e.type)
                  return (
                    <div key={i} className="relative">
                      <div className="absolute -left-8 top-0 w-8 h-8 rounded-full bg-[var(--color-light-2)] border-2 flex items-center justify-center" style={{ borderColor: m.color }}>
                        <span aria-hidden="true" className="material-symbols-outlined" style={{ color: m.color, fontSize: '16px' }}>{m.icon}</span>
                      </div>
                      <div className="pt-1 min-w-0">
                        <p className="font-body text-sm font-semibold text-[var(--color-dark-1)]">{e.titre}</p>
                        {e.detail && <p className="font-body text-xs text-[var(--color-dark-text-2)] mt-0.5 italic">« {e.detail} »</p>}
                        <p className="text-[10px] text-[var(--color-dark-text-2)] font-body font-bold uppercase tracking-wide mt-1">{dateFr(e.date)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────── ONGLET FACTURATION ─────────────── */}
      {tab === 'facturation' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-[18px] bg-[var(--color-light-2)] border border-[var(--color-light-border)] p-5">
              <p className="font-display font-extrabold text-[var(--text-3xl)] leading-none" style={{ color: 'var(--color-success-text)' }}>{money(facturesData?.total_paye ?? 0)}</p>
              <p className="font-body text-xs uppercase tracking-wide text-[var(--color-dark-text-2)] mt-2">Total payé</p>
            </div>
            <div className="rounded-[18px] bg-[var(--color-light-2)] border border-[var(--color-light-border)] p-5">
              <p className="font-display font-extrabold text-[var(--text-3xl)] leading-none" style={{ color: 'var(--color-info-text)' }}>{money(facturesData?.total_attente ?? 0)}</p>
              <p className="font-body text-xs uppercase tracking-wide text-[var(--color-dark-text-2)] mt-2">En attente</p>
            </div>
            <div className="rounded-[18px] bg-[var(--color-light-2)] border border-[var(--color-light-border)] p-5">
              <p className="font-display font-extrabold text-[var(--text-3xl)] text-[var(--color-dark-1)] leading-none">{facturesData?.nb_factures ?? 0}</p>
              <p className="font-body text-xs uppercase tracking-wide text-[var(--color-dark-text-2)] mt-2">Factures émises</p>
            </div>
          </div>

          <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] overflow-hidden">
            <div className="overflow-x-auto"><table className="w-full text-left">
              <thead className="bg-[var(--color-light-1)]">
                <tr>
                  {['Numéro', 'Date', 'Statut', 'Montant'].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-light-border)]">
                {(facturesData?.factures ?? []).map(f => {
                  const st = factureStatut(f)
                  return (
                    <tr key={f.id} className="hover:bg-[var(--color-light-1)] transition-colors">
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/factures/${f.id}`} className="font-body font-bold text-sm text-[var(--color-dark-1)] hover:text-[var(--color-brand)]">{f.numero}</Link>
                      </td>
                      <td className="px-5 py-3.5 font-body text-sm text-[var(--color-dark-text-2)]">{dateFr(f.date_emission)}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full font-body text-[10px] font-bold uppercase tracking-wide" style={{ background: st.bg, color: st.text }}>{st.label}</span>
                      </td>
                      <td className="px-5 py-3.5 font-body font-bold text-sm text-[var(--color-dark-1)] tabular-nums">{money(f.total)}</td>
                    </tr>
                  )
                })}
                {(!facturesData || facturesData.factures.length === 0) && (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-[var(--color-dark-text-2)] font-body text-sm">Aucune facture pour ce client.</td></tr>
                )}
              </tbody>
            </table></div>
          </div>
        </div>
      )}

      {/* ─────────────── ONGLET DOCUMENTS (placeholder) ─────────────── */}
      {tab === 'documents' && (
        <div className="flex flex-col gap-6">
          {client.lien_gdrive && (
            <a href={client.lien_gdrive} target="_blank" rel="noopener noreferrer"
              className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-5 flex items-center justify-between gap-4 hover:border-[var(--color-brand)] transition-colors">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]">folder_shared</span>
                <div>
                  <p className="font-display text-sm uppercase text-[var(--color-dark-1)]">Dossier Drive du client</p>
                  <p className="text-[11px] text-[var(--color-dark-text-2)] font-body">Documents partagés (stockage externe actuel).</p>
                </div>
              </div>
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-dark-text-2)]">open_in_new</span>
            </a>
          )}
          <div className="rounded-[18px] border-2 border-dashed border-[var(--color-light-border)] p-12 text-center">
            <span aria-hidden="true" className="material-symbols-outlined text-4xl text-[var(--color-dark-text-2)]">cloud_upload</span>
            <p className="font-display text-base uppercase tracking-wide text-[var(--color-dark-1)] mt-3">Dépôt de fichiers — à venir</p>
            <p className="font-body text-sm text-[var(--color-dark-text-2)] mt-2 max-w-md mx-auto">
              L&apos;upload natif de documents nécessite un stockage de fichiers dédié. Pour l&apos;instant, les documents passent par le Dossier Drive ci-dessus.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}
