'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Client {
  id: number
  nom_complet: string
  nom_entreprise: string | null
}

interface Projet {
  id: number
  nom_projet: string
  titre_affiche: string | null
  statut: string
  localisation: string | null
  date_livraison_estimee: string | null
  lien_gdrive: string | null
  lien_site_test: string | null
  client_id: number
  client_nom: string
  nom_service: string
}

const STATUTS = [
  'Documents à donner',
  'En attente de rendez-vous',
  'Documents reçus',
  'Travaux en cours',
  'En révision',
  'Finalisation',
  'Travaux terminés',
  'Annulé',
]

export default function EditProjetPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id

  const [projet, setProjet] = useState<Projet | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Champs du formulaire
  const [nomProjet, setNomProjet] = useState('')
  const [titreAffiche, setTitreAffiche] = useState('')
  const [statut, setStatut] = useState('')
  const [localisation, setLocalisation] = useState('')
  const [dateLivraison, setDateLivraison] = useState('')
  const [lienGdrive, setLienGdrive] = useState('')
  const [lienSiteTest, setLienSiteTest] = useState('')
  const [idClient, setIdClient] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/admin/projet/${id}`, { credentials: 'include' }).then(r => r.json()),
      fetch('/api/v1/admin/clients', { credentials: 'include' }).then(r => r.json()),
    ]).then(([p, c]) => {
      setProjet(p)
      setClients(c)
      setNomProjet(p.nom_projet || '')
      setTitreAffiche(p.titre_affiche || '')
      setStatut(p.statut || 'Documents à donner')
      setLocalisation(p.localisation || '')
      setDateLivraison(p.date_livraison_estimee || '')
      setLienGdrive(p.lien_gdrive || '')
      setLienSiteTest(p.lien_site_test || '')
      setIdClient(String(p.client_id || ''))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!nomProjet.trim()) { setError('Le nom du projet est obligatoire.'); return; }
    setSaving(true)
    try {
      const res = await fetch(`/api/v1/admin/projet/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom_projet: nomProjet.trim(),
          titre_affiche: titreAffiche.trim() || null,
          statut,
          localisation: localisation.trim() || null,
          date_livraison_estimee: dateLivraison || null,
          lien_gdrive: lienGdrive.trim() || null,
          lien_site_test: lienSiteTest.trim() || null,
          id_client: idClient || null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('Modifications enregistrées.')
        setTimeout(() => router.push(`/admin/projet/${id}`), 800)
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
    if (!confirm('Supprimer ce projet ? Cette action est irréversible.')) return
    try {
      await fetch(`/api/v1/admin/projet/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      router.push('/admin/projets')
    } catch {
      setError('Erreur lors de la suppression.')
    }
  }

  if (loading) return (
    <p className="text-[var(--color-dark-text-2)] font-body text-center mt-20">Chargement...</p>
  )

  if (!projet) return (
    <p className="text-[var(--color-brand)] font-body text-center mt-20">Projet introuvable.</p>
  )

  return (
    <div className="max-w-3xl mx-auto">

      <Link href={`/admin/projet/${id}`}
        className="inline-flex items-center gap-2 text-[var(--color-dark-text-2)] font-body text-sm mb-8 hover:text-[var(--color-dark-1)] transition-colors">
        ← Retour au projet
      </Link>

      <h1 className="font-display text-[var(--text-3xl)] tracking-tight leading-none text-[var(--color-dark-1)] mb-10 uppercase">
        MODIFIER LE PROJET
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

        {/* Informations générales */}
        <section className="bg-white rounded-3xl p-8">
          <h2 className="font-display text-[var(--text-xl)] text-[var(--color-dark-text-2)] uppercase mb-8 tracking-wide">
            INFORMATIONS GÉNÉRALES
          </h2>
          <div className="space-y-6">

            {/* Nom projet */}
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase mb-2 tracking-widest font-body">
                Nom du projet <span className="text-[var(--color-brand)]">*</span>
              </label>
              <input
                type="text"
                value={nomProjet}
                onChange={e => setNomProjet(e.target.value)}
                required
                className="w-full bg-[var(--color-light-0)] border-none rounded-2xl px-6 py-4 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40"
              />
            </div>

            {/* Titre affiché au client */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase tracking-widest font-body">
                  Titre affiché au client
                </label>
                <span className="text-[10px] text-[var(--color-dark-text-2)] uppercase tracking-tight font-body">Optionnel</span>
              </div>
              <input
                type="text"
                value={titreAffiche}
                onChange={e => setTitreAffiche(e.target.value)}
                placeholder="Laisser vide pour utiliser le nom du projet"
                className="w-full bg-[var(--color-light-0)] border-none rounded-2xl px-6 py-4 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40 placeholder:text-[var(--color-light-text-3)]"
              />
            </div>

            {/* Client */}
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase mb-2 tracking-widest font-body">
                Client associé
              </label>
              <select
                value={idClient}
                onChange={e => setIdClient(e.target.value)}
                className="w-full bg-[var(--color-light-0)] border-none rounded-2xl px-6 py-4 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40 appearance-none"
              >
                <option value="">— Sélectionner un client —</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nom_complet}{c.nom_entreprise ? ` — ${c.nom_entreprise}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Statut + Date livraison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase mb-2 tracking-widest font-body">
                  Statut
                </label>
                <select
                  value={statut}
                  onChange={e => setStatut(e.target.value)}
                  className="w-full bg-[var(--color-light-0)] border-none rounded-2xl px-6 py-4 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40 appearance-none"
                >
                  {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase tracking-widest font-body">
                    Date de livraison estimée
                  </label>
                  <span className="text-[10px] text-[var(--color-dark-text-2)] uppercase tracking-tight font-body">Optionnel</span>
                </div>
                <input
                  type="date"
                  value={dateLivraison}
                  onChange={e => setDateLivraison(e.target.value)}
                  className="w-full bg-[var(--color-light-0)] border-none rounded-2xl px-6 py-4 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40"
                />
              </div>
            </div>

            {/* Localisation */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase tracking-widest font-body">
                  Localisation
                </label>
                <span className="text-[10px] text-[var(--color-dark-text-2)] uppercase tracking-tight font-body">Optionnel</span>
              </div>
              <input
                type="text"
                value={localisation}
                onChange={e => setLocalisation(e.target.value)}
                placeholder="123 rue Exemple, Trois-Rivières"
                className="w-full bg-[var(--color-light-0)] border-none rounded-2xl px-6 py-4 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40 placeholder:text-[var(--color-light-text-3)]"
              />
            </div>

            {/* Lien Google Drive */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase tracking-widest font-body">
                  Lien Google Drive
                </label>
                <span className="text-[10px] text-[var(--color-dark-text-2)] uppercase tracking-tight font-body">Optionnel</span>
              </div>
              <input
                type="url"
                value={lienGdrive}
                onChange={e => setLienGdrive(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full bg-[var(--color-light-0)] border-none rounded-2xl px-6 py-4 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40 placeholder:text-[var(--color-light-text-3)]"
              />
            </div>

            {/* Lien du site test (Vercel) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase tracking-widest font-body">
                  Lien du site test
                </label>
                <span className="text-[10px] text-[var(--color-dark-text-2)] uppercase tracking-tight font-body">Optionnel</span>
              </div>
              <input
                type="url"
                value={lienSiteTest}
                onChange={e => setLienSiteTest(e.target.value)}
                placeholder="https://site-exemple.vercel.app"
                className="w-full bg-[var(--color-light-0)] border-none rounded-2xl px-6 py-4 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40 placeholder:text-[var(--color-light-text-3)]"
              />
              <p className="text-[11px] text-[var(--color-dark-text-2)] font-body mt-2">
                Inclus dans le courriel de révision pour les projets Site Web Vitrine.
              </p>
            </div>

          </div>
        </section>

        {/* Bouton sauvegarder */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-display text-[var(--text-xl)] py-6 rounded-full tracking-widest uppercase transition-all disabled:opacity-60"
        >
          {saving ? 'SAUVEGARDE...' : 'SAUVEGARDER LES MODIFICATIONS'}
        </button>

        {/* Zone dangereuse */}
        <section className="bg-[var(--color-error-bg-2)] border border-[var(--color-error-bg)] rounded-3xl p-8">
          <h2 className="font-display text-[var(--text-xl)] text-[var(--color-brand)] uppercase mb-4 tracking-wide">
            ZONE DANGEREUSE
          </h2>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[var(--color-dark-text-2)] text-sm font-body">
                Toutes les données associées à ce projet seront définitivement supprimées.
              </p>
              <p className="text-[var(--color-dark-text-2)] text-sm font-body font-semibold mt-1">
                Cette action est irréversible.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              className="px-8 py-3 border-2 border-[var(--color-brand)] text-[var(--color-brand)] font-display text-lg rounded-full hover:bg-[var(--color-brand)] hover:text-white transition-colors uppercase whitespace-nowrap"
            >
              SUPPRIMER CE PROJET
            </button>
          </div>
        </section>

      </form>
    </div>
  )
}
