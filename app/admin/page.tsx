'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Users, FolderOpen, AlertTriangle, Archive, ChevronDown, ChevronRight } from 'lucide-react'

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
}

interface TodoPerso {
  id: number
  texte: string
  est_coche: number
  is_titre: number
  parent_titre_id: number | null
  priorite: string
  date_echeance: string | null
  calendar_event_id: string | null
  projet_id: number | null
  projet_nom: string | null
  client_nom: string | null
  client_id?: number | null
  client_id_effectif?: number | null
  source?: string | null
  created_at: string
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

const STATUT_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'Documents à donner': { bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-500' },
  'Documents reçus':    { bg: 'bg-blue-50',   text: 'text-blue-600',   dot: 'bg-blue-500' },
  'Travaux en cours':   { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500' },
  'En révision':        { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  'Travaux terminés':   { bg: 'bg-green-50',  text: 'text-green-600',  dot: 'bg-green-500' },
  'Annulé':             { bg: 'bg-gray-100',  text: 'text-gray-500',   dot: 'bg-gray-400' },
}

const PRIORITE_COLORS: Record<string, string> = {
  haute:   'bg-red-100 text-red-600',
  normale: 'bg-orange-50 text-orange-500',
  basse:   'bg-gray-100 text-gray-500',
}

function groupByProject(list: TodoPerso[]) {
  const groups: Record<string, { todos: TodoPerso[]; client_nom: string | null }> = {}
  for (const todo of list) {
    const key = todo.projet_nom
      || (todo.client_nom ? `👤 ${todo.client_nom}` : (todo.source === 'todoist' ? '📥 Todoist' : '— Personnel'))
    if (!groups[key]) groups[key] = { todos: [], client_nom: todo.client_nom ?? null }
    groups[key].todos.push(todo)
  }
  return groups
}

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' }).toUpperCase()
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

function AssignMenu({ currentProjetId, currentClientId, currentTitreId, clients, projets, titres, isOpen, onToggle, onAssign }: {
  currentProjetId: number | null
  currentClientId: number | null
  currentTitreId?: number | null
  clients: { id: number; nom_complet: string }[]
  projets: { id: number; nom_projet: string; client_nom: string | null }[]
  titres?: { id: number; texte: string }[]
  isOpen: boolean
  onToggle: () => void
  onAssign: (payload: { client_id?: number | null; projet_id?: number | null; parent_titre_id?: number | null }) => void
}) {
  const clientSeul = !currentProjetId && currentClientId ? String(currentClientId) : ''
  const { btnRef, coords } = useAnchoredCoords(isOpen, titres && titres.length ? 260 : 190, 256)
  return (
    <div className="relative flex-shrink-0">
      <button ref={btnRef} onClick={onToggle} title="Assigner à un client / projet"
        className={`transition-opacity flex-shrink-0 p-1.5 -m-1 hover:text-[var(--color-brand)] ${isOpen ? 'opacity-100 text-[var(--color-brand)]' : 'text-[var(--color-dark-text-2)] opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/row:opacity-100 [@media(hover:hover)]:group-hover/item:opacity-100 focus-visible:!opacity-100'}`}>
        <span aria-hidden="true" className="material-symbols-outlined text-[14px]">sell</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onToggle} />
          <div className="fixed z-50 w-64 bg-white border border-[var(--color-light-border)] rounded-md shadow-lg p-3 space-y-3 text-left"
            style={{ top: coords.top, left: coords.left }}>
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

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>(MOCK_DATA)
  const [todos, setTodos] = useState<TodoPerso[]>([])
  const [clients, setClients] = useState<{ id: number; nom_complet: string }[]>([])
  const [projets, setProjets] = useState<{ id: number; nom_projet: string; client_nom: string | null; is_archived?: number }[]>([])
  const [assignOpen, setAssignOpen] = useState<number | null>(null)
  const [groupAssignOpen, setGroupAssignOpen] = useState<string | null>(null)
  const [scheduleOpen, setScheduleOpen] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [editGroupText, setEditGroupText] = useState('')

  function showError(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  async function renameProject(projetId: number, nom: string, oldKey: string) {
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
      setOpenGroups(prev => ({ ...prev, [clean]: prev[oldKey] ?? false }))
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
    fetch(`${API}/api/v1/admin/todos`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => Array.isArray(d) ? setTodos(d) : null)
      .catch(() => {})
  }, [])

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
  function applyAssign(t: TodoPerso, payload: { client_id?: number | null; projet_id?: number | null; parent_titre_id?: number | null }): TodoPerso {
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
    return next
  }

  async function assignTodo(id: number, payload: { client_id?: number | null; projet_id?: number | null; parent_titre_id?: number | null }) {
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
      <section className="mb-8">
        <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-[var(--color-dark-1)] mb-0.5">
          Bonjour, Félix.
        </h1>
        <p className="text-xs text-[var(--color-dark-text-2)] font-body uppercase tracking-widest">
          Tableau de bord · Cocktail Média
        </p>
      </section>

      {/* Mes tâches */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid var(--color-light-border)' }}>

          {/* Header */}
          <button
            onClick={() => setTachesOpen(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 bg-[#faf7f3] border-b border-[#e0d9d3] hover:bg-[#fff8f6] transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              {tachesOpen
                ? <ChevronDown aria-hidden="true" className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
                : <ChevronRight aria-hidden="true" className="w-4 h-4 text-[var(--color-brand)] shrink-0" />}
              <h3 className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-dark-1)]">Mes tâches</h3>
              {todosActifs.length > 0 && (
                <span className="text-[10px] tracking-wide font-bold font-body bg-[var(--color-brand)] text-white px-2 py-0.5 rounded-full">
                  {todosActifs.length}
                </span>
              )}
            </div>
            <button
              onClick={e => { e.stopPropagation(); setAddingTodo(v => !v); setTimeout(() => inputRef.current?.focus(), 50) }}
              className="text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] transition-colors p-1">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">add_circle</span>
            </button>
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
            {Object.entries(activeGroups).map(([projetNom, group], idx, arr) => {
              const isOpen = openGroups[projetNom] ?? false
              const isProjet = projetNom !== '— Personnel'
              const isRealProjet = isProjet && !projetNom.startsWith('👤') && !projetNom.startsWith('📥')
              const taches = group.todos.filter(t => !t.is_titre)
              const done = taches.filter(t => t.est_coche).length
              const total = taches.length
              const nomCourt = isProjet ? projetNom.replace(/^\d{4}-\d{2}-\d{2} — /, '') : 'Personnel'
              const badgeColor = (isRealProjet || group.client_nom)
                ? 'bg-[#fff0eb] border border-[#f5c4a0] text-[#c0521a]'
                : 'bg-gray-100 border border-gray-200 text-gray-500'
              return (
                <div key={projetNom} className={idx < arr.length - 1 ? 'border-b border-[var(--color-light-border)]' : ''}>
                  <div className="flex items-center pr-3 hover:bg-[#fff8f6] transition-colors group group/row">
                    {editingGroup === projetNom ? (
                      <div className="flex-1 min-w-0 flex items-center gap-3 px-5 py-3">
                        <span aria-hidden="true" className="material-symbols-outlined text-[14px] text-[var(--color-dark-text-2)] flex-shrink-0">chevron_right</span>
                        <input autoFocus value={editGroupText} onChange={e => setEditGroupText(e.target.value)}
                          onBlur={() => renameProject(group.todos[0]!.projet_id!, editGroupText, projetNom)}
                          onKeyDown={e => { if (e.key === 'Enter') renameProject(group.todos[0]!.projet_id!, editGroupText, projetNom); if (e.key === 'Escape') setEditingGroup(null) }}
                          aria-label="Renommer le projet"
                          className="flex-1 min-w-0 text-sm font-body font-semibold bg-transparent outline-none border-b border-[var(--color-brand)] pb-0.5" />
                      </div>
                    ) : (
                      <button onClick={() => toggleGroup(projetNom)}
                        className="flex-1 min-w-0 flex items-center gap-3 px-5 py-3 text-left">
                        <span aria-hidden="true" className="material-symbols-outlined text-[14px] text-[var(--color-dark-text-2)] group-hover:text-[var(--color-brand)] transition-transform duration-150 flex-shrink-0"
                          style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                          chevron_right
                        </span>
                        <p className={`flex-1 min-w-0 text-sm font-body font-semibold truncate group-hover:text-[var(--color-dark-1)] group-hover:font-semibold ${isProjet ? 'text-[var(--color-dark-1)]' : 'text-[var(--color-dark-text-2)]'}`}>
                          {nomCourt}
                          {group.client_nom && !projetNom.startsWith('👤') && <span className="font-normal text-[var(--color-dark-text-2)] ml-1.5">· {group.client_nom}</span>}
                        </p>
                        <span className={`text-[11px] font-bold font-body px-2 py-0.5 rounded-full flex-shrink-0 tabular-nums group-hover:text-[var(--color-brand)] ${badgeColor}`}>
                          {done}/{total}
                        </span>
                      </button>
                    )}
                    {isRealProjet && editingGroup !== projetNom && (
                      <button onClick={() => { setEditingGroup(projetNom); setEditGroupText(nomCourt) }} title="Renommer le projet"
                        className="transition-opacity opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/row:opacity-100 focus-visible:!opacity-100 text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] p-1.5 -m-1 flex-shrink-0">
                        <span aria-hidden="true" className="material-symbols-outlined text-[14px]">edit</span>
                      </button>
                    )}
                    {!isRealProjet && (
                      <AssignMenu
                        currentProjetId={group.todos[0]?.projet_id ?? null}
                        currentClientId={group.todos.find(t => t.client_id_effectif)?.client_id_effectif ?? null}
                        clients={clients} projets={projets}
                        isOpen={groupAssignOpen === projetNom}
                        onToggle={() => setGroupAssignOpen(groupAssignOpen === projetNom ? null : projetNom)}
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
                                      currentProjetId={t.projet_id}
                                      currentClientId={t.client_id_effectif ?? null}
                                      currentTitreId={t.parent_titre_id}
                                      clients={clients} projets={projets} titres={titres}
                                      isOpen={assignOpen === t.id}
                                      onToggle={() => setAssignOpen(assignOpen === t.id ? null : t.id)}
                                      onAssign={(payload) => assignTodo(t.id, payload)} />
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
                                currentProjetId={todo.projet_id}
                                currentClientId={todo.client_id_effectif ?? null}
                                currentTitreId={todo.parent_titre_id}
                                clients={clients} projets={projets} titres={titres}
                                isOpen={assignOpen === todo.id}
                                onToggle={() => setAssignOpen(assignOpen === todo.id ? null : todo.id)}
                                onAssign={(payload) => assignTodo(todo.id, payload)} />
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
                    {Object.entries(doneGroups).map(([projetNom, group], idx, arr) => {
                      const key = `__done_${projetNom}__`
                      const isOpen = openGroups[key] ?? false
                      const nomCourt = projetNom !== '— Personnel'
                        ? projetNom.replace(/^\d{4}-\d{2}-\d{2} — /, '')
                        : 'Personnel'
                      return (
                        <div key={projetNom} className={idx < arr.length - 1 ? 'border-b border-[var(--color-light-border)]' : ''}>
                          <button onClick={() => toggleGroup(key)}
                            className="w-full flex items-center gap-3 px-5 py-2.5 bg-[var(--color-light-1)] hover:bg-[#fff8f6] transition-colors text-left opacity-60">
                            <span aria-hidden="true" className="material-symbols-outlined text-[13px] text-[var(--color-dark-text-2)] transition-transform duration-150 flex-shrink-0"
                              style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>chevron_right</span>
                            <p className="flex-1 min-w-0 text-xs font-body font-semibold text-[var(--color-dark-text-2)] truncate line-through">
                              {nomCourt}
                              {group.client_nom && <span className="font-normal ml-1.5">· {group.client_nom}</span>}
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
      </section>

      {/* Stats */}
      <section className="mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {/* Total clients */}
          <Card className="bg-white rounded-xl gap-0 py-0 border border-[#e0d9d3] border-t-4 border-t-gray-200 shadow-sm">
            <CardContent className="p-4 flex flex-col gap-1.5">
              <div className="flex justify-between items-start">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-body">Total Clients</p>
                <Users aria-hidden="true" className="w-4 h-4 text-gray-500 shrink-0" />
              </div>
              <p className="text-4xl leading-none text-[var(--color-dark-1)] font-display">{data.total_clients}</p>
            </CardContent>
          </Card>
          {/* Actifs */}
          <Card className="bg-white rounded-xl gap-0 py-0 border border-[#e0d9d3] border-t-4 border-t-blue-500 shadow-sm">
            <CardContent className="p-4 flex flex-col gap-1.5">
              <div className="flex justify-between items-start">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-body">Actifs</p>
                <FolderOpen aria-hidden="true" className="w-4 h-4 text-blue-500 shrink-0" />
              </div>
              <p className="text-4xl leading-none text-[var(--color-dark-1)] font-display">{data.projets_actifs}</p>
              <p className="text-xs text-gray-500 font-body">projets en cours</p>
            </CardContent>
          </Card>
          {/* En révision / Action */}
          <Card className="bg-white rounded-xl gap-0 py-0 border border-[#e0d9d3] border-t-4 border-t-[var(--color-brand)] shadow-sm">
            <CardContent className="p-4 flex flex-col gap-1.5">
              <div className="flex justify-between items-start">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-body">En révision</p>
                <AlertTriangle aria-hidden="true" className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
              </div>
              <p className="text-4xl leading-none text-[var(--color-brand)] font-display">{String(data.en_revision).padStart(2, '0')}</p>
              <p className="text-xs text-gray-500 font-body">nécessitent attention</p>
            </CardContent>
          </Card>
          {/* Archivés */}
          <Card className="bg-white rounded-xl gap-0 py-0 border border-[#e0d9d3] border-t-4 border-t-gray-200 shadow-sm">
            <CardContent className="p-4 flex flex-col gap-1.5">
              <div className="flex justify-between items-start">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-body">Archivés</p>
                <Archive aria-hidden="true" className="w-4 h-4 text-gray-500 shrink-0" />
              </div>
              <p className="text-4xl leading-none text-[var(--color-dark-1)] font-display">{data.archives}</p>
              <p className="text-xs text-gray-500 font-body">projets fermés</p>
            </CardContent>
          </Card>
        </div>

        {/* Répartition des projets */}
        {(() => {
          const repartition = Object.keys(STATUT_STYLES)
            .map(s => ({ statut: s, count: data.projets_recents.filter(p => p.statut === s).length, style: STATUT_STYLES[s] }))
            .filter(x => x.count > 0)
          const total = repartition.reduce((sum, x) => sum + x.count, 0)
          return (
            <Card className="bg-white rounded-xl gap-0 py-0 border border-[#e0d9d3] border-t-4 border-t-gray-200 shadow-sm">
              <CardContent className="p-4 flex flex-col gap-3">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-body">Répartition des projets</p>
                <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                  {total === 0
                    ? null
                    : repartition.map(x => (
                        <div key={x.statut} className={x.style.dot} style={{ flexGrow: x.count }} title={`${x.statut} · ${x.count}`} />
                      ))}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {total === 0
                    ? <p className="text-xs text-gray-500 font-body">Aucun projet.</p>
                    : repartition.map(x => (
                        <div key={x.statut} className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${x.style.dot}`} />
                          <span className="text-xs text-gray-500 font-body">{x.statut}</span>
                          <span className="text-xs font-bold text-[var(--color-dark-1)] tabular-nums">{x.count}</span>
                        </div>
                      ))}
                </div>
              </CardContent>
            </Card>
          )
        })()}
      </section>

      {/* Projets + Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Projets récents */}
        <div className="xl:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-dark-1)]">Projets Récents</h2>
            <Link href="/admin/projets" className="text-[10px] font-bold uppercase text-[var(--color-brand)] hover:underline font-body tracking-wide">
              Voir tout
            </Link>
          </div>
          <div className="bg-white rounded-xl overflow-hidden">
            {data.projets_recents.map(p => {
              const style = STATUT_STYLES[p.statut] || STATUT_STYLES['Annulé']
              return (
                <Link key={p.id} href={`/admin/projet/${p.id}`}
                  className="row-hover-group flex justify-between items-start gap-4 py-3 px-5 border-b border-[#e0d9d3] last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <p className="row-title font-semibold text-sm text-[var(--color-dark-1)] truncate">{p.client_nom}</p>
                    <p className="row-desc text-xs text-gray-500 truncate">{p.nom_projet}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`row-badge inline-flex items-center gap-1.5 px-2 py-1 ${style.bg} ${style.text} text-[10px] font-bold rounded-full uppercase font-body whitespace-nowrap`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} flex-shrink-0`} />
                      {p.statut}
                    </span>
                    <span className="row-desc text-xs text-gray-500">
                      {p.date_livraison_estimee
                        ? new Date(p.date_livraison_estimee).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' })
                        : '—'}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 flex flex-col gap-5">

          {/* Top clients */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-dark-1)]">Top Clients</h2>
              <Link href="/admin/clients">
                <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-1)] text-[20px]">add_circle</span>
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {data.top_clients.map(client => (
                <Link key={client.id} href={`/admin/client/${client.id}`}>
                  <div className="row-hover-group bg-white rounded-xl py-3 px-4 flex items-center justify-between gap-3 border border-[#e0d9d3] cursor-pointer">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full ${client.couleur} flex items-center justify-center text-white font-bold font-display text-sm shrink-0`}>
                        {client.initiales}
                      </div>
                      <div className="min-w-0">
                        <p className="row-title text-sm font-semibold text-[var(--color-dark-1)] leading-tight font-body truncate">{client.nom_complet}</p>
                        <p className="row-desc text-xs text-gray-500 font-body truncate">{client.nom_entreprise}</p>
                      </div>
                    </div>
                    <span aria-hidden="true" className="row-chevron material-symbols-outlined text-gray-300 text-[16px] shrink-0 transition-[color,transform] duration-150">chevron_right</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Liens rapides */}
          <div className="grid grid-cols-3 gap-2">
            <Link href="/admin/marketing"
              className="group relative bg-white rounded-xl p-3.5 flex flex-col items-center gap-1.5 hover:bg-[#fff8f6] transition-all text-center" style={{ border: '1px solid var(--color-light-border)' }}>
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)] group-hover:text-[var(--color-brand-hover)] group-hover:scale-110 text-[22px] transition-all duration-150">campaign</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-dark-1)] font-body group-hover:text-[var(--color-dark-1)]">Marketing</span>
              <span aria-hidden="true" className="absolute bottom-2 right-2 text-gray-300 text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-[var(--color-brand)] transition-all duration-150">→</span>
            </Link>
            <Link href="/admin/factures"
              className="group relative bg-white rounded-xl p-3.5 flex flex-col items-center gap-1.5 hover:bg-[#fff8f6] transition-all text-center" style={{ border: '1px solid var(--color-light-border)' }}>
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)] group-hover:text-[var(--color-brand-hover)] group-hover:scale-110 text-[22px] transition-all duration-150">receipt_long</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-dark-1)] font-body group-hover:text-[var(--color-dark-1)]">Facturation</span>
              <span aria-hidden="true" className="absolute bottom-2 right-2 text-gray-300 text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-[var(--color-brand)] transition-all duration-150">→</span>
            </Link>
            <Link href="/admin/soumissions"
              className="group relative bg-white rounded-xl p-3.5 flex flex-col items-center gap-1.5 hover:bg-[#fff8f6] transition-all text-center" style={{ border: '1px solid var(--color-light-border)' }}>
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)] group-hover:text-[var(--color-brand-hover)] group-hover:scale-110 text-[22px] transition-all duration-150">description</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-dark-1)] font-body group-hover:text-[var(--color-dark-1)]">Soumissions</span>
              <span aria-hidden="true" className="absolute bottom-2 right-2 text-gray-300 text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-[var(--color-brand)] transition-all duration-150">→</span>
            </Link>
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
