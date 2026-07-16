'use client'

import { useState, useEffect, useCallback } from 'react'

interface RessourceSection {
  id: string
  label: string
}

interface Bundle {
  id: number
  nom: string
  description: string | null
  icone: string
  ordre: number
}

interface Ressource {
  id: number
  titre: string
  description: string | null
  categorie: string
  type_source: string
  url: string
  id_client: number | null
  client_nom: string | null
  sections: RessourceSection[]
  created_at: string
  bundle_id: number | null
}

interface Client {
  id: number
  nom_complet: string
  nom_entreprise: string | null
}

const CATEGORIES = [
  { value: 'guide',    label: 'Guide' },
  { value: 'tutoriel', label: 'Tutoriel' },
  { value: 'pdf',      label: 'PDF' },
  { value: 'autre',    label: 'Autre' },
]

const CAT_LABEL: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]))

const inputCls = "w-full bg-[var(--color-light-0)] border-none rounded-xl px-4 py-3 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40"
const labelCls = "block text-[10px] font-bold uppercase tracking-wide text-[var(--color-dark-text-2)] font-body mb-1.5"

interface Etape { titre: string; texte: string; image_url?: string | null }

interface GuideSection {
  id: number
  titre: string
  intro: string | null
  astuce: string | null
  etapes: Etape[]
  ordre: number
}

function EtapesEditor({ etapes, onChange, ressourceId }: { etapes: Etape[]; onChange: (e: Etape[]) => void; ressourceId: number }) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)

  function update(i: number, field: keyof Etape, val: string) {
    const next = etapes.map((e, idx) => idx === i ? { ...e, [field]: val } : e)
    onChange(next)
  }

  async function handleUpload(i: number, file: File) {
    setUploadingIndex(i)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('ressource_id', String(ressourceId))
      const res = await fetch('/api/v1/admin/ressources/upload-capture', { method: 'POST', credentials: 'include', body: fd })
      const data = await res.json()
      if (data.url) {
        const next = etapes.map((e, idx) => idx === i ? { ...e, image_url: data.url } : e)
        onChange(next)
      }
    } catch { /* ignore */ }
    finally { setUploadingIndex(null) }
  }

  return (
    <div className="flex flex-col gap-3">
      {etapes.map((e, i) => (
        <div key={i} className="border border-[var(--color-light-border)] rounded-lg p-3 flex flex-col gap-2 bg-[var(--color-light-0)]">
          <div className="flex items-center gap-2">
            <span className="font-body text-xs text-[var(--color-dark-text-2)] shrink-0 w-5 text-right">{i + 1}.</span>
            <input
              value={e.titre}
              onChange={ev => update(i, 'titre', ev.target.value)}
              placeholder="Titre de l'étape"
              className="flex-1 px-2 py-1 rounded-lg border-none bg-[var(--color-light-2)] font-body text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
            />
            <button type="button" onClick={() => onChange(etapes.filter((_, idx) => idx !== i))}
              className="text-[var(--color-dark-text-2)] hover:text-red-500">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          <textarea
            value={e.texte}
            onChange={ev => update(i, 'texte', ev.target.value)}
            rows={2}
            placeholder="Description de l'étape"
            className="w-full px-2 py-1 rounded-lg border-none bg-[var(--color-light-2)] font-body text-xs resize-none ml-7 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
          />
          <div className="ml-7 flex items-center gap-2">
            {e.image_url
              ? <a href={e.image_url} target="_blank" rel="noopener noreferrer" className="font-body text-[10px] text-[var(--color-brand)] underline truncate max-w-[160px]">Capture ajoutée</a>
              : <span className="font-body text-[10px] text-[var(--color-dark-text-2)]">Pas de capture</span>
            }
            <label className="cursor-pointer inline-flex items-center gap-1 font-body text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-1)]">
              {uploadingIndex === i
                ? <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                : <span className="material-symbols-outlined text-xs">upload</span>
              }
              {e.image_url ? 'Remplacer' : 'Téléverser'}
              <input type="file" accept="image/*" className="hidden" onChange={ev => { const f = ev.target.files?.[0]; if (f) handleUpload(i, f) }} />
            </label>
            {e.image_url && (
              <button type="button" onClick={() => update(i, 'image_url', '')}
                className="font-body text-[10px] text-red-400 hover:text-red-600 uppercase font-bold">Retirer</button>
            )}
          </div>
        </div>
      ))}
      <button type="button"
        onClick={() => onChange([...etapes, { titre: '', texte: '', image_url: null }])}
        className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-brand)] inline-flex items-center gap-1">
        <span className="material-symbols-outlined text-sm">add</span>Ajouter une étape
      </button>
    </div>
  )
}

