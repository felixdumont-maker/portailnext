'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Pigiste {
  id: number
  nom_complet: string
  email: string
  telephone: string
  is_active: boolean
  nb_mandats: number
  created_at: string
  // Champs futurs — affichent — jusqu'à extension backend
  specialites?: string[]
  niveau?: string
  canva?: boolean
  capcut?: boolean
  drive?: boolean
}

const NIVEAU_STYLES: Record<string, { bg: string; text: string }> = {
  junior:  { bg: 'var(--color-info-bg)',    text: 'var(--color-info-text)' },
  senior:  { bg: 'var(--color-warning-bg)', text: 'var(--color-warning-text)' },
  expert:  { bg: 'var(--color-success-bg)', text: 'var(--color-success-text)' },
}

function OutilIcon({ nom, actif }: { nom: string; actif?: boolean }) {
  if (actif === undefined) return <span className="font-body text-xs text-[var(--color-dark-text-2)]">—</span>
  return (
    <span
      title={nom}
      aria-label={`${nom} : ${actif ? 'accès activé' : 'accès désactivé'}`}
      className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold font-body
        ${actif
          ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]'
          : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)] opacity-40'
        }`}
    >
      {nom[0]}
    </span>
  )
}

export default function AdminPigistesPage() {
  const [pigistes, setPigistes]     = useState<Pigiste[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch('/api/v1/admin/pigistes', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setPigistes(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number, nom: string) => {
    if (!confirm(`Supprimer le pigiste "${nom}" ?`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/v1/admin/pigistes/${id}`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) { setPigistes(prev => prev.filter(x => x.id !== id)); showToast(`"${nom}" supprimé.`) }
      else showToast('Erreur suppression', false)
    } catch { showToast('Erreur de connexion', false) }
    finally { setDeletingId(null) }
  }

  const handleToggleActive = async (p: Pigiste) => {
    try {
      await fetch(`/api/v1/admin/pigistes/${p.id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: p.is_active ? 0 : 1 }),
      })
      setPigistes(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !x.is_active } : x))
    } catch { showToast('Erreur', false) }
  }

  const filtered = pigistes.filter(p =>
    p.nom_complet.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto">

      {toast && (
        <div role="status" aria-live="polite" aria-atomic="true"
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-3 ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            {toast.ok ? 'check_circle' : 'error'}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] uppercase tracking-tight leading-none">
            PIGISTES
          </h1>
          <p className="text-[var(--color-dark-text-2)] font-body text-sm mt-1">
            {pigistes.length} pigiste{pigistes.length !== 1 ? 's' : ''} enregistré{pigistes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-dark-text-2)]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un pigiste..."
              aria-label="Rechercher un pigiste"
              className="bg-white border border-[var(--color-light-border-2)] rounded-full pl-12 pr-6 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 w-72"
            />
          </div>
          <Link
            href="/admin/pigistes/new"
            className="inline-flex items-center gap-2 bg-[var(--color-brand)] text-white px-5 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--color-brand-hover)] transition-colors whitespace-nowrap"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">add</span>
            Nouveau pigiste
          </Link>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <p className="text-[var(--color-dark-text-2)] font-body text-center py-20">Chargement...</p>
      ) : pigistes.length === 0 ? (
        <div className="text-center py-20">
          <span aria-hidden="true" className="material-symbols-outlined text-5xl text-[var(--color-light-border-2)] block mb-4">
            handyman
          </span>
          <p className="text-[var(--color-dark-text-2)] font-body">Aucun pigiste encore.</p>
          <Link href="/admin/pigistes/new"
            className="inline-flex items-center gap-2 mt-4 text-[var(--color-brand)] font-body text-sm font-bold hover:underline">
            <span aria-hidden="true" className="material-symbols-outlined text-base">add</span>
            Créer le premier pigiste
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--color-light-0)]">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">Nom légal</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden md:table-cell">Courriel</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden lg:table-cell">Spécialités</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden lg:table-cell">Niveau</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">Statut</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden lg:table-cell">Outils</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-light-0)]">
                {filtered.map(p => {
                  const initiales = p.nom_complet.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  const niveauStyle = p.niveau ? (NIVEAU_STYLES[p.niveau] ?? NIVEAU_STYLES['junior']) : null
                  return (
                    <tr key={p.id} className="hover:bg-[var(--color-light-1)] transition-colors group">

                      {/* Nom légal */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--color-dark-1)] flex items-center justify-center text-white font-display text-lg flex-shrink-0">
                            {initiales}
                          </div>
                          <div>
                            <p className="font-body font-bold text-[var(--color-dark-1)] text-sm leading-tight">{p.nom_complet}</p>
                            <p className="font-body text-xs text-[var(--color-dark-text-2)] mt-0.5">
                              {p.nb_mandats} mandat{p.nb_mandats !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Courriel */}
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="font-body text-sm text-[var(--color-dark-text-2)]">{p.email}</p>
                      </td>

                      {/* Spécialités */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {p.specialites && p.specialites.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {p.specialites.map(s => (
                              <span key={s} className="px-2 py-0.5 rounded-full bg-[var(--color-light-0)] text-[var(--color-dark-text-2)] text-[10px] font-bold uppercase tracking-wide font-body">
                                {s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="font-body text-xs text-[var(--color-dark-text-2)]">—</span>
                        )}
                      </td>

                      {/* Niveau */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {niveauStyle ? (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase font-body"
                            style={{ background: niveauStyle.bg, color: niveauStyle.text }}>
                            {p.niveau}
                          </span>
                        ) : (
                          <span className="font-body text-xs text-[var(--color-dark-text-2)]">—</span>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(p)}
                          aria-label={p.is_active ? `Désactiver ${p.nom_complet}` : `Activer ${p.nom_complet}`}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase font-body cursor-pointer border-none transition-colors
                            ${p.is_active
                              ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] hover:bg-[var(--color-success-bg-2)]'
                              : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)] hover:bg-[var(--color-light-border)]'
                            }`}
                        >
                          {p.is_active ? 'Actif' : 'Inactif'}
                        </button>
                      </td>

                      {/* Accès outils */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5" aria-label="Accès outils">
                          <OutilIcon nom="Canva"  actif={p.canva} />
                          <OutilIcon nom="CapCut" actif={p.capcut} />
                          <OutilIcon nom="Drive"  actif={p.drive} />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleDelete(p.id, p.nom_complet)}
                            disabled={deletingId === p.id}
                            aria-label={`Supprimer ${p.nom_complet}`}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full text-[var(--color-dark-text-2)] hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                          >
                            <span aria-hidden="true" className="material-symbols-outlined text-base">delete</span>
                          </button>
                          <Link
                            href={`/admin/pigistes/${p.id}`}
                            className="text-[var(--color-brand)] font-body text-xs font-bold uppercase tracking-wide hover:underline"
                          >
                            VOIR →
                          </Link>
                        </div>
                      </td>

                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[var(--color-dark-text-2)] font-body">
                      Aucun pigiste trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
