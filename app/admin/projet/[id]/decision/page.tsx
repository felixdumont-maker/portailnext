'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Choices {
  choix_directions: string | null
  choix_noms: string | null
  nom_suggestion: string | null
  choix_icones: string | null
  choix_typos: string | null
  choix_palettes: string | null
  choix_logos: string | null
  commentaires: string | null
  submitted_at: string | null
}

interface AssetSlot {
  url: string | null
  url2?: string | null
  flat_url?: string | null
  name: string
}

interface Board {
  config_json: string | null
  is_active: boolean
  icon1: AssetSlot; icon2: AssetSlot; icon3: AssetSlot; icon4: AssetSlot
  logo1: AssetSlot; logo2: AssetSlot; logo3: AssetSlot; logo4: AssetSlot
}

const CONFIG_PLACEHOLDER = `{
  "accent_color": "var(--color-brand)",
  "accent_color_rgb": "232,59,20",
  "directions": [
    {
      "emoji": "✨",
      "title": "Signature personnelle",
      "description": "...",
      "vibe": "Chaleureux, authentique",
      "examples": ["Prénom Concept", "Concept Prénom"]
    }
  ],
  "names": ["Nom Option 1", "Nom Option 2", "Nom Option 3"],
  "typos": [
    {
      "title": "Serif classique",
      "titleFont": "Playfair Display, serif",
      "titleWeight": "500",
      "bodyFont": "Lato, sans-serif",
      "bodyWeight": "300",
      "titleFontName": "Playfair Display",
      "bodyFontName": "Lato Light"
    }
  ],
  "palettes": [
    {
      "title": "Palette A",
      "colors": ["#2C2C2C", "var(--color-brand)", "#FAF7F3", "#E0D9D3", "#FF6F3D"],
      "tag": "premium"
    }
  ]
}`

function parseBoard(raw: Record<string, string | null | boolean> | null): Board {
  const g = (k: string) => (raw ? (raw[k] as string | null) : null)
  return {
    config_json: g('config_json'),
    is_active: raw ? Boolean(raw['is_active']) : false,
    icon1: { url: g('icon1_url'), name: g('icon1_name') || 'Style A' },
    icon2: { url: g('icon2_url'), name: g('icon2_name') || 'Style B' },
    icon3: { url: g('icon3_url'), name: g('icon3_name') || 'Style C' },
    icon4: { url: g('icon4_url'), name: g('icon4_name') || 'Style D' },
    logo1: { url: g('logo1_url'), url2: g('logo1_url2'), flat_url: g('logo1_flat_url'), name: g('logo1_name') || 'Composition A' },
    logo2: { url: g('logo2_url'), url2: g('logo2_url2'), flat_url: g('logo2_flat_url'), name: g('logo2_name') || 'Composition B' },
    logo3: { url: g('logo3_url'), url2: g('logo3_url2'), flat_url: g('logo3_flat_url'), name: g('logo3_name') || 'Composition C' },
    logo4: { url: g('logo4_url'), url2: g('logo4_url2'), flat_url: g('logo4_flat_url'), name: g('logo4_name') || 'Composition D' },
  }
}

const inputCls = "bg-[var(--color-light-0)] border-none rounded-xl px-4 py-3 font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none w-full"
const labelCls = "text-[10px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body"

function ChoiceRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-3 py-2 border-b border-[var(--color-light-0)] last:border-0">
      <span className="font-semibold text-sm text-[var(--color-dark-1)] font-body min-w-[140px] shrink-0">{label} :</span>
      <span className="text-sm text-[var(--color-dark-3)] font-body">{value}</span>
    </div>
  )
}

