'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || ''

// ─── Types ────────────────────────────────────────────────────

interface Logo         { public_url: string | null; preview_url: string | null; filename: string | null }
interface PaletteColor { hex: string; label?: string }
interface Font         { nom_font: string; google_font_url: string | null; usage: string | null }
interface ImageAsset   { id: number; public_url: string | null; label: string | null; filename: string | null }

interface IdentiteData {
  id: number
  nom_projet: string
  statut_publication: 'brouillon' | 'publie'
  contexte: string | null
  palette: PaletteColor[]
  logos: Record<string, Logo>
  fonts: Font[]
  declinaisons: ImageAsset[]
  mockups: ImageAsset[]
  zip_url: string
}

// ─── Logo variants ────────────────────────────────────────────

const LOGO_VARIANTS = [
  { key: 'principal', label: 'Logo principal',    bg: 'var(--color-light-2)', dark: false },
  { key: 'icone',     label: 'Icône',             bg: 'var(--color-light-2)', dark: false },
  { key: 'variante',  label: 'Variante inversée', bg: 'var(--color-dark-1)',  dark: true  },
] as const

// ─── Helpers ─────────────────────────────────────────────────

function SectionHead({ num, title }: { num: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-brand)', letterSpacing: '0.08em', flexShrink: 0 }}>{num}</span>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)', letterSpacing: '-0.01em', textTransform: 'uppercase' as const, color: 'var(--color-light-text)', margin: 0 }}>{title}</h2>
      <div style={{ flex: 1, height: '1px', background: 'var(--color-light-border)' }} />
    </div>
  )
}

function Shimmer({ w = '100%', h = '20px' }: { w?: string; h?: string }) {
  return <div style={{ width: w, height: h, borderRadius: 'var(--radius-sm)', background: 'var(--color-light-0)', flexShrink: 0 }} />
}

function SaveBtn({ saving, onClick, label = 'Sauvegarder' }: { saving: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase' as const,
        color: saving ? 'var(--color-light-text-3)' : 'var(--color-brand)',
        background: 'none', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', padding: 0,
        transition: 'opacity var(--duration-fast)',
      }}
    >
      {saving ? 'Sauvegarde…' : label}
    </button>
  )
}

// ─── Logo upload card ─────────────────────────────────────────

function LogoCard({ variantKey, label, bg, dark, logo, projetId, onUploaded }: {
  variantKey: string; label: string; bg: string; dark: boolean
  logo: Logo | undefined; projetId: string; onUploaded: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [hovering,  setHovering]  = useState(false)
  const [dragOver,  setDragOver]  = useState(false)

  const imgUrl = dark ? (logo?.preview_url ?? logo?.public_url) : logo?.public_url

  async function uploadFile(file: File) {
    setUploading(true)
    const form = new FormData()
    form.append('file', file); form.append('variant', variantKey)
    try {
      await fetch(`${API}/api/v1/admin/projet/${projetId}/identite/logo`, { method: 'POST', body: form, credentials: 'include' })
      onUploaded()
    } finally { setUploading(false) }
  }

  const borderColor = dark ? 'oklch(32% 0.01 40)' : 'var(--color-light-border-2)'
  const emptyColor  = dark ? 'oklch(42% 0.01 50)' : 'var(--color-light-text-3)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-2)' }}>
      <div
        role="button" tabIndex={0}
        onClick={() => !uploading && ref.current?.click()}
        onKeyDown={e => e.key === 'Enter' && !uploading && ref.current?.click()}
        onMouseEnter={() => setHovering(true)} onMouseLeave={() => { setHovering(false); setDragOver(false) }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) uploadFile(f) }}
        style={{
          aspectRatio: '4/3', background: dragOver ? (dark ? 'oklch(26% 0.015 35)' : 'var(--color-light-0)') : bg,
          borderRadius: 'var(--radius-md)',
          border: dragOver ? '2px solid var(--color-brand)' : imgUrl ? 'none' : `1px dashed ${borderColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', cursor: uploading ? 'wait' : 'pointer', position: 'relative' as const,
          outline: 'none', transition: `background var(--duration-fast)`,
        }}
      >
        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${dark ? 'oklch(35% 0.01 50)' : 'var(--color-light-border)'}`, borderTopColor: 'var(--color-brand)', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: emptyColor }}>Envoi…</span>
          </div>
        ) : imgUrl ? (
          <>
            <img src={imgUrl} alt={label} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'var(--overlay-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hovering ? 1 : 0, transition: 'opacity var(--duration-fast)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Remplacer</span>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 'var(--space-2)' }}>
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '24px', color: emptyColor }}>cloud_upload</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: emptyColor, textAlign: 'center', lineHeight: 1.4, maxWidth: '100px' }}>Glisser ou cliquer</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--space-1)' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: 'var(--color-light-text-3)' }}>{label}</span>
        {logo?.public_url && (
          <a href={logo.public_url} target="_blank" rel="noreferrer" download onClick={e => e.stopPropagation()}
            style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--color-brand)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' as const, letterSpacing: '0.05em', minHeight: '44px', alignSelf: 'center' }}>
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px' }}>download</span>DL
          </a>
        )}
      </div>
      <input ref={ref} type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = '' }} />
    </div>
  )
}

