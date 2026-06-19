'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Template {
  id: number
  nom: string
  description: string | null
  titre_template: string
  est_actif: number
  nb_options: number
  created_at: string
}

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading]     = useState(true)
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null)
  const [creating, setCreating]   = useState(false)
  const [newNom, setNewNom]       = useState('')

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/admin/soumissions/templates', { credentials: 'include' })
      if (!res.ok) throw new Error()
      setTemplates(await res.json())
    } catch {
      showToast('Impossible de charger les modèles', false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newNom.trim()) return
    try {
      const res = await fetch('/api/v1/admin/soumissions/templates', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: newNom.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Erreur', false); return }
      router.push(`/admin/soumissions/templates/${data.id}`)
    } catch {
      showToast('Erreur de connexion', false)
    }
  }

  async function handleDelete(id: number, nom: string) {
    if (!confirm(`Retirer le modèle "${nom}" ? Cette action est irréversible.`)) return
    try {
      const res = await fetch(`/api/v1/admin/soumissions/templates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) { showToast('Erreur lors de la suppression', false); return }
      showToast('Modèle retiré')
      setTemplates(prev => prev.filter(t => t.id !== id))
    } catch {
      showToast('Erreur de connexion', false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {toast && (
        <div role="status" aria-live="polite" className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-3 ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center gap-4 mb-10">
        <div>
          <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] uppercase tracking-tight leading-none">
            MODÈLES DE PROPOSITIONS
          </h1>
          <p className="text-[var(--color-dark-text-2)] font-body text-sm mt-1">
            Gabarits réutilisables pour créer des propositions rapidement.
          </p>
        </div>
      </div>

      {/* Creer un template */}
      <section className="bg-white rounded-3xl shadow-sm p-8 mb-8">
        <h2 className="font-display text-lg uppercase tracking-wide text-[var(--color-dark-1)] mb-5 flex items-center gap-2">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]">add_box</span>
          Nouveau modèle
        </h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newNom}
            onChange={e => setNewNom(e.target.value)}
            placeholder="Nom du modèle..."
            required
            className="flex-1 bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-2xl px-4 py-3 font-body text-sm text-[var(--color-dark-1)] outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
          />
          <button
            type="submit"
            style={{
              background: '#e83b14',
              color: 'white',
              border: 'none',
              borderRadius: 999,
              padding: '0 24px',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            Creer
          </button>
        </form>
      </section>

      {/* Liste */}
      <section className="bg-white rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center font-body text-sm text-[var(--color-dark-text-2)]">Chargement...</div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center font-body text-sm text-[var(--color-dark-text-2)]">
            Aucun modèle. Créez-en un ci-dessus.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-light-border)]">
            {templates.map(t => (
              <li key={t.id} className="flex items-center gap-4 px-6 py-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-display text-base uppercase tracking-wide text-[var(--color-dark-1)]">{t.nom}</span>
                    {!t.est_actif && (
                      <span style={{ background: '#f1f1f1', color: '#888', borderRadius: 999, padding: '2px 10px', fontSize: '0.72rem', fontFamily: 'var(--font-body)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Inactif
                      </span>
                    )}
                    <span style={{ background: 'var(--color-light-0)', color: 'var(--color-dark-text-2)', borderRadius: 999, padding: '2px 10px', fontSize: '0.72rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                      {t.nb_options} option{t.nb_options !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {t.description && (
                    <p className="font-body text-sm text-[var(--color-dark-text-2)] mt-1 truncate">{t.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/soumissions/templates/${t.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'transparent',
                      color: '#e83b14',
                      outline: '2px solid #e83b14',
                      borderRadius: 999,
                      padding: '6px 16px',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(t.id, t.nom)}
                    aria-label={`Retirer ${t.nom}`}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-dark-text-2)',
                      cursor: 'pointer',
                      padding: 8,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
