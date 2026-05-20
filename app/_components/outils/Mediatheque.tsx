'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'

const CATEGORIES = [
  { id: 'all',      label: 'Tous',            icon: 'grid_view' },
  { id: 'canva',    label: 'Templates Canva', icon: 'design_services' },
  { id: 'psd',      label: 'Fichiers PSD',    icon: 'layers' },
  { id: 'photos',   label: 'Photos libres',   icon: 'photo_library' },
  { id: 'polices',  label: 'Polices',         icon: 'font_download' },
  { id: 'logos',    label: 'Logos & assets',  icon: 'star' },
  { id: 'gabarits', label: 'Gabarits',        icon: 'folder_special' },
]

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif']
const FONT_EXT  = ['ttf', 'otf', 'woff', 'woff2']

function fileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  if (IMAGE_EXT.includes(ext)) return 'image'
  if (FONT_EXT.includes(ext))  return 'font_download'
  if (ext === 'pdf')            return 'picture_as_pdf'
  if (ext === 'psd' || ext === 'psb') return 'layers'
  if (ext === 'ai' || ext === 'eps')  return 'brush'
  return 'attach_file'
}

function isImage(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return IMAGE_EXT.includes(ext)
}

function formatSize(bytes: number) {
  if (bytes < 1024)        return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

interface Asset {
  id: string
  filename: string
  url: string
  category: string
  size: number
  uploaded: string
}

interface Gabarit {
  id: number
  nom: string
  description: string
  preview_url: string | null
  created_at: string
}

interface GabaritFile {
  id: string
  filename: string
  size: number
  mimeType: string
  url: string
  is_preview: boolean
}

interface Props {
  backHref: string
  isAdmin: boolean
}

// ── Sous-composant : vue d'un dossier gabarit ───────────────────────────────
function GabaritDetail({
  gabarit, isAdmin, onBack,
}: { gabarit: Gabarit; isAdmin: boolean; onBack: () => void }) {
  const [files, setFiles]         = useState<GabaritFile[]>([])
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileRef  = useRef<HTMLInputElement>(null)
  const prevRef  = useRef<HTMLInputElement>(null)

  const loadFiles = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/v1/tools/gabarits/${gabarit.id}/files`, { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      setFiles(data.files || [])
    }
    setLoading(false)
  }, [gabarit.id])

  useEffect(() => { loadFiles() }, [loadFiles])

  async function uploadFile(fileList: FileList | null, isPreview = false) {
    if (!fileList?.length) return
    setUploading(true)
    const fd = new FormData()
    fd.append(isPreview ? 'preview' : 'file', fileList[0])
    const url = isPreview
      ? `/api/v1/tools/gabarits/${gabarit.id}/preview`
      : `/api/v1/tools/gabarits/${gabarit.id}/files`
    await fetch(url, { method: 'POST', body: fd, credentials: 'include' })
    setUploading(false)
    loadFiles()
  }

  async function deleteFile(fileId: string) {
    if (!confirm('Supprimer ce fichier ?')) return
    await fetch(`/api/v1/tools/gabarits/${gabarit.id}/files/${fileId}`, {
      method: 'DELETE', credentials: 'include',
    })
    loadFiles()
  }

  const templateFiles = files.filter(f => !f.is_preview)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: 'var(--radius-full)',
          background: 'var(--color-light-0)', border: '1px solid var(--color-light-border)',
          color: 'var(--color-light-text-2)', cursor: 'pointer',
        }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
        </button>
        {gabarit.preview_url && (
          <img src={gabarit.preview_url} alt={gabarit.nom} loading="lazy"
            style={{ height: 60, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-light-border)', objectFit: 'cover' }} />
        )}
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--color-light-text)', margin: 0 }}>
            {gabarit.nom}
          </h2>
          {gabarit.description && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 0 }}>
              {gabarit.description}
            </p>
          )}
        </div>
        {isAdmin && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
            <button onClick={() => prevRef.current?.click()} disabled={uploading} style={{
              height: 34, padding: '0 var(--space-3)', borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-light-border)', background: 'var(--color-light-2)',
              color: 'var(--color-light-text-2)', fontFamily: 'var(--font-display)',
              fontWeight: 700, fontSize: 'var(--text-xs)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 16 }}>image</span>
              {gabarit.preview_url ? 'Changer aperçu' : 'Ajouter aperçu'}
            </button>
            <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
              height: 34, padding: '0 var(--space-4)', borderRadius: 'var(--radius-full)',
              background: 'var(--color-brand)', color: 'white', border: 'none',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xs)',
              cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.6 : 1,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 16 }}>upload</span>
              {uploading ? 'Envoi…' : 'Ajouter fichier'}
            </button>
            <input ref={fileRef} type="file" style={{ display: 'none' }}
              accept=".eps,.ai,.indd,.psd,.pdf,.svg,.zip,.jpg,.jpeg,.png,.tif,.tiff"
              onChange={e => uploadFile(e.target.files)} />
            <input ref={prevRef} type="file" style={{ display: 'none' }}
              accept=".jpg,.jpeg,.png,.webp"
              onChange={e => uploadFile(e.target.files, true)} />
          </div>
        )}
      </div>

      {/* Files */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-light-text-3)' }}>Chargement…</div>
      ) : templateFiles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-light-text-3)', fontFamily: 'var(--font-body)' }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 'var(--space-3)' }}>folder_open</span>
          Aucun fichier dans ce dossier.
          {isAdmin && ' Cliquez "Ajouter fichier" pour en uploader un.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {templateFiles.map(f => (
            <div key={f.id} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
              borderRadius: 'var(--radius-md)',
            }}>
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--color-brand)', flexShrink: 0 }}>
                {fileIcon(f.filename)}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.filename}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-light-text-3)' }}>{formatSize(f.size)}</div>
              </div>
              <a href={f.url} download={f.filename} style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px',
                background: 'var(--color-brand)', color: 'white', borderRadius: 'var(--radius-full)',
                textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xs)',
              }}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                Télécharger
              </a>
              {isAdmin && (
                <button onClick={() => deleteFile(f.id)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                  background: 'oklch(95% 0.04 25)', border: '1px solid oklch(85% 0.06 25)',
                  color: 'var(--color-error)', cursor: 'pointer',
                }}>
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Composant principal ─────────────────────────────────────────────────────
export default function Mediatheque({ backHref, isAdmin }: Props) {
  const [category, setCategory]           = useState('all')
  const [assets, setAssets]               = useState<Asset[]>([])
  const [loading, setLoading]             = useState(true)
  const [uploading, setUploading]         = useState(false)
  const [uploadCat, setUploadCat]         = useState('photos')
  const [dragOver, setDragOver]           = useState(false)
  const [search, setSearch]               = useState('')
  const [searchInput, setSearchInput]     = useState('')
  const fileInputRef  = useRef<HTMLInputElement>(null)
  const categoryCache = useRef<Map<string, Asset[]>>(new Map())
  const searchTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Gabarits
  const [gabarits, setGabarits]           = useState<Gabarit[]>([])
  const [gabaritsLoading, setGabaritsLoading] = useState(false)
  const [selectedGabarit, setSelectedGabarit] = useState<Gabarit | null>(null)
  const [showCreate, setShowCreate]       = useState(false)
  const [creating, setCreating]           = useState(false)
  const [createNom, setCreateNom]         = useState('')
  const [createDesc, setCreateDesc]       = useState('')
  const createPreviewRef = useRef<HTMLInputElement>(null)

  const isGabarits = category === 'gabarits'

  // ── Debounce recherche ──
  const handleSearchInput = (val: string) => {
    setSearchInput(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setSearch(val), 200)
  }

  // ── Chargement assets classiques (avec cache par catégorie) ──
  const load = useCallback(async (bust = false) => {
    if (isGabarits) return
    if (!bust && categoryCache.current.has(category)) {
      setAssets(categoryCache.current.get(category)!)
      return
    }
    setLoading(true)
    const q = category !== 'all' ? `?category=${category}` : ''
    const res = await fetch(`/api/v1/tools/assets${q}`, { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      categoryCache.current.set(category, data)
      setAssets(data)
    }
    setLoading(false)
  }, [category, isGabarits])

  useEffect(() => { load() }, [load])

  // ── Chargement gabarits ──
  const loadGabarits = useCallback(async () => {
    setGabaritsLoading(true)
    const res = await fetch('/api/v1/tools/gabarits', { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      setGabarits(data.gabarits || [])
    }
    setGabaritsLoading(false)
  }, [])

  useEffect(() => {
    if (isGabarits) loadGabarits()
  }, [isGabarits, loadGabarits])

  // ── Créer un dossier gabarit ──
  async function createGabarit() {
    if (!createNom.trim()) return
    setCreating(true)
    const fd = new FormData()
    fd.append('nom', createNom.trim())
    fd.append('description', createDesc.trim())
    if (createPreviewRef.current?.files?.[0]) {
      fd.append('preview', createPreviewRef.current.files[0])
    }
    const res = await fetch('/api/v1/tools/gabarits', { method: 'POST', body: fd, credentials: 'include' })
    if (res.ok) {
      setCreateNom('')
      setCreateDesc('')
      if (createPreviewRef.current) createPreviewRef.current.value = ''
      setShowCreate(false)
      loadGabarits()
    }
    setCreating(false)
  }

  async function deleteGabarit(id: number) {
    if (!confirm('Supprimer ce dossier ?')) return
    await fetch(`/api/v1/tools/gabarits/${id}`, { method: 'DELETE', credentials: 'include' })
    loadGabarits()
  }

  // ── Upload assets classiques (parallèle) ──
  async function uploadFiles(files: FileList | File[]) {
    const arr = Array.from(files)
    if (!arr.length) return
    setUploading(true)
    await Promise.all(arr.map(file => {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('category', uploadCat)
      return fetch('/api/v1/tools/upload', { method: 'POST', body: fd, credentials: 'include' })
    }))
    setUploading(false)
    categoryCache.current.delete(category)
    load(true)
  }

  async function deleteAsset(asset: Asset) {
    if (!confirm(`Supprimer "${asset.filename}" ?`)) return
    // Mise à jour optimiste
    setAssets(prev => prev.filter(a => a.id !== asset.id))
    categoryCache.current.delete(category)
    await fetch('/api/v1/tools/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: asset.id }),
    })
  }

  const filtered = useMemo(
    () => assets.filter(a => a.filename.toLowerCase().includes(search.toLowerCase())),
    [assets, search]
  )

  // Si un dossier gabarit est ouvert, afficher sa vue détail
  if (selectedGabarit) {
    return (
      <GabaritDetail
        gabarit={selectedGabarit}
        isAdmin={isAdmin}
        onBack={() => setSelectedGabarit(null)}
      />
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link href={backHref} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 'var(--radius-full)',
            background: 'var(--color-light-0)', border: '1px solid var(--color-light-border)',
            color: 'var(--color-light-text-2)', textDecoration: 'none',
          }}>
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
          </Link>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--color-light-text)', margin: 0 }}>
              Médiathèque
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 0 }}>
              {isGabarits ? `${gabarits.length} dossier${gabarits.length !== 1 ? 's' : ''}` : `${assets.length} fichier${assets.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {!isGabarits && (
            <>
              <input
                type="text"
                placeholder="Rechercher…"
                value={searchInput}
                onChange={e => handleSearchInput(e.target.value)}
                style={{
                  height: 36, padding: '0 var(--space-3)',
                  border: '1px solid var(--color-light-border)',
                  borderRadius: 'var(--radius-full)',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                  background: 'var(--color-light-2)', color: 'var(--color-light-text)',
                  outline: 'none', width: 180,
                }}
              />
              <select
                value={uploadCat}
                onChange={e => setUploadCat(e.target.value)}
                style={{
                  height: 36, padding: '0 var(--space-3)',
                  border: '1px solid var(--color-light-border)',
                  borderRadius: 'var(--radius-full)',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                  background: 'var(--color-light-2)', color: 'var(--color-light-text)',
                  outline: 'none',
                }}
              >
                {CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'gabarits').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  height: 36, padding: '0 var(--space-4)',
                  background: 'var(--color-brand)', color: 'white',
                  border: 'none', borderRadius: 'var(--radius-full)',
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: 'var(--text-sm)', cursor: uploading ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 18 }}>upload</span>
                {uploading ? 'Envoi…' : 'Uploader'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={e => e.target.files && uploadFiles(e.target.files)}
              />
            </>
          )}

          {isGabarits && isAdmin && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              style={{
                height: 36, padding: '0 var(--space-4)',
                background: showCreate ? 'var(--color-light-2)' : 'var(--color-brand)',
                color: showCreate ? 'var(--color-light-text-2)' : 'white',
                border: showCreate ? '1px solid var(--color-light-border)' : 'none',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 'var(--text-sm)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              }}
            >
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {showCreate ? 'close' : 'create_new_folder'}
              </span>
              {showCreate ? 'Annuler' : 'Créer un dossier'}
            </button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setCategory(cat.id); setSelectedGabarit(null); setShowCreate(false) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 'var(--radius-full)',
              border: '1px solid',
              borderColor: category === cat.id ? 'var(--color-brand)' : 'var(--color-light-border)',
              background: category === cat.id ? 'var(--color-brand)' : 'transparent',
              color: category === cat.id ? 'white' : 'var(--color-light-text-2)',
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'var(--text-xs)', cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 14 }}>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── VUE GABARITS ── */}
      {isGabarits ? (
        <div>
          {/* Formulaire de création (admin) */}
          {showCreate && (
            <div style={{
              background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
              borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
              marginBottom: 'var(--space-6)',
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-md)', color: 'var(--color-light-text)', margin: '0 0 var(--space-4)' }}>
                Nouveau dossier
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--color-light-text-2)', marginBottom: 4 }}>
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={createNom}
                    onChange={e => setCreateNom(e.target.value)}
                    placeholder="ex: Journal 1/4 page horizontal"
                    style={{
                      width: '100%', height: 38, padding: '0 var(--space-3)',
                      border: '1px solid var(--color-light-border)',
                      borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)', background: 'var(--color-light-0)',
                      color: 'var(--color-light-text)', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--color-light-text-2)', marginBottom: 4 }}>
                    Description (optionnel)
                  </label>
                  <input
                    type="text"
                    value={createDesc}
                    onChange={e => setCreateDesc(e.target.value)}
                    placeholder="ex: 4.25″ × 5.5″ — 300 dpi CMJN"
                    style={{
                      width: '100%', height: 38, padding: '0 var(--space-3)',
                      border: '1px solid var(--color-light-border)',
                      borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)', background: 'var(--color-light-0)',
                      color: 'var(--color-light-text)', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--color-light-text-2)', marginBottom: 4 }}>
                  Image d'aperçu (JPG ou PNG) — visible par le pigiste dans la galerie
                </label>
                <input ref={createPreviewRef} type="file" accept=".jpg,.jpeg,.png,.webp"
                  style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }} />
              </div>
              <button
                onClick={createGabarit}
                disabled={creating || !createNom.trim()}
                style={{
                  height: 38, padding: '0 var(--space-5)',
                  background: creating || !createNom.trim() ? 'var(--color-light-border)' : 'var(--color-brand)',
                  color: 'white', border: 'none', borderRadius: 'var(--radius-full)',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)',
                  cursor: creating || !createNom.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  {creating ? 'hourglass_empty' : 'create_new_folder'}
                </span>
                {creating ? 'Création…' : 'Créer le dossier'}
              </button>
            </div>
          )}

          {/* Galerie de dossiers */}
          {gabaritsLoading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-light-text-3)' }}>Chargement…</div>
          ) : gabarits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-light-text-3)', fontFamily: 'var(--font-body)' }}>
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 'var(--space-3)' }}>folder_special</span>
              {isAdmin ? 'Aucun dossier. Cliquez "Créer un dossier" pour commencer.' : 'Aucun gabarit disponible pour l\'instant.'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              {gabarits.map(g => (
                <div key={g.id} style={{ position: 'relative' }}>
                  <div
                    onClick={() => setSelectedGabarit(g)}
                    style={{
                      background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
                      borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: 'pointer',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 20px rgba(0,0,0,.1)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}
                  >
                    {/* Preview image */}
                    <div style={{ height: 130, background: 'var(--color-light-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {g.preview_url ? (
                        <img src={g.preview_url} alt={g.nom} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--color-light-text-3)' }}>folder_special</span>
                      )}
                    </div>
                    {/* Info */}
                    <div style={{ padding: 'var(--space-3)' }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {g.nom}
                      </div>
                      {g.description && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-light-text-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {g.description}
                        </div>
                      )}
                      <div style={{ marginTop: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-brand)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.7rem' }}>
                        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 14 }}>folder_open</span>
                        Voir les fichiers
                      </div>
                    </div>
                  </div>
                  {/* Bouton supprimer (admin) */}
                  {isAdmin && (
                    <button
                      onClick={e => { e.stopPropagation(); deleteGabarit(g.id) }}
                      style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 26, height: 26, borderRadius: 'var(--radius-full)',
                        background: 'rgba(255,255,255,.9)', border: '1px solid oklch(85% 0.06 25)',
                        color: 'var(--color-error)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── VUE ASSETS CLASSIQUES ── */
        <>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files) }}
            style={{
              border: `2px dashed ${dragOver ? 'var(--color-brand)' : 'var(--color-light-border)'}`,
              borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
              marginBottom: 'var(--space-6)', textAlign: 'center',
              color: 'var(--color-light-text-3)', fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              background: dragOver ? 'color-mix(in oklch, var(--color-brand) 5%, var(--color-light-2))' : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 6 }}>cloud_upload</span>
            Glisse des fichiers ici pour uploader dans <strong>{CATEGORIES.find(c => c.id === uploadCat)?.label}</strong>
          </div>

          {/* File grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-light-text-3)' }}>Chargement…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-light-text-3)', fontFamily: 'var(--font-body)' }}>
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 'var(--space-3)' }}>folder_open</span>
              {search ? 'Aucun fichier trouvé.' : 'Aucun fichier dans cette catégorie.'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
              {filtered.map(asset => (
                <div key={`${asset.category}/${asset.filename}`} style={{
                  background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
                  borderRadius: 'var(--radius-md)', overflow: 'hidden',
                }}>
                  <div style={{ height: 120, background: 'var(--color-light-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {isImage(asset.filename) ? (
                      <img src={asset.url} alt={asset.filename} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-light-text-3)' }}>
                        {fileIcon(asset.filename)}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: 'var(--space-3)' }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--color-light-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }} title={asset.filename}>
                      {asset.filename}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-light-text-3)', marginBottom: 'var(--space-3)' }}>
                      {formatSize(asset.size)}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <a href={asset.url} download={asset.filename} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 4, padding: '6px',
                        background: 'var(--color-light-0)', border: '1px solid var(--color-light-border)',
                        borderRadius: 'var(--radius-sm)', color: 'var(--color-light-text-2)',
                        textDecoration: 'none', fontSize: '0.7rem',
                        fontFamily: 'var(--font-display)', fontWeight: 700,
                      }}>
                        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 14 }}>download</span>
                        DL
                      </a>
                      {isAdmin && (
                        <button onClick={() => deleteAsset(asset)} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 32, padding: '6px',
                          background: 'oklch(95% 0.04 25)', border: '1px solid oklch(85% 0.06 25)',
                          borderRadius: 'var(--radius-sm)', color: 'var(--color-error)', cursor: 'pointer',
                        }}>
                          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
