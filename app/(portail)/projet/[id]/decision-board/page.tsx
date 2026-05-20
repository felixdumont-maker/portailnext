'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const DIRECTIONS = [
  { id: 'luxe', label: 'LUXE PREMIUM', bg: '#1a1a1a' },
  { id: 'moderne', label: 'MODERNE ÉPURÉ', bg: '#e8e4de' },
  { id: 'the', label: 'THÉ ÉLÉGANT', bg: '#2d2420' },
  { id: 'audace', label: 'AUDACE BOLD', bg: '#1c2b3a' },
]

const TYPOS = [
  { id: 'serif', label: 'SERIF SOPHISTIQUÉ', preview: 'Aa', style: { fontFamily: 'Georgia, serif', fontStyle: 'italic' }, desc: "L'élégance intemporelle pour une marque qui valorise l'héritage." },
  { id: 'sans', label: 'SANS-SERIF MODERNE', preview: 'Aa', style: { fontFamily: 'var(--font-display)', fontWeight: '700' }, desc: 'La clarté et la modernité pour une vision tournée vers le futur.' },
]

const PALETTES = [
  { id: 'feu', label: 'CONTRASTE NOIR & FEU', colors: ['var(--color-dark-1)', 'var(--color-brand-hover)', '#e6beb5', 'var(--color-light-1)'] },
  { id: 'sable', label: 'SABLE & MINÉRAUX', colors: ['#4a4643', 'var(--color-dark-text-2)', 'var(--color-light-border)', 'var(--color-light-1)'] },
]

