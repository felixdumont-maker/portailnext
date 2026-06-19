'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Client { id: number; nom_complet: string; email: string; nom_entreprise: string }

interface Cout    { service?: string; situation?: string; cout: string; note?: string }
interface Scenario { titre: string; lignes: string[] }
interface Features {
  site_web: boolean; formations: boolean; portail_brande: boolean
  quiz: boolean; crm_complet: boolean; facturation: boolean; stripe: boolean
  vps: boolean; sauvegardes: boolean; app_surmesure: boolean
  admin_autonome: boolean; chatbot_ia: boolean; recommandations_ia: boolean
  code_source: boolean; financement: boolean
  maintenance_comprise: boolean; maintenance_supplement: boolean
}

interface Option {
  nom: string; description: string
  prix_setup: string; prix_mensuel: string; prix_horaire: string
  delai_livraison: string; conditions_paiement: string
  est_recommande: boolean; badge_texte: string
  inclus: string[]
  couts_tiers: Cout[]
  couts_supplementaires: Cout[]
  scenarios: Scenario[]
  features: Features
}

const FEATURE_LABELS: { key: keyof Features; label: string }[] = [
  { key: 'site_web',              label: 'Site web professionnel' },
  { key: 'formations',            label: 'Plateforme de formations' },
  { key: 'portail_brande',        label: 'Portail à votre image' },
  { key: 'quiz',                  label: 'Quiz et certifications automatisés' },
  { key: 'crm_complet',           label: 'CRM clients complet' },
  { key: 'facturation',           label: 'Facturation intégrée' },
  { key: 'stripe',                label: 'Paiement Stripe en ligne' },
  { key: 'vps',                   label: 'Hébergement VPS dédié' },
  { key: 'sauvegardes',           label: 'Sauvegardes quotidiennes' },
  { key: 'app_surmesure',         label: 'Application web sur mesure' },
  { key: 'admin_autonome',        label: 'Gestion 100% autonome' },
  { key: 'chatbot_ia',            label: 'Assistant IA 24h/7j' },
  { key: 'recommandations_ia',    label: 'Recommandations IA' },
  { key: 'code_source',           label: 'Code source propriétaire' },
  { key: 'financement',           label: 'Idéal pour financement' },
  { key: 'maintenance_comprise',  label: 'Maintenance comprise' },
  { key: 'maintenance_supplement', label: 'Maintenance en supplément' },
]

const TPS = 0.05
const TVQ = 0.09975

function taxes(v: string) {
  const n = parseFloat(v) || 0
  const t = n * TPS
  const q = n * TVQ
  return { tps: t.toFixed(2), tvq: q.toFixed(2), total: (n + t + q).toFixed(2) }
}

function blankFeatures(): Features {
  return {
    site_web: false, formations: false, portail_brande: false,
    quiz: false, crm_complet: false, facturation: false, stripe: false,
    vps: false, sauvegardes: false, app_surmesure: false,
    admin_autonome: false, chatbot_ia: false, recommandations_ia: false,
    code_source: false, financement: false,
    maintenance_comprise: false, maintenance_supplement: false,
  }
}

function blankOption(): Option {
  return {
    nom: '', description: '',
    prix_setup: '', prix_mensuel: '', prix_horaire: '',
    delai_livraison: '', conditions_paiement: '',
    est_recommande: false, badge_texte: '',
    inclus: [''],
    couts_tiers: [{ service: '', cout: '', note: '' }],
    couts_supplementaires: [{ situation: '', cout: '' }],
    scenarios: [{ titre: '', lignes: [''] }],
    features: blankFeatures(),
  }
}

function defaultExpiration() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split('T')[0]
}

interface TemplateListItem { id: number; nom: string; est_actif: number; nb_options: number }
interface TemplateApply {
  titre: string
  message_intro: string
  options: Array<{
    nom: string; description: string | null
    prix_setup: number; prix_mensuel: number; prix_horaire: number
    delai_livraison: string | null; conditions_paiement: string | null
    badge_texte: string | null; est_recommande: number; ordre: number
    features_json: string; inclus_json: string
    couts_tiers_json: string; couts_supplementaires_json: string; scenarios_json: string
    rachat_disponible: number; prix_rachat: number; inclus_rachat_json: string
  }>
}

