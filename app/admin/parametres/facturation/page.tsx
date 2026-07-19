'use client'

import { useState, useEffect } from 'react'

interface Params {
  charge_taxes: boolean
  neq: string
  numero_tps: string
  numero_tvq: string
  methode_comptable: 'reguliere' | 'rapide' | 'non_inscrit'
  base_comptable: 'caisse' | 'exercice'
}

// Label uppercase muted au-dessus d'un champ (même patron que la fiche client)
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase tracking-wide font-body">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full bg-[var(--color-light-0)] border-none rounded-xl px-4 py-3 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40"

export default function ParametresFacturationPage() {
  const [params, setParams] = useState<Params>({ charge_taxes: false, neq: '', numero_tps: '', numero_tvq: '', methode_comptable: 'reguliere', base_comptable: 'caisse' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = false) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500) }
  const set = (patch: Partial<Params>) => setParams(p => ({ ...p, ...patch }))

  useEffect(() => {
    fetch('/api/v1/admin/parametres-facturation', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setParams({
        charge_taxes: !!d.charge_taxes, neq: d.neq || '', numero_tps: d.numero_tps || '', numero_tvq: d.numero_tvq || '',
        methode_comptable: d.methode_comptable || 'reguliere', base_comptable: d.base_comptable || 'caisse',
      }); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/v1/admin/parametres-facturation', {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!res.ok) { showToast('Erreur lors de l\'enregistrement'); return }
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch { showToast('Erreur de connexion') }
    finally { setSaving(false) }
  }

  if (loading) return <p className="text-[var(--color-dark-text-2)] font-body text-center py-24">Chargement…</p>

  return (
    <div className="max-w-3xl mx-auto">
      {toast && (
        <div role="status" aria-live="polite" className={`fixed top-6 right-6 z-[60] px-5 py-3.5 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-2.5 ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-xs font-body text-[var(--color-dark-text-2)] mb-5">
        <span className="font-bold uppercase tracking-wide text-[var(--color-brand)]">Paramètres</span>
        <span aria-hidden="true" className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-[var(--color-dark-1)] font-semibold">Facturation</span>
      </nav>

      {/* En-tête */}
      <header className="mb-6">
        <h1 className="font-display text-[var(--color-dark-0)] leading-tight" style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Paramètres de facturation
        </h1>
        <p className="font-body text-[13px] text-[var(--color-dark-text-2)] mt-1">Ces informations apparaissent sur vos factures.</p>
      </header>

      {/* Carte principale */}
      <section className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-6">

        {/* Question taxes */}
        <div>
          <p className="font-body text-sm font-bold text-[var(--color-dark-1)] mb-1">Est-ce que vous facturez des taxes à vos clients ?</p>
          <p className="font-body text-xs text-[var(--color-dark-text-2)] mb-4">Si vos revenus annuels sont sous 30 000 $, vous n&apos;avez généralement pas à facturer de taxes.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => set({ charge_taxes: true })}
              className={`px-6 py-2.5 rounded-full font-body text-sm font-bold transition-colors ${params.charge_taxes ? 'bg-[var(--color-brand)] text-white' : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-1)]'}`}>
              Oui
            </button>
            <button
              onClick={() => set({ charge_taxes: false })}
              className={`px-6 py-2.5 rounded-full font-body text-sm font-bold transition-colors ${!params.charge_taxes ? 'bg-[var(--color-brand)] text-white' : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-1)]'}`}>
              Non
            </button>
          </div>
        </div>

        {/* Champs numéros, révélés seulement si charge_taxes */}
        {params.charge_taxes && (
          <div className="mt-6 pt-6 border-t border-[var(--color-light-border)]">
            <p className="font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-4">Vos numéros d&apos;inscription</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Field label="NEQ (numéro d'entreprise du Québec)">
                  <input className={inputCls} value={params.neq} onChange={e => set({ neq: e.target.value })} placeholder="1234567890" />
                </Field>
              </div>
              <Field label="Numéro de TPS">
                <input className={inputCls} value={params.numero_tps} onChange={e => set({ numero_tps: e.target.value })} placeholder="123456789 RT0001" />
              </Field>
              <Field label="Numéro de TVQ">
                <input className={inputCls} value={params.numero_tvq} onChange={e => set({ numero_tvq: e.target.value })} placeholder="1234567890 TQ0001" />
              </Field>
            </div>
          </div>
        )}

        {/* Méthode comptable TPS/TVQ */}
        <div className="mt-6 pt-6 border-t border-[var(--color-light-border)]">
          <p className="font-body text-sm font-bold text-[var(--color-dark-1)] mb-1">Méthode de comptabilisation de la TPS/TVQ</p>
          <p className="font-body text-xs text-[var(--color-dark-text-2)] mb-4">Détermine comment la taxe payée sur vos dépenses est traitée dans vos rapports.</p>
          <div className="flex flex-col gap-2">
            {([
              { v: 'reguliere', label: 'Méthode régulière', desc: 'Crédits de taxe sur intrants (CTI) réclamés en entier — la taxe payée sur vos dépenses est toujours récupérable.', disabled: false },
              { v: 'rapide', label: 'Méthode rapide (Quick Method)', desc: "Bientôt disponible — calcul différent (remise d'un pourcentage du revenu taxes incluses).", disabled: true },
              { v: 'non_inscrit', label: 'Non inscrit', desc: 'Bientôt disponible — pas de TPS/TVQ perçue ni remise.', disabled: true },
            ] as const).map(opt => (
              <label key={opt.v} className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${params.methode_comptable === opt.v ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5' : 'border-[var(--color-light-border)]'} ${opt.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <input type="radio" name="methode_comptable" className="mt-0.5" checked={params.methode_comptable === opt.v} disabled={opt.disabled}
                  onChange={() => !opt.disabled && set({ methode_comptable: opt.v })} />
                <span>
                  <span className="block font-body text-sm font-bold text-[var(--color-dark-1)]">{opt.label}</span>
                  <span className="block font-body text-xs text-[var(--color-dark-text-2)] mt-0.5">{opt.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Base de comptabilisation */}
        <div className="mt-6 pt-6 border-t border-[var(--color-light-border)]">
          <p className="font-body text-sm font-bold text-[var(--color-dark-1)] mb-1">Comptabilité de caisse ou d&apos;exercice</p>
          <p className="font-body text-xs text-[var(--color-dark-text-2)] mb-4">Détermine à quel moment un revenu est constaté dans vos rapports.</p>
          <div className="flex flex-col gap-2">
            {([
              { v: 'caisse', label: 'Comptabilité de caisse', desc: 'Un revenu est constaté quand une facture est marquée payée — le comportement actuel de l\'app.', disabled: false },
              { v: 'exercice', label: "Comptabilité d'exercice", desc: 'Bientôt disponible — un revenu serait constaté dès la facturation, peu importe le paiement.', disabled: true },
            ] as const).map(opt => (
              <label key={opt.v} className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${params.base_comptable === opt.v ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5' : 'border-[var(--color-light-border)]'} ${opt.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <input type="radio" name="base_comptable" className="mt-0.5" checked={params.base_comptable === opt.v} disabled={opt.disabled}
                  onChange={() => !opt.disabled && set({ base_comptable: opt.v })} />
                <span>
                  <span className="block font-body text-sm font-bold text-[var(--color-dark-1)]">{opt.label}</span>
                  <span className="block font-body text-xs text-[var(--color-dark-text-2)] mt-0.5">{opt.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Bouton enregistrer */}
        <div className="flex items-center gap-3 mt-6">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-[var(--color-brand)] text-white font-body font-bold py-3 rounded-full hover:bg-[var(--color-brand-hover)] transition-colors text-sm disabled:opacity-60">
            {saving ? 'Enregistrement…' : saved ? '✓ Paramètres enregistrés' : 'Enregistrer'}
          </button>
        </div>
      </section>
    </div>
  )
}
