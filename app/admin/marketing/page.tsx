'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || ''

function moisCourant(): string {
  return new Date().toISOString().slice(0, 7)
}

function nomMois(mois: string): string {
  const [y, m] = mois.split('-')
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' })
    .toUpperCase()
}

function moisPrecedent(mois: string): string {
  const [y, m] = mois.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function moisSuivant(mois: string): string {
  const [y, m] = mois.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function premierJourDeSemaine(mois: string): number {
  const [y, m] = mois.split('-').map(Number)
  const d = new Date(y, m - 1, 1).getDay()
  return d === 0 ? 6 : d - 1
}

function nbJoursDansMois(mois: string): number {
  const [y, m] = mois.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

interface Post {
  id: number
  titre: string
  description: string
  date_publication: string
  plateformes: string[]
  statut: string
  todo_felix_done: boolean
  todo_marie_done: boolean
  demande_envoyee: boolean
}

const STATUT_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  'planifié':      { bg: 'bg-orange-100', text: 'text-orange-700', label: 'PLANIFIÉ' },
  'Planifié':      { bg: 'bg-orange-100', text: 'text-orange-700', label: 'PLANIFIÉ' },
  'visuels prêts': { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'VISUELS PRÊTS' },
  'publié':        { bg: 'bg-green-100',  text: 'text-green-700',  label: 'PUBLIÉ' },
}

function statutStyle(statut: string) {
  return STATUT_STYLES[statut] ?? { bg: 'bg-gray-100', text: 'text-gray-700', label: statut.toUpperCase() }
}

const FILTRES = ['TOUS', 'PLANIFIÉ', 'VISUELS PRÊTS', 'PUBLIÉ']
const FILTRE_VALS: Record<string, string> = {
  'PLANIFIÉ':      'planifié',
  'VISUELS PRÊTS': 'visuels prêts',
  'PUBLIÉ':        'publié',
}

const JOURS = ['LU', 'MA', 'ME', 'JE', 'VE', 'SA', 'DI']

export default function MarketingPage() {
  const [mois, setMois] = useState(moisCourant)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState('TOUS')
  const [notifLoading, setNotifLoading] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchPosts = useCallback(async (m: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/v1/admin/marketing?mois=${m}`, { credentials: 'include' })
      const data = await res.json()
      if (Array.isArray(data)) setPosts(data)
    } catch {
      showToast('Erreur chargement des posts', false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPosts(mois) }, [mois, fetchPosts])

  const handleNotif = async (dest: 'felix' | 'marie') => {
    setNotifLoading(dest)
    try {
      const res = await fetch(`${API}/api/v1/admin/marketing/notifier-${dest}/${mois}`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { showToast(data.error || 'Erreur serveur', false); return }
      if (data.count === 0) { showToast(data.message || 'Aucun post à envoyer.'); return }
      showToast(`${dest === 'felix' ? 'Félix' : 'Marie'} notifié${dest === 'marie' ? 'e' : ''} — ${data.count} post(s).`)
    } catch {
      showToast('Erreur de connexion', false)
    } finally {
      setNotifLoading('')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce post ?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`${API}/api/v1/admin/marketing/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) { showToast('Erreur suppression', false); return }
      setPosts(prev => prev.filter(p => p.id !== id))
      showToast('Post supprimé.')
    } catch {
      showToast('Erreur de connexion', false)
    } finally {
      setDeletingId(null)
    }
  }

  const postsFiltres = filtre === 'TOUS'
    ? posts
    : posts.filter(p => p.statut.toLowerCase() === FILTRE_VALS[filtre]?.toLowerCase())

  const joursAvecPosts = new Set(posts.map(p => Number(p.date_publication.split('-')[2])))
  const offset = premierJourDeSemaine(mois)
  const nbJours = nbJoursDansMois(mois)
  const aujourd = new Date().toISOString().slice(0, 10)

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="font-display text-[var(--text-3xl)] uppercase tracking-tight leading-none text-[var(--color-dark-1)]">
            PLANIFICATION MARKETING
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={() => setMois(moisPrecedent(mois))}
              aria-label="Mois précédent"
              className="text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-1)] transition-colors">
              <span aria-hidden="true" className="material-symbols-outlined">chevron_left</span>
            </button>
            <p className="font-body text-[var(--color-dark-text-2)] min-w-40 text-center">{nomMois(mois)}</p>
            <button onClick={() => setMois(moisSuivant(mois))}
              aria-label="Mois suivant"
              className="text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-1)] transition-colors">
              <span aria-hidden="true" className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleNotif('felix')}
            disabled={notifLoading === 'felix'}
            className="bg-[var(--color-dark-1)] hover:bg-[var(--color-dark-0)] text-white px-6 py-3 rounded-full font-body font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-60">
            <span aria-hidden="true" className="material-symbols-outlined text-sm">mail</span>
            {notifLoading === 'felix' ? 'ENVOI...' : 'NOTIFIER FÉLIX'}
          </button>
          <button
            onClick={() => handleNotif('marie')}
            disabled={notifLoading === 'marie'}
            className="bg-[var(--color-dark-1)] hover:bg-[var(--color-dark-0)] text-white px-6 py-3 rounded-full font-body font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-60">
            <span aria-hidden="true" className="material-symbols-outlined text-sm">mail</span>
            {notifLoading === 'marie' ? 'ENVOI...' : 'NOTIFIER MARIE'}
          </button>
          <Link href={`/admin/marketing/nouveau`}
            className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white px-8 py-4 rounded-full font-display text-xl tracking-widest transition-all flex items-center gap-2 uppercase">
            <span aria-hidden="true" className="material-symbols-outlined">add</span>
            NOUVEAU POST
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-8 rounded-2xl border-b-4 border-[var(--color-brand)]/10">
          <p className="text-[var(--color-dark-text-2)] font-bold text-xs tracking-widest uppercase mb-4 font-body">Posts ce mois</p>
          <p className="font-display text-[var(--text-2xl)] text-[var(--color-dark-1)]">{posts.length}</p>
        </div>
        <div className="bg-white p-8 rounded-2xl border-b-4 border-green-500/10">
          <p className="text-[var(--color-dark-text-2)] font-bold text-xs tracking-widest uppercase mb-4 font-body">Visuels prêts</p>
          <p className="font-display text-[var(--text-2xl)] text-green-600">
            {posts.filter(p => p.statut === 'visuels prêts' || p.statut === 'publié').length}
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl border-b-4 border-orange-500/10">
          <p className="text-[var(--color-dark-text-2)] font-bold text-xs tracking-widest uppercase mb-4 font-body">En attente visuels</p>
          <p className="font-display text-[var(--text-2xl)] text-orange-600">
            {posts.filter(p => !p.todo_felix_done).length}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-10">
        {FILTRES.map(f => (
          <button key={f} onClick={() => setFiltre(f)}
            className={`px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase font-body transition-all ${
              filtre === f
                ? 'bg-[var(--color-brand)] text-white'
                : 'bg-white border border-[var(--color-light-border-2)] text-[var(--color-dark-1)] hover:bg-[var(--color-light-1)]'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Grid posts + calendrier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Posts list */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-display text-[var(--text-xl)] uppercase tracking-wide">POSTS DU MOIS</h3>
            <span className="text-[var(--color-dark-text-2)] font-body text-xs">{postsFiltres.length} post(s)</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-16 text-[var(--color-dark-text-2)]">
              <span aria-hidden="true" className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
            </div>
          ) : postsFiltres.length === 0 ? (
            <div className="text-center py-16">
              <span aria-hidden="true" className="material-symbols-outlined text-4xl text-[var(--color-light-border-2)] mb-4 block">campaign</span>
              <p className="text-[var(--color-dark-text-2)] font-body text-sm">Aucun post pour ce mois.</p>
              <Link href="/admin/marketing/nouveau"
                className="inline-flex items-center gap-2 mt-4 text-[var(--color-brand)] font-body font-bold text-sm hover:underline">
                <span aria-hidden="true" className="material-symbols-outlined text-sm">add</span>
                Créer un post
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {postsFiltres.map(post => {
                const style = statutStyle(post.statut)
                const plates = post.plateformes.join(', ') || '—'
                return (
                  <div key={post.id}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-[var(--color-light-1)] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-light-0)] flex items-center justify-center text-[var(--color-brand)]">
                        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                          campaign
                        </span>
                      </div>
                      <div>
                        <p className="font-body font-semibold text-[var(--color-dark-1)] text-sm">{post.titre}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-[var(--color-dark-text-2)] font-body uppercase tracking-widest">
                            {new Date(post.date_publication + 'T12:00:00').toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' }).toUpperCase()}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-[var(--color-light-border-2)]" />
                          <span className="px-2 py-0.5 rounded-full bg-[var(--color-light-0)] text-[10px] text-[var(--color-dark-text-2)] font-bold uppercase">
                            {plates}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-1.5 rounded-full ${style.bg} ${style.text} text-[10px] font-bold tracking-widest uppercase font-body`}>
                        {style.label}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                          className="p-2 rounded-full hover:bg-red-50 text-[var(--color-dark-text-2)] hover:text-red-600 transition-colors disabled:opacity-40">
                          <span aria-hidden="true" className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Calendrier */}
        <div className="bg-white p-8 rounded-3xl shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-[var(--text-xl)] uppercase tracking-wide">CALENDRIER</h3>
            <div className="flex gap-1">
              <button onClick={() => setMois(moisPrecedent(mois))} className="text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-1)]">
                <span aria-hidden="true" className="material-symbols-outlined">chevron_left</span>
              </button>
              <button onClick={() => setMois(moisSuivant(mois))} className="text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-1)]">
                <span aria-hidden="true" className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          <p className="text-center font-body font-bold uppercase tracking-widest text-xs mb-6">
            {nomMois(mois)}
          </p>
          <div className="grid grid-cols-7 gap-y-3 text-center mb-2">
            {JOURS.map(j => (
              <div key={j} className="text-[10px] text-[var(--color-dark-text-2)] font-bold uppercase font-body">{j}</div>
            ))}
            {Array.from({ length: offset }, (_, i) => (
              <div key={`off-${i}`} />
            ))}
            {Array.from({ length: nbJours }, (_, i) => {
              const d = i + 1
              const dateStr = `${mois}-${String(d).padStart(2, '0')}`
              const isToday = dateStr === aujourd
              const hasPost = joursAvecPosts.has(d)
              return (
                <div key={d}
                  className={`text-xs py-2 rounded-lg relative font-body font-bold ${
                    isToday
                      ? 'bg-[var(--color-brand)] text-white shadow'
                      : 'hover:bg-[var(--color-light-1)]'
                  }`}>
                  {d}
                  {hasPost && (
                    <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-[var(--color-brand)]'}`} />
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-auto pt-6 border-t border-[var(--color-light-0)]">
            <p className="text-[10px] text-[var(--color-dark-text-2)] font-bold uppercase tracking-widest mb-3 font-body">Légende</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-brand)]" />
                <span className="text-[10px] font-body font-semibold">Post prévu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
