'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Task as TodoPerso, Bucket } from '@/lib/tasks'
import { formatDate as formatDateShort, parseVCard, BUCKET_LABEL, BUCKET_ORDER, bucketOf } from '@/lib/tasks'

const API = process.env.NEXT_PUBLIC_API_URL || ''

interface MarketingPostTodo {
  id: number
  titre: string
  date_publication: string
}

interface DashboardData {
  total_clients: number
  projets_actifs: number
  en_revision: number
  archives: number
  projets_recents: Projet[]
  top_clients: Client[]
  visuels_a_creer: MarketingPostTodo[]
  a_publier: MarketingPostTodo[]
  factures_ouvertes?: number | string
  factures_en_retard?: number
}

interface Projet {
  id: number
  nom_projet: string
  client_nom: string
  statut: string
  date_livraison_estimee: string
}

interface Client {
  id: number
  nom_complet: string
  nom_entreprise: string
  initiales: string
  couleur: string
  nb_projets?: number
}

interface TeamMember {
  id: number
  nom_complet: string
  email: string
  role: string | null
}

const MOCK_DATA: DashboardData = {
  total_clients: 0,
  projets_actifs: 0,
  en_revision: 0,
  archives: 0,
  projets_recents: [],
  top_clients: [],
  visuels_a_creer: [],
  a_publier: [],
}

const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  'Documents à donner':        { bg: '#fdecea', color: '#c0321a' },
  'Documents reçus':           { bg: '#e8f0fe', color: '#1a56c0' },
  'Travaux en cours':          { bg: '#fff3e0', color: '#b45309' },
  'En révision':               { bg: '#fdf2f8', color: '#9c2e7a' },
  'Travaux terminés':          { bg: '#dcfce7', color: '#166534' },
  'Complété':                  { bg: '#dcfce7', color: '#166534' },
  'Terminé':                   { bg: '#dcfce7', color: '#166534' },
  'En attente de rendez-vous': { bg: '#f3f4f6', color: '#6b7280' },
  'Annulé':                    { bg: '#f3f4f6', color: '#6b7280' },
}
const BADGE_FALLBACK = { bg: '#f3f4f6', color: '#6b7280' }
// Couleur du bullet à gauche de chaque row (FIX 3) : surcharge sémantique, sinon = couleur du badge
const BADGE_DOTS: Record<string, string> = {
  'Documents à donner':        '#c0321a',
  'Travaux en cours':          '#b45309',
  'En révision':               'var(--color-brand)',
  'Travaux terminés':          '#166534',
  'Complété':                  '#166534',
  'Terminé':                   '#166534',
  'En attente de rendez-vous': '#9ca3af',
}
const AVATAR_COLORS = [
  '#1a56c0', '#166534', '#9c2e7a', '#b45309',
  '#0e7490', '#7c2d12', '#4338ca', '#065f46',
]

const PRIORITE_COLORS: Record<string, string> = {
  haute:   'bg-red-100 text-red-600',
  normale: 'bg-orange-50 text-orange-500',
  basse:   'bg-gray-100 text-gray-500',
}

type GroupKind = 'projet' | 'client' | 'personnel'
interface TodoGroup {
  kind: GroupKind
  label: string
  client_nom: string | null
  todos: TodoPerso[]
}

// Regroupe par identifiant stable (projet_id / client_id), jamais par nom affiché :
// deux projets homonymes (ex. générés par le booking le même jour) restent bien distincts.
function groupByProject(list: TodoPerso[]) {
  const groups: Record<string, TodoGroup> = {}
  for (const todo of list) {
    let key: string, kind: GroupKind, label: string
    if (todo.projet_id) {
      key = `projet:${todo.projet_id}`; kind = 'projet'; label = todo.projet_nom || 'Projet'
    } else if (todo.client_id_effectif || todo.client_nom) {
      key = `client:${todo.client_id_effectif ?? todo.client_nom}`; kind = 'client'; label = `👤 ${todo.client_nom}`
    } else {
      key = 'personnel'; kind = 'personnel'; label = '— Personnel'
    }
    if (!groups[key]) groups[key] = { kind, label, client_nom: todo.client_nom ?? null, todos: [] }
    groups[key].todos.push(todo)
  }
  return groups
}

function formatDate(d: string) {
  return formatDateShort(d).toUpperCase()
}

const PRIORITE = {
  haute:   { dot: 'bg-red-500',    label: '🔴' },
  normale: { dot: 'bg-orange-400', label: '🟠' },
  basse:   { dot: 'bg-gray-300',   label: '⚪' },
} as const

function PrioritePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1">
      {(['haute', 'normale', 'basse'] as const).map(p => (
        <button key={p} type="button" onClick={() => onChange(p)}
          className={`w-5 h-5 rounded-full transition-all flex-shrink-0 ${PRIORITE[p].dot} ${value === p ? 'ring-2 ring-offset-1 ring-[var(--color-dark-text-2)] scale-110' : 'opacity-40 hover:opacity-80'}`}
          title={p} />
      ))}
    </div>
  )
}

function useAnchoredCoords(isOpen: boolean, panelH: number, panelW: number) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  useEffect(() => {
    if (!isOpen || !btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    const openUp = window.innerHeight - r.bottom < panelH + 12
    const top = openUp ? Math.max(8, r.top - panelH - 6) : r.bottom + 6
    const left = Math.max(8, Math.min(r.right - panelW, window.innerWidth - panelW - 8))
    setCoords({ top, left })
  }, [isOpen, panelH, panelW])
  return { btnRef, coords }
}

