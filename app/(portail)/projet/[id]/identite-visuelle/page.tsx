'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || ''

// ─── Types ────────────────────────────────────────────────

interface Logo        { public_url: string | null; preview_url: string | null; filename: string | null }
interface PaletteColor{ hex: string; label?: string }
interface Font        { nom_font: string; google_font_url: string | null; usage: string | null }
interface ImageAsset  { id: number; public_url: string | null; label: string | null; filename: string | null }

interface IdentiteData {
  id: number
  nom_projet: string
  contexte: string | null
  palette: PaletteColor[]
  logos: Record<string, Logo>
  fonts: Font[]
  declinaisons: ImageAsset[]
  mockups: ImageAsset[]
  zip_url: string
}

// ─── Helpers ──────────────────────────────────────────────

function nomCourt(nom: string) {
  const parts = nom.split(' — ')
  return parts.length >= 2 ? parts[1] : nom
}

// ─── Groupes de logos ─────────────────────────────────────

// Variantes standard : les clés connues et leur appartenance à un groupe
const NOIR_KEYS  = ['principal', 'icone', 'variante']
const BLANC_KEYS = ['principal_blanc', 'icone_blanc', 'variante_blanc']

const LABEL_MAP: Record<string, string> = {
  principal:        'Logo principal',
  icone:            'Icône',
  variante:         'Variante',
  principal_blanc:  'Logo principal',
  icone_blanc:      'Icône',
  variante_blanc:   'Variante',
}

function humanLabel(key: string): string {
  return LABEL_MAP[key] ?? key.replace(/_/g, ' ')
}

// ─── Loading skeleton ──────────────────────────────────────

function Shimmer({ w = '100%', h = '16px', r = '6px' }: { w?: string; h?: string; r?: string }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'var(--color-light-0)', flexShrink: 0,
    }} />
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 var(--space-6)', paddingTop: 'var(--space-8)' }}>
      <Shimmer w="80px" h="12px" />
      <div style={{ marginTop: 'var(--space-10)', marginBottom: 'var(--space-16)' }}>
        <Shimmer w="60%" h="44px" r="var(--radius-sm)" />
        <div style={{ marginTop: 'var(--space-3)' }}><Shimmer w="35%" h="16px" /></div>
      </div>
      <Shimmer h="100px" r="var(--radius-md)" />
      <div style={{ marginTop: 'var(--space-16)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
        <Shimmer h="200px" r="var(--radius-md)" />
        <Shimmer h="200px" r="var(--radius-md)" />
        <Shimmer h="200px" r="var(--radius-md)" />
      </div>
    </div>
  )
}

// ─── Logo card ─────────────────────────────────────────────

function LogoCard({ varKey, label, bg, dark, logo }: {
  varKey: string; label: string; bg: string; dark: boolean; logo: Logo | undefined
}) {
  const imgUrl = dark ? (logo?.preview_url ?? logo?.public_url) : logo?.public_url

  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-2)' }}>
      <div style={{
        aspectRatio: '4/3',
        background: bg,
        borderRadius: 'var(--radius-md)',
        border: dark ? 'none' : '1px solid var(--color-light-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
        overflow: 'hidden',
      }}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={label}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        ) : (
          <span
            aria-hidden="true"
            className="material-symbols-outlined"
            style={{
              fontSize: '28px',
              color: dark ? 'var(--color-dark-3)' : 'var(--color-light-border-2)',
            }}
          >
            image
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--space-1)' }}>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
          textTransform: 'uppercase' as const, letterSpacing: '0.10em',
          color: 'var(--color-light-text-3)',
        }}>
          {label}
        </span>
        {logo?.public_url && (
          <a
            href={logo.public_url}
            target="_blank"
            rel="noreferrer"
            download
            style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
              textTransform: 'uppercase' as const, letterSpacing: '0.06em',
              color: 'var(--color-brand)', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              minHeight: '44px', alignSelf: 'center',
              transition: 'opacity var(--duration-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px' }}>download</span>
            Télécharger
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Groupe de logos (noir ou blanc) ──────────────────────

