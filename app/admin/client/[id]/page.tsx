'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Client {
  id: number
  nom_complet: string
  nom_entreprise: string
  email: string
  telephone: string
  created_at: string
}

interface Projet {
  id: number
  nom_projet: string
  statut: string
  created_at: string
}

const MOCK_CLIENT: Client = {
  id: 1,
  nom_complet: 'Jean-Pierre Durand',
  nom_entreprise: 'Durand & Co Gastronomy',
  email: 'jp.durand@gastronomy.com',
  telephone: '+1 514 123 4567',
  created_at: '2022-01-01',
}

const MOCK_PROJETS: Projet[] = [
  { id: 1, nom_projet: 'Cocktail Event Paris', statut: 'Travaux terminés', created_at: '2024-01-12' },
  { id: 2, nom_projet: 'Bar Design Strategy', statut: 'Travaux en cours', created_at: '2024-02-05' },
  { id: 3, nom_projet: 'Wine Selection 2024', statut: 'Documents à donner', created_at: '2024-03-01' },
]

const STATUT_STYLES: Record<string, { bg: string; text: string }> = {
  'Travaux terminés':   { bg: 'bg-green-100', text: 'text-green-700' },
  'Travaux en cours':   { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Documents à donner': { bg: 'bg-red-100', text: 'text-red-700' },
  'Documents reçus':    { bg: 'bg-blue-100', text: 'text-blue-700' },
  'En révision':        { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'Annulé':             { bg: 'bg-gray-100', text: 'text-gray-600' },
}

export default function AdminClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id

  const [client, setClient] = useState<Client | null>(null)
  const [projets, setProjets] = useState<Projet[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

useEffect(() => {
    fetch(`/api/v1/admin/client/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { setClient(data); setLoading(false) })
      .catch(() => { setClient(MOCK_CLIENT); setLoading(false) })

    fetch(`/api/v1/admin/client/${id}/projets`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setProjets(data) })
      .catch(() => {})
  }, [id])
  const handleSave = async () => {
    setSaving(true)
    // TODO: brancher PUT /api/v1/admin/client/${id}
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000) }, 800)
  }

  const handleDelete = () => {
    if (!confirm('Supprimer ce client ? Cette action est irréversible.')) return
    router.push('/admin/clients')
  }

  const initiales = client?.nom_complet
    ? client.nom_complet.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <header className="mb-12">
        <span className="text-[var(--color-brand)] font-bold tracking-widest text-xs uppercase mb-2 block font-body">
          DÉTAILS DU COMPTE
        </span>
        <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] leading-none tracking-tight uppercase">
          {client?.nom_complet || '...'}
        </h1>
        <p className="text-[var(--color-dark-text-2)] mt-2 font-body font-medium">
          {client?.nom_entreprise}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Formulaire */}
        <section className="lg:col-span-7 bg-[var(--color-light-1)] rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]">edit_square</span>
            <h2 className="font-display text-[var(--text-xl)] uppercase">MODIFIER LES INFORMATIONS</h2>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase ml-4 font-body">Nom complet</label>
                <input
                  type="text"
                  value={client?.nom_complet || ''}
                  onChange={e => setClient(c => c ? {...c, nom_complet: e.target.value} : c)}
                  className="w-full bg-[var(--color-light-0)] border-none rounded-xl px-6 py-4 outline-none font-body font-semibold focus:ring-2 focus:ring-[var(--color-brand)]/40"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase ml-4 font-body">Entreprise</label>
                <input
                  type="text"
                  value={client?.nom_entreprise || ''}
                  onChange={e => setClient(c => c ? {...c, nom_entreprise: e.target.value} : c)}
                  className="w-full bg-[var(--color-light-0)] border-none rounded-xl px-6 py-4 outline-none font-body font-semibold focus:ring-2 focus:ring-[var(--color-brand)]/40"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase ml-4 font-body">Email</label>
                <input
                  type="email"
                  value={client?.email || ''}
                  disabled
                  className="w-full bg-[var(--color-light-border)] border-none rounded-xl px-6 py-4 outline-none font-body font-semibold text-[var(--color-dark-text-2)] cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase ml-4 font-body">Téléphone</label>
                <input
                  type="tel"
                  value={client?.telephone || ''}
                  onChange={e => setClient(c => c ? {...c, telephone: e.target.value} : c)}
                  className="w-full bg-[var(--color-light-0)] border-none rounded-xl px-6 py-4 outline-none font-body font-semibold focus:ring-2 focus:ring-[var(--color-brand)]/40"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-tr from-[var(--color-brand-hover)] to-[var(--color-brand)] text-white font-body font-bold px-8 py-4 rounded-full hover:scale-105 active:scale-95 transition-all uppercase text-sm tracking-wider disabled:opacity-60"
              >
                {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
              </button>
              {saved && <span className="text-green-600 font-body text-sm">✓ Sauvegardé</span>}
            </div>
          </div>
        </section>

        {/* Sidebar */}
        <div className="lg:col-span-5 space-y-6">

          {/* Avatar card */}
          <div className="bg-[var(--color-dark-1)] rounded-3xl overflow-hidden h-48 relative flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-[var(--color-brand)] flex items-center justify-center">
              <span className="font-display text-4xl text-white">{initiales}</span>
            </div>
            <div className="absolute bottom-6 left-6">
              <span className="text-white font-display text-[var(--text-xl)] uppercase">Statut Premium</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-white/70 text-xs font-bold uppercase font-body">
                  Client actif
                </span>
              </div>
            </div>
          </div>

          {/* Projets */}
          <section className="bg-[var(--color-light-1)] rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-[var(--text-xl)] uppercase">PROJETS EN COURS</h2>
              <Link href={`/admin/client/${id}/edit`}>
                <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] transition-colors">edit</span>
              </Link>
            </div>
            <div className="space-y-3">
              {projets.map(p => {
                const style = STATUT_STYLES[p.statut] || { bg: 'bg-gray-100', text: 'text-gray-600' }
                return (
                  <Link key={p.id} href={`/admin/projet/${p.id}`}>
                    <div className="bg-white p-5 rounded-2xl flex items-center justify-between hover:bg-[var(--color-light-0)] transition-colors mb-2">
                      <div className="flex flex-col">
                        <span className="font-body font-bold text-[var(--color-dark-1)] uppercase text-sm">
                          {p.nom_projet}
                        </span>
                        <span className="text-[10px] text-[var(--color-dark-text-2)] font-body font-medium">
                          {new Date(p.created_at).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <span className={`${style.bg} ${style.text} text-[10px] font-extrabold px-3 py-1 rounded-full uppercase font-body`}>
                        {p.statut}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
            <Link href={`/admin/client/${id}/edit`}
              className="mt-4 block text-center text-xs font-bold text-[var(--color-brand)] uppercase tracking-widest hover:underline font-body">
              MODIFIER CE CLIENT →
            </Link>
          </section>
        </div>
      </div>

      {/* Danger zone */}
      <footer className="mt-16 pt-8 border-t border-[var(--color-light-border)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <span className="text-[var(--color-brand)] font-bold uppercase text-xs tracking-widest font-body">
            Zone de Danger
          </span>
          <p className="text-[var(--color-dark-text-2)] text-sm font-body">
            Cette action est irréversible et supprimera toutes les données associées.
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="bg-[var(--color-light-1)] border border-red-200 text-[var(--color-brand)] font-body font-bold px-10 py-5 rounded-full hover:bg-[var(--color-brand)] hover:text-white transition-all uppercase text-sm tracking-wide"
        >
          SUPPRIMER LE CLIENT
        </button>
      </footer>

    </div>
  )
}