// ─── Image upload zone (déclinaisons / mockups) ───────────────

function ImageUploadZone({ endpoint, accept, onUploaded }: {
  endpoint: string; accept: string; onUploaded: (asset: ImageAsset) => void
}) {
  const ref  = useRef<HTMLInputElement>(null)
  const [label,     setLabel]     = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragOver,  setDragOver]  = useState(false)

  async function upload(file: File) {
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    if (label) form.append('label', label)
    try {
      const r = await fetch(`${API}${endpoint}`, { method: 'POST', body: form, credentials: 'include' })
      const d = await r.json()
      if (d.ok) { onUploaded(d); setLabel('') }
    } finally { setUploading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-2)' }}>
      <input
        type="text" placeholder="Label (optionnel)" value={label} onChange={e => setLabel(e.target.value)}
        style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text)', background: 'var(--color-light-0)', border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2) var(--space-3)', outline: 'none', width: '100%' }}
      />
      <div
        role="button" tabIndex={0}
        onClick={() => !uploading && ref.current?.click()}
        onKeyDown={e => e.key === 'Enter' && !uploading && ref.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) upload(f) }}
        style={{
          height: '80px', borderRadius: 'var(--radius-md)',
          border: dragOver ? '2px solid var(--color-brand)' : '1px dashed var(--color-light-border-2)',
          background: dragOver ? 'var(--color-light-0)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
          cursor: uploading ? 'wait' : 'pointer', outline: 'none',
          transition: `background var(--duration-fast), border-color var(--duration-fast)`,
        }}
      >
        {uploading ? (
          <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--color-light-border)', borderTopColor: 'var(--color-brand)', animation: 'spin 0.8s linear infinite' }} />
        ) : (
          <>
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-light-border-2)' }}>cloud_upload</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>Glisser ou cliquer pour ajouter</span>
          </>
        )}
      </div>
      <input ref={ref} type="file" accept={accept} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────

export default function AdminIdentiteVisuellePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [data,       setData]       = useState<IdentiteData | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [published,  setPublished]  = useState(false)
  const [noIV,       setNoIV]       = useState(false)
  const [creating,   setCreating]   = useState(false)

  // Palette editor state
  const [palette,      setPalette]      = useState<PaletteColor[]>([])
  const [savingPal,    setSavingPal]    = useState(false)

  // Font editor state
  const [fonts,        setFonts]        = useState<Font[]>([])
  const [savingFonts,  setSavingFonts]  = useState(false)

  const loadData = useCallback(() => {
    fetch(`${API}/api/v1/admin/projet/${id}/identite`, { credentials: 'include' })
      .then(r => {
        if (r.status === 401) { router.push('/'); return null }
        if (r.status === 404) { setNoIV(true); setLoading(false); return null }
        if (!r.ok) { setLoading(false); return null }
        return r.json()
      })
      .then(d => {
        if (!d) return
        setData(d)
        setPublished(d.statut_publication === 'publie')
        setPalette(d.palette || [])
        setFonts(d.fonts || [])
        setLoading(false)
        setNoIV(false)
      })
      .catch(() => setLoading(false))
  }, [id, router])

  useEffect(() => { loadData() }, [loadData])

  async function createIV() {
    setCreating(true)
    await fetch(`${API}/api/v1/admin/projet/${id}/identite`, { method: 'POST', credentials: 'include' })
    loadData()
    setCreating(false)
  }

  async function publish() {
    setPublishing(true)
    await fetch(`${API}/api/v1/admin/projet/${id}/identite/publier`, { method: 'POST', credentials: 'include' })
    setPublished(true); setPublishing(false)
  }

  async function savePalette() {
    setSavingPal(true)
    await fetch(`${API}/api/v1/admin/projet/${id}/identite/palette`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ palette }),
    })
    setSavingPal(false)
  }

  async function saveFonts() {
    setSavingFonts(true)
    await fetch(`${API}/api/v1/admin/projet/${id}/identite/fonts`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fonts }),
    })
    setSavingFonts(false)
  }

  async function deleteDeclinaison(declId: number) {
    await fetch(`${API}/api/v1/admin/projet/${id}/identite/declinaison/${declId}`, { method: 'DELETE', credentials: 'include' })
    setData(d => d ? { ...d, declinaisons: d.declinaisons.filter(x => x.id !== declId) } : d)
  }

  async function deleteMockup(mockupId: number) {
    await fetch(`${API}/api/v1/admin/projet/${id}/identite/mockup/${mockupId}`, { method: 'DELETE', credentials: 'include' })
    setData(d => d ? { ...d, mockups: d.mockups.filter(x => x.id !== mockupId) } : d)
  }

  if (loading) return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <Shimmer w="90px" h="12px" />
      <div style={{ marginTop: 'var(--space-10)', display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><Shimmer w="280px" h="32px" /><Shimmer w="160px" h="40px" /></div>
        <Shimmer h="72px" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
          <Shimmer h="180px" /><Shimmer h="180px" /><Shimmer h="180px" />
        </div>
      </div>
    </div>
  )

  if (noIV) return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <Link href={`/admin/projet/${id}`} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: 'var(--color-light-text-3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-8)', minHeight: '44px' }}>
        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>Retour au projet
      </Link>
      <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-start', gap: 'var(--space-4)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', color: 'var(--color-light-text)', margin: 0 }}>Identité visuelle</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-3)', margin: 0 }}>Aucune identité visuelle pour ce projet.</p>
        <button onClick={createIV} disabled={creating} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: 'white', background: creating ? 'var(--color-light-border-2)' : 'var(--color-brand)', border: 'none', borderRadius: 'var(--radius-full)', padding: 'var(--space-3) var(--space-6)', cursor: creating ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', minHeight: '44px' }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          {creating ? 'Création…' : 'Créer l\'identité visuelle'}
        </button>
      </div>
    </div>
  )

  if (!data) return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-light-text-3)' }}>Erreur de chargement.</p>
    </div>
  )

  let n = 0
  const num = () => String(++n).padStart(2, '0')

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* ── Back ── */}
      <Link href={`/admin/projet/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--color-light-text-3)', textDecoration: 'none', marginBottom: 'var(--space-8)', minHeight: '44px', transition: 'color var(--duration-fast)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-light-text)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-light-text-3)')}>
        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>Retour au projet
      </Link>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 'var(--space-4)', marginBottom: 'var(--space-12)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', letterSpacing: '-0.02em', textTransform: 'uppercase' as const, color: 'var(--color-light-text)', margin: '0 0 var(--space-2)' }}>Identité visuelle</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-3)', margin: 0 }}>{data.nom_projet}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-full)', background: published ? 'var(--color-success-glow)' : 'var(--color-light-0)', color: published ? 'var(--color-success)' : 'var(--color-light-text-3)', border: `1px solid ${published ? 'var(--color-success-border)' : 'var(--color-light-border)'}` }}>
            {published ? 'Publié' : 'Brouillon'}
          </span>
          <button onClick={publish} disabled={publishing || published}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: 'white', background: (publishing || published) ? 'var(--color-light-border-2)' : 'var(--color-brand)', border: 'none', borderRadius: 'var(--radius-full)', padding: 'var(--space-2) var(--space-6)', cursor: (publishing || published) ? 'not-allowed' : 'pointer', minHeight: '40px', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
            onMouseEnter={e => { if (!publishing && !published) e.currentTarget.style.background = 'var(--color-brand-hover)' }}
            onMouseLeave={e => { if (!publishing && !published) e.currentTarget.style.background = 'var(--color-brand)' }}>
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>{published ? 'check' : 'send'}</span>
            {published ? 'Envoyé' : publishing ? 'Envoi…' : 'Envoyer au client'}
          </button>
        </div>
      </div>

      {/* ── 01 Palette ── */}
      <section style={{ marginBottom: 'var(--space-16)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-brand)', letterSpacing: '0.08em', flexShrink: 0 }}>{num()}</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)', letterSpacing: '-0.01em', textTransform: 'uppercase' as const, color: 'var(--color-light-text)', margin: 0 }}>Palette de couleurs</h2>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-light-border)' }} />
          <SaveBtn saving={savingPal} onClick={savePalette} />
        </div>

        {/* Preview bar */}
        {palette.length > 0 && (
          <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '60px', marginBottom: 'var(--space-4)' }}>
            {palette.map((c, i) => <div key={i} style={{ flex: 1, background: c.hex }} />)}
          </div>
        )}

        {/* Editable color rows */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-2)' }}>
          {palette.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <input type="color" value={c.hex} onChange={e => setPalette(p => p.map((x, j) => j === i ? { ...x, hex: e.target.value } : x))}
                style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-light-border)', cursor: 'pointer', padding: '2px', background: 'none' }} />
              <input type="text" value={c.hex} onChange={e => setPalette(p => p.map((x, j) => j === i ? { ...x, hex: e.target.value } : x))}
                style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-light-text)', background: 'var(--color-light-0)', border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2) var(--space-3)', width: '100px', outline: 'none' }} />
              <input aria-label="Label" type="text" placeholder="Label" value={c.label || ''} onChange={e => setPalette(p => p.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text)', background: 'var(--color-light-0)', border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2) var(--space-3)', flex: 1, outline: 'none' }} />
              <button onClick={() => setPalette(p => p.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-light-text-3)', display: 'flex', alignItems: 'center', padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)' }}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>
          ))}
          <button onClick={() => setPalette(p => [...p, { hex: '#000000', label: '' }])}
            style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--color-light-text-3)', background: 'none', border: '1px dashed var(--color-light-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2) var(--space-4)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', alignSelf: 'flex-start', marginTop: 'var(--space-1)' }}>
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>Ajouter une couleur
          </button>
        </div>
      </section>

      {/* ── 02 Logos ── */}
      <section style={{ marginBottom: 'var(--space-16)' }}>
        <SectionHead num={num()} title="Logos" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)' }}>
          {LOGO_VARIANTS.map(v => (
            <LogoCard key={v.key} variantKey={v.key} label={v.label} bg={v.bg} dark={v.dark}
              logo={data.logos[v.key]} projetId={id} onUploaded={loadData} />
          ))}
        </div>
      </section>

      {/* ── 03 Typographie ── */}
      <section style={{ marginBottom: 'var(--space-16)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-brand)', letterSpacing: '0.08em', flexShrink: 0 }}>{num()}</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)', letterSpacing: '-0.01em', textTransform: 'uppercase' as const, color: 'var(--color-light-text)', margin: 0 }}>Typographie</h2>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-light-border)' }} />
          <SaveBtn saving={savingFonts} onClick={saveFonts} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-3)' }}>
          {fonts.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-light-0)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-light-border)' }}>
              <input aria-label="Nom de la police" type="text" placeholder="Nom de la police" value={f.nom_font} onChange={e => setFonts(fs => fs.map((x, j) => j === i ? { ...x, nom_font: e.target.value } : x))}
                style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', background: 'transparent', border: 'none', outline: 'none', flex: 1 }} />
              <input aria-label="Usage (ex: Titres)" type="text" placeholder="Usage (ex: Titres)" value={f.usage || ''} onChange={e => setFonts(fs => fs.map((x, j) => j === i ? { ...x, usage: e.target.value } : x))}
                style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-2)', background: 'transparent', border: 'none', outline: 'none', width: '150px' }} />
              <button onClick={() => setFonts(fs => fs.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-light-text-3)', display: 'flex', alignItems: 'center', padding: 'var(--space-1)' }}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>
          ))}
          <button onClick={() => setFonts(fs => [...fs, { nom_font: '', google_font_url: null, usage: null }])}
            style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--color-light-text-3)', background: 'none', border: '1px dashed var(--color-light-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2) var(--space-4)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', alignSelf: 'flex-start' }}>
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>Ajouter une police
          </button>
        </div>
      </section>

      {/* ── 04 Déclinaisons ── */}
      <section style={{ marginBottom: 'var(--space-16)' }}>
        <SectionHead num={num()} title="Déclinaisons couleur" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
          {data.declinaisons.map(d => (
            <div key={d.id}>
              <div style={{ position: 'relative' as const, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--color-light-0)', border: '1px solid var(--color-light-border)', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {d.public_url ? <img src={d.public_url} alt={d.label || ''} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 'var(--space-3)' }} /> : <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--color-light-border-2)' }}>image</span>}
                <button onClick={() => deleteDeclinaison(d.id)} style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-2)', background: 'var(--overlay-dark)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                </button>
              </div>
              {d.label && <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.10em', color: 'var(--color-light-text-3)', margin: 'var(--space-2) 0 0' }}>{d.label}</p>}
            </div>
          ))}
        </div>
        <ImageUploadZone
          endpoint={`/api/v1/admin/projet/${id}/identite/declinaison`}
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onUploaded={asset => setData(d => d ? { ...d, declinaisons: [...d.declinaisons, asset] } : d)}
        />
      </section>

      {/* ── 05 Mockups ── */}
      <section style={{ marginBottom: 'var(--space-16)' }}>
        <SectionHead num={num()} title="Mockups" />
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
          {data.mockups.map(m => (
            <div key={m.id} style={{ position: 'relative' as const, borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--color-light-0)', border: '1px solid var(--color-light-border)' }}>
              {m.public_url ? <img src={m.public_url} alt={m.label || ''} style={{ width: '100%', display: 'block' }} /> : <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-light-border-2)' }}>image</span></div>}
              {m.label && <div style={{ padding: 'var(--space-3) var(--space-4)' }}><span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.10em', color: 'var(--color-light-text-3)' }}>{m.label}</span></div>}
              <button onClick={() => deleteMockup(m.id)} style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-2)', background: 'var(--overlay-dark)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
              </button>
            </div>
          ))}
        </div>
        <ImageUploadZone
          endpoint={`/api/v1/admin/projet/${id}/identite/mockup`}
          accept="image/png,image/jpeg,image/webp"
          onUploaded={asset => setData(d => d ? { ...d, mockups: [...d.mockups, asset] } : d)}
        />
      </section>

      {/* ── ZIP ── */}
      {data.zip_url && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 'var(--space-4)', padding: 'var(--space-6)', background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-8)' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-light-text)', margin: '0 0 var(--space-1)' }}>Tous les fichiers</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 0 }}>Logo, icône, variante et assets — archive complète.</p>
          </div>
          <a href={`${API}${data.zip_url}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-6)', background: 'var(--color-brand)', color: 'white', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', textDecoration: 'none', minHeight: '48px', flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-brand-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-brand)')}>
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>Télécharger le ZIP
          </a>
        </div>
      )}

    </div>
  )
}
