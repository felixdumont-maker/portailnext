'use client'

import { useState, useEffect } from 'react'

const CATEGORIES_DEPENSES = [
  'Fournitures et matériel', 'Marchandise et matières premières', 'Frais de bureau',
  'Publicité et marketing', 'Transport et déplacements', 'Repas et représentation',
  'Frais de véhicule', 'Télécommunications', 'Honoraires professionnels',
  'Abonnements et logiciels', 'Loyer et local', 'Assurances', 'Frais bancaires', 'Autre',
]
const CATEGORIES_REVENUS = ['Ventes et honoraires professionnels', 'Autres revenus']

// Jeton d'appareil transporté par cookie httpOnly (cos_capture_token) — jamais lu en JS.
const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(path, { ...opts, credentials: 'include' })

const money = (n: number) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2 }).format(n || 0)
const todayISO = () => new Date().toISOString().slice(0, 10)

type Etat = 'auth' | 'login' | 'idle' | 'scanning' | 'review' | 'saving'

export default function CapturePage() {
  const [etat, setEtat] = useState<Etat>('auth')
  const [type, setType] = useState<'depense' | 'revenu'>('depense')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  // Connexion propre à l'app (ne touche pas au CRM)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [compte, setCompte] = useState<string | null>(null)

  const [date, setDate] = useState(todayISO())
  const [description, setDescription] = useState('')
  const [categorie, setCategorie] = useState('')
  const [montant, setMontant] = useState('')
  const [piece, setPiece] = useState<string | null>(null)
  const [derniere, setDerniere] = useState<string | null>(null)

  const cats = type === 'depense' ? CATEGORIES_DEPENSES : CATEGORIES_REVENUS
  const showToast = (msg: string, ok = false) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500) }

  // Jeton d'appareil (cookie httpOnly) : jumelage une seule fois, persiste dans ce navigateur.
  // AUCUN lien vers le CRM — l'app ne fait que capturer.
  useEffect(() => {
    apiFetch('/api/v1/capture/verify', { method: 'POST' })
      .then(async r => {
        if (r.ok) { const d = await r.json(); setCompte(d.compte || null); setEtat('idle') }
        else setEtat('login')
      })
      .catch(() => setEtat('login'))
  }, [])

  const handleLogout = async () => {
    try { await apiFetch('/api/v1/capture/logout', { method: 'POST' }) } catch { /* on déconnecte quand même */ }
    setCompte(null); setDerniere(null); setEmail(''); setPassword('')
    setEtat('login')
  }

  const handleLogin = async () => {
    if (!email.trim() || !password) { showToast('Courriel et mot de passe requis'); return }
    setLoggingIn(true)
    try {
      const res = await apiFetch('/api/v1/capture/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const d = await res.json()
      if (!res.ok) { showToast(d.error || 'Connexion refusée'); return }
      setCompte(email.trim())
      setPassword(''); setEmail('')
      setEtat('idle')
    } catch { showToast('Erreur de connexion') }
    finally { setLoggingIn(false) }
  }

  const handleScan = async (file: File) => {
    setEtat('scanning')
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('type', type)
      const res = await apiFetch('/api/v1/capture/scan', { method: 'POST', body: fd })
      const d = await res.json()
      if (res.status === 401) { setEtat('login'); return }
      if (!res.ok) { showToast(d.error || 'Lecture impossible'); setEtat('idle'); return }
      setDate(d.date_transaction || todayISO())
      setDescription(d.description || '')
      setCategorie(d.categorie || cats[0])
      setMontant(d.montant_total ? String(d.montant_total) : '')
      setPiece(d.piece_jointe || null)
      setEtat('review')
    } catch { showToast('Erreur de connexion'); setEtat('idle') }
  }

  const handleSave = async () => {
    const montantNum = parseFloat(montant.replace(',', '.'))
    if (!date || !description.trim() || isNaN(montantNum) || montantNum <= 0) { showToast('Date, description et montant requis'); return }
    setEtat('saving')
    try {
      const res = await apiFetch('/api/v1/capture/transaction', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type, date_transaction: date, description: description.trim(),
          categorie: categorie || cats[0], montant_total: montantNum, piece_jointe: piece,
        }),
      })
      const d = await res.json()
      if (res.status === 401) { setEtat('login'); return }
      if (!res.ok) { showToast(d.error || 'Erreur'); setEtat('review'); return }
      setDerniere(`${type === 'depense' ? 'Dépense' : 'Revenu'} de ${money(montantNum)} enregistré`)
      setDate(todayISO()); setDescription(''); setCategorie(''); setMontant(''); setPiece(null)
      setEtat('idle')
      showToast('Enregistré ✓', true)
    } catch { showToast('Erreur de connexion'); setEtat('review') }
  }

  const inputCls = 'w-full bg-white/10 border border-white/15 rounded-2xl px-4 py-3.5 text-white text-base outline-none focus:border-[var(--color-brand)] placeholder:text-white/40'
  const labelCls = 'text-[11px] font-bold uppercase tracking-wide text-white/50 mb-1.5 block'

  return (
    <div className="min-h-[100dvh] bg-[#111] text-white flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {toast && (
        <div role="status" aria-live="polite" className={`fixed top-4 left-4 right-4 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold text-center ${toast.ok ? 'bg-emerald-600' : 'bg-red-600'}`}>{toast.msg}</div>
      )}

      {/* En-tête (aucun lien vers le CRM — app autonome) */}
      {etat !== 'login' && etat !== 'auth' && (
        <header className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight">Nouveau reçu</h1>
            {compte
              ? <p className="text-white/50 text-[13px] mt-0.5 truncate">Connecté : <span className="text-white/75 font-semibold">{compte}</span></p>
              : <p className="text-white/50 text-[13px] mt-0.5">Photo → vérifie → c&apos;est dans ta compta</p>}
          </div>
          <button onClick={handleLogout} disabled={etat === 'scanning' || etat === 'saving'}
            className="shrink-0 flex items-center gap-1.5 text-white/60 text-xs font-bold px-3 py-2 rounded-full bg-white/10 active:text-white disabled:opacity-40">
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
            Changer
          </button>
        </header>
      )}

      {etat === 'auth' && <div className="flex-1 grid place-items-center text-white/50">Chargement…</div>}

      {/* Connexion propre à l'app — une seule fois par appareil */}
      {etat === 'login' && (
        <div className="flex-1 flex flex-col items-center justify-center px-7 gap-6">
          <div className="text-center">
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-brand)' }}>photo_camera</span>
            <h1 className="text-xl font-extrabold mt-2">Reçu — CocktailOS</h1>
            <p className="text-white/55 text-sm mt-1.5 max-w-xs">Connecte-toi <strong>une seule fois</strong> sur cet appareil. Ensuite, l&apos;app s&apos;ouvre direct sur la caméra.</p>
          </div>
          <div className="w-full max-w-xs space-y-3">
            <input type="email" autoComplete="username" inputMode="email" className={inputCls} placeholder="Courriel"
              value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" autoComplete="current-password" className={inputCls} placeholder="Mot de passe"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleLogin() }} />
            <button onClick={handleLogin} disabled={loggingIn}
              className="w-full py-4 rounded-full bg-[var(--color-brand)] text-white font-extrabold text-base disabled:opacity-60">
              {loggingIn ? 'Connexion…' : 'Lier cet appareil'}
            </button>
          </div>
          <p className="text-white/35 text-[12px] text-center max-w-xs">Cet accès sert uniquement à ajouter des reçus. Le portail complet garde sa propre connexion.</p>
        </div>
      )}

      {/* Écran de capture */}
      {(etat === 'idle' || etat === 'scanning') && (
        <div className="flex-1 flex flex-col px-5">
          <div className="grid grid-cols-2 gap-1 p-1 bg-white/10 rounded-full mb-8">
            {(['depense', 'revenu'] as const).map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`py-2.5 rounded-full text-sm font-bold transition-colors ${type === t ? 'bg-white text-[#111]' : 'text-white/60'}`}>
                {t === 'depense' ? 'Dépense' : 'Revenu'}
              </button>
            ))}
          </div>

          {derniere && etat === 'idle' && (
            <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/15 text-emerald-300 text-sm">
              <span aria-hidden="true" className="material-symbols-outlined text-lg">check_circle</span>{derniere}
            </div>
          )}

          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <label className={`w-full max-w-xs aspect-square rounded-[32px] border-2 border-dashed border-white/25 flex flex-col items-center justify-center gap-4 ${etat === 'scanning' ? 'opacity-60' : 'active:scale-95 transition-transform cursor-pointer'}`}>
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--color-brand)' }}>
                {etat === 'scanning' ? 'hourglass_top' : 'photo_camera'}
              </span>
              <span className="text-white/70 font-semibold">{etat === 'scanning' ? 'Analyse en cours…' : 'Prendre une photo'}</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" disabled={etat === 'scanning'}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleScan(f); e.target.value = '' }} />
            </label>
            <p className="text-white/40 text-[13px] text-center max-w-xs">Photographie un reçu ou une facture — l&apos;IA lit le montant, les taxes et la catégorie.</p>
            <div className="flex items-center gap-6">
              <label className={`flex items-center gap-1.5 text-white/55 text-sm font-semibold ${etat === 'scanning' ? 'opacity-40' : 'cursor-pointer active:text-white'}`}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>photo_library</span>
                Mes photos
                <input type="file" accept="image/*" className="hidden" disabled={etat === 'scanning'}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleScan(f); e.target.value = '' }} />
              </label>
              <label className={`flex items-center gap-1.5 text-white/55 text-sm font-semibold ${etat === 'scanning' ? 'opacity-40' : 'cursor-pointer active:text-white'}`}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>picture_as_pdf</span>
                PDF
                <input type="file" accept="application/pdf" className="hidden" disabled={etat === 'scanning'}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleScan(f); e.target.value = '' }} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Écran de vérification */}
      {(etat === 'review' || etat === 'saving') && (
        <div className="flex-1 flex flex-col px-5 pb-5 overflow-y-auto">
          <div className="flex items-center gap-2 mb-5 px-4 py-3 rounded-2xl bg-[var(--color-brand)]/15 text-white/90 text-[13px]">
            <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]">auto_awesome</span>
            <span>Vérifie et corrige, puis enregistre.{piece ? ' Reçu joint.' : ''}</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelCls}>Montant (taxes incluses)</label>
              <input type="text" inputMode="decimal" className={`${inputCls} text-2xl font-extrabold`} value={montant} onChange={e => setMontant(e.target.value)} placeholder="0,00 $" />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <input type="text" className={inputCls} value={description} onChange={e => setDescription(e.target.value)} placeholder="Marchand / nature" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Date</label>
                <input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>{type === 'depense' ? 'Dépense' : 'Revenu'}</label>
                <div className="h-[52px] grid place-items-center rounded-2xl bg-white/5 text-white/50 text-sm capitalize">{type}</div>
              </div>
            </div>
            <div>
              <label className={labelCls}>Catégorie</label>
              <select className={inputCls} value={categorie} onChange={e => setCategorie(e.target.value)}>
                {cats.map(c => <option key={c} value={c} className="text-black">{c}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={() => setEtat('idle')} disabled={etat === 'saving'} className="px-5 py-4 rounded-full bg-white/10 text-white font-bold text-sm">Reprendre</button>
            <button onClick={handleSave} disabled={etat === 'saving'} className="flex-1 py-4 rounded-full bg-[var(--color-brand)] text-white font-extrabold text-base disabled:opacity-60">
              {etat === 'saving' ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
