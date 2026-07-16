'use client'

import { useState, useEffect, useCallback } from 'react'

interface AValider {
  id: number
  source: string
  expediteur: string | null
  date_transaction: string
  fournisseur: string | null
  description: string
  categorie: string
  montant_avant_taxes: number
  montant_tps: number
  montant_tvq: number
  montant_total: number
  piece_jointe: string | null
  confiance: string | null
  created_at: string
}

const CATEGORIES = [
  'Fournitures et matériel', 'Marchandise et matières premières', 'Frais de bureau',
  'Publicité et marketing', 'Transport et déplacements', 'Repas et représentation',
  'Frais de véhicule', 'Télécommunications', 'Honoraires professionnels',
  'Abonnements et logiciels', 'Loyer et local', 'Assurances', 'Frais bancaires', 'Autre',
]

const SOURCE_META: Record<string, { label: string; icon: string }> = {
  gmail: { label: 'Courriel', icon: 'mail' },
  photo: { label: 'Photo', icon: 'photo_camera' },
  manuel: { label: 'Manuel', icon: 'edit' },
}

const money = (n: number) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2 }).format(n || 0)
const dateFr = (d: string) => d ? new Date(d.length <= 10 ? d + 'T12:00:00' : d).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const estLien = (p: string | null) => !!p && p.startsWith('http')

