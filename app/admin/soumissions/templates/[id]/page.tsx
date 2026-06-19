'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

interface TemplateOption {
  id: number
  nom: string
  description: string | null
  prix_setup: number
  prix_mensuel: number
  prix_horaire: number
  delai_livraison: string | null
  conditions_paiement: string | null
  badge_texte: string | null
  est_recommande: number
  ordre: number
  features_json: string
  inclus_json: string
  couts_tiers_json: string
  couts_supplementaires_json: string
  scenarios_json: string
  rachat_disponible: number
  prix_rachat: number
  inclus_rachat_json: string
}

interface Template {
  id: number
  nom: string
  description: string | null
  message_intro_template: string | null
  titre_template: string
  est_actif: number
  options: TemplateOption[]
}

interface CoutTiers { nom?: string; montant?: number | string; periodicite?: string }
interface CoutSup   { nom?: string; montant?: number | string; note?: string }
interface Scenario  { titre?: string; description?: string; prix_total?: number | string }

function safeJson<T>(raw: string | null, fallback: T): T {
  try { return JSON.parse(raw || '') ?? fallback } catch { return fallback }
}

export default function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()

  const [tpl, setTpl]           = useState<Template | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null)
  const [expandedOpt, setExpandedOpt] = useState<number | null>(null)

  // Template-level edit state
  const [nom, setNom]                 = useState('')
  const [description, setDescription] = useState('')
  const [titreTemplate, setTitreTemplate]   = useState('')
  const [messageIntro, setMessageIntro]     = useState('')
  const [estActif, setEstActif]             = useState(true)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/admin/soumissions/templates/${id}`, { credentials: 'include' })
      if (!res.ok) { router.push('/admin/soumissions/templates'); return }
      const data: Template = await res.json()
      setTpl(data)
      setNom(data.nom)
      setDescription(data.description ?? '')
      setTitreTemplate(data.titre_template)
      setMessageIntro(data.message_intro_template ?? '')
      setEstActif(Boolean(data.est_actif))
    } catch {
      showToast('Impossible de charger le modèle', false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function saveTemplate() {
    if (!nom.trim()) { showToast('Le nom est requis', false); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/v1/admin/soumissions/templates/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: nom.trim(),
          description: description.trim() || null,
          titre_template: titreTemplate.trim(),
          message_intro_template: messageIntro.trim() || null,
          est_actif: estActif,
        }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Erreur', false); return }
      showToast('Modèle sauvegardé')
      await load()
    } catch {
      showToast('Erreur de connexion', false)
    } finally {
      setSaving(false)
    }
  }

  async function addOption() {
    try {
      const res = await fetch(`/api/v1/admin/soumissions/templates/${id}/options`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: 'Nouvelle section tarifaire', ordre: (tpl?.options.length ?? 0) + 1 }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Erreur', false); return }
      await load()
      setExpandedOpt(data.id)
    } catch {
      showToast('Erreur de connexion', false)
    }
  }

  async function deleteOption(optId: number, optNom: string) {
    if (!confirm(`Supprimer l'option "${optNom}" ?`)) return
    try {
      const res = await fetch(`/api/v1/admin/soumissions/templates/${id}/options/${optId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) { showToast('Erreur lors de la suppression', false); return }
      showToast('Section tarifaire retirée')
      await load()
      if (expandedOpt === optId) setExpandedOpt(null)
    } catch {
      showToast('Erreur de connexion', false)
    }
  }

  if (loading) {
    return <div className="p-12 text-center font-body text-sm text-[var(--color-dark-text-2)]">Chargement...</div>
  }

  if (!tpl) return null

  return (
    <div className="max-w-3xl mx-auto">
      {toast && (
        <div role="status" aria-live="polite" className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-3 ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => router.push('/admin/soumissions/templates')} className="p-2 rounded-full hover:bg-[var(--color-light-0)] transition-colors">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-dark-text-2)]">arrow_back</span>
        </button>
        <div>
          <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] uppercase tracking-tight leading-none">
            {tpl.nom}
          </h1>
          <p className="text-[var(--color-dark-text-2)] font-body text-sm mt-1">
            Modèle de proposition
          </p>
        </div>
      </div>

      {/* Template settings */}
      <section className="bg-white rounded-3xl shadow-sm p-8 mb-8">
        <h2 className="font-display text-lg uppercase tracking-wide text-[var(--color-dark-1)] mb-6 flex items-center gap-2">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]">settings</span>
          Paramètres du modèle
        </h2>
        <div className="flex flex-col gap-5">
          <div>
            <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-2">Nom *</label>
            <input
              type="text"
              value={nom}
              onChange={e => setNom(e.target.value)}
              className="w-full bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-2xl px-4 py-3 font-body text-sm text-[var(--color-dark-1)] outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
            />
          </div>
          <div>
            <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description courte (facultatif)"
              className="w-full bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-2xl px-4 py-3 font-body text-sm text-[var(--color-dark-1)] outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
            />
          </div>
          <div>
            <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-2">
              Titre (variables: {'{nom_entreprise}'}, {'{nom_complet}'})
            </label>
            <input
              type="text"
              value={titreTemplate}
              onChange={e => setTitreTemplate(e.target.value)}
              className="w-full bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-2xl px-4 py-3 font-body text-sm text-[var(--color-dark-1)] outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
            />
          </div>
          <div>
            <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-2">Message d'intro</label>
            <textarea
              value={messageIntro}
              onChange={e => setMessageIntro(e.target.value)}
              rows={4}
              placeholder="Bonjour {nom_complet}, ..."
              className="w-full bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-2xl px-4 py-3 font-body text-sm text-[var(--color-dark-1)] outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="est-actif"
              checked={estActif}
              onChange={e => setEstActif(e.target.checked)}
              className="w-4 h-4 accent-[#e83b14]"
            />
            <label htmlFor="est-actif" className="font-body text-sm text-[var(--color-dark-1)] cursor-pointer">
              Modèle actif (visible lors de la création d'une proposition)
            </label>
          </div>
          <div className="flex justify-end">
            <button
              onClick={saveTemplate}
              disabled={saving}
              style={{
                background: saving ? '#ccc' : '#e83b14',
                color: 'white',
                border: 'none',
                borderRadius: 999,
                padding: '10px 28px',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.85rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </section>

      {/* Options */}
      <section className="bg-white rounded-3xl shadow-sm overflow-hidden mb-8">
        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--color-light-border)]">
          <h2 className="font-display text-lg uppercase tracking-wide text-[var(--color-dark-1)] flex items-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]">list_alt</span>
            Sections tarifaires ({tpl.options.length})
          </h2>
          <button
            onClick={addOption}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              color: '#e83b14',
              outline: '2px solid #e83b14',
              borderRadius: 999,
              padding: '6px 16px',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            Ajouter une section
          </button>
        </div>

        {tpl.options.length === 0 ? (
          <div className="p-12 text-center font-body text-sm text-[var(--color-dark-text-2)]">
            Aucune section tarifaire. Cliquez sur Ajouter pour commencer.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-light-border)]">
            {tpl.options.map(opt => (
              <li key={opt.id}>
                <OptionEditor
                  opt={opt}
                  templateId={Number(id)}
                  expanded={expandedOpt === opt.id}
                  onToggle={() => setExpandedOpt(prev => prev === opt.id ? null : opt.id)}
                  onSaved={load}
                  onDelete={() => deleteOption(opt.id, opt.nom)}
                  showToast={showToast}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function OptionEditor({
  opt, templateId, expanded, onToggle, onSaved, onDelete, showToast,
}: {
  opt: TemplateOption
  templateId: number
  expanded: boolean
  onToggle: () => void
  onSaved: () => Promise<void>
  onDelete: () => void
  showToast: (msg: string, ok?: boolean) => void
}) {
  const [saving, setSaving] = useState(false)

  // Scalar fields
  const [nom, setNom]                     = useState(opt.nom)
  const [description, setDescription]     = useState(opt.description ?? '')
  const [prixSetup, setPrixSetup]         = useState(String(opt.prix_setup ?? ''))
  const [prixMensuel, setPrixMensuel]     = useState(String(opt.prix_mensuel ?? ''))
  const [prixHoraire, setPrixHoraire]     = useState(String(opt.prix_horaire ?? ''))
  const [delai, setDelai]                 = useState(opt.delai_livraison ?? '')
  const [conditions, setConditions]       = useState(opt.conditions_paiement ?? '')
  const [badgeTexte, setBadgeTexte]       = useState(opt.badge_texte ?? '')
  const [estRecommande, setEstRecommande] = useState(Boolean(opt.est_recommande))
  const [ordre, setOrdre]                 = useState(String(opt.ordre))
  const [rachatDispo, setRachatDispo]     = useState(Boolean(opt.rachat_disponible))
  const [prixRachat, setPrixRachat]       = useState(String(opt.prix_rachat ?? ''))

  // JSON fields as raw text (admins can paste JSON directly)
  const [inclus, setInclus]               = useState(formatJson(opt.inclus_json))
  const [rachatInclus, setRachatInclus]   = useState(formatJson(opt.inclus_rachat_json))
  const [coutsTiers, setCoutsTiers]       = useState(formatJson(opt.couts_tiers_json))
  const [coutsSupp, setCoutsSupp]         = useState(formatJson(opt.couts_supplementaires_json))
  const [scenarios, setScenarios]         = useState(formatJson(opt.scenarios_json))
  const [features, setFeatures]           = useState(formatJson(opt.features_json))

  async function save() {
    if (!nom.trim()) { showToast('Le nom est requis', false); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/v1/admin/soumissions/templates/${templateId}/options/${opt.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: nom.trim(),
          description: description.trim() || null,
          prix_setup: parseFloat(prixSetup) || 0,
          prix_mensuel: parseFloat(prixMensuel) || 0,
          prix_horaire: parseFloat(prixHoraire) || 0,
          delai_livraison: delai.trim() || null,
          conditions_paiement: conditions.trim() || null,
          badge_texte: badgeTexte.trim() || null,
          est_recommande: estRecommande,
          ordre: parseInt(ordre) || 0,
          rachat_disponible: rachatDispo,
          prix_rachat: parseFloat(prixRachat) || 0,
          inclus_json: inclus,
          inclus_rachat_json: rachatInclus,
          couts_tiers_json: coutsTiers,
          couts_supplementaires_json: coutsSupp,
          scenarios_json: scenarios,
          features_json: features,
        }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Erreur', false); return }
      showToast('Section sauvegardée')
      await onSaved()
    } catch {
      showToast('Erreur de connexion', false)
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-xl px-3 py-2 font-body text-sm text-[var(--color-dark-1)] outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
  const textareaCls = "w-full bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] rounded-xl px-3 py-2 font-body text-xs text-[var(--color-dark-1)] outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 resize-none font-mono"

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center gap-3 px-6 py-4">
        <button onClick={onToggle} className="flex-1 flex items-center gap-3 text-left min-w-0">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-dark-text-2)] shrink-0" style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'none' }}>
            chevron_right
          </span>
          <div className="min-w-0">
            <span className="font-display text-sm uppercase tracking-wide text-[var(--color-dark-1)]">{opt.nom}</span>
            <span className="ml-3 font-body text-xs text-[var(--color-dark-text-2)]">
              {opt.prix_setup > 0 ? `${opt.prix_setup.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })} setup` : ''}
              {opt.prix_mensuel > 0 ? ` / ${opt.prix_mensuel.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}/mois` : ''}
            </span>
            {opt.est_recommande ? (
              <span style={{ marginLeft: 8, background: '#e83b14', color: 'white', borderRadius: 999, padding: '1px 8px', fontSize: '0.65rem', fontFamily: 'var(--font-body)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Recommandé
              </span>
            ) : null}
          </div>
        </button>
        <button
          onClick={onDelete}
          aria-label={`Supprimer ${opt.nom}`}
          style={{ background: 'transparent', border: 'none', color: 'var(--color-dark-text-2)', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex' }}
        >
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
        </button>
      </div>

      {expanded && (
        <div className="px-6 pb-6 flex flex-col gap-5 border-t border-[var(--color-light-border)] pt-5 bg-[var(--color-light-0)]">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1">Nom *</label>
              <input type="text" value={nom} onChange={e => setNom(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1">Ordre</label>
              <input type="number" value={ordre} onChange={e => setOrdre(e.target.value)} min={0} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className={inputCls + ' resize-none'} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1">Investissement initial ($)</label>
              <input type="number" value={prixSetup} onChange={e => setPrixSetup(e.target.value)} min={0} step={0.01} className={inputCls} />
            </div>
            <div>
              <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1">Abonnement mensuel ($)</label>
              <input type="number" value={prixMensuel} onChange={e => setPrixMensuel(e.target.value)} min={0} step={0.01} className={inputCls} />
            </div>
            <div>
              <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1">Taux horaire ($)</label>
              <input type="number" value={prixHoraire} onChange={e => setPrixHoraire(e.target.value)} min={0} step={0.01} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1">Délai de réalisation</label>
              <input type="text" value={delai} onChange={e => setDelai(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1">Modalités de paiement</label>
              <input type="text" value={conditions} onChange={e => setConditions(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1">Mention distinctive</label>
              <input type="text" value={badgeTexte} onChange={e => setBadgeTexte(e.target.value)} placeholder="ex: Populaire" className={inputCls} />
            </div>
            <div className="flex flex-col justify-end gap-2 pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={estRecommande} onChange={e => setEstRecommande(e.target.checked)} className="w-4 h-4 accent-[#e83b14]" />
                <span className="font-body text-sm text-[var(--color-dark-1)]">Désigner comme recommandé</span>
              </label>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--color-light-border)' }} />

          <div>
            <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1">
              Inclus (JSON array de strings)
            </label>
            <textarea value={inclus} onChange={e => setInclus(e.target.value)} rows={4} className={textareaCls} />
          </div>

          <div>
            <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1">
              Features (JSON objet cle: valeur)
            </label>
            <textarea value={features} onChange={e => setFeatures(e.target.value)} rows={4} className={textareaCls} />
          </div>

          <div>
            <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1">
              Couts tiers (JSON array: [{'{nom, montant, periodicite}'}])
            </label>
            <textarea value={coutsTiers} onChange={e => setCoutsTiers(e.target.value)} rows={4} className={textareaCls} />
          </div>

          <div>
            <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1">
              Couts supplementaires (JSON array: [{'{nom, montant, note}'}])
            </label>
            <textarea value={coutsSupp} onChange={e => setCoutsSupp(e.target.value)} rows={3} className={textareaCls} />
          </div>

          <div>
            <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1">
              Scenarios (JSON array: [{'{titre, description, prix_total}'}])
            </label>
            <textarea value={scenarios} onChange={e => setScenarios(e.target.value)} rows={4} className={textareaCls} />
          </div>

          <div style={{ height: 1, background: 'var(--color-light-border)' }} />

          <div className="flex items-center gap-3">
            <input type="checkbox" id={`rachat-${opt.id}`} checked={rachatDispo} onChange={e => setRachatDispo(e.target.checked)} className="w-4 h-4 accent-[#e83b14]" />
            <label htmlFor={`rachat-${opt.id}`} className="font-body text-sm text-[var(--color-dark-1)] cursor-pointer">Rachat disponible</label>
          </div>

          {rachatDispo && (
            <>
              <div>
                <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1">Prix de rachat ($)</label>
                <input type="number" value={prixRachat} onChange={e => setPrixRachat(e.target.value)} min={0} step={0.01} className={inputCls} />
              </div>
              <div>
                <label className="block font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1">
                  Inclus au rachat (JSON array de strings)
                </label>
                <textarea value={rachatInclus} onChange={e => setRachatInclus(e.target.value)} rows={3} className={textareaCls} />
              </div>
            </>
          )}

          <div className="flex justify-end">
            <button
              onClick={save}
              disabled={saving}
              style={{
                background: saving ? '#ccc' : '#e83b14',
                color: 'white',
                border: 'none',
                borderRadius: 999,
                padding: '10px 28px',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.85rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder cette section'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function formatJson(raw: string | null): string {
  try {
    return JSON.stringify(JSON.parse(raw || 'null'), null, 2)
  } catch {
    return raw ?? ''
  }
}
