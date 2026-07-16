'use client'

import { useState, useEffect, useCallback } from 'react'

interface Revenu {
  id: number
  date_transaction: string
  description: string
  categorie: string
  montant_avant_taxes: number
  montant_tps: number
  montant_tvq: number
  montant_total: number
  source: string
  source_ref: string | null
  id_facture: number | null
  ligne_t2125?: string | null
  ligne_tp80?: string | null
}

// Côté revenus, presque tout tombe dans 2 lignes fiscales seulement.
//   t2125 = formulaire fédéral T2125 (ARC) · tp80 = formulaire québécois TP-80 (Revenu Québec)
const CATEGORIES: { label: string; t2125: string; tp80: string }[] = [
  { label: 'Ventes et honoraires professionnels', t2125: '8000', tp80: '110' },
  { label: 'Autres revenus',                      t2125: '8230', tp80: '128' },
]

const SOURCE_META: Record<string, { label: string; icon: string }> = {
  facture: { label: 'Facture', icon: 'receipt_long' },
  manuel:  { label: 'Manuel',  icon: 'edit' },
  square:  { label: 'Square',  icon: 'point_of_sale' },
  shopify: { label: 'Shopify', icon: 'shopping_bag' },
}

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

// Normalise AAAA-MM-JJ ou JJ/MM/AAAA vers ISO
function normalizeDate(s: string): string {
  s = s.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  return s
}