export default function AValiderPage() {
  const [items, setItems] = useState<AValider[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<number | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  // Corrections locales par ligne (montant / catégorie / date / description)
  const [edits, setEdits] = useState<Record<number, Partial<AValider>>>({})

  const [gmail, setGmail] = useState<{ configured: boolean; connected: boolean; compte: string | null; last_sync_at: string | null; label: string } | null>(null)
  const [syncing, setSyncing] = useState(false)

  const showToast = (msg: string, ok = false) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500) }

  const loadGmail = useCallback(() => {
    fetch('/api/v1/admin/integrations/gmail/status', { credentials: 'include' })
      .then(r => r.json()).then(setGmail).catch(() => {})
  }, [])
  useEffect(() => { loadGmail() }, [loadGmail])

  // Message de retour après connexion Gmail (?gmail=ok / refus / erreur…)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('gmail')
    if (!p) return
    const msg: Record<string, [string, boolean]> = {
      ok: ['Gmail connecté ✓', true], refus: ['Connexion Gmail annulée', false],
      sansjeton: ['Google n\'a pas fourni de jeton — réessayez', false], erreur: ['Erreur de connexion Gmail', false],
    }
    const m = msg[p]; if (m) setToast({ msg: m[0], ok: m[1] })
    window.history.replaceState({}, '', '/admin/comptabilite/a-valider')
    loadGmail()
  }, [loadGmail])

  const syncNow = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/v1/admin/integrations/gmail/sync', { method: 'POST', credentials: 'include' })
      const d = await res.json()
      if (!res.ok) { showToast(d.error || 'Synchro impossible'); return }
      showToast(`${d.ajoutes || 0} facture(s) ajoutée(s)${d.ignores ? ` · ${d.ignores} ignorée(s)` : ''}`, true)
      load(); loadGmail()
    } catch { showToast('Erreur de connexion') }
    finally { setSyncing(false) }
  }

  const disconnectGmail = async () => {
    if (!confirm('Déconnecter Gmail ? L\'ingestion automatique s\'arrêtera.')) return
    try {
      await fetch('/api/v1/admin/integrations/gmail/disconnect', { method: 'POST', credentials: 'include' })
      loadGmail(); showToast('Gmail déconnecté', true)
    } catch { showToast('Erreur') }
  }

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/v1/admin/factures-a-valider', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d.items) ? d.items : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const val = (it: AValider, k: keyof AValider) => (edits[it.id]?.[k] ?? it[k]) as never
  const setVal = (id: number, k: keyof AValider, v: string | number) =>
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [k]: v } }))

  const approuver = async (it: AValider) => {
    setBusy(it.id)
    try {
      const e = edits[it.id] || {}
      const res = await fetch(`/api/v1/admin/factures-a-valider/${it.id}/approuver`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date_transaction: e.date_transaction ?? it.date_transaction,
          description: (e.description ?? it.description),
          categorie: e.categorie ?? it.categorie,
          montant_total: e.montant_total ?? it.montant_total,
        }),
      })
      const d = await res.json()
      if (!res.ok) { showToast(d.error || 'Erreur'); return }
      setItems(prev => prev.filter(x => x.id !== it.id))
      showToast('Approuvé → ajouté aux dépenses', true)
    } catch { showToast('Erreur de connexion') }
    finally { setBusy(null) }
  }

  const rejeter = async (it: AValider) => {
    if (!confirm('Rejeter cette facture ? Elle ne sera pas ajoutée aux dépenses.')) return
    setBusy(it.id)
    try {
      const res = await fetch(`/api/v1/admin/factures-a-valider/${it.id}/rejeter`, { method: 'POST', credentials: 'include' })
      if (!res.ok) { const d = await res.json(); showToast(d.error || 'Erreur'); return }
      setItems(prev => prev.filter(x => x.id !== it.id))
      showToast('Rejeté', true)
    } catch { showToast('Erreur de connexion') }
    finally { setBusy(null) }
  }

  const inputCls = 'w-full bg-[var(--color-light-0)] border-none rounded-lg px-3 py-2 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40'

  return (
    <div className="max-w-5xl mx-auto">
      {toast && (
        <div role="status" aria-live="polite" className={`fixed top-6 right-6 z-[60] px-5 py-3.5 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-2.5 ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      <nav className="flex items-center gap-1.5 text-xs font-body text-[var(--color-dark-text-2)] mb-5">
        <span className="font-bold uppercase tracking-wide text-[var(--color-brand)]">Comptabilité</span>
        <span aria-hidden="true" className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-[var(--color-dark-1)] font-semibold">À valider</span>
      </nav>

      <header className="mb-6">
        <h1 className="font-display text-[var(--color-dark-0)] leading-tight" style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Factures à valider
        </h1>
        <p className="font-body text-[13px] text-[var(--color-dark-text-2)] mt-1">Factures fournisseurs détectées (courriel, photo). Vérifiez, corrigez au besoin, puis approuvez — rien n&apos;entre en dépense sans votre accord.</p>
      </header>

      {/* Source automatique : Gmail */}
      {gmail && (
        <section className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]" style={{ fontSize: '24px' }}>mail</span>
            <div className="min-w-0">
              {gmail.connected ? (
                <>
                  <p className="font-body text-sm font-bold text-[var(--color-dark-1)] truncate">Gmail connecté{gmail.compte ? ` — ${gmail.compte}` : ''}</p>
                  <p className="font-body text-[11px] text-[var(--color-dark-text-2)]">Analyse les courriels étiquetés « {gmail.label} »{gmail.last_sync_at ? ` · dernière synchro ${gmail.last_sync_at}` : ' · pas encore synchronisé'}</p>
                </>
              ) : (
                <>
                  <p className="font-body text-sm font-bold text-[var(--color-dark-1)]">Ingestion automatique des factures par courriel</p>
                  <p className="font-body text-[11px] text-[var(--color-dark-text-2)]">{gmail.configured ? `Connecte ta boîte : les courriels étiquetés « ${gmail.label} » seront lus automatiquement.` : 'OAuth Google non configuré (à faire côté serveur).'}</p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {gmail.connected ? (
              <>
                <button onClick={syncNow} disabled={syncing}
                  className="px-4 py-2.5 rounded-full bg-[var(--color-brand)] text-white font-body font-bold text-sm hover:bg-[var(--color-brand-hover)] disabled:opacity-60">
                  {syncing ? 'Synchro…' : 'Synchroniser maintenant'}
                </button>
                <button onClick={disconnectGmail} className="px-4 py-2.5 rounded-full border border-[var(--color-light-border)] font-body font-bold text-sm text-[var(--color-dark-text-2)] hover:bg-[var(--color-light-1)]">Déconnecter</button>
              </>
            ) : gmail.configured ? (
              <a href="/api/v1/admin/integrations/gmail/connect"
                className="px-5 py-2.5 rounded-full bg-[var(--color-dark-1)] text-white font-body font-bold text-sm hover:opacity-90 inline-flex items-center gap-2">
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>link</span>Connecter Gmail
              </a>
            ) : (
              <span className="font-body text-[11px] text-[var(--color-dark-text-2)] italic">bientôt disponible</span>
            )}
          </div>
        </section>
      )}

      {loading ? (
        <p className="text-[var(--color-dark-text-2)] font-body text-sm text-center py-16">Chargement…</p>
      ) : items.length === 0 ? (
        <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] py-16 text-center">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-dark-text-2)]" style={{ fontSize: '40px' }}>inbox</span>
          <p className="text-[var(--color-dark-text-2)] font-body text-sm mt-2">Rien à valider pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(it => {
            const sm = SOURCE_META[it.source] || { label: it.source, icon: 'description' }
            return (
              <div key={it.id} className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-5">
                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-body text-[10px] font-bold uppercase tracking-wide bg-[var(--color-light-0)] text-[var(--color-dark-text-2)]">
                      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '13px' }}>{sm.icon}</span>{sm.label}
                    </span>
                    {it.fournisseur && <span className="font-body text-sm font-bold text-[var(--color-dark-1)]">{it.fournisseur}</span>}
                    {it.confiance && (
                      <span className={`font-body text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${it.confiance === 'haute' ? 'bg-emerald-500/10 text-emerald-700' : it.confiance === 'basse' ? 'bg-amber-500/15 text-amber-700' : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)]'}`}>Confiance {it.confiance}</span>
                    )}
                  </div>
                  {estLien(it.piece_jointe) && (
                    <a href={it.piece_jointe!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-body text-xs font-bold text-[var(--color-brand)]">
                      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>Voir la pièce
                    </a>
                  )}
                </div>

                {it.expediteur && <p className="font-body text-[11px] text-[var(--color-dark-text-2)] mb-3 truncate">De : {it.expediteur}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-dark-text-2)] font-body block mb-1">Montant</label>
                    <input type="text" inputMode="decimal" className={`${inputCls} font-bold`} value={String(val(it, 'montant_total'))} onChange={e => setVal(it.id, 'montant_total', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-dark-text-2)] font-body block mb-1">Date</label>
                    <input type="date" className={inputCls} value={String(val(it, 'date_transaction'))} onChange={e => setVal(it.id, 'date_transaction', e.target.value)} />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-dark-text-2)] font-body block mb-1">Catégorie</label>
                    <select className={inputCls} value={String(val(it, 'categorie'))} onChange={e => setVal(it.id, 'categorie', e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-dark-text-2)] font-body block mb-1">Description</label>
                    <input type="text" className={inputCls} value={String(val(it, 'description'))} onChange={e => setVal(it.id, 'description', e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mt-4">
                  <div className="font-body text-[11px] text-[var(--color-dark-text-2)]">
                    {(it.montant_tps > 0 || it.montant_tvq > 0) && <>TPS {money(it.montant_tps)} · TVQ {money(it.montant_tvq)} · </>}
                    reçu {dateFr(it.created_at)}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => rejeter(it)} disabled={busy === it.id}
                      className="px-4 py-2.5 rounded-full border border-[var(--color-light-border)] font-body font-bold text-sm text-[var(--color-dark-text-2)] hover:bg-[var(--color-light-1)] disabled:opacity-50">Rejeter</button>
                    <button onClick={() => approuver(it)} disabled={busy === it.id}
                      className="px-5 py-2.5 rounded-full bg-[var(--color-brand)] text-white font-body font-bold text-sm hover:bg-[var(--color-brand-hover)] disabled:opacity-60">
                      {busy === it.id ? '…' : 'Approuver → Dépense'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
