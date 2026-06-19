'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Projet {
  id: number
  nom_projet: string
  statut: string
  date_livraison_estimee: string
  created_at: string
  is_archived: number
  checklist: { ready: number; done: number; total: number }
}

interface SoumissionResume {
  id: number; titre: string; statut: string
}

interface RendezVous {
  id: number
  start_utc: string
  end_utc: string
  meet_link: string
  label_fr: string
}

interface Slot {
  label: string
  start_utc: string
  end_utc: string
}

interface Ressource {
  id: number
  titre: string
  description: string | null
  categorie: string
  type_source: string
  url: string
}

interface DashboardData {
  projets_actifs: Projet[]
  projets_archives: Projet[]
  user: { id: number; nom: string; is_admin: boolean; drive_folder_id?: string | null }
}

const STATUT_STYLES: Record<string, { bg: string; text: string }> = {
  'Documents à donner': { bg: 'var(--color-fire-bg)',    text: 'var(--color-fire-text)'  },
  'Documents reçus':    { bg: 'var(--color-info-bg-2)',   text: 'var(--color-info-text)' },
  'Travaux en cours':   { bg: 'var(--color-brand-muted)', text: 'var(--color-brand-hover)' },
  'En révision':        { bg: 'var(--color-warning-bg-2)',    text: 'var(--color-warning-mid-2)'  },
  'Travaux terminés':   { bg: 'var(--color-success-bg-2)',   text: 'var(--color-success-text-2)' },
  'Complété':           { bg: 'var(--color-success-bg-2)',   text: 'var(--color-success-text-2)' },
  'Annulé':             { bg: 'var(--color-light-0)',   text: 'var(--color-light-text-3)' },
}

const MOCK: DashboardData = {
  projets_actifs: [
    { id: 1, nom_projet: 'Refonte de Logo', statut: 'En révision', date_livraison_estimee: '2026-04-27', created_at: '2026-04-10', is_archived: 0, checklist: { ready: 3, done: 3, total: 5 } },
    { id: 2, nom_projet: 'Vidéo Corporative', statut: 'Documents reçus', date_livraison_estimee: '2026-04-15', created_at: '2026-04-05', is_archived: 0, checklist: { ready: 5, done: 5, total: 5 } },
    { id: 3, nom_projet: 'Plan de Communication', statut: 'Documents à donner', date_livraison_estimee: '2026-05-30', created_at: '2026-04-12', is_archived: 0, checklist: { ready: 1, done: 1, total: 10 } },
  ],
  projets_archives: [
    { id: 4, nom_projet: 'Campagne Réseaux Sociaux 2025', statut: 'Complété', date_livraison_estimee: '', created_at: '2025-01-01', is_archived: 1, checklist: { ready: 0, done: 0, total: 0 } },
  ],
  user: { id: 1, nom: 'Félix', is_admin: false }
}

function buildICS(rdv: RendezVous): string {
  const fmt = (iso: string) => iso.replace(/[-:.]/g, '').slice(0, 15) + 'Z'
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cocktail Média//Portail//FR', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(rdv.start_utc)}`,
    `DTEND:${fmt(rdv.end_utc)}`,
    'SUMMARY:Réunion — Cocktail Média',
    `DESCRIPTION:Rejoignez la réunion Google Meet : ${rdv.meet_link}`,
    `URL:${rdv.meet_link}`,
    `LOCATION:${rdv.meet_link}`,
    'ORGANIZER;CN=Cocktail Média:mailto:felix.dumont@cocktailmedia.ca',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
}

function googleCalLink(rdv: RendezVous): string {
  const fmt = (iso: string) => iso.replace(/[-:.]/g, '').slice(0, 15) + 'Z'
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: 'Réunion — Cocktail Média',
    dates: `${fmt(rdv.start_utc)}/${fmt(rdv.end_utc)}`,
    details: `Rejoignez la réunion Google Meet : ${rdv.meet_link}`,
    location: rdv.meet_link,
  })
  return `https://calendar.google.com/calendar/render?${p}`
}

function outlookLink(rdv: RendezVous): string {
  const p = new URLSearchParams({
    path: '/calendar/action/compose', rru: 'addevent',
    startdt: rdv.start_utc, enddt: rdv.end_utc,
    subject: 'Réunion — Cocktail Média',
    body: `Rejoignez la réunion Google Meet : ${rdv.meet_link}`,
    location: rdv.meet_link,
  })
  return `https://outlook.live.com/owa/?${p}`
}