function parseInclus(json: string): string[] {
  try { const v = JSON.parse(json); return Array.isArray(v) ? v : [] } catch { return [] }
}
function parseCoutsTiers(json: string): Cout[] {
  try {
    const v = JSON.parse(json)
    if (!Array.isArray(v)) return []
    return v.map((c: Record<string, unknown>) => ({
      service: String(c.nom ?? c.service ?? ''),
      cout: String(c.montant ?? c.cout ?? ''),
      note: String(c.periodicite ?? c.note ?? ''),
    }))
  } catch { return [] }
}
function parseCoutsSupp(json: string): Cout[] {
  try {
    const v = JSON.parse(json)
    if (!Array.isArray(v)) return []
    return v.map((c: Record<string, unknown>) => ({
      situation: String(c.nom ?? c.situation ?? ''),
      cout: String(c.montant ?? c.cout ?? ''),
      note: String(c.note ?? ''),
    }))
  } catch { return [] }
}
function parseScenarios(json: string): Scenario[] {
  try {
    const v = JSON.parse(json)
    if (!Array.isArray(v)) return []
    return v.map((s: Record<string, unknown>) => {
      const titre = String(s.titre ?? '')
      // Format nouveau : lignes est un tableau [{label, valeur}]
      if (Array.isArray(s.lignes)) {
        const lignes = (s.lignes as Record<string, unknown>[]).map(l =>
          `${l.label ?? ''} : ${l.valeur ?? ''}`.trim()
        ).filter(Boolean)
        return { titre, lignes }
      }
      // Format ancien : description + prix_total
      const lignes = [
        String(s.description ?? ''),
        s.prix_total != null ? `Total : ${s.prix_total} $` : '',
      ].filter(Boolean)
      return { titre, lignes }
    })
  } catch { return [] }
}
function parseFeatures(json: string): Features {
  // Aliases : clés DB nouvelles → clés formulaire
  const ALIASES: Record<string, keyof Features> = {
    plateforme_formations: 'formations',
    quiz_certifications:   'quiz',
    facturation_integree:  'facturation',
    paiement_stripe:       'stripe',
    code_proprietaire:     'code_source',
    ideal_financement:     'financement',
  }
  try {
    const v = JSON.parse(json)
    if (typeof v !== 'object' || v === null) return blankFeatures()
    const base = blankFeatures()
    for (const [k, val] of Object.entries(v)) {
      const key = (ALIASES[k] ?? k) as keyof Features
      if (key in base) base[key] = Boolean(val)
    }
    return base
  } catch { return blankFeatures() }
}

