'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Site {
  id: number
  template: string
  slug: string
  business_name: string
  owner_name: string
  email: string
  client_email: string
  phone: string
  city: string
  province: string
  address: string
  postal_code: string
  instagram: string
  facebook: string
  linkedin: string
  acuity_url: string
  hero_style: string
  seo_business_type: string
  seo_price_range: string
  github_repo: string | null
  sanity_project_id: string | null
  vercel_project_id: string | null
  vercel_url: string | null
  site_url: string | null
  resend_api_key: string | null
  status: string
  error_message: string | null
  created_at: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  creating:  { label: 'En création…', color: 'var(--color-warning)', icon: 'hourglass_top' },
  active:    { label: 'Prêt',         color: 'var(--color-success)', icon: 'check_circle'  },
  deployed:  { label: 'Déployé',      color: 'var(--color-info)', icon: 'cloud_done'    },
  error:     { label: 'Erreur',       color: 'var(--color-brand)', icon: 'error'         },
  draft:     { label: 'Brouillon',    color: 'var(--color-dark-text-2)', icon: 'draft'         },
}

function InfoRow({ label, value, href }: { label: string; value?: string | null; href?: string }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-light-border)' }}>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text-3)', fontFamily: 'var(--font-display)' }}>
        {label}
      </span>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-brand)', fontFamily: 'var(--font-body)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          {value}
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 14 }}>open_in_new</span>
        </a>
      ) : (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', fontFamily: 'var(--font-body)' }}>{value}</span>
      )}
    </div>
  )
}

function AssetZone({ siteId, slot, label, hint, icon, hasRepo }: {
  siteId: number; slot: string; label: string; hint: string; icon: string; hasRepo: boolean
}) {
  const [status, setStatus]   = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [filename, setFilename] = useState('')
  const [errMsg, setErrMsg]   = useState('')

  async function handleFile(file: File) {
    if (!file) return
    setStatus('uploading')
    setFilename(file.name)
    setErrMsg('')
    const fd = new FormData()
    fd.append('slot', slot)
    fd.append('file', file)
    try {
      const res  = await fetch(`/api/v1/admin/sites/${siteId}/assets`, {
        method: 'POST', credentials: 'include', body: fd,
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('done')
      } else {
        setStatus('error')
        setErrMsg(data.error || `Erreur ${res.status}`)
      }
    } catch (e) {
      setStatus('error')
      setErrMsg('Erreur réseau')
    }
  }

  const color = status === 'done' ? 'var(--color-success)' : status === 'error' ? 'var(--color-brand)' : status === 'uploading' ? 'var(--color-warning)' : 'var(--color-light-text-3)'
  const isImage = slot === 'hero' || slot === 'approche'

  return (
    <label
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 'var(--space-2)', padding: 'var(--space-5)',
        border: `2px dashed ${status === 'done' ? 'var(--color-success)' : status === 'error' ? 'var(--color-brand)' : 'var(--color-light-border)'}`,
        borderRadius: 'var(--radius-md)',
        background: status === 'done' ? 'var(--color-success-bg)' : status === 'error' ? 'var(--color-error-bg)' : 'var(--color-light-2)',
        cursor: hasRepo ? 'pointer' : 'not-allowed',
        opacity: hasRepo ? 1 : 0.5,
        transition: 'all var(--duration-fast)',
        textAlign: 'center',
      }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); if (hasRepo && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
    >
      <input
        type="file"
        style={{ display: 'none' }}
        disabled={!hasRepo}
        accept={isImage ? 'image/jpeg,image/webp,image/png,image/jpg' : 'image/svg+xml,image/png'}
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
      />
      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 28, color }}>
        {status === 'done' ? 'check_circle' : status === 'error' ? 'error' : status === 'uploading' ? 'hourglass_top' : icon}
      </span>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text)', margin: 0 }}>
        {label}
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color, margin: 0, wordBreak: 'break-all' }}>
        {status === 'done'     ? filename
         : status === 'error'  ? (errMsg || 'Erreur — réessayer')
         : status === 'uploading' ? 'Envoi…'
         : hint}
      </p>
    </label>
  )
}

