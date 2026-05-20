'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Projet {
  id: number
  nom_projet: string
  statut: string
  client_nom: string
  nom_service: string
  date_livraison_estimee: string
  is_archived: number
  created_at: string
}

const STATUT_STYLES: Record<string, { bg: string; text: string }> = {
  'Documents à donner': { bg: 'var(--color-error-bg)', text: 'var(--color-error-text)' },
  'Documents reçus':    { bg: 'var(--color-info-bg)', text: 'var(--color-info-text)' },
  'Travaux en cours':   { bg: 'var(--color-warning-bg)', text: 'var(--color-warning-text)' },
  'En révision':        { bg: 'var(--color-warning-bg)', text: 'var(--color-warning-text)' },
  'Travaux terminés':   { bg: 'var(--color-success-bg)', text: 'var(--color-success-text)' },
  'Complété':           { bg: 'var(--color-success-bg)', text: 'var(--color-success-text)' },
  'Annulé':             { bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)' },
  'En attente de rendez-vous': { bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)' },
}

const FILTRES = ['TOUS', 'EN COURS', 'EN RÉVISION', 'TERMINÉS', 'ARCHIVÉS']

export default function AdminProjetsPage() {
  const [projets, setProjets] = useState<Projet[]>([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState('TOUS')
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch('/api/v1/admin/projets', { credentials: 'include' })
      .then(res => res.json())
      .then(data => { setProjets(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number, nom: string) => {
    if (!confirm(`Supprimer le projet "${nom}" ?`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/v1/admin/projet/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) { showToast('Erreur suppression', false); return }
      setProjets(prev => prev.filter(p => p.id !== id))
      showToast('Projet supprimé.')
    } catch {
      showToast('Erreur de connexion', false)
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = projets.filter(p => {
    const matchSearch = p.nom_projet.toLowerCase().includes(search.toLowerCase()) ||
      p.client_nom?.toLowerCase().includes(search.toLowerCase())
    const matchFiltre =
      filtre === 'TOUS' ||
      (filtre === 'EN COURS' && p.statut === 'Travaux en cours') ||
      (filtre === 'EN RÉVISION' && p.statut === 'En révision') ||
      (filtre === 'TERMINÉS' && ['Travaux terminés', 'Complété'].includes(p.statut)) ||
      (filtre === 'ARCHIVÉS' && p.is_archived === 1)
    return matchSearch && matchFiltre
  })

  return (
    <div className="max-w-5xl mx-auto">

      {toast && (
        <div role="status" aria-live="polite" aria-atomic="true" className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-3 ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] uppercase tracking-tight leading-none">PROJETS</h1>
          <p className="text-[var(--color-dark-text-2)] font-body text-sm mt-1">
            {projets.length} projets au total
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
              placeholder="Rechercher un projet..."
              className="bg-white border border-[var(--color-light-border-2)] rounded-full pl-12 pr-6 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 w-72"
            />
          </div>
          <Link
            href="/admin/projets/new"
            className="inline-flex items-center gap-2 bg-[var(--color-brand)] text-white px-5 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--color-brand-hover)] transition-colors whitespace-nowrap"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">add</span>
            Nouveau projet
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-8">
        {FILTRES.map(f => (
          <button key={f} onClick={() => setFiltre(f)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide font-body transition-all ${
              filtre === f
                ? 'bg-[var(--color-brand)] text-white'
                : 'bg-white border border-[var(--color-light-border-2)] text-[var(--color-dark-1)] hover:bg-[var(--color-light-1)]'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <p className="text-[var(--color-dark-text-2)] font-body text-center py-20">Chargement...</p>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-left">
            <thead className="bg-[var(--color-light-0)]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">Projet</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden md:table-cell">Statut</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden md:table-cell">Échéance</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-['var(--color-light-0)']">
              {filtered.map(p => {
                const style = STATUT_STYLES[p.statut] || { bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)' }
                const nomService = p.nom_projet.split(' — ')[1] || p.nom_projet
                return (
                  <tr key={p.id} className="hover:bg-[var(--color-light-1)] transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-display text-lg text-[var(--color-dark-1)]">{nomService}</p>
                      <p className="font-body text-xs text-[var(--color-dark-text-2)]">{p.client_nom}</p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span
                        className="px-3 py-1 rounded-full text-[10px] font-bold uppercase font-body"
                        style={{ backgroundColor: style.bg, color: style.text }}
                      >
                        {p.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="font-body text-sm text-[var(--color-dark-text-2)]">
                        {p.date_livraison_estimee
                          ? new Date(p.date_livraison_estimee).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' })
                          : '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleDelete(p.id, p.nom_projet)}
                          disabled={deletingId === p.id}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full text-[var(--color-dark-text-2)] hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                          title="Supprimer ce projet"
                        >
                          <span aria-hidden="true" className="material-symbols-outlined text-base">delete</span>
                        </button>
                        <Link href={`/admin/projet/${p.id}`}
                          className="text-[var(--color-brand)] font-body text-xs font-bold uppercase tracking-wide hover:underline">
                          VOIR →
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[var(--color-dark-text-2)] font-body">
                    Aucun projet trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  )
}