export default function NouvellesoumissionPage() {
  const router = useRouter()
  const [clients, setClients]         = useState<Client[]>([])
  const [id_client, setIdClient]      = useState('')
  const [titre, setTitre]             = useState('')
  const [message_intro, setMessageIntro] = useState('')
  const [date_expiration, setDateExp] = useState(defaultExpiration())
  const [options, setOptions]         = useState<Option[]>([blankOption()])
  const [expanded, setExpanded]       = useState<number[]>([0])
  const [sending, setSending]         = useState(false)
  const [toast, setToast]             = useState<{ msg: string; ok: boolean } | null>(null)
  const [pasteBuf, setPasteBuf]       = useState<Record<string, string>>({})

  const [templates, setTemplates]         = useState<TemplateListItem[]>([])
  const [templatesLoading, setTplLoading] = useState(true)
  const [selectedTpl, setSelectedTpl]     = useState('')
  const [loadingTpl, setLoadingTpl]       = useState(false)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    fetch('/api/v1/admin/clients', { credentials: 'include' })
      .then(r => r.json()).then(setClients).catch(() => {})
    fetch('/api/v1/admin/soumissions/templates', { credentials: 'include' })
      .then(r => r.json())
      .then((data: TemplateListItem[]) => setTemplates(data.filter(t => t.est_actif)))
      .catch(() => {})
      .finally(() => setTplLoading(false))
  }, [])

  async function applyTemplate() {
    if (!selectedTpl || !id_client) {
      showToast('Choisissez un client et un modèle.', false); return
    }
    setLoadingTpl(true)
    try {
      const res = await fetch(
        `/api/v1/admin/soumissions/templates/${selectedTpl}/appliquer/${id_client}`,
        { credentials: 'include' }
      )
      if (!res.ok) { showToast('Erreur lors du chargement du modèle', false); return }
      const data: TemplateApply = await res.json()
      setMessageIntro(data.message_intro)
      const mapped: Option[] = data.options.map(o => ({
        nom: o.nom,
        description: o.description ?? '',
        prix_setup: String(o.prix_setup),
        prix_mensuel: String(o.prix_mensuel),
        prix_horaire: String(o.prix_horaire),
        delai_livraison: o.delai_livraison ?? '',
        conditions_paiement: o.conditions_paiement ?? '',
        est_recommande: Boolean(o.est_recommande),
        badge_texte: o.badge_texte ?? '',
        inclus: parseInclus(o.inclus_json).length ? parseInclus(o.inclus_json) : [''],
        couts_tiers: parseCoutsTiers(o.couts_tiers_json).length ? parseCoutsTiers(o.couts_tiers_json) : [{ service: '', cout: '', note: '' }],
        couts_supplementaires: parseCoutsSupp(o.couts_supplementaires_json).length ? parseCoutsSupp(o.couts_supplementaires_json) : [{ situation: '', cout: '' }],
        scenarios: parseScenarios(o.scenarios_json).length ? parseScenarios(o.scenarios_json) : [{ titre: '', lignes: [''] }],
        features: parseFeatures(o.features_json),
      }))
      setOptions(mapped)
      setExpanded(mapped.map((_, i) => i))
      showToast('Modèle appliqué avec succès')
    } catch {
      showToast('Erreur de connexion', false)
    } finally {
      setLoadingTpl(false)
    }
  }

  function updateOption(i: number, patch: Partial<Option>) {
    setOptions(prev => prev.map((o, idx) => idx === i ? { ...o, ...patch } : o))
  }

  function addOption() {
    const idx = options.length
    setOptions(prev => [...prev, blankOption()])
    setExpanded(prev => [...prev, idx])
  }

  function removeOption(i: number) {
    setOptions(prev => prev.filter((_, idx) => idx !== i))
    setExpanded(prev => prev.filter(v => v !== i).map(v => v > i ? v - 1 : v))
  }

  function toggleExpanded(i: number) {
    setExpanded(prev => prev.includes(i) ? prev.filter(v => v !== i) : [...prev, i])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id_client || !titre.trim()) {
      showToast('Client et titre requis.', false); return
    }
    if (options.some(o => !o.nom.trim())) {
      showToast('Chaque option doit avoir un nom.', false); return
    }
    setSending(true)
    try {
      const body = {
        id_client: parseInt(id_client),
        titre: titre.trim(),
        message_intro: message_intro.trim() || null,
        date_expiration: date_expiration || null,
        options: options.map(o => ({
          nom: o.nom.trim(),
          description: o.description.trim(),
          prix_setup: parseFloat(o.prix_setup) || 0,
          prix_mensuel: parseFloat(o.prix_mensuel) || 0,
          prix_horaire: parseFloat(o.prix_horaire) || 0,
          delai_livraison: o.delai_livraison.trim(),
          conditions_paiement: o.conditions_paiement.trim(),
          est_recommande: o.est_recommande,
          badge_texte: o.badge_texte.trim(),
          inclus: o.inclus.filter(s => s.trim()),
          couts_tiers: o.couts_tiers.filter(c => c.service?.trim() || c.cout),
          couts_supplementaires: o.couts_supplementaires.filter(c => c.situation?.trim() || c.cout),
          scenarios: o.scenarios.filter(s => s.titre.trim()).map(s => ({
            titre: s.titre.trim(),
            lignes: s.lignes.filter(l => l.trim()),
          })),
          features: o.features,
        })),
      }
      const res = await fetch('/api/v1/admin/soumission/creer', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Erreur', false); return }
      router.push(`/admin/soumissions/${data.id}`)
    } catch {
      showToast('Erreur de connexion', false)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {toast && (
        <div role="status" aria-live="polite" className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-3 ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-[var(--color-light-0)] transition-colors">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-dark-text-2)]">arrow_back</span>
        </button>
        <div>
          <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] uppercase tracking-tight leading-none">
            NOUVELLE PROPOSITION
          </h1>
          <p className="text-[var(--color-dark-text-2)] font-body text-sm mt-1">
            Un courriel de notification sera transmis au client automatiquement.
          </p>
        </div>
      </div>

      {/* Section template — chargement rapide */}
      <section className="bg-white rounded-3xl shadow-sm p-6 mb-2" style={{ border: '2px solid #e83b14' }}>
        <h2 className="font-display text-base uppercase tracking-wide text-[var(--color-dark-1)] mb-4 flex items-center gap-2">
          <span aria-hidden="true" className="material-symbols-outlined" style={{ color: '#e83b14' }}>article</span>
          Utiliser un modèle
        </h2>
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-0">
            <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-2">
              Modèle
            </label>
            <select
              value={selectedTpl}
              onChange={e => setSelectedTpl(e.target.value)}
              disabled={templatesLoading}
              className="w-full bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-2xl px-4 py-3 font-body text-sm text-[var(--color-dark-1)] outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
            >
              {templatesLoading
                ? <option value="">Chargement...</option>
                : templates.length === 0
                  ? <option value="">Aucun modèle disponible</option>
                  : <>
                      <option value="">-- Choisir un modèle --</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.nom} ({t.nb_options} option{t.nb_options !== 1 ? 's' : ''})
                        </option>
                      ))}
                    </>
              }
            </select>
          </div>
          <button
            type="button"
            onClick={applyTemplate}
            disabled={!selectedTpl || !id_client || loadingTpl || templatesLoading}
            title={!id_client ? 'Choisissez un client en premier' : ''}
            style={{
              background: (!selectedTpl || !id_client || loadingTpl || templatesLoading) ? '#ccc' : '#e83b14',
              color: 'white',
              border: 'none',
              borderRadius: 999,
              padding: '12px 24px',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: (!selectedTpl || !id_client || loadingTpl || templatesLoading) ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {loadingTpl ? 'Chargement...' : 'Appliquer ce modèle'}
          </button>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="font-body text-xs text-[var(--color-dark-text-2)]">
            Choisissez un client et un modèle, puis cliquez sur Appliquer. Les champs titre, message et sections seront préremplis.
          </p>
          <a
            href="/admin/soumissions/templates"
            className="font-body text-xs text-[var(--color-dark-text-2)] underline underline-offset-2 hover:text-[var(--color-dark-1)] transition-colors shrink-0 ml-4"
          >
            Gérer les modèles de propositions
          </a>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">

        {/* Section 1 — Infos générales */}
        <section className="bg-white rounded-3xl shadow-sm p-8">
          <h2 className="font-display text-lg uppercase tracking-wide text-[var(--color-dark-1)] mb-6 flex items-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]">info</span>
            Informations generales
          </h2>
          <div className="flex flex-col gap-5">
            <div>
              <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-2">
                Client *
              </label>
              <select
                value={id_client}
                onChange={e => {
                  const val = e.target.value
                  setIdClient(val)
                  const client = clients.find(c => String(c.id) === val)
                  setTitre(client ? client.nom_complet : '')
                }}
                required
                className="w-full bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-2xl px-4 py-3 font-body text-sm text-[var(--color-dark-1)] outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
              >
                <option value="">-- Choisir un client --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nom_complet}{c.nom_entreprise ? ` — ${c.nom_entreprise}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-2">
                Titre de la soumission *
              </label>
              <input
                type="text"
                value={titre}
                onChange={e => setTitre(e.target.value)}
                required
                placeholder="ex: Soumission site web vitrine"
                className="w-full bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-2xl px-4 py-3 font-body text-sm text-[var(--color-dark-1)] outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
              />
            </div>

            <div>
              <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-2">
                Message d&apos;introduction
              </label>
              <textarea
                value={message_intro}
                onChange={e => setMessageIntro(e.target.value)}
                rows={4}
                placeholder="Contexte, objectifs et notes visibles par le client..."
                className="w-full bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-2xl px-4 py-3 font-body text-sm text-[var(--color-dark-1)] outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 resize-none"
              />
            </div>

            <div>
              <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-2">
                Date d&apos;expiration
              </label>
              <input
                type="date"
                value={date_expiration}
                onChange={e => setDateExp(e.target.value)}
                className="bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-2xl px-4 py-3 font-body text-sm text-[var(--color-dark-1)] outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
              />
            </div>
          </div>
        </section>

        {/* Section 2 — Options */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg uppercase tracking-wide text-[var(--color-dark-1)] flex items-center gap-2">
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]">list_alt</span>
              Options ({options.length})
            </h2>
            <button
              type="button"
              onClick={addOption}
              className="inline-flex items-center gap-2 bg-[var(--color-brand)] text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--color-brand-hover)] transition-colors"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-sm">add</span>
              Ajouter une section tarifaire
            </button>
          </div>

          {options.map((opt, i) => {
            const isOpen = expanded.includes(i)
            const tx = taxes(opt.prix_setup)
            return (
              <div key={i} className="bg-white rounded-3xl shadow-sm overflow-hidden">
                {/* Header option */}
                <button
                  type="button"
                  onClick={() => toggleExpanded(i)}
                  className="w-full flex items-center justify-between px-8 py-5 hover:bg-[var(--color-light-0)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[var(--color-brand)] text-white font-display font-bold text-sm flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="font-body font-bold text-[var(--color-dark-1)] text-sm">
                      {opt.nom || `Option ${i + 1}`}
                    </span>
                    {opt.est_recommande && (
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full font-body">
                        Recommandé
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {opt.prix_setup && (
                      <span className="font-display text-base text-[var(--color-brand)]">
                        {tx.total} $ TTC
                      </span>
                    )}
                    {options.length > 1 && (
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); removeOption(i) }}
                        className="p-1.5 rounded-full text-[var(--color-dark-text-2)] hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span aria-hidden="true" className="material-symbols-outlined text-sm">close</span>
                      </button>
                    )}
                    <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-dark-text-2)]" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      expand_more
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-8 pb-8 flex flex-col gap-6 border-t border-[var(--color-light-0)]">

                    {/* Infos de base */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                      <div className="md:col-span-2">
                        <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-2">Nom de l&apos;option *</label>
                        <input type="text" value={opt.nom} onChange={e => updateOption(i, { nom: e.target.value })} placeholder="ex: Option 1 - Site Wix autonome" className="w-full bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-2xl px-4 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-2">Description courte</label>
                        <textarea value={opt.description} onChange={e => updateOption(i, { description: e.target.value })} rows={2} placeholder="Resume de l'option..." className="w-full bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-2xl px-4 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 resize-none" />
                      </div>

                      <div>
                        <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-2">Investissement initial ($)</label>
                        <input type="number" min="0" step="0.01" value={opt.prix_setup} onChange={e => updateOption(i, { prix_setup: e.target.value })} placeholder="0.00" className="w-full bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-2xl px-4 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30" />
                        {parseFloat(opt.prix_setup) > 0 && (
                          <p className="text-xs text-[var(--color-dark-text-2)] mt-1 font-body">
                            TPS {tx.tps} $ + TVQ {tx.tvq} $ = <strong>{tx.total} $</strong> TTC
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-2">Abonnement mensuel ($)</label>
                        <input type="number" min="0" step="0.01" value={opt.prix_mensuel} onChange={e => updateOption(i, { prix_mensuel: e.target.value })} placeholder="0.00" className="w-full bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-2xl px-4 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30" />
                      </div>

                      <div>
                        <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-2">Taux horaire ($)</label>
                        <input type="number" min="0" step="0.01" value={opt.prix_horaire} onChange={e => updateOption(i, { prix_horaire: e.target.value })} placeholder="0.00" className="w-full bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-2xl px-4 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30" />
                      </div>

                      <div>
                        <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-2">Délai de réalisation</label>
                        <input type="text" value={opt.delai_livraison} onChange={e => updateOption(i, { delai_livraison: e.target.value })} placeholder="ex: 3 semaines" className="w-full bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-2xl px-4 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30" />
                      </div>

                      <div>
                        <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-2">Modalités de paiement</label>
                        <input type="text" value={opt.conditions_paiement} onChange={e => updateOption(i, { conditions_paiement: e.target.value })} placeholder="ex: 100 % a mi-mandat" className="w-full bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-2xl px-4 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30" />
                      </div>

                      <div>
                        <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-2">Mention distinctive</label>
                        <input type="text" value={opt.badge_texte} onChange={e => updateOption(i, { badge_texte: e.target.value })} placeholder="ex: IDEAL FINANCEMENT" className="w-full bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-2xl px-4 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30" />
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`rec-${i}`}
                          checked={opt.est_recommande}
                          onChange={e => updateOption(i, { est_recommande: e.target.checked })}
                          className="w-4 h-4 rounded accent-[var(--color-brand)]"
                        />
                        <label htmlFor={`rec-${i}`} className="font-body text-sm text-[var(--color-dark-1)] cursor-pointer">
                          Désigner comme recommandé
                        </label>
                      </div>
                    </div>

                    {/* Features tableau comparatif */}
                    <SubSection title="Tableau comparatif — features incluses" icon="table_chart">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {FEATURE_LABELS.map(f => (
                          <label key={f.key} className="flex items-center justify-between gap-3 bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-xl px-4 py-3 cursor-pointer hover:border-[var(--color-brand)]/40 transition-colors">
                            <span className="font-body text-sm text-[var(--color-dark-1)]">{f.label}</span>
                            <button
                              type="button"
                              onClick={() => updateOption(i, { features: { ...opt.features, [f.key]: !opt.features[f.key] } })}
                              className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${opt.features[f.key] ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-light-border-2)]'}`}
                              aria-pressed={opt.features[f.key]}
                            >
                              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${opt.features[f.key] ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                          </label>
                        ))}
                      </div>
                    </SubSection>

                    {/* Ce qui est inclus */}
                    <SubSection title="Prestations incluses" icon="check_circle">
                      <PasteZone
                        placeholder={"Developpement du chatbot IA\nIntegration Stripe\nFormation 2h\n..."}
                        value={pasteBuf[`${i}-inclus`] ?? ''}
                        onChange={v => setPasteBuf(prev => ({ ...prev, [`${i}-inclus`]: v }))}
                        onImport={() => {
                          const lines = (pasteBuf[`${i}-inclus`] ?? '').split('\n').map(l => l.trim()).filter(Boolean)
                          updateOption(i, { inclus: lines.length ? lines : [''] })
                          setPasteBuf(prev => ({ ...prev, [`${i}-inclus`]: '' }))
                        }}
                      />
                      {opt.inclus.map((line, li) => (
                        <div key={li} className="flex gap-2">
                          <input
                            type="text"
                            value={line}
                            onChange={e => {
                              const arr = [...opt.inclus]; arr[li] = e.target.value
                              updateOption(i, { inclus: arr })
                            }}
                            placeholder={`Inclus ${li + 1}...`}
                            className="flex-1 bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-xl px-3 py-2 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
                          />
                          <button type="button" onClick={() => {
                            const arr = opt.inclus.filter((_, idx) => idx !== li)
                            updateOption(i, { inclus: arr.length ? arr : [''] })
                          }} className="p-1.5 rounded-full hover:bg-red-50 text-[var(--color-dark-text-2)] hover:text-red-600">
                            <span aria-hidden="true" className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ))}
                      <AddBtn onClick={() => updateOption(i, { inclus: [...opt.inclus, ''] })} label="Ajouter une ligne" />
                    </SubSection>

                    {/* Couts tiers */}
                    <SubSection title="Frais de services tiers mensuels" icon="receipt_long">
                      <PasteZone
                        placeholder={"Hebergement VPS / 57.47$/mois\nBunny.net / ~10$/mois / CDN\nOpenAI / ~20$/mois"}
                        value={pasteBuf[`${i}-couts_tiers`] ?? ''}
                        onChange={v => setPasteBuf(prev => ({ ...prev, [`${i}-couts_tiers`]: v }))}
                        onImport={() => {
                          const lines = (pasteBuf[`${i}-couts_tiers`] ?? '').split('\n').map(l => l.trim()).filter(Boolean)
                          const parsed = lines.map(l => {
                            const parts = l.split('/').map(p => p.trim())
                            return { service: parts[0] ?? '', cout: parts[1] ?? '', note: parts[2] ?? '' }
                          })
                          updateOption(i, { couts_tiers: parsed.length ? parsed : [{ service: '', cout: '', note: '' }] })
                          setPasteBuf(prev => ({ ...prev, [`${i}-couts_tiers`]: '' }))
                        }}
                      />
                      {opt.couts_tiers.map((c, ci) => (
                        <div key={ci} className="grid grid-cols-3 gap-2">
                          <input type="text" value={c.service || ''} onChange={e => {
                            const arr = [...opt.couts_tiers]; arr[ci] = { ...arr[ci], service: e.target.value }
                            updateOption(i, { couts_tiers: arr })
                          }} placeholder="Service" className="bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-xl px-3 py-2 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30" />
                          <input type="text" value={c.cout} onChange={e => {
                            const arr = [...opt.couts_tiers]; arr[ci] = { ...arr[ci], cout: e.target.value }
                            updateOption(i, { couts_tiers: arr })
                          }} placeholder="Cout ($/mois)" className="bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-xl px-3 py-2 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30" />
                          <div className="flex gap-1">
                            <input type="text" value={c.note || ''} onChange={e => {
                              const arr = [...opt.couts_tiers]; arr[ci] = { ...arr[ci], note: e.target.value }
                              updateOption(i, { couts_tiers: arr })
                            }} placeholder="Note" className="flex-1 bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-xl px-3 py-2 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30" />
                            <button type="button" onClick={() => {
                              const arr = opt.couts_tiers.filter((_, idx) => idx !== ci)
                              updateOption(i, { couts_tiers: arr.length ? arr : [{ service: '', cout: '', note: '' }] })
                            }} className="p-1.5 rounded-full hover:bg-red-50 text-[var(--color-dark-text-2)] hover:text-red-600">
                              <span aria-hidden="true" className="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>
                        </div>
                      ))}
                      <AddBtn onClick={() => updateOption(i, { couts_tiers: [...opt.couts_tiers, { service: '', cout: '', note: '' }] })} label="Ajouter un cout tiers" />
                    </SubSection>

                    {/* Couts supplementaires */}
                    <SubSection title="Extras possibles" icon="warning">
                      <PasteZone
                        placeholder={"Revisions supplementaires / 75$/h\nContenu additionnel / 150$\nIntegration tierce / sur devis"}
                        value={pasteBuf[`${i}-couts_sup`] ?? ''}
                        onChange={v => setPasteBuf(prev => ({ ...prev, [`${i}-couts_sup`]: v }))}
                        onImport={() => {
                          const lines = (pasteBuf[`${i}-couts_sup`] ?? '').split('\n').map(l => l.trim()).filter(Boolean)
                          const parsed = lines.map(l => {
                            const parts = l.split('/').map(p => p.trim())
                            return { situation: parts[0] ?? '', cout: parts[1] ?? '' }
                          })
                          updateOption(i, { couts_supplementaires: parsed.length ? parsed : [{ situation: '', cout: '' }] })
                          setPasteBuf(prev => ({ ...prev, [`${i}-couts_sup`]: '' }))
                        }}
                      />
                      {opt.couts_supplementaires.map((c, ci) => (
                        <div key={ci} className="flex gap-2">
                          <input type="text" value={c.situation || ''} onChange={e => {
                            const arr = [...opt.couts_supplementaires]; arr[ci] = { ...arr[ci], situation: e.target.value }
                            updateOption(i, { couts_supplementaires: arr })
                          }} placeholder="Situation" className="flex-1 bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-xl px-3 py-2 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30" />
                          <input type="text" value={c.cout} onChange={e => {
                            const arr = [...opt.couts_supplementaires]; arr[ci] = { ...arr[ci], cout: e.target.value }
                            updateOption(i, { couts_supplementaires: arr })
                          }} placeholder="Cout" className="w-32 bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-xl px-3 py-2 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30" />
                          <button type="button" onClick={() => {
                            const arr = opt.couts_supplementaires.filter((_, idx) => idx !== ci)
                            updateOption(i, { couts_supplementaires: arr.length ? arr : [{ situation: '', cout: '' }] })
                          }} className="p-1.5 rounded-full hover:bg-red-50 text-[var(--color-dark-text-2)] hover:text-red-600">
                            <span aria-hidden="true" className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ))}
                      <AddBtn onClick={() => updateOption(i, { couts_supplementaires: [...opt.couts_supplementaires, { situation: '', cout: '' }] })} label="Ajouter un cas" />
                    </SubSection>

                    {/* Scenarios */}
                    <SubSection title="Projections mensuelles" icon="bar_chart">
                      <PasteZone
                        placeholder={"Titre : Lancement (0-50 clients)\nHebergement VPS / 57.47$/mois\nOpenAI / ~20$/mois\n\nTitre : Croissance (50-200 clients)\n..."}
                        value={pasteBuf[`${i}-scenarios`] ?? ''}
                        onChange={v => setPasteBuf(prev => ({ ...prev, [`${i}-scenarios`]: v }))}
                        onImport={() => {
                          const parsed = parseScenariosPaste(pasteBuf[`${i}-scenarios`] ?? '')
                          updateOption(i, { scenarios: parsed })
                          setPasteBuf(prev => ({ ...prev, [`${i}-scenarios`]: '' }))
                        }}
                      />

                      {opt.scenarios.map((sc, si) => (
                        <div key={si} className="border border-[var(--color-light-border-2)] rounded-2xl p-4 flex flex-col gap-2">
                          <div className="flex gap-2">
                            <input type="text" value={sc.titre} onChange={e => {
                              const arr = [...opt.scenarios]; arr[si] = { ...arr[si], titre: e.target.value }
                              updateOption(i, { scenarios: arr })
                            }} placeholder="Titre du scenario (ex: Lancement)" className="flex-1 bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-xl px-3 py-2 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 font-bold" />
                            <button type="button" onClick={() => {
                              const arr = opt.scenarios.filter((_, idx) => idx !== si)
                              updateOption(i, { scenarios: arr.length ? arr : [{ titre: '', lignes: [''] }] })
                            }} className="p-1.5 rounded-full hover:bg-red-50 text-[var(--color-dark-text-2)] hover:text-red-600">
                              <span aria-hidden="true" className="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>
                          {sc.lignes.map((l, li) => (
                            <div key={li} className="flex gap-2 pl-2">
                              <input type="text" value={l} onChange={e => {
                                const arr = [...opt.scenarios]
                                const lignes = [...arr[si].lignes]; lignes[li] = e.target.value
                                arr[si] = { ...arr[si], lignes }
                                updateOption(i, { scenarios: arr })
                              }} placeholder="Ligne du scenario..." className="flex-1 bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-xl px-3 py-2 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30" />
                              <button type="button" onClick={() => {
                                const arr = [...opt.scenarios]
                                const lignes = arr[si].lignes.filter((_, idx) => idx !== li)
                                arr[si] = { ...arr[si], lignes: lignes.length ? lignes : [''] }
                                updateOption(i, { scenarios: arr })
                              }} className="p-1.5 rounded-full hover:bg-red-50 text-[var(--color-dark-text-2)] hover:text-red-600">
                                <span aria-hidden="true" className="material-symbols-outlined text-sm">close</span>
                              </button>
                            </div>
                          ))}
                          <button type="button" onClick={() => {
                            const arr = [...opt.scenarios]
                            arr[si] = { ...arr[si], lignes: [...arr[si].lignes, ''] }
                            updateOption(i, { scenarios: arr })
                          }} className="text-xs text-[var(--color-brand)] font-bold font-body self-start hover:underline ml-2">
                            + Ajouter une ligne
                          </button>
                        </div>
                      ))}
                      <AddBtn onClick={() => updateOption(i, { scenarios: [...opt.scenarios, { titre: '', lignes: [''] }] })} label="Ajouter un scenario" />
                    </SubSection>

                  </div>
                )}
              </div>
            )
          })}
        </section>

        {/* Bouton envoi */}
        <div className="flex justify-end pb-8">
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center gap-3 bg-[var(--color-brand)] text-white px-8 py-4 rounded-full font-display text-base uppercase tracking-widest hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-60 shadow-lg"
          >
            {sending ? (
              <>
                <span aria-hidden="true" className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                Envoi en cours...
              </>
            ) : (
              <>
                <span aria-hidden="true" className="material-symbols-outlined text-lg">send</span>
                Transmettre la proposition
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  )
}

