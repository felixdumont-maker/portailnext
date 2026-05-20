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

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>(MOCK_DATA)
  const [todos, setTodos] = useState<TodoPerso[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [newPriorite, setNewPriorite] = useState('normale')
  const [newEcheance, setNewEcheance] = useState('')
  const [addingTodo, setAddingTodo] = useState(false)
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

  async function toggleVisuel(id: number) {
    const res = await fetch(`${API}/api/v1/admin/marketing/${id}/todo-toggle`, { method: 'POST', credentials: 'include' })
    if (res.ok) setData(prev => ({ ...prev, visuels_a_creer: prev.visuels_a_creer.filter(p => p.id !== id) }))
  }

  async function togglePublier(id: number) {
    const res = await fetch(`${API}/api/v1/admin/marketing/${id}/publier`, { method: 'POST', credentials: 'include' })
    if (res.ok) setData(prev => ({ ...prev, a_publier: prev.a_publier.filter(p => p.id !== id) }))
  }

  async function createTodo() {
    if (!newTodo.trim()) return
    const res = await fetch(`${API}/api/v1/admin/todos`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texte: newTodo.trim(), priorite: newPriorite, date_echeance: newEcheance || null }),
    })
    if (res.ok) {
      const todo = await res.json()
      setTodos(prev => [todo, ...prev])
      setNewTodo('')
      setNewEcheance('')
      setNewPriorite('normale')
      setAddingTodo(false)
    }
  }

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  const todosActifs = todos.filter(t => !t.est_coche)
  const todosCochs = todos.filter(t => t.est_coche)

  function toggleGroup(key: string) {
    setOpenGroups(prev => ({ ...prev, [key]: !(prev[key] ?? true) }))
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
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid var(--color-light-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>checklist</span>
              <h3 className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-dark-1)]">Mes tâches</h3>
            </div>
            <button
              onClick={() => { setAddingTodo(v => !v); setTimeout(() => inputRef.current?.focus(), 50) }}
              className="text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] transition-colors">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">add_circle</span>
            </button>
          </div>

          {/* Formulaire ajout */}
          {addingTodo && (
            <div className="mb-4 p-3 bg-[var(--color-light-1)] rounded-xl space-y-2">
              <input
                ref={inputRef}
                value={newTodo}
                onChange={e => setNewTodo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createTodo()}
                placeholder="Nouvelle tâche..."
                className="w-full bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[var(--color-light-border-2)] focus:border-[var(--color-brand)]"
              />
              <div className="flex gap-2">
                <select
                  value={newPriorite}
                  onChange={e => setNewPriorite(e.target.value)}
                  className="flex-1 bg-white rounded-lg px-3 py-1.5 text-xs border border-[var(--color-light-border-2)] outline-none">
                  <option value="haute">🔴 Haute</option>
                  <option value="normale">🟠 Normale</option>
                  <option value="basse">⚪ Basse</option>
                </select>
                <input
                  type="date"
                  value={newEcheance}
                  onChange={e => setNewEcheance(e.target.value)}
                  className="flex-1 bg-white rounded-lg px-3 py-1.5 text-xs border border-[var(--color-light-border-2)] outline-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setAddingTodo(false)} className="text-xs text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-1)] font-body font-bold">Annuler</button>
                <button onClick={createTodo} className="text-xs bg-[var(--color-brand)] text-white px-3 py-1 rounded-full font-body font-bold">
                  + Ajouter
                </button>
              </div>
            </div>
          )}

          {/* Groupes — grille responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">

            {/* Groupes projets */}
            {Object.entries(activeGroups).map(([projetNom, group]) => {
              const isOpen = openGroups[projetNom] ?? true
              const isProjet = projetNom !== '— Personnel'
              const done = group.todos.filter(t => t.est_coche).length
              const total = group.todos.length
              return (
                <div key={projetNom} className="rounded-xl overflow-hidden border border-[var(--color-light-border)] self-start">
                  <button
                    onClick={() => toggleGroup(projetNom)}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-[var(--color-light-1)] hover:bg-[var(--color-light-0)] transition-colors text-left">
                    <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[var(--color-dark-text-2)] transition-transform duration-200"
                      style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                      chevron_right
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[11px] font-bold font-body uppercase tracking-wide truncate ${isProjet ? 'text-[var(--color-brand)]' : 'text-[var(--color-dark-text-2)]'}`}>
                        {projetNom}
                      </span>
                      {group.client_nom && (
                        <span className="text-[10px] font-body text-[var(--color-dark-text-2)] ml-1.5 normal-case tracking-normal font-normal">
                          · {group.client_nom}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-body text-[var(--color-dark-text-2)] flex-shrink-0">{done}/{total}</span>
                  </button>
                  {isOpen && (
                    <div className="px-3 py-2 space-y-2 bg-white">
                      {group.todos.map(todo => (
                        <div key={todo.id} className="flex items-start gap-2.5 group">
                          <input
                            type="checkbox"
                            checked={!!todo.est_coche}
                            onChange={() => toggleTodo(todo.id)}
                            className="mt-0.5 w-4 h-4 accent-['var(--color-brand)'] cursor-pointer flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-body font-semibold leading-snug truncate ${todo.est_coche ? 'line-through text-[var(--color-dark-text-2)]' : 'text-[var(--color-dark-1)]'}`}>
                              {todo.texte}
                            </p>
                            {todo.date_echeance && (
                              <span className="text-[10px] text-[var(--color-dark-text-2)] font-body">{formatDate(todo.date_echeance)}</span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[#ccc] hover:text-red-400 flex-shrink-0 mt-0.5">
                            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Groupe — Visuels à créer */}
            {data.visuels_a_creer.length > 0 && (
              <div className="rounded-xl overflow-hidden border border-[var(--color-light-border)] self-start">
                <button
                  onClick={() => toggleGroup('__visuels__')}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-[var(--color-light-1)] hover:bg-[var(--color-light-0)] transition-colors text-left">
                  <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[var(--color-dark-text-2)] transition-transform duration-200"
                    style={{ transform: (openGroups['__visuels__'] ?? true) ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                    chevron_right
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold font-body uppercase tracking-wide text-[var(--color-brand)]">Visuels à créer</span>
                    <span className="text-[10px] font-body text-[var(--color-dark-text-2)] ml-1.5 normal-case tracking-normal font-normal">· Marketing</span>
                  </div>
                  <span className="text-[10px] font-body text-[var(--color-dark-text-2)] flex-shrink-0">0/{data.visuels_a_creer.length}</span>
                </button>
                {(openGroups['__visuels__'] ?? true) && (
                  <div className="px-3 py-2 space-y-2 bg-white">
                    {data.visuels_a_creer.map(p => (
                      <div key={p.id} className="flex items-center gap-2.5 group">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => toggleVisuel(p.id)}
                          className="mt-0.5 w-4 h-4 accent-['var(--color-brand)'] cursor-pointer flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-body font-semibold text-[var(--color-dark-1)] leading-tight">{p.titre}</p>
                          <p className="text-[10px] text-[var(--color-dark-text-2)] font-body">{formatDate(p.date_publication)}</p>
                        </div>
                        <Link href="/admin/marketing" className="text-[#ccc] hover:text-[var(--color-brand)] flex-shrink-0 transition-colors opacity-0 group-hover:opacity-100">
                          <span aria-hidden="true" className="material-symbols-outlined text-[16px]">open_in_new</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Groupe — À publier */}
            {data.a_publier.length > 0 && (
              <div className="rounded-xl overflow-hidden border border-[var(--color-light-border)] self-start">
                <button
                  onClick={() => toggleGroup('__publier__')}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-[var(--color-light-1)] hover:bg-[var(--color-light-0)] transition-colors text-left">
                  <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[var(--color-dark-text-2)] transition-transform duration-200"
                    style={{ transform: (openGroups['__publier__'] ?? true) ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                    chevron_right
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold font-body uppercase tracking-wide text-green-600">À publier</span>
                    <span className="text-[10px] font-body text-[var(--color-dark-text-2)] ml-1.5 normal-case tracking-normal font-normal">· Marketing</span>
                  </div>
                  <span className="text-[10px] font-body text-[var(--color-dark-text-2)] flex-shrink-0">0/{data.a_publier.length}</span>
                </button>
                {(openGroups['__publier__'] ?? true) && (
                  <div className="px-3 py-2 space-y-2 bg-white">
                    {data.a_publier.map(p => (
                      <div key={p.id} className="flex items-center gap-2.5 group">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => togglePublier(p.id)}
                          className="mt-0.5 w-4 h-4 accent-green-600 cursor-pointer flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-body font-semibold text-[var(--color-dark-1)] leading-tight">{p.titre}</p>
                          <p className="text-[10px] text-[var(--color-dark-text-2)] font-body">{formatDate(p.date_publication)}</p>
                        </div>
                        <Link href="/admin/marketing" className="text-[#ccc] hover:text-green-600 flex-shrink-0 transition-colors opacity-0 group-hover:opacity-100">
                          <span aria-hidden="true" className="material-symbols-outlined text-[16px]">open_in_new</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Message si vide */}
            {todosActifs.length === 0 && data.visuels_a_creer.length === 0 && data.a_publier.length === 0 && !addingTodo && (
              <p className="text-xs text-[var(--color-dark-text-2)] font-body italic col-span-full">Aucune tâche en cours.</p>
            )}
          </div>

          {/* Tâches cochées */}
          {todosCochs.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--color-light-0)]">
              <button
                onClick={() => toggleGroup('__done__')}
                className="flex items-center gap-1.5 mb-2 w-full text-left">
                <span aria-hidden="true" className="material-symbols-outlined text-[14px] text-[var(--color-dark-text-2)] transition-transform duration-200"
                  style={{ transform: (openGroups['__done__'] ?? false) ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                  chevron_right
                </span>
                <p className="text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">
                  Complétées ({todosCochs.length})
                </p>
              </button>
              {(openGroups['__done__'] ?? false) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-1.5">
                  {todosCochs.map(todo => (
                    <div key={todo.id} className="flex items-center gap-2.5 group opacity-50">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => toggleTodo(todo.id)}
                        className="w-4 h-4 accent-['var(--color-brand)'] cursor-pointer flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[var(--color-dark-text-2)] font-body line-through truncate">{todo.texte}</p>
                        {todo.projet_nom && <p className="text-[9px] text-[#c0b8b0] font-body uppercase">{todo.projet_nom}</p>}
                      </div>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[#ccc] hover:text-red-400 flex-shrink-0">
                        <span aria-hidden="true" className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
        <div className="bg-[#fff3f1] rounded-xl p-4 flex flex-col gap-3">
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
          <div className="grid grid-cols-2 gap-2">
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
          </div>

        </div>
      </div>
    </div>
  )
}