function RendezVousCard({ rdv, onModified, onCancelled }: { rdv: RendezVous; onModified: (updated: RendezVous) => void; onCancelled: (id: number) => void }) {
  const [showMenu, setShowMenu]     = useState(false)
  const [modifying, setModifying]   = useState(false)
  const [slots, setSlots]           = useState<Slot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [saving, setSaving]         = useState(false)
  const [cancelling, setCancelling] = useState(false)

  async function cancelRdv() {
    if (!confirm('Annuler ce rendez-vous ?')) return
    setCancelling(true)
    const res = await fetch(`/api/v1/client/rendez-vous/${rdv.id}`, { method: 'DELETE', credentials: 'include' })
    const data = await res.json()
    if (data.success) onCancelled(rdv.id)
    setCancelling(false)
  }

  async function openModify() {
    setModifying(true)
    setLoadingSlots(true)
    const res = await fetch('/api/v1/client/rendez-vous/slots', { credentials: 'include' })
    const data = await res.json()
    setSlots(Array.isArray(data) ? data : [])
    setLoadingSlots(false)
  }

  async function confirmSlot(slot: Slot) {
    setSaving(true)
    const res = await fetch(`/api/v1/client/rendez-vous/${rdv.id}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start_utc: slot.start_utc, end_utc: slot.end_utc }),
    })
    const data = await res.json()
    if (data.success) {
      onModified({ ...rdv, label_fr: data.label, meet_link: data.meet_link,
                   start_utc: data.start_utc, end_utc: data.end_utc })
      setModifying(false)
    }
    setSaving(false)
  }

  function downloadICS() {
    const blob = new Blob([buildICS(rdv)], { type: 'text/calendar' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'rendez-vous-cocktail.ics'
    a.click()
  }

  const local = new Date(rdv.start_utc)
  const localEnd = new Date(rdv.end_utc)
  const dateStr = local.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const heureStr = `${local.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })} – ${localEnd.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}`

  return (
    <div style={{
      background: 'var(--color-light-2)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-light-border)',
      overflow: 'hidden',
    }}>
      {/* Info ligne */}
      <div style={{ padding: 'var(--space-5) var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', minWidth: 0 }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: 'var(--radius-lg)',
          background: 'var(--color-brand)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>event</span>
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', margin: 0, textTransform: 'capitalize' as const }}>
            {rdv.label_fr || dateStr}
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: '2px 0 0' }}>
            {heureStr}
          </p>
        </div>
      </div>

      {/* Boutons — grille responsive */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: rdv.meet_link ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
        borderTop: '1px solid var(--color-light-border)',
      }}>
        {rdv.meet_link && (
          <a href={rdv.meet_link} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '4px', padding: 'var(--space-3) var(--space-2)',
            background: 'var(--color-brand)',
            fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
            color: 'white', textDecoration: 'none', textTransform: 'uppercase' as const, letterSpacing: '0.05em',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>videocam</span>
            Rejoindre
          </a>
        )}

        {/* Ajouter — avec dropdown */}
        <div style={{ position: 'relative' as const, borderLeft: '1px solid var(--color-light-border)' }}>
          <button onClick={() => setShowMenu(v => !v)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '4px', padding: 'var(--space-3) var(--space-2)',
            width: '100%', height: '100%',
            background: showMenu ? 'var(--color-light-0)' : 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
            color: 'var(--color-light-text)', textTransform: 'uppercase' as const, letterSpacing: '0.05em',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_add_on</span>
            Ajouter
          </button>
          {showMenu && (
            <div style={{
              position: 'absolute' as const, left: 0, top: 'calc(100% + 4px)', zIndex: 50,
              background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
              borderRadius: 'var(--radius-lg)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              minWidth: '200px', overflow: 'hidden',
            }}>
              {[
                { label: 'Google Calendar', icon: 'open_in_new', action: () => { window.open(googleCalLink(rdv), '_blank'); setShowMenu(false) } },
                { label: 'Outlook', icon: 'open_in_new', action: () => { window.open(outlookLink(rdv), '_blank'); setShowMenu(false) } },
                { label: 'Apple / Autre (.ics)', icon: 'download', action: () => { downloadICS(); setShowMenu(false) } },
              ].map(item => (
                <button key={item.label} onClick={item.action} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  width: '100%', padding: 'var(--space-3) var(--space-4)',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const,
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text)',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-light-text-3)' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={modifying ? () => setModifying(false) : openModify} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '4px', padding: 'var(--space-3) var(--space-2)',
          background: modifying ? 'var(--color-light-0)' : 'none',
          border: 'none', borderLeft: '1px solid var(--color-light-border)', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
          color: 'var(--color-light-text)', textTransform: 'uppercase' as const, letterSpacing: '0.05em',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit_calendar</span>
          {modifying ? 'Fermer' : 'Modifier'}
        </button>

        <button onClick={cancelRdv} disabled={cancelling} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '4px', padding: 'var(--space-3) var(--space-2)',
          background: 'none', border: 'none', borderLeft: '1px solid var(--color-light-border)', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
          color: 'var(--color-brand)', textTransform: 'uppercase' as const, letterSpacing: '0.05em',
          opacity: cancelling ? 0.5 : 1,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>event_busy</span>
          {cancelling ? '…' : 'Annuler'}
        </button>
      </div>

    {/* Panneau de replanification */}
    {modifying && (
      <div style={{
        borderTop: '1px solid var(--color-light-border)',
        padding: 'var(--space-5) var(--space-6)',
        background: 'var(--color-light-0)',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
          textTransform: 'uppercase' as const, letterSpacing: '0.1em',
          color: 'var(--color-light-text-3)', margin: '0 0 var(--space-3)',
        }}>
          Choisir un nouveau créneau
        </p>
        {loadingSlots ? (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-3)', margin: 0 }}>
            Chargement des disponibilités…
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-2)' }}>
            {slots.map(slot => (
              <button
                key={slot.start_utc}
                onClick={() => confirmSlot(slot)}
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
                  borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'left' as const,
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600,
                  color: 'var(--color-light-text)', opacity: saving ? 0.5 : 1,
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-light-border)')}
              >
                <span>{slot.label}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-brand)' }}>
                  {saving ? 'hourglass_empty' : 'check_circle'}
                </span>
              </button>
            ))}
            {process.env.NEXT_PUBLIC_BOOKING_URL && (
              <a
                href={process.env.NEXT_PUBLIC_BOOKING_URL}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
                  marginTop: 'var(--space-2)',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
                  color: 'var(--color-brand)', textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_month</span>
                Voir toutes les disponibilités →
              </a>
            )}
          </div>
        )}
      </div>
    )}
    </div>
  )
}

const STATUT_BASE_PCT: Record<string, number> = {
  'Documents à donner':        0,
  'En attente de rendez-vous': 25,
  'Documents reçus':           40,
  'Travaux en cours':          60,
  'En révision':               80,
  'Complété':                  100,
  'Travaux terminés':          90,
  'Annulé':                    0,
}

function ProjetCard({ projet }: { projet: Projet }) {
  const [hovered, setHovered] = useState(false)
  const badge = STATUT_STYLES[projet.statut] || STATUT_STYLES['Annulé']
  const statut = projet.statut
  const basePct = STATUT_BASE_PCT[statut] ?? 0
  const { done, total } = projet.checklist
  const checklistPct = total > 0 ? Math.round((done / total) * 100) : 0
  const pct = statut === 'Complété'
    ? 100
    : statut === 'Documents à donner'
      ? Math.max(Math.round(checklistPct * 0.35), total > 0 ? 5 : 0)
      : Math.min(basePct + (total > 0 ? Math.round(checklistPct * 0.15) : 0), 99)

  return (
    <Link href={`/projet/${projet.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'var(--color-light-2)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          border: '1px solid',
          borderColor: hovered ? 'var(--color-brand-25pct)' : 'var(--color-light-border)',
          boxShadow: hovered ? '0 4px 20px var(--color-brand-6pct)' : 'none',
          transition: `border-color var(--duration-base), box-shadow var(--duration-base)`,
          cursor: 'pointer',
        }}
      >
        {/* Top row — creation date + status badge */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 'var(--space-3)',
        }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--color-light-text-3)',
          }}>
            {new Date(projet.created_at).toLocaleDateString('fr-CA')}
          </span>
          <span style={{
            background: badge.bg,
            color: badge.text,
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap' as const,
          }}>
            {projet.statut}
          </span>
        </div>

        {/* Project name */}
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'var(--text-xl)',
          lineHeight: 'var(--leading-snug)',
          letterSpacing: '-0.01em',
          textTransform: 'uppercase' as const,
          color: 'var(--color-light-text)',
          margin: '0 0 var(--space-6)',
        }}>
          {projet.nom_projet.split(' — ')[1] || projet.nom_projet}
        </h3>

        {/* Progress */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              color: 'var(--color-light-text-3)',
            }}>
              Progression
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              color: pct === 100 ? 'var(--color-success)' : 'var(--color-light-text)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {pct}%
            </span>
          </div>

          <div style={{
            height: '3px',
            background: 'var(--color-light-0)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: '100%',
              background: pct === 100 ? 'var(--color-success)' : 'var(--color-brand)',
              borderRadius: 'var(--radius-full)',
              transform: `scaleX(${pct / 100})`,
              transformOrigin: 'left',
              transition: `transform var(--duration-slow) var(--ease-out-quart)`,
            }} />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 'var(--space-1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '14px', color: 'var(--color-brand)', lineHeight: 1 }}
              >
                description
              </span>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-light-text-3)',
                fontWeight: 500,
              }}>
                {projet.checklist.done}/{projet.checklist.total} documents
              </span>
            </div>
            {projet.date_livraison_estimee && (
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-light-text-3)',
              }}>
                Livraison{' '}
                <span style={{ color: 'var(--color-light-text)', fontWeight: 600 }}>
                  {new Date(projet.date_livraison_estimee).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' })}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

const EMPTY: DashboardData = { projets_actifs: [], projets_archives: [], user: { id: 0, nom: '', is_admin: false } }

export default function DashboardPage() {
  const [data, setData]               = useState<DashboardData | null>(null)
  const [showArchives, setShowArchives] = useState(false)
  const [soumissions, setSoumissions] = useState<SoumissionResume[]>([])
  const [rdvs, setRdvs]               = useState<RendezVous[]>([])
  const [ressources, setRessources]   = useState<Ressource[]>([])

  useEffect(() => {
    fetch('/api/v1/dashboard', { credentials: 'include' })
      .then(res => res.json())
      .then(setData)
      .catch(() => setData(EMPTY))
    fetch('/api/v1/client/soumissions', { credentials: 'include' })
      .then(r => r.json()).then(d => setSoumissions(Array.isArray(d) ? d : []))
      .catch(() => {})
    fetch('/api/v1/client/rendez-vous', { credentials: 'include' })
      .then(r => r.json()).then(d => setRdvs(Array.isArray(d) ? d : []))
      .catch(() => {})
    fetch('/api/v1/client/ressources', { credentials: 'include' })
      .then(r => r.json()).then(d => setRessources(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  if (!data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50dvh' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-light-border-2)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
    </div>
  )

  const soumissionsEnAttente = soumissions.filter(s => s.statut === 'envoyee')

  const prenom = data.user.nom.split(' ')[0]
  const driveUrl = data.user.drive_folder_id
    ? `https://drive.google.com/drive/folders/${data.user.drive_folder_id}`
    : null

  return (
    <div style={{
      maxWidth: '840px',
      margin: '0 auto',
      padding: '0 var(--space-6)',
      paddingTop: 'var(--space-12)',
    }}>

      {/* Header */}
      <header style={{ marginBottom: 'var(--space-12)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--space-6)',
          flexWrap: 'wrap' as const,
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'var(--text-3xl)',
              lineHeight: 1.0,
              letterSpacing: '-0.025em',
              textTransform: 'uppercase' as const,
              color: 'var(--color-light-text)',
              margin: '0 0 var(--space-2)',
            }}>
              Bonjour, {prenom}
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-light-text-3)',
              margin: 0,
              lineHeight: 'var(--leading-normal)',
            }}>
              Voici vos projets en cours
            </p>
          </div>

          {driveUrl && (
            <a
              href={driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-5)',
                background: 'var(--color-light-2)',
                border: '1px solid var(--color-light-border)',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--color-light-text)',
                textDecoration: 'none',
                whiteSpace: 'nowrap' as const,
                transition: `border-color var(--duration-base), box-shadow var(--duration-base)`,
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-brand-25pct)'
                e.currentTarget.style.boxShadow = '0 2px 12px var(--color-brand-6pct)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-light-border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '18px', color: 'var(--color-brand)' }}
              >
                folder_open
              </span>
              Tous les fichiers
            </a>
          )}
        </div>
      </header>

      {/* Card soumissions en attente */}
      {soumissionsEnAttente.length > 0 && (
        <section style={{ marginBottom: 'var(--space-10)' }}>
          <a
            href="/soumissions"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--color-brand)', borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5) var(--space-6)',
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.92')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg)', textTransform: 'uppercase', color: 'white', margin: 0 }}>
                  {soumissionsEnAttente.length === 1
                    ? 'Une soumission vous attend'
                    : `${soumissionsEnAttente.length} soumissions vous attendent`}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                  Consultez et acceptez votre offre
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-white text-2xl">chevron_right</span>
          </a>
        </section>
      )}

      {/* Rendez-vous à venir */}
      <section style={{ marginBottom: 'var(--space-10)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', gap: 'var(--space-3)', flexWrap: 'wrap' as const }}>
          <h2 style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
            textTransform: 'uppercase' as const, letterSpacing: '0.12em',
            color: 'var(--color-light-text-3)', margin: 0, flexShrink: 0,
          }}>
            Mes rendez-vous à venir
          </h2>
          {process.env.NEXT_PUBLIC_BOOKING_URL && (
            <a
              href={process.env.NEXT_PUBLIC_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
                borderRadius: 'var(--radius-full)', textDecoration: 'none',
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
                color: 'var(--color-brand)', textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                whiteSpace: 'nowrap' as const, flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_month</span>
              Planifier
            </a>
          )}
        </div>
        {rdvs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-3)' }}>
            {rdvs.map(rdv => (
              <RendezVousCard key={rdv.id} rdv={rdv}
                onModified={updated => setRdvs(prev => prev.map(r => r.id === updated.id ? updated : r))}
                onCancelled={id => setRdvs(prev => prev.filter(r => r.id !== id))} />
            ))}
          </div>
        ) : (
          <div style={{
            background: 'var(--color-light-2)', borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)', border: '1px solid var(--color-light-border)',
            display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--color-light-border-2)', flexShrink: 0 }}>event</span>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-3)', margin: 0 }}>
              Aucun rendez-vous à venir.{' '}
              {process.env.NEXT_PUBLIC_BOOKING_URL && (
                <a href={process.env.NEXT_PUBLIC_BOOKING_URL} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--color-brand)', fontWeight: 700 }}>
                  Planifiez un créneau →
                </a>
              )}
            </p>
          </div>
        )}
      </section>

      {/* Active projects */}
      <section>
        <h2 style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.12em',
          color: 'var(--color-light-text-3)',
          margin: '0 0 var(--space-4)',
        }}>
          Mes projets
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-4)' }}>
          {data.projets_actifs.map(p => (
            <ProjetCard key={p.id} projet={p} />
          ))}
          {data.projets_actifs.length === 0 && (
            <div style={{
              background: 'var(--color-light-2)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-12)',
              textAlign: 'center' as const,
              border: '1px solid var(--color-light-border)',
            }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '40px', color: 'var(--color-light-border-2)', display: 'block', marginBottom: 'var(--space-4)' }}
              >
                folder_open
              </span>
              <p style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--color-light-text-3)',
                margin: 0,
              }}>
                Aucun projet actif pour le moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Ressources et guides */}
      {ressources.length > 0 && (
        <section style={{ marginTop: 'var(--space-10)' }}>
          <h2 style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.12em',
            color: 'var(--color-light-text-3)',
            margin: '0 0 var(--space-4)',
          }}>
            Guides et documents
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-3)' }}>
            {ressources.map(r => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                  background: 'var(--color-light-2)', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-light-border)',
                  padding: 'var(--space-4) var(--space-5)',
                  textDecoration: 'none',
                  transition: `border-color var(--duration-base), box-shadow var(--duration-base)`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-brand-25pct)'
                  e.currentTarget.style.boxShadow = '0 2px 12px var(--color-brand-6pct)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--color-light-border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'var(--color-brand-6pct)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-brand)' }}>
                    {r.type_source === 'upload' ? 'picture_as_pdf' : 'link'}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-sm)',
                    textTransform: 'uppercase' as const, color: 'var(--color-light-text)', margin: 0,
                  }}>
                    {r.titre}
                  </p>
                  {r.description && (
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
                      color: 'var(--color-light-text-3)', margin: 'var(--space-1) 0 0',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                    }}>
                      {r.description}
                    </p>
                  )}
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-light-border-2)', flexShrink: 0 }}>
                  open_in_new
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Archives */}
      {data.projets_archives.length > 0 && (
        <section style={{ marginTop: 'var(--space-16)' }}>
          <button
            onClick={() => setShowArchives(!showArchives)}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-light-text-3)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-2) 0',
              minHeight: '44px',
              transition: `color var(--duration-fast)`,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-light-text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-light-text-3)')}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '18px',
                transform: showArchives ? 'rotate(180deg)' : 'none',
                transition: `transform var(--duration-base) var(--ease-out-quart)`,
              }}
            >
              expand_more
            </span>
            {showArchives
              ? 'Masquer les archives'
              : `Voir les archives (${data.projets_archives.length})`}
          </button>

          {showArchives && (
            <div style={{
              marginTop: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column' as const,
              gap: 'var(--space-4)',
              opacity: 0.65,
            }}>
              {data.projets_archives.map(p => (
                <ProjetCard key={p.id} projet={p} />
              ))}
            </div>
          )}
        </section>
      )}

    </div>
  )
}
