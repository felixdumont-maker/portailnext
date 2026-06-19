'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Soumission {
  id: number
  titre: string
  statut: 'envoyee' | 'acceptee' | 'refusee' | 'expiree'
  date_expiration: string | null
  created_at: string
  nom_client: string
  email_client: string
  option_acceptee_nom: string | null
}

const STATUT_CONFIG = {
  envoyee:  { label: 'Transmise',  bg: 'var(--color-info-bg-2)',     text: 'var(--color-info-text)'        },
  acceptee: { label: 'Acceptée',   bg: 'var(--color-success-bg-2)',  text: 'var(--color-success-text-2)'   },
  refusee:  { label: 'Déclinée',   bg: '#fee2e2',                    text: '#b91c1c'                        },
  expiree:  { label: 'Expirée',    bg: 'var(--color-light-0)',       text: 'var(--color-light-text-3)'     },
}

export default function AdminSoumissionsPage() {
  const [items, setItems]     = useState<Soumission[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast]     = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch('/api/v1/admin/soumissions', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setItems(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number, titre: string) => {
    if (!confirm(`Retirer la proposition "${titre}" ?`)) return
    const res = await fetch(`/api/v1/admin/soumission/${id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) {
      setItems(prev => prev.filter(s => s.id !== id))
      showToast('Proposition retirée.')
    } else {
      showToast('Erreur suppression.', false)
    }
  }

  const envoyees = items.filter(s => s.statut === 'envoyee').length

  return (
    <div className="max-w-5xl mx-auto">

      {toast && (
        <div role="status" aria-live="polite" className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-3 ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] uppercase tracking-tight leading-none">
            SOUMISSIONS
          </h1>
          <p className="text-[var(--color-dark-text-2)] font-body text-sm mt-1">
            {items.length} proposition{items.length !== 1 ? 's' : ''} au total
            {envoyees > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 bg-[var(--color-brand)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {envoyees} en attente de réponse
              </span>
            )}
          </p>
        </div>
        <Link
          href="/admin/soumissions/nouvelle"
          className="inline-flex items-center gap-2 bg-[var(--color-brand)] text-white px-5 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--color-brand-hover)] transition-colors whitespace-nowrap"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">add</span>
          Nouvelle proposition commerciale
        </Link>
      </div>

      {loading ? (
        <p className="text-[var(--color-dark-text-2)] font-body text-center py-20">Chargement...</p>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--color-light-0)]">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">Client</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">Titre</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">État</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden md:table-cell">Expiration</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest hidden md:table-cell">Option choisie</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-light-0)]">
                {items.map(s => {
                  const cfg = STATUT_CONFIG[s.statut] ?? STATUT_CONFIG.expiree
                  const initiales = s.nom_client.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  return (
                    <tr key={s.id} className="hover:bg-[var(--color-light-1)] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--color-brand)] flex items-center justify-center text-white font-display text-sm flex-shrink-0">
                            {initiales}
                          </div>
                          <div>
                            <p className="font-body font-bold text-[var(--color-dark-1)] text-sm">{s.nom_client}</p>
                            <p className="font-body text-xs text-[var(--color-dark-text-2)]">{s.email_client}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-body text-sm text-[var(--color-dark-1)] font-medium max-w-xs truncate">{s.titre}</p>
                        <p className="font-body text-xs text-[var(--color-dark-text-2)] mt-0.5">
                          {new Date(s.created_at).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-body uppercase tracking-wide"
                          style={{ background: cfg.bg, color: cfg.text }}
                        >
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="font-body text-xs text-[var(--color-dark-text-2)]">
                          {s.date_expiration
                            ? new Date(s.date_expiration).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '--'}
                        </p>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {s.option_acceptee_nom ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg font-body">
                            <span aria-hidden="true" className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            {s.option_acceptee_nom}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--color-dark-text-2)] font-body">--</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleDelete(s.id, s.titre)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full text-[var(--color-dark-text-2)] hover:text-red-600 hover:bg-red-50"
                            title="Retirer"
                          >
                            <span aria-hidden="true" className="material-symbols-outlined text-base">delete</span>
                          </button>
                          <Link
                            href={`/admin/soumissions/${s.id}`}
                            className="text-[var(--color-brand)] font-body text-xs font-bold uppercase tracking-wide hover:underline"
                          >
                            VOIR &rarr;
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <span aria-hidden="true" className="material-symbols-outlined text-4xl text-[var(--color-light-border-2)] block mb-3">description</span>
                      <p className="text-[var(--color-dark-text-2)] font-body text-sm">Aucune proposition pour le moment.</p>
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
