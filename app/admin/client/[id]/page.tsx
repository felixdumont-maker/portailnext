'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

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
}

interface Projet {
  id: number
  nom_projet: string
  statut: string
  created_at: string
}

interface Note {
  id: number
  contenu: string
  created_at: string
}

const MOCK_CLIENT: Client = {
  id: 1,
  nom_complet: 'Jean-Pierre Durand',
  nom_entreprise: 'Durand & Co Gastronomy',
  email: 'jp.durand@gastronomy.com',
  telephone: '+1 514 123 4567',
  created_at: '2022-01-01',
  is_email_confirmed: true,
  statut_relation: 'actif',
  prochain_suivi: null,
  lien_gdrive: null,
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

const MOCK_PROJETS: Projet[] = [
  { id: 1, nom_projet: 'Cocktail Event Paris', statut: 'Travaux terminés', created_at: '2024-01-12' },
  { id: 2, nom_projet: 'Bar Design Strategy', statut: 'Travaux en cours', created_at: '2024-02-05' },
  { id: 3, nom_projet: 'Wine Selection 2024', statut: 'Documents à donner', created_at: '2024-03-01' },
]

const STATUT_STYLES: Record<string, { bg: string; text: string }> = {
  'Travaux terminés':   { bg: 'bg-green-100', text: 'text-green-700' },
  'Travaux en cours':   { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Documents à donner': { bg: 'bg-red-100', text: 'text-red-700' },
  'Documents reçus':    { bg: 'bg-blue-100', text: 'text-blue-700' },
  'En révision':        { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'Annulé':             { bg: 'bg-gray-100', text: 'text-gray-600' },
}

export default function AdminClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id

  const [client, setClient] = useState<Client | null>(null)
  const [projets, setProjets] = useState<Projet[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [resendingInvite, setResendingInvite] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [sendingAgenda, setSendingAgenda] = useState(false)
  const [agendaSent, setAgendaSent] = useState(false)
  const [agendaDu, setAgendaDu] = useState('')
  const [agendaAu, setAgendaAu] = useState('')
  const [sendingAgendaPlage, setSendingAgendaPlage] = useState(false)
  const [agendaPlageResult, setAgendaPlageResult] = useState<string | null>(null)
  const [rdvDate, setRdvDate] = useState('')
  const [rdvHeure, setRdvHeure] = useState('09:00')
  const [creatingRdv, setCreatingRdv] = useState(false)
  const [rdvResult, setRdvResult] = useState<{label: string; meet_link: string} | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [nouvelleNote, setNouvelleNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [changingStage, setChangingStage] = useState(false)

useEffect(() => {
    fetch(`/api/v1/admin/client/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { setClient(data); setLoading(false) })
      .catch(() => { setClient(MOCK_CLIENT); setLoading(false) })

    fetch(`/api/v1/admin/client/${id}/projets`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setProjets(data) })
      .catch(() => {})

    fetch(`/api/v1/admin/client/${id}/notes`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setNotes(data) })
      .catch(() => {})
  }, [id])
  const handleSave = async () => {
    if (!client) return
    setSaving(true)
    try {
      await fetch(`/api/v1/admin/client/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom_complet: client.nom_complet,
          nom_entreprise: client.nom_entreprise,
          telephone: client.telephone,
          email: client.email,
          statut_relation: client.statut_relation,
          prochain_suivi: client.prochain_suivi,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleChangeStage = async (newStage: string) => {
    if (!client) return
    setChangingStage(true)
    try {
      const res = await fetch(`/api/v1/admin/client/${id}/statut-relation`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut_relation: newStage }),
      })
      if (res.ok) {
        setClient(c => c ? { ...c, statut_relation: newStage } : c)
        if (newStage === 'actif') {
          fetch(`/api/v1/admin/client/${id}`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => setClient(data))
        }
      }
    } finally {
      setChangingStage(false)
    }
  }

  const handleAddNote = async () => {
    if (!nouvelleNote.trim()) return
    setAddingNote(true)
    try {
      const res = await fetch(`/api/v1/admin/client/${id}/notes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenu: nouvelleNote.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setNotes(prev => [data, ...prev])
        setNouvelleNote('')
      }
    } finally {
      setAddingNote(false)
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    setNotes(prev => prev.filter(n => n.id !== noteId))
    await fetch(`/api/v1/admin/client/${id}/notes/${noteId}`, { method: 'DELETE', credentials: 'include' })
  }

  const handleResendInvite = async () => {
    setResendingInvite(true)
    try {
      await fetch(`/api/v1/admin/client/${id}/resend-invitation`, { method: 'POST', credentials: 'include' })
      setInviteSent(true)
    } finally {
      setResendingInvite(false)
    }
  }

  const handleCreerRdv = async () => {
    if (!rdvDate || !rdvHeure) return
    setCreatingRdv(true)
    setRdvResult(null)
    try {
      const res = await fetch(`/api/v1/admin/client/${id}/creer-rendez-vous`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: rdvDate, heure: rdvHeure }),
      })
      const data = await res.json()
      if (data.success) setRdvResult(data)
    } finally {
      setCreatingRdv(false)
    }
  }

  const handleEnvoyerAgenda = async () => {
    setSendingAgenda(true)
    try {
      await fetch(`/api/v1/admin/client/${id}/envoyer-agenda`, { method: 'POST', credentials: 'include' })
      setAgendaSent(true)
      setTimeout(() => setAgendaSent(false), 3000)
    } finally {
      setSendingAgenda(false)
    }
  }

  const handleEnvoyerAgendaPlage = async () => {
    if (!agendaDu) return
    setSendingAgendaPlage(true)
    setAgendaPlageResult(null)
    try {
      const res = await fetch(`/api/v1/admin/client/${id}/envoyer-agenda-plage`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ du: agendaDu, au: agendaAu || agendaDu }),
      })
      const data = await res.json()
      if (res.ok) setAgendaPlageResult(`✓ ${data.nb_slots} créneau${data.nb_slots > 1 ? 'x' : ''} envoyé${data.nb_slots > 1 ? 's' : ''}`)
      else setAgendaPlageResult(`✗ ${data.error}`)
    } finally {
      setSendingAgendaPlage(false)
    }
  }

  const handleDelete = () => {
    if (!confirm('Supprimer ce client ? Cette action est irréversible.')) return
    router.push('/admin/clients')
  }

  const initiales = client?.nom_complet
    ? client.nom_complet.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <header className="mb-12">
        <span className="text-[var(--color-brand)] font-bold tracking-widest text-xs uppercase mb-2 block font-body">
          DÉTAILS DU COMPTE
        </span>
        <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] leading-none tracking-tight uppercase">
          {client?.nom_complet || '...'}
        </h1>
        <p className="text-[var(--color-dark-text-2)] mt-2 font-body font-medium">
          {client?.nom_entreprise}
        </p>
        {client && (
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <select
              value={client.statut_relation}
              onChange={e => handleChangeStage(e.target.value)}
              disabled={changingStage}
              className="px-4 py-2 rounded-full font-body text-xs font-bold uppercase tracking-wide border-none outline-none cursor-pointer disabled:opacity-50"
              style={{ background: STAGE_STYLES[client.statut_relation]?.bg, color: STAGE_STYLES[client.statut_relation]?.text }}
            >
              {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            {client.prochain_suivi && (
              <span className="text-xs font-body text-[var(--color-dark-text-2)]">
                Prochain suivi : {new Date(client.prochain_suivi + 'T12:00:00').toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Formulaire */}
        <section className="lg:col-span-7 bg-[var(--color-light-1)] rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]">edit_square</span>
            <h2 className="font-display text-[var(--text-xl)] uppercase">MODIFIER LES INFORMATIONS</h2>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase ml-4 font-body">Nom complet</label>
                <input
                  type="text"
                  value={client?.nom_complet || ''}
                  onChange={e => setClient(c => c ? {...c, nom_complet: e.target.value} : c)}
                  className="w-full bg-[var(--color-light-0)] border-none rounded-xl px-6 py-4 outline-none font-body font-semibold focus:ring-2 focus:ring-[var(--color-brand)]/40"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase ml-4 font-body">Entreprise</label>
                <input
                  type="text"
                  value={client?.nom_entreprise || ''}
                  onChange={e => setClient(c => c ? {...c, nom_entreprise: e.target.value} : c)}
                  className="w-full bg-[var(--color-light-0)] border-none rounded-xl px-6 py-4 outline-none font-body font-semibold focus:ring-2 focus:ring-[var(--color-brand)]/40"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase ml-4 font-body">Email</label>
                <input
                  type="email"
                  value={client?.email || ''}
                  disabled
                  className="w-full bg-[var(--color-light-border)] border-none rounded-xl px-6 py-4 outline-none font-body font-semibold text-[var(--color-dark-text-2)] cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase ml-4 font-body">Téléphone</label>
                <input
                  type="tel"
                  value={client?.telephone || ''}
                  onChange={e => setClient(c => c ? {...c, telephone: e.target.value} : c)}
                  className="w-full bg-[var(--color-light-0)] border-none rounded-xl px-6 py-4 outline-none font-body font-semibold focus:ring-2 focus:ring-[var(--color-brand)]/40"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase ml-4 font-body">Prochain suivi</label>
                <input
                  type="date"
                  value={client?.prochain_suivi || ''}
                  onChange={e => setClient(c => c ? {...c, prochain_suivi: e.target.value || null} : c)}
                  className="w-full bg-[var(--color-light-0)] border-none rounded-xl px-6 py-4 outline-none font-body font-semibold focus:ring-2 focus:ring-[var(--color-brand)]/40"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-tr from-[var(--color-brand-hover)] to-[var(--color-brand)] text-white font-body font-bold px-8 py-4 rounded-full hover:scale-105 active:scale-95 transition-all uppercase text-sm tracking-wider disabled:opacity-60"
              >
                {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
              </button>
              {saved && <span className="text-green-600 font-body text-sm">✓ Sauvegardé</span>}
            </div>
          </div>
        </section>

        {/* Sidebar */}
        <div className="lg:col-span-5 space-y-6">

          {/* Avatar card */}
          <div className="bg-[var(--color-dark-1)] rounded-3xl overflow-hidden h-48 relative flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-[var(--color-brand)] flex items-center justify-center">
              <span className="font-display text-4xl text-white">{initiales}</span>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              {client?.is_email_confirmed === false ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-amber-300 text-xs font-bold uppercase font-body">Invitation en attente</span>
                  </div>
                  {inviteSent ? (
                    <span className="text-green-400 text-xs font-body font-semibold">✓ Invitation renvoyée</span>
                  ) : (
                    <button
                      onClick={handleResendInvite}
                      disabled={resendingInvite}
                      className="text-white/70 hover:text-white text-xs font-bold uppercase font-body underline underline-offset-2 transition-colors disabled:opacity-40"
                    >
                      {resendingInvite ? 'Envoi…' : 'Renvoyer l\'invitation'}
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <span className="text-white font-display text-[var(--text-xl)] uppercase">Compte actif</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-white/70 text-xs font-bold uppercase font-body">Email confirmé</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dossier Drive */}
          <div className="bg-[var(--color-light-1)] rounded-3xl p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]">folder_shared</span>
              <div>
                <p className="font-display text-[var(--text-base)] uppercase text-[var(--color-dark-1)]">Dossier Drive</p>
                <p className="text-[11px] text-[var(--color-dark-text-2)] font-body">
                  {client?.lien_gdrive ? 'Documents partagés avec ce client.' : "Créé à la promotion en client actif."}
                </p>
              </div>
            </div>
            {client?.lien_gdrive && (
              <a
                href={client.lien_gdrive}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[var(--color-light-0)] border border-[var(--color-light-border)] text-[var(--color-dark-1)] font-body font-bold p-3 rounded-full hover:bg-[var(--color-brand)] hover:text-white hover:border-[var(--color-brand)] transition-all flex-shrink-0"
                aria-label="Ouvrir le dossier Drive"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-lg">open_in_new</span>
              </a>
            )}
          </div>

          {/* Créer rendez-vous direct */}
          <div className="bg-[var(--color-light-1)] rounded-3xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]">event_upcoming</span>
              <div>
                <p className="font-display text-[var(--text-base)] uppercase text-[var(--color-dark-1)]">Créer un rendez-vous</p>
                <p className="text-[11px] text-[var(--color-dark-text-2)] font-body">Planifie directement un créneau et notifie le client.</p>
              </div>
            </div>
            {rdvResult ? (
              <div className="flex flex-col gap-2">
                <span className="text-green-600 font-body text-sm font-semibold">✓ {rdvResult.label}</span>
                {rdvResult.meet_link && (
                  <a href={rdvResult.meet_link} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-body font-bold text-[var(--color-brand)] underline underline-offset-2 truncate">
                    {rdvResult.meet_link}
                  </a>
                )}
                <button onClick={() => setRdvResult(null)}
                  className="text-[10px] font-body text-[var(--color-dark-text-2)] underline mt-1 text-left">
                  Créer un autre
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase ml-1 font-body">Date</label>
                    <input type="date" value={rdvDate} onChange={e => setRdvDate(e.target.value)}
                      className="bg-[var(--color-light-0)] border-none rounded-xl px-3 py-3 text-sm font-body font-semibold outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40 w-full" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase ml-1 font-body">Heure</label>
                    <input type="time" value={rdvHeure} onChange={e => setRdvHeure(e.target.value)}
                      className="bg-[var(--color-light-0)] border-none rounded-xl px-3 py-3 text-sm font-body font-semibold outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40 w-full" />
                  </div>
                </div>
                <button onClick={handleCreerRdv} disabled={creatingRdv || !rdvDate}
                  className="bg-gradient-to-tr from-[var(--color-brand-hover)] to-[var(--color-brand)] text-white font-body font-bold px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-all uppercase text-xs tracking-wider disabled:opacity-50 w-full">
                  {creatingRdv ? 'Création…' : 'Créer & envoyer'}
                </button>
              </div>
            )}
          </div>

          {/* Envoyer agenda */}
          <div className="bg-[var(--color-light-1)] rounded-3xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]">calendar_month</span>
              <div>
                <p className="font-display text-[var(--text-base)] uppercase text-[var(--color-dark-1)]">Envoyer mon agenda</p>
                <p className="text-[11px] text-[var(--color-dark-text-2)] font-body">Envoie au client les disponibilités pour booker un rendez-vous.</p>
              </div>
            </div>

            {/* Prochaines dispos */}
            {agendaSent ? (
              <span className="text-green-600 font-body text-sm font-semibold">✓ Lien envoyé par email</span>
            ) : (
              <button
                onClick={handleEnvoyerAgenda}
                disabled={sendingAgenda}
                className="bg-[var(--color-light-0)] border border-[var(--color-light-border)] text-[var(--color-dark-1)] font-body font-bold px-6 py-3 rounded-full hover:bg-[var(--color-brand)] hover:text-white hover:border-[var(--color-brand)] transition-all uppercase text-xs tracking-wider disabled:opacity-50 w-full"
              >
                {sendingAgenda ? 'Envoi…' : 'Envoyer les prochaines dispos'}
              </button>
            )}

            {/* Dispos sur une plage de dates */}
            <div className="border-t border-[var(--color-light-border)] pt-4 flex flex-col gap-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body">Dispos sur une période</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[var(--color-dark-text-2)] font-body font-bold uppercase tracking-wide">Du</label>
                  <input
                    type="date"
                    value={agendaDu}
                    onChange={e => { setAgendaDu(e.target.value); setAgendaPlageResult(null) }}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-white border border-[var(--color-light-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-dark-1)] outline-none focus:border-[var(--color-brand)] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[var(--color-dark-text-2)] font-body font-bold uppercase tracking-wide">Au</label>
                  <input
                    type="date"
                    value={agendaAu}
                    onChange={e => { setAgendaAu(e.target.value); setAgendaPlageResult(null) }}
                    min={agendaDu || new Date().toISOString().split('T')[0]}
                    className="bg-white border border-[var(--color-light-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-dark-1)] outline-none focus:border-[var(--color-brand)] transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={handleEnvoyerAgendaPlage}
                disabled={!agendaDu || sendingAgendaPlage}
                className="bg-[var(--color-brand)] text-white font-body font-bold px-5 py-2.5 rounded-xl hover:bg-[var(--color-brand-hover)] transition-all text-xs uppercase tracking-wide disabled:opacity-40 flex items-center justify-center gap-2 w-full"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-sm">send</span>
                {sendingAgendaPlage ? 'Envoi…' : agendaAu && agendaAu !== agendaDu ? `Envoyer du ${agendaDu} au ${agendaAu}` : 'Envoyer'}
              </button>
              {agendaPlageResult && (
                <p className={`text-xs font-body font-semibold ${agendaPlageResult.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
                  {agendaPlageResult}
                </p>
              )}
            </div>
          </div>

          {/* Projets */}
          <section className="bg-[var(--color-light-1)] rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-[var(--text-xl)] uppercase">PROJETS EN COURS</h2>
              <Link href={`/admin/client/${id}/edit`}>
                <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] transition-colors">edit</span>
              </Link>
            </div>
            <div className="space-y-3">
              {projets.map(p => {
                const style = STATUT_STYLES[p.statut] || { bg: 'bg-gray-100', text: 'text-gray-600' }
                return (
                  <Link key={p.id} href={`/admin/projet/${p.id}`}>
                    <div className="bg-white p-5 rounded-2xl flex items-center justify-between hover:bg-[var(--color-light-0)] transition-colors mb-2">
                      <div className="flex flex-col">
                        <span className="font-body font-bold text-[var(--color-dark-1)] uppercase text-sm">
                          {p.nom_projet}
                        </span>
                        <span className="text-[10px] text-[var(--color-dark-text-2)] font-body font-medium">
                          {new Date(p.created_at).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <span className={`${style.bg} ${style.text} text-[10px] font-extrabold px-3 py-1 rounded-full uppercase font-body`}>
                        {p.statut}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
            <Link href={`/admin/client/${id}/edit`}
              className="mt-4 block text-center text-xs font-bold text-[var(--color-brand)] uppercase tracking-widest hover:underline font-body">
              MODIFIER CE CLIENT →
            </Link>
          </section>
        </div>
      </div>

      {/* Notes */}
      <section className="bg-[var(--color-light-1)] rounded-3xl p-8 mt-8">
        <div className="flex items-center gap-3 mb-6">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]">history_edu</span>
          <h2 className="font-display text-[var(--text-xl)] uppercase">NOTES</h2>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          <textarea
            value={nouvelleNote}
            onChange={e => setNouvelleNote(e.target.value)}
            placeholder="Appel, courriel, rencontre, suivi..."
            rows={3}
            className="w-full bg-white border-none rounded-xl px-6 py-4 outline-none font-body resize-none focus:ring-2 focus:ring-[var(--color-brand)]/40"
          />
          <button
            onClick={handleAddNote}
            disabled={addingNote || !nouvelleNote.trim()}
            className="self-end bg-gradient-to-tr from-[var(--color-brand-hover)] to-[var(--color-brand)] text-white font-body font-bold px-8 py-3 rounded-full hover:scale-105 active:scale-95 transition-all uppercase text-xs tracking-wider disabled:opacity-50"
          >
            {addingNote ? 'Ajout…' : 'Ajouter une note'}
          </button>
        </div>

        {notes.length === 0 ? (
          <p className="text-[var(--color-dark-text-2)] font-body text-sm text-center py-6">Aucune note pour l&apos;instant.</p>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-[var(--color-light-border)]" />
            <div className="flex flex-col gap-6">
              {notes.map(note => (
                <div key={note.id} className="relative">
                  <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[var(--color-brand)] border-2 border-white" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-body text-sm text-[var(--color-dark-1)] whitespace-pre-wrap">{note.contenu}</p>
                      <p className="text-[10px] text-[var(--color-dark-text-2)] font-body font-bold uppercase tracking-wide mt-1">
                        {new Date(note.created_at).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      aria-label="Supprimer cette note"
                      className="p-1.5 rounded-full text-[var(--color-dark-text-2)] hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Danger zone */}
      <footer className="mt-16 pt-8 border-t border-[var(--color-light-border)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <span className="text-[var(--color-brand)] font-bold uppercase text-xs tracking-widest font-body">
            Zone de Danger
          </span>
          <p className="text-[var(--color-dark-text-2)] text-sm font-body">
            Cette action est irréversible et supprimera toutes les données associées.
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="bg-[var(--color-light-1)] border border-red-200 text-[var(--color-brand)] font-body font-bold px-10 py-5 rounded-full hover:bg-[var(--color-brand)] hover:text-white transition-all uppercase text-sm tracking-wide"
        >
          SUPPRIMER LE CLIENT
        </button>
      </footer>

    </div>
  )
}