function AssetCard({
  label, slot, nameKey, fileKey, file2Key, flatKey,
  onNameChange, onFileChange,
}: {
  label: string
  slot: AssetSlot
  nameKey: string
  fileKey: string
  file2Key?: string
  flatKey?: string
  onNameChange: (key: string, val: string) => void
  onFileChange: (key: string, file: File) => void
}) {
  const ref1 = useRef<HTMLInputElement>(null)
  const ref2 = useRef<HTMLInputElement>(null)
  const refFlat = useRef<HTMLInputElement>(null)

  return (
    <div className="border border-[var(--color-light-border)] rounded-2xl p-5 space-y-4">
      <p className="font-display text-lg text-[var(--color-dark-1)] tracking-wide">{label}</p>

      {/* Preview principale */}
      {slot.url ? (
        <img src={slot.url} alt={label} className="h-20 w-full object-contain bg-[var(--color-light-1)] rounded-xl" />
      ) : (
        <div className="h-20 w-full bg-[var(--color-light-1)] rounded-xl flex items-center justify-center">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-light-border-2)] text-3xl">image</span>
        </div>
      )}

      <div className="space-y-1">
        <label className={labelCls}>Nom affiché</label>
        <input type="text" aria-label="Nom de la police" value={slot.name} onChange={e => onNameChange(nameKey, e.target.value)} className={inputCls} />
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Image (PNG, SVG, AVIF, WEBP)</label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => ref1.current?.click()}
            className="flex-1 bg-[var(--color-light-0)] hover:bg-[var(--color-light-border)] text-[var(--color-dark-3)] rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest font-body transition-colors text-left">
            {ref1.current?.files?.[0]?.name || 'Choisir un fichier…'}
          </button>
          <input ref={ref1} type="file" accept=".png,.svg,.avif,.webp,.jpg,.jpeg" className="hidden"
            onChange={e => e.target.files?.[0] && onFileChange(fileKey, e.target.files[0])} />
        </div>
      </div>

      {file2Key && (
        <div className="space-y-1">
          <label className={labelCls}>2e image optionnelle <span className="font-normal text-[var(--color-dark-text-2)]">(carousel)</span></label>
          {slot.url2 && <img src={slot.url2} alt="2e image" className="h-14 object-contain bg-[var(--color-light-1)] rounded-xl" />}
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => ref2.current?.click()}
              className="flex-1 bg-[var(--color-light-0)] hover:bg-[var(--color-light-border)] text-[var(--color-dark-3)] rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest font-body transition-colors text-left">
              {ref2.current?.files?.[0]?.name || 'Choisir…'}
            </button>
            <input ref={ref2} type="file" accept=".png,.svg,.avif,.webp,.jpg,.jpeg" className="hidden"
              onChange={e => e.target.files?.[0] && onFileChange(file2Key, e.target.files[0])} />
          </div>
        </div>
      )}

      {flatKey && (
        <div className="space-y-1 pt-3 border-t border-dashed border-[var(--color-light-border)]">
          <label className={labelCls}>Forme brute (NB)</label>
          {slot.flat_url && <img src={slot.flat_url} alt="NB" className="h-12 w-12 object-contain bg-[var(--color-light-1)] rounded-xl grayscale" />}
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => refFlat.current?.click()}
              className="flex-1 bg-[var(--color-light-0)] hover:bg-[var(--color-light-border)] text-[var(--color-dark-3)] rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest font-body transition-colors text-left">
              {refFlat.current?.files?.[0]?.name || 'Choisir…'}
            </button>
            <input ref={refFlat} type="file" accept=".png,.svg,.avif,.webp,.jpg,.jpeg" className="hidden"
              onChange={e => e.target.files?.[0] && onFileChange(flatKey, e.target.files[0])} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminDecisionBoardPage() {
  const { id } = useParams<{ id: string }>()

  const [board, setBoard] = useState<Board>({
    config_json: null, is_active: false,
    icon1: { url: null, name: 'Style A' }, icon2: { url: null, name: 'Style B' },
    icon3: { url: null, name: 'Style C' }, icon4: { url: null, name: 'Style D' },
    logo1: { url: null, url2: null, flat_url: null, name: 'Composition A' },
    logo2: { url: null, url2: null, flat_url: null, name: 'Composition B' },
    logo3: { url: null, url2: null, flat_url: null, name: 'Composition C' },
    logo4: { url: null, url2: null, flat_url: null, name: 'Composition D' },
  })
  const [choices, setChoices] = useState<Choices | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fichiers sélectionnés localement (pas encore uploadés)
  const [files, setFiles] = useState<Record<string, File>>({})

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/admin/projet/${id}/decision`, { credentials: 'include' })
      const data = await res.json()
      setBoard(parseBoard(data.board))
      setChoices(data.choices)
    } catch {
      setError('Impossible de charger le decision board.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  function handleNameChange(key: string, val: string) {
    const slot = key.startsWith('icon') ? key.replace('_name', '') : key.replace('_name', '')
    const num = key.charAt(4)
    const type = key.startsWith('icon') ? `icon${num}` : `logo${num}`
    setBoard(b => ({ ...b, [type]: { ...((b as unknown) as Record<string, AssetSlot>)[type], name: val } }))
  }

  function handleFileChange(key: string, file: File) {
    setFiles(f => ({ ...f, [key]: file }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')

    if (board.config_json) {
      try { JSON.parse(board.config_json) }
      catch { setError('JSON invalide. Vérifiez la syntaxe.'); return }
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('is_active', board.is_active ? '1' : '0')
      fd.append('config_json', board.config_json || '')

      for (let i = 1; i <= 4; i++) {
        const icon = ((board as unknown) as Record<string, AssetSlot>)[`icon${i}`]
        const logo = ((board as unknown) as Record<string, AssetSlot>)[`logo${i}`]
        fd.append(`icon${i}_name`, icon.name)
        fd.append(`logo${i}_name`, logo.name)
        if (files[`icon${i}`]) fd.append(`icon${i}`, files[`icon${i}`])
        if (files[`logo${i}`]) fd.append(`logo${i}`, files[`logo${i}`])
        if (files[`logo${i}_url2`]) fd.append(`logo${i}_url2`, files[`logo${i}_url2`])
        if (files[`logo${i}_flat`]) fd.append(`logo${i}_flat`, files[`logo${i}_flat`])
      }

      const res = await fetch(`/api/v1/admin/projet/${id}/decision`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('Decision board sauvegardé.')
        setFiles({})
        await load()
      } else {
        setError(data.error || 'Erreur lors de la sauvegarde.')
      }
    } catch {
      setError('Erreur réseau.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-[var(--color-dark-text-2)] font-body text-center mt-20">Chargement...</p>

  const hasChoices = Boolean(choices)

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      <Link href={`/admin/projet/${id}`}
        className="inline-flex items-center gap-2 text-[var(--color-dark-text-2)] font-body text-sm hover:text-[var(--color-dark-1)] transition-colors">
        ← Retour au projet
      </Link>

      <div>
        <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] tracking-tight leading-none uppercase">DECISION BOARD</h1>
        <p className="text-[var(--color-dark-text-2)] font-body text-sm mt-1">Configuration des options présentées au client</p>
      </div>

      {error && (
        <div className="bg-[var(--color-error-bg)] text-[var(--color-error-text)] px-4 py-3 rounded-lg text-sm font-medium font-body">
          {error} <button onClick={() => setError('')} className="ml-3 underline">Fermer</button>
        </div>
      )}
      {success && (
        <div className="bg-[var(--color-success-bg)] text-[var(--color-success-text)] px-4 py-3 rounded-lg text-sm font-medium font-body">
          {success}
        </div>
      )}

      {/* Choix du client */}
      {hasChoices && choices && (
        <section className="bg-[#f0faf0] border border-[#a7d7aa] rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-[var(--text-xl)] text-[#2e7d32] uppercase tracking-wide">
              ✅ CHOIX SOUMIS PAR LE CLIENT
            </h2>
            <span className="text-xs text-[#5a8a5e] font-body">{choices.submitted_at}</span>
          </div>
          <div className="space-y-0.5">
            <ChoiceRow label="Directions"    value={choices.choix_directions} />
            <ChoiceRow label="Noms"          value={choices.choix_noms} />
            <ChoiceRow label="Suggestion nom" value={choices.nom_suggestion} />
            <ChoiceRow label="Icônes"        value={choices.choix_icones} />
            <ChoiceRow label="Typographies"  value={choices.choix_typos} />
            <ChoiceRow label="Palettes"      value={choices.choix_palettes} />
            <ChoiceRow label="Logos"         value={choices.choix_logos} />
            <ChoiceRow label="Commentaires"  value={choices.commentaires} />
          </div>
        </section>
      )}

      {!hasChoices && (
        <div className="bg-[var(--color-light-1)] border border-[var(--color-light-border)] rounded-3xl p-6 text-center">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-light-border-2)] text-4xl">schedule</span>
          <p className="text-[var(--color-dark-text-2)] font-body text-sm mt-2">Le client n&apos;a pas encore soumis ses choix.</p>
        </div>
      )}

      {/* Formulaire de configuration */}
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Activer + JSON config */}
        <section className="bg-white rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-[var(--text-xl)] text-[var(--color-dark-text-2)] uppercase tracking-wide">CONFIGURATION</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm font-bold text-[var(--color-brand)] font-body uppercase tracking-widest">
                Activer (visible par le client)
              </span>
              <div
                onClick={() => setBoard(b => ({ ...b, is_active: !b.is_active }))}
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${board.is_active ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-light-border-2)]'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${board.is_active ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
            </label>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>
              Configuration JSON <span className="font-normal text-[var(--color-dark-text-2)]">(sections absentes = cachées)</span>
            </label>
            <textarea
              value={board.config_json || ''}
              onChange={e => setBoard(b => ({ ...b, config_json: e.target.value }))}
              rows={16}
              placeholder={CONFIG_PLACEHOLDER}
              className="w-full bg-[var(--color-light-0)] border-none rounded-xl px-5 py-4 font-mono text-xs text-[var(--color-dark-1)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none resize-y"
            />
            <p className="text-[10px] text-[var(--color-dark-text-2)] font-body">
              Clés supportées : <code>accent_color</code>, <code>accent_color_rgb</code>, <code>directions</code>, <code>names</code>, <code>typos</code>, <code>palettes</code>. Les icônes et logos sont uploadés ci-dessous.
            </p>
          </div>
        </section>

        {/* Icônes */}
        <section className="bg-white rounded-3xl p-8">
          <h2 className="font-display text-[var(--text-xl)] text-[var(--color-dark-text-2)] uppercase mb-6 tracking-wide">
            ICÔNES <span className="text-base font-normal">(max 4)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {([1, 2, 3, 4] as const).map(i => (
              <AssetCard
                key={i}
                label={`Icône ${i}`}
                slot={((board as unknown) as Record<string, AssetSlot>)[`icon${i}`]}
                nameKey={`icon${i}_name`}
                fileKey={`icon${i}`}
                onNameChange={handleNameChange}
                onFileChange={handleFileChange}
              />
            ))}
          </div>
        </section>

        {/* Logos */}
        <section className="bg-white rounded-3xl p-8">
          <h2 className="font-display text-[var(--text-xl)] text-[var(--color-dark-text-2)] uppercase mb-6 tracking-wide">
            FORMES DE LOGO <span className="text-base font-normal">(max 4)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {([1, 2, 3, 4] as const).map(i => (
              <AssetCard
                key={i}
                label={`Logo ${i}`}
                slot={((board as unknown) as Record<string, AssetSlot>)[`logo${i}`]}
                nameKey={`logo${i}_name`}
                fileKey={`logo${i}`}
                file2Key={`logo${i}_url2`}
                flatKey={`logo${i}_flat`}
                onNameChange={handleNameChange}
                onFileChange={handleFileChange}
              />
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-display text-[var(--text-xl)] py-5 rounded-full tracking-widest uppercase transition-all disabled:opacity-60"
          >
            {saving ? 'SAUVEGARDE EN COURS…' : '💾 SAUVEGARDER'}
          </button>
          <Link
            href={`/admin/projet/${id}`}
            className="bg-[var(--color-light-0)] text-[var(--color-dark-3)] px-8 py-5 rounded-full font-display text-[var(--text-xl)] tracking-widest uppercase hover:bg-[var(--color-light-border)] transition-colors"
          >
            ANNULER
          </Link>
        </div>

      </form>
    </div>
  )
}