function parseScenariosPaste(text: string): Scenario[] {
  const result: Scenario[] = []
  let current: Scenario | null = null
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const m = line.match(/^Titre\s*:\s*(.+)$/i)
    if (m) {
      if (current) result.push(current)
      current = { titre: m[1].trim(), lignes: [] }
    } else if (current) {
      current.lignes.push(line)
    }
  }
  if (current) result.push(current)
  return result.length ? result : [{ titre: '', lignes: [''] }]
}

function PasteZone({ placeholder, value, onChange, onImport }: {
  placeholder: string
  value: string
  onChange: (v: string) => void
  onImport: () => void
}) {
  return (
    <div className="bg-[var(--color-light-0)] border border-dashed border-[var(--color-light-border-2)] rounded-2xl p-4 flex flex-col gap-2">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={4}
        placeholder={placeholder}
        className="w-full bg-white border border-[var(--color-light-border-2)] rounded-xl px-3 py-2 font-body text-xs text-[var(--color-dark-1)] outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 resize-y"
      />
      <button
        type="button"
        disabled={!value.trim()}
        onClick={onImport}
        className="self-start inline-flex items-center gap-2 bg-[var(--color-brand)] text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-40"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-sm">auto_fix_high</span>
        Importer
      </button>
    </div>
  )
}

function SubSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] flex items-center gap-2">
        <span aria-hidden="true" className="material-symbols-outlined text-sm text-[var(--color-brand)]">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  )
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start text-xs text-[var(--color-brand)] font-bold font-body hover:underline flex items-center gap-1"
    >
      <span aria-hidden="true" className="material-symbols-outlined text-sm">add</span>
      {label}
    </button>
  )
}
