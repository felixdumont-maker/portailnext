'use client'

import { useState, useEffect } from 'react'

interface Depense {
  id: number
  date_transaction: string
  description: string
  categorie: string
  montant_total: number
  ligne_t2125?: string | null
  ligne_tp80?: string | null
}

// Chaque catégorie est rattachée à sa ligne fiscale :
//   t2125 = formulaire fédéral T2125 (ARC) · tp80 = formulaire québécois TP-80 (Revenu Québec)
const CATEGORIES: { label: string; t2125: string; tp80: string }[] = [
  { label: 'Fournitures et matériel',           t2125: '8811', tp80: '226' },
  { label: 'Marchandise et matières premières', t2125: '8320', tp80: '134' },
  { label: 'Frais de bureau',                   t2125: '8810', tp80: '222' },
  { label: 'Publicité et marketing',            t2125: '8521', tp80: '200' },
  { label: 'Transport et déplacements',         t2125: '9200', tp80: '236' },
  { label: 'Repas et représentation',           t2125: '8523', tp80: '218' },
  { label: 'Frais de véhicule',                 t2125: '9281', tp80: '220' },
  { label: 'Télécommunications',                t2125: '9220', tp80: '238' },
  { label: 'Honoraires professionnels',         t2125: '8860', tp80: '228' },
  { label: 'Abonnements et logiciels',          t2125: '8760', tp80: '204' },
  { label: 'Loyer et local',                    t2125: '8910', tp80: '232' },
  { label: 'Assurances',                        t2125: '8690', tp80: '210' },
  { label: 'Frais bancaires',                   t2125: '8710', tp80: '212' },
  { label: 'Autre',                             t2125: '9270', tp80: '246' },
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase tracking-wide font-body">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full bg-[var(--color-light-0)] border-none rounded-xl px-4 py-3 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40"

const money = (n: number) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2 }).format(n || 0)
const dateFr = (d: string) => d ? new Date(d.length <= 10 ? d + 'T12:00:00' : d).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const todayISO = () => new Date().toISOString().slice(0, 10)

