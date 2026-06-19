'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

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

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>(MOCK_DATA)
  const [todos, setTodos] = useState<TodoPerso[]>([])
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

  async function toggleTodo(id: number) {
    const res = await fetch(`${API}/api/v1/admin/todos/${id}/toggle`, { method: 'POST', credentials: 'include' })
    if (res.ok) {
      const { est_coche } = await res.json()
      setTodos(prev => prev.map(t => t.id === id ? { ...t, est_coche: est_coche ? 1 : 0 } : t))
    }
  }

  async function deleteTodo(id: number) {
    const res = await fetch(`${API}/api/v1/admin/todos/${id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) setTodos(prev => prev.filter(t => t.id !== id))
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

  const todosActifs = todos.filter(t => !t.est_coche || t.is_titre)
  const todosCochs = todos.filter(t => t.est_coche && !t.is_titre && !t.parent_titre_id)

  function toggleGroup(key: string) {
    setOpenGroups(prev => ({ ...prev, [key]: !(prev[key] ?? false) }))
  }

  function groupByProject(list: TodoPerso[]) {
    const groups: Record<string, { todos: TodoPerso[]; client_nom: string | null }> = {}
    for (const todo of list) {
      const key = todo.projet_nom || '— Personnel'
      if (!groups[key]) groups[key] = { todos: [], client_nom: todo.client_nom ?? null }
      groups[key].todos.push(todo)
    }
    return groups
  }

  const activeGroups = groupByProject(todosActifs)

  return (
    <div>

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
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--color-light-1)] transition-colors text-left"
            style={{ borderBottom: tachesOpen ? '1px solid var(--color-light-border)' : 'none' }}
          >
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)] text-[18px] transition-transform duration-200"
                style={{ fontVariationSettings: "'FILL' 1", transform: tachesOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                expand_more
              </span>
              <h3 className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-dark-1)]">Mes tâches</h3>
              {todosActifs.length > 0 && (
                <span className="text-[10px] font-bold font-body bg-[var(--color-brand)] text-white px-2 py-0.5 rounded-full">
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
                      placeholder="Tâche…"
                      className="flex-1 bg-white rounded px-2 py-1.5 text-xs outline-none border border-[var(--color-light-border-2)] focus:border-[var(--color-brand)]"
                    />
                    {newTaches.length > 1 && (
                      <button onClick={() => setNewTaches(p => p.filter((_, j) => j !== i))} className="text-[#ccc] hover:text-red-400">
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
              const taches = group.todos.filter(t => !t.is_titre)
              const done = taches.filter(t => t.est_coche).length
              const total = taches.length
              const nomCourt = isProjet ? projetNom.replace(/^\d{4}-\d{2}-\d{2} — /, '') : 'Personnel'
              const badgeColor = done === total && total > 0
                ? 'bg-emerald-100 text-emerald-700'
                : done > 0
                ? 'bg-[var(--color-brand)]/10 text-[var(--color-brand)]'
                : 'bg-[var(--color-light-1)] text-[var(--color-dark-text-2)]'
              return (
                <div key={projetNom} className={idx < arr.length - 1 ? 'border-b border-[var(--color-light-border)]' : ''}>
                  <button onClick={() => toggleGroup(projetNom)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--color-light-1)] transition-colors text-left group/row">
                    <span aria-hidden="true" className="material-symbols-outlined text-[14px] text-[var(--color-dark-text-2)] transition-transform duration-150 flex-shrink-0"
                      style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                      chevron_right
                    </span>
                    <p className={`flex-1 min-w-0 text-sm font-body font-semibold truncate ${isProjet ? 'text-[var(--color-dark-1)]' : 'text-[var(--color-dark-text-2)]'}`}>
                      {nomCourt}
                      {group.client_nom && <span className="font-normal text-[var(--color-dark-text-2)] ml-1.5">· {group.client_nom}</span>}
                    </p>
                    <span className={`text-[11px] font-bold font-body px-2 py-0.5 rounded-full flex-shrink-0 tabular-nums ${badgeColor}`}>
                      {done}/{total}
                    </span>
                  </button>
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
                                  <p className="flex-1 min-w-0 text-[11px] font-display font-bold uppercase tracking-widest text-[var(--color-dark-text-2)]">
                                    {todo.texte}
                                  </p>
                                  {enfants.length > 0 && (
                                    <span className="text-[10px] font-body text-[var(--color-dark-text-2)] tabular-nums">{doneEnf}/{enfants.length}</span>
                                  )}
                                  <div className="opacity-0 group-hover/titre:opacity-100 transition-opacity flex-shrink-0">
                                    <PrioritePicker value={todo.priorite ?? 'normale'} onChange={p => updatePriorite(todo.id, p)} />
                                  </div>
                                  <button onClick={() => { setInlineAdd(todo.id); setInlineText('') }}
                                    className="opacity-0 group-hover/titre:opacity-100 transition-opacity text-[var(--color-brand)] flex-shrink-0">
                                    <span aria-hidden="true" className="material-symbols-outlined text-[14px]">add</span>
                                  </button>
                                  <button onClick={() => deleteTodo(todo.id)}
                                    className="opacity-0 group-hover/titre:opacity-100 transition-opacity text-[#ccc] hover:text-red-400 flex-shrink-0">
                                    <span aria-hidden="true" className="material-symbols-outlined text-[13px]">close</span>
                                  </button>
                                </div>
                                {/* Tâches enfants */}
                                {enfants.map(t => (
                                  <div key={t.id} className="flex items-center gap-2.5 px-7 py-2 border-b border-[var(--color-light-border)] last:border-0 group/item hover:bg-[var(--color-light-1)] transition-colors">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITE[(t.priorite as keyof typeof PRIORITE) ?? 'normale']?.dot ?? 'bg-orange-400'} ${t.est_coche ? 'opacity-30' : ''}`} />
                                    <input type="checkbox" checked={!!t.est_coche} onChange={() => toggleTodo(t.id)}
                                      className="w-3.5 h-3.5 cursor-pointer flex-shrink-0 accent-[var(--color-brand)]" />
                                    <p className={`flex-1 min-w-0 text-xs font-body leading-snug ${t.est_coche ? 'line-through text-[var(--color-dark-text-2)]' : 'text-[var(--color-dark-1)]'}`}>
                                      {t.texte}
                                      {t.calendar_event_id && <span aria-hidden="true" className="ml-1.5 material-symbols-outlined text-[10px] text-[var(--color-brand)] align-middle">calendar_month</span>}
                                    </p>
                                    <button onClick={() => deleteTodo(t.id)}
                                      className="opacity-0 group-hover/item:opacity-100 transition-opacity text-[#ccc] hover:text-red-400 flex-shrink-0">
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
                                        placeholder="Nouvelle tâche…"
                                        className="flex-1 text-xs bg-transparent outline-none border-b border-[var(--color-brand)] pb-0.5" />
                                      <button onClick={() => setInlineAgenda(v => !v)}
                                        title="Ajouter à l'agenda"
                                        className={`flex-shrink-0 transition-colors ${inlineAgenda ? 'text-[var(--color-brand)]' : 'text-[#ccc] hover:text-[var(--color-dark-text-2)]'}`}>
                                        <span aria-hidden="true" className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                                      </button>
                                      <button onClick={() => addInlineTask(todo.id)} className="text-[var(--color-brand)] flex-shrink-0">
                                        <span aria-hidden="true" className="material-symbols-outlined text-[15px]">check</span>
                                      </button>
                                      <button onClick={() => setInlineAdd(null)} className="text-[#ccc] flex-shrink-0">
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
                            <div key={todo.id} className="flex items-center gap-3 px-6 py-2.5 border-b border-[var(--color-light-border)] last:border-0 group/item hover:bg-white transition-colors">
                              <input type="checkbox" checked={!!todo.est_coche} onChange={() => toggleTodo(todo.id)}
                                className="w-3.5 h-3.5 cursor-pointer flex-shrink-0 accent-[var(--color-brand)]" />
                              <p className={`flex-1 min-w-0 text-xs font-body leading-snug ${todo.est_coche ? 'line-through text-[var(--color-dark-text-2)]' : 'text-[var(--color-dark-1)]'}`}>
                                {todo.texte}
                                {todo.date_echeance && <span className="ml-2 text-[10px] text-[var(--color-dark-text-2)]">{formatDate(todo.date_echeance)}</span>}
                              </p>
                              <button onClick={() => deleteTodo(todo.id)}
                                className="opacity-0 group-hover/item:opacity-100 transition-opacity text-[#ccc] hover:text-red-400 flex-shrink-0">
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
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--color-light-1)] transition-colors text-left">
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
                      <div key={p.id} className="flex items-center gap-3 px-6 py-2.5 border-b border-[var(--color-light-border)] last:border-0 group/item hover:bg-white transition-colors">
                        <input type="checkbox" checked={false} onChange={() => toggleVisuel(p.id)} className="w-3.5 h-3.5 cursor-pointer flex-shrink-0 accent-[var(--color-brand)]" />
                        <p className="flex-1 min-w-0 text-xs font-body text-[var(--color-dark-1)] truncate">{p.titre} <span className="text-[var(--color-dark-text-2)]">· {formatDate(p.date_publication)}</span></p>
                        <Link href="/admin/marketing" className="opacity-0 group-hover/item:opacity-100 transition-opacity text-[#ccc] hover:text-[var(--color-brand)]">
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
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--color-light-1)] transition-colors text-left">
                  <span aria-hidden="true" className="material-symbols-outlined text-[14px] text-[var(--color-dark-text-2)] transition-transform duration-150 flex-shrink-0"
                    style={{ transform: (openGroups['__publier__'] ?? false) ? 'rotate(90deg)' : 'rotate(0deg)' }}>chevron_right</span>
                  <p className="flex-1 text-sm font-body font-semibold text-[var(--color-dark-1)] truncate">
                    À publier <span className="font-normal text-[var(--color-dark-text-2)]">· Marketing</span>
                  </p>
                  <span className="text-[11px] font-bold font-body px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 tabular-nums">{data.a_publier.length}</span>
                </button>
                {(openGroups['__publier__'] ?? false) && (
                  <div className="bg-[var(--color-light-1)] border-t border-[var(--color-light-border)]">
                    {data.a_publier.map(p => (
                      <div key={p.id} className="flex items-center gap-3 px-6 py-2.5 border-b border-[var(--color-light-border)] last:border-0 group/item hover:bg-white transition-colors">
                        <input type="checkbox" checked={false} onChange={() => togglePublier(p.id)} className="w-3.5 h-3.5 cursor-pointer flex-shrink-0 accent-emerald-500" />
                        <p className="flex-1 min-w-0 text-xs font-body text-[var(--color-dark-1)] truncate">{p.titre} <span className="text-[var(--color-dark-text-2)]">· {formatDate(p.date_publication)}</span></p>
                        <Link href="/admin/marketing" className="opacity-0 group-hover/item:opacity-100 transition-opacity text-[#ccc] hover:text-emerald-600">
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
            <div className="border-t border-[var(--color-light-border)]">
              <button onClick={() => toggleGroup('__done__')} className="flex items-center gap-2 px-5 py-3 w-full text-left hover:bg-[var(--color-light-1)] transition-colors">
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
                            className="w-full flex items-center gap-3 px-5 py-2.5 bg-[var(--color-light-1)] hover:bg-[var(--color-light-0)] transition-colors text-left opacity-60">
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
                                    className="opacity-0 group-hover/item:opacity-100 transition-opacity text-[#ccc] hover:text-red-400 flex-shrink-0">
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
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <div className="bg-[var(--color-light-1)] rounded-xl p-4 flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">Total Clients</p>
          <p className="font-display text-[var(--text-xl)] font-extrabold text-[var(--color-dark-1)]">{data.total_clients}</p>
        </div>
        <div className="bg-[var(--color-light-1)] rounded-xl p-4 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">Actifs</p>
            <span className="px-1.5 py-0.5 bg-[var(--color-brand)]/10 text-[var(--color-brand)] text-[9px] font-bold rounded-full font-body tracking-wide">EN COURS</span>
          </div>
          <p className="font-display text-[var(--text-xl)] font-extrabold text-[var(--color-dark-1)]">{data.projets_actifs}</p>
        </div>
        <div className="bg-[var(--color-error-bg-2)] rounded-xl p-4 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">En révision</p>
            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[9px] font-bold rounded-full font-body tracking-wide">ACTION</span>
          </div>
          <p className="font-display text-[var(--text-xl)] font-extrabold text-[var(--color-dark-1)]">{String(data.en_revision).padStart(2, '0')}</p>
        </div>
        <div className="bg-[var(--color-light-1)] rounded-xl p-4 flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">Archivés</p>
          <p className="font-display text-[var(--text-xl)] font-extrabold text-[var(--color-dark-1)]">{data.archives}</p>
        </div>
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
          <div className="bg-[var(--color-light-1)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--color-light-0)]">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">Client & Projet</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">État</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden sm:table-cell">Échéance</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-['var(--color-light-border-2)']/40">
                {data.projets_recents.map(p => {
                  const style = STATUT_STYLES[p.statut] || STATUT_STYLES['Annulé']
                  return (
                    <tr key={p.id} className="hover:bg-[var(--color-light-0)]/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-bold text-[var(--color-dark-1)] font-body leading-tight">{p.client_nom}</p>
                        <p className="text-xs text-[var(--color-dark-text-2)] font-body mt-0.5">{p.nom_projet}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 ${style.bg} ${style.text} text-[10px] font-bold rounded-full uppercase font-body`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot} flex-shrink-0`} />
                          {p.statut}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[var(--color-dark-text-2)] font-body hidden sm:table-cell">
                        {p.date_livraison_estimee
                          ? new Date(p.date_livraison_estimee).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' })
                          : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/admin/projet/${p.id}`}>
                          <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-1)] text-[18px]">chevron_right</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
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
                  <div className="bg-white rounded-xl p-3 flex items-center justify-between hover:bg-[var(--color-light-1)] transition-all cursor-pointer" style={{ border: '1px solid var(--color-light-border)' }}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${client.couleur} flex items-center justify-center text-white font-bold font-display text-sm flex-shrink-0`}>
                        {client.initiales}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--color-dark-1)] leading-tight font-body">{client.nom_complet}</p>
                        <p className="text-xs text-[var(--color-dark-text-2)] font-body">{client.nom_entreprise}</p>
                      </div>
                    </div>
                    <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-dark-text-2)] text-[16px]">chevron_right</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Liens rapides */}
          <div className="grid grid-cols-3 gap-2">
            <Link href="/admin/marketing"
              className="bg-white rounded-xl p-3.5 flex flex-col items-center gap-1.5 hover:bg-[var(--color-light-1)] transition-all text-center" style={{ border: '1px solid var(--color-light-border)' }}>
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)] text-[22px]">campaign</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-dark-1)] font-body">Marketing</span>
            </Link>
            <Link href="/admin/factures"
              className="bg-white rounded-xl p-3.5 flex flex-col items-center gap-1.5 hover:bg-[var(--color-light-1)] transition-all text-center" style={{ border: '1px solid var(--color-light-border)' }}>
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)] text-[22px]">receipt_long</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-dark-1)] font-body">Facturation</span>
            </Link>
            <Link href="/admin/soumissions"
              className="bg-white rounded-xl p-3.5 flex flex-col items-center gap-1.5 hover:bg-[var(--color-light-1)] transition-all text-center" style={{ border: '1px solid var(--color-light-border)' }}>
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)] text-[22px]">description</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-dark-1)] font-body">Soumissions</span>
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
