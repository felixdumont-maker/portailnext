'use client'

import { useEffect, useState } from 'react'

// Plan de match pré-lancement (19 juillet 2026) — checklist des phases Urgence → I.
// Même mécanisme que AuditSecurite.tsx (table cocktailos_vision_todos, routes génériques
// toggle/delete), namespace phase_id 800-812 réservé à ce plan — distinct des phase_id
// 0-5 (roadmap produit) et 900-903 (audit sécurité) pour éviter toute collision.
// Deux items du plan original (« Surveillance de disponibilité », « Sentry backend »)
// ont été omis ici volontairement : déjà suivis dans la section Audit sécurité, pas dupliqués.

type PlanTodo = { id: number; phase_id: number; texte: string; done: boolean }

const GROUPS = [
  { phaseId: 800, label: 'Urgence absolue', sub: "Le bogue comptable — bloque tout, avant toute autre ligne de code", color: '#c0321a', bg: '#fdecea' },
  { phaseId: 801, label: 'Phase A', sub: 'Finir ce qui est en cours — aucune distraction', color: '#f39c12', bg: '#fff3cd' },
  { phaseId: 802, label: 'Phase B1', sub: 'Serveur', color: '#3498db', bg: '#cce5ff' },
  { phaseId: 803, label: 'Phase B2', sub: 'Base de données — migration Postgres en une passe', color: '#3498db', bg: '#cce5ff' },
  { phaseId: 804, label: 'Phase B3', sub: 'Stockage fichiers', color: '#3498db', bg: '#cce5ff' },
  { phaseId: 805, label: 'Phase B4', sub: "Exploitation — surveillance & Sentry backend déjà suivis dans Audit sécurité", color: '#3498db', bg: '#cce5ff' },
  { phaseId: 806, label: 'Phase C', sub: 'API et authentification', color: '#3498db', bg: '#cce5ff' },
  { phaseId: 807, label: 'Phase D', sub: 'Multi-tenant produit', color: '#3498db', bg: '#cce5ff' },
  { phaseId: 808, label: 'Phase E', sub: 'Interface web (PWA)', color: '#3498db', bg: '#cce5ff' },
  { phaseId: 809, label: 'Phase F', sub: 'Produit — décisions déjà tranchées', color: '#2ecc71', bg: '#d4edda' },
  { phaseId: 810, label: 'Phase G', sub: 'Extraction du code partagé — avant l’app mobile', color: '#3498db', bg: '#cce5ff' },
  { phaseId: 811, label: 'Phase H', sub: 'Mobile — déclenché par les premiers locataires payants, pas par une date', color: '#95a5a6', bg: '#ecf0f1' },
  { phaseId: 812, label: 'Phase I', sub: 'Affaires — en parallèle, pas après', color: '#2ecc71', bg: '#d4edda' },
] as const

export default function PlanMatch() {
  const [todos, setTodos] = useState<PlanTodo[]>([])
  const [open, setOpen] = useState<Record<number, boolean>>({ 800: true })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/v1/admin/roadmaps/vision-todos', { credentials: 'include' })
      .then(r => r.json())
      .then((rows: PlanTodo[]) => {
        if (!Array.isArray(rows)) return
        setTodos(rows.filter(r => r.phase_id >= 800 && r.phase_id < 900))
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
          🎯 Plan de match pré-lancement — 19 juillet 2026
        </div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#2b2b2b', margin: 0 }}>De la comptabilité au multi-tenant</h2>
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