export default function DepensesPage() {
  const [depenses, setDepenses] = useState<Depense[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const [date, setDate] = useState(todayISO())
  const [description, setDescription] = useState('')
  const [categorie, setCategorie] = useState('')
  const [montant, setMontant] = useState('')
  const [piece, setPiece] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)

  const showToast = (msg: string, ok = false) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500) }

  const handleScan = async (file: File) => {
    setScanning(true); setScanned(false)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch('/api/v1/admin/depenses/scan', { method: 'POST', credentials: 'include', body: fd })
      const d = await res.json()
      if (!res.ok) { showToast(d.error || "Lecture du reçu impossible"); return }
      if (d.date_transaction) setDate(d.date_transaction)
      if (d.description) setDescription(d.description)
      if (d.categorie) setCategorie(d.categorie)
      if (d.montant_total) setMontant(String(d.montant_total))
      setPiece(d.piece_jointe || null)
      setScanned(true)
      showToast('Reçu analysé — vérifiez et corrigez au besoin', true)
    } catch { showToast('Erreur de connexion') }
    finally { setScanning(false) }
  }

  const loadDepenses = () => {
    fetch('/api/v1/admin/depenses', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setDepenses(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadDepenses() }, [])

  const handleAdd = async () => {
    if (!date || !description.trim() || !montant) { showToast('Remplissez la date, la description et le montant'); return }
    const montantNum = parseFloat(montant.replace(',', '.'))
    if (isNaN(montantNum) || montantNum <= 0) { showToast('Montant invalide'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/v1/admin/depenses', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date_transaction: date,
          description: description.trim(),
          categorie: categorie || 'Autre',
          montant_total: montantNum,
          piece_jointe: piece,
        }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Erreur lors de l\'ajout'); return }
      setDepenses(prev => [data, ...prev])
      setDescription(''); setCategorie(''); setMontant(''); setDate(todayISO())
      setPiece(null); setScanned(false)
      showToast('Dépense ajoutée', true)
    } catch { showToast('Erreur de connexion') }
    finally { setSaving(false) }
  }

  const totalDepenses = depenses.reduce((sum, d) => sum + (d.montant_total || 0), 0)

  return (
    <div className="max-w-5xl mx-auto">
      {toast && (
        <div role="status" aria-live="polite" className={`fixed top-6 right-6 z-[60] px-5 py-3.5 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-2.5 ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-xs font-body text-[var(--color-dark-text-2)] mb-5">
        <span className="font-bold uppercase tracking-wide text-[var(--color-brand)]">Comptabilité</span>
        <span aria-hidden="true" className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-[var(--color-dark-1)] font-semibold">Dépenses</span>
      </nav>

      {/* En-tête */}
      <header className="mb-6">
        <h1 className="font-display text-[var(--color-dark-0)] leading-tight" style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Dépenses
        </h1>
        <p className="font-body text-[13px] text-[var(--color-dark-text-2)] mt-1">Enregistrez ce qui sort pour suivre votre profit.</p>
      </header>

      {/* Formulaire de saisie rapide */}
      <section className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-6 mb-6">
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <h2 className="font-display text-base uppercase tracking-wide text-[var(--color-dark-1)]">Ajouter une dépense</h2>
          <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-body font-bold text-sm cursor-pointer transition-colors ${scanning ? 'bg-[var(--color-light-1)] text-[var(--color-dark-text-2)]' : 'bg-[var(--color-dark-1)] text-white hover:opacity-90'}`}>
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>{scanning ? 'hourglass_top' : 'photo_camera'}</span>
            {scanning ? 'Lecture…' : 'Scanner un reçu'}
            <input type="file" accept="image/*,application/pdf" capture="environment" className="hidden" disabled={scanning}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleScan(f); e.target.value = '' }} />
          </label>
        </div>
        {scanned && (
          <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-dark-1)] font-body text-[13px]">
            <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]" style={{ fontSize: '18px' }}>auto_awesome</span>
            <span>Pré-rempli à partir de la photo{piece ? ' (reçu joint)' : ''}. <strong>Vérifiez les montants et la catégorie</strong> avant d&apos;enregistrer.</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Date"><input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} /></Field>
          <Field label="Montant (taxes incluses)"><input type="text" inputMode="decimal" className={inputCls} value={montant} onChange={e => setMontant(e.target.value)} placeholder="0,00 $" /></Field>
          <div className="md:col-span-2">
            <Field label="Description"><input type="text" className={inputCls} value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex : Achat de laine, essence, timbres…" /></Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Catégorie">
              <select className={inputCls} value={categorie} onChange={e => setCategorie(e.target.value)}>
                <option value="">— Choisir une catégorie</option>
                {CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.label} — ARC {c.t2125} · QC {c.tp80}</option>)}
              </select>
              <p className="font-body text-[11px] text-[var(--color-dark-text-2)] mt-1.5">
                <span aria-hidden="true" className="material-symbols-outlined align-middle" style={{ fontSize: '13px' }}>info</span>{' '}
                Chaque catégorie est reliée à sa ligne fiscale : <strong>ARC</strong> = fédéral (T2125), <strong>QC</strong> = Québec (TP-80).
              </p>
            </Field>
          </div>
        </div>
        <div className="mt-6">
          <button onClick={handleAdd} disabled={saving}
            className="w-full bg-[var(--color-brand)] text-white font-body font-bold py-3 rounded-full hover:bg-[var(--color-brand-hover)] transition-colors text-sm disabled:opacity-60">
            {saving ? 'Ajout…' : 'Ajouter la dépense'}
          </button>
        </div>
      </section>

      {/* Liste des dépenses */}
      <section className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-light-border)]">
          <h2 className="font-display text-base uppercase tracking-wide text-[var(--color-dark-1)]">Historique</h2>
          <div className="text-right">
            <p className="font-display font-extrabold text-lg text-[var(--color-dark-1)] leading-none">{money(totalDepenses)}</p>
            <p className="font-body text-[10px] uppercase tracking-wide text-[var(--color-dark-text-2)] mt-1">Total</p>
          </div>
        </div>

        {loading ? (
          <p className="text-[var(--color-dark-text-2)] font-body text-sm text-center py-12">Chargement…</p>
        ) : depenses.length === 0 ? (
          <p className="text-[var(--color-dark-text-2)] font-body text-sm text-center py-12">Aucune dépense enregistrée pour l&apos;instant.</p>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-left">
            <thead className="bg-[var(--color-light-1)]">
              <tr>
                {['Date', 'Description', 'Catégorie', 'Ligne fiscale', 'Montant'].map(h => (
                  <th key={h} className="px-6 py-3 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-light-border)]">
              {depenses.map(d => (
                <tr key={d.id} className="hover:bg-[var(--color-light-1)] transition-colors">
                  <td className="px-6 py-3.5 font-body text-sm text-[var(--color-dark-text-2)] whitespace-nowrap">{dateFr(d.date_transaction)}</td>
                  <td className="px-6 py-3.5 font-body text-sm text-[var(--color-dark-1)] font-semibold">{d.description}</td>
                  <td className="px-6 py-3.5">
                    <span className="px-2.5 py-1 rounded-full font-body text-[10px] font-bold uppercase tracking-wide bg-[var(--color-light-0)] text-[var(--color-dark-text-2)]">{d.categorie}</span>
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    {d.ligne_t2125 || d.ligne_tp80 ? (
                      <span className="inline-flex items-center gap-1.5 font-body text-[11px] tabular-nums">
                        {d.ligne_t2125 && <span className="px-1.5 py-0.5 rounded-md bg-[var(--color-brand)]/10 text-[var(--color-brand)] font-bold" title="Ligne T2125 — fédéral (ARC)">ARC {d.ligne_t2125}</span>}
                        {d.ligne_tp80 && <span className="px-1.5 py-0.5 rounded-md bg-[var(--color-light-0)] text-[var(--color-dark-text-2)] font-bold" title="Ligne TP-80 — Québec (Revenu Québec)">QC {d.ligne_tp80}</span>}
                      </span>
                    ) : <span className="text-[var(--color-dark-text-2)] font-body text-xs">—</span>}
                  </td>
                  <td className="px-6 py-3.5 font-body font-bold text-sm text-[var(--color-dark-1)] tabular-nums whitespace-nowrap">{money(d.montant_total)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </section>
    </div>
  )
}
