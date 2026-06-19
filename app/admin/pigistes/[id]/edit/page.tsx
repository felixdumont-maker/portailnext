'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Form = {
  nom_complet: string
  email: string
  telephone: string
  adresse: string
  ville: string
  province: string
  code_postal: string
  numero_tps: string
  numero_tvq: string
}

const EMPTY: Form = {
  nom_complet: '', email: '', telephone: '',
  adresse: '', ville: '', province: '', code_postal: '',
  numero_tps: '', numero_tvq: '',
}

export default function EditPigistePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [form, setForm] = useState<Form>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/v1/admin/pigistes/${id}`, { credentials: 'include' })
      .then(r => { if (!r.ok) { router.push('/admin/pigistes'); return null } return r.json() })
      .then(data => {
        if (data) setForm({
          nom_complet: data.nom_complet ?? '',
          email:       data.email       ?? '',
          telephone:   data.telephone   ?? '',
          adresse:     data.adresse     ?? '',
          ville:       data.ville       ?? '',
          province:    data.province    ?? '',
          code_postal: data.code_postal ?? '',
          numero_tps:  data.numero_tps  ?? '',
          numero_tvq:  data.numero_tvq  ?? '',
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const set = (k: keyof Form, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nom_complet.trim()) { setError('Le nom complet est requis.'); return }
    if (!form.email.trim())       { setError("L'adresse courriel est requise."); return }
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/v1/admin/pigistes/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur serveur'); return }
      router.push(`/admin/pigistes/${id}`)
    } catch { setError('Erreur de connexion') }
    finally { setSaving(false) }
  }

  const Field = ({
    label, name, type = 'text', placeholder = '', required = false,
  }: {
    label: string; name: keyof Form; type?: string; placeholder?: string; required?: boolean
  }) => (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body">
        {label}{required && <span className="text-[var(--color-brand)] ml-1">*</span>}
      </label>
      <input
        type={type}
        value={form[name]}
        onChange={e => set(name, e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        required={required}
        className="bg-[var(--color-light-0)] border-none rounded-xl px-4 py-3 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40"
      />
    </div>
  )

  if (loading) return <p className="text-[var(--color-dark-text-2)] font-body p-8">Chargement...</p>

  return (
    <div className="max-w-2xl mx-auto">

      <Link
        href={`/admin/pigistes/${id}`}
        className="inline-flex items-center gap-2 text-[var(--color-dark-text-2)] mb-6 hover:text-[var(--color-dark-1)] transition-colors font-body text-sm"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_back</span>
        Retour au pigiste
      </Link>

      <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] mb-10 tracking-tight leading-none uppercase">
        MODIFIER LE PIGISTE
      </h1>

      {error && (
        <div role="alert" className="mb-6 px-5 py-4 bg-[var(--color-error-bg)] border border-[var(--color-error-light)] rounded-2xl text-[var(--color-error-text)] font-body text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        {/* Informations principales */}
        <div className="bg-white rounded-3xl p-8 shadow-sm space-y-5">
          <h2 className="font-display text-[var(--text-lg)] text-[var(--color-dark-text-2)] tracking-wide">
            INFORMATIONS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Nom légal" name="nom_complet" placeholder="Jean Tremblay"        required />
            <Field label="Courriel"  name="email"       type="email" placeholder="jean@email.com" required />
            <Field label="Téléphone" name="telephone"   type="tel"   placeholder="819 555-0000" />
          </div>
        </div>

        {/* Adresse */}
        <div className="bg-white rounded-3xl p-8 shadow-sm space-y-5">
          <h2 className="font-display text-[var(--text-lg)] text-[var(--color-dark-text-2)] tracking-wide">
            ADRESSE
          </h2>
          <Field label="Adresse" name="adresse" placeholder="123, rue des Érables" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Field label="Ville"       name="ville"       placeholder="Shawinigan" />
            <Field label="Province"    name="province"    placeholder="QC" />
            <Field label="Code postal" name="code_postal" placeholder="G9N 1A1" />
          </div>
        </div>

        {/* Numéros fiscaux */}
        <div className="bg-white rounded-3xl p-8 shadow-sm space-y-5">
          <h2 className="font-display text-[var(--text-lg)] text-[var(--color-dark-text-2)] tracking-wide">
            NUMÉROS FISCAUX
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Numéro TPS" name="numero_tps" placeholder="123456789 RT0001" />
            <Field label="Numéro TVQ" name="numero_tvq" placeholder="1234567890 TQ0001" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 order-1 md:order-2 bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-display text-base py-4 rounded-full tracking-widest uppercase transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
            {!saving && <span aria-hidden="true" className="material-symbols-outlined text-lg">check</span>}
          </button>
          <Link
            href={`/admin/pigistes/${id}`}
            className="flex-1 order-2 md:order-1 bg-[var(--color-light-0)] text-[var(--color-dark-3)] py-4 px-8 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-light-border)] transition-colors text-center"
          >
            Annuler
          </Link>
        </div>

      </form>
    </div>
  )
}
