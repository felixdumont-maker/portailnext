'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { statutMeta } from '@/lib/statuts'

const API = process.env.NEXT_PUBLIC_API_URL || ''

interface Projet {
  id: number
  nom_projet: string
  statut: string
  date_livraison_estimee: string
  created_at: string
  is_archived: number
  service_icon: string | null
  service_nom: string | null
  checklist: { ready: number; done: number; total: number }
}

interface DashboardData {
  projets_actifs: Projet[]
  projets_archives: Projet[]
}

const TYPE_ICON: Record<string, { icon: string; color: string }> = {
  web:       { icon: 'language',     color: 'var(--color-success)' },
  photo:     { icon: 'photo_camera', color: 'var(--color-info)' },
  video:     { icon: 'videocam',     color: 'var(--color-brand)' },
  graphisme: { icon: 'palette',      color: 'var(--color-warning-mid)' },
  default:   { icon: 'folder',       color: 'var(--color-light-text-3)' },
}

const STATUT_BASE_PCT: Record<string, number> = {
  'Documents à donner':        0,
  'En attente de rendez-vous': 25,
  'Documents reçus':           40,
  'Travaux en cours':          60,
  'En révision':                80,
  'Complété':                  100,
  'Travaux terminés':          90,
  'Annulé':                    0,
}

function progressPct(p: Projet): number {
  const basePct = STATUT_BASE_PCT[p.statut] ?? 0
  const { done, total } = p.checklist
  const checklistPct = total > 0 ? Math.round((done / total) * 100) : 0
  if (p.statut === 'Complété') return 100
  if (p.statut === 'Documents à donner') return Math.max(Math.round(checklistPct * 0.35), total > 0 ? 5 : 0)
  return Math.min(basePct + (total > 0 ? Math.round(checklistPct * 0.15) : 0), 99)
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' })
}

type Filter = 'Tous' | 'En cours' | 'Complétés' | 'Archivés'
const FILTERS: Filter[] = ['Tous', 'En cours', 'Complétés', 'Archivés']
const FILTER_PARAM: Record<string, Filter> = { 'en-cours': 'En cours', 'completes': 'Complétés', 'archives': 'Archivés' }

function ProjetRow({ projet, actif }: { projet: Projet; actif: boolean }) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)
  const type = TYPE_ICON[projet.service_icon || 'default'] || TYPE_ICON.default
  const badge = statutMeta(projet.statut)
  const nom = projet.nom_projet.split(' — ')[1] || projet.nom_projet
  const pct = actif ? progressPct(projet) : 0
  const dateRef = projet.date_livraison_estimee || projet.created_at
  const dateLabel = actif
    ? `Échéance ${formatDate(projet.date_livraison_estimee)}`
    : projet.statut === 'Complété' ? `Complété le ${formatDate(dateRef)}` : `Archivé le ${formatDate(dateRef)}`

  return (
    <div
      onClick={() => router.push(`/projet/${projet.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--color-light-2)', border: '1px solid',
        borderColor: hovered ? 'var(--color-brand-25pct)' : 'var(--color-light-border)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)',
        display: 'flex', alignItems: 'center', gap: 'var(--space-4)', cursor: 'pointer',
        boxShadow: hovered ? '0 4px 20px var(--color-brand-6pct)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: `border-color var(--duration-base), box-shadow var(--duration-base), transform var(--duration-base)`,
      }}
    >
      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '20px', color: type.color, flexShrink: 0 }}>{type.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: actif ? 'var(--space-2)' : 0 }}>
          <span style={{
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-light-text)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {nom}
          </span>
          <span style={{
            display: 'inline-flex', fontSize: '10px', fontWeight: 800, letterSpacing: '0.05em',
            textTransform: 'uppercase', padding: '3px 9px', borderRadius: 'var(--radius-full)',
            background: badge.bg, color: badge.text, flexShrink: 0, whiteSpace: 'nowrap',
          }}>
            {projet.statut}
          </span>
        </div>
        {actif && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{ flex: 1, maxWidth: '220px', height: '6px', borderRadius: 'var(--radius-full)', background: 'var(--color-light-0)', overflow: 'hidden', flexShrink: 0 }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: pct === 100 ? 'var(--color-success)' : 'var(--color-brand)',
                borderRadius: 'var(--radius-full)', transition: `width var(--duration-slow) var(--ease-out-quart)`,
              }} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-light-text-3)', fontWeight: 700, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
          </div>
        )}
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {dateLabel}
      </span>
    </div>
  )
}

function ProjetsContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [actifs, setActifs] = useState<Projet[]>([])
  const [archives, setArchives] = useState<Projet[]>([])
  const [filter, setFilter] = useState<Filter>(() => FILTER_PARAM[searchParams.get('filter') || ''] || 'Tous')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch(`${API}/api/v1/dashboard`, { credentials: 'include' })
      .then(r => r.ok ? r.json() as Promise<DashboardData> : null)
      .then(d => { if (d) { setActifs(d.projets_actifs || []); setArchives(d.projets_archives || []) } })
      .finally(() => setLoading(false))
  }, [])

  const all = useMemo(() => [
    ...actifs.map(p => ({ p, actif: true, groupe: 'En cours' as Filter })),
    ...archives.map(p => ({ p, actif: false, groupe: (p.statut === 'Complété' ? 'Complétés' : 'Archivés') as Filter })),
  ], [actifs, archives])

  const counts: Record<Filter, number> = {
    Tous: all.length,
    'En cours': all.filter(x => x.groupe === 'En cours').length,
    'Complétés': all.filter(x => x.groupe === 'Complétés').length,
    'Archivés': all.filter(x => x.groupe === 'Archivés').length,
  }

  const q = search.trim().toLowerCase()
  const filtered = all
    .filter(x => filter === 'Tous' || x.groupe === filter)
    .filter(x => !q || x.p.nom_projet.toLowerCase().includes(q))

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: 'var(--space-12)', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>

      <header style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '36px',
          lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--color-light-text)', marginBottom: 'var(--space-2)',
        }}>
          Mes projets
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)' }}>
          Tous vos projets, en cours et passés.
        </p>
      </header>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30dvh' }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-light-border-2)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)',
                    border: `1px solid ${filter === f ? 'var(--color-brand)' : 'var(--color-light-border)'}`,
                    cursor: 'pointer', background: filter === f ? 'var(--color-brand)' : 'var(--color-light-2)',
                    color: filter === f ? 'white' : 'var(--color-light-text-2)',
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 700,
                  }}
                >
                  {f} ({counts[f]})
                </button>
              ))}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
              borderRadius: 'var(--radius-full)', padding: '0 var(--space-4)',
            }}>
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-light-text-3)' }}>search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un projet…"
                aria-label="Rechercher un projet"
                style={{
                  border: 'none', background: 'none', outline: 'none', color: 'var(--color-light-text)',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', padding: 'var(--space-3) 0', width: '190px',
                }}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{
              background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-10) var(--space-6)', display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 'var(--space-3)', color: 'var(--color-light-text-3)',
            }}>
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '30px' }}>
                {all.length === 0 ? 'folder_off' : 'search_off'}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
                {all.length === 0 ? 'Aucun projet pour le moment.' : 'Aucun projet ne correspond à votre recherche.'}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {filtered.map(x => <ProjetRow key={x.p.id} projet={x.p} actif={x.actif} />)}
            </div>
          )}
        </>
      )}
    </main>
  )
}

export default function ProjetsPage() {
  return (
    <Suspense fallback={null}>
      <ProjetsContent />
    </Suspense>
  )
}