export default function DecisionBoardClientPage() {
  const params = useParams()
  const id = params.id

  const [selectedDir, setSelectedDir] = useState('luxe')
  const [selectedTypo, setSelectedTypo] = useState('serif')
  const [selectedPalette, setSelectedPalette] = useState('feu')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    // TODO: brancher POST /api/v1/projet/${id}/decision-board
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="max-w-2xl mx-auto text-center py-24">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <span aria-hidden="true" className="material-symbols-outlined text-green-600 text-4xl"
          style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </div>
      <h2 className="font-display text-4xl text-[var(--color-dark-1)] mb-4">CHOIX SOUMIS !</h2>
      <p className="text-[var(--color-dark-text-2)] font-body mb-8">Notre équipe a reçu vos préférences et reviendra vers vous prochainement.</p>
      <Link href={`/projet/${id}`}
        className="bg-[var(--color-brand)] text-white font-display text-xl px-8 py-4 rounded-full hover:bg-[var(--color-brand-hover)] transition-all">
        RETOUR AU PROJET
      </Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto pb-32">

      {/* Back */}
      <Link href={`/projet/${id}`}
        className="inline-flex items-center gap-2 text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-1)] transition-colors mb-8 font-body text-sm">
        <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_back</span>
        RETOUR AU PROJET
      </Link>

      {/* Header */}
      <header className="mb-12">
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-3xl)',
          lineHeight: 1.0, letterSpacing: '-0.025em', textTransform: 'uppercase',
          color: 'var(--color-light-text)', margin: '0 0 var(--space-2)',
        }}>
          DECISION BOARD
        </h1>
        <p className="text-[var(--color-dark-text-2)] font-body font-medium tracking-wide uppercase text-sm">
          Rebranding : Hotel Lumina
        </p>
      </header>

      {/* Intro */}
      <section className="bg-white rounded-3xl p-8 mb-16 shadow-sm">
        <p className="text-[var(--color-dark-text-2)] font-body text-lg leading-relaxed max-w-2xl">
          Sélectionnez vos préférences pour chaque section. Vos choix guideront notre équipe dans la création de votre identité visuelle.
        </p>
      </section>

      {/* Section 01 — Direction */}
      <section className="mb-20">
        <h2 className="font-display text-2xl text-[var(--color-dark-text-2)] mb-8 tracking-widest">
          01. DIRECTION DE MARQUE
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DIRECTIONS.map(d => {
            const active = selectedDir === d.id
            return (
              <div key={d.id}
                onClick={() => setSelectedDir(d.id)}
                className={`relative bg-white rounded-2xl border-2 overflow-hidden p-3 cursor-pointer transition-all duration-300 ${
                  active ? 'border-[var(--color-brand)]' : 'border-[var(--color-light-border)] hover:border-[var(--color-light-border-2)]'
                }`}>
                <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 relative flex items-center justify-center"
                  style={{ backgroundColor: d.bg }}>
                  {active && (
                    <div className="absolute top-4 right-4 bg-[var(--color-brand)] text-white w-8 h-8 rounded-full flex items-center justify-center">
                      <span aria-hidden="true" className="material-symbols-outlined text-xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                  )}
                </div>
                <p className={`font-display text-xl text-center uppercase tracking-wide py-2 ${active ? 'text-[var(--color-dark-1)]' : 'text-[var(--color-dark-text-2)]'}`}>
                  {d.label}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Section 02 — Typographie */}
      <section className="mb-20">
        <h2 className="font-display text-2xl text-[var(--color-dark-text-2)] mb-8 tracking-widest">
          02. TYPOGRAPHIE
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TYPOS.map(t => {
            const active = selectedTypo === t.id
            return (
              <div key={t.id}
                onClick={() => setSelectedTypo(t.id)}
                className={`bg-white rounded-2xl border-2 p-8 cursor-pointer relative transition-all ${
                  active ? 'border-[var(--color-brand)]' : 'border-[var(--color-light-border)] hover:border-[var(--color-light-border-2)]'
                }`}>
                {active && (
                  <div className="absolute top-4 right-4 text-[var(--color-brand)]">
                    <span aria-hidden="true" className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                )}
                <span className="text-xs font-bold tracking-widest text-[var(--color-dark-text-2)] uppercase mb-6 block font-body">
                  {t.label}
                </span>
                <div className="text-6xl mb-4" style={t.style}>{t.preview}</div>
                <p className="text-sm leading-relaxed text-[var(--color-dark-text-2)] font-body">{t.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Section 03 — Palette */}
      <section className="mb-20">
        <h2 className="font-display text-2xl text-[var(--color-dark-text-2)] mb-8 tracking-widest">
          03. PALETTE DE COULEURS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PALETTES.map(p => {
            const active = selectedPalette === p.id
            return (
              <div key={p.id}
                onClick={() => setSelectedPalette(p.id)}
                className={`bg-white rounded-2xl border-2 p-6 cursor-pointer relative transition-all ${
                  active ? 'border-[var(--color-brand)]' : 'border-[var(--color-light-border)] hover:border-[var(--color-light-border-2)]'
                }`}>
                {active && (
                  <div className="absolute top-4 right-4 text-[var(--color-brand)]">
                    <span aria-hidden="true" className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                )}
                <div className="flex gap-2 mb-6 h-24">
                  {p.colors.map((c, i) => (
                    <div key={i} className="flex-1 rounded-xl"
                      style={{ backgroundColor: c, border: c === 'var(--color-light-1)' ? '1px solid var(--color-light-border-2)' : 'none' }} />
                  ))}
                </div>
                <p className={`font-display text-lg uppercase tracking-wider ${active ? 'text-[var(--color-dark-1)]' : 'text-[var(--color-dark-text-2)]'}`}>
                  {p.label}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Submit */}
      <section className="text-center">
        <button
          onClick={handleSubmit}
          className="w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-display text-2xl py-6 rounded-full transition-all mb-6 tracking-widest"
        >
          SOUMETTRE MES CHOIX
        </button>
        <p className="text-xs text-[var(--color-dark-text-2)] uppercase tracking-widest font-body">
          Vous pourrez modifier vos choix jusqu&apos;à la validation finale.
        </p>
      </section>

    </div>
  )
}
