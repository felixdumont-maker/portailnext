'use client'

import Link from 'next/link'

const TOOLS = [
  {
    id: 'social',
    icon: 'photo_camera',
    label: 'Social Kit',
    tag: 'Réseaux sociaux',
    desc: 'Crée des visuels pour Instagram, LinkedIn et TikTok — posts, stories, reels. 7 formats exportables en PNG.',
    href: '/outils/social',
    external: true,
    accent: 'var(--color-brand)',
  },
  {
    id: 'pdf',
    icon: 'description',
    label: 'Générateur de documents',
    tag: 'Documents',
    desc: 'Génère des documents professionnels — plan d\'affaires, programme pigiste. Mise en page automatique, export PDF.',
    href: '/outils/pdf',
    external: true,
    accent: 'var(--color-tools-blue)',
  },
  {
    id: 'mediatheque',
    icon: 'photo_library',
    label: 'Médiathèque',
    tag: 'Ressources',
    desc: 'Accède aux assets partagés — templates Canva, photos libres de droit, polices, logos Cocktail Média.',
    href: null, // set by basePath prop
    external: false,
    accent: 'var(--color-success-52)',
  },
]

interface Props {
  basePath: string
}

export default function ToolsHub({ basePath }: Props) {
  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'var(--text-2xl)',
          color: 'var(--color-light-text)',
          margin: '0 0 var(--space-2)',
        }}>
          Outils
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-light-text-2)',
          margin: 0,
        }}>
          Tous tes outils de création au même endroit.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 'var(--space-4)',
      }}>
        {TOOLS.map(tool => {
          const href = tool.id === 'mediatheque'
            ? `${basePath}/mediatheque`
            : tool.href!

          return (
            <div
              key={tool.id}
              style={{
                background: 'var(--color-light-2)',
                border: '1px solid var(--color-light-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                transition: 'box-shadow 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px var(--overlay-hover)'
                ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-light-border-2)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-light-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)',
                  background: `color-mix(in oklch, ${tool.accent} 12%, white)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 24, color: tool.accent }}>
                    {tool.icon}
                  </span>
                </div>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: tool.accent,
                  background: `color-mix(in oklch, ${tool.accent} 10%, white)`,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid color-mix(in oklch, ${tool.accent} 20%, transparent)`,
                }}>
                  {tool.tag}
                </span>
              </div>

              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-light-text)',
                  margin: '0 0 var(--space-2)',
                }}>
                  {tool.label}
                </h2>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-light-text-2)',
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {tool.desc}
                </p>
              </div>

              {tool.external ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 'var(--text-sm)',
                    color: 'white',
                    background: tool.accent,
                    padding: '10px var(--space-4)',
                    borderRadius: 'var(--radius-full)',
                    textDecoration: 'none',
                    alignSelf: 'flex-start',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Ouvrir
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span>
                </a>
              ) : (
                <Link
                  href={href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 'var(--text-sm)',
                    color: 'white',
                    background: tool.accent,
                    padding: '10px var(--space-4)',
                    borderRadius: 'var(--radius-full)',
                    textDecoration: 'none',
                    alignSelf: 'flex-start',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Parcourir
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
