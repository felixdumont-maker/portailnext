'use client'

import { useState, useEffect } from 'react'

interface ChecklistItem {
  id: number
  nom_item: string
  is_required: boolean
}

interface Extra {
  id: number
  nom: string
  prix: number
}

interface Service {
  id: number
  nom_service: string
  description: string
  icon: string
  slug: string | null
  categorie: string | null
  prix: number | null
  duree_affichee: string | null
  actif: boolean
  nb_items: number
  items: ChecklistItem[]
  extras: Extra[]
}

const ICON_MAP: Record<string, string> = {
  photo: 'photo_camera',
  video: 'videocam',
  graphisme: 'brush',
  web: 'language',
  immobilier: 'home',
  info: 'info',
  default: 'folder',
}

// Couleur par catégorie — Web=brand, Vidéo=info, Photo=success, Design/Infographie=ambre
function categoryStyle(categorie: string | null): { color: string; icon: string } {
  const c = (categorie || '').toLowerCase()
  if (c.includes('web')) return { color: 'var(--color-brand)', icon: 'language' }
  if (c.includes('vidéo') || c.includes('video')) return { color: 'var(--color-info)', icon: 'videocam' }
  if (c.includes('photo')) return { color: 'var(--color-success)', icon: 'photo_camera' }
  if (c.includes('graphisme') || c.includes('infographie')) return { color: 'var(--color-warning-mid-2)', icon: 'palette' }
  return { color: 'var(--color-dark-text-2)', icon: 'category' }
}

const money = (n: number | null | undefined) =>
  n ? `${Number(n).toLocaleString('fr-CA', { maximumFractionDigits: 2 })} $` : null

