'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Plan, ProgressEntry } from './types'
import { todayISO, todayWeekday, computeStreak } from './utils'
import PlanView from './_components/PlanView'

type State =
  | { status: 'loading' }
  | { status: 'noplan' }
  | { status: 'error' }
  | { status: 'ready'; plan: Plan; entries: ProgressEntry[] }

export default function EntrainementPage() {
  const router = useRouter()
  const [state, setState] = useState<State>({ status: 'loading' })
  const [busy, setBusy] = useState<Set<string>>(new Set())
  const today = useMemo(() => todayISO(), [])
  const weekday = useMemo(() => todayWeekday(), [])

  // Chargement initial : plan actif + cases cochées
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const meRes = await fetch('/api/v1/entrainement/me', { credentials: 'include' })
        if (meRes.status === 401) { router.push('/'); return }
        if (meRes.status === 404) { if (alive) setState({ status: 'noplan' }); return }
        if (!meRes.ok) { if (alive) setState({ status: 'error' }); return }
        const plan: Plan = await meRes.json()

        const progRes = await fetch(`/api/v1/entrainement/progress?plan_id=${plan.id}`, { credentials: 'include' })
        const entries: ProgressEntry[] = progRes.ok ? (await progRes.json()).entries ?? [] : []
        if (alive) setState({ status: 'ready', plan, entries })
      } catch {
        if (alive) setState({ status: 'error' })
      }
    })()
    return () => { alive = false }
  }, [router])

  // Cases cochées aujourd'hui
  const checkedToday = useMemo(() => {
    if (state.status !== 'ready') return new Set<string>()
    return new Set(state.entries.filter(e => e.date === today).map(e => e.exercice_key))
  }, [state, today])

  const streak = useMemo(() => {
    if (state.status !== 'ready') return 0
    return computeStreak(new Set(state.entries.map(e => e.date)))
  }, [state])

  const onToggle = useCallback(async (key: string, done: boolean) => {
    if (state.status !== 'ready') return
    const plan = state.plan
    // Optimiste
    setBusy(prev => new Set(prev).add(key))
    setState(prev => {
      if (prev.status !== 'ready') return prev
      const others = prev.entries.filter(e => !(e.exercice_key === key && e.date === today))
      return { ...prev, entries: done ? [...others, { exercice_key: key, date: today }] : others }
    })
    try {
      const res = await fetch('/api/v1/entrainement/progress', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: plan.id, exercice_key: key, date: today, done }),
      })
      if (!res.ok) throw new Error('save failed')
    } catch {
      // Revert en cas d'échec
      setState(prev => {
        if (prev.status !== 'ready') return prev
        const others = prev.entries.filter(e => !(e.exercice_key === key && e.date === today))
        return { ...prev, entries: done ? others : [...others, { exercice_key: key, date: today }] }
      })
    } finally {
      setBusy(prev => { const n = new Set(prev); n.delete(key); return n })
    }
  }, [state, today])

  if (state.status === 'loading') {
    return <CenterMsg>Chargement de ton programme…</CenterMsg>
  }
  if (state.status === 'error') {
    return <CenterMsg>Oups, impossible de charger le programme pour l’instant. Réessaie dans un moment.</CenterMsg>
  }
  if (state.status === 'noplan') {
    return <CenterMsg>Aucun programme ne t’est encore assigné. 🌱</CenterMsg>
  }

  return (
    <div style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>
      <PlanView
        plan={state.plan}
        checkedToday={checkedToday}
        streak={streak}
        weekday={weekday}
        onToggle={onToggle}
        busy={busy}
      />

      {/* Bouton imprimer */}
      <div className="no-print" style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
        <button
          onClick={() => window.print()}
          style={{
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1.05rem',
            color: 'var(--color-light-text-2)', background: 'var(--color-light-2)',
            border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-full)',
            padding: 'var(--space-3) var(--space-6)', cursor: 'pointer',
          }}
        >
          🖨️ Imprimer mon programme
        </button>
      </div>

      {/* Styles d'impression : on cache la navigation et les éléments interactifs */}
      <style>{`
        @media print {
          nav, .no-print { display: none !important; }
          main { padding: 0 !important; }
          body { background: white !important; }
          section { box-shadow: none !important; break-inside: avoid; }
        }
      `}</style>
    </div>
  )
}

function CenterMsg({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-6)', textAlign: 'center',
    }}>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '1.2rem', lineHeight: 1.6,
        color: 'var(--color-light-text-2)', maxWidth: '40ch',
      }}>
        {children}
      </p>
    </div>
  )
}
