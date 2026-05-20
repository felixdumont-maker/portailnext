'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Plateforme = 'instagram' | 'facebook' | 'linkedin'

export default function NouveauPostPage() {
  const router = useRouter()
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [plateformes, setPlateformes] = useState<Plateforme[]>(['instagram'])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const togglePlateforme = (p: Plateforme) => {
    setPlateformes(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titre.trim() || !date) { setError('Titre et date requis.'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/v1/admin/marketing', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre, description, date_publication: date, plateformes }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error || 'Erreur serveur'); return }
      router.push(`/admin/marketing?mois=${date.slice(0, 7)}`)
    } catch {
      setError('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const PLATEFORMES = [
    { id: 'instagram' as Plateforme, label: 'Instagram', icon: 'photo_camera' },
    { id: 'facebook' as Plateforme, label: 'Facebook', icon: 'public' },
    { id: 'linkedin' as Plateforme, label: 'LinkedIn', icon: 'business_center' },
  ]

  return (
    <div className="max-w-3xl mx-auto">

      {/* Back */}
      <Link href="/admin/marketing"
        className="flex items-center gap-2 text-[var(--color-dark-text-2)] mb-6 hover:text-[var(--color-dark-1)] transition-colors font-body text-sm">
        <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_back</span>
        Retour au marketing
      </Link>

      {/* Title */}
      <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] mb-12 tracking-tight leading-none uppercase">
        NOUVEAU POST
      </h1>

      {error && (
        <div className="mb-6 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 font-body text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Contenu */}
        <section className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="font-display text-[var(--text-lg)] text-[var(--color-dark-text-2)] mb-8 tracking-wide uppercase">
            CONTENU DU POST
          </h2>
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body">
                Titre
              </label>
              <input
                type="text"
                value={titre}
                onChange={e => setTitre(e.target.value)}
                placeholder="Entrez le titre du post"
                className="w-full bg-[var(--color-light-0)] border-none rounded-xl px-4 py-4 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body">
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="De quoi parle votre publication ?"
                rows={4}
                className="w-full bg-[var(--color-light-0)] border-none rounded-xl px-4 py-4 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body">
                Date de publication
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full bg-[var(--color-light-0)] border-none rounded-xl px-4 py-4 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40"
              />
            </div>
          </div>
        </section>

        {/* Plateformes */}
        <section className="space-y-4">
          <h2 className="font-display text-[var(--text-lg)] text-[var(--color-dark-text-2)] tracking-wide px-2 uppercase">
            PLATEFORMES
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {PLATEFORMES.map(p => {
              const active = plateformes.includes(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlateforme(p.id)}
                  className={`p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] border-2 ${
                    active
                      ? 'bg-[var(--color-error-bg-2)] border-[var(--color-brand)]'
                      : 'bg-[var(--color-light-0)] border-transparent hover:bg-[var(--color-light-0)]'
                  }`}
                >
                  <span className={`material-symbols-outlined text-3xl ${active ? 'text-[var(--color-brand)]' : 'text-[var(--color-dark-text-2)]'}`}>
                    {p.icon}
                  </span>
                  <span className={`text-xs font-bold tracking-widest uppercase font-body ${active ? 'text-[var(--color-brand)]' : 'text-[var(--color-dark-text-2)]'}`}>
                    {p.label}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Médias */}
        <section className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="font-display text-[var(--text-lg)] text-[var(--color-dark-text-2)] mb-6 tracking-wide uppercase">
            MÉDIAS
          </h2>
          <div className="border-2 border-dashed border-[var(--color-light-border-2)] rounded-2xl p-12 flex flex-col items-center justify-center gap-4 bg-[var(--color-light-1)]/30">
            <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-dark-text-2)] text-4xl">cloud_upload</span>
            <p className="text-[var(--color-dark-text-2)] font-body font-medium">Glissez vos fichiers ici</p>
            <button
              type="button"
              className="bg-[var(--color-brand)] text-white font-display px-8 py-2 rounded-full text-lg tracking-wider hover:bg-[var(--color-brand-hover)] transition-all"
            >
              PARCOURIR
            </button>
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-display text-[var(--text-xl)] py-6 rounded-full tracking-widest uppercase transition-all disabled:opacity-60"
        >
          {saving ? 'CRÉATION...' : 'CRÉER LE POST'}
        </button>

      </form>
    </div>
  )
}
