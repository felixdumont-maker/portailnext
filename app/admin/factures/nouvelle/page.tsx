'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Client {
  id: number
  nom_complet: string
  nom_entreprise: string | null
  email: string
}

const inputCls = "w-full bg-[var(--color-light-0)] border-none rounded-xl px-4 py-3 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40"
const labelCls = "text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body mb-1.5 block"

export default function NouvelleFacturePage() {
  const router = useRouter()
  const [mode, setMode] = useState<'existant' | 'nouveau'>('existant')

  // Client existant
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Nouveau contact — facturation seulement, aucun accès portail créé
  const [nouveauNom, setNouveauNom] = useState('')
  const [nouveauEmail, setNouveauEmail] = useState('')
  const [nouveauEntreprise, setNouveauEntreprise] = useState('')
  const [nouveauTelephone, setNouveauTelephone] = useState('')
  const [nouveauAdresse, setNouveauAdresse] = useState('')
  const [nouveauVille, setNouveauVille] = useState('')
  const [nouveauProvince, setNouveauProvince] = useState('Québec')
  const [nouveauCodePostal, setNouveauCodePostal] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/v1/admin/clients', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setClients(Array.isArray(data) ? data : []))
      .catch(() => setError('Impossible de charger les clients.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    return c.nom_complet.toLowerCase().includes(q)
      || (c.nom_entreprise || '').toLowerCase().includes(q)
      || c.email.toLowerCase().includes(q)
  })

  const selected = clients.find(c => c.id === selectedId) || null

  async function creerFacturePour(idClient: number) {
    const res = await fetch('/api/v1/admin/factures', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_client: idClient }),
    })
    const data = await res.json()
    if (!res.ok || !data.success) throw new Error(data.error || 'Erreur serveur')
    return data.id
  }

  async function handleCreateExistant() {
    if (!selectedId) { setError('Choisissez un client.'); return }
    setSaving(true); setError('')
    try {
      const factureId = await creerFacturePour(selectedId)
      router.push(`/admin/factures/${factureId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateNouveau(e: React.FormEvent) {
    e.preventDefault()
    if (!nouveauNom.trim() || !nouveauEmail.trim()) { setError('Nom et courriel obligatoires.'); return }
    setSaving(true); setError('')
    try {
      // Contact facturation seulement : statut_relation "prospect" — aucun mot de passe,
      // aucun courriel d'invitation, aucun dossier Drive créé (voir /api/v1/admin/client/add).
      const res = await fetch('/api/v1/admin/client/add', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom_complet: nouveauNom.trim(),
          email: nouveauEmail.trim(),
          nom_entreprise: nouveauEntreprise.trim() || undefined,
          telephone: nouveauTelephone.trim() || undefined,
          statut_relation: 'prospect',
          adresse_facturation: nouveauAdresse.trim() || undefined,
          ville_facturation: nouveauVille.trim() || undefined,
          province_facturation: nouveauProvince.trim() || undefined,
          code_postal_facturation: nouveauCodePostal.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur serveur'); return }
      const factureId = await creerFacturePour(data.id)
      router.push(`/admin/factures/${factureId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Fil d'Ariane */}
      <Link href="/admin/factures"
        className="inline-flex items-center gap-2 text-[var(--color-dark-text-2)] font-body text-sm hover:text-[var(--color-dark-1)] transition-colors mb-6">
        ← Retour aux factures
      </Link>

      <header className="mb-6">
        <h1 className="font-display text-[var(--text-3xl)] uppercase tracking-tight leading-none text-[var(--color-dark-1)]">
          Nouvelle facture
        </h1>
        <p className="font-body text-sm text-[var(--color-dark-text-2)] mt-2">
          Choisissez le client à facturer. La facture démarre vide — vous ajouterez les lignes à l&apos;étape suivante.
        </p>
      </header>

      {error && (
        <div role="alert" className="mb-6 px-5 py-4 bg-[var(--color-error-bg)] rounded-xl text-[var(--color-error-text)] font-body text-sm">
          {error}
        </div>
      )}

      {/* Bascule mode */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setMode('existant'); setError('') }}
          className={`flex-1 py-3 rounded-full font-bold text-xs uppercase tracking-widest font-body transition-colors ${
            mode === 'existant' ? 'bg-[var(--color-brand)] text-white' : 'bg-white border border-[var(--color-light-border-2)] text-[var(--color-dark-1)] hover:bg-stone-50'
          }`}
        >
          Client existant
        </button>
        <button
          onClick={() => { setMode('nouveau'); setError('') }}
          className={`flex-1 py-3 rounded-full font-bold text-xs uppercase tracking-widest font-body transition-colors ${
            mode === 'nouveau' ? 'bg-[var(--color-brand)] text-white' : 'bg-white border border-[var(--color-light-border-2)] text-[var(--color-dark-1)] hover:bg-stone-50'
          }`}
        >
          Nouveau contact
        </button>
      </div>

      {mode === 'existant' ? (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
          <label className={labelCls}>Client</label>

          {selected ? (
            <div className="flex items-center justify-between gap-4 bg-[var(--color-light-0)] rounded-xl px-4 py-3 mb-2">
              <div>
                <p className="font-body font-bold text-sm text-[var(--color-dark-1)]">{selected.nom_complet}</p>
                <p className="font-body text-xs text-[var(--color-dark-text-2)]">
                  {selected.nom_entreprise ? `${selected.nom_entreprise} · ` : ''}{selected.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="text-xs font-bold font-body text-[var(--color-brand)] hover:underline whitespace-nowrap"
              >
                Changer
              </button>
            </div>
          ) : (
            <>
              <div className="relative mb-3">
                <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-dark-text-2)] text-lg">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un client par nom, entreprise ou courriel..."
                  aria-label="Rechercher un client"
                  autoFocus
                  className="w-full bg-[var(--color-light-0)] border-none rounded-xl pl-11 pr-4 py-3 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40"
                />
              </div>

              {loading ? (
                <p className="text-[var(--color-dark-text-2)] font-body text-sm text-center py-6">Chargement...</p>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 border border-stone-100 rounded-xl">
                  {filtered.length === 0 ? (
                    <p className="text-[var(--color-dark-text-2)] font-body text-sm text-center py-6">Aucun client trouvé.</p>
                  ) : filtered.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className="w-full text-left px-4 py-3 hover:bg-[var(--color-light-0)] transition-colors flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-body font-bold text-sm text-[var(--color-dark-1)]">{c.nom_complet}</p>
                        <p className="font-body text-xs text-[var(--color-dark-text-2)]">
                          {c.nom_entreprise ? `${c.nom_entreprise} · ` : ''}{c.email}
                        </p>
                      </div>
                      <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-dark-text-2)]">chevron_right</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <button
            onClick={handleCreateExistant}
            disabled={!selectedId || saving}
            className="w-full mt-6 bg-[var(--color-brand)] text-white py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-40 font-body flex items-center justify-center gap-2"
          >
            {saving ? 'Création…' : (
              <><span aria-hidden="true" className="material-symbols-outlined text-base">add</span> Créer la facture</>
            )}
          </button>
        </div>
      ) : (
        <form onSubmit={handleCreateNouveau} className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 space-y-4">
          <p className="font-body text-xs text-[var(--color-dark-text-2)] mb-2">
            Pour facturer quelqu&apos;un qui n&apos;a pas de compte sur le portail. Aucun accès n&apos;est créé, aucun courriel d&apos;invitation n&apos;est envoyé — seulement un contact pour la facturation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nom complet <span className="text-[var(--color-brand)]">*</span></label>
              <input type="text" value={nouveauNom} onChange={e => setNouveauNom(e.target.value)} placeholder="Jean Tremblay" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Courriel <span className="text-[var(--color-brand)]">*</span></label>
              <input type="email" value={nouveauEmail} onChange={e => setNouveauEmail(e.target.value)} placeholder="jean@email.com" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Entreprise <span className="font-normal normal-case">(optionnel)</span></label>
              <input type="text" value={nouveauEntreprise} onChange={e => setNouveauEntreprise(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Téléphone <span className="font-normal normal-case">(optionnel)</span></label>
              <input type="tel" value={nouveauTelephone} onChange={e => setNouveauTelephone(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100">
            <p className={labelCls + ' mt-4'}>Adresse de facturation <span className="font-normal normal-case">(optionnel)</span></p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input type="text" aria-label="Adresse" value={nouveauAdresse} onChange={e => setNouveauAdresse(e.target.value)} placeholder="123 rue Principale" className={inputCls} />
              </div>
              <div>
                <input type="text" aria-label="Ville" value={nouveauVille} onChange={e => setNouveauVille(e.target.value)} placeholder="Ville" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" aria-label="Province" value={nouveauProvince} onChange={e => setNouveauProvince(e.target.value)} placeholder="Province" className={inputCls} />
                <input type="text" aria-label="Code postal" value={nouveauCodePostal} onChange={e => setNouveauCodePostal(e.target.value)} placeholder="Code postal" className={inputCls} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-2 bg-[var(--color-brand)] text-white py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-40 font-body flex items-center justify-center gap-2"
          >
            {saving ? 'Création…' : (
              <><span aria-hidden="true" className="material-symbols-outlined text-base">add</span> Créer le contact et la facture</>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