const ASSET_SLOT_OPTIONS = [
  { slot: 'logo-icone',   label: 'Logo icône' },
  { slot: 'logo-texte',   label: 'Logo texte' },
  { slot: 'logo-complet', label: 'Logo complet' },
  { slot: 'favicon',      label: 'Favicon' },
  { slot: 'hero',         label: 'Photo hero' },
  { slot: 'approche',     label: 'Photo corpo / Proprio' },
]

function guessSlot(filename: string): string {
  const n = filename.toLowerCase()
  if (n.includes('favicon')) return 'favicon'
  if (n.includes('hero')) return 'hero'
  if (n.includes('approche') || n.includes('corpo') || n.includes('proprio') || n.includes('owner')) return 'approche'
  if (n.includes('icone') || n.includes('icon')) return 'logo-icone'
  if (n.includes('texte') || n.includes('text')) return 'logo-texte'
  if (n.includes('logo')) return 'logo-complet'
  return ''
}

let stagedKeySeq = 0
const newStagedKey = () => `staged-${Date.now()}-${stagedKeySeq++}`

interface StagedFile {
  key: string
  file: File
  previewUrl: string
  slot: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

function MultiDropZone({ siteId, hasRepo }: { siteId: number; hasRepo: boolean }) {
  const [staged, setStaged] = useState<StagedFile[]>([])
  const [dragOver, setDragOver] = useState(false)

  function addFiles(files: FileList | File[]) {
    const imgs = Array.from(files).filter(f => f.type.startsWith('image/'))
    const items: StagedFile[] = imgs.map(file => ({
      key: newStagedKey(),
      file,
      previewUrl: URL.createObjectURL(file),
      slot: guessSlot(file.name),
      status: 'pending',
    }))
    if (items.length) setStaged(prev => [...prev, ...items])
  }

  function setSlot(key: string, slot: string) {
    setStaged(prev => prev.map(s => s.key === key ? { ...s, slot } : s))
  }

  function remove(key: string) {
    setStaged(prev => prev.filter(s => s.key !== key))
  }

  async function sendOne(item: StagedFile) {
    if (!item.slot) return
    setStaged(prev => prev.map(s => s.key === item.key ? { ...s, status: 'uploading' } : s))
    const fd = new FormData()
    fd.append('slot', item.slot)
    fd.append('file', item.file)
    try {
      const res = await fetch(`/api/v1/admin/sites/${siteId}/assets`, { method: 'POST', credentials: 'include', body: fd })
      const data = await res.json()
      if (res.ok) {
        setStaged(prev => prev.map(s => s.key === item.key ? { ...s, status: 'done' } : s))
      } else {
        setStaged(prev => prev.map(s => s.key === item.key ? { ...s, status: 'error', error: data.error || 'Erreur' } : s))
      }
    } catch {
      setStaged(prev => prev.map(s => s.key === item.key ? { ...s, status: 'error', error: 'Erreur réseau' } : s))
    }
  }

  async function sendAll() {
    for (const item of staged) {
      if (item.slot && item.status === 'pending') {
        await sendOne(item)
      }
    }
  }

  const readyCount = staged.filter(s => s.slot && s.status === 'pending').length

  return (
    <div style={{ marginBottom: 'var(--space-5)', paddingBottom: 'var(--space-5)', borderBottom: '1px solid var(--color-light-border)' }}>
      <div
        onDragOver={e => { e.preventDefault(); if (hasRepo) setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault(); setDragOver(false)
          if (hasRepo && e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
        }}
        onClick={() => { if (hasRepo) document.getElementById(`multi-asset-input-${siteId}`)?.click() }}
        style={{
          border: `2px dashed ${dragOver ? 'var(--color-brand)' : 'var(--color-light-border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-5)',
          textAlign: 'center',
          background: dragOver ? 'var(--color-light-2)' : 'var(--color-light-2)',
          cursor: hasRepo ? 'pointer' : 'not-allowed',
          opacity: hasRepo ? 1 : 0.5,
          marginBottom: 'var(--space-3)',
          transition: 'all var(--duration-fast)',
        }}
      >
        <input
          id={`multi-asset-input-${siteId}`}
          type="file"
          accept="image/*"
          multiple
          disabled={!hasRepo}
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = '' }}
        />
        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--color-light-text-3)' }}>upload_file</span>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text)', margin: 'var(--space-2) 0 0' }}>
          Glissez plusieurs photos ici
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: '4px 0 0' }}>
          ou cliquez pour sélectionner — vous choisirez la destination de chacune ensuite
        </p>
      </div>

      {staged.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {staged.map(item => (
            <div key={item.key} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2)',
              border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-md)',
              background: item.status === 'done' ? 'var(--color-success-bg)' : item.status === 'error' ? 'var(--color-error-bg)' : 'white',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.previewUrl} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', fontFamily: 'var(--font-body)', color: 'var(--color-light-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.file.name}
                </p>
                {item.status === 'error' && (
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-brand)' }}>{item.error}</p>
                )}
              </div>
              <select
                value={item.slot}
                onChange={e => setSlot(item.key, e.target.value)}
                disabled={item.status === 'uploading' || item.status === 'done'}
                style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-body)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-light-border)', background: 'white', flexShrink: 0 }}
              >
                <option value="">— Destination —</option>
                {ASSET_SLOT_OPTIONS.map(o => <option key={o.slot} value={o.slot}>{o.label}</option>)}
              </select>
              {item.status === 'done' ? (
                <span aria-hidden="true" className="material-symbols-outlined" style={{ color: 'var(--color-success)', flexShrink: 0 }}>check_circle</span>
              ) : item.status === 'uploading' ? (
                <span aria-hidden="true" className="material-symbols-outlined" style={{ color: 'var(--color-warning)', flexShrink: 0 }}>hourglass_top</span>
              ) : (
                <button
                  onClick={() => sendOne(item)}
                  disabled={!item.slot}
                  className="bg-[var(--color-brand)] text-white py-2 px-4 rounded-full font-bold text-xs uppercase tracking-widest disabled:opacity-40"
                  style={{ fontFamily: 'var(--font-display)', flexShrink: 0 }}
                >
                  Envoyer
                </button>
              )}
              {item.status !== 'uploading' && (
                <button onClick={() => remove(item.key)} title="Retirer" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-light-text-3)', display: 'flex', flexShrink: 0 }}>
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                </button>
              )}
            </div>
          ))}
          <button
            onClick={sendAll}
            disabled={readyCount === 0}
            className="self-start bg-[var(--color-dark-0)] text-white py-3 px-7 rounded-full font-bold text-xs uppercase tracking-widest disabled:opacity-40"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Envoyer tout ({readyCount})
          </button>
        </div>
      )}
    </div>
  )
}

function Card({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-brand)' }}>{icon}</span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text)', margin: 0 }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

export default function SiteDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  const [site, setSite] = useState<Site | null>(null)
  const [loading, setLoading] = useState(true)
  const [deploying, setDeploying] = useState(false)
  const [deployError, setDeployError] = useState('')
  const [siteUrl, setSiteUrl] = useState('')
  const [resendKey, setResendKey] = useState('')
  const [committing, setCommitting] = useState(false)
  const [commitMsg, setCommitMsg] = useState<string | null>(null)

  async function load() {
    const res = await fetch(`/api/v1/admin/sites/${id}`, { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      setSite(data)
      setSiteUrl(data.site_url || '')
      setResendKey(data.resend_api_key || '')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  // Poll si en création
  useEffect(() => {
    if (site?.status !== 'creating') return
    const t = setTimeout(load, 3000)
    return () => clearTimeout(t)
  }, [site])

  async function handleCommit() {
    if (!site) return
    setCommitting(true)
    setCommitMsg(null)
    const res = await fetch(`/api/v1/admin/sites/${id}/commit`, { method: 'POST', credentials: 'include' })
    const data = await res.json()
    setCommitMsg(res.ok ? `Commit créé — Vercel redéploie (${data.ts})` : (data.error || 'Erreur'))
    setCommitting(false)
  }

  async function handleDeploy() {
    if (!site) return
    setDeployError('')
    setDeploying(true)
    const res = await fetch(`/api/v1/admin/sites/${id}/deploy`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_url: siteUrl, resend_api_key: resendKey }),
    })
    const data = await res.json()
    if (res.ok) {
      await load()
    } else {
      setDeployError(data.error || 'Erreur lors du déploiement.')
    }
    setDeploying(false)
  }

  if (loading) return <p style={{ color: 'var(--color-light-text-3)', fontSize: 'var(--text-sm)' }}>Chargement…</p>
  if (!site) return <p style={{ color: 'var(--color-light-text-3)', fontSize: 'var(--text-sm)' }}>Site introuvable.</p>

  const st = STATUS_CONFIG[site.status] ?? { label: site.status, color: 'var(--color-dark-text-2)', icon: 'info' }
  const isReservation = site.template === 'reservation'
  const templateLabel = isReservation ? 'Réservation' : 'Vitrine'

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Retour */}
      <button
        onClick={() => router.push('/admin/sites')}
        className="inline-flex items-center gap-2 text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] transition-colors text-sm font-medium mb-8"
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
      >
        <span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_back</span>
        Retour aux sites
      </button>

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-8)', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-light-text)', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
            {site.business_name}
          </h1>
          <p style={{ color: 'var(--color-light-text-3)', marginTop: 'var(--space-1)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)' }}>
            {templateLabel} · {site.slug}
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          padding: '8px 16px', borderRadius: 'var(--radius-full)',
          background: `${st.color}18`, flexShrink: 0,
        }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 16, color: st.color }}>{st.icon}</span>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: st.color, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {st.label}
          </span>
        </div>
      </div>

      {/* Erreur */}
      {site.status === 'error' && site.error_message && (
        <div className="bg-[var(--color-error-bg)] text-[var(--color-error-text)] px-5 py-4 rounded-lg text-sm mb-6">
          <strong>Erreur : </strong>{site.error_message}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

        {/* ── Liens & Déploiement ────────────────────────── */}
        <Card title="Infrastructure" icon="cloud">
          <div>
            <InfoRow label="Repo GitHub" value={site.github_repo} href={site.github_repo ? `https://github.com/${site.github_repo}` : undefined} />
            <InfoRow label="Projet Sanity" value={site.sanity_project_id} href={site.sanity_project_id ? `https://www.sanity.io/manage/project/${site.sanity_project_id}` : undefined} />
            <InfoRow label="URL Vercel" value={site.vercel_url} href={site.vercel_url || undefined} />
            <InfoRow label="URL finale" value={site.site_url} href={site.site_url || undefined} />
          </div>

          {/* Commit → redéploiement Vercel — visible si site déployé */}
          {site.github_repo && site.status === 'deployed' && (
            <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-light-border)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text)', margin: 0 }}>
                Redéployer
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 0 }}>
                Crée un commit dans GitHub pour déclencher un nouveau déploiement Vercel.
              </p>
              {commitMsg && (
                <p style={{ fontSize: 'var(--text-xs)', color: commitMsg.startsWith('Commit') ? 'var(--color-success)' : 'var(--color-brand)', margin: 0, fontFamily: 'var(--font-body)' }}>{commitMsg}</p>
              )}
              <button
                onClick={handleCommit}
                disabled={committing}
                className="self-start bg-[var(--color-dark-0)] text-white py-3 px-7 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[var(--color-dark-2)] transition-colors disabled:opacity-50"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">commit</span>
                {committing ? 'Commit en cours…' : 'Commit & Redéployer'}
              </button>
            </div>
          )}

          {/* Bloc déploiement — visible si repo créé et pas encore déployé */}
          {site.github_repo && site.status !== 'deployed' && site.status !== 'creating' && (
            <div style={{
              marginTop: 'var(--space-5)', paddingTop: 'var(--space-5)',
              borderTop: '1px solid var(--color-light-border)',
              display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
            }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text)', margin: 0 }}>
                Déployer sur Vercel
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text-2)' }}>
                    URL du site
                  </label>
                  <input
                    value={siteUrl}
                    onChange={e => setSiteUrl(e.target.value)}
                    placeholder="https://client.ca"
                    className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-4 py-3 text-[var(--color-dark-0)] placeholder:text-[var(--color-dark-text-2)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none"
                    style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text-2)' }}>
                    Clé Resend
                  </label>
                  <input
                    value={resendKey}
                    onChange={e => setResendKey(e.target.value)}
                    placeholder="re_xxxxxxxxxxxx"
                    className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-4 py-3 text-[var(--color-dark-0)] placeholder:text-[var(--color-dark-text-2)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none"
                    style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}
                  />
                </div>
              </div>
              {deployError && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-brand)', margin: 0, fontFamily: 'var(--font-body)' }}>{deployError}</p>
              )}
              <button
                onClick={handleDeploy}
                disabled={deploying}
                className="self-start bg-[var(--color-brand)] text-white py-3 px-7 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-50"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">rocket_launch</span>
                {deploying ? 'Déploiement…' : 'Déployer sur Vercel'}
              </button>
            </div>
          )}
        </Card>

        {/* ── Assets ────────────────────────────────────── */}
        <Card title="Assets" icon="image">
          <MultiDropZone siteId={site.id} hasRepo={!!site.github_repo} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            {[
              { slot: 'logo-icone',   label: 'Logo icône',        hint: 'SVG / PNG',  icon: 'interests' },
              { slot: 'logo-texte',   label: 'Logo texte',        hint: 'SVG / PNG',  icon: 'text_fields' },
              { slot: 'logo-complet', label: 'Logo complet',      hint: 'SVG / PNG',  icon: 'logo_dev' },
              { slot: 'favicon',      label: 'Favicon',           hint: 'PNG (carré)', icon: 'web' },
              { slot: 'hero',         label: 'Photo hero',        hint: 'JPG / WEBP', icon: 'image' },
              { slot: 'approche',     label: 'Photo corpo / Proprio', hint: 'JPG / WEBP', icon: 'portrait' },
            ].map(({ slot, label, hint, icon }) => (
              <AssetZone key={slot} siteId={site.id} slot={slot} label={label} hint={hint} icon={icon} hasRepo={!!site.github_repo} />
            ))}
          </div>
        </Card>

        {/* ── Infos client ───────────────────────────────── */}
        <Card title="Client" icon="person">
          <InfoRow label="Responsable" value={site.owner_name} />
          <InfoRow label="Email client (Sanity)" value={site.client_email} />
          <InfoRow label="Email contact" value={site.email} />
          <InfoRow label="Téléphone" value={site.phone} />
          <InfoRow label="Adresse" value={[site.address, site.city, site.province, site.postal_code].filter(Boolean).join(', ')} />
        </Card>

        {/* ── Configuration ──────────────────────────────── */}
        <Card title="Configuration" icon="settings">
          <InfoRow label="Template" value={templateLabel} />
          <InfoRow label="Style Hero" value={site.hero_style} />
          <InfoRow label="Type d'entreprise" value={site.seo_business_type} />
          <InfoRow label="Gamme de prix" value={site.seo_price_range} />
          {site.acuity_url && <InfoRow label="Acuity URL" value={site.acuity_url} href={site.acuity_url} />}
          {site.instagram && <InfoRow label="Instagram" value={site.instagram} />}
          {site.facebook && <InfoRow label="Facebook" value={site.facebook} />}
          {site.linkedin && <InfoRow label="LinkedIn" value={site.linkedin} />}
        </Card>
      </div>
    </div>
  )
}