const emptyForm = { titre: '', intro: '', astuce: '', etapes: [] as Etape[] }
function formFromSection(s: GuideSection) {
  return { titre: s.titre, intro: s.intro || '', astuce: s.astuce || '', etapes: s.etapes }
}

function SectionForm({ initial, saving, ressourceId, onCancel, onSubmit }: {
  initial: typeof emptyForm; saving: boolean; ressourceId: number
  onCancel: () => void; onSubmit: (v: typeof emptyForm) => void
}) {
  const [v, setV] = useState(initial)
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className={labelCls}>Titre de la section</label>
        <input value={v.titre} onChange={e => setV(p => ({ ...p, titre: e.target.value }))}
          placeholder="Ex. Se connecter à l'admin" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Introduction (optionnelle)</label>
        <textarea value={v.intro} onChange={e => setV(p => ({ ...p, intro: e.target.value }))}
          rows={2} placeholder="Texte d'intro affiché avant les étapes"
          className={`${inputCls} resize-none`} />
      </div>
      <div>
        <label className={labelCls}>Étapes</label>
        <EtapesEditor etapes={v.etapes} onChange={etapes => setV(p => ({ ...p, etapes }))} ressourceId={ressourceId} />
      </div>
      <div>
        <label className={labelCls}>Astuce (optionnelle)</label>
        <textarea value={v.astuce} onChange={e => setV(p => ({ ...p, astuce: e.target.value }))}
          rows={2} placeholder="Conseil affiché en encadré à la fin de la section"
          className={`${inputCls} resize-none`} />
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel}
          className="font-body text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full bg-[var(--color-light-0)] text-[var(--color-dark-text-2)] hover:bg-[var(--color-light-border)] transition-colors">
          Annuler
        </button>
        <button type="button" onClick={() => onSubmit(v)} disabled={saving}
          className="font-body text-xs font-bold uppercase tracking-wide px-5 py-2 rounded-full bg-[var(--color-brand)] text-white disabled:opacity-60 hover:bg-[var(--color-brand-hover)] transition-colors">
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}