export default function RevenusPage() {
  const now = new Date().getFullYear()
  const ANNEES = ['Toutes', ...Array.from({ length: 6 }, (_, i) => String(now - i))]

  const [annee, setAnnee] = useState(String(now))
  const [revenus, setRevenus] = useState<Revenu[]>([])
  const [encaisse, setEncaisse] = useState(0)
  const [enAttente, setEnAttente] = useState(0)
  const [enAttenteN, setEnAttenteN] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const [date, setDate] = useState(todayISO())
  const [description, setDescription] = useState('')
  const [categorie, setCategorie] = useState('')
  const [montant, setMontant] = useState('')

  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importing, setImporting] = useState(false)

  const [piece, setPiece] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)

  const showToast = (msg: string, ok = false) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 4000) }

  const handleScan = async (file: File) => {
    setScanning(true); setScanned(false)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch('/api/v1/admin/revenus/scan', { method: 'POST', credentials: 'include', body: fd })
      const d = await res.json()
      if (!res.ok) { showToast(d.error || 'Lecture du document impossible'); return }
      if (d.date_transaction) setDate(d.date_transaction)
      if (d.description) setDescription(d.description)
      if (d.categorie) setCategorie(d.categorie)
      if (d.montant_total) setMontant(String(d.montant_total))
      setPiece(d.piece_jointe || null)
      setScanned(true)
      showToast('Document analysé — vérifiez et corrigez au besoin', true)
    } catch { showToast('Erreur de connexion') }
    finally { setScanning(false) }
  }

  const load = useCallback(() => {
    setLoading(true)
    const qs = annee && annee !== 'Toutes' ? `?annee=${annee}` : ''
    fetch(`/api/v1/admin/revenus${qs}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        setRevenus(Array.isArray(d.items) ? d.items : [])
        setEncaisse(d.total_encaisse || 0)
        setEnAttente(d.en_attente_total || 0)
        setEnAttenteN(d.en_attente_count || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [annee])

  useEffect(() => { load() }, [load])

  const handleAdd = async () => {
    if (!date || !description.trim() || !montant) { showToast('Remplissez la date, la description et le montant'); return }
    const montantNum = parseFloat(montant.replace(',', '.'))
    if (isNaN(montantNum) || montantNum <= 0) { showToast('Montant invalide'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/v1/admin/revenus', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date_transaction: date,
          description: description.trim(),
          categorie: categorie || 'Ventes et honoraires professionnels',
          montant_total: montantNum,
          piece_jointe: piece,
        }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || "Erreur lors de l'ajout"); return }
      setDescription(''); setCategorie(''); setMontant(''); setDate(todayISO())
      setPiece(null); setScanned(false)
      showToast('Revenu ajouté', true)
      load()
    } catch { showToast('Erreur de connexion') }
    finally { setSaving(false) }
  }

  const handleImport = async () => {
    const lignes = importText.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
      const parts = line.split(/[,\t;]/).map(s => s.trim())
      if (parts.length < 3) return null
      const montantStr = parts[parts.length - 1].replace(/[^0-9.,-]/g, '').replace(',', '.')
      return {
        date_transaction: normalizeDate(parts[0]),
        description: parts.slice(1, parts.length - 1).join(', '),
        montant_total: parseFloat(montantStr),
      }
    }).filter(Boolean)

    if (lignes.length === 0) { showToast('Aucune ligne valide. Format attendu : date, description, montant'); return }
    setImporting(true)
    try {
      const res = await fetch('/api/v1/admin/revenus/import', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lignes }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || "Erreur d'import"); return }
      const n = data.inserted || 0
      const nErr = (data.erreurs || []).length
      showToast(`${n} revenu${n > 1 ? 's' : ''} importé${n > 1 ? 's' : ''}${nErr ? ` · ${nErr} ligne(s) ignorée(s)` : ''}`, n > 0)
      setImportText(''); setImportOpen(false)
      load()
    } catch { showToast('Erreur de connexion') }
    finally { setImporting(false) }
  }

  const handleDelete = async (r: Revenu) => {
    if (r.source !== 'manuel') { showToast('Ce revenu provient d\'une facture — gérez-le depuis la facture'); return }
    if (!confirm('Supprimer ce revenu manuel ?')) return
    try {
      const res = await fetch(`/api/v1/admin/revenus/${r.id}`, { method: 'DELETE', credentials: 'include' })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Erreur'); return }
      showToast('Revenu supprimé', true)
      load()
    } catch { showToast('Erreur de connexion') }
  }

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
        <span className="text-[var(--color-dark-1)] font-semibold">Revenus</span>
      </nav>

      {/* En-tête + sélecteur d'année */}
      <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-[var(--color-dark-0)] leading-tight" style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Revenus
          </h1>
          <p className="font-body text-[13px] text-[var(--color-dark-text-2)] mt-1">Tout ce qui rentre : factures payées, revenus manuels et, bientôt, Square et Shopify.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[var(--color-dark-text-2)] uppercase tracking-wide font-body">Année</label>
          <select className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-xl px-4 py-2.5 outline-none font-body text-sm font-semibold" value={annee} onChange={e => setAnnee(e.target.value)}>
            {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </header>

      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-5">
          <div className="flex items-center gap-2 mb-1">
            <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>account_balance</span>
            <p className="font-body text-[11px] uppercase tracking-wide text-[var(--color-dark-text-2)] font-bold">Encaissé{annee !== 'Toutes' ? ` — ${annee}` : ''}</p>
          </div>
          <p className="font-display font-extrabold text-[var(--color-dark-1)]" style={{ fontSize: '26px' }}>{money(encaisse)}</p>
        </div>
        <div className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-5">
          <div className="flex items-center gap-2 mb-1">
            <span aria-hidden="true" className="material-symbols-outlined text-amber-500" style={{ fontSize: '18px' }}>hourglass_top</span>
            <p className="font-body text-[11px] uppercase tracking-wide text-[var(--color-dark-text-2)] font-bold">En attente (facturé non payé)</p>
          </div>
          <p className="font-display font-extrabold text-[var(--color-dark-1)]" style={{ fontSize: '26px' }}>{money(enAttente)}</p>
          <p className="font-body text-[11px] text-[var(--color-dark-text-2)] mt-0.5">{enAttenteN} facture{enAttenteN > 1 ? 's' : ''} en attente de paiement</p>
        </div>
      </div>

      {/* Formulaire de saisie manuelle */}
      <section className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] p-6 mb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display text-base uppercase tracking-wide text-[var(--color-dark-1)]">Ajouter un revenu</h2>
          <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-body font-bold text-sm cursor-pointer transition-colors ${scanning ? 'bg-[var(--color-light-1)] text-[var(--color-dark-text-2)]' : 'bg-[var(--color-dark-1)] text-white hover:opacity-90'}`}>
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>{scanning ? 'hourglass_top' : 'photo_camera'}</span>
            {scanning ? 'Lecture…' : 'Scanner un reçu'}
            <input type="file" accept="image/*,application/pdf" capture="environment" className="hidden" disabled={scanning}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleScan(f); e.target.value = '' }} />
          </label>
        </div>
        <p className="font-body text-[12px] text-[var(--color-dark-text-2)] mt-1 mb-4">Pour un revenu sans facture (comptant, subvention, intérêts) ou un revenu antérieur : choisissez simplement une date passée.</p>
        {scanned && (
          <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-dark-1)] font-body text-[13px]">
            <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]" style={{ fontSize: '18px' }}>auto_awesome</span>
            <span>Pré-rempli à partir du document{piece ? ' (pièce jointe)' : ''}. <strong>Vérifiez le montant et la catégorie</strong> avant d&apos;enregistrer.</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Date"><input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} /></Field>
          <Field label="Montant (taxes incluses)"><input type="text" inputMode="decimal" className={inputCls} value={montant} onChange={e => setMontant(e.target.value)} placeholder="0,00 $" /></Field>
          <div className="md:col-span-2">
            <Field label="Description"><input type="text" className={inputCls} value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex : Cachet atelier, subvention PME, intérêts…" /></Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Catégorie">
              <select className={inputCls} value={categorie} onChange={e => setCategorie(e.target.value)}>
                {CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.label} — ARC {c.t2125} · QC {c.tp80}</option>)}
              </select>
            </Field>
          </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button onClick={handleAdd} disabled={saving}
            className="flex-1 bg-[var(--color-brand)] text-white font-body font-bold py-3 rounded-full hover:bg-[var(--color-brand-hover)] transition-colors text-sm disabled:opacity-60">
            {saving ? 'Ajout…' : 'Ajouter le revenu'}
          </button>
          <button onClick={() => setImportOpen(o => !o)}
            className="px-5 py-3 rounded-full border border-[var(--color-light-border)] font-body font-bold text-sm text-[var(--color-dark-1)] hover:bg-[var(--color-light-1)] transition-colors flex items-center justify-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload_file</span>
            Import en lot
          </button>
        </div>

        {importOpen && (
          <div className="mt-5 pt-5 border-t border-[var(--color-light-border)]">
            <Field label="Coller des revenus (une ligne = date, description, montant)">
              <textarea className={`${inputCls} font-mono text-xs`} rows={6} value={importText} onChange={e => setImportText(e.target.value)}
                placeholder={"2025-01-15, Cachet atelier créatif, 450\n2025-02-03, Subvention PME, 2000\n2025-03-20, Vente produits, 1275,50"} />
            </Field>
            <p className="font-body text-[11px] text-[var(--color-dark-text-2)] mt-1.5">Formats de date acceptés : AAAA-MM-JJ ou JJ/MM/AAAA. Catégorie « Ventes et honoraires » par défaut.</p>
            <button onClick={handleImport} disabled={importing}
              className="mt-3 bg-[var(--color-dark-1)] text-white font-body font-bold py-2.5 px-5 rounded-full text-sm disabled:opacity-60">
              {importing ? 'Import…' : 'Importer les lignes'}
            </button>
          </div>
        )}
      </section>

      {/* Liste des revenus */}
      <section className="bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-light-border)]">
          <h2 className="font-display text-base uppercase tracking-wide text-[var(--color-dark-1)]">Grand livre des revenus</h2>
          <div className="text-right">
            <p className="font-display font-extrabold text-lg text-[var(--color-dark-1)] leading-none">{money(encaisse)}</p>
            <p className="font-body text-[10px] uppercase tracking-wide text-[var(--color-dark-text-2)] mt-1">Total encaissé</p>
          </div>
        </div>

        {loading ? (
          <p className="text-[var(--color-dark-text-2)] font-body text-sm text-center py-12">Chargement…</p>
        ) : revenus.length === 0 ? (
          <p className="text-[var(--color-dark-text-2)] font-body text-sm text-center py-12">Aucun revenu pour cette période. Marquez une facture « payée » ou ajoutez-en un manuellement.</p>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-left">
            <thead className="bg-[var(--color-light-1)]">
              <tr>
                {['Date', 'Description', 'Source', 'Ligne fiscale', 'Montant', ''].map((h, i) => (
                  <th key={i} className="px-6 py-3 text-[10px] font-bold uppercase text-[var(--color-dark-text-2)] font-body tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-light-border)]">
              {revenus.map(r => {
                const sm = SOURCE_META[r.source] || { label: r.source, icon: 'help' }
                return (
                  <tr key={r.id} className="hover:bg-[var(--color-light-1)] transition-colors">
                    <td className="px-6 py-3.5 font-body text-sm text-[var(--color-dark-text-2)] whitespace-nowrap">{dateFr(r.date_transaction)}</td>
                    <td className="px-6 py-3.5 font-body text-sm text-[var(--color-dark-1)] font-semibold">{r.description}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-body text-[10px] font-bold uppercase tracking-wide ${r.source === 'facture' ? 'bg-[var(--color-brand)]/10 text-[var(--color-brand)]' : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)]'}`}>
                        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '13px' }}>{sm.icon}</span>{sm.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      {r.ligne_t2125 || r.ligne_tp80 ? (
                        <span className="inline-flex items-center gap-1.5 font-body text-[11px] tabular-nums">
                          {r.ligne_t2125 && <span className="px-1.5 py-0.5 rounded-md bg-[var(--color-brand)]/10 text-[var(--color-brand)] font-bold" title="Ligne T2125 — fédéral (ARC)">ARC {r.ligne_t2125}</span>}
                          {r.ligne_tp80 && <span className="px-1.5 py-0.5 rounded-md bg-[var(--color-light-0)] text-[var(--color-dark-text-2)] font-bold" title="Ligne TP-80 — Québec (Revenu Québec)">QC {r.ligne_tp80}</span>}
                        </span>
                      ) : <span className="text-[var(--color-dark-text-2)] font-body text-xs">—</span>}
                    </td>
                    <td className="px-6 py-3.5 font-body font-bold text-sm text-[var(--color-dark-1)] tabular-nums whitespace-nowrap">{money(r.montant_total)}</td>
                    <td className="px-6 py-3.5 text-right">
                      {r.source === 'manuel' ? (
                        <button onClick={() => handleDelete(r)} aria-label="Supprimer" className="text-[var(--color-dark-text-2)] hover:text-red-600 transition-colors">
                          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                        </button>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table></div>
        )}
      </section>
    </div>
  )
}