function LogoGroup({ title, keys, dark, bg, logos, extras }: {
  title: string
  keys: string[]
  dark: boolean
  bg: string
  logos: Record<string, Logo>
  extras: Array<{ key: string; logo: Logo }>
}) {
  const allKeys = [...keys, ...extras.map(e => e.key)]
  const hasAny  = allKeys.some(k => logos[k]?.public_url || logos[k]?.preview_url)

  if (!hasAny && extras.length === 0) return null

  return (
    <div>
      {/* Sous-titre du groupe */}
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
        textTransform: 'uppercase' as const, letterSpacing: '0.12em',
        color: 'var(--color-light-text-3)',
        margin: '0 0 var(--space-4)',
      }}>
        {title}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 'var(--space-5)',
      }}>
        {keys.map(k => (
          <LogoCard
            key={k}
            varKey={k}
            label={humanLabel(k)}
            bg={bg}
            dark={dark}
            logo={logos[k]}
          />
        ))}
        {extras.map(({ key, logo }) => (
          <LogoCard
            key={key}
            varKey={key}
            label={humanLabel(key)}
            bg={bg}
            dark={dark}
            logo={logo}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Section divider ───────────────────────────────────────

function SectionHead({ num, title }: { num: string; title: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      gap: 'var(--space-4)', marginBottom: 'var(--space-8)',
    }}>
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
        color: 'var(--color-brand)', letterSpacing: '0.08em', flexShrink: 0,
      }}>
        {num}
      </span>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: 'var(--text-lg)', letterSpacing: '-0.01em',
        textTransform: 'uppercase' as const,
        color: 'var(--color-light-text)', margin: 0,
      }}>
        {title}
      </h2>
      <div style={{ flex: 1, height: '1px', background: 'var(--color-light-border)' }} />
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────

