'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const STATUT_MANDAT: Record<string, { bg: string; text: string; label: string }> = {
  'en_attente': { bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)', label: 'En attente' },
  'en_cours':   { bg: 'var(--color-warning-bg)', text: 'var(--color-warning-text)', label: 'En cours' },
  'remis':      { bg: 'var(--color-info-bg)', text: 'var(--color-info-text)', label: 'Remis' },
  'approuvé':   { bg: 'var(--color-success-bg)', text: 'var(--color-success-text)', label: 'Approuvé' },
  'annulé':     { bg: 'var(--color-error-bg)', text: 'var(--color-error-text)', label: 'Annulé' },
}

// Cohérent avec le token spec du handoff : Approuvée = vert, Payée = bleu (info), Soumise = ambre
const STATUT_FACTURE: Record<string, { bg: string; text: string; label: string }> = {
  'brouillon': { bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)', label: 'Brouillon' },
  'soumise':   { bg: 'var(--color-warning-bg)', text: 'var(--color-warning-text)', label: 'Soumise' },
  'approuvée': { bg: 'var(--color-success-bg)', text: 'var(--color-success-text)', label: 'Approuvée' },
  'payée':     { bg: 'var(--color-info-bg)', text: 'var(--color-info-text)', label: 'Payée' },
}

const SOCIAL_GROUPS = [
  { label: 'Cocktail Média', ids: ['T01','T02','T03','T04','T05','T06','T07'],
    names: ['Annonce Service','Promo Forfait','LinkedIn Texte','Before/After','Update CocktailOS','Témoignage','Story/Reel'] },
  { label: 'Royal de Shawinigan', ids: ['R01','R02','R03','R04','R05'],
    names: ['Soir de match','Joueuse','Résultat','Horaire','Multi-résultats'] },
  { label: 'Templates généraux', ids: ['G1A','G1B','G2A','G2B','G3A','G3B','G4A','G4B','G5A','G5B'],
    names: ['Événement A','Événement B','Promo A','Promo B','Citation A','Citation B','Horaire A','Horaire B','Avant/Après A','Avant/Après B'] },
]
const PDF_TEMPLATES = [
  { id: 'business', label: 'Plan d\'affaires' },
  { id: 'pigiste',  label: 'Programme pigiste' },
]

const inputCls = "w-full bg-[var(--color-light-0)] border-none rounded-xl px-3 py-2.5 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40"

// Chip d'outil : actif = contour + fond brand-soft + texte brand ; inactif = neutre
const chipCls = (on: boolean) =>
  `px-3 py-1.5 rounded-full text-xs font-bold font-body transition-colors border ${
    on
      ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)] text-[var(--color-brand)]'
      : 'border-[var(--color-light-border)] bg-[var(--color-light-0)] text-[var(--color-dark-text-2)] hover:border-[var(--color-brand)]'
  }`

interface Mandat { id: number; titre: string; statut: string; date_echeance: string; montant_convenu: number; nom_projet: string }
interface Facture { id: number; numero: string; statut: string; montant_total: number; date_emission: string }
interface Pigiste { id: number; nom_complet: string; email: string; telephone: string; adresse: string; ville: string; province: string; code_postal: string; numero_tps: string; numero_tvq: string; is_active: boolean; mandats: Mandat[]; factures: Facture[] }
interface ToolsConfig { social: string[] | null; pdf: string[] | null }

