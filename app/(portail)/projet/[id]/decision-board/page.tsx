'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || ''

interface Direction { emoji?: string; title: string; description?: string; vibe?: string; examples?: string[] }
interface Typo { title: string; titleFont?: string; titleWeight?: string | number; bodyFont?: string; bodyWeight?: string | number; titleFontName?: string; bodyFontName?: string }
interface Palette { title: string; colors: string[]; tag?: string }
interface AssetItem { url: string | null; name: string }

interface Config {
  accent_color?: string
  directions?: Direction[]
  names?: string[]
  typos?: Typo[]
  palettes?: Palette[]
}

interface Choices {
  choix_directions: string | null
  choix_noms: string | null
  nom_suggestion: string | null
  choix_icones: string | null
  choix_typos: string | null
  choix_palettes: string | null
  choix_logos: string | null
  commentaires: string | null
}

interface BoardData {
  nom_projet: string
  config_json: string | null
  icons: AssetItem[]
  logos: AssetItem[]
  choices: Choices | null
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)', fontSize: '10.5px', letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'var(--color-light-text-3)', fontWeight: 800,
}

function ChoiceCard({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--color-light-2)', borderRadius: 'var(--radius-lg)',
        border: `2px solid ${active ? 'var(--color-brand)' : 'var(--color-light-border)'}`,
        padding: 'var(--space-5)', cursor: 'pointer', position: 'relative',
        transition: `border-color var(--duration-fast)`,
      }}
    >
      {active && (
        <span aria-hidden="true" className="material-symbols-outlined" style={{
          position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', color: 'var(--color-brand)', fontSize: '20px',
        }}>check_circle</span>
      )}
      {children}
    </div>
  )
}

