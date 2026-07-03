'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Exercice, Plan } from '../types'
import { exerciceKey, normJour } from '../utils'

const LottiePlayer = dynamic(() => import('./LottiePlayer'), { ssr: false })

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

interface Props {
  plan: Plan
  checkedToday: Set<string>     // clés cochées pour aujourd'hui
  streak: number
  weekday: string               // "lundi"…
  onToggle: (key: string, done: boolean) => void
  busy: Set<string>             // clés en cours d'envoi
}

const CARD: React.CSSProperties = {
  background: 'var(--color-light-2)',
  border: '1px solid var(--color-light-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-6)',
}

export default function PlanView({ plan, checkedToday, streak, weekday, onToggle, busy }: Props) {
  const jours = plan.contenu?.jours ?? []

  // Index du jour courant dans le plan (match sur le nom de jour, insensible casse/accents).
  const todayIndex = useMemo(() => {
    return jours.findIndex(j => normJour(j.jour) === normJour(weekday))
  }, [jours, weekday])

  // Jour affiché : sélection manuelle, sinon aujourd'hui, sinon la 1re séance non-repos.
  const defaultIndex = todayIndex >= 0
    ? todayIndex
    : Math.max(0, jours.findIndex(j => !j.repos && (j.exercices?.length ?? 0) > 0))
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const sel = selectedIndex ?? defaultIndex
  const selJour = jours[sel] ?? null
  const selIsToday = sel === todayIndex
  const isRest = !selJour || selJour.repos || (selJour.exercices?.length ?? 0) === 0
  const interactive = selIsToday   // on ne coche que le jour même (suivi par date réelle)

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 var(--space-4)' }}>
      {/* ── En-tête ── */}
      <header style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(1.75rem, 5vw, 2.4rem)', color: 'var(--color-light-text)',
          margin: '0 0 var(--space-3)', lineHeight: 1.15,
        }}>
          {plan.titre || 'Mon entraînement'}
        </h1>

        {plan.note && (
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '1.15rem', lineHeight: 1.6,
            color: 'var(--color-light-text-2)', margin: '0 auto', maxWidth: '52ch',
          }}>
            {plan.note}
          </p>
        )}

        {/* Série / encouragement */}
        <div className="no-print" style={{
          display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
          marginTop: 'var(--space-5)', padding: 'var(--space-2) var(--space-5)',
          background: streak > 0 ? 'var(--color-success-bg)' : 'var(--color-light-1)',
          color: streak > 0 ? 'var(--color-success-text)' : 'var(--color-light-text-3)',
          borderRadius: 'var(--radius-full)',
          fontFamily: 'var(--font-body)', fontSize: '1.05rem', fontWeight: 600,
        }}>
          <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>{streak > 0 ? '🔥' : '🌱'}</span>
          {streak > 0
            ? `${streak} jour${streak > 1 ? 's' : ''} d'affilée — continue comme ça !`
            : 'Coche ton premier exercice quand tu es prête'}
        </div>
      </header>

      {/* ── Principe directeur ── */}
      {plan.contenu?.principe && (
        <div style={{
          background: 'var(--color-info-bg, var(--color-light-1))',
          border: '1px solid var(--color-light-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-5)',
          marginBottom: 'var(--space-6)',
        }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', fontSize: '0.78rem', color: 'var(--color-info-text, var(--color-light-text-3))',
            margin: '0 0 var(--space-2)',
          }}>
            Le principe à garder en tête
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--color-light-text)', margin: 0 }}>
            {plan.contenu.principe}
          </p>
        </div>
      )}

      {/* ── Sélecteur de jour ── */}
      {jours.length > 1 && (
        <div className="no-print" role="tablist" aria-label="Choisir un jour"
          style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', WebkitOverflowScrolling: 'touch',
                   paddingBottom: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
          {jours.map((j, idx) => {
            const active = idx === sel
            const isTod = idx === todayIndex
            return (
              <button key={idx} role="tab" aria-selected={active} onClick={() => setSelectedIndex(idx)}
                style={{
                  flex: '0 0 auto', cursor: 'pointer', minHeight: '42px',
                  padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap',
                  background: active ? 'var(--color-brand)' : 'var(--color-light-2)',
                  color: active ? 'white' : 'var(--color-light-text-2)',
                  border: `1px solid ${active ? 'var(--color-brand)' : 'var(--color-light-border)'}`,
                }}>
                {j.jour}{isTod ? ' •' : ''}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Jour affiché (mis en avant) ── */}
      <section
        aria-label={selJour ? selJour.jour : 'Jour'}
        style={{
          ...CARD,
          borderColor: 'var(--color-brand)',
          borderWidth: '2px',
          boxShadow: 'var(--shadow-md)',
          marginBottom: 'var(--space-8)',
        }}
      >
        <p style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--color-brand)',
          margin: '0 0 var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        }}>
          {selIsToday ? `Aujourd'hui · ${cap(selJour?.jour ?? '')}` : cap(selJour?.jour ?? '')}
          {!selIsToday && (
            <span style={{
              fontSize: '0.7rem', letterSpacing: '0.04em', color: 'var(--color-light-text-3)',
              background: 'var(--color-light-1)', borderRadius: 'var(--radius-full)',
              padding: '2px var(--space-3)',
            }}>Aperçu</span>
          )}
        </p>

        {isRest ? (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.25rem', color: 'var(--color-light-text-2)', margin: 0, lineHeight: 1.6 }}>
            🌿 Journée de repos. Repose-toi bien — le repos fait partie du programme.
          </p>
        ) : (
          <>
            {selJour!.focus && (
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--color-light-text)', margin: '0 0 var(--space-3)' }}>
                {selJour!.focus}
              </h2>
            )}
            {selJour!.intro && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--color-light-text-2)', margin: '0 0 var(--space-4)' }}>
                {selJour!.intro}
              </p>
            )}
            {!interactive && (
              <p className="no-print" style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-4)' }}>
                Aperçu de la séance — les cases se cochent le jour même.
              </p>
            )}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {selJour!.exercices.map((exo, i) => {
                const key = exerciceKey(sel, i)
                const done = interactive && checkedToday.has(key)
                const isBusy = busy.has(key)
                if (!interactive) {
                  return (
                    <li key={i}>
                      <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)',
                        padding: 'var(--space-4)', background: 'var(--color-light-1)',
                        border: '2px solid var(--color-light-border)', borderRadius: 'var(--radius-md)',
                      }}>
                        <ExerciceContent exo={exo} done={false} />
                      </div>
                    </li>
                  )
                }
                return (
                  <li key={key}>
                    <button
                      onClick={() => onToggle(key, !done)}
                      disabled={isBusy}
                      aria-pressed={done}
                      style={{
                        width: '100%', textAlign: 'left', cursor: isBusy ? 'wait' : 'pointer',
                        display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)',
                        padding: 'var(--space-4)',
                        background: done ? 'var(--color-success-bg)' : 'var(--color-light-1)',
                        border: `2px solid ${done ? 'var(--color-success)' : 'var(--color-light-border)'}`,
                        borderRadius: 'var(--radius-md)',
                        transition: 'background var(--duration-base), border-color var(--duration-base)',
                        opacity: isBusy ? 0.6 : 1,
                      }}
                    >
                      <span aria-hidden="true" style={{
                        flexShrink: 0, width: '30px', height: '30px', borderRadius: '50%',
                        border: `2px solid ${done ? 'var(--color-success)' : 'var(--color-light-border-2)'}`,
                        background: done ? 'var(--color-success)' : 'transparent',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem', fontWeight: 800, marginTop: '2px',
                      }}>
                        {done ? '✓' : ''}
                      </span>
                      <ExerciceContent exo={exo} done={done} />
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>

      {/* ── Le reste de la semaine (référence) ── */}
      {jours.length > 1 && (
        <section aria-label="Toute la semaine">
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--color-light-text-3)',
            margin: '0 0 var(--space-4)', textAlign: 'center',
          }}>
            Ta semaine
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {jours.map((j, idx) => {
              const isToday = idx === todayIndex
              const isSel = idx === sel
              const rest = j.repos || (j.exercices?.length ?? 0) === 0
              const selectDay = () => { setSelectedIndex(idx); if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }) }
              return (
                <div key={idx}
                  role="button" tabIndex={0}
                  onClick={selectDay}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectDay() } }}
                  style={{
                  ...CARD,
                  padding: 'var(--space-4) var(--space-5)',
                  cursor: 'pointer',
                  opacity: isToday || isSel ? 1 : 0.92,
                  background: isSel ? 'var(--color-brand-8pct)' : (isToday ? 'var(--color-brand-6pct)' : 'var(--color-surface-warm, var(--color-light-2))'),
                  borderColor: isSel ? 'var(--color-brand)' : (isToday ? 'var(--color-brand-20pct)' : 'var(--color-light-border)'),
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-light-text)' }}>
                      {j.jour}{isToday && <span style={{ color: 'var(--color-brand)', fontSize: '0.8rem', marginLeft: 'var(--space-2)' }}>· aujourd&apos;hui</span>}
                    </span>
                    {j.focus && <span style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', color: 'var(--color-light-text-2)', fontWeight: 600 }}>{j.focus}</span>}
                  </div>
                  {rest ? (
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', color: 'var(--color-light-text-3)', margin: 'var(--space-2) 0 0' }}>Repos 🌿</p>
                  ) : (
                    <ul style={{ margin: 'var(--space-2) 0 0', paddingLeft: '1.2em', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {j.exercices.map((exo, i) => (
                        <li key={i} style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', lineHeight: 1.5, color: 'var(--color-light-text-2)' }}>
                          {exo.nom}{(exo.duree || exo.series) ? ` — ${[exo.duree, exo.series].filter(Boolean).join(' · ')}` : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Sécurité (important) ── */}
      {(plan.contenu?.securite?.length ?? 0) > 0 && (
        <section aria-label="À surveiller" style={{ marginTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {plan.contenu!.securite!.map((bloc, i) => (
            <div key={i} style={{
              background: 'var(--color-warning-bg, var(--color-light-1))',
              border: '1px solid var(--color-warning-mid, var(--color-light-border))',
              borderLeft: '4px solid var(--color-warning-mid, var(--color-brand))',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-5)',
            }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-warning-text, var(--color-light-text))', margin: '0 0 var(--space-2)' }}>
                {bloc.titre}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--color-light-text-2)', margin: 0 }}>
                {bloc.texte}
              </p>
            </div>
          ))}
        </section>
      )}

      {plan.contenu?.avertissement && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.95rem', lineHeight: 1.5,
          color: 'var(--color-light-text-3)', textAlign: 'center',
          margin: 'var(--space-6) auto 0', maxWidth: '46ch',
        }}>
          {plan.contenu.avertissement}
        </p>
      )}
    </div>
  )
}

/** Contenu d'un exercice (animation + nom + détails), partagé entre la case cochable et l'aperçu. */
function ExerciceContent({ exo, done }: { exo: Exercice; done: boolean }) {
  return (
    <span style={{ flex: 1 }}>
      {exo.lottie ? (
        <span style={{
          display: 'block', width: '100%', aspectRatio: '3 / 2',
          borderRadius: 'var(--radius-md)', overflow: 'hidden',
          background: 'var(--color-light-0)', border: '1px solid var(--color-light-border)',
          marginBottom: 'var(--space-3)',
        }}>
          <LottiePlayer src={exo.lottie} alt={exo.nom} />
        </span>
      ) : (exo.images && exo.images.length >= 2 && (
        <ExerciceAnim images={exo.images} alt={exo.nom} />
      ))}
      <span style={{
        display: 'block', fontFamily: 'var(--font-body)', fontWeight: 700,
        fontSize: '1.2rem', lineHeight: 1.35, color: 'var(--color-light-text)',
        textDecoration: done ? 'line-through' : 'none',
      }}>
        {exo.nom}
      </span>
      {(exo.duree || exo.series) && (
        <span style={{ display: 'block', marginTop: '2px', fontFamily: 'var(--font-body)', fontSize: '1.05rem', color: 'var(--color-brand-text-muted, var(--color-light-text-2))', fontWeight: 600 }}>
          {[exo.duree, exo.series].filter(Boolean).join(' · ')}
        </span>
      )}
      {exo.consigne && (
        <span style={{ display: 'block', marginTop: 'var(--space-1)', fontFamily: 'var(--font-body)', fontSize: '1.05rem', lineHeight: 1.55, color: 'var(--color-light-text-2)' }}>
          {exo.consigne}
        </span>
      )}
      {exo.video && (
        <a href={exo.video} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()} className="no-print"
          style={{ display: 'inline-block', marginTop: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-brand)' }}>
          ▶ Voir la démonstration
        </a>
      )}
    </span>
  )
}

/** Animation du mouvement : cross-fade en boucle entre la position de départ et d'arrivée. */
function ExerciceAnim({ images, alt }: { images: string[]; alt: string }) {
  return (
    <span style={{
      position: 'relative', display: 'block', width: '100%', aspectRatio: '16 / 10',
      borderRadius: 'var(--radius-md)', overflow: 'hidden',
      background: 'var(--color-light-0)', marginBottom: 'var(--space-3)',
      border: '1px solid var(--color-light-border)',
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[0]} alt={alt} loading="lazy" decoding="async"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[1]} alt="" aria-hidden="true" loading="lazy" decoding="async"
        className="exo-anim-top"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <style>{`
        .exo-anim-top { animation: exoFade 1.8s ease-in-out infinite alternate; }
        @keyframes exoFade { 0% { opacity: 0; } 100% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .exo-anim-top { animation: none; opacity: 1; }
        }
        @media print {
          .exo-anim-top { animation: none; opacity: 1; }
        }
      `}</style>
    </span>
  )
}