function AssignMenu({ currentProjetId, currentClientId, currentTitreId, currentAssigneeIds, clients, projets, titres, team, isOpen, onToggle, onAssign }: {
  currentProjetId: number | null
  currentClientId: number | null
  currentTitreId?: number | null
  currentAssigneeIds?: number[]
  clients: { id: number; nom_complet: string }[]
  projets: { id: number; nom_projet: string; client_nom: string | null }[]
  titres?: { id: number; texte: string }[]
  team?: TeamMember[]
  isOpen: boolean
  onToggle: () => void
  onAssign: (payload: { client_id?: number | null; projet_id?: number | null; parent_titre_id?: number | null; assigne_admin_ids?: number[] }) => void
}) {
  const clientSeul = !currentProjetId && currentClientId ? String(currentClientId) : ''
  const { btnRef, coords } = useAnchoredCoords(isOpen, titres && titres.length ? 320 : 250, 256)
  return (
    <div className="relative flex-shrink-0">
      <button ref={btnRef} onClick={onToggle} title="Assigner à un client / projet / personne"
        className={`transition-opacity flex-shrink-0 p-1.5 -m-1 hover:text-[var(--color-brand)] ${isOpen ? 'opacity-100 text-[var(--color-brand)]' : 'text-[var(--color-dark-text-2)] opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/row:opacity-100 [@media(hover:hover)]:group-hover/item:opacity-100 focus-visible:!opacity-100'}`}>
        <span aria-hidden="true" className="material-symbols-outlined text-[14px]">sell</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onToggle} />
          <div className="fixed z-50 w-64 bg-white border border-[var(--color-light-border)] rounded-md shadow-lg p-3 space-y-3 text-left"
            style={{ top: coords.top, left: coords.left }}>
            {team && team.length > 0 && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-dark-text-2)] mb-1">Assignée à</label>
                <div className="space-y-1">
                  {team.map(m => {
                    const checked = (currentAssigneeIds || []).includes(m.id)
                    return (
                      <label key={m.id} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input type="checkbox" checked={checked} onChange={e => {
                          const cur = currentAssigneeIds || []
                          const next = e.target.checked ? [...cur, m.id] : cur.filter(id => id !== m.id)
                          onAssign({ assigne_admin_ids: next })
                        }} />
                        {m.nom_complet}
                      </label>
                    )
                  })}
                  {(currentAssigneeIds || []).length === 0 && (
                    <p className="text-[10px] text-[var(--color-dark-text-2)] italic">Partagée (toute l&apos;équipe)</p>
                  )}
                </div>
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-dark-text-2)] mb-1">Projet</label>
              <select value={currentProjetId ?? ''} aria-label="Assigner à un projet" onChange={e => onAssign({ projet_id: e.target.value ? Number(e.target.value) : null })}
                className="w-full text-xs border border-[var(--color-light-border)] rounded px-2 py-1.5 bg-white">
                <option value="">— Aucun —</option>
                {projets.map(p => <option key={p.id} value={p.id}>{p.nom_projet}{p.client_nom ? ` · ${p.client_nom}` : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-dark-text-2)] mb-1">Client (sans projet)</label>
              <select value={clientSeul} aria-label="Assigner à un client" onChange={e => onAssign({ client_id: e.target.value ? Number(e.target.value) : null })}
                className="w-full text-xs border border-[var(--color-light-border)] rounded px-2 py-1.5 bg-white">
                <option value="">— Aucun —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nom_complet}</option>)}
              </select>
            </div>
            {titres && titres.length > 0 && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-dark-text-2)] mb-1">Déplacer vers une section</label>
                <select value={currentTitreId ?? ''} aria-label="Déplacer vers une section" onChange={e => onAssign({ parent_titre_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full text-xs border border-[var(--color-light-border)] rounded px-2 py-1.5 bg-white">
                  <option value="">— Aucune —</option>
                  {titres.map(t => <option key={t.id} value={t.id}>{t.texte}</option>)}
                </select>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function ScheduleMenu({ todo, isOpen, onToggle, onSchedule, onUnschedule }: {
  todo: TodoPerso
  isOpen: boolean
  onToggle: () => void
  onSchedule: (payload: { date: string; heure: string; duree: string }) => void
  onUnschedule: () => void
}) {
  const scheduled = !!todo.calendar_event_id
  const { btnRef, coords } = useAnchoredCoords(isOpen, 210, 256)
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(todo.date_echeance || today)
  const [heure, setHeure] = useState('09:00')
  const [duree, setDuree] = useState('60')
  useEffect(() => { if (isOpen) { setDate(todo.date_echeance || today); setHeure('09:00'); setDuree('60') } }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="relative flex-shrink-0">
      <button ref={btnRef} onClick={onToggle} title={scheduled ? 'Planifié — modifier' : 'Planifier au calendrier'}
        className={`transition-opacity flex-shrink-0 p-1.5 -m-1 hover:text-[var(--color-brand)] ${scheduled ? 'opacity-100 text-[var(--color-brand)]' : 'text-[var(--color-dark-text-2)] opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/item:opacity-100 focus-visible:!opacity-100'}`}>
        <span aria-hidden="true" className="material-symbols-outlined text-[14px]">{scheduled ? 'event_available' : 'calendar_add_on'}</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onToggle} />
          <div className="fixed z-50 w-64 bg-white border border-[var(--color-light-border)] rounded-md shadow-lg p-3 space-y-2 text-left"
            style={{ top: coords.top, left: coords.left }}>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-dark-text-2)]">Planifier au calendrier</label>
            <div className="flex gap-2">
              <input type="date" value={date} aria-label="Date" onChange={e => setDate(e.target.value)}
                className="flex-1 text-xs border border-[var(--color-light-border)] rounded px-2 py-1.5 bg-white" />
              <input type="time" value={heure} aria-label="Heure" onChange={e => setHeure(e.target.value)}
                className="w-20 text-xs border border-[var(--color-light-border)] rounded px-2 py-1.5 bg-white" />
            </div>
            <select value={duree} aria-label="Durée" onChange={e => setDuree(e.target.value)}
              className="w-full text-xs border border-[var(--color-light-border)] rounded px-2 py-1.5 bg-white">
              <option value="15">15 min</option><option value="30">30 min</option>
              <option value="60">1h</option><option value="90">1h30</option>
              <option value="120">2h</option><option value="180">3h</option>
            </select>
            <button onClick={() => onSchedule({ date, heure, duree })} disabled={!date}
              className="w-full text-xs bg-[var(--color-brand)] text-white rounded px-3 py-1.5 font-body font-bold disabled:opacity-40">
              {scheduled ? 'Replanifier' : 'Planifier'}
            </button>
            {scheduled && (
              <button onClick={onUnschedule}
                className="w-full text-xs text-[var(--color-error)] hover:opacity-70 font-body">Retirer du calendrier</button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function ContactMenu({ todo, isOpen, onToggle, onSave, onImportVCard }: {
  todo: TodoPerso
  isOpen: boolean
  onToggle: () => void
  onSave: (payload: { contact_nom: string | null; contact_telephone: string | null; contact_courriel: string | null }) => void
  onImportVCard: (file: File) => void
}) {
  const hasContact = !!(todo.contact_nom || todo.contact_telephone || todo.contact_courriel)
  const { btnRef, coords } = useAnchoredCoords(isOpen, 230, 256)
  const fileRef = useRef<HTMLInputElement>(null)
  const [nom, setNom] = useState(todo.contact_nom || '')
  const [tel, setTel] = useState(todo.contact_telephone || '')
  const [mail, setMail] = useState(todo.contact_courriel || '')
  useEffect(() => { if (isOpen) { setNom(todo.contact_nom || ''); setTel(todo.contact_telephone || ''); setMail(todo.contact_courriel || '') } }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="relative flex-shrink-0">
      <button ref={btnRef} onClick={onToggle} title={hasContact ? 'Contact — modifier' : 'Ajouter un contact'}
        className={`transition-opacity flex-shrink-0 p-1.5 -m-1 hover:text-[var(--color-brand)] ${hasContact ? 'opacity-100 text-[var(--color-brand)]' : 'text-[var(--color-dark-text-2)] opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/item:opacity-100 focus-visible:!opacity-100'}`}>
        <span aria-hidden="true" className="material-symbols-outlined text-[14px]">contact_phone</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onToggle} />
          <div className="fixed z-50 w-64 bg-white border border-[var(--color-light-border)] rounded-md shadow-lg p-3 space-y-2 text-left"
            style={{ top: coords.top, left: coords.left }}>
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-dark-text-2)]">Contact</label>
              <button onClick={() => fileRef.current?.click()} title="Importer depuis une fiche .vcf"
                className="text-[10px] font-bold text-[var(--color-brand)] flex items-center gap-1">
                <span aria-hidden="true" className="material-symbols-outlined text-[13px]">upload_file</span>
                .vcf
              </button>
              <input ref={fileRef} type="file" accept=".vcf,text/vcard" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) onImportVCard(f); e.target.value = '' }} />
            </div>
            <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom du contact" aria-label="Nom du contact"
              className="w-full text-xs border border-[var(--color-light-border)] rounded px-2 py-1.5 bg-white" />
            <input value={tel} onChange={e => setTel(e.target.value)} placeholder="Téléphone" type="tel" aria-label="Téléphone du contact"
              className="w-full text-xs border border-[var(--color-light-border)] rounded px-2 py-1.5 bg-white" />
            <input value={mail} onChange={e => setMail(e.target.value)} placeholder="Courriel" type="email" aria-label="Courriel du contact"
              className="w-full text-xs border border-[var(--color-light-border)] rounded px-2 py-1.5 bg-white" />
            <button onClick={() => onSave({ contact_nom: nom.trim() || null, contact_telephone: tel.trim() || null, contact_courriel: mail.trim() || null })}
              className="w-full text-xs bg-[var(--color-brand)] text-white rounded px-3 py-1.5 font-body font-bold">
              Enregistrer
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>(MOCK_DATA)
  const [adminNom, setAdminNom] = useState('')
  const [adminId, setAdminId] = useState<number | null>(null)
  const [team, setTeam] = useState<TeamMember[]>([])
  const [todoView, setTodoView] = useState<'mine' | 'all'>('mine')
  const [groupMode, setGroupMode] = useState<'projet' | 'echeance'>('projet')
  const [todos, setTodos] = useState<TodoPerso[]>([])
  const [clients, setClients] = useState<{ id: number; nom_complet: string }[]>([])
  const [projets, setProjets] = useState<{ id: number; nom_projet: string; client_nom: string | null; is_archived?: number }[]>([])
  const [assignOpen, setAssignOpen] = useState<number | null>(null)
  const [groupAssignOpen, setGroupAssignOpen] = useState<string | null>(null)
  const [scheduleOpen, setScheduleOpen] = useState<number | null>(null)
  const [contactOpen, setContactOpen] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [editGroupText, setEditGroupText] = useState('')

  function showError(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  async function renameProject(projetId: number, nom: string) {
    setEditingGroup(null)
    const clean = nom.trim()
    if (!clean) return
    const snapshot = todos
    setTodos(prev => prev.map(t => t.projet_id === projetId ? { ...t, projet_nom: clean } : t))
    try {
      const res = await fetch(`${API}/api/v1/admin/projet/${projetId}/rename`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: clean }),
      })
      if (!res.ok) throw new Error()
      // Le groupe est identifié par projet_id, pas par nom — pas besoin de déplacer l'état d'ouverture.
    } catch {
      setTodos(snapshot); showError("Le renommage du projet a échoué.")
    }
  }
  const [newTitre, setNewTitre] = useState('')
  const [newTaches, setNewTaches] = useState<{texte: string; priorite: string}[]>([{texte: '', priorite: 'normale'}])
  const [addingTodo, setAddingTodo] = useState(false)
  const [inlineAdd, setInlineAdd] = useState<number | null>(null)
  const [inlineText, setInlineText] = useState('')
  const [inlinePriorite, setInlinePriorite] = useState('normale')
  const [inlineAgenda, setInlineAgenda] = useState(false)
  const [inlineDate, setInlineDate] = useState('')
  const [inlineHeure, setInlineHeure] = useState('09:00')
  const [inlineDuree, setInlineDuree] = useState('60')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`${API}/api/v1/admin/dashboard`, { credentials: 'include' })
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch(`${API}/api/v1/auth/me`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d?.nom) setAdminNom(String(d.nom).split(' ')[0])
        if (d?.id) setAdminId(d.id)
      })
      .catch(() => {})
    fetch(`${API}/api/v1/admin/team`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setTeam(d) })
      .catch(() => {})
  }, [])

  // Date du jour pour le header (calculée côté client → pas de mismatch d'hydratation)
  const [todayLabel, setTodayLabel] = useState('')
  useEffect(() => {
    const d = new Date()
    const jour = d.toLocaleDateString('fr-CA', { weekday: 'long' })
    const date = d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })
    setTodayLabel(`${jour} ${date}`)
  }, [])

  // Plage du graphique d'activité de facturation (FIX 4 — mock statique pour l'instant)
  const [chartRange, setChartRange] = useState<'6m' | 'annee'>('6m')

  useEffect(() => {
    fetch(`${API}/api/v1/admin/todos?view=${todoView}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => Array.isArray(d) ? setTodos(d) : null)
      .catch(() => {})
  }, [todoView])

  // Clients + projets pour le sélecteur d'assignation
  useEffect(() => {
    fetch(`${API}/api/v1/admin/clients`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => Array.isArray(d) ? setClients(d.map((c: { id: number; nom_complet: string }) => ({ id: c.id, nom_complet: c.nom_complet }))) : null)
      .catch(() => {})
    fetch(`${API}/api/v1/admin/projets`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => Array.isArray(d) ? setProjets(d.filter((p: { is_archived?: number }) => !p.is_archived)) : null)
      .catch(() => {})
  }, [])

  // Calcule les champs d'un todo après (ré)assignation, pour la mise à jour optimiste
  function applyAssign(t: TodoPerso, payload: { client_id?: number | null; projet_id?: number | null; parent_titre_id?: number | null; assigne_admin_ids?: number[] }): TodoPerso {
    const next = { ...t }
    if ('projet_id' in payload) {
      const p = payload.projet_id ? projets.find(x => x.id === payload.projet_id) : null
      next.projet_id = payload.projet_id ?? null
      next.projet_nom = p ? p.nom_projet : null
      if (p) { next.client_nom = p.client_nom; next.client_id_effectif = null; next.parent_titre_id = null }
    }
    if ('client_id' in payload) {
      const c = payload.client_id ? clients.find(x => x.id === payload.client_id) : null
      next.projet_id = null; next.projet_nom = null
      next.client_id_effectif = payload.client_id ?? null
      next.client_nom = c ? c.nom_complet : null
      if (payload.client_id) next.parent_titre_id = null
    }
    if ('parent_titre_id' in payload) next.parent_titre_id = payload.parent_titre_id ?? null
    if ('assigne_admin_ids' in payload) {
      next.assignees = (payload.assigne_admin_ids || []).map(id => team.find(m => m.id === id)).filter((m): m is TeamMember => !!m)
    }
    return next
  }

  async function assignTodo(id: number, payload: { client_id?: number | null; projet_id?: number | null; parent_titre_id?: number | null; assigne_admin_ids?: number[] }) {
    setAssignOpen(null)
    const snapshot = todos
    setTodos(prev => prev.map(t => t.id === id ? applyAssign(t, payload) : t))
    try {
      const res = await fetch(`${API}/api/v1/admin/todos/${id}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
    } catch {
      setTodos(snapshot); showError("L'assignation n'a pas pu être enregistrée.")
    }
  }

  async function assignGroup(ids: number[], payload: { client_id?: number | null; projet_id?: number | null }) {
    setGroupAssignOpen(null)
    const snapshot = todos
    const set = new Set(ids)
    setTodos(prev => prev.map(t => set.has(t.id) ? applyAssign(t, payload) : t))
    try {
      const res = await fetch(`${API}/api/v1/admin/todos/bulk-assign`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, ...payload }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setTodos(snapshot); showError("L'assignation du groupe a échoué.")
    }
  }

  async function scheduleTodo(id: number, payload: { date: string; heure: string; duree: string }) {
    setScheduleOpen(null)
    const snapshot = todos
    setTodos(prev => prev.map(t => t.id === id ? { ...t, date_echeance: payload.date, calendar_event_id: t.calendar_event_id || 'pending' } : t))
    try {
      const res = await fetch(`${API}/api/v1/admin/todos/${id}/planifier`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTodos(prev => prev.map(t => t.id === id ? { ...t, calendar_event_id: data.calendar_event_id || t.calendar_event_id, date_echeance: data.date_echeance || t.date_echeance } : t))
    } catch {
      setTodos(snapshot); showError("La planification au calendrier a échoué.")
    }
  }

  async function unscheduleTodo(id: number) {
    setScheduleOpen(null)
    const snapshot = todos
    setTodos(prev => prev.map(t => t.id === id ? { ...t, calendar_event_id: null } : t))
    try {
      const res = await fetch(`${API}/api/v1/admin/todos/${id}/deplanifier`, { method: 'POST', credentials: 'include' })
      if (!res.ok) throw new Error()
    } catch {
      setTodos(snapshot); showError("Le retrait du calendrier a échoué.")
    }
  }

  async function updateContact(id: number, payload: { contact_nom?: string | null; contact_telephone?: string | null; contact_courriel?: string | null }) {
    setContactOpen(null)
    const snapshot = todos
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...payload } : t))
    try {
      const res = await fetch(`${API}/api/v1/admin/todos/${id}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
    } catch {
      setTodos(snapshot); showError("Le contact n'a pas pu être enregistré.")
    }
  }

  function importVCardForTodo(id: number, file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      const { nom, telephone, courriel } = parseVCard(String(reader.result || ''))
      if (!nom && !telephone && !courriel) { showError('Contact illisible dans ce fichier.'); return }
      updateContact(id, {
        ...(nom ? { contact_nom: nom } : {}),
        ...(telephone ? { contact_telephone: telephone } : {}),
        ...(courriel ? { contact_courriel: courriel } : {}),
      })
    }
    reader.readAsText(file)
  }

  async function saveText(id: number) {
    const txt = editText.trim()
    setEditingId(null)
    if (!txt) return
    const snapshot = todos
    setTodos(prev => prev.map(t => t.id === id ? { ...t, texte: txt } : t))
    try {
      const res = await fetch(`${API}/api/v1/admin/todos/${id}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texte: txt }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setTodos(snapshot); showError("La modification n'a pas pu être enregistrée.")
    }
  }

  async function toggleTodo(id: number) {
    try {
      const res = await fetch(`${API}/api/v1/admin/todos/${id}/toggle`, { method: 'POST', credentials: 'include' })
      if (!res.ok) throw new Error()
      const { est_coche } = await res.json()
      setTodos(prev => prev.map(t => t.id === id ? { ...t, est_coche: est_coche ? 1 : 0 } : t))
    } catch {
      showError("Impossible de mettre à jour la tâche.")
    }
  }

  async function deleteTodo(id: number) {
    const snapshot = todos
    setTodos(prev => prev.filter(t => t.id !== id))
    try {
      const res = await fetch(`${API}/api/v1/admin/todos/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error()
    } catch {
      setTodos(snapshot); showError("La suppression a échoué.")
    }
  }

  async function updatePriorite(id: number, priorite: string) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, priorite } : t))
    await fetch(`${API}/api/v1/admin/todos/${id}`, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priorite }),
    })
  }

  async function toggleVisuel(id: number) {
    const res = await fetch(`${API}/api/v1/admin/marketing/${id}/todo-toggle`, { method: 'POST', credentials: 'include' })
    if (res.ok) setData(prev => ({ ...prev, visuels_a_creer: prev.visuels_a_creer.filter(p => p.id !== id) }))
  }

  async function togglePublier(id: number) {
    const res = await fetch(`${API}/api/v1/admin/marketing/${id}/publier`, { method: 'POST', credentials: 'include' })
    if (res.ok) setData(prev => ({ ...prev, a_publier: prev.a_publier.filter(p => p.id !== id) }))
  }

  async function createSection() {
    if (!newTitre.trim()) return
    const resTitre = await fetch(`${API}/api/v1/admin/todos`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texte: newTitre.trim(), is_titre: true }),
    })
    if (!resTitre.ok) return
    const titreObj = await resTitre.json()
    const nouvTodos: typeof todos = [titreObj]
    for (const t of newTaches.filter(t => t.texte.trim())) {
      const res = await fetch(`${API}/api/v1/admin/todos`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texte: t.texte.trim(), priorite: t.priorite, parent_titre_id: titreObj.id }),
      })
      if (res.ok) nouvTodos.push(await res.json())
    }
    setTodos(prev => [...nouvTodos, ...prev])
    setNewTitre('')
    setNewTaches([{texte: '', priorite: 'normale'}])
    setAddingTodo(false)
    setOpenGroups(prev => ({ ...prev, '— Personnel': true }))
  }

  async function addInlineTask(titreId: number) {
    if (!inlineText.trim()) return
    const res = await fetch(`${API}/api/v1/admin/todos`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texte: inlineText.trim(),
        priorite: inlinePriorite,
        parent_titre_id: titreId,
        ...(inlineAgenda && inlineDate && inlineHeure ? {
          agenda_date: inlineDate,
          agenda_heure: inlineHeure,
          agenda_duree: parseInt(inlineDuree) || 60,
        } : {}),
      }),
    })
    if (res.ok) {
      const todo = await res.json()
      setTodos(prev => {
        const enfants = prev.filter(t => t.parent_titre_id === titreId)
        const lastEnfantIdx = enfants.length > 0
          ? prev.findIndex(t => t.id === enfants[enfants.length - 1].id)
          : prev.findIndex(t => t.id === titreId)
        const next = [...prev]
        next.splice(lastEnfantIdx + 1, 0, todo)
        return next
      })
      setInlineText('')
      setInlinePriorite('normale')
      setInlineAgenda(false)
      setInlineDate('')
      setInlineHeure('09:00')
      setInlineDuree('60')
      setInlineAdd(null)
    }
  }

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [tachesOpen, setTachesOpen] = useState(true)

  const [webhookStatus, setWebhookStatus] = useState<{ active: boolean; expiration?: string; expires_soon?: boolean } | null>(null)
  const [registeringWebhook, setRegisteringWebhook] = useState(false)

  useEffect(() => {
    fetch(`${API}/api/v1/admin/webhook/calendar/status`, { credentials: 'include' })
      .then(r => r.json())
      .then(setWebhookStatus)
      .catch(() => {})
  }, [])

  async function handleRegisterWebhook() {
    setRegisteringWebhook(true)
    try {
      const res = await fetch(`${API}/api/v1/admin/webhook/calendar/register`, { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (data.success) setWebhookStatus({ active: true, expiration: data.expiration, expires_soon: false })
      else alert(data.error || 'Erreur')
    } catch { alert('Erreur réseau') }
    finally { setRegisteringWebhook(false) }
  }

  function toggleGroup(key: string) {
    setOpenGroups(prev => ({ ...prev, [key]: !(prev[key] ?? false) }))
  }

  const todosActifs  = useMemo(() => todos.filter(t => !t.est_coche || t.is_titre), [todos])
  const todosCochs   = useMemo(() => todos.filter(t => t.est_coche && !t.is_titre && !t.parent_titre_id), [todos])
  const activeGroups = useMemo(() => groupByProject(todosActifs), [todosActifs])
  const titres       = useMemo(() => todos.filter(t => t.is_titre).map(t => ({ id: t.id, texte: t.texte })), [todos])
  const echeanceBuckets = useMemo(() => {
    const buckets: Record<Bucket, TodoPerso[]> = { retard: [], aujourdhui: [], avenir: [], sans_date: [] }
    for (const t of todosActifs) if (!t.is_titre) buckets[bucketOf(t.date_echeance)].push(t)
    return buckets
  }, [todosActifs])

  return (
    <div>

      {/* Toast d'erreur */}
      {toast && (
        <div role="alert" aria-live="assertive"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-xs font-body font-semibold text-white"
          style={{ background: 'var(--color-error)' }}>
          <span aria-hidden="true" className="material-symbols-outlined text-[16px]">error</span>
          {toast}
        </div>
      )}

      {/* Welcome */}
      <section className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-body font-bold mb-1"
            style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.16em', color: 'var(--color-light-text-3)' }}>
            Tableau de bord · {todayLabel}
          </p>
          <h1 className="font-display"
            style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--color-dark-1)' }}>
            Bonjour{adminNom ? `, ${adminNom}` : ''}
          </h1>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Recherche */}
          <div className="relative">
            <span aria-hidden="true" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px]"
              style={{ color: 'var(--color-light-text-3)' }}>search</span>
            <input
              placeholder="Rechercher client, projet…"
              aria-label="Rechercher"
              className="font-body"
              style={{
                background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
                borderRadius: '11px', padding: '12px 14px 12px 38px', fontSize: '13px',
                color: 'var(--color-dark-1)', width: '240px', outline: 'none',
              }}
            />
          </div>
          {/* Nouveau client */}
          <Link href="/admin/clients/new" className="flex items-center gap-2 font-display transition-colors"
            style={{
              background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
              color: 'var(--color-dark-1)', borderRadius: '11px', padding: '12px 18px', fontSize: '13px',
            }}>
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">person_add</span>
            Nouveau client
          </Link>
          {/* Nouveau projet */}
          <Link href="/admin/projets/new" className="flex items-center gap-2 font-display transition-opacity hover:opacity-90"
            style={{
              background: 'var(--color-brand)', color: 'white',
              borderRadius: '11px', padding: '12px 18px', fontSize: '13px',
            }}>
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add</span>
            Nouveau projet
          </Link>
        </div>
      </section>

      {/* Stats — KPIs */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5" style={{ gap: '14px' }}>

          {/* Card 1 — Clients */}
          <div className="kpi-card"
            style={{ background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)', borderRadius: '18px', padding: '16px' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] uppercase tracking-widest font-body font-bold" style={{ color: 'var(--color-light-text-3)' }}>Clients</p>
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]" style={{ color: 'var(--color-info)' }}>group</span>
            </div>
            <p className="font-display" style={{ fontSize: '34px', fontWeight: 800, lineHeight: 1, color: 'var(--color-dark-1)' }}>{data.total_clients}</p>
            <p className="flex items-center gap-1 mt-1.5 text-xs font-body font-semibold" style={{ color: 'var(--color-success)' }}>
              <span aria-hidden="true" className="material-symbols-outlined text-[15px]">trending_up</span>
              +3 ce mois
            </p>
          </div>

          {/* Card 2 — Projets actifs */}
          <div className="kpi-card"
            style={{ background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)', borderRadius: '18px', padding: '16px' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] uppercase tracking-widest font-body font-bold" style={{ color: 'var(--color-light-text-3)' }}>Projets actifs</p>
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]" style={{ color: 'var(--color-warning)' }}>folder_open</span>
            </div>
            <p className="font-display" style={{ fontSize: '34px', fontWeight: 800, lineHeight: 1, color: 'var(--color-dark-1)' }}>{data.projets_actifs}</p>
            <p className="mt-1.5 text-xs font-body" style={{ color: 'var(--color-light-text-3)' }}>en cours</p>
          </div>

          {/* Card 3 — En révision (accentuée) */}
          <div className="relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-hover))', borderRadius: '18px', padding: '16px', color: 'white' }}>
            <span aria-hidden="true" className="material-symbols-outlined"
              style={{ position: 'absolute', right: '-10px', top: '-8px', fontSize: '80px', opacity: 0.16, color: 'white' }}>priority_high</span>
            <div className="flex items-center justify-between mb-2 relative">
              <p className="text-[11px] uppercase tracking-widest font-body font-bold" style={{ color: 'white' }}>En révision</p>
            </div>
            <p className="font-display relative" style={{ fontSize: '34px', fontWeight: 800, lineHeight: 1, color: 'white' }}>{data.en_revision}</p>
            <p className="mt-1.5 text-xs font-body font-semibold relative" style={{ color: 'white' }}>à traiter</p>
          </div>

          {/* Card 4 — Factures ouvertes */}
          <div className="kpi-card"
            style={{ background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)', borderRadius: '18px', padding: '16px' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] uppercase tracking-widest font-body font-bold" style={{ color: 'var(--color-light-text-3)' }}>Factures ouv.</p>
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]" style={{ color: 'var(--color-warning)' }}>receipt_long</span>
            </div>
            <p className="font-display" style={{ fontSize: '34px', fontWeight: 800, lineHeight: 1, color: 'var(--color-dark-1)' }}>
              {data.factures_ouvertes || '—'} <span style={{ fontSize: '18px', fontWeight: 700 }}>$</span>
            </p>
            <p className="mt-1.5 text-xs font-body font-semibold"
              style={{ color: (data.factures_en_retard ?? 0) > 0 ? 'var(--color-error)' : 'var(--color-light-text-3)' }}>
              {(data.factures_en_retard ?? 0) > 0 ? `${data.factures_en_retard} en retard` : '—'}
            </p>
          </div>

          {/* Card 5 — Mes tâches */}
          <div className="kpi-card"
            style={{ background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)', borderRadius: '18px', padding: '16px' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] uppercase tracking-widest font-body font-bold" style={{ color: 'var(--color-light-text-3)' }}>Mes tâches</p>
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]" style={{ color: 'var(--color-dark-text-2)' }}>checklist</span>
            </div>
            <p className="font-display" style={{ fontSize: '34px', fontWeight: 800, lineHeight: 1, color: 'var(--color-dark-1)' }}>{todosActifs.length}</p>
            <p className="mt-1.5 text-xs font-body" style={{ color: 'var(--color-light-text-3)' }}>à faire</p>
          </div>

        </div>
      </section>

      {/* Activité de facturation */}
      <section className="mb-8">
        <div style={{ background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)', borderRadius: '20px', padding: '22px' }}>
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <p className="font-display uppercase" style={{ fontSize: '12px', letterSpacing: '.14em', color: 'var(--color-light-text-3)' }}>Activité de facturation</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-display" style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-dark-1)' }}>18 940 $</span>
                <span className="font-body font-bold" style={{ color: 'var(--color-success)', fontSize: '13px' }}>▲ 18%</span>
              </div>
            </div>
            <div className="flex items-center gap-1 self-center"
              style={{ background: 'var(--color-light-1)', border: '1px solid var(--color-light-border)', borderRadius: '999px', padding: '3px' }}>
              {([['6m', '6 mois'], ['annee', 'Année']] as const).map(([val, label]) => {
                const active = chartRange === val
                return (
                  <button key={val} onClick={() => setChartRange(val)} className="font-display transition-colors"
                    style={{
                      fontSize: '12px', fontWeight: 700, padding: '6px 14px', borderRadius: '999px',
                      border: 'none', cursor: 'pointer',
                      background: active ? 'var(--color-brand)' : 'transparent',
                      color: active ? 'white' : 'var(--color-dark-text-2)',
                    }}>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
          <svg viewBox="0 0 640 140" preserveAspectRatio="none" style={{ width: '100%', height: '140px', display: 'block' }}>
            <defs>
              <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: 'var(--color-brand)', stopOpacity: 0.26 }} />
                <stop offset="100%" style={{ stopColor: 'var(--color-brand)', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            <path d="M0,104 L107,80 L213,90 L320,54 L427,66 L533,38 L640,16 L640,140 L0,140 Z" fill="url(#chartArea)" />
            <path d="M0,104 L107,80 L213,90 L320,54 L427,66 L533,38 L640,16"
              fill="none" stroke="var(--color-brand)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx="640" cy="16" r="5" fill="var(--color-brand)" />
            <circle cx="640" cy="16" r="10" fill="var(--color-brand)" opacity="0.2" />
          </svg>
          <div className="mt-2" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-light-text-3)' }}>
            <span>FÉV</span><span>MAR</span><span>AVR</span><span>MAI</span><span>JUIN</span><span>JUIL</span>
          </div>
        </div>
      </section>

      {/* Grille 2 colonnes : (Mes tâches + Projets récents) | rail droit */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px]" style={{ gap: '20px', alignItems: 'start' }}>

        {/* Colonne gauche : Mes tâches + Projets récents */}
        <div className="flex flex-col gap-5">

          {/* Mes tâches */}
          <div className="tasks-card rounded-[20px] overflow-hidden" style={{ background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)', maxHeight: '520px', overflowY: 'auto', scrollbarWidth: 'thin' }}>

          {/* Header */}
          <button
            onClick={() => setTachesOpen(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 bg-[#faf7f3] border-b border-[#e0d9d3] hover:bg-[#fff8f6] transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              {tachesOpen
                ? <ChevronDown aria-hidden="true" className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
                : <ChevronRight aria-hidden="true" className="w-4 h-4 text-[var(--color-brand)] shrink-0" />}
              <h3 className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-dark-1)]">
                {todoView === 'mine' ? 'Mes tâches' : 'Toutes les tâches'}
              </h3>
              {todosActifs.length > 0 && (
                <span className="text-[10px] tracking-wide font-bold font-body bg-[var(--color-brand)] text-white px-2 py-0.5 rounded-full">
                  {todosActifs.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div onClick={e => e.stopPropagation()} title="Regrouper par" className="flex text-[10px] font-bold uppercase tracking-wide rounded-full overflow-hidden border border-[var(--color-light-border-2)]">
                <button onClick={() => setGroupMode('projet')} title="Par projet / client"
                  className={`px-2.5 py-1 transition-colors ${groupMode === 'projet' ? 'bg-[var(--color-brand)] text-white' : 'bg-white text-[var(--color-dark-text-2)] hover:bg-[var(--color-light-1)]'}`}>
                  <span aria-hidden="true" className="material-symbols-outlined text-[13px] align-middle">folder</span>
                </button>
                <button onClick={() => setGroupMode('echeance')} title="Par échéance"
                  className={`px-2.5 py-1 transition-colors ${groupMode === 'echeance' ? 'bg-[var(--color-brand)] text-white' : 'bg-white text-[var(--color-dark-text-2)] hover:bg-[var(--color-light-1)]'}`}>
                  <span aria-hidden="true" className="material-symbols-outlined text-[13px] align-middle">event</span>
                </button>
              </div>
              {team.length > 0 && (
                <div onClick={e => e.stopPropagation()} className="flex text-[10px] font-bold uppercase tracking-wide rounded-full overflow-hidden border border-[var(--color-light-border-2)]">
                  <button onClick={() => setTodoView('mine')}
                    className={`px-2.5 py-1 transition-colors ${todoView === 'mine' ? 'bg-[var(--color-brand)] text-white' : 'bg-white text-[var(--color-dark-text-2)] hover:bg-[var(--color-light-1)]'}`}>
                    Mine
                  </button>
                  <button onClick={() => setTodoView('all')}
                    className={`px-2.5 py-1 transition-colors ${todoView === 'all' ? 'bg-[var(--color-brand)] text-white' : 'bg-white text-[var(--color-dark-text-2)] hover:bg-[var(--color-light-1)]'}`}>
                    Toutes
                  </button>
                </div>
              )}
              <button
                onClick={e => { e.stopPropagation(); setAddingTodo(v => !v); setTimeout(() => inputRef.current?.focus(), 50) }}
                className="text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] transition-colors p-1">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">add_circle</span>
              </button>
            </div>
          </button>

          {tachesOpen && <>

          {/* Formulaire — nouveau titre + tâches */}
          {addingTodo && (
            <div className="px-5 py-4 bg-[var(--color-light-1)] border-b border-[var(--color-light-border)] space-y-3">
              <input
                ref={inputRef}
                value={newTitre}
                onChange={e => setNewTitre(e.target.value)}
                placeholder="Titre de la section…"
                className="w-full bg-white rounded-lg px-3 py-2 text-sm font-bold outline-none border border-[var(--color-dark-1)]/20 focus:border-[var(--color-brand)]"
              />
              <div className="space-y-1.5 pl-3 border-l-2 border-[var(--color-light-border-2)]">
                {newTaches.map((t, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <PrioritePicker value={t.priorite} onChange={p => {
                      const next = [...newTaches]; next[i] = {...next[i], priorite: p}; setNewTaches(next)
                    }} />
                    <input
                      value={t.texte}
                      onChange={e => {
                        const next = [...newTaches]; next[i] = {...next[i], texte: e.target.value}; setNewTaches(next)
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); setNewTaches(p => [...p, {texte: '', priorite: 'normale'}]) }
                        if (e.key === 'Backspace' && !t.texte && newTaches.length > 1) {
                          setNewTaches(p => p.filter((_, j) => j !== i))
                        }
                      }}
                      placeholder="ex. relancer client vendredi"
                      className="flex-1 bg-white rounded px-2 py-1.5 text-xs outline-none border border-[var(--color-light-border-2)] focus:border-[var(--color-brand)]"
                    />
                    {newTaches.length > 1 && (
                      <button onClick={() => setNewTaches(p => p.filter((_, j) => j !== i))} className="text-[var(--color-dark-text-2)] hover:text-[var(--color-error)]">
                        <span aria-hidden="true" className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => setNewTaches(p => [...p, {texte: '', priorite: 'normale'}])}
                  className="text-[11px] text-[var(--color-brand)] font-body font-bold flex items-center gap-1 pl-6 hover:underline">
                  <span aria-hidden="true" className="material-symbols-outlined text-[13px]">add</span>
                  Ajouter une tâche
                </button>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setAddingTodo(false); setNewTitre(''); setNewTaches([{texte: '', priorite: 'normale'}]) }}
                  className="text-xs text-[var(--color-dark-text-2)] font-body">Annuler</button>
                <button onClick={createSection} disabled={!newTitre.trim()}
                  className="text-xs bg-[var(--color-brand)] text-white px-4 py-1.5 rounded-lg font-body font-bold disabled:opacity-40">
                  Créer
                </button>
              </div>
            </div>
          )}

          {/* Liste groupes */}
          <div>
            {groupMode === 'projet' && Object.entries(activeGroups).map(([groupKey, group], idx, arr) => {
              const isOpen = openGroups[groupKey] ?? false
              const isProjet = group.kind !== 'personnel'
              const isRealProjet = group.kind === 'projet'
              const taches = group.todos.filter(t => !t.is_titre)
              const done = taches.filter(t => t.est_coche).length
              const total = taches.length
              const nomCourt = isProjet ? group.label.replace(/^\d{4}-\d{2}-\d{2} — /, '') : 'Personnel'
              const badgeColor = (isRealProjet || group.client_nom)
                ? 'bg-[#fff0eb] border border-[#f5c4a0] text-[#c0521a]'
                : 'bg-gray-100 border border-gray-200 text-gray-500'
              return (
                <div key={groupKey} className={idx < arr.length - 1 ? 'border-b border-[var(--color-light-border)]' : ''}>
                  <div className="flex items-center pr-3 hover:bg-[#fff8f6] transition-colors group group/row">
                    {editingGroup === groupKey ? (
                      <div className="flex-1 min-w-0 flex items-center gap-3 px-5 py-3">
                        <span aria-hidden="true" className="material-symbols-outlined text-[14px] text-[var(--color-dark-text-2)] flex-shrink-0">chevron_right</span>
                        <input autoFocus value={editGroupText} onChange={e => setEditGroupText(e.target.value)}
                          onBlur={() => renameProject(group.todos[0]!.projet_id!, editGroupText)}
                          onKeyDown={e => { if (e.key === 'Enter') renameProject(group.todos[0]!.projet_id!, editGroupText); if (e.key === 'Escape') setEditingGroup(null) }}
                          aria-label="Renommer le projet"
                          className="flex-1 min-w-0 text-sm font-body font-semibold bg-transparent outline-none border-b border-[var(--color-brand)] pb-0.5" />
                      </div>
                    ) : (
                      <button onClick={() => toggleGroup(groupKey)}
                        className="flex-1 min-w-0 flex items-center gap-3 px-5 py-3 text-left">
                        <span aria-hidden="true" className="material-symbols-outlined text-[14px] text-[var(--color-dark-text-2)] group-hover:text-[var(--color-brand)] transition-transform duration-150 flex-shrink-0"
                          style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                          chevron_right
                        </span>
                        <p className={`flex-1 min-w-0 text-sm font-body font-semibold truncate group-hover:text-[var(--color-dark-1)] group-hover:font-semibold ${isProjet ? 'text-[var(--color-dark-1)]' : 'text-[var(--color-dark-text-2)]'}`}>
                          {nomCourt}
                          {group.client_nom && group.kind !== 'client' && <span className="font-normal text-[var(--color-dark-text-2)] ml-1.5">· {group.client_nom}</span>}
                        </p>
                        <span className={`text-[11px] font-bold font-body px-2 py-0.5 rounded-full flex-shrink-0 tabular-nums group-hover:text-[var(--color-brand)] ${badgeColor}`}>
                          {done}/{total}
                        </span>
                      </button>
                    )}
                    {isRealProjet && editingGroup !== groupKey && (
                      <button onClick={() => { setEditingGroup(groupKey); setEditGroupText(nomCourt) }} title="Renommer le projet"
                        className="transition-opacity opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/row:opacity-100 focus-visible:!opacity-100 text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] p-1.5 -m-1 flex-shrink-0">
                        <span aria-hidden="true" className="material-symbols-outlined text-[14px]">edit</span>
                      </button>
                    )}
                    {!isRealProjet && (
                      <AssignMenu
                        currentProjetId={group.todos[0]?.projet_id ?? null}
                        currentClientId={group.todos.find(t => t.client_id_effectif)?.client_id_effectif ?? null}
                        clients={clients} projets={projets}
                        isOpen={groupAssignOpen === groupKey}
                        onToggle={() => setGroupAssignOpen(groupAssignOpen === groupKey ? null : groupKey)}
                        onAssign={(payload) => assignGroup(group.todos.map(t => t.id), payload)} />
                    )}
                  </div>
                  <div className="h-[3px] bg-gray-100">
                    <div className="h-full bg-[var(--color-brand)] transition-all" style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }} />
                  </div>
                  {isOpen && (
                    <div className="bg-[var(--color-light-1)] border-t border-[var(--color-light-border)]">
                      {group.todos
                        .filter(t => t.is_titre || !t.parent_titre_id)
                        .map(todo => {
                          if (todo.is_titre) {
                            const enfants = group.todos.filter(t => t.parent_titre_id === todo.id)
                            const doneEnf = enfants.filter(t => t.est_coche).length
                            return (
                              <div key={todo.id}>
                                {/* En-tête du titre */}
                                <div className="flex items-center gap-2 px-5 py-2 bg-[var(--color-light-0)] border-b border-[var(--color-light-border)] group/titre">
                                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITE[(todo.priorite as keyof typeof PRIORITE) ?? 'normale']?.dot ?? 'bg-orange-400'}`} />
                                  {editingId === todo.id ? (
                                    <input autoFocus value={editText} onChange={e => setEditText(e.target.value)}
                                      onBlur={() => saveText(todo.id)}
                                      onKeyDown={e => { if (e.key === 'Enter') saveText(todo.id); if (e.key === 'Escape') setEditingId(null) }}
                                      aria-label="Renommer la section"
                                      className="flex-1 min-w-0 text-[11px] font-display font-bold uppercase tracking-widest bg-transparent outline-none border-b border-[var(--color-brand)] pb-0.5" />
                                  ) : (
                                    <p onDoubleClick={() => { setEditingId(todo.id); setEditText(todo.texte) }} title="Double-cliquer pour renommer"
                                      className="flex-1 min-w-0 text-[11px] font-display font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] cursor-text">
                                      {todo.texte}
                                    </p>
                                  )}
                                  {enfants.length > 0 && (
                                    <span className="text-[10px] font-body text-[var(--color-light-text-2)] tabular-nums">{doneEnf}/{enfants.length}</span>
                                  )}
                                  <div className="transition-opacity opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/titre:opacity-100 [@media(hover:hover)]:group-focus-within/titre:opacity-100 flex-shrink-0">
                                    <PrioritePicker value={todo.priorite ?? 'normale'} onChange={p => updatePriorite(todo.id, p)} />
                                  </div>
                                  <button onClick={() => { setEditingId(todo.id); setEditText(todo.texte) }} title="Renommer la section"
                                    className="transition-opacity opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/titre:opacity-100 focus-visible:!opacity-100 text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] p-1.5 -m-1 flex-shrink-0">
                                    <span aria-hidden="true" className="material-symbols-outlined text-[14px]">edit</span>
                                  </button>
                                  <button onClick={() => { setInlineAdd(todo.id); setInlineText('') }} title="Ajouter une tâche"
                                    className="transition-opacity opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/titre:opacity-100 focus-visible:!opacity-100 text-[var(--color-brand)] p-1.5 -m-1 flex-shrink-0">
                                    <span aria-hidden="true" className="material-symbols-outlined text-[14px]">add</span>
                                  </button>
                                  <button onClick={() => deleteTodo(todo.id)}
                                    className="transition-opacity opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/titre:opacity-100 focus-visible:!opacity-100 text-[var(--color-dark-text-2)] hover:text-[var(--color-error)] p-1.5 -m-1 flex-shrink-0">
                                    <span aria-hidden="true" className="material-symbols-outlined text-[13px]">close</span>
                                  </button>
                                </div>
                                {/* Tâches enfants */}
                                {enfants.map(t => (
                                  <div key={t.id} className="flex items-center gap-2.5 px-7 py-2 border-b border-[var(--color-light-border)] last:border-0 group/item hover:bg-[#fff8f6] transition-colors">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITE[(t.priorite as keyof typeof PRIORITE) ?? 'normale']?.dot ?? 'bg-orange-400'} ${t.est_coche ? 'opacity-30' : ''}`} />
                                    <input type="checkbox" checked={!!t.est_coche} onChange={() => toggleTodo(t.id)}
                                      aria-label={`Marquer « ${t.texte} » comme ${t.est_coche ? 'à faire' : 'faite'}`}
                                      className="w-3.5 h-3.5 cursor-pointer flex-shrink-0 accent-[var(--color-brand)]" />
                                    {editingId === t.id ? (
                                      <input autoFocus value={editText} onChange={e => setEditText(e.target.value)}
                                        onBlur={() => saveText(t.id)}
                                        onKeyDown={e => { if (e.key === 'Enter') saveText(t.id); if (e.key === 'Escape') setEditingId(null) }}
                                        aria-label="Modifier le texte de la tâche"
                                        className="flex-1 min-w-0 text-xs font-body bg-transparent outline-none border-b border-[var(--color-brand)] pb-0.5" />
                                    ) : (
                                      <p onDoubleClick={() => { setEditingId(t.id); setEditText(t.texte) }} title="Double-cliquer pour modifier"
                                        className={`flex-1 min-w-0 text-xs font-body leading-snug ${t.est_coche ? 'line-through text-[var(--color-dark-text-2)]' : 'text-[var(--color-dark-1)]'}`}>
                                        {t.texte}
                                        {t.calendar_event_id && <span aria-hidden="true" className="ml-1.5 material-symbols-outlined text-[10px] text-[var(--color-brand)] align-middle">event_available</span>}
                                        {t.contact_nom && <span aria-hidden="true" title={t.contact_nom} className="ml-1.5 material-symbols-outlined text-[10px] text-[var(--color-dark-text-2)] align-middle">contact_phone</span>}
                                        {todoView === 'all' && (t.assignees || []).map(a => (
                                          <span key={a.id} className="ml-1.5 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[var(--color-light-1)] text-[var(--color-dark-text-2)] align-middle">
                                            {a.nom_complet.split(' ')[0]}
                                          </span>
                                        ))}
                                      </p>
                                    )}
                                    <button onClick={() => { setEditingId(t.id); setEditText(t.texte) }} title="Modifier"
                                      className="transition-opacity opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/item:opacity-100 focus-visible:!opacity-100 text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] p-1.5 -m-1 flex-shrink-0">
                                      <span aria-hidden="true" className="material-symbols-outlined text-[13px]">edit</span>
                                    </button>
                                    <ScheduleMenu todo={t}
                                      isOpen={scheduleOpen === t.id}
                                      onToggle={() => setScheduleOpen(scheduleOpen === t.id ? null : t.id)}
                                      onSchedule={(payload) => scheduleTodo(t.id, payload)}
                                      onUnschedule={() => unscheduleTodo(t.id)} />
                                    <AssignMenu
                                      currentProjetId={t.projet_id ?? null}
                                      currentClientId={t.client_id_effectif ?? null}
                                      currentTitreId={t.parent_titre_id ?? null}
                                      currentAssigneeIds={(t.assignees || []).map(a => a.id)}
                                      clients={clients} projets={projets} titres={titres} team={team}
                                      isOpen={assignOpen === t.id}
                                      onToggle={() => setAssignOpen(assignOpen === t.id ? null : t.id)}
                                      onAssign={(payload) => assignTodo(t.id, payload)} />
                                    <ContactMenu todo={t}
                                      isOpen={contactOpen === t.id}
                                      onToggle={() => setContactOpen(contactOpen === t.id ? null : t.id)}
                                      onSave={(payload) => updateContact(t.id, payload)}
                                      onImportVCard={(file) => importVCardForTodo(t.id, file)} />
                                    <button onClick={() => deleteTodo(t.id)} title="Supprimer"
                                      className="transition-opacity opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/item:opacity-100 focus-visible:!opacity-100 text-[var(--color-dark-text-2)] hover:text-[var(--color-error)] p-1.5 -m-1 flex-shrink-0">
                                      <span aria-hidden="true" className="material-symbols-outlined text-[13px]">close</span>
                                    </button>
                                  </div>
                                ))}
                                {/* Ajout inline */}
                                {inlineAdd === todo.id && (
                                  <div className="px-5 py-3 border-b border-[var(--color-light-border)] bg-white space-y-2">
                                    <div className="flex items-center gap-2">
                                      <PrioritePicker value={inlinePriorite} onChange={setInlinePriorite} />
                                      <input autoFocus value={inlineText} onChange={e => setInlineText(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') addInlineTask(todo.id); if (e.key === 'Escape') setInlineAdd(null) }}
                                        placeholder="ex. appeler comptable demain 14h"
                                        className="flex-1 text-xs bg-transparent outline-none border-b border-[var(--color-brand)] pb-0.5" />
                                      <button onClick={() => setInlineAgenda(v => !v)}
                                        title="Ajouter à l'agenda" aria-label="Ajouter à l'agenda"
                                        className={`flex-shrink-0 p-1.5 -m-1 transition-colors ${inlineAgenda ? 'text-[var(--color-brand)]' : 'text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)]'}`}>
                                        <span aria-hidden="true" className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                                      </button>
                                      <button onClick={() => addInlineTask(todo.id)} title="Valider" aria-label="Valider la tâche" className="text-[var(--color-brand)] p-1.5 -m-1 flex-shrink-0">
                                        <span aria-hidden="true" className="material-symbols-outlined text-[15px]">check</span>
                                      </button>
                                      <button onClick={() => setInlineAdd(null)} title="Annuler" aria-label="Annuler" className="text-[var(--color-dark-text-2)] p-1.5 -m-1 flex-shrink-0">
                                        <span aria-hidden="true" className="material-symbols-outlined text-[14px]">close</span>
                                      </button>
                                    </div>
                                    {inlineAgenda && (
                                      <div className="flex gap-2 pl-7">
                                        <input type="date" value={inlineDate} onChange={e => setInlineDate(e.target.value)}
                                          className="flex-1 bg-[var(--color-light-1)] rounded px-2 py-1 text-xs outline-none border border-[var(--color-light-border-2)] focus:border-[var(--color-brand)]" />
                                        <input type="time" value={inlineHeure} onChange={e => setInlineHeure(e.target.value)}
                                          className="w-24 bg-[var(--color-light-1)] rounded px-2 py-1 text-xs outline-none border border-[var(--color-light-border-2)] focus:border-[var(--color-brand)]" />
                                        <select value={inlineDuree} onChange={e => setInlineDuree(e.target.value)}
                                          className="bg-[var(--color-light-1)] rounded px-2 py-1 text-xs border border-[var(--color-light-border-2)] outline-none">
                                          <option value="15">15 min</option>
                                          <option value="30">30 min</option>
                                          <option value="60">1h</option>
                                          <option value="90">1h30</option>
                                          <option value="120">2h</option>
                                          <option value="180">3h</option>
                                        </select>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          }
                          /* Tâche sans titre parent (rétrocompatibilité) */
                          return (
                            <div key={todo.id} className="flex items-center gap-3 px-6 py-2.5 border-b border-[var(--color-light-border)] last:border-0 group/item hover:bg-[#fff8f6] transition-colors">
                              <input type="checkbox" checked={!!todo.est_coche} onChange={() => toggleTodo(todo.id)}
                                aria-label={`Marquer « ${todo.texte} » comme ${todo.est_coche ? 'à faire' : 'faite'}`}
                                className="w-3.5 h-3.5 cursor-pointer flex-shrink-0 accent-[var(--color-brand)]" />
                              {editingId === todo.id ? (
                                <input autoFocus value={editText} onChange={e => setEditText(e.target.value)}
                                  onBlur={() => saveText(todo.id)}
                                  onKeyDown={e => { if (e.key === 'Enter') saveText(todo.id); if (e.key === 'Escape') setEditingId(null) }}
                                  aria-label="Modifier le texte de la tâche"
                                  className="flex-1 min-w-0 text-xs font-body bg-transparent outline-none border-b border-[var(--color-brand)] pb-0.5" />
                              ) : (
                                <p onDoubleClick={() => { setEditingId(todo.id); setEditText(todo.texte) }} title="Double-cliquer pour modifier"
                                  className={`flex-1 min-w-0 text-xs font-body leading-snug ${todo.est_coche ? 'line-through text-[var(--color-dark-text-2)]' : 'text-[var(--color-dark-1)]'}`}>
                                  {todo.texte}
                                  {todo.date_echeance && <span className="ml-2 text-[10px] text-[var(--color-light-text-2)]">{formatDate(todo.date_echeance)}</span>}
                                  {todo.calendar_event_id && <span aria-hidden="true" className="ml-1.5 material-symbols-outlined text-[10px] text-[var(--color-brand)] align-middle">event_available</span>}
                                  {todo.contact_nom && <span aria-hidden="true" title={todo.contact_nom} className="ml-1.5 material-symbols-outlined text-[10px] text-[var(--color-dark-text-2)] align-middle">contact_phone</span>}
                                  {todoView === 'all' && (todo.assignees || []).map(a => (
                                    <span key={a.id} className="ml-1.5 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[var(--color-light-1)] text-[var(--color-dark-text-2)] align-middle">
                                      {a.nom_complet.split(' ')[0]}
                                    </span>
                                  ))}
                                </p>
                              )}
                              <button onClick={() => { setEditingId(todo.id); setEditText(todo.texte) }} title="Modifier"
                                className="transition-opacity opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/item:opacity-100 focus-visible:!opacity-100 text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] p-1.5 -m-1 flex-shrink-0">
                                <span aria-hidden="true" className="material-symbols-outlined text-[13px]">edit</span>
                              </button>
                              <ScheduleMenu todo={todo}
                                isOpen={scheduleOpen === todo.id}
                                onToggle={() => setScheduleOpen(scheduleOpen === todo.id ? null : todo.id)}
                                onSchedule={(payload) => scheduleTodo(todo.id, payload)}
                                onUnschedule={() => unscheduleTodo(todo.id)} />
                              <AssignMenu
                                currentProjetId={todo.projet_id ?? null}
                                currentClientId={todo.client_id_effectif ?? null}
                                currentTitreId={todo.parent_titre_id ?? null}
                                currentAssigneeIds={(todo.assignees || []).map(a => a.id)}
                                clients={clients} projets={projets} titres={titres} team={team}
                                isOpen={assignOpen === todo.id}
                                onToggle={() => setAssignOpen(assignOpen === todo.id ? null : todo.id)}
                                onAssign={(payload) => assignTodo(todo.id, payload)} />
                              <ContactMenu todo={todo}
                                isOpen={contactOpen === todo.id}
                                onToggle={() => setContactOpen(contactOpen === todo.id ? null : todo.id)}
                                onSave={(payload) => updateContact(todo.id, payload)}
                                onImportVCard={(file) => importVCardForTodo(todo.id, file)} />
                              <button onClick={() => deleteTodo(todo.id)}
                                className="transition-opacity opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/item:opacity-100 focus-visible:!opacity-100 text-[var(--color-dark-text-2)] hover:text-[var(--color-error)] p-1.5 -m-1 flex-shrink-0">
                                <span aria-hidden="true" className="material-symbols-outlined text-[14px]">close</span>
                              </button>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              )
            })}

            {groupMode === 'echeance' && BUCKET_ORDER.filter(b => echeanceBuckets[b].length > 0).map((bucket, idx, arr) => {
              const groupKey = `echeance:${bucket}`
              const isOpen = openGroups[groupKey] ?? true
              const list = echeanceBuckets[bucket]
              return (
                <div key={bucket} className={idx < arr.length - 1 ? 'border-b border-[var(--color-light-border)]' : ''}>
                  <button onClick={() => toggleGroup(groupKey)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#fff8f6] transition-colors text-left">
                    <span aria-hidden="true" className="material-symbols-outlined text-[14px] text-[var(--color-dark-text-2)] transition-transform duration-150 flex-shrink-0"
                      style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>chevron_right</span>
                    <p className={`flex-1 min-w-0 text-sm font-body font-semibold truncate ${bucket === 'retard' ? 'text-[var(--color-error)]' : 'text-[var(--color-dark-1)]'}`}>
                      {BUCKET_LABEL[bucket]}
                    </p>
                    <span className="text-[11px] font-bold font-body px-2 py-0.5 rounded-full flex-shrink-0 tabular-nums bg-gray-100 text-gray-500">
                      {list.length}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="bg-[var(--color-light-1)] border-t border-[var(--color-light-border)]">
                      {list.map(todo => (
                        <div key={todo.id} className="flex items-center gap-3 px-6 py-2.5 border-b border-[var(--color-light-border)] last:border-0 group/item hover:bg-[#fff8f6] transition-colors">
                          <input type="checkbox" checked={!!todo.est_coche} onChange={() => toggleTodo(todo.id)}
                            aria-label={`Marquer « ${todo.texte} » comme ${todo.est_coche ? 'à faire' : 'faite'}`}
                            className="w-3.5 h-3.5 cursor-pointer flex-shrink-0 accent-[var(--color-brand)]" />
                          {editingId === todo.id ? (
                            <input autoFocus value={editText} onChange={e => setEditText(e.target.value)}
                              onBlur={() => saveText(todo.id)}
                              onKeyDown={e => { if (e.key === 'Enter') saveText(todo.id); if (e.key === 'Escape') setEditingId(null) }}
                              aria-label="Modifier le texte de la tâche"
                              className="flex-1 min-w-0 text-xs font-body bg-transparent outline-none border-b border-[var(--color-brand)] pb-0.5" />
                          ) : (
                            <p onDoubleClick={() => { setEditingId(todo.id); setEditText(todo.texte) }} title="Double-cliquer pour modifier"
                              className={`flex-1 min-w-0 text-xs font-body leading-snug ${todo.est_coche ? 'line-through text-[var(--color-dark-text-2)]' : 'text-[var(--color-dark-1)]'}`}>
                              {(todo.projet_nom || todo.client_nom) && (
                                <span className="text-[var(--color-dark-text-2)] font-semibold">{todo.projet_nom || todo.client_nom} · </span>
                              )}
                              {todo.texte}
                              {todo.date_echeance && bucket !== 'sans_date' && <span className="ml-2 text-[10px] text-[var(--color-light-text-2)]">{formatDate(todo.date_echeance)}</span>}
                              {todo.calendar_event_id && <span aria-hidden="true" className="ml-1.5 material-symbols-outlined text-[10px] text-[var(--color-brand)] align-middle">event_available</span>}
                              {todo.contact_nom && <span aria-hidden="true" title={todo.contact_nom} className="ml-1.5 material-symbols-outlined text-[10px] text-[var(--color-dark-text-2)] align-middle">contact_phone</span>}
                              {todoView === 'all' && (todo.assignees || []).map(a => (
                                <span key={a.id} className="ml-1.5 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[var(--color-light-1)] text-[var(--color-dark-text-2)] align-middle">
                                  {a.nom_complet.split(' ')[0]}
                                </span>
                              ))}
                            </p>
                          )}
                          <button onClick={() => { setEditingId(todo.id); setEditText(todo.texte) }} title="Modifier"
                            className="transition-opacity opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/item:opacity-100 focus-visible:!opacity-100 text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] p-1.5 -m-1 flex-shrink-0">
                            <span aria-hidden="true" className="material-symbols-outlined text-[13px]">edit</span>
                          </button>
                          <ScheduleMenu todo={todo}
                            isOpen={scheduleOpen === todo.id}
                            onToggle={() => setScheduleOpen(scheduleOpen === todo.id ? null : todo.id)}
                            onSchedule={(payload) => scheduleTodo(todo.id, payload)}
                            onUnschedule={() => unscheduleTodo(todo.id)} />
                          <AssignMenu
                            currentProjetId={todo.projet_id ?? null}
                            currentClientId={todo.client_id_effectif ?? null}
                            currentTitreId={todo.parent_titre_id ?? null}
                            currentAssigneeIds={(todo.assignees || []).map(a => a.id)}
                            clients={clients} projets={projets} titres={titres} team={team}
                            isOpen={assignOpen === todo.id}
                            onToggle={() => setAssignOpen(assignOpen === todo.id ? null : todo.id)}
                            onAssign={(payload) => assignTodo(todo.id, payload)} />
                          <ContactMenu todo={todo}
                            isOpen={contactOpen === todo.id}
                            onToggle={() => setContactOpen(contactOpen === todo.id ? null : todo.id)}
                            onSave={(payload) => updateContact(todo.id, payload)}
                            onImportVCard={(file) => importVCardForTodo(todo.id, file)} />
                          <button onClick={() => deleteTodo(todo.id)}
                            className="transition-opacity opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/item:opacity-100 focus-visible:!opacity-100 text-[var(--color-dark-text-2)] hover:text-[var(--color-error)] p-1.5 -m-1 flex-shrink-0">
                            <span aria-hidden="true" className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {groupMode === 'echeance' && echeanceBuckets.retard.length === 0 && echeanceBuckets.aujourdhui.length === 0 &&
              echeanceBuckets.avenir.length === 0 && echeanceBuckets.sans_date.length === 0 && (
              <p className="text-sm text-[var(--color-dark-text-2)] font-body italic px-5 py-4">Aucune tâche en cours.</p>
            )}

            {/* Visuels à créer */}
            {data.visuels_a_creer.length > 0 && (
              <div className="border-t border-[var(--color-light-border)]">
                <button onClick={() => toggleGroup('__visuels__')}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#fff8f6] transition-colors text-left">
                  <span aria-hidden="true" className="material-symbols-outlined text-[14px] text-[var(--color-dark-text-2)] transition-transform duration-150 flex-shrink-0"
                    style={{ transform: (openGroups['__visuels__'] ?? false) ? 'rotate(90deg)' : 'rotate(0deg)' }}>chevron_right</span>
                  <p className="flex-1 text-sm font-body font-semibold text-[var(--color-dark-1)] truncate">
                    Visuels à créer <span className="font-normal text-[var(--color-dark-text-2)]">· Marketing</span>
                  </p>
                  <span className="text-[11px] font-bold font-body px-2 py-0.5 rounded-full bg-[var(--color-light-1)] text-[var(--color-dark-text-2)] tabular-nums">{data.visuels_a_creer.length}</span>
                </button>
                {(openGroups['__visuels__'] ?? false) && (
                  <div className="bg-[var(--color-light-1)] border-t border-[var(--color-light-border)]">
                    {data.visuels_a_creer.map(p => (
                      <div key={p.id} className="flex items-center gap-3 px-6 py-2.5 border-b border-[var(--color-light-border)] last:border-0 group/item hover:bg-[#fff8f6] transition-colors">
                        <input type="checkbox" checked={false} onChange={() => toggleVisuel(p.id)} className="w-3.5 h-3.5 cursor-pointer flex-shrink-0 accent-[var(--color-brand)]" />
                        <p className="flex-1 min-w-0 text-xs font-body text-[var(--color-dark-1)] truncate">{p.titre} <span className="text-[var(--color-dark-text-2)]">· {formatDate(p.date_publication)}</span></p>
                        <Link href="/admin/marketing" className="transition-opacity opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/item:opacity-100 focus-visible:!opacity-100 text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)]">
                          <span aria-hidden="true" className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* À publier */}
            {data.a_publier.length > 0 && (
              <div className="border-t border-[var(--color-light-border)]">
                <button onClick={() => toggleGroup('__publier__')}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#fff8f6] transition-colors text-left">
                  <span aria-hidden="true" className="material-symbols-outlined text-[14px] text-[var(--color-dark-text-2)] transition-transform duration-150 flex-shrink-0"
                    style={{ transform: (openGroups['__publier__'] ?? false) ? 'rotate(90deg)' : 'rotate(0deg)' }}>chevron_right</span>
                  <p className="flex-1 text-sm font-body font-semibold text-[var(--color-dark-1)] truncate">
                    À publier <span className="font-normal text-[var(--color-dark-text-2)]">· Marketing</span>
                  </p>
                  <span className="text-[11px] font-bold font-body px-2 py-0.5 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success-text)] tabular-nums">{data.a_publier.length}</span>
                </button>
                {(openGroups['__publier__'] ?? false) && (
                  <div className="bg-[var(--color-light-1)] border-t border-[var(--color-light-border)]">
                    {data.a_publier.map(p => (
                      <div key={p.id} className="flex items-center gap-3 px-6 py-2.5 border-b border-[var(--color-light-border)] last:border-0 group/item hover:bg-[#fff8f6] transition-colors">
                        <input type="checkbox" checked={false} onChange={() => togglePublier(p.id)} className="w-3.5 h-3.5 cursor-pointer flex-shrink-0 accent-emerald-500" />
                        <p className="flex-1 min-w-0 text-xs font-body text-[var(--color-dark-1)] truncate">{p.titre} <span className="text-[var(--color-dark-text-2)]">· {formatDate(p.date_publication)}</span></p>
                        <Link href="/admin/marketing" className="transition-opacity opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/item:opacity-100 focus-visible:!opacity-100 text-[var(--color-dark-text-2)] hover:text-[var(--color-success)]">
                          <span aria-hidden="true" className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {todosActifs.length === 0 && data.visuels_a_creer.length === 0 && data.a_publier.length === 0 && !addingTodo && (
              <p className="text-sm text-[var(--color-dark-text-2)] font-body italic px-5 py-4">Aucune tâche en cours.</p>
            )}
          </div>

          {/* Tâches complétées — groupées par projet */}
          {todosCochs.length > 0 && (
            <div className="bg-[#faf7f3] border-t border-[var(--color-light-border)]">
              <button onClick={() => toggleGroup('__done__')} className="flex items-center gap-2 px-5 py-3 w-full text-left hover:bg-[#fff8f6] transition-colors">
                <span aria-hidden="true" className="material-symbols-outlined text-[14px] text-[var(--color-dark-text-2)] transition-transform duration-150"
                  style={{ transform: (openGroups['__done__'] ?? false) ? 'rotate(90deg)' : 'rotate(0deg)' }}>chevron_right</span>
                <p className="text-[11px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">
                  Complétées ({todosCochs.length})
                </p>
              </button>
              {(openGroups['__done__'] ?? false) && (() => {
                const doneGroups = groupByProject(todosCochs)
                return (
                  <div className="border-t border-[var(--color-light-border)]">
                    {Object.entries(doneGroups).map(([groupKey, group], idx, arr) => {
                      const key = `__done_${groupKey}__`
                      const isOpen = openGroups[key] ?? false
                      const nomCourt = group.kind !== 'personnel'
                        ? group.label.replace(/^\d{4}-\d{2}-\d{2} — /, '')
                        : 'Personnel'
                      return (
                        <div key={groupKey} className={idx < arr.length - 1 ? 'border-b border-[var(--color-light-border)]' : ''}>
                          <button onClick={() => toggleGroup(key)}
                            className="w-full flex items-center gap-3 px-5 py-2.5 bg-[var(--color-light-1)] hover:bg-[#fff8f6] transition-colors text-left opacity-60">
                            <span aria-hidden="true" className="material-symbols-outlined text-[13px] text-[var(--color-dark-text-2)] transition-transform duration-150 flex-shrink-0"
                              style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>chevron_right</span>
                            <p className="flex-1 min-w-0 text-xs font-body font-semibold text-[var(--color-dark-text-2)] truncate line-through">
                              {nomCourt}
                              {group.client_nom && group.kind !== 'client' && <span className="font-normal ml-1.5">· {group.client_nom}</span>}
                            </p>
                            <span className="text-[10px] font-body text-[var(--color-dark-text-2)] tabular-nums flex-shrink-0">
                              {group.todos.length}
                            </span>
                          </button>
                          {isOpen && (
                            <div className="bg-white border-t border-[var(--color-light-border)]">
                              {group.todos.map(todo => (
                                <div key={todo.id} className="flex items-center gap-3 px-6 py-2 border-b border-[var(--color-light-border)] last:border-0 opacity-50 group/item hover:opacity-75 transition-opacity">
                                  <input type="checkbox" checked={true} onChange={() => toggleTodo(todo.id)} className="w-3.5 h-3.5 cursor-pointer flex-shrink-0 accent-[var(--color-brand)]" />
                                  <p className="flex-1 min-w-0 text-xs text-[var(--color-dark-text-2)] font-body line-through truncate">{todo.texte}</p>
                                  <button onClick={() => deleteTodo(todo.id)}
                                    className="transition-opacity opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/item:opacity-100 focus-visible:!opacity-100 text-[var(--color-dark-text-2)] hover:text-[var(--color-error)] p-1.5 -m-1 flex-shrink-0">
                                    <span aria-hidden="true" className="material-symbols-outlined text-[13px]">close</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          )}
          </>}
          </div>

          {/* Projets récents */}
          <div className="rounded-[18px] overflow-hidden"
            style={{ background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)' }}>
            <div className="flex justify-between items-center px-5 py-4" style={{ borderBottom: '1px solid var(--color-light-border)' }}>
              <h2 className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-dark-1)]">Projets récents</h2>
              <Link href="/admin/projets" className="text-[10px] font-bold uppercase text-[var(--color-brand)] hover:underline font-body tracking-wide">
                Voir tout
              </Link>
            </div>
            <div>
              {data.projets_recents.map(p => {
                const badge = BADGE_STYLES[p.statut] ?? BADGE_FALLBACK
                const dotColor = BADGE_DOTS[p.statut] ?? badge.color
                return (
                  <Link key={p.id} href={`/admin/projet/${p.id}`}
                    className="rowh flex items-center gap-3 py-3 px-5 last:border-b-0"
                    style={{ borderBottom: '1px solid var(--color-light-border)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[var(--color-dark-1)] truncate font-body">{p.client_nom}</p>
                      <p className="text-xs truncate font-body" style={{ color: 'var(--color-light-text-3)' }}>{p.nom_projet}</p>
                    </div>
                    <span className="font-body flex-shrink-0"
                      style={{ background: badge.bg, color: badge.color, fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', padding: '4px 10px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                      {p.statut}
                    </span>
                    <span className="text-xs flex-shrink-0 tabular-nums" style={{ color: 'var(--color-light-text-3)' }}>
                      {p.date_livraison_estimee
                        ? new Date(p.date_livraison_estimee).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' })
                        : '—'}
                    </span>
                  </Link>
                )
              })}
              {data.projets_recents.length === 0 && (
                <p className="text-sm font-body italic px-5 py-4" style={{ color: 'var(--color-light-text-3)' }}>Aucun projet récent.</p>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite — rail fixe */}
        <div className="flex flex-col gap-5 xl:sticky xl:top-4 self-start" style={{ position: 'sticky', top: '26px', alignSelf: 'start' }}>

          {/* Widget 1 — Action requise */}
          {data.en_revision > 0 && (
            <div className="rounded-[18px] p-5"
              style={{ background: 'var(--color-light-2)', border: '1px solid color-mix(in oklch, var(--color-brand) 40%, var(--color-light-border))' }}>
              <div className="flex items-center gap-2 mb-2">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]" style={{ color: 'var(--color-error)' }}>priority_high</span>
                <h3 className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-dark-1)]">Action requise</h3>
              </div>
              <p className="text-sm font-body mb-4" style={{ color: 'var(--color-dark-text-2)' }}>
                {data.en_revision} projet{data.en_revision > 1 ? 's' : ''} en révision
              </p>
              <Link href="/admin/projets?statut=En+r%C3%A9vision"
                className="flex items-center justify-center gap-2 font-display transition-opacity hover:opacity-90"
                style={{ background: 'var(--color-brand)', color: 'white', borderRadius: '11px', padding: '11px', width: '100%', fontSize: '13px' }}>
                Ouvrir la file de révision
              </Link>
            </div>
          )}

          {/* Widget 2 — Factures ouvertes */}
          <div className="rounded-[18px] p-5"
            style={{ background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]" style={{ color: 'var(--color-warning)' }}>receipt_long</span>
              <h3 className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-dark-1)]">Factures ouvertes</h3>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-body" style={{ color: 'var(--color-light-text-3)' }}>— Aucune donnée disponible</p>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--color-light-border)' }}>
              <span className="text-[10px] font-bold uppercase tracking-widest font-body" style={{ color: 'var(--color-light-text-3)' }}>Total à recevoir</span>
              <span className="font-display font-extrabold text-[var(--color-dark-1)]">— $</span>
            </div>
          </div>

          {/* Widget 3 — Top clients */}
          <div>
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-dark-1)] mb-3">Top clients</h3>
            <div className="flex flex-col gap-2">
              {data.top_clients.map((client, index) => (
                <Link key={client.id} href={`/admin/client/${client.id}`}>
                  <div className="rowh rounded-[14px] py-3 px-4 flex items-center justify-between gap-3"
                    style={{ background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)' }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold font-display text-sm shrink-0"
                        style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>
                        {client.initiales}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-dark-1)] leading-tight font-body truncate">{client.nom_complet}</p>
                        <p className="text-xs font-body truncate" style={{ color: 'var(--color-light-text-3)' }}>{client.nom_entreprise}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {client.nb_projets != null && (
                        <span className="font-body tabular-nums" style={{ fontSize: '12px', color: 'var(--color-light-text-3)' }}>{client.nb_projets} proj.</span>
                      )}
                      <span aria-hidden="true" className="material-symbols-outlined text-[16px]" style={{ color: 'var(--color-light-text-3)' }}>chevron_right</span>
                    </div>
                  </div>
                </Link>
              ))}
              {data.top_clients.length === 0 && (
                <p className="text-xs font-body italic" style={{ color: 'var(--color-light-text-3)' }}>Aucun client.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Webhook Google Agenda */}
      <div className="mt-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid var(--color-light-border)' }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[var(--color-brand)] text-[22px]">sync</span>
              <div>
                <p className="text-sm font-bold text-[var(--color-dark-1)] font-body">Sync Google Agenda → Portail</p>
                {webhookStatus === null && (
                  <p className="text-xs text-[var(--color-dark-text-2)] font-body">Chargement…</p>
                )}
                {webhookStatus && !webhookStatus.active && (
                  <p className="text-xs text-red-500 font-body font-semibold">Inactif — les réservations Google Agenda ne se synchronisent pas</p>
                )}
                {webhookStatus?.active && (
                  <p className={`text-xs font-body ${webhookStatus.expires_soon ? 'text-orange-500 font-semibold' : 'text-[var(--color-dark-text-2)]'}`}>
                    Actif{webhookStatus.expiration ? ` · expire le ${webhookStatus.expiration}` : ''}
                    {webhookStatus.expires_soon ? ' · renouveler bientôt' : ''}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleRegisterWebhook}
              disabled={registeringWebhook}
              className="text-xs font-bold font-body uppercase tracking-wide px-4 py-2 rounded-lg bg-[var(--color-brand)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {registeringWebhook ? 'Activation…' : webhookStatus?.active ? 'Renouveler' : 'Activer'}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