export default function IdentiteVisuelleClientPage() {
  const params = useParams()
  const router = useRouter()
  const id     = params.id

  const [data,    setData]    = useState<IdentiteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    fetch(`${API}/api/v1/projet/${id}/identite`, { credentials: 'include' })
      .then(r => {
        if (r.status === 401) { router.push('/'); return null }
        if (!r.ok) { setError(true); setLoading(false); return null }
        return r.json()
      })
      .then(d => { if (d) setData(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [id, router])

  // Inject Google Fonts for client fonts into document head
  useEffect(() => {
    if (!data?.fonts?.length) return
    data.fonts.forEach(font => {
      const safeId = `iv-font-${font.nom_font.replace(/\s+/g, '-').toLowerCase()}`
      if (document.getElementById(safeId)) return
      const link = document.createElement('link')
      link.id   = safeId
      link.rel  = 'stylesheet'
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.nom_font)}:ital,wght@0,400;0,700;1,400&display=swap`
      document.head.appendChild(link)
    })
  }, [data])

  if (loading) return <LoadingSkeleton />

  if (error || !data) return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-light-text-3)', marginBottom: 'var(--space-4)' }}>
        L'identité visuelle n'est pas encore disponible.
      </p>
      <button
        onClick={() => router.push(`/projet/${id}`)}
        style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-brand)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        ← Retour au projet
      </button>
    </div>
  )

  // ── Classer les logos ──────────────────────────────────
  const knownKeys = new Set([...NOIR_KEYS, ...BLANC_KEYS])
  const noirExtras  = Object.entries(data.logos)
    .filter(([k]) => !knownKeys.has(k) && k.startsWith('noir_'))
    .map(([key, logo]) => ({ key, logo }))
  const blancExtras = Object.entries(data.logos)
    .filter(([k]) => !knownKeys.has(k) && k.startsWith('blanc_'))
    .map(([key, logo]) => ({ key, logo }))
  const autresLogos = Object.entries(data.logos)
    .filter(([k]) => !knownKeys.has(k) && !k.startsWith('noir_') && !k.startsWith('blanc_'))
    .map(([key, logo]) => ({ key, logo }))

  const hasPalette      = data.palette.length > 0
  const hasLogos        = Object.keys(data.logos).length > 0
  const hasFonts        = data.fonts.length > 0
  const hasDeclinaisons = data.declinaisons.length > 0
  const hasMockups      = data.mockups.length > 0

  let n = 0
  const num = () => String(++n).padStart(2, '0')

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 var(--space-6)', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-24)' }}>

      {/* ── Breadcrumb ── */}
      <button
        onClick={() => router.push(`/projet/${id}`)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
          textTransform: 'uppercase' as const, letterSpacing: '0.1em',
          color: 'var(--color-light-text-3)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          marginBottom: 'var(--space-8)', minHeight: '44px',
          transition: 'color var(--duration-fast)',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-light-text)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-light-text-3)')}
      >
        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
        {nomCourt(data.nom_projet)}
      </button>

      {/* ── Page header ── */}
      <header style={{ marginBottom: 'var(--space-16)' }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
          textTransform: 'uppercase' as const, letterSpacing: '0.12em',
          color: 'var(--color-brand)', margin: '0 0 var(--space-3)',
        }}>
          Identité de marque
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'var(--text-3xl)',
          lineHeight: 1.0, letterSpacing: '-0.025em',
          textTransform: 'uppercase' as const,
          color: 'var(--color-light-text)',
          margin: '0 0 var(--space-4)', maxWidth: '20ch',
        }}>
          {nomCourt(data.nom_projet)}
        </h1>
        {data.contexte && (
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)',
            lineHeight: 'var(--leading-relaxed)', color: 'var(--color-light-text-2)',
            maxWidth: '58ch', margin: 0, fontStyle: 'italic',
          }}>
            {data.contexte}
          </p>
        )}
      </header>

      {/* ── 01 Palette ── */}
      {hasPalette && (
        <section style={{ marginBottom: 'var(--space-16)' }}>
          <SectionHead num={num()} title="Palette de couleurs" />

          <div style={{
            display: 'flex',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            height: '80px',
            marginBottom: 'var(--space-6)',
          }}>
            {data.palette.map((c, i) => (
              <div key={i} style={{ flex: 1, background: c.hex }} title={c.label || c.hex} />
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'var(--space-4)' }}>
            {data.palette.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: '120px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                  background: c.hex, flexShrink: 0,
                  border: '1px solid oklch(0% 0 0 / 0.10)',
                  boxShadow: '0 1px 4px oklch(0% 0 0 / 0.06)',
                }} />
                <div>
                  {c.label && (
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
                      color: 'var(--color-light-text-2)', display: 'block',
                      marginBottom: '2px', fontWeight: 500,
                    }}>
                      {c.label}
                    </span>
                  )}
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
                    color: 'var(--color-light-text)', display: 'block',
                    fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em',
                  }}>
                    {c.hex.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 02 Logos ── */}
      {hasLogos && (
        <section style={{ marginBottom: 'var(--space-16)' }}>
          <SectionHead num={num()} title="Logos" />

          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-10)' }}>

            {/* Groupe Noir */}
            <LogoGroup
              title="Version noire"
              keys={NOIR_KEYS}
              dark={false}
              bg="var(--color-light-0b)"
              logos={data.logos}
              extras={noirExtras}
            />

            {/* Groupe Blanc */}
            <LogoGroup
              title="Version blanche"
              keys={BLANC_KEYS}
              dark={true}
              bg="var(--color-dark-1)"
              logos={data.logos}
              extras={blancExtras}
            />

            {/* Autres logos (clés non reconnues) */}
            {autresLogos.length > 0 && (
              <div>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
                  textTransform: 'uppercase' as const, letterSpacing: '0.12em',
                  color: 'var(--color-light-text-3)', margin: '0 0 var(--space-4)',
                }}>
                  Autres variantes
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: 'var(--space-5)',
                }}>
                  {autresLogos.map(({ key, logo }) => (
                    <LogoCard
                      key={key}
                      varKey={key}
                      label={humanLabel(key)}
                      bg="var(--color-light-0b)"
                      dark={false}
                      logo={logo}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 03 Typographie ── */}
      {hasFonts && (
        <section style={{ marginBottom: 'var(--space-16)' }}>
          <SectionHead num={num()} title="Typographie" />
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-12)' }}>
            {data.fonts.map((font, i) => (
              <div
                key={i}
                style={{
                  paddingBottom: i < data.fonts.length - 1 ? 'var(--space-12)' : 0,
                  borderBottom: i < data.fonts.length - 1 ? '1px solid var(--color-light-border)' : 'none',
                }}
              >
                {font.usage && (
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
                    textTransform: 'uppercase' as const, letterSpacing: '0.12em',
                    color: 'var(--color-light-text-3)', display: 'block',
                    marginBottom: 'var(--space-4)',
                  }}>
                    {font.usage}
                  </span>
                )}

                <p style={{
                  fontFamily: `'${font.nom_font}', serif`,
                  fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                  lineHeight: 1.05,
                  color: 'var(--color-light-text)',
                  margin: '0 0 var(--space-4)',
                  letterSpacing: '-0.02em',
                }}>
                  {font.nom_font}
                </p>

                <p style={{
                  fontFamily: `'${font.nom_font}', serif`,
                  fontSize: 'var(--text-lg)',
                  lineHeight: 'var(--leading-relaxed)',
                  color: 'var(--color-light-text-2)',
                  margin: '0 0 var(--space-4)',
                  maxWidth: '50ch',
                }}>
                  À chaque projet, une identité unique.
                </p>

                <p style={{
                  fontFamily: `'${font.nom_font}', serif`,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-light-text-3)',
                  margin: '0 0 var(--space-4)',
                  letterSpacing: '0.05em',
                  lineHeight: 'var(--leading-relaxed)',
                }}>
                  A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
                  &nbsp; a b c d e f g h i j k l m n o p q r s t u v w x y z
                  &nbsp; 0 1 2 3 4 5 6 7 8 9
                </p>

                {font.google_font_url && (
                  <a
                    href={font.google_font_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
                      textTransform: 'uppercase' as const, letterSpacing: '0.08em',
                      color: 'var(--color-light-text-3)', textDecoration: 'none',
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      transition: 'color var(--duration-fast)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-brand)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-light-text-3)')}
                  >
                    Voir sur Google Fonts
                    <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '12px' }}>open_in_new</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 04 Déclinaisons ── */}
      {hasDeclinaisons && (
        <section style={{ marginBottom: 'var(--space-16)' }}>
          <SectionHead num={num()} title="Déclinaisons couleur" />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-5)',
          }}>
            {data.declinaisons.map(d => (
              <div key={d.id}>
                <div style={{
                  borderRadius: 'var(--radius-md)', overflow: 'hidden',
                  background: 'var(--color-light-0)',
                  border: '1px solid var(--color-light-border)',
                  aspectRatio: '4/3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {d.public_url ? (
                    <img
                      src={d.public_url}
                      alt={d.label || ''}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 'var(--space-6)' }}
                    />
                  ) : (
                    <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--color-light-border-2)' }}>image</span>
                  )}
                </div>
                {d.label && (
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
                    textTransform: 'uppercase' as const, letterSpacing: '0.10em',
                    color: 'var(--color-light-text-3)', margin: 'var(--space-2) 0 0',
                  }}>
                    {d.label}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 05 Mockups ── */}
      {hasMockups && (
        <section style={{ marginBottom: 'var(--space-16)' }}>
          <SectionHead num={num()} title="Mockups" />
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-5)' }}>
            {data.mockups.map(m => (
              <div
                key={m.id}
                style={{
                  borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                  background: 'var(--color-light-0)',
                  border: '1px solid var(--color-light-border)',
                }}
              >
                {m.public_url ? (
                  <img src={m.public_url} alt={m.label || ''} style={{ width: '100%', display: 'block' }} />
                ) : (
                  <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--color-light-border-2)' }}>image</span>
                  </div>
                )}
                {m.label && (
                  <div style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
                      textTransform: 'uppercase' as const, letterSpacing: '0.10em',
                      color: 'var(--color-light-text-3)',
                    }}>
                      {m.label}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Téléchargement ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap' as const, gap: 'var(--space-4)',
        padding: 'var(--space-6) var(--space-8)',
        background: 'var(--color-light-2)',
        border: '1px solid var(--color-light-border)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <div>
          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 'var(--text-base)', letterSpacing: '-0.01em',
            color: 'var(--color-light-text)', margin: '0 0 var(--space-1)',
          }}>
            Télécharger tous les fichiers
          </p>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
            color: 'var(--color-light-text-3)', margin: 0,
          }}>
            Logo, icône, variante et assets complets en un seul ZIP.
          </p>
        </div>
        <a
          href={`${API}${data.zip_url}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-6)',
            background: 'var(--color-brand)', color: 'white',
            borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 700,
            textTransform: 'uppercase' as const, letterSpacing: '0.06em',
            textDecoration: 'none', minHeight: '48px', flexShrink: 0,
            transition: 'background var(--duration-fast)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-brand-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-brand)')}
        >
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
          Télécharger le ZIP
        </a>
      </div>

    </div>
  )
}
