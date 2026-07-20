'use client'

import { useEffect, useState } from 'react'

// Plan de migration CocktailOS — SQLite → PostgreSQL + multi-tenant + VPS OVH Beauharnois
// (20 juillet 2026). Même mécanisme que PlanMatch.tsx / AuditSecurite.tsx (table
// cocktailos_vision_todos, routes génériques toggle/delete), namespace phase_id 930-935
// réservé à ce plan — reprend et détaille en étapes exécutables la Phase B2 (phase_id 803)
// du Plan de match. Détail technique complet (snippets bash/sql/python) dans
// /opt/cocktailmedia/PLAN_MIGRATION_POSTGRES_VPS.md, pas reproduit ici.

type MigrationTodo = { id: number; phase_id: number; texte: string; done: boolean }

const GROUPS = [
  { phaseId: 930, label: 'Étape 0', sub: 'Préparation & ménage du ThinkCentre', color: '#3498db', bg: '#cce5ff' },
  { phaseId: 931, label: 'Étape 1-2', sub: 'Vérifications & fondation Postgres (dev)', color: '#3498db', bg: '#cce5ff' },
  { phaseId: 932, label: 'Étape 3-5', sub: 'Migration des données, RLS, adaptation app.py', color: '#3498db', bg: '#cce5ff' },
  { phaseId: 933, label: 'Étape 6', sub: 'Validation locale complète — rien ne passe sans ça', color: '#f39c12', bg: '#fff3cd' },
  { phaseId: 934, label: 'Étape 7-9', sub: 'Déploiement VPS, bascule DNS, exploitation', color: '#3498db', bg: '#cce5ff' },
  { phaseId: 935, label: 'Hors scope', sub: "Explicitement pas dans cette migration", color: '#95a5a6', bg: '#ecf0f1' },
] as const

export default function MigrationPostgresVPS() {
  const [todos, setTodos] = useState<MigrationTodo[]>([])
  const [open, setOpen] = useState<Record<number, boolean>>({ 930: true })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/v1/admin/roadmaps/vision-todos', { credentials: 'include' })
      .then(r => r.json())
      .then((rows: MigrationTodo[]) => {
        if (!Array.isArray(rows)) return
        setTodos(rows.filter(r => r.phase_id >= 930 && r.phase_id <= 935))
      })
      .finally(() => setLoaded(true))
  }, [])

  function toggle(id: number) {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)))
    fetch(`/api/v1/admin/roadmaps/vision-todos/${id}/toggle`, { method: 'POST', credentials: 'include' }).catch(() => {})
  }

  if (!loaded || todos.length === 0) return null

  const total = todos.length
  const done = todos.filter(t => t.done).length
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <div style={{ background: 'white', border: '1px solid #e0d9d3', borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', marginBottom: '4px' }}>
          🗄️ Plan de migration — 20 juillet 2026
        </div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#2b2b2b', margin: 0 }}>SQLite → PostgreSQL + multi-tenant + VPS OVH</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
        <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: '#f0ebe5', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#2ecc71' : '#2b2b2b', transition: 'width 0.3s' }} />
        </div>
        <div style={{ fontSize: '12px', color: '#888', fontWeight: 500, minWidth: '78px', textAlign: 'right' }}>
          {done}/{total} réglés
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {GROUPS.map(g => {
          const items = todos.filter(t => t.phase_id === g.phaseId)
          if (items.length === 0) return null
          const gDone = items.filter(t => t.done).length
          const isOpen = !!open[g.phaseId]
          return (
            <div key={g.phaseId} style={{ border: '1px solid #f0ebe5', borderRadius: '10px', overflow: 'hidden' }}>
              <div
                onClick={() => setOpen(prev => ({ ...prev, [g.phaseId]: !prev[g.phaseId] }))}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', cursor: 'pointer', background: g.bg }}
              >
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em', color: g.color, background: 'white', padding: '2px 8px', borderRadius: '4px', flexShrink: 0 }}>
                  {g.label.toUpperCase()}
                </span>
                <span style={{ fontSize: '12px', color: g.color, flex: 1 }}>{g.sub}</span>
                <span style={{ fontSize: '11px', color: g.color, fontWeight: 600, flexShrink: 0 }}>{gDone}/{items.length}</span>
                <span
                  style={{
                    fontSize: '11px',
                    color: g.color,
                    display: 'inline-block',
                    transform: isOpen ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                  }}
                >
                  ▶
                </span>
              </div>
              {isOpen && (
                <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {items.map(t => (
                    <label
                      key={t.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '9px',
                        cursor: 'pointer',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: t.done ? '#f0faf4' : 'transparent',
                      }}
                    >
                      <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span
                        style={{
                          fontSize: '12px',
                          color: t.done ? '#aaa' : '#2b2b2b',
                          lineHeight: 1.5,
                          textDecoration: t.done ? 'line-through' : 'none',
                        }}
                      >
                        {t.texte}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
