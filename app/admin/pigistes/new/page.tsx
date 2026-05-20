'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NouveauPigistePage() {
  const router = useRouter()
  const [form, setForm] = useState({ nom_complet: '', email: '', password: '', telephone: '', adresse: '', ville: '', province: 'Québec', code_postal: '', numero_tps: '', numero_tvq: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/v1/admin/pigistes', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur serveur'); return }
      router.push(`/admin/pigistes/${data.id}`)
    } catch { setError('Erreur de connexion') }
    finally { setSaving(false) }
  }

  const field = (label: string, key: string, type = 'text', placeholder = '') => (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body">{label}</label>
      <input type={type} value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        className="bg-[var(--color-light-0)] border-none rounded-xl px-4 py-3 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/pigistes" className="flex items-center gap-2 text-[var(--color-dark-text-2)] mb-6 hover:text-[var(--color-dark-1)] transition-colors font-body text-sm">
        <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_back</span>
        Retour aux pigistes
      </Link>
      <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] mb-10 tracking-tight leading-none uppercase">NOUVEAU PIGISTE</h1>

      {error && <div className="mb-6 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 font-body text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm space-y-5">
          <h2 className="font-display text-[var(--text-lg)] text-[var(--color-dark-text-2)] tracking-wide">INFORMATIONS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {field('Nom complet', 'nom_complet')}
            {field('Email', 'email', 'email')}
            {field('Mot de passe', 'password', 'password', 'Temporaire')}
            {field('Téléphone', 'telephone', 'tel')}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm space-y-5">
          <h2 className="font-display text-[var(--text-lg)] text-[var(--color-dark-text-2)] tracking-wide">ADRESSE</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {field('Adresse', 'adresse')}
            {field('Ville', 'ville')}
            {field('Province', 'province')}
            {field('Code postal', 'code_postal')}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm space-y-5">
          <h2 className="font-display text-[var(--text-lg)] text-[var(--color-dark-text-2)] tracking-wide">TAXES (SI APPLICABLE)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {field('Numéro TPS', 'numero_tps')}
            {field('Numéro TVQ', 'numero_tvq')}
          </div>
          <p className="font-body text-xs text-[var(--color-dark-text-2)]">Si le pigiste a un numéro TPS/TVQ, les taxes seront calculées automatiquement sur ses factures.</p>
        </div>

        <button type="submit" disabled={saving} className="w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-display text-[var(--text-xl)] py-5 rounded-full tracking-widest uppercase transition-all disabled:opacity-60">
          {saving ? 'CRÉATION...' : 'CRÉER LE PIGISTE'}
        </button>
      </form>
    </div>
  )
}
