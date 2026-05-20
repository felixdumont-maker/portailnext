'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Pigiste { id: number; nom_complet: string; email: string; telephone: string; is_active: boolean; nb_mandats: number; created_at: string }

export default function AdminPigistesPage() {
  const [pigistes, setPigistes] = useState<Pigiste[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    fetch('/api/v1/admin/pigistes', { credentials: 'include' })
      .then(r => r.json()).then(data => { setPigistes(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number, nom: string) => {
    if (!confirm(`Supprimer le pigiste "${nom}" ?`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/v1/admin/pigistes/${id}`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) { setPigistes(p => p.filter(x => x.id !== id)); showToast(`"${nom}" supprimé.`) }
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

  return (
    <div className="max-w-5xl mx-auto">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-3 ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] uppercase tracking-tight leading-none">PIGISTES</h1>
          <p className="text-[var(--color-dark-text-2)] font-body text-sm mt-1">{pigistes.length} pigiste(s) enregistré(s)</p>
        </div>
        <Link href="/admin/pigistes/new" className="inline-flex items-center gap-2 bg-[var(--color-brand)] text-white px-5 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--color-brand-hover)] transition-colors">
          <span aria-hidden="true" className="material-symbols-outlined text-base">add</span>
          Nouveau pigiste
        </Link>
      </div>

      {loading ? (
        <p className="text-[var(--color-dark-text-2)] font-body text-center py-20">Chargement...</p>
      ) : pigistes.length === 0 ? (
        <div className="text-center py-20">
          <span aria-hidden="true" className="material-symbols-outlined text-5xl text-[var(--color-light-border-2)] block mb-4">handyman</span>
          <p className="text-[var(--color-dark-text-2)] font-body">Aucun pigiste encore.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[var(--color-light-0)]">
              <tr>
                {['Pigiste', 'Email', 'Mandats', 'Statut', ''].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-light-0)]">
              {pigistes.map(p => {
                const initiales = p.nom_complet.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                return (
                  <tr key={p.id} className="hover:bg-[var(--color-light-1)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-dark-1)] flex items-center justify-center text-white font-display text-lg flex-shrink-0">
                          {initiales}
                        </div>
                        <p className="font-body font-bold text-[var(--color-dark-1)] text-sm">{p.nom_complet}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-dark-text-2)] font-body text-sm">{p.email}</td>
                    <td className="px-6 py-4">
                      <span className="font-display text-xl text-[var(--color-dark-1)]">{p.nb_mandats}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggleActive(p)}
                        aria-label={p.is_active ? `Désactiver ${p.nom_complet}` : `Activer ${p.nom_complet}`}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase font-body cursor-pointer border-none ${p.is_active ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]' : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)]'}`}>
                        {p.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => handleDelete(p.id, p.nom_complet)} disabled={deletingId === p.id}
                          aria-label={`Supprimer ${p.nom_complet}`}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full text-[var(--color-dark-text-2)] hover:text-red-600 hover:bg-red-50 disabled:opacity-30">
                          <span aria-hidden="true" className="material-symbols-outlined text-base">delete</span>
                        </button>
                        <Link href={`/admin/pigistes/${p.id}`} className="text-[var(--color-brand)] font-body text-xs font-bold uppercase tracking-wide hover:underline">
                          VOIR →
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