const inputCls = "w-full bg-[var(--color-light-0)] border-none rounded-xl px-4 py-2.5 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40"
const labelCls = "block text-[10px] font-bold uppercase tracking-wide text-[var(--color-dark-text-2)] font-body mb-1.5"

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categorieFiltre, setCategorieFiltre] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  // Ajouter un service
  const [showAddService, setShowAddService] = useState(false)
  const [newNom, setNewNom] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCategorie, setNewCategorie] = useState('')
  const [newPrix, setNewPrix] = useState('')
  const [savingService, setSavingService] = useState(false)

  // Tarification (un seul service en édition à la fois)
  const [editingTarifId, setEditingTarifId] = useState<number | null>(null)
  const [prixDraft, setPrixDraft] = useState('')
  const [dureeDraft, setDureeDraft] = useState('')
  const [newExtraNom, setNewExtraNom] = useState('')
  const [newExtraPrix, setNewExtraPrix] = useState('')
  const [savingTarif, setSavingTarif] = useState(false)

  // Checkpoints
  const [expandedCheckpoints, setExpandedCheckpoints] = useState<Set<number>>(new Set())
  const [addingCheckpointFor, setAddingCheckpointFor] = useState<number | null>(null)
  const [newCheckpointText, setNewCheckpointText] = useState('')
  const [newCheckpointRequired, setNewCheckpointRequired] = useState(true)

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000) }

  const loadServices = () => {
    fetch('/api/v1/admin/services', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setServices(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadServices() }, [])

  // ── Ajouter un service ──────────────────────────────────────
  const addService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNom.trim()) return
    setSavingService(true)
    try {
      const res = await fetch('/api/v1/admin/services', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom_service: newNom.trim(), description: newDesc.trim(), categorie: newCategorie.trim() || null, prix: parseFloat(newPrix) || 0 }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Erreur', false); return }
      setServices(prev => [...prev, {
        id: data.id, nom_service: newNom.trim(), description: newDesc.trim(), icon: 'default',
        slug: null, categorie: newCategorie.trim() || null, prix: parseFloat(newPrix) || 0,
        duree_affichee: null, actif: true, nb_items: 0, items: [], extras: [],
      }])
      setNewNom(''); setNewDesc(''); setNewCategorie(''); setNewPrix(''); setShowAddService(false)
      showToast('Service créé.')
    } catch { showToast('Erreur de connexion', false) }
    finally { setSavingService(false) }
  }

  const deleteService = async (id: number, nom: string) => {
    if (!confirm(`Supprimer le service "${nom}" et tous ses checkpoints ?`)) return
    const snapshot = services
    setServices(prev => prev.filter(s => s.id !== id))
    try {
      const res = await fetch(`/api/v1/admin/services/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) { setServices(snapshot); showToast('Erreur suppression', false); return }
      showToast(`Service "${nom}" supprimé.`)
    } catch { setServices(snapshot); showToast('Erreur de connexion', false) }
  }

  // ── Actif / Inactif ──────────────────────────────────────────
  const toggleActif = async (service: Service) => {
    const snapshot = services
    setServices(prev => prev.map(s => s.id === service.id ? { ...s, actif: !s.actif } : s))
    try {
      const res = await fetch(`/api/v1/admin/services/${service.id}`, {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: !service.actif }),
      })
      if (!res.ok) { setServices(snapshot); showToast('Erreur de mise à jour', false) }
    } catch { setServices(snapshot); showToast('Erreur de connexion', false) }
  }

  // ── Tarification (prix + durée + extras) ────────────────────
  const openTarif = (service: Service) => {
    setEditingTarifId(prev => prev === service.id ? null : service.id)
    setPrixDraft(service.prix ? String(service.prix) : '')
    setDureeDraft(service.duree_affichee || '')
    setNewExtraNom(''); setNewExtraPrix('')
  }

  const saveTarif = async (serviceId: number) => {
    const prix = parseFloat(prixDraft) || 0
    const duree = dureeDraft.trim() || null
    setSavingTarif(true)
    const snapshot = services
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, prix, duree_affichee: duree } : s))
    try {
      const res = await fetch(`/api/v1/admin/services/${serviceId}`, {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prix, duree_affichee: duree }),
      })
      if (!res.ok) { setServices(snapshot); showToast('Erreur de mise à jour', false); return }
      showToast('Tarification enregistrée.')
      setEditingTarifId(null)
    } catch { setServices(snapshot); showToast('Erreur de connexion', false) }
    finally { setSavingTarif(false) }
  }

  const addExtra = async (serviceId: number) => {
    if (!newExtraNom.trim()) return
    const nom = newExtraNom.trim()
    const prix = parseFloat(newExtraPrix) || 0
    try {
      const res = await fetch(`/api/v1/admin/services/${serviceId}/extras`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, prix }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Erreur', false); return }
      setServices(prev => prev.map(s => s.id === serviceId ? { ...s, extras: [...s.extras, { id: data.id, nom, prix }] } : s))
      setNewExtraNom(''); setNewExtraPrix('')
    } catch { showToast('Erreur de connexion', false) }
  }

  const removeExtra = async (serviceId: number, extraId: number) => {
    const snapshot = services
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, extras: s.extras.filter(e => e.id !== extraId) } : s))
    try {
      const res = await fetch(`/api/v1/admin/services/extras/${extraId}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) { setServices(snapshot); showToast('Erreur suppression', false) }
    } catch { setServices(snapshot); showToast('Erreur de connexion', false) }
  }

  // ── Checkpoints ──────────────────────────────────────────────
  const toggleExpand = (serviceId: number) => {
    setExpandedCheckpoints(prev => {
      const next = new Set(prev)
      if (next.has(serviceId)) next.delete(serviceId); else next.add(serviceId)
      return next
    })
  }

  const toggleRequired = async (serviceId: number, item: ChecklistItem) => {
    const snapshot = services
    setServices(prev => prev.map(s => s.id === serviceId
      ? { ...s, items: s.items.map(i => i.id === item.id ? { ...i, is_required: !i.is_required } : i) }
      : s))
    try {
      const res = await fetch(`/api/v1/admin/services/items/${item.id}`, {
        method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_required: !item.is_required }),
      })
      if (!res.ok) { setServices(snapshot); showToast('Erreur de mise à jour', false) }
    } catch { setServices(snapshot); showToast('Erreur de connexion', false) }
  }

  const removeCheckpoint = async (serviceId: number, itemId: number) => {
    const snapshot = services
    setServices(prev => prev.map(s => s.id === serviceId
      ? { ...s, items: s.items.filter(i => i.id !== itemId), nb_items: s.nb_items - 1 }
      : s))
    try {
      const res = await fetch(`/api/v1/admin/services/items/${itemId}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) { setServices(snapshot); showToast('Erreur suppression', false) }
    } catch { setServices(snapshot); showToast('Erreur de connexion', false) }
  }

  const addCheckpoint = async (serviceId: number) => {
    if (!newCheckpointText.trim()) return
    try {
      const res = await fetch(`/api/v1/admin/services/${serviceId}/items`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom_item: newCheckpointText.trim(), is_required: newCheckpointRequired ? 1 : 0 }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Erreur', false); return }
      setServices(prev => prev.map(s => s.id === serviceId
        ? { ...s, items: [...s.items, { id: data.id, nom_item: newCheckpointText.trim(), is_required: newCheckpointRequired }], nb_items: s.nb_items + 1 }
        : s))
      setNewCheckpointText(''); setNewCheckpointRequired(true); setAddingCheckpointFor(null)
    } catch { showToast('Erreur de connexion', false) }
  }

  // ── Filtrage ─────────────────────────────────────────────────
  const searched = services.filter(s =>
    s.nom_service.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase())
  )
  const filtered = categorieFiltre ? searched.filter(s => (s.categorie || 'Autre') === categorieFiltre) : searched

  const categories = Array.from(new Set(services.map(s => s.categorie || 'Autre'))).sort()
  const categoriesFiltrees = Array.from(new Set(filtered.map(s => s.categorie || 'Autre'))).sort()

  const totalActifs = services.filter(s => s.actif).length
  const totalCheckpoints = services.reduce((sum, s) => sum + s.nb_items, 0)

  return (
    <div className="max-w-6xl mx-auto">

      {toast && (
        <div role="status" aria-live="polite" aria-atomic="true" className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-3 ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <p className="font-body font-bold text-[11px] uppercase tracking-[0.16em] text-[var(--color-brand)] mb-1">Gestion administrative</p>
          <h1 className="font-display text-[var(--color-dark-0)] leading-none" style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em' }}>Catalogue de services</h1>
        </div>
        <button onClick={() => setShowAddService(v => !v)}
          className="inline-flex items-center gap-2 bg-[var(--color-brand)] text-white px-5 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--color-brand-hover)] transition-colors whitespace-nowrap">
          <span aria-hidden="true" className="material-symbols-outlined text-base">add</span>
          Ajouter un service
        </button>
      </div>

      {/* Formulaire ajouter service */}
      {showAddService && (
        <form onSubmit={addService} className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-6 mb-6 space-y-4">
          <h3 className="font-display text-sm uppercase tracking-wide text-[var(--color-dark-1)]">Nouveau service</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nom <span className="text-[var(--color-brand)]">*</span></label>
              <input value={newNom} onChange={e => setNewNom(e.target.value)} placeholder="Nom du service" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Catégorie</label>
              <input value={newCategorie} onChange={e => setNewCategorie(e.target.value)} placeholder="ex. Sites Web" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Prix</label>
              <input type="number" min={0} step={0.01} value={newPrix} onChange={e => setNewPrix(e.target.value)} placeholder="0" className={inputCls} />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Description</label>
              <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Courte description (optionnel)" className={inputCls} />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={savingService}
              className="bg-[var(--color-brand)] text-white px-6 py-2.5 rounded-full font-body font-bold text-xs uppercase tracking-wide disabled:opacity-60 hover:bg-[var(--color-brand-hover)] transition-colors">
              {savingService ? 'Création…' : 'Créer'}
            </button>
            <button type="button" onClick={() => setShowAddService(false)}
              className="bg-[var(--color-light-0)] text-[var(--color-dark-1)] px-5 py-2.5 rounded-full font-body font-bold text-xs uppercase tracking-wide hover:bg-[var(--color-light-border)] transition-colors">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-[18px] bg-[var(--color-light-2)] border border-[var(--color-light-border)] p-5">
          <p className="font-display font-extrabold text-3xl text-[var(--color-dark-1)] leading-none">{totalActifs}</p>
          <p className="font-body text-xs uppercase tracking-wide text-[var(--color-dark-text-2)] mt-2">Services actifs</p>
        </div>
        <div className="rounded-[18px] bg-[var(--color-light-2)] border border-[var(--color-light-border)] p-5">
          <p className="font-display font-extrabold text-3xl text-[var(--color-dark-1)] leading-none">{totalCheckpoints}</p>
          <p className="font-body text-xs uppercase tracking-wide text-[var(--color-dark-text-2)] mt-2">Checkpoints totaux</p>
        </div>
        <div className="rounded-[18px] bg-[var(--color-light-2)] border border-[var(--color-light-border)] p-5">
          <p className="font-display font-extrabold text-3xl text-[var(--color-dark-1)] leading-none">{categories.length}</p>
          <p className="font-body text-xs uppercase tracking-wide text-[var(--color-dark-text-2)] mt-2">Catégories</p>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative mb-4">
        <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-dark-text-2)]">search</span>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un service…"
          className="w-full bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-full pl-12 pr-6 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
        />
      </div>

      {/* Chips catégorie */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <button onClick={() => setCategorieFiltre(null)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-xs font-bold transition-colors ${categorieFiltre === null ? 'bg-[var(--color-brand)] text-white' : 'bg-[var(--color-light-2)] border border-[var(--color-light-border)] text-[var(--color-dark-text-2)] hover:border-[var(--color-brand)]'}`}>
          Tous
          <span className={`text-[11px] leading-none px-1.5 py-0.5 rounded-full ${categorieFiltre === null ? 'bg-white/25 text-white' : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)]'}`}>{searched.length}</span>
        </button>
        {categories.map(cat => {
          const count = searched.filter(s => (s.categorie || 'Autre') === cat).length
          const active = categorieFiltre === cat
          return (
            <button key={cat} onClick={() => setCategorieFiltre(active ? null : cat)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-xs font-bold transition-colors ${active ? 'bg-[var(--color-brand)] text-white' : 'bg-[var(--color-light-2)] border border-[var(--color-light-border)] text-[var(--color-dark-text-2)] hover:border-[var(--color-brand)]'}`}>
              {cat}
              <span className={`text-[11px] leading-none px-1.5 py-0.5 rounded-full ${active ? 'bg-white/25 text-white' : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)]'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <p className="text-[var(--color-dark-text-2)] font-body text-center py-20">Chargement…</p>
      ) : filtered.length === 0 ? (
        <p className="text-[var(--color-dark-text-2)] font-body text-center py-20">Aucun service trouvé.</p>
      ) : (
        <div className="space-y-10">
          {categoriesFiltrees.map(cat => (
            <section key={cat}>
              <h2 className="font-display text-base uppercase tracking-wide text-[var(--color-dark-1)] mb-4">{cat}</h2>
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                {filtered.filter(s => (s.categorie || 'Autre') === cat).map(service => {
                  const catStyle = categoryStyle(service.categorie)
                  const isTarifOpen = editingTarifId === service.id
                  const isExpanded = expandedCheckpoints.has(service.id)
                  const prixAffiche = money(service.prix)
                  return (
                    <div key={service.id} className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[16px] p-5 flex flex-col gap-3">

                      {/* En-tête carte */}
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-light-0)', color: catStyle.color }}>
                          <span aria-hidden="true" className="material-symbols-outlined text-xl">{ICON_MAP[service.icon] || catStyle.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-body font-bold text-sm text-[var(--color-dark-1)] truncate">{service.nom_service}</h3>
                            <button onClick={() => deleteService(service.id, service.nom_service)}
                              className="p-1 rounded-full text-[var(--color-dark-text-2)] hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0" aria-label="Supprimer">
                              <span aria-hidden="true" className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                          {prixAffiche && <p className="font-display font-extrabold text-sm" style={{ color: 'var(--color-brand)' }}>{prixAffiche}</p>}
                        </div>
                      </div>

                      {service.description && (
                        <p className="font-body text-xs text-[var(--color-dark-text-2)]">{service.description}</p>
                      )}

                      {service.duree_affichee && (
                        <p className="inline-flex items-center gap-1.5 font-body text-xs text-[var(--color-dark-text-2)]">
                          <span aria-hidden="true" className="material-symbols-outlined text-sm">schedule</span>
                          {service.duree_affichee}
                        </p>
                      )}

                      {/* Ligne actif + tarification */}
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-light-border)]">
                        <button onClick={() => toggleActif(service)}
                          className="inline-flex items-center gap-2 font-body text-xs font-bold"
                          style={{ color: service.actif ? 'var(--color-success-text)' : 'var(--color-dark-text-2)' }}>
                          <span aria-hidden="true" className="material-symbols-outlined text-xl">{service.actif ? 'toggle_on' : 'toggle_off'}</span>
                          {service.actif ? 'Actif' : 'Inactif'}
                        </button>
                        <button onClick={() => openTarif(service)}
                          className="inline-flex items-center gap-1.5 font-body text-xs font-bold text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] transition-colors">
                          <span aria-hidden="true" className="material-symbols-outlined text-base">settings</span>
                          Tarification
                        </button>
                      </div>

                      {/* Panneau tarification inline */}
                      {isTarifOpen && (
                        <div className="bg-[var(--color-light-0)] rounded-xl p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className={labelCls}>Prix</label>
                              <input value={prixDraft} onChange={e => setPrixDraft(e.target.value)} placeholder="300 $" className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Durée</label>
                              <input value={dureeDraft} onChange={e => setDureeDraft(e.target.value)} placeholder="3h sur place" className={inputCls} />
                            </div>
                          </div>

                          <div>
                            <label className={labelCls}>Extras disponibles</label>
                            <div className="space-y-1.5">
                              {service.extras.map(extra => (
                                <div key={extra.id} className="flex items-center justify-between gap-2 bg-[var(--color-light-2)] rounded-lg px-3 py-1.5">
                                  <span className="font-body text-xs text-[var(--color-dark-1)] truncate">{extra.nom}</span>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="font-body text-xs font-bold text-[var(--color-dark-1)]">{money(extra.prix)}</span>
                                    <button onClick={() => removeExtra(service.id, extra.id)} className="text-[var(--color-dark-text-2)] hover:text-red-600">
                                      <span aria-hidden="true" className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <input value={newExtraNom} onChange={e => setNewExtraNom(e.target.value)} placeholder="Nom de l'extra"
                                className="flex-1 bg-[var(--color-light-2)] border-none rounded-lg px-3 py-1.5 outline-none font-body text-xs focus:ring-2 focus:ring-[var(--color-brand)]/30" />
                              <input value={newExtraPrix} onChange={e => setNewExtraPrix(e.target.value)} type="number" min={0} step={0.01} placeholder="Prix"
                                className="w-20 bg-[var(--color-light-2)] border-none rounded-lg px-3 py-1.5 outline-none font-body text-xs focus:ring-2 focus:ring-[var(--color-brand)]/30" />
                              <button onClick={() => addExtra(service.id)} className="text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] flex-shrink-0" aria-label="Ajouter un extra">
                                <span aria-hidden="true" className="material-symbols-outlined text-lg">add_circle</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button onClick={() => saveTarif(service.id)} disabled={savingTarif}
                              className="flex-1 bg-[var(--color-brand)] text-white py-2 rounded-lg font-body font-bold text-xs uppercase tracking-wide disabled:opacity-60 hover:bg-[var(--color-brand-hover)] transition-colors">
                              {savingTarif ? 'Enregistrement…' : 'Enregistrer'}
                            </button>
                            <button onClick={() => setEditingTarifId(null)}
                              className="bg-[var(--color-light-2)] text-[var(--color-dark-1)] px-4 py-2 rounded-lg font-body font-bold text-xs uppercase tracking-wide hover:bg-[var(--color-light-border)] transition-colors">
                              Annuler
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Checkpoints */}
                      <button onClick={() => toggleExpand(service.id)}
                        className="flex items-center justify-between font-body text-xs text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-1)] transition-colors">
                        <span>{service.nb_items} checkpoint{service.nb_items === 1 ? '' : 's'}</span>
                        <span aria-hidden="true" className="material-symbols-outlined text-base">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                      </button>

                      {isExpanded && (
                        <div className="bg-[var(--color-light-0)] rounded-xl p-3 space-y-1.5">
                          {service.items.map(item => (
                            <div key={item.id} className="flex items-center gap-2 group">
                              <button onClick={() => toggleRequired(service.id, item)} className="flex-shrink-0" title={item.is_required ? 'Obligatoire' : 'Optionnel'}>
                                <span aria-hidden="true" className="material-symbols-outlined text-base" style={{ color: item.is_required ? 'var(--color-brand)' : 'var(--color-dark-text-2)' }}>
                                  {item.is_required ? 'star' : 'radio_button_unchecked'}
                                </span>
                              </button>
                              <span className="flex-1 font-body text-xs text-[var(--color-dark-1)] truncate">{item.nom_item}</span>
                              <button onClick={() => removeCheckpoint(service.id, item.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-dark-text-2)] hover:text-red-600 flex-shrink-0">
                                <span aria-hidden="true" className="material-symbols-outlined text-sm">close</span>
                              </button>
                            </div>
                          ))}
                          {service.items.length === 0 && (
                            <p className="font-body text-xs text-[var(--color-dark-text-2)] py-1">Aucun checkpoint.</p>
                          )}

                          {addingCheckpointFor === service.id ? (
                            <div className="flex flex-col gap-2 pt-2 border-t border-[var(--color-light-border)]">
                              <input
                                autoFocus value={newCheckpointText} onChange={e => setNewCheckpointText(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') addCheckpoint(service.id); if (e.key === 'Escape') { setAddingCheckpointFor(null); setNewCheckpointText('') } }}
                                placeholder="Nom du checkpoint…"
                                className="bg-[var(--color-light-2)] border-none rounded-lg px-3 py-1.5 outline-none font-body text-xs focus:ring-2 focus:ring-[var(--color-brand)]/30"
                              />
                              <div className="flex items-center justify-between">
                                <label className="flex items-center gap-1.5 font-body text-[10px] font-bold uppercase tracking-wide text-[var(--color-dark-text-2)]">
                                  <input type="checkbox" checked={newCheckpointRequired} onChange={e => setNewCheckpointRequired(e.target.checked)}
                                    className="w-3.5 h-3.5" style={{ accentColor: 'var(--color-brand)' }} />
                                  Obligatoire
                                </label>
                                <div className="flex gap-2">
                                  <button onClick={() => { setAddingCheckpointFor(null); setNewCheckpointText('') }} className="font-body text-xs text-[var(--color-dark-text-2)]">Annuler</button>
                                  <button onClick={() => addCheckpoint(service.id)} className="font-body text-xs font-bold text-[var(--color-brand)]">OK</button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => { setAddingCheckpointFor(service.id); setNewCheckpointText(''); setNewCheckpointRequired(true) }}
                              className="w-full text-center border-2 border-dashed border-[var(--color-light-border)] rounded-lg py-1.5 font-body text-xs text-[var(--color-dark-text-2)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors">
                              + Ajouter un checkpoint
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
