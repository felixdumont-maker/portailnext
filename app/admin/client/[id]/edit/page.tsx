'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Client {
  id: number
  nom_complet: string
  email: string
  nom_entreprise: string | null
  telephone: string | null
  mode_facturation: string
  adresse_facturation: string | null
  ville_facturation: string | null
  province_facturation: string
  code_postal_facturation: string | null
  pays_facturation: string
}

const PROVINCES = [
  'Québec', 'Ontario', 'Colombie-Britannique', 'Alberta',
  'Manitoba', 'Saskatchewan', 'Nouvelle-Écosse',
  'Nouveau-Brunswick', 'Terre-Neuve-et-Labrador',
  'Île-du-Prince-Édouard',
]

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="font-body text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)]">
          {label}
        </label>
        {optional && (
          <span className="text-[10px] text-[var(--color-dark-text-2)] font-body uppercase tracking-tight">Optionnel</span>
        )}
      </div>
      {children}
    </div>
  )
}

const inputCls = "bg-[var(--color-light-0)] border-none rounded-xl p-4 font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none w-full"

export default function EditClientPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [nomComplet, setNomComplet] = useState('')
  const [email, setEmail] = useState('')
  const [nomEntreprise, setNomEntreprise] = useState('')
  const [telephone, setTelephone] = useState('')
  const [modeFacturation, setModeFacturation] = useState('projet')
  const [adresse, setAdresse] = useState('')
  const [ville, setVille] = useState('')
  const [province, setProvince] = useState('Québec')
  const [codePostal, setCodePostal] = useState('')
  const [pays, setPays] = useState('Canada')

  useEffect(() => {
    fetch(`/api/v1/admin/client/${id}`, { credentials: 'include' })
      .then(r => r.json())
      .then((c: Client) => {
        setNomComplet(c.nom_complet || '')
        setEmail(c.email || '')
        setNomEntreprise(c.nom_entreprise || '')
        setTelephone(c.telephone || '')
        setModeFacturation(c.mode_facturation || 'projet')
        setAdresse(c.adresse_facturation || '')
        setVille(c.ville_facturation || '')
        setProvince(c.province_facturation || 'Québec')
        setCodePostal(c.code_postal_facturation || '')
        setPays(c.pays_facturation || 'Canada')
        setLoading(false)
      })
      .catch(() => { setError('Impossible de charger le client.'); setLoading(false) })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!nomComplet.trim()) { setError('Le nom complet est obligatoire.'); return }
    if (!email.trim()) { setError("L'email est obligatoire."); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/v1/admin/client/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom_complet: nomComplet.trim(),
          email: email.trim().toLowerCase(),
          nom_entreprise: nomEntreprise.trim() || null,
          telephone: telephone.trim() || null,
          mode_facturation: modeFacturation,
          adresse_facturation: adresse.trim() || null,
          ville_facturation: ville.trim() || null,
          province_facturation: province,
          code_postal_facturation: codePostal.trim() || null,
          pays_facturation: pays.trim() || 'Canada',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('Modifications enregistrées.')
        setTimeout(() => router.push(`/admin/client/${id}`), 800)
      } else {
        setError(data.error || 'Erreur lors de la sauvegarde.')
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer ce client ? Cette action est irréversible.')) return
    try {
      await fetch(`/api/v1/admin/client/${id}`, { method: 'DELETE', credentials: 'include' })
      router.push('/admin/clients')
    } catch {
      setError('Erreur lors de la suppression.')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-[var(--color-dark-text-2)] font-body">Chargement...</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">

      <Link href={`/admin/client/${id}`}
        className="inline-flex items-center gap-2 text-[var(--color-dark-text-2)] font-body text-sm mb-8 hover:text-[var(--color-dark-1)] transition-colors">
        ← Retour au client
      </Link>

      <h1 className="font-display text-[var(--text-3xl)] tracking-tight leading-none text-[var(--color-dark-1)] mb-10 uppercase">
        MODIFIER LE CLIENT
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">

        {error && (
          <div className="bg-[var(--color-error-bg)] text-[var(--color-error-text)] px-4 py-3 rounded-lg text-sm font-medium font-body">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-[var(--color-success-bg)] text-[var(--color-success-text)] px-4 py-3 rounded-lg text-sm font-medium font-body">
            {success}
          </div>
        )}

        {/* Informations personnelles */}
        <section className="bg-white rounded-3xl p-8 md:p-10">
          <h2 className="font-display text-[var(--text-xl)] text-[var(--color-dark-text-2)] uppercase mb-8 tracking-wide">
            INFORMATIONS PERSONNELLES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <Field label="Nom complet">
              <input type="text" aria-label="Nom complet" value={nomComplet} onChange={e => setNomComplet(e.target.value)} required className={inputCls} />
            </Field>

            <Field label="Adresse email">
              <input type="email" aria-label="Adresse courriel" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} />
            </Field>

            <Field label="Nom d'entreprise" optional>
              <input type="text" aria-label="Nom entreprise" value={nomEntreprise} onChange={e => setNomEntreprise(e.target.value)} className={inputCls} />
            </Field>

            <Field label="Téléphone" optional>
              <input type="tel" aria-label="Téléphone" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="819 555-0000" className={inputCls} />
            </Field>

          </div>
        </section>

        {/* Facturation */}
        <section className="bg-white rounded-3xl p-8 md:p-10">
          <h2 className="font-display text-[var(--text-xl)] text-[var(--color-dark-text-2)] uppercase mb-8 tracking-wide">
            FACTURATION
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <Field label="Mode de facturation">
              <select value={modeFacturation} onChange={e => setModeFacturation(e.target.value)} className={inputCls + ' appearance-none'}>
                <option value="projet">Par projet (facture automatique)</option>
                <option value="mensuel">Mensuel (facture consolidée fin de mois)</option>
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field label="Adresse" optional>
                <input type="text" aria-label="Adresse" value={adresse} onChange={e => setAdresse(e.target.value)} placeholder="123 rue Exemple" className={inputCls} />
              </Field>
            </div>

            <Field label="Ville" optional>
              <input type="text" aria-label="Ville" value={ville} onChange={e => setVille(e.target.value)} className={inputCls} />
            </Field>

            <Field label="Code postal" optional>
              <input type="text" aria-label="Code postal" value={codePostal} onChange={e => setCodePostal(e.target.value)} placeholder="G1A 0A1" className={inputCls} />
            </Field>

            <Field label="Province">
              <select value={province} onChange={e => setProvince(e.target.value)} className={inputCls + ' appearance-none'}>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>

            <Field label="Pays">
              <input type="text" aria-label="Pays" value={pays} onChange={e => setPays(e.target.value)} className={inputCls} />
            </Field>

          </div>
        </section>

        {/* Sauvegarder */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-display text-[var(--text-xl)] py-6 rounded-full tracking-widest uppercase transition-all disabled:opacity-60"
        >
          {saving ? 'SAUVEGARDE...' : 'SAUVEGARDER LES MODIFICATIONS'}
        </button>

        {/* Zone dangereuse */}
        <section className="rounded-3xl p-8 md:p-10 border-2 border-dashed border-red-300 bg-red-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="font-display text-[var(--text-xl)] text-[var(--color-brand)] tracking-wide uppercase">
                ZONE DANGEREUSE
              </h2>
              <p className="text-[var(--color-dark-text-2)] text-sm font-body max-w-md">
                La suppression de ce client est irréversible. Tous ses projets et factures associés seront également supprimés.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              className="border-2 border-[var(--color-brand)] text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white transition-all px-8 py-3 rounded-full font-body text-xs font-bold uppercase tracking-widest whitespace-nowrap"
            >
              SUPPRIMER CE CLIENT
            </button>
          </div>
        </section>

      </form>
    </div>
  )
}
