'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { statutMeta } from '@/lib/statuts'

interface Projet {
  id: number
  nom_projet: string
  statut: string
  client_nom: string
  nom_service: string | null
  service_categorie: string | null
  responsable_nom: string | null
  progress: number
  date_livraison_estimee: string | null
  is_archived: number
  created_at: string
  is_test_client: boolean
}

// ── Statut → bucket (pour badge + filtre) ──────────────────────────────
type Bucket = 'attente' | 'encours' | 'revision' | 'complete' | 'archive' | 'test'

function bucketOf(p: Projet): Bucket {
  // Compte de test (felixrbk@gmail.com et autres marqués is_test_client) : toujours à part,
  // peu importe son statut ou s'il est archivé — évite le mélange avec les vrais clients.
  if (p.is_test_client) return 'test'
  if (p.is_archived === 1) return 'archive'
  switch (p.statut) {
    case 'En attente de rendez-vous': return 'attente'
    case 'En révision':               return 'revision'
    case 'Complété':
    case 'Travaux terminés':          return 'complete'
    default:                          return 'encours' // Travaux en cours, Documents à donner/reçus…
  }
}

const FILTRES: { key: Bucket | 'tous'; label: string }[] = [
  { key: 'tous', label: 'Tous' },
  { key: 'attente', label: 'En attente de RDV' },
  { key: 'encours', label: 'En cours' },
  { key: 'revision', label: 'En révision' },
  { key: 'complete', label: 'Complété' },
  { key: 'archive', label: 'Archivé' },
  { key: 'test', label: 'Test' },
]

// ── Type de service → couleur + icône (par mot-clé) ────────────────────
function serviceType(nom: string | null, cat: string | null): { label: string; color: string; icon: string } {
  const s = `${nom || ''} ${cat || ''}`.toLowerCase()
  if (/(vid[ée]o|short|reel|a[ée]rien)/.test(s))          return { label: 'Vidéo', color: 'var(--color-brand)', icon: 'videocam' }
  if (/photo|portrait|drone/.test(s))                      return { label: 'Photo', color: 'var(--color-info)', icon: 'photo_camera' }
  if (/(site|web|shopify|vercel|transactionnel|vitrine)/.test(s)) return { label: 'Web', color: 'var(--color-success)', icon: 'language' }
  if (/(marketing|r[ée]seaux|plan d.affaires|campagne)/.test(s))  return { label: 'Marketing', color: 'oklch(55% 0.17 300)', icon: 'campaign' }
  if (/(logo|identit[ée]|design|visuel|support|pr[ée]sentation|powerpoint|graph|imprim)/.test(s)) return { label: 'Design', color: 'var(--color-warning-mid-2)', icon: 'palette' }
  return { label: nom ? 'Service' : '—', color: 'var(--color-dark-text-2)', icon: 'category' }
}