export default function DecisionBoardClientPage() {
  const { id } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [board, setBoard] = useState<BoardData | null>(null)
  const [config, setConfig] = useState<Config>({})

  const [selDirection, setSelDirection] = useState('')
  const [selName, setSelName] = useState('')
  const [selIcon, setSelIcon] = useState('')
  const [selTypo, setSelTypo] = useState('')
  const [selPalette, setSelPalette] = useState('')
  const [selLogo, setSelLogo] = useState('')
  const [nomSuggestion, setNomSuggestion] = useState('')
  const [commentaires, setCommentaires] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch(`${API}/api/v1/projet/${id}/decision-board`, { credentials: 'include' })
      .then(async r => {
        if (!r.ok) { setError((await r.json().catch(() => ({}))).error || "Decision board non disponible."); return null }
        return r.json() as Promise<BoardData>
      })
      .then(data => {
        if (!data) return
        setBoard(data)
        try { setConfig(data.config_json ? JSON.parse(data.config_json) : {}) } catch { setConfig({}) }
        if (data.choices) {
          setSelDirection(data.choices.choix_directions || '')
          setSelName(data.choices.choix_noms || '')
          setSelIcon(data.choices.choix_icones || '')
          setSelTypo(data.choices.choix_typos || '')
          setSelPalette(data.choices.choix_palettes || '')
          setSelLogo(data.choices.choix_logos || '')
          setNomSuggestion(data.choices.nom_suggestion || '')
          setCommentaires(data.choices.commentaires || '')
        }
      })
      .catch(() => setError('Erreur de connexion.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/api/v1/projet/${id}/decision-board`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          choix_directions: selDirection, choix_noms: selName, choix_icones: selIcon,
          choix_typos: selTypo, choix_palettes: selPalette, choix_logos: selLogo,
          nom_suggestion: nomSuggestion, commentaires,
        }),
      })
      if (res.ok) setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60dvh' }}>
      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-light-border-2)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
    </div>
  )

  if (error || !board) return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: 'var(--space-12)', paddingLeft: '1.5rem', paddingRight: '1.5rem', textAlign: 'center' }}>
      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-light-border-2)' }}>how_to_vote</span>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-3)', marginTop: 'var(--space-4)' }}>
        {error || 'Decision board non disponible.'}
      </p>
      <Link href={`/projet/${id}`} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-brand)', fontWeight: 700 }}>
        ← Retour au projet
      </Link>
    </div>
  )

  if (submitted) return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: 'var(--space-16)', paddingLeft: '1.5rem', paddingRight: '1.5rem', textAlign: 'center' }}>
      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-success)' }}>check_circle</span>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '36px',
        lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--color-light-text)', marginTop: 'var(--space-4)',
      }}>
        Choix soumis !
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)', marginTop: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        Notre équipe a reçu vos préférences et reviendra vers vous prochainement.
      </p>
      <Link href={`/projet/${id}`} style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--color-brand)',
        color: 'white', textDecoration: 'none', borderRadius: 'var(--radius-full)',
        padding: 'var(--space-3) var(--space-6)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)',
      }}>
        Retour au projet
      </Link>
    </div>
  )

  const hasDirections = (config.directions?.length ?? 0) > 0
  const hasNames = (config.names?.length ?? 0) > 0
  const hasIcons = board.icons.some(i => i.url)
  const hasTypos = (config.typos?.length ?? 0) > 0
  const hasPalettes = (config.palettes?.length ?? 0) > 0
  const hasLogos = board.logos.some(l => l.url)

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>

      <Link href={`/projet/${id}`} style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-light-text-3)',
        textDecoration: 'none', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-4)',
      }}>
        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
        Retour au projet
      </Link>

      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '36px',
          lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--color-light-text)', marginBottom: 'var(--space-2)',
        }}>
          Decision board
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)' }}>
          {board.nom_projet} — sélectionnez vos préférences pour chaque section. Vos choix guideront notre équipe.
        </p>
      </header>

      {hasDirections && (
        <section style={{ marginBottom: 'var(--space-10)' }}>
          <h2 style={{ ...labelStyle, fontSize: 'var(--text-xs)', marginBottom: 'var(--space-4)' }}>Direction de marque</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
            {config.directions!.map(d => (
              <ChoiceCard key={d.title} active={selDirection === d.title} onClick={() => setSelDirection(d.title)}>
                {d.emoji && <div style={{ fontSize: '28px', marginBottom: 'var(--space-2)' }}>{d.emoji}</div>}
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--color-light-text)', marginBottom: 'var(--space-1)' }}>{d.title}</div>
                {d.description && <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 0 }}>{d.description}</p>}
                {d.vibe && <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-brand)', fontWeight: 700, marginTop: 'var(--space-2)' }}>{d.vibe}</p>}
              </ChoiceCard>
            ))}
          </div>
        </section>
      )}

      {hasNames && (
        <section style={{ marginBottom: 'var(--space-10)' }}>
          <h2 style={{ ...labelStyle, fontSize: 'var(--text-xs)', marginBottom: 'var(--space-4)' }}>Suggestions de nom</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {config.names!.map(n => (
              <button key={n} onClick={() => setSelName(n)} style={{
                padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--radius-full)',
                border: `1px solid ${selName === n ? 'var(--color-brand)' : 'var(--color-light-border)'}`,
                background: selName === n ? 'var(--color-brand)' : 'var(--color-light-2)',
                color: selName === n ? 'white' : 'var(--color-light-text)',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer',
              }}>
                {n}
              </button>
            ))}
          </div>
        </section>
      )}

      {hasIcons && (
        <section style={{ marginBottom: 'var(--space-10)' }}>
          <h2 style={{ ...labelStyle, fontSize: 'var(--text-xs)', marginBottom: 'var(--space-4)' }}>Icônes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-4)' }}>
            {board.icons.filter(i => i.url).map(icon => (
              <ChoiceCard key={icon.name} active={selIcon === icon.name} onClick={() => setSelIcon(icon.name)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={icon.url!} alt={icon.name} style={{ width: '100%', height: '64px', objectFit: 'contain', marginBottom: 'var(--space-3)' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', textAlign: 'center' }}>{icon.name}</div>
              </ChoiceCard>
            ))}
          </div>
        </section>
      )}

      {hasTypos && (
        <section style={{ marginBottom: 'var(--space-10)' }}>
          <h2 style={{ ...labelStyle, fontSize: 'var(--text-xs)', marginBottom: 'var(--space-4)' }}>Typographie</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
            {config.typos!.map(t => (
              <ChoiceCard key={t.title} active={selTypo === t.title} onClick={() => setSelTypo(t.title)}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-light-text-3)', marginBottom: 'var(--space-3)' }}>{t.title}</div>
                <div style={{ fontSize: '2.5rem', fontFamily: t.titleFont || 'var(--font-display)', fontWeight: (t.titleWeight as React.CSSProperties['fontWeight']) || 700, marginBottom: 'var(--space-2)' }}>Aa</div>
                {t.titleFontName && <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 0 }}>{t.titleFontName}{t.bodyFontName ? ` + ${t.bodyFontName}` : ''}</p>}
              </ChoiceCard>
            ))}
          </div>
        </section>
      )}

      {hasPalettes && (
        <section style={{ marginBottom: 'var(--space-10)' }}>
          <h2 style={{ ...labelStyle, fontSize: 'var(--text-xs)', marginBottom: 'var(--space-4)' }}>Palette de couleurs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
            {config.palettes!.map(p => (
              <ChoiceCard key={p.title} active={selPalette === p.title} onClick={() => setSelPalette(p.title)}>
                <div style={{ display: 'flex', gap: 'var(--space-1)', height: '56px', marginBottom: 'var(--space-3)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  {p.colors.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-light-text)' }}>{p.title}</div>
              </ChoiceCard>
            ))}
          </div>
        </section>
      )}

      {hasLogos && (
        <section style={{ marginBottom: 'var(--space-10)' }}>
          <h2 style={{ ...labelStyle, fontSize: 'var(--text-xs)', marginBottom: 'var(--space-4)' }}>Formes de logo</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
            {board.logos.filter(l => l.url).map(logo => (
              <ChoiceCard key={logo.name} active={selLogo === logo.name} onClick={() => setSelLogo(logo.name)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo.url!} alt={logo.name} style={{ width: '100%', height: '80px', objectFit: 'contain', marginBottom: 'var(--space-3)', background: 'var(--color-light-1)', borderRadius: 'var(--radius-sm)' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', textAlign: 'center' }}>{logo.name}</div>
              </ChoiceCard>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginBottom: 'var(--space-10)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <span style={labelStyle}>Suggestion de nom (optionnel)</span>
          <input value={nomSuggestion} onChange={e => setNomSuggestion(e.target.value)} style={{
            border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
            background: 'var(--color-light-0)', color: 'var(--color-light-text)',
          }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <span style={labelStyle}>Commentaires (optionnel)</span>
          <textarea value={commentaires} onChange={e => setCommentaires(e.target.value)} rows={3} style={{
            border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
            background: 'var(--color-light-0)', color: 'var(--color-light-text)', resize: 'vertical',
          }} />
        </label>
      </section>

      <section style={{ textAlign: 'center' }}>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%', background: 'var(--color-brand)', color: 'white', border: 'none',
            borderRadius: 'var(--radius-full)', padding: 'var(--space-5) var(--space-6)',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg)',
            letterSpacing: '0.04em', textTransform: 'uppercase', cursor: submitting ? 'default' : 'pointer',
            opacity: submitting ? 0.7 : 1, marginBottom: 'var(--space-4)',
          }}
        >
          {submitting ? 'Envoi…' : 'Soumettre mes choix'}
        </button>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Vous pourrez modifier vos choix jusqu&apos;à la validation finale.
        </p>
      </section>

    </main>
  )
}
