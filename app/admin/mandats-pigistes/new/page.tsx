'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Tarif { id: string; categorie: string; label: string; prix: number; unite: string }

type Form = {
  titre: string
  id_pigiste: string
  id_projet: string
  type_prestation: string
  quantite: string
  date_debut: string
  date_echeance: string
  description: string
  notes_admin: string
}

const EMPTY: Form = {
  titre: '', id_pigiste: '', id_projet: '',
  type_prestation: '', quantite: '1',
  date_debut: '', date_echeance: '',
  description: '', notes_admin: '',
}

export default function NouveauMandatPigistePage() {
  const router = useRouter()
  const [form, setForm]         = useState<Form>(EMPTY)
  const [pigistes, setPigistes] = useState<{ id: number; nom_complet: string; is_producteur_principal: boolean }[]>([])
  const [projets, setProjets]   = useState<{ id: number; nom_projet: string }[]>([])
  const [tarifs, setTarifs]     = useState<Tarif[]>([])
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    fetch('/api/v1/admin/pigistes', { credentials: 'include' })
      .then(r => r.json()).then(d => setPigistes(Array.isArray(d) ? d : [])).catch(() => {})
    fetch('/api/v1/admin/projets', { credentials: 'include' })
      .then(r => r.json()).then(d => setProjets(Array.isArray(d) ? d : [])).catch(() => {})
    fetch('/api/v1/admin/tarifs-pigiste', { credentials: 'include' })
      .then(r => r.json()).then(d => setTarifs(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  const set = (k: keyof Form, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const tarifSelectionne = tarifs.find(t => t.id === form.type_prestation)
  const montantAuto = tarifSelectionne
    ? tarifSelectionne.prix * (parseInt(form.quantite) || 1)
    : null

  // Grouper tarifs par catégorie
  const categories = tarifs.reduce<Record<string, Tarif[]>>((acc, t) => {
    if (!acc[t.categorie]) acc[t.categorie] = []
    acc[t.categorie].push(t)
    return acc
  }, {})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titre.trim()) { setError('Le titre est requis.'); return }
    if (!form.id_pigiste)   { setError('Veuillez sélectionner un pigiste.'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/v1/admin/mandats-pigistes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre:            form.titre,
          id_pigiste:       Number(form.id_pigiste),
          id_projet:        form.id_projet ? Number(form.id_projet) : null,
          type_prestation:  form.type_prestation || null,
          quantite:         parseInt(form.quantite) || 1,
          date_debut:       form.date_debut    || null,
          date_echeance:    form.date_echeance || null,
          description:      form.description   || null,
          notes_admin:      form.notes_admin   || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur serveur'); return }
      router.push(`/admin/mandats-pigistes/${data.id}`)
    } catch { setError('Erreur de connexion') }
    finally { setSaving(false) }
  }

  const inputCls = 'bg-[var(--color-light-0)] border-none rounded-xl px-4 py-3 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40 w-full'
  const labelCls = 'text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body'

  return (
    <div className="max-w-2xl mx-auto">

      <Link href="/admin/mandats-pigistes"
        className="inline-flex items-center gap-2 text-[var(--color-dark-text-2)] mb-6 hover:text-[var(--color-dark-1)] transition-colors font-body text-sm">
        <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_back</span>
        Retour aux mandats
      </Link>

      <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] mb-10 tracking-tight leading-none uppercase">
        NOUVEAU MANDAT
      </h1>

      {error && (
        <div role="alert" className="mb-6 px-5 py-4 bg-[var(--color-error-bg)] border border-[var(--color-error-light)] rounded-2xl text-[var(--color-error-text)] font-body text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        {/* Mandat */}
        <div className="bg-white rounded-3xl p-8 shadow-sm space-y-5">
          <h2 className="font-display text-[var(--text-lg)] text-[var(--color-dark-text-2)] tracking-wide">MANDAT</h2>

          <div className="flex flex-col gap-2">
            <label className={labelCls}>Titre <span className="text-[var(--color-brand)] ml-1">*</span></label>
            <input type="text" value={form.titre} onChange={e => set('titre', e.target.value)}
              placeholder="Ex. : Montage Short/Reel — Royal" aria-label="Titre du mandat" required className={inputCls} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className={labelCls}>Pigiste <span className="text-[var(--color-brand)] ml-1">*</span></label>
              <select value={form.id_pigiste} onChange={e => set('id_pigiste', e.target.value)}
                aria-label="Sélectionner un pigiste" required className={inputCls}>
                <option value="">Choisir un pigiste…</option>
                {pigistes.filter(p => p.is_producteur_principal).map(p => <option key={p.id} value={p.id}>{p.nom_complet}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelCls}>Projet lié</label>
              <select value={form.id_projet} onChange={e => set('id_projet', e.target.value)}
                aria-label="Lier à un projet (optionnel)" className={inputCls}>
                <option value="">Aucun projet lié</option>
                {projets.map(p => <option key={p.id} value={p.id}>{p.nom_projet}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Prestation & tarif */}
        <div className="bg-white rounded-3xl p-8 shadow-sm space-y-5">
          <h2 className="font-display text-[var(--text-lg)] text-[var(--color-dark-text-2)] tracking-wide">PRESTATION & TARIF</h2>

          <div className="flex flex-col gap-2">
            <label className={labelCls}>Type de prestation</label>
            <select value={form.type_prestation} onChange={e => set('type_prestation', e.target.value)}
              aria-label="Type de prestation" className={inputCls}>
              <option value="">Choisir une prestation…</option>
              {Object.entries(categories).map(([cat, items]) => (
                <optgroup key={cat} label={cat}>
                  {items.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.label} — {t.prix}$/{t.unite}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {tarifSelectionne && (
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className={labelCls}>Quantité ({tarifSelectionne.unite})</label>
                <input type="number" value={form.quantite} onChange={e => set('quantite', e.target.value)}
                  min="1" step="1" aria-label="Quantité" className={inputCls} />
              </div>
              <div className="flex flex-col gap-2">
                <label className={labelCls}>Montant calculé</label>
                <div className="bg-[var(--color-success-bg)] rounded-xl px-4 py-3 flex items-center">
                  <span className="font-display text-[var(--text-xl)] text-[var(--color-success-text)]">
                    {montantAuto?.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                  </span>
                  <span className="font-body text-xs text-[var(--color-success-text)] ml-2 opacity-70">
                    ({tarifSelectionne.prix}$/{tarifSelectionne.unite} × {form.quantite})
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Planning */}
        <div className="bg-white rounded-3xl p-8 shadow-sm space-y-5">
          <h2 className="font-display text-[var(--text-lg)] text-[var(--color-dark-text-2)] tracking-wide">PLANNING</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className={labelCls}>Date de début</label>
              <input type="date" value={form.date_debut} onChange={e => set('date_debut', e.target.value)}
                aria-label="Date de début" className={inputCls} />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelCls}>Date d'échéance</label>
              <input type="date" value={form.date_echeance} onChange={e => set('date_echeance', e.target.value)}
                aria-label="Date d'échéance" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Détails */}
        <div className="bg-white rounded-3xl p-8 shadow-sm space-y-5">
          <h2 className="font-display text-[var(--text-lg)] text-[var(--color-dark-text-2)] tracking-wide">DÉTAILS</h2>
          <div className="flex flex-col gap-2">
            <label className={labelCls}>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Décrivez le travail attendu..." aria-label="Description du mandat"
              rows={4} className={`${inputCls} resize-none`} />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelCls}>Notes admin</label>
            <textarea value={form.notes_admin} onChange={e => set('notes_admin', e.target.value)}
              placeholder="Notes internes, non visibles par le pigiste..." aria-label="Notes admin"
              rows={3} className={`${inputCls} resize-none`} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <button type="submit" disabled={saving}
            className="flex-1 order-1 md:order-2 bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-display text-base py-4 rounded-full tracking-widest uppercase transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? 'Création…' : 'Créer le mandat'}
            {!saving && <span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_forward</span>}
          </button>
          <Link href="/admin/mandats-pigistes"
            className="flex-1 order-2 md:order-1 bg-[var(--color-light-0)] text-[var(--color-dark-3)] py-4 px-8 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-light-border)] transition-colors text-center">
            Annuler
          </Link>
        </div>

      </form>
    </div>
  )
}