export default function AdminPigisteDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [pigiste, setPigiste] = useState<Pigiste | null>(null)
  const [showMandat, setShowMandat] = useState(false)
  const [mandatForm, setMandatForm] = useState({ titre: '', description: '', id_projet: '', date_debut: '', date_echeance: '', type_prestation: '', quantite: '1', notes_admin: '' })
  const [projets, setProjets] = useState<{ id: number; nom_projet: string }[]>([])
  const [tarifs, setTarifs] = useState<{ id: string; categorie: string; label: string; prix: number; unite: string }[]>([])
  const [savingMandat, setSavingMandat] = useState(false)
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [payingId, setPayingId] = useState<number | null>(null)
  const [togglingActif, setTogglingActif] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const [tools, setTools] = useState<ToolsConfig>({ social: null, pdf: null })
  const [toolsSaving, setToolsSaving] = useState(false)

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500) }

  const load = () => fetch(`/api/v1/admin/pigistes/${id}`, { credentials: 'include' })
    .then(r => { if (!r.ok) { router.push('/admin/pigistes'); return null } return r.json() })
    .then(data => { if (data) setPigiste({ ...data, mandats: data.mandats ?? [], factures: data.factures ?? [] }) })
    .catch(() => router.push('/admin/pigistes'))

  const loadTools = () => fetch(`/api/v1/admin/pigistes/${id}/tools`, { credentials: 'include' })
    .then(r => r.ok ? r.json() : null)
    .then(data => { if (data) setTools({ social: data.social ?? null, pdf: data.pdf ?? null }) })
    .catch(() => {})

  useEffect(() => {
    load()
    loadTools()
    fetch('/api/v1/admin/projets', { credentials: 'include' }).then(r => r.json()).then(data => setProjets(Array.isArray(data) ? data : [])).catch(() => {})
    fetch('/api/v1/admin/tarifs-pigiste', { credentials: 'include' }).then(r => r.json()).then(data => setTarifs(Array.isArray(data) ? data : [])).catch(() => {})
  }, [id])

  const handleToggleActif = async () => {
    if (!pigiste) return
    setTogglingActif(true)
    try {
      const res = await fetch(`/api/v1/admin/pigistes/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !pigiste.is_active }),
      })
      if (res.ok) { showToast(pigiste.is_active ? 'Pigiste désactivé.' : 'Pigiste activé.'); load() }
      else showToast('Erreur lors du changement de statut', false)
    } catch { showToast('Erreur de connexion', false) }
    finally { setTogglingActif(false) }
  }

  const saveTools = async () => {
    setToolsSaving(true)
    try {
      const res = await fetch(`/api/v1/admin/pigistes/${id}/tools`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tools),
      })
      if (res.ok) showToast('Accès aux outils sauvegardé.')
      else showToast('Erreur sauvegarde', false)
    } catch { showToast('Erreur de connexion', false) }
    finally { setToolsSaving(false) }
  }

  const toggleId = (field: 'social' | 'pdf', templateId: string) => {
    setTools(prev => {
      const allIds = field === 'social'
        ? SOCIAL_GROUPS.flatMap(g => g.ids)
        : PDF_TEMPLATES.map(t => t.id)
      const current = prev[field] ?? allIds
      const next = current.includes(templateId)
        ? current.filter(x => x !== templateId)
        : [...current, templateId]
      return { ...prev, [field]: next }
    })
  }

  const setGroupAll = (groupIds: string[], field: 'social' | 'pdf', all: boolean) => {
    setTools(prev => {
      const allIds = field === 'social'
        ? SOCIAL_GROUPS.flatMap(g => g.ids)
        : PDF_TEMPLATES.map(t => t.id)
      const base = prev[field] ?? allIds
      const next = all
        ? [...new Set([...base, ...groupIds])]
        : base.filter(x => !groupIds.includes(x))
      return { ...prev, [field]: next.length === allIds.length ? null : next }
    })
  }

  const handleCreateMandat = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingMandat(true)
    try {
      const res = await fetch('/api/v1/admin/mandats-pigistes', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pigiste:      Number(id),
          titre:           mandatForm.titre,
          description:     mandatForm.description || null,
          id_projet:       mandatForm.id_projet ? Number(mandatForm.id_projet) : null,
          date_debut:      mandatForm.date_debut || null,
          date_echeance:   mandatForm.date_echeance || null,
          type_prestation: mandatForm.type_prestation || null,
          quantite:        parseInt(mandatForm.quantite) || 1,
          notes_admin:     mandatForm.notes_admin || null,
        }),
      })
      if (res.ok) {
        showToast('Mandat créé.')
        setShowMandat(false)
        setMandatForm({ titre: '', description: '', id_projet: '', date_debut: '', date_echeance: '', type_prestation: '', quantite: '1', notes_admin: '' })
        load()
      } else showToast('Erreur création', false)
    } catch { showToast('Erreur de connexion', false) }
    finally { setSavingMandat(false) }
  }

  const handleApprouverMandat = async (mandatId: number) => {
    setApprovingId(mandatId)
    try {
      const res = await fetch(`/api/v1/admin/mandats-pigistes/${mandatId}/approuver`, { method: 'POST', credentials: 'include' })
      if (res.ok) {
        const d = await res.json()
        showToast(d.facture_numero ? `Mandat approuvé — facture ${d.facture_numero} créée.` : 'Mandat approuvé.')
        load()
      } else showToast('Erreur', false)
    } catch { showToast('Erreur', false) }
    finally { setApprovingId(null) }
  }

  const handlePayerFacture = async (factureId: number) => {
    setPayingId(factureId)
    try {
      const res = await fetch(`/api/v1/admin/factures-pigiste/${factureId}/payer`, { method: 'POST', credentials: 'include' })
      if (res.ok) { showToast('Facture marquée payée.'); load() }
      else showToast('Erreur', false)
    } catch { showToast('Erreur', false) }
    finally { setPayingId(null) }
  }

  if (!pigiste) return <p className="text-[var(--color-dark-text-2)] font-body p-8">Chargement...</p>

  const initiales = pigiste.nom_complet.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  // Calculs pour le formulaire inline de mandat
  const tarifChoisi  = tarifs.find(t => t.id === mandatForm.type_prestation) ?? null
  const montantAuto  = tarifChoisi ? tarifChoisi.prix * (parseInt(mandatForm.quantite) || 1) : null
  const tarifCatMap  = tarifs.reduce<Record<string, typeof tarifs>>((acc, t) => {
    if (!acc[t.categorie]) acc[t.categorie] = []
    acc[t.categorie].push(t)
    return acc
  }, {})

  return (
    <div className="max-w-5xl mx-auto">
      {toast && (
        <div role="status" aria-live="polite" aria-atomic="true" className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-3 ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-xs font-body text-[var(--color-dark-text-2)] mb-5">
        <span className="font-bold uppercase tracking-wide text-[var(--color-brand)]">Équipe</span>
        <span aria-hidden="true" className="material-symbols-outlined text-sm">chevron_right</span>
        <Link href="/admin/pigistes" className="hover:text-[var(--color-brand)] transition-colors">Pigistes</Link>
        <span aria-hidden="true" className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-[var(--color-dark-1)] font-semibold truncate">{pigiste.nom_complet}</span>
      </nav>

      {/* Header pigiste — un seul bloc : avatar, coordonnées, statut, modifier */}
      <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-6 mb-4 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-[var(--color-brand)] flex items-center justify-center text-white font-display font-extrabold text-lg flex-shrink-0">{initiales}</div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl text-[var(--color-dark-1)] truncate">{pigiste.nom_complet}</h1>
          <p className="font-body text-sm text-[var(--color-dark-text-2)] truncate">{pigiste.email} {pigiste.telephone ? `· ${pigiste.telephone}` : ''}</p>
          {(pigiste.numero_tps || pigiste.numero_tvq) && (
            <p className="font-body text-xs text-[var(--color-dark-text-2)] mt-1">
              {pigiste.numero_tps ? `TPS: ${pigiste.numero_tps}` : ''}{pigiste.numero_tps && pigiste.numero_tvq ? ' · ' : ''}{pigiste.numero_tvq ? `TVQ: ${pigiste.numero_tvq}` : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/admin/pigistes/${id}/edit`}
            className="inline-flex items-center gap-1.5 bg-[var(--color-light-0)] border border-[var(--color-light-border)] text-[var(--color-dark-1)] px-4 py-2 rounded-full font-body font-bold text-xs uppercase tracking-wide hover:border-[var(--color-brand)] transition-colors">
            <span aria-hidden="true" className="material-symbols-outlined text-sm">edit</span>
            Modifier
          </Link>
          <button
            onClick={handleToggleActif}
            disabled={togglingActif}
            className={`px-4 py-2 rounded-full text-xs font-bold font-body uppercase transition-colors disabled:opacity-50 ${pigiste.is_active
              ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] hover:bg-red-100 hover:text-red-700'
              : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)] hover:bg-[var(--color-success-bg)] hover:text-[var(--color-success-text)]'
            }`}
          >
            {togglingActif ? '...' : pigiste.is_active ? 'Actif' : 'Inactif'}
          </button>
        </div>
      </div>

      {/* ── Outils assignés ─────────────────────────────────── */}
      <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-6 mb-4">
        <div className="flex justify-between items-start gap-4 mb-5">
          <div>
            <h2 className="font-display text-base uppercase tracking-wide text-[var(--color-dark-1)]">Outils assignés</h2>
            <p className="font-body text-xs text-[var(--color-dark-text-2)] mt-0.5">Définit ce que ce pigiste voit dans le Social Kit et le Générateur PDF. Vide = accès complet.</p>
          </div>
          <button onClick={saveTools} disabled={toolsSaving}
            className="inline-flex items-center gap-2 bg-[var(--color-brand)] text-white px-5 py-2.5 rounded-full font-body font-bold text-xs uppercase tracking-wide hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-50 flex-shrink-0">
            <span aria-hidden="true" className="material-symbols-outlined text-sm">save</span>
            {toolsSaving ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-display text-sm tracking-wide text-[var(--color-brand)]">Social Kit</span>
              <button onClick={() => setTools(p => ({ ...p, social: null }))}
                className="text-[10px] font-bold font-body text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] underline">Accès complet</button>
            </div>
            {SOCIAL_GROUPS.map(group => {
              const activeSocial = tools.social ?? SOCIAL_GROUPS.flatMap(g => g.ids)
              return (
                <div key={group.label} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-body font-bold text-xs text-[var(--color-dark-1)] uppercase tracking-wide">{group.label}</span>
                    <button onClick={() => setGroupAll(group.ids, 'social', true)}
                      className="text-[10px] font-body text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)]">Tout</button>
                    <span className="text-[var(--color-dark-text-2)] text-[10px]">/</span>
                    <button onClick={() => setGroupAll(group.ids, 'social', false)}
                      className="text-[10px] font-body text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)]">Aucun</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.ids.map((tid, i) => {
                      const on = activeSocial.includes(tid)
                      return (
                        <button key={tid} onClick={() => toggleId('social', tid)} className={chipCls(on)}>
                          {tid} <span className="font-normal opacity-70">— {group.names[i]}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-[var(--color-light-border)] pt-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-display text-sm tracking-wide text-[var(--color-brand)]">Générateur PDF</span>
              <button onClick={() => setTools(p => ({ ...p, pdf: null }))}
                className="text-[10px] font-bold font-body text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] underline">Accès complet</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {PDF_TEMPLATES.map(t => {
                const activePdf = tools.pdf ?? PDF_TEMPLATES.map(x => x.id)
                const on = activePdf.includes(t.id)
                return (
                  <button key={t.id} onClick={() => toggleId('pdf', t.id)} className={chipCls(on)}>
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Mandats */}
        <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-display text-base uppercase tracking-wide text-[var(--color-dark-1)]">Mandats</h2>
            <button onClick={() => setShowMandat(v => !v)}
              className="inline-flex items-center gap-1 bg-[var(--color-brand)] text-white px-4 py-2 rounded-full font-body font-bold text-xs uppercase tracking-wide hover:bg-[var(--color-brand-hover)] transition-colors">
              <span aria-hidden="true" className="material-symbols-outlined text-sm">add</span>
              Nouveau
            </button>
          </div>

          {showMandat && (
            <form onSubmit={handleCreateMandat} className="mb-5 p-4 bg-[var(--color-light-0)] rounded-xl space-y-3">
              <input required value={mandatForm.titre} onChange={e => setMandatForm(p => ({ ...p, titre: e.target.value }))} placeholder="Titre du mandat *" aria-label="Titre du mandat"
                className={inputCls} />

              <select value={mandatForm.type_prestation} onChange={e => setMandatForm(p => ({ ...p, type_prestation: e.target.value }))}
                aria-label="Type de prestation" className={inputCls}>
                <option value="">Type de prestation…</option>
                {Object.entries(tarifCatMap).map(([cat, items]) => (
                  <optgroup key={cat} label={cat}>
                    {items.map(t => <option key={t.id} value={t.id}>{t.label} — {t.prix}$/{t.unite}</option>)}
                  </optgroup>
                ))}
              </select>

              {tarifChoisi && (
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body ml-1">Quantité ({tarifChoisi.unite})</label>
                    <input type="number" value={mandatForm.quantite} onChange={e => setMandatForm(p => ({ ...p, quantite: e.target.value }))}
                      min="1" step="1" aria-label="Quantité"
                      className={`${inputCls} mt-1`} />
                  </div>
                  <div className="flex-1 bg-[var(--color-success-bg)] rounded-xl px-3 py-2 mt-5">
                    <p className="text-[10px] font-bold uppercase text-[var(--color-success-text)] font-body">Montant auto</p>
                    <p className="font-display text-lg text-[var(--color-success-text)]">
                      {montantAuto?.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                    </p>
                  </div>
                </div>
              )}

              <select value={mandatForm.id_projet} onChange={e => setMandatForm(p => ({ ...p, id_projet: e.target.value }))} className={inputCls}>
                <option value="">Lier à un projet (optionnel)</option>
                {projets.map(p => <option key={p.id} value={p.id}>{p.nom_projet}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={mandatForm.date_debut} onChange={e => setMandatForm(p => ({ ...p, date_debut: e.target.value }))} aria-label="Date de début"
                  className={inputCls} />
                <input type="date" value={mandatForm.date_echeance} onChange={e => setMandatForm(p => ({ ...p, date_echeance: e.target.value }))} aria-label="Date d'échéance"
                  className={inputCls} />
              </div>
              <textarea value={mandatForm.notes_admin} onChange={e => setMandatForm(p => ({ ...p, notes_admin: e.target.value }))} placeholder="Notes pour le pigiste" rows={2}
                className={`${inputCls} resize-none`} />
              <div className="flex gap-2">
                <button type="submit" disabled={savingMandat}
                  className="bg-[var(--color-brand)] text-white font-body font-bold text-sm px-6 py-2.5 rounded-full uppercase tracking-wide hover:bg-[var(--color-brand-hover)] transition-all disabled:opacity-60">
                  {savingMandat ? 'Création...' : 'Créer'}
                </button>
                <button type="button" onClick={() => setShowMandat(false)} className="text-[var(--color-dark-text-2)] font-body text-sm px-4 py-2.5 rounded-full hover:bg-[var(--color-light-2)]">Annuler</button>
              </div>
            </form>
          )}

          {pigiste.mandats.length === 0 ? (
            <p className="text-[var(--color-dark-text-2)] font-body text-sm">Aucun mandat.</p>
          ) : (
            <div className="space-y-2">
              {pigiste.mandats.map(m => {
                const s = STATUT_MANDAT[m.statut] ?? { bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)', label: m.statut }
                return (
                  <div key={m.id} className="p-3 bg-[var(--color-light-0)] rounded-xl">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className="font-body font-bold text-sm text-[var(--color-dark-1)] flex-1 min-w-0 truncate">{m.titre}</p>
                      <span style={{ background: s.bg, color: s.text }} className="px-2 py-0.5 rounded-full text-[10px] font-bold font-body whitespace-nowrap">{s.label}</span>
                    </div>
                    {m.nom_projet && <p className="font-body text-xs text-[var(--color-dark-text-2)]">{m.nom_projet}</p>}
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-display text-base text-[var(--color-dark-1)]">{m.montant_convenu.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
                      {m.statut === 'remis' && (
                        <button onClick={() => handleApprouverMandat(m.id)} disabled={approvingId === m.id}
                          className="text-xs font-bold font-body bg-[var(--color-success-bg)] text-[var(--color-success-text)] px-3 py-1 rounded-full hover:opacity-80 transition-opacity disabled:opacity-50">
                          {approvingId === m.id ? '...' : 'Approuver'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Factures */}
        <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-6">
          <h2 className="font-display text-base uppercase tracking-wide text-[var(--color-dark-1)] mb-5">Factures</h2>
          {pigiste.factures.length === 0 ? (
            <p className="text-[var(--color-dark-text-2)] font-body text-sm">Aucune facture.</p>
          ) : (
            <div className="space-y-2">
              {pigiste.factures.map(f => {
                const s = STATUT_FACTURE[f.statut] ?? { bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)', label: f.statut }
                return (
                  <div key={f.id} className="p-3 bg-[var(--color-light-0)] rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <p className="font-body font-bold text-sm text-[var(--color-dark-1)]">{f.numero}</p>
                      <span style={{ background: s.bg, color: s.text }} className="px-2 py-0.5 rounded-full text-[10px] font-bold font-body">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg text-[var(--color-dark-1)]">{f.montant_total.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
                      {f.statut === 'soumise' && (
                        <button onClick={() => handlePayerFacture(f.id)} disabled={payingId === f.id}
                          className="text-xs font-bold font-body bg-[var(--color-brand)] text-white px-3 py-1.5 rounded-full hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-50">
                          {payingId === f.id ? '...' : 'Marquer payée'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
