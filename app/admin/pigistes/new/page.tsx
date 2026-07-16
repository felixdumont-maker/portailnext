'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const inputCls = "w-full bg-[var(--color-light-0)] border-none rounded-xl px-4 py-3 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40"
const labelCls = "block text-[10px] font-bold uppercase tracking-wide text-[var(--color-dark-text-2)] font-body mb-1.5"

export default function NouveauPigistePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nom_complet: '',
    email: '',
    password: '',
    telephone: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set = (k: keyof typeof form, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nom_complet.trim()) { setError('Le nom complet est requis.'); return }
    if (!form.email.trim())       { setError("L'adresse courriel est requise."); return }
    if (!form.password.trim())    { setError('Un mot de passe temporaire est requis.'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/v1/admin/pigistes', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur serveur'); return }
      router.push('/admin/pigistes')
    } catch { setError('Erreur de connexion') }
    finally { setSaving(false) }
  }

  const Field = ({
    label, name, type = 'text', placeholder = '', required = false,
  }: {
    label: string; name: keyof typeof form; type?: string; placeholder?: string; required?: boolean
  }) => (
    <div>
      <label className={labelCls}>
        {label}{required && <span className="text-[var(--color-brand)] ml-1">*</span>}
      </label>
      <input
        type={type}
        value={form[name]}
        onChange={e => set(name, e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        required={required}
        className={inputCls}
      />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">

      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-xs font-body text-[var(--color-dark-text-2)] mb-5">
        <span className="font-bold uppercase tracking-wide text-[var(--color-brand)]">Équipe</span>
        <span aria-hidden="true" className="material-symbols-outlined text-sm">chevron_right</span>
        <Link href="/admin/pigistes" className="hover:text-[var(--color-brand)] transition-colors">Pigistes</Link>
        <span aria-hidden="true" className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-[var(--color-dark-1)] font-semibold">Nouveau</span>
      </nav>

      <header className="mb-6">
        <h1 className="font-display text-[var(--color-dark-0)] leading-tight" style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Nouveau pigiste
        </h1>
        <p className="font-body text-[13px] text-[var(--color-dark-text-2)] mt-1">Ajoutez un collaborateur externe à votre équipe.</p>
      </header>

      {error && (
        <div role="alert" className="mb-6 px-5 py-4 bg-[var(--color-error-bg)] rounded-xl text-[var(--color-error-text)] font-body text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        {/* Informations principales */}
        <section className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-6 space-y-4">
          <h2 className="font-display text-sm uppercase tracking-wide text-[var(--color-dark-1)]">Informations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nom légal"          name="nom_complet" placeholder="Jean Tremblay"           required />
            <Field label="Courriel"           name="email"       type="email" placeholder="jean@email.com"  required />
            <Field label="Mot de passe temp." name="password"    type="password" placeholder="••••••••"     required />
            <Field label="Téléphone"          name="telephone"   type="tel"   placeholder="819 555-0000" />
          </div>
          <p className="font-body text-xs text-[var(--color-dark-text-2)]">
            Le pigiste pourra changer son mot de passe depuis son espace après la première connexion.
          </p>
        </section>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 order-1 md:order-2 bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-body font-bold text-sm py-3.5 rounded-full uppercase tracking-wide transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? 'Création…' : 'Créer le pigiste'}
            {!saving && <span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_forward</span>}
          </button>
          <Link
            href="/admin/pigistes"
            className="flex-1 order-2 md:order-1 bg-[var(--color-light-0)] text-[var(--color-dark-1)] py-3.5 px-8 rounded-full font-body font-bold text-sm uppercase tracking-wide hover:bg-[var(--color-light-border)] transition-colors text-center"
          >
            Annuler
          </Link>
        </div>

      </form>
    </div>
  )
}
