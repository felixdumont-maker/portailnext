'use client'

import { useState, useEffect } from 'react'

const RESSOURCE_ID = 2

const BRAND = '#e83b14'
const NOIR  = '#2b2b2b'
const BG    = '#faf7f3'
const BEIGE = '#fff4e9'
const BORD  = '#e7e0d8'

const FONT_TITLE = "'Bebas Neue', Impact, sans-serif"
const FONT_BODY  = "'Montserrat', sans-serif"

interface CaptureEcran {
  id: number
  legende: string | null
  section_id: string | null
  url: string
}

interface Section {
  id: number
  titre: string
  intro: string | null
  etapes: { titre: string; texte: string; image_url?: string | null }[]
  astuce: string | null
}

function numero(index: number): string {
  return String(index + 1).padStart(2, '0')
}

function StepCard({ index, etape }: { index: number; etape: { titre: string; texte: string; image_url?: string | null } }) {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: BEIGE, color: BRAND,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT_TITLE, fontSize: '14px', flexShrink: 0, marginTop: '2px',
      }}>
        {index + 1}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: '14px', color: NOIR, margin: '0 0 4px' }}>
          {etape.titre}
        </p>
        <p style={{ fontFamily: FONT_BODY, fontSize: '13.5px', lineHeight: 1.75, color: '#5a554f', margin: 0 }}>
          {etape.texte}
        </p>
        {etape.image_url && (
          <a href={etape.image_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '12px' }}>
            <img
              src={etape.image_url} alt=""
              style={{ maxWidth: '420px', width: '100%', borderRadius: '10px', border: `1px solid ${BORD}`, display: 'block' }}
            />
          </a>
        )}
      </div>
    </div>
  )
}

function CaptureGrid({ captures, onSelect }: { captures: CaptureEcran[]; onSelect: (c: CaptureEcran) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
      {captures.map(c => (
        <button
          key={c.id}
          onClick={() => onSelect(c)}
          style={{ border: 'none', background: 'none', padding: 0, cursor: 'zoom-in', textAlign: 'left' as const }}
        >
          <img
            src={c.url} alt={c.legende || ''}
            style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', borderRadius: '10px', border: `1px solid ${BORD}`, display: 'block' }}
          />
          {c.legende && (
            <p style={{ fontFamily: FONT_BODY, fontSize: '11.5px', color: '#5a554f', marginTop: '6px' }}>
              {c.legende}
            </p>
          )}
        </button>
      ))}
    </div>
  )
}