// ── Responsable → couleur d'avatar (par nom) ───────────────────────────
const AVATAR_COLORS = ['var(--color-brand)', 'var(--color-info)', 'var(--color-success)', 'var(--color-warning-mid-2)', 'oklch(55% 0.17 300)']
function avatarColor(nom: string) {
  let h = 0
  for (let i = 0; i < nom.length; i++) h = (h * 31 + nom.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
const initialsOf = (nom: string) => nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

const dateFr = (d: string | null) => d
  ? new Date(d.length <= 10 ? d + 'T12:00:00' : d).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' })
  : '—'

const GRID = 'grid grid-cols-[2.2fr_1.2fr_1.3fr_1.4fr_0.8fr_auto] gap-4 items-center'

export default function AdminProjetsPage() {
  const [projets, setProjets] = useState<Projet[]>([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState<Bucket | 'tous'>('tous')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/v1/admin/projets', { credentials: 'include' })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setProjets(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const searched = projets.filter(p =>
    p.nom_projet.toLowerCase().includes(search.toLowerCase()) ||
    p.client_nom?.toLowerCase().includes(search.toLowerCase())
  )
  // "Tous" exclut les comptes de test par défaut — il faut cliquer explicitement sur
  // l'onglet "Test" pour les voir, pour ne pas les mélanger avec les vrais clients.
  const filtered = filtre === 'tous'
    ? searched.filter(p => bucketOf(p) !== 'test')
    : searched.filter(p => bucketOf(p) === filtre)

  // Compteurs de chips sur l'ensemble des projets (pas seulement la recherche)
  const countOf = (key: Bucket | 'tous') => key === 'tous'
    ? projets.filter(p => bucketOf(p) !== 'test').length
    : projets.filter(p => bucketOf(p) === key).length

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <p className="font-body font-bold text-[11px] uppercase tracking-[0.16em] text-[var(--color-dark-text-2)] mb-1">{projets.filter(p => !p.is_test_client).length} projets au total</p>
          <h1 className="font-display text-[var(--color-dark-0)] leading-none" style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em' }}>Projets</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-dark-text-2)]">search</span>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un projet, un client…"
              className="bg-white border border-[var(--color-light-border-2)] rounded-full pl-12 pr-6 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 w-72"
            />
          </div>
          <Link href="/admin/projets/new"
            className="inline-flex items-center gap-2 bg-[var(--color-brand)] text-white px-5 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--color-brand-hover)] transition-colors whitespace-nowrap">
            <span aria-hidden="true" className="material-symbols-outlined text-base">add</span>
            Nouveau projet
          </Link>
        </div>
      </div>

      {/* Chips filtres */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {FILTRES.map(f => {
          const active = filtre === f.key
          return (
            <button key={f.key} onClick={() => setFiltre(f.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-xs font-bold transition-colors ${active ? 'bg-[var(--color-brand)] text-white' : 'bg-white border border-[var(--color-light-border)] text-[var(--color-dark-text-2)] hover:border-[var(--color-brand)]'}`}>
              {f.label}
              <span className={`text-[11px] leading-none px-1.5 py-0.5 rounded-full ${active ? 'bg-white/25 text-white' : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)]'}`}>{countOf(f.key)}</span>
            </button>
          )
        })}
      </div>

      {/* Liste */}
      {loading ? (
        <p className="text-[var(--color-dark-text-2)] font-body text-center py-20">Chargement…</p>
      ) : (
        <div className="bg-white rounded-[18px] border border-[var(--color-light-border)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[860px]">
              {/* En-tête de colonnes */}
              <div className={`${GRID} px-5 py-3 bg-[var(--color-light-0)] text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest`}>
                <span>Projet</span><span>Type</span><span>Responsable</span><span>Progression</span><span>Échéance</span><span />
              </div>

              {filtered.map(p => {
                const meta = statutMeta(p.statut)
                const type = serviceType(p.nom_service, p.service_categorie)
                const resp = p.responsable_nom || 'Félix'
                const done = p.progress >= 100
                return (
                  <Link key={p.id} href={`/admin/projet/${p.id}`}
                    className={`${GRID} px-5 py-4 border-t border-[var(--color-light-border)] hover:bg-[var(--color-light-1)] transition-colors cursor-pointer group`}>
                    {/* Projet */}
                    <div className="min-w-0">
                      <p className="font-body font-bold text-sm text-[var(--color-dark-1)] truncate">{p.nom_projet}</p>
                      <p className="font-body text-xs text-[var(--color-dark-text-2)] truncate">{p.client_nom}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full font-body text-[9px] font-bold uppercase tracking-wide" style={{ background: meta.bg, color: meta.text }}>{p.statut}</span>
                    </div>
                    {/* Type */}
                    <div className="flex items-center gap-2 min-w-0" style={{ color: type.color }}>
                      <span aria-hidden="true" className="material-symbols-outlined text-lg flex-shrink-0">{type.icon}</span>
                      <span className="font-body text-xs font-bold truncate">{type.label}</span>
                    </div>
                    {/* Responsable */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-white font-display text-[11px] font-extrabold flex-shrink-0" style={{ background: avatarColor(resp) }}>{initialsOf(resp)}</span>
                      <span className="font-body text-xs text-[var(--color-dark-1)] truncate">{resp}</span>
                    </div>
                    {/* Progression */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--color-light-0)] overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, background: done ? 'var(--color-success)' : 'var(--color-brand)' }} />
                      </div>
                      <span className="font-body text-[11px] font-bold tabular-nums w-8 text-right" style={{ color: done ? 'var(--color-success-text)' : 'var(--color-dark-text-2)' }}>{p.progress}%</span>
                    </div>
                    {/* Échéance */}
                    <span className="font-body text-xs text-[var(--color-dark-text-2)]">{dateFr(p.date_livraison_estimee)}</span>
                    {/* Voir */}
                    <span className="font-body text-xs font-bold uppercase tracking-wide text-[var(--color-brand)] whitespace-nowrap group-hover:underline">Voir →</span>
                  </Link>
                )
              })}

              {filtered.length === 0 && (
                <p className="px-5 py-12 text-center text-[var(--color-dark-text-2)] font-body border-t border-[var(--color-light-border)]">Aucun projet trouvé.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