function SectionsPanel({ ressourceId, onSectionsChanged }: { ressourceId: number; onSectionsChanged: (sections: RessourceSection[]) => void }) {
  const [sections, setSections] = useState<GuideSection[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [reorderingId, setReorderingId] = useState<number | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/v1/admin/ressources/${ressourceId}/sections`, { credentials: 'include' })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setSections(d) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [ressourceId])

  function syncParent(updated: GuideSection[]) {
    onSectionsChanged(updated.map(s => ({ id: String(s.id), label: s.titre })))
  }

  async function handleCreate(v: typeof emptyForm) {
    if (!v.titre.trim()) { setErreur('Le titre de la section est requis.'); return }
    setSaving(true); setErreur(null)
    try {
      const res = await fetch(`/api/v1/admin/ressources/${ressourceId}/sections`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v),
      })
      const data = await res.json()
      const updated = [...sections, data]
      setSections(updated); syncParent(updated); setAdding(false)
    } catch { setErreur('Erreur réseau') }
    finally { setSaving(false) }
  }

  async function handleUpdate(sectionId: number, v: typeof emptyForm) {
    if (!v.titre.trim()) { setErreur('Le titre de la section est requis.'); return }
    setSaving(true); setErreur(null)
    try {
      const res = await fetch(`/api/v1/admin/ressources/${ressourceId}/sections/${sectionId}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v),
      })
      const data = await res.json()
      const updated = sections.map(s => s.id === sectionId ? data : s)
      setSections(updated); syncParent(updated); setEditingId(null)
    } catch { setErreur('Erreur réseau') }
    finally { setSaving(false) }
  }

  async function handleDelete(sectionId: number) {
    if (!confirm('Supprimer cette section ? Les captures qui y sont rattachées seront déclassées.')) return
    setDeletingId(sectionId)
    try {
      await fetch(`/api/v1/admin/ressources/${ressourceId}/sections/${sectionId}`, { method: 'DELETE', credentials: 'include' })
      const updated = sections.filter(s => s.id !== sectionId)
      setSections(updated); syncParent(updated)
    } catch { /* ignore */ }
    finally { setDeletingId(null) }
  }

  async function handleMove(i: number, dir: -1 | 1) {
    const target = i + dir
    if (target < 0 || target >= sections.length) return
    const ids = sections.map(s => s.id)
    ;[ids[i], ids[target]] = [ids[target], ids[i]]
    setReorderingId(sections[i].id)
    try {
      const res = await fetch(`/api/v1/admin/ressources/${ressourceId}/sections/reorder`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      const data = await res.json()
      if (Array.isArray(data)) { setSections(data); syncParent(data) }
    } catch { /* ignore */ }
    finally { setReorderingId(null) }
  }

  return (
    <div className="border-t border-[var(--color-light-border)] pt-4 mt-1">
      <div className="flex items-center justify-between mb-3">
        <p className="font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)]">
          Sections du guide ({sections.length})
        </p>
        {!adding && (
          <button type="button" onClick={() => { setAdding(true); setEditingId(null) }}
            className="font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-brand)] inline-flex items-center gap-1.5 hover:underline">
            <span aria-hidden="true" className="material-symbols-outlined text-sm">add</span>Nouvelle section
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <span className="material-symbols-outlined text-xl text-[var(--color-dark-text-2)] animate-spin">progress_activity</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2 mb-3">
          {sections.map((s, i) => (
            <div key={s.id} className="bg-[var(--color-light-0)] rounded-xl p-4">
              {editingId === s.id ? (
                <SectionForm initial={formFromSection(s)} saving={saving} ressourceId={ressourceId}
                  onCancel={() => setEditingId(null)} onSubmit={v => handleUpdate(s.id, v)} />
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-body font-bold text-sm text-[var(--color-dark-1)] truncate">
                      {String(i + 1).padStart(2, '0')} · {s.titre}
                    </p>
                    <p className="font-body text-[11px] text-[var(--color-dark-text-2)] mt-0.5">
                      {s.etapes.length} étape{s.etapes.length > 1 ? 's' : ''}{s.astuce ? ' · astuce incluse' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 bg-[var(--color-light-2)] rounded-full px-1 py-1">
                    <button type="button" onClick={() => handleMove(i, -1)} disabled={i === 0 || reorderingId === s.id}
                      aria-label="Déplacer vers le haut" className="p-1.5 rounded-full text-[var(--color-dark-text-2)] hover:bg-[var(--color-light-0)] hover:text-[var(--color-dark-1)] transition-colors disabled:opacity-30">
                      <span className="material-symbols-outlined text-base">arrow_upward</span>
                    </button>
                    <button type="button" onClick={() => handleMove(i, 1)} disabled={i === sections.length - 1 || reorderingId === s.id}
                      aria-label="Déplacer vers le bas" className="p-1.5 rounded-full text-[var(--color-dark-text-2)] hover:bg-[var(--color-light-0)] hover:text-[var(--color-dark-1)] transition-colors disabled:opacity-30">
                      <span className="material-symbols-outlined text-base">arrow_downward</span>
                    </button>
                    <button type="button" onClick={() => { setEditingId(s.id); setAdding(false) }}
                      aria-label="Modifier la section" className="p-1.5 rounded-full text-[var(--color-dark-text-2)] hover:bg-[var(--color-light-0)] hover:text-[var(--color-brand)] transition-colors">
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button type="button" onClick={() => handleDelete(s.id)} disabled={deletingId === s.id}
                      aria-label="Supprimer la section" className="p-1.5 rounded-full text-[var(--color-dark-text-2)] hover:bg-red-50 hover:text-red-600 transition-colors">
                      <span className="material-symbols-outlined text-base">{deletingId === s.id ? 'progress_activity' : 'delete'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {sections.length === 0 && !adding && (
            <p className="font-body text-xs text-[var(--color-dark-text-2)] bg-[var(--color-light-0)] rounded-lg px-3 py-2">
              Ce guide n&apos;a pas encore de sections.
            </p>
          )}
        </div>
      )}

      {adding && (
        <div className="bg-[var(--color-light-0)] rounded-xl p-4 mb-3">
          <SectionForm initial={emptyForm} saving={saving} ressourceId={ressourceId}
            onCancel={() => setAdding(false)} onSubmit={handleCreate} />
        </div>
      )}
      {erreur && <p className="font-body text-xs text-red-600 mt-2">{erreur}</p>}
    </div>
  )
}

function RessourceCard({
  r, bundles, onDelete, onBundleChange, sectionsFor, setSectionsFor, onSectionsChanged, deletingId,
}: {
  r: Ressource; bundles: Bundle[]; onDelete: (id: number) => void
  onBundleChange: (id: number, bundleId: number | null) => void
  sectionsFor: number | null; setSectionsFor: (id: number | null) => void
  onSectionsChanged: (id: number, s: RessourceSection[]) => void
  deletingId: number | null
}) {
  const isOpen = sectionsFor === r.id
  return (
    <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[16px] p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-light-0)] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[var(--color-brand)] text-xl">
              {r.type_source === 'upload' ? 'picture_as_pdf' : 'link'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-body font-bold text-sm text-[var(--color-dark-1)] truncate">{r.titre}</p>
            <p className="font-body text-[11px] text-[var(--color-dark-text-2)] mt-0.5 truncate">
              {CAT_LABEL[r.categorie] || r.categorie} · {r.client_nom ? r.client_nom : 'Tous les clients'}
            </p>
          </div>
        </div>
        <button onClick={() => onDelete(r.id)} disabled={deletingId === r.id} aria-label="Supprimer"
          className="p-1 rounded-full text-[var(--color-dark-text-2)] hover:text-red-600 hover:bg-red-50 transition-colors shrink-0">
          <span className="material-symbols-outlined text-lg">{deletingId === r.id ? 'progress_activity' : 'delete'}</span>
        </button>
      </div>

      {r.description && <p className="font-body text-xs text-[var(--color-dark-text-2)]">{r.description}</p>}

      {/* Sélecteur de bundle — discret, fond surface-2 */}
      <select
        value={r.bundle_id ?? ''}
        onChange={e => onBundleChange(r.id, e.target.value ? Number(e.target.value) : null)}
        className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-3 py-2 font-body text-xs text-[var(--color-dark-text-2)] outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
      >
        <option value="">— Sans bundle —</option>
        {bundles.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
      </select>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-[var(--color-light-border)]">
        <a href={r.url} target="_blank" rel="noopener noreferrer"
          className="font-body text-xs font-bold uppercase tracking-wide text-[var(--color-brand)] inline-flex items-center gap-1.5 hover:underline">
          <span aria-hidden="true" className="material-symbols-outlined text-sm">open_in_new</span>Ouvrir
        </a>
        <button type="button" onClick={() => setSectionsFor(isOpen ? null : r.id)}
          className="font-body text-xs font-bold uppercase tracking-wide text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-1)] inline-flex items-center gap-1.5 transition-colors">
          <span aria-hidden="true" className="material-symbols-outlined text-sm">{isOpen ? 'expand_less' : 'edit_note'}</span>
          {isOpen ? 'Masquer les sections' : 'Sections du guide'}
        </button>
      </div>

      {isOpen && (
        <SectionsPanel ressourceId={r.id} onSectionsChanged={s => onSectionsChanged(r.id, s)} />
      )}
    </div>
  )
}

const ICONES = ['language', 'folder', 'campaign', 'ads_click', 'share', 'storefront', 'mail', 'bar_chart', 'palette', 'photo_camera']
const SANS_BUNDLE = 'sans-bundle'

export default function RessourcesAdminPage() {
  const [ressources, setRessources] = useState<Ressource[]>([])
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [sectionsFor, setSectionsFor] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Recherche + filtre bundle
  const [search, setSearch] = useState('')
  const [bundleFiltre, setBundleFiltre] = useState<number | typeof SANS_BUNDLE | null>(null)

  // Bundle management
  const [showBundleForm, setShowBundleForm] = useState(false)
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null)
  const [bundleNom, setBundleNom] = useState('')
  const [bundleDesc, setBundleDesc] = useState('')
  const [bundleIcone, setBundleIcone] = useState('folder')
  const [savingBundle, setSavingBundle] = useState(false)
  const [deletingBundle, setDeletingBundle] = useState<number | null>(null)

  // Resource form
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [categorie, setCategorie] = useState('guide')
  const [cible, setCible] = useState<'tous' | string>('tous')
  const [typeSource, setTypeSource] = useState<'lien' | 'upload'>('lien')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [bundleId, setBundleId] = useState<string>('')

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [rRes, bRes] = await Promise.all([
        fetch('/api/v1/admin/ressources', { credentials: 'include' }),
        fetch('/api/v1/admin/ressource-bundles', { credentials: 'include' }),
      ])
      const rData = await rRes.json()
      const bData = await bRes.json()
      if (Array.isArray(rData)) setRessources(rData)
      if (Array.isArray(bData)) setBundles(bData)
    } catch {
      showToast('Erreur de chargement', false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    fetch('/api/v1/admin/clients', { credentials: 'include' })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setClients(data) })
      .catch(() => {})
  }, [fetchAll])

  function resetForm() {
    setTitre(''); setDescription(''); setCategorie('guide'); setCible('tous')
    setTypeSource('lien'); setUrl(''); setFile(null); setBundleId('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titre.trim()) { showToast('Le titre est requis.', false); return }
    if (typeSource === 'lien' && !url.trim()) { showToast('Veuillez indiquer un lien.', false); return }
    if (typeSource === 'upload' && !file) { showToast('Veuillez choisir un fichier.', false); return }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('titre', titre.trim())
      fd.append('description', description.trim())
      fd.append('categorie', categorie)
      fd.append('type_source', typeSource)
      if (cible !== 'tous') fd.append('id_client', cible)
      if (typeSource === 'lien') fd.append('url', url.trim())
      if (typeSource === 'upload' && file) fd.append('file', file)
      if (bundleId) fd.append('bundle_id', bundleId)
      const res = await fetch('/api/v1/admin/ressources', { method: 'POST', credentials: 'include', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { showToast(data.error || 'Erreur serveur', false); return }
      showToast('Ressource ajoutée.')
      resetForm(); setShowForm(false); fetchAll()
    } catch { showToast('Erreur de connexion', false) }
    finally { setSubmitting(false) }
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer cette ressource ?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/v1/admin/ressources/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) { showToast('Erreur lors de la suppression', false); return }
      setRessources(prev => prev.filter(r => r.id !== id))
      showToast('Ressource supprimée.')
    } catch { showToast('Erreur de connexion', false) }
    finally { setDeletingId(null) }
  }

  async function handleBundleChange(ressourceId: number, bid: number | null) {
    const snapshot = ressources
    setRessources(prev => prev.map(r => r.id === ressourceId ? { ...r, bundle_id: bid } : r))
    try {
      const res = await fetch(`/api/v1/admin/ressources/${ressourceId}/bundle`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundle_id: bid }),
      })
      if (!res.ok) { setRessources(snapshot); showToast('Erreur de mise à jour', false); return }
      const data = await res.json()
      setRessources(prev => prev.map(r => r.id === ressourceId ? { ...r, bundle_id: data.bundle_id } : r))
    } catch { setRessources(snapshot); showToast('Erreur de mise à jour', false) }
  }

  function handleSectionsChanged(ressourceId: number, sections: RessourceSection[]) {
    setRessources(prev => prev.map(r => r.id === ressourceId ? { ...r, sections } : r))
  }

  function openBundleEdit(b: Bundle) {
    setEditingBundle(b); setBundleNom(b.nom); setBundleDesc(b.description || ''); setBundleIcone(b.icone); setShowBundleForm(true)
  }

  function openBundleCreate() {
    setEditingBundle(null); setBundleNom(''); setBundleDesc(''); setBundleIcone('folder'); setShowBundleForm(true)
  }

  async function handleBundleSave() {
    if (!bundleNom.trim()) { showToast('Nom du bundle requis.', false); return }
    setSavingBundle(true)
    try {
      const body = { nom: bundleNom.trim(), description: bundleDesc.trim() || null, icone: bundleIcone }
      const res = editingBundle
        ? await fetch(`/api/v1/admin/ressource-bundles/${editingBundle.id}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/v1/admin/ressource-bundles', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Erreur', false); return }
      if (editingBundle) {
        setBundles(prev => prev.map(b => b.id === editingBundle.id ? data : b))
      } else {
        setBundles(prev => [...prev, data])
      }
      setShowBundleForm(false); setEditingBundle(null)
      showToast(editingBundle ? 'Bundle mis à jour.' : 'Bundle créé.')
    } catch { showToast('Erreur réseau', false) }
    finally { setSavingBundle(false) }
  }

  async function handleBundleDelete(bid: number) {
    if (!confirm('Supprimer ce bundle ? Les ressources seront déclassées mais pas supprimées.')) return
    setDeletingBundle(bid)
    try {
      const res = await fetch(`/api/v1/admin/ressource-bundles/${bid}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) { showToast('Erreur suppression', false); return }
      setBundles(prev => prev.filter(b => b.id !== bid))
      setRessources(prev => prev.map(r => r.bundle_id === bid ? { ...r, bundle_id: null } : r))
      if (bundleFiltre === bid) setBundleFiltre(null)
      showToast('Bundle supprimé.')
    } catch { showToast('Erreur réseau', false) }
    finally { setDeletingBundle(null) }
  }

  // Recherche (titre + description) — état UI pur
  const searched = ressources.filter(r =>
    r.titre.toLowerCase().includes(search.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(search.toLowerCase())
  )
  const aDesOrphelines = searched.some(r => r.bundle_id === null || !bundles.find(b => b.id === r.bundle_id))

  // Filtre bundle (un seul actif à la fois), appliqué après la recherche
  const filtered = bundleFiltre === null
    ? searched
    : bundleFiltre === SANS_BUNDLE
      ? searched.filter(r => r.bundle_id === null || !bundles.find(b => b.id === r.bundle_id))
      : searched.filter(r => r.bundle_id === bundleFiltre)

  // Regrouper par bundle (calculé sur le résultat filtré)
  const grouped: { bundle: Bundle | null; ressources: Ressource[] }[] = []
  for (const b of bundles) {
    if (bundleFiltre !== null && bundleFiltre !== b.id) continue
    grouped.push({ bundle: b, ressources: filtered.filter(r => r.bundle_id === b.id) })
  }
  if (bundleFiltre === null || bundleFiltre === SANS_BUNDLE) {
    const nonClasse = filtered.filter(r => r.bundle_id === null || !bundles.find(b => b.id === r.bundle_id))
    if (nonClasse.length > 0) grouped.push({ bundle: null, ressources: nonClasse })
  }

  return (
    <div className="max-w-5xl mx-auto">

      {toast && (
        <div role="status" aria-live="polite" aria-atomic="true" className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-3 transition-all ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            {toast.ok ? 'check_circle' : 'error'}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <p className="font-body font-bold text-[11px] uppercase tracking-[0.16em] text-[var(--color-brand)] mb-1">Gestion administrative</p>
          <h1 className="font-display text-[var(--color-dark-0)] leading-none" style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em' }}>Ressources clients</h1>
          <p className="font-body text-sm text-[var(--color-dark-text-2)] mt-2 max-w-md">
            Guides et documents organisés par bundle — assignables à tous les clients ou à un client spécifique.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openBundleCreate}
            className="inline-flex items-center gap-2 bg-[var(--color-light-2)] border border-[var(--color-light-border)] text-[var(--color-dark-1)] px-5 py-3 rounded-full font-body font-bold text-xs uppercase tracking-widest hover:border-[var(--color-brand)] transition-colors whitespace-nowrap">
            <span aria-hidden="true" className="material-symbols-outlined text-base">create_new_folder</span>
            Nouveau bundle
          </button>
          <button onClick={() => setShowForm(s => !s)}
            className="inline-flex items-center gap-2 bg-[var(--color-brand)] text-white px-5 py-3 rounded-full font-body font-bold text-xs uppercase tracking-widest hover:bg-[var(--color-brand-hover)] transition-colors whitespace-nowrap">
            <span aria-hidden="true" className="material-symbols-outlined text-base">{showForm ? 'close' : 'add'}</span>
            {showForm ? 'Annuler' : 'Nouvelle ressource'}
          </button>
        </div>
      </div>

      {/* Bundle form modal */}
      {showBundleForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowBundleForm(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[460px] p-7" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-xl text-[var(--color-dark-1)] mb-6">
              {editingBundle ? 'Modifier le bundle' : 'Nouveau bundle'}
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Nom</label>
                <input value={bundleNom} onChange={e => setBundleNom(e.target.value)}
                  placeholder="Ex. Site web, Réseaux sociaux…" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Description (optionnelle)</label>
                <textarea value={bundleDesc} onChange={e => setBundleDesc(e.target.value)} rows={2}
                  className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className={labelCls}>Icône</label>
                <div className="flex flex-wrap gap-2">
                  {ICONES.map(ic => (
                    <button key={ic} type="button" onClick={() => setBundleIcone(ic)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${bundleIcone === ic ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white' : 'border-[var(--color-light-border)] text-[var(--color-dark-text-2)] hover:border-[var(--color-brand)]'}`}>
                      <span className="material-symbols-outlined text-lg">{ic}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button type="button" onClick={() => setShowBundleForm(false)}
                className="font-body text-xs font-bold uppercase tracking-wide px-5 py-2.5 rounded-full text-[var(--color-dark-text-2)] hover:bg-[var(--color-light-0)] transition-colors">
                Annuler
              </button>
              <button type="button" onClick={handleBundleSave} disabled={savingBundle}
                className="font-body text-xs font-bold uppercase tracking-wide px-6 py-2.5 rounded-full bg-[var(--color-brand)] text-white disabled:opacity-60 hover:bg-[var(--color-brand-hover)] transition-colors">
                {savingBundle ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resource form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Titre</label>
              <input type="text" value={titre} onChange={e => setTitre(e.target.value)}
                placeholder="Ex. Guide d'utilisation de votre site web" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Catégorie</label>
              <select value={categorie} onChange={e => setCategorie(e.target.value)} className={inputCls}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className={labelCls}>Description (optionnelle)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              placeholder="Courte description affichée au client" className={`${inputCls} resize-none`} />
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className={labelCls}>Bundle</label>
              <select value={bundleId} onChange={e => setBundleId(e.target.value)} className={inputCls}>
                <option value="">— Sans bundle —</option>
                {bundles.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Destinataire</label>
              <select value={cible} onChange={e => setCible(e.target.value)} className={inputCls}>
                <option value="tous">Tous les clients</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nom_entreprise || c.nom_complet}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Source</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setTypeSource('lien')}
                  className={`flex-1 px-4 py-3 rounded-xl font-body text-xs font-bold uppercase tracking-wide transition-colors ${typeSource === 'lien' ? 'bg-[var(--color-brand)] text-white' : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)]'}`}>
                  Lien
                </button>
                <button type="button" onClick={() => setTypeSource('upload')}
                  className={`flex-1 px-4 py-3 rounded-xl font-body text-xs font-bold uppercase tracking-wide transition-colors ${typeSource === 'upload' ? 'bg-[var(--color-brand)] text-white' : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)]'}`}>
                  Fichier
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            {typeSource === 'lien' ? (
              <>
                <label className={labelCls}>Lien</label>
                <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" className={inputCls} />
              </>
            ) : (
              <>
                <label className={labelCls}>Fichier (PDF, etc.)</label>
                <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className={inputCls} />
              </>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <button type="submit" disabled={submitting}
              className="bg-[var(--color-brand)] text-white px-6 py-3 rounded-full font-body font-bold text-xs uppercase tracking-widest disabled:opacity-60 hover:bg-[var(--color-brand-hover)] transition-colors">
              {submitting ? 'Envoi…' : 'Ajouter la ressource'}
            </button>
          </div>
        </form>
      )}

      {/* Recherche */}
      <div className="relative mb-4">
        <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-dark-text-2)]">search</span>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher une ressource…"
          className="w-full bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-full pl-12 pr-6 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
        />
      </div>

      {/* Chips bundle */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <button onClick={() => setBundleFiltre(null)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-xs font-bold transition-colors ${bundleFiltre === null ? 'bg-[var(--color-brand)] text-white' : 'bg-[var(--color-light-2)] border border-[var(--color-light-border)] text-[var(--color-dark-text-2)] hover:border-[var(--color-brand)]'}`}>
          Tous
          <span className={`text-[11px] leading-none px-1.5 py-0.5 rounded-full ${bundleFiltre === null ? 'bg-white/25 text-white' : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)]'}`}>{searched.length}</span>
        </button>
        {bundles.map(b => {
          const count = searched.filter(r => r.bundle_id === b.id).length
          const active = bundleFiltre === b.id
          return (
            <button key={b.id} onClick={() => setBundleFiltre(active ? null : b.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-xs font-bold transition-colors ${active ? 'bg-[var(--color-brand)] text-white' : 'bg-[var(--color-light-2)] border border-[var(--color-light-border)] text-[var(--color-dark-text-2)] hover:border-[var(--color-brand)]'}`}>
              {b.nom}
              <span className={`text-[11px] leading-none px-1.5 py-0.5 rounded-full ${active ? 'bg-white/25 text-white' : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)]'}`}>{count}</span>
            </button>
          )
        })}
        {aDesOrphelines && (
          <button onClick={() => setBundleFiltre(bundleFiltre === SANS_BUNDLE ? null : SANS_BUNDLE)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-xs font-bold transition-colors ${bundleFiltre === SANS_BUNDLE ? 'bg-[var(--color-brand)] text-white' : 'bg-[var(--color-light-2)] border border-[var(--color-light-border)] text-[var(--color-dark-text-2)] hover:border-[var(--color-brand)]'}`}>
            Sans bundle
            <span className={`text-[11px] leading-none px-1.5 py-0.5 rounded-full ${bundleFiltre === SANS_BUNDLE ? 'bg-white/25 text-white' : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)]'}`}>
              {searched.filter(r => r.bundle_id === null || !bundles.find(b => b.id === r.bundle_id)).length}
            </span>
          </button>
        )}
      </div>

      {/* List grouped by bundle */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined text-3xl text-[var(--color-dark-text-2)] animate-spin">progress_activity</span>
        </div>
      ) : ressources.length === 0 ? (
        <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-16 text-center">
          <span className="material-symbols-outlined text-4xl text-[var(--color-dark-text-2)] block mb-4">menu_book</span>
          <p className="font-body text-[var(--color-dark-text-2)]">Aucune ressource pour le moment.</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-[var(--color-dark-text-2)] font-body text-center py-16">Aucune ressource trouvée.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.map(({ bundle, ressources: rs }) => (
            <div key={bundle?.id ?? 'none'}>
              {/* Bundle header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--color-light-0)]">
                  <span className="material-symbols-outlined text-lg" style={{ color: bundle ? 'var(--color-brand)' : 'var(--color-dark-text-2)' }}>
                    {bundle?.icone ?? 'folder_off'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-base uppercase tracking-wide text-[var(--color-dark-1)] leading-none">
                    {bundle?.nom ?? 'Sans bundle'}
                  </h2>
                  {bundle?.description && (
                    <p className="font-body text-xs text-[var(--color-dark-text-2)] mt-1">{bundle.description}</p>
                  )}
                </div>
                {bundle && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openBundleEdit(bundle)}
                      className="p-2 rounded-full text-[var(--color-dark-text-2)] hover:bg-[var(--color-light-0)] hover:text-[var(--color-dark-1)] transition-colors" aria-label="Modifier">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => handleBundleDelete(bundle.id)} disabled={deletingBundle === bundle.id}
                      className="p-2 rounded-full text-[var(--color-dark-text-2)] hover:bg-red-50 hover:text-red-600 transition-colors" aria-label="Supprimer">
                      <span className="material-symbols-outlined text-lg">{deletingBundle === bundle.id ? 'progress_activity' : 'delete'}</span>
                    </button>
                  </div>
                )}
              </div>

              {rs.length === 0 ? (
                <p className="font-body text-xs text-[var(--color-dark-text-2)] bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-xl px-4 py-3">
                  Ce bundle ne contient pas encore de ressources.
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {rs.map(r => (
                    <RessourceCard
                      key={r.id} r={r} bundles={bundles}
                      onDelete={handleDelete} onBundleChange={handleBundleChange}
                      sectionsFor={sectionsFor} setSectionsFor={setSectionsFor}
                      onSectionsChanged={handleSectionsChanged} deletingId={deletingId}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
