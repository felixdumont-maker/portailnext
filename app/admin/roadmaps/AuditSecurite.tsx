'use client'

import { useEffect, useState } from 'react'

// Section interactive de suivi de l'audit technique pré-lancement (19 juillet 2026).
// Réutilise la table cocktailos_vision_todos existante (routes génériques toggle/delete),
// namespace phase_id 900-903 réservé aux 4 niveaux de sévérité de l'audit — distinct des
// phase_id 0-5 de la roadmap produit pour éviter toute collision.

type AuditTodo = { id: number; phase_id: number; texte: string; done: boolean }

const ARTIFACT_URL = 'https://claude.ai/code/artifact/6bf3b1a4-a866-46b2-8ef0-f3457a3253e1'

const GROUPS = [
  { phaseId: 900, label: 'Critique', sub: "À corriger avant l'annonce", color: '#b3261e', bg: '#fbeae8' },
  { phaseId: 901, label: 'Important', sub: 'Avant le lancement', color: '#b0621e', bg: '#fbf0e3' },
  { phaseId: 902, label: 'À planifier', sub: 'Pas bloquant', color: '#2f7a6b', bg: '#e6f1ee' },
  { phaseId: 903, label: 'Accessoire', sub: 'Polish', color: '#6e7160', bg: '#eeeee7' },
] as const

export default function AuditSecurite() {
  const [todos, setTodos] = useState<AuditTodo[]>([])
  const [open, setOpen] = useState<Record<number, boolean>>({ 900: true })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/v1/admin/roadmaps/vision-todos', { credentials: 'include' })
      .then(r => r.json())
      .then((rows: AuditTodo[]) => {
        if (!Array.isArray(rows)) return
        setTodos(rows.filter(r => r.phase_id >= 900 && r.phase_id <= 903))
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', marginBottom: '4px' }}>
            🔍 Audit technique — 19 juillet 2026
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#2b2b2b', margin: 0 }}>Sécurité &amp; fiabilité — pré-lancement</h2>
        </div>
        <a
          href={ARTIFACT_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '12px', fontWeight: 500, color: 'white', background: '#2b2b2b', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', flexShrink: 0 }}
        >
          Voir le rapport complet ↗
        </a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
        <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: '#f0ebe5', overflow: 'hidden' }}>
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              background: pct === 100 ? '#2ecc71' : '#2b2b2b',
              transition: 'width 0.3s',
            }}
          />
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
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em', color: g.color, background: 'white', padding: '2px 8px', borderRadius: '4px' }}>
                  {g.label.toUpperCase()}
                </span>
                <span style={{ fontSize: '12px', color: g.color, flex: 1 }}>{g.sub}</span>
                <span style={{ fontSize: '11px', color: g.color, fontWeight: 600 }}>{gDone}/{items.length}</span>
                <span
                  style={{
                    fontSize: '11px',
                    color: g.color,
                    display: 'inline-block',
                    transform: isOpen ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s',
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