function SectionBlock({ section, index, open, onToggle, captures, onSelectCapture }: {
  section: Section
  index: number
  open: boolean
  onToggle: () => void
  captures: CaptureEcran[]
  onSelectCapture: (c: CaptureEcran) => void
}) {
  return (
    <div id={`section-${section.id}`} style={{
      background: '#fff', border: `1px solid ${BORD}`, borderRadius: '16px',
      overflow: 'hidden', scrollMarginTop: '90px',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '16px',
          padding: '22px 24px', background: 'transparent', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontFamily: FONT_TITLE, fontSize: '20px', letterSpacing: '1px', color: BRAND, flexShrink: 0 }}>
          {numero(index)}
        </span>
        <span style={{
          flex: 1, fontFamily: FONT_TITLE, fontSize: '18px', letterSpacing: '0.5px',
          textTransform: 'uppercase' as const, color: NOIR,
        }}>
          {section.titre}
        </span>
        <span className="material-symbols-outlined" style={{ color: '#888', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          expand_more
        </span>
      </button>

      {open && (
        <div style={{ padding: '0 24px 28px', borderTop: `1px solid ${BORD}` }}>
          {section.intro && (
            <p style={{ fontFamily: FONT_BODY, fontSize: '14px', lineHeight: 1.75, color: '#5a554f', margin: '20px 0 24px' }}>
              {section.intro}
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>
            {section.etapes.map((e, i) => <StepCard key={i} index={i} etape={e} />)}
          </div>
          {captures.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <p style={{
                fontFamily: FONT_BODY, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase' as const, color: '#888', margin: '0 0 12px',
              }}>
                Captures d&apos;écran
              </p>
              <CaptureGrid captures={captures} onSelect={onSelectCapture} />
            </div>
          )}
          {section.astuce && (
            <div style={{
              marginTop: '24px', background: BEIGE, borderRadius: '12px',
              padding: '16px 20px', display: 'flex', gap: '12px', alignItems: 'flex-start',
            }}>
              <span className="material-symbols-outlined" style={{ color: BRAND, fontSize: '20px', flexShrink: 0 }}>lightbulb</span>
              <p style={{ fontFamily: FONT_BODY, fontSize: '13px', lineHeight: 1.7, color: NOIR, margin: 0 }}>
                <strong>Astuce&nbsp;:</strong> {section.astuce}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Lightbox({ capture, onClose }: { capture: CaptureEcran; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(43,43,43,0.85)', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        cursor: 'zoom-out',
      }}
    >
      <div style={{ maxWidth: '900px', width: '100%' }}>
        <img src={capture.url} alt={capture.legende || ''} style={{ width: '100%', borderRadius: '12px', display: 'block' }} />
        {capture.legende && (
          <p style={{ fontFamily: FONT_BODY, fontSize: '13px', color: '#fff', textAlign: 'center' as const, marginTop: '14px' }}>
            {capture.legende}
          </p>
        )}
      </div>
    </div>
  )
}

export default function GuideSeoDeBasePage() {
  const [sections, setSections] = useState<Section[]>([])
  const [loadingSections, setLoadingSections] = useState(true)
  const [openId, setOpenId] = useState<number | null>(null)
  const [captures, setCaptures] = useState<CaptureEcran[]>([])
  const [lightbox, setLightbox] = useState<CaptureEcran | null>(null)

  useEffect(() => {
    fetch(`/api/v1/ressources/${RESSOURCE_ID}/sections`)
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : []
        setSections(list)
        if (list.length > 0) setOpenId(list[0].id)
      })
      .catch(() => {})
      .finally(() => setLoadingSections(false))

    fetch(`/api/v1/ressources/${RESSOURCE_ID}/images`)
      .then(r => r.json())
      .then(d => setCaptures(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  const sectionIds = new Set(sections.map(s => String(s.id)))
  const capturesParSection = (id: number) => captures.filter(c => c.section_id === String(id))
  const capturesNonClassees = captures.filter(c => !c.section_id || !sectionIds.has(c.section_id))

  return (
    <div style={{ background: BG, minHeight: '100vh' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '64px 24px 100px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <span style={{
            fontFamily: FONT_TITLE, fontSize: '15px', letterSpacing: '4px', color: BRAND,
            textTransform: 'uppercase' as const,
          }}>
            Cocktail Média — Guide client
          </span>
          <h1 style={{
            fontFamily: FONT_TITLE, fontSize: '38px', letterSpacing: '1px',
            textTransform: 'uppercase' as const, color: NOIR, margin: '12px 0 16px', lineHeight: 1.05,
          }}>
            SEO de base — Améliorer votre visibilité en ligne
          </h1>
          <p style={{ fontFamily: FONT_BODY, fontSize: '15px', lineHeight: 1.8, color: '#5a554f', margin: 0, maxWidth: '600px' }}>
            Les techniques essentielles pour apparaître dans Google sans payer de publicité :
            Google Business Profile, répertoires locaux, contenu et outils de suivi.
            Cliquez sur une section pour la déplier.
          </p>
        </div>

        {loadingSections && (
          <p style={{ fontFamily: FONT_BODY, fontSize: '13px', color: '#a8a29c' }}>Chargement du guide…</p>
        )}

        {!loadingSections && sections.length === 0 && (
          <p style={{ fontFamily: FONT_BODY, fontSize: '13px', color: '#a8a29c' }}>
            Ce guide ne contient pas encore de sections.
          </p>
        )}

        {/* Table des matières */}
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px', marginBottom: '32px' }}>
          {sections.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setOpenId(s.id)}
              style={{
                fontFamily: FONT_BODY, fontSize: '12px', fontWeight: 700,
                letterSpacing: '0.04em', textTransform: 'uppercase' as const,
                color: openId === s.id ? '#fff' : NOIR,
                background: openId === s.id ? BRAND : '#fff',
                border: `1px solid ${openId === s.id ? BRAND : BORD}`,
                borderRadius: '999px', padding: '9px 18px', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {numero(i)} · {s.titre}
            </button>
          ))}
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '14px' }}>
          {sections.map((s, i) => (
            <SectionBlock
              key={s.id}
              section={s}
              index={i}
              open={openId === s.id}
              onToggle={() => setOpenId(openId === s.id ? null : s.id)}
              captures={capturesParSection(s.id)}
              onSelectCapture={setLightbox}
            />
          ))}
        </div>

        {/* Captures non classées */}
        {capturesNonClassees.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{
              fontFamily: FONT_TITLE, fontSize: '20px', letterSpacing: '1px',
              textTransform: 'uppercase' as const, color: NOIR, margin: '0 0 16px',
            }}>
              Autres captures d&apos;écran
            </h2>
            <CaptureGrid captures={capturesNonClassees} onSelect={setLightbox} />
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '48px', textAlign: 'center' as const }}>
          <p style={{ fontFamily: FONT_BODY, fontSize: '12px', color: '#a8a29c', letterSpacing: '0.04em' }}>
            Un guide de Cocktail Média — votre partenaire numérique
          </p>
        </div>

      </div>

      {lightbox && <Lightbox capture={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  )
}
