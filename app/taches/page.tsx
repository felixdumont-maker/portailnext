'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Task, Bucket } from '@/lib/tasks'
import { formatDate as formatDateShared, formatDateLong as formatDateLongShared, parseVCard, BUCKET_LABEL, BUCKET_ORDER, bucketOf } from '@/lib/tasks'

const TOKEN_KEY = 'cos_task_token'
const API = process.env.NEXT_PUBLIC_API_URL || ''

interface Personne { id: number; nom_complet: string }
interface Projet { id: number; nom_projet: string; client_nom: string | null }
interface MarketingItem { id: number; titre: string; date_publication: string; plateformes: string[]; statut: string }

type Etat = 'auth' | 'login' | 'list'

const PRIORITE = {
  haute:   { dot: 'bg-red-500' },
  normale: { dot: 'bg-orange-400' },
  basse:   { dot: 'bg-gray-500' },
} as const

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/

const formatDate = formatDateShared
const formatDateLong = formatDateLongShared

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto overflow-x-hidden bg-[var(--sheet)] rounded-t-3xl border-t border-[color-mix(in_oklab,var(--ink)_10%,transparent)] px-5 pt-3 pb-6 animate-[slideUp_0.2s_ease-out]"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>
        <div className="w-10 h-1.5 rounded-full bg-[color-mix(in_oklab,var(--ink)_20%,transparent)] mx-auto mb-4" />
        {children}
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(24px); opacity: 0.6 } to { transform: translateY(0); opacity: 1 } }`}</style>
    </div>
  )
}

export default function TachesPage() {
  const [etat, setEtat] = useState<Etat>('auth')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [compte, setCompte] = useState<string | null>(null)

  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [texte, setTexte] = useState('')
  const [sending, setSending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [completingIds, setCompletingIds] = useState<Set<number>>(new Set())
  const completeTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})

  const [team, setTeam] = useState<Personne[]>([])
  const [clients, setClients] = useState<Personne[]>([])
  const [projets, setProjets] = useState<Projet[]>([])
  const [marketing, setMarketing] = useState<MarketingItem[]>([])
  const [detailId, setDetailId] = useState<number | null>(null)
  const [editTexte, setEditTexte] = useState('')
  const vcardInputRef = useRef<HTMLInputElement>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)

  const [pushOn, setPushOn] = useState(false)
  const [pushBusy, setPushBusy] = useState(false)
  const pushSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window

  const showToast = (msg: string, ok = false) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500) }
  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null)
  const authHeaders = () => ({ 'X-Task-Token': getToken() || '', 'Content-Type': 'application/json' })

  const loadTasks = useCallback(async () => {
    setLoadingTasks(true)
    try {
      const res = await fetch(`${API}/api/v1/taches/todos`, { headers: { 'X-Task-Token': getToken() || '' } })
      if (res.status === 401) { localStorage.removeItem(TOKEN_KEY); setEtat('login'); return }
      const d = await res.json()
      if (Array.isArray(d)) setTasks(d)
    } catch { showToast('Erreur de connexion') }
    finally { setLoadingTasks(false) }
  }, [])

  const loadPickers = useCallback(async () => {
    const token = getToken() || ''
    try {
      const [t, c, p] = await Promise.all([
        fetch(`${API}/api/v1/taches/team`, { headers: { 'X-Task-Token': token } }).then(r => r.json()),
        fetch(`${API}/api/v1/taches/clients`, { headers: { 'X-Task-Token': token } }).then(r => r.json()),
        fetch(`${API}/api/v1/taches/projets`, { headers: { 'X-Task-Token': token } }).then(r => r.json()),
      ])
      if (Array.isArray(t)) setTeam(t)
      if (Array.isArray(c)) setClients(c)
      if (Array.isArray(p)) setProjets(p)
    } catch { /* les sélecteurs resteront vides — pas bloquant pour la liste */ }
  }, [])

  // Vide pour tout le monde sauf le rôle production (visuels marketing à déposer) —
  // convergence avec /admin/marketing sans dupliquer les items déjà liés à une roadmap.
  const loadMarketing = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/v1/taches/marketing`, { headers: { 'X-Task-Token': getToken() || '' } })
      const d = await res.json()
      if (Array.isArray(d)) setMarketing(d)
    } catch { /* section marketing simplement absente si ça échoue */ }
  }, [])

  const handleMarketingToggle = async (id: number) => {
    const snapshot = marketing
    setMarketing(prev => prev.filter(m => m.id !== id))
    try {
      const res = await fetch(`${API}/api/v1/taches/marketing/${id}/toggle`, { method: 'POST', headers: { 'X-Task-Token': getToken() || '' } })
      if (!res.ok) throw new Error()
      showToast('Visuels déposés ✓', true)
    } catch { setMarketing(snapshot); showToast("La mise à jour a échoué") }
  }

  // Jeton d'appareil : jumelage une seule fois, persiste dans ce navigateur.
  useEffect(() => {
    const token = getToken()
    if (!token) { setEtat('login'); return }
    fetch(`${API}/api/v1/taches/verify`, { method: 'POST', headers: { 'X-Task-Token': token } })
      .then(async r => {
        if (r.ok) { const d = await r.json(); setCompte(d.compte || null); setEtat('list'); loadTasks(); loadPickers(); loadMarketing() }
        else { localStorage.removeItem(TOKEN_KEY); setEtat('login') }
      })
      .catch(() => setEtat('login'))
  }, [loadTasks, loadPickers, loadMarketing])

  // Détecte un abonnement push déjà actif sur cet appareil (ex. après réinstallation).
  useEffect(() => {
    if (etat !== 'list' || !pushSupported) return
    navigator.serviceWorker.getRegistration().then(reg => {
      reg?.pushManager.getSubscription().then(sub => setPushOn(!!sub))
    })
  }, [etat, pushSupported])

  const activerPush = async () => {
    if (!pushSupported || pushBusy) return
    setPushBusy(true)
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setPushBusy(false); return }
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const keyRes = await fetch(`${API}/api/v1/taches/push/vapid-public-key`, { headers: { 'X-Task-Token': getToken() || '' } })
      const { key } = await keyRes.json()
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      })
      await fetch(`${API}/api/v1/taches/push/subscribe`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(sub) })
      setPushOn(true)
      showToast('Notifications activées ✓', true)
    } catch { showToast("L'activation des notifications a échoué") }
    setPushBusy(false)
  }

  const desactiverPush = async () => {
    if (pushBusy) return
    setPushBusy(true)
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      const sub = await reg?.pushManager.getSubscription()
      if (sub) {
        await fetch(`${API}/api/v1/taches/push/unsubscribe`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ endpoint: sub.endpoint }) })
        await sub.unsubscribe()
      }
      setPushOn(false)
    } catch { showToast('La désactivation a échoué') }
    setPushBusy(false)
  }

  const handleLogout = async () => {
    const token = getToken()
    try { if (token) await fetch(`${API}/api/v1/taches/logout`, { method: 'POST', headers: { 'X-Task-Token': token } }) } catch { /* on déconnecte quand même */ }
    localStorage.removeItem(TOKEN_KEY)
    setCompte(null); setTasks([]); setEmail(''); setPassword('')
    setEtat('login')
  }

  const handleLogin = async () => {
    if (!email.trim() || !password) { showToast('Courriel et mot de passe requis'); return }
    setLoggingIn(true)
    try {
      const res = await fetch(`${API}/api/v1/taches/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const d = await res.json()
      if (!res.ok) { showToast(d.error || 'Connexion refusée'); return }
      localStorage.setItem(TOKEN_KEY, d.token)
      setCompte(email.trim())
      setPassword(''); setEmail('')
      setEtat('list')
      loadTasks(); loadPickers(); loadMarketing()
    } catch { showToast('Erreur de connexion') }
    finally { setLoggingIn(false) }
  }

  const handleAdd = async () => {
    const clean = texte.trim()
    if (!clean) return
    setSending(true)
    try {
      const res = await fetch(`${API}/api/v1/taches/todos`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ texte: clean, parse_nl: true }),
      })
      if (res.status === 401) { localStorage.removeItem(TOKEN_KEY); setEtat('login'); return }
      const d = await res.json()
      if (!res.ok) { showToast(d.error || "La tâche n'a pas pu être créée"); return }
      setTasks(prev => [d, ...prev])
      setTexte('')
      // Ouvre tout de suite la fiche pour assigner/planifier/lier un projet ou un contact —
      // sinon rien ne signale que ces options existent après un ajout rapide.
      setDetailId(d.id)
      setEditTexte(d.texte)
    } catch { showToast('Erreur de connexion') }
    finally { setSending(false) }
  }

  const handleToggle = async (id: number) => {
    const snapshot = tasks
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const goingDone = !task.est_coche
    if (goingDone) {
      // Joue l'anim coché/barré en place, puis la tâche tombe dans "Terminées" une fois l'anim finie.
      setCompletingIds(prev => new Set(prev).add(id))
      completeTimers.current[id] = setTimeout(() => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, est_coche: 1 } : t))
        setCompletingIds(prev => { const n = new Set(prev); n.delete(id); return n })
        delete completeTimers.current[id]
      }, 450)
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, est_coche: 0 } : t))
    }
    try {
      const res = await fetch(`${API}/api/v1/taches/todos/${id}/toggle`, { method: 'POST', headers: { 'X-Task-Token': getToken() || '' } })
      if (res.status === 401) { localStorage.removeItem(TOKEN_KEY); setEtat('login'); return }
      if (!res.ok) throw new Error()
    } catch {
      if (completeTimers.current[id]) { clearTimeout(completeTimers.current[id]); delete completeTimers.current[id] }
      setTasks(snapshot)
      setCompletingIds(prev => { const n = new Set(prev); n.delete(id); return n })
      showToast("La mise à jour a échoué")
    }
  }

  const patchTask = async (id: number, payload: Record<string, unknown>) => {
    const snapshot = tasks
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...payload } as Task : t))
    try {
      const res = await fetch(`${API}/api/v1/taches/todos/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(payload) })
      if (res.status === 401) { localStorage.removeItem(TOKEN_KEY); setEtat('login'); return }
      const d = await res.json()
      if (!res.ok) throw new Error()
      setTasks(prev => prev.map(t => t.id === id ? d : t))
    } catch { setTasks(snapshot); showToast("La modification a échoué") }
  }

  const handleDelete = async (id: number) => {
    const snapshot = tasks
    setTasks(prev => prev.filter(t => t.id !== id))
    setDetailId(null)
    try {
      const res = await fetch(`${API}/api/v1/taches/todos/${id}`, { method: 'DELETE', headers: { 'X-Task-Token': getToken() || '' } })
      if (!res.ok) throw new Error()
    } catch { setTasks(snapshot); showToast('La suppression a échoué') }
  }

  const handleImportVCard = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const { nom, telephone, courriel } = parseVCard(String(reader.result || ''))
      if (!nom && !telephone && !courriel) { showToast('Contact illisible dans ce fichier'); return }
      if (detailId) patchTask(detailId, { contact_nom: nom || undefined, contact_telephone: telephone || undefined, contact_courriel: courriel || undefined })
      showToast('Contact importé ✓', true)
    }
    reader.readAsText(file)
  }

  const buckets: Record<Bucket, Task[]> = { retard: [], aujourdhui: [], avenir: [], sans_date: [] }
  for (const t of tasks) if (!t.est_coche) buckets[bucketOf(t.date_echeance)].push(t)
  const doneTasks = tasks.filter(t => t.est_coche)
  const activeCount = BUCKET_ORDER.reduce((n, b) => n + buckets[b].length, 0)
  const detail = tasks.find(t => t.id === detailId) || null

  const inputCls = 'w-full bg-[color-mix(in_oklab,var(--ink)_10%,transparent)] border border-[color-mix(in_oklab,var(--ink)_15%,transparent)] rounded-2xl px-4 py-3.5 text-[var(--ink)] text-base outline-none focus:border-[var(--color-brand)] placeholder:text-[color-mix(in_oklab,var(--ink)_40%,transparent)]'
  const labelCls = 'text-[10px] font-bold uppercase tracking-widest text-[color-mix(in_oklab,var(--ink)_40%,transparent)] mb-1.5 block'
  const fieldCls = 'w-full bg-[color-mix(in_oklab,var(--ink)_10%,transparent)] border border-[color-mix(in_oklab,var(--ink)_15%,transparent)] rounded-xl px-3.5 py-2.5 text-[var(--ink)] text-base outline-none focus:border-[var(--color-brand)] placeholder:text-[color-mix(in_oklab,var(--ink)_35%,transparent)]'

  return (
    <div className="taches-app min-h-[100dvh] overflow-x-hidden bg-[var(--paper)] text-[var(--ink)] flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <style>{`
        .taches-app { --paper: #111111; --sheet: #1a1a1a; --ink: #ffffff; }
        @media (prefers-color-scheme: light) {
          .taches-app { --paper: #f7f4f0; --sheet: #ffffff; --ink: #2b2b2b; }
        }
        @keyframes checkPop { 0% { transform: scale(0.7); opacity: 0.4 } 60% { transform: scale(1.2) } 100% { transform: scale(1); opacity: 1 } }
      `}</style>
      {toast && (
        <div role="status" aria-live="polite" className={`fixed top-4 left-4 right-4 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold text-center transition-all ${toast.ok ? 'bg-emerald-600' : 'bg-red-600'}`}>{toast.msg}</div>
      )}

      {etat !== 'login' && etat !== 'auth' && (
        <header className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex items-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--color-brand)' }}>checklist</span>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight leading-none">Tâches</h1>
              {compte && <p className="text-[color-mix(in_oklab,var(--ink)_45%,transparent)] text-[12px] mt-1 truncate">{compte}</p>}
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {pushSupported && (
              <button onClick={pushOn ? desactiverPush : activerPush} disabled={pushBusy}
                aria-label={pushOn ? 'Désactiver les notifications' : 'Activer les notifications'}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${pushOn ? 'bg-[var(--color-brand)] text-white' : 'bg-[color-mix(in_oklab,var(--ink)_10%,transparent)] text-[color-mix(in_oklab,var(--ink)_60%,transparent)]'} disabled:opacity-50`}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {pushOn ? 'notifications_active' : 'notifications_off'}
                </span>
              </button>
            )}
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-[color-mix(in_oklab,var(--ink)_60%,transparent)] text-xs font-bold px-3 py-2 rounded-full bg-[color-mix(in_oklab,var(--ink)_10%,transparent)] active:text-[var(--ink)]">
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
              Changer
            </button>
          </div>
        </header>
      )}

      {etat === 'auth' && <div className="flex-1 grid place-items-center text-[color-mix(in_oklab,var(--ink)_50%,transparent)]">Chargement…</div>}

      {etat === 'login' && (
        <div className="flex-1 flex flex-col items-center justify-center px-7 gap-6">
          <div className="text-center">
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-brand)' }}>checklist</span>
            <h1 className="text-xl font-extrabold mt-2">Tâches — CocktailOS</h1>
            <p className="text-[color-mix(in_oklab,var(--ink)_55%,transparent)] text-sm mt-1.5 max-w-xs">Connecte-toi <strong>une seule fois</strong> sur cet appareil. Ensuite, l&apos;app s&apos;ouvre direct sur tes tâches.</p>
          </div>
          <div className="w-full max-w-xs space-y-3">
            <input type="email" autoComplete="username" inputMode="email" className={inputCls} placeholder="Courriel"
              value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" autoComplete="current-password" className={inputCls} placeholder="Mot de passe"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleLogin() }} />
            <button onClick={handleLogin} disabled={loggingIn}
              className="w-full py-4 rounded-full bg-[var(--color-brand)] text-white font-extrabold text-base disabled:opacity-60 active:scale-[0.98] transition-transform">
              {loggingIn ? 'Connexion…' : 'Lier cet appareil'}
            </button>
          </div>
          <p className="text-[color-mix(in_oklab,var(--ink)_35%,transparent)] text-[12px] text-center max-w-xs">Réservé à l&apos;équipe. Le portail complet garde sa propre connexion.</p>
        </div>
      )}

      {etat === 'list' && (
        <>
          <div className="flex-1 overflow-y-auto px-5 pb-32">
            {loadingTasks && tasks.length === 0 && (
              <div className="text-[color-mix(in_oklab,var(--ink)_40%,transparent)] text-sm text-center mt-10">Chargement…</div>
            )}
            {!loadingTasks && activeCount === 0 && doneTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center mt-16 gap-3">
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '56px', color: 'var(--color-brand)', opacity: 0.6 }}>task_alt</span>
                <p className="text-[color-mix(in_oklab,var(--ink)_60%,transparent)] font-semibold">Rien à faire pour l&apos;instant</p>
                <p className="text-[color-mix(in_oklab,var(--ink)_35%,transparent)] text-sm max-w-[220px]">Ajoute une tâche avec le bouton en bas de l&apos;écran.</p>
              </div>
            )}
            {marketing.length > 0 && (
              <div className="mb-6">
                <p className="text-[11px] font-bold uppercase tracking-widest mb-2 text-[color-mix(in_oklab,var(--ink)_45%,transparent)]">
                  Visuels à déposer <span className="tabular-nums">· {marketing.length}</span>
                </p>
                <div className="rounded-2xl overflow-hidden bg-[color-mix(in_oklab,var(--ink)_5%,transparent)] border border-[color-mix(in_oklab,var(--ink)_10%,transparent)]">
                  {marketing.map((m, i) => (
                    <div key={m.id}
                      className={`flex items-center gap-3 px-4 py-3.5 ${i < marketing.length - 1 ? 'border-b border-[color-mix(in_oklab,var(--ink)_10%,transparent)]' : ''}`}>
                      <button onClick={() => handleMarketingToggle(m.id)} aria-label="Marquer les visuels comme déposés"
                        className="w-6 h-6 rounded-full border-2 border-[color-mix(in_oklab,var(--ink)_25%,transparent)] flex-shrink-0 active:scale-90 active:border-[var(--color-brand)] transition-all" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{m.titre}</p>
                        <p className="text-[12px] text-[color-mix(in_oklab,var(--ink)_40%,transparent)] truncate mt-0.5 flex items-center gap-1">
                          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '12px' }}>photo_camera</span>
                          {m.date_publication.slice(0, 10)}
                          {m.plateformes.length > 0 ? ` · ${m.plateformes.join(', ')}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {BUCKET_ORDER.filter(b => buckets[b].length > 0).map(b => (
              <div key={b} className="mb-6">
                <p className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${b === 'retard' ? 'text-red-400' : 'text-[color-mix(in_oklab,var(--ink)_45%,transparent)]'}`}>
                  {BUCKET_LABEL[b]} <span className="tabular-nums">· {buckets[b].length}</span>
                </p>
                <div className="rounded-2xl overflow-hidden bg-[color-mix(in_oklab,var(--ink)_5%,transparent)] border border-[color-mix(in_oklab,var(--ink)_10%,transparent)]">
                  {buckets[b].map((t, i) => {
                    const isCompleting = completingIds.has(t.id)
                    return (
                    <div key={t.id}
                      className={`flex items-center gap-3 px-4 py-3.5 ${i < buckets[b].length - 1 ? 'border-b border-[color-mix(in_oklab,var(--ink)_10%,transparent)]' : ''} transition-opacity duration-300 ${isCompleting ? 'opacity-50' : 'active:bg-[color-mix(in_oklab,var(--ink)_5%,transparent)]'}`}>
                      <button onClick={() => handleToggle(t.id)} disabled={isCompleting} aria-label="Cocher la tâche"
                        className={`w-6 h-6 rounded-full flex-shrink-0 grid place-items-center transition-all duration-300 ${isCompleting ? 'bg-[var(--color-brand)] border-2 border-[var(--color-brand)]' : 'border-2 border-[color-mix(in_oklab,var(--ink)_25%,transparent)] active:scale-90 active:border-[var(--color-brand)]'}`}>
                        {isCompleting
                          ? <span aria-hidden="true" className="material-symbols-outlined text-white" style={{ fontSize: '16px', animation: 'checkPop 0.3s ease-out' }}>check</span>
                          : <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${(PRIORITE[t.priorite as keyof typeof PRIORITE] ?? PRIORITE.normale).dot}`} />}
                      </button>
                      <button onClick={() => { setDetailId(t.id); setEditTexte(t.texte) }} className="min-w-0 flex-1 text-left">
                        <p className={`text-sm font-semibold truncate transition-all duration-300 ${isCompleting ? 'line-through text-[color-mix(in_oklab,var(--ink)_45%,transparent)]' : ''}`}>{t.texte}</p>
                        {(t.projet_nom || t.client_nom || t.date_echeance || t.contact_nom) && (
                          <p className="text-[12px] text-[color-mix(in_oklab,var(--ink)_40%,transparent)] truncate mt-0.5 flex items-center gap-1">
                            {t.calendar_event_id && <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '12px' }}>event</span>}
                            {t.contact_nom && <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '12px' }}>contact_phone</span>}
                            <span className="truncate">
                              {t.projet_nom || t.client_nom}
                              {t.projet_nom && t.client_nom ? ` · ${t.client_nom}` : ''}
                              {t.date_echeance && ISO_RE.test(t.date_echeance) && (t.projet_nom || t.client_nom ? ' · ' : '') + formatDate(t.date_echeance)}
                            </span>
                          </p>
                        )}
                      </button>
                      {t.assignees && t.assignees.length > 0 && (
                        <span className="text-[10px] font-bold text-[color-mix(in_oklab,var(--ink)_50%,transparent)] bg-[color-mix(in_oklab,var(--ink)_10%,transparent)] rounded-full px-2 py-1 flex-shrink-0">
                          {t.assignees.length > 1 ? `${t.assignees.length}` : t.assignees[0].nom_complet.split(' ')[0]}
                        </span>
                      )}
                      <button onClick={() => { setDetailId(t.id); setEditTexte(t.texte) }} aria-label="Assigné, projet, contact, calendrier…"
                        className="flex-shrink-0 text-[color-mix(in_oklab,var(--ink)_25%,transparent)] p-1 -m-1">
                        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                      </button>
                    </div>
                  )})}
                </div>
              </div>
            ))}
            {doneTasks.length > 0 && (
              <div className="mb-6">
                <p className="text-[11px] font-bold uppercase tracking-widest mb-2 text-[color-mix(in_oklab,var(--ink)_45%,transparent)]">
                  Terminées <span className="tabular-nums">· {doneTasks.length}</span>
                </p>
                <div className="rounded-2xl overflow-hidden bg-[color-mix(in_oklab,var(--ink)_5%,transparent)] border border-[color-mix(in_oklab,var(--ink)_10%,transparent)]">
                  {doneTasks.map((t, i) => (
                    <div key={t.id}
                      className={`flex items-center gap-3 px-4 py-3.5 ${i < doneTasks.length - 1 ? 'border-b border-[color-mix(in_oklab,var(--ink)_10%,transparent)]' : ''}`}>
                      <button onClick={() => handleToggle(t.id)} aria-label="Annuler — remettre la tâche active"
                        className="w-6 h-6 rounded-full bg-[var(--color-brand)] flex-shrink-0 grid place-items-center active:scale-90 transition-all">
                        <span aria-hidden="true" className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>check</span>
                      </button>
                      <p className="min-w-0 flex-1 text-sm font-semibold truncate text-[color-mix(in_oklab,var(--ink)_45%,transparent)] line-through">{t.texte}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ajout rapide — ancré dans la zone du pouce */}
          <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-3 bg-gradient-to-t from-[var(--paper)] via-[var(--paper)] to-transparent"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
            <div className="flex items-center gap-2 bg-[color-mix(in_oklab,var(--ink)_10%,transparent)] border border-[color-mix(in_oklab,var(--ink)_15%,transparent)] rounded-full pl-5 pr-2 py-2 focus-within:border-[var(--color-brand)] transition-colors">
              <input ref={inputRef} type="text" value={texte} onChange={e => setTexte(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
                placeholder="Nouvelle tâche…" disabled={sending}
                className="flex-1 min-w-0 bg-transparent outline-none text-[var(--ink)] text-base placeholder:text-[color-mix(in_oklab,var(--ink)_40%,transparent)]" />
              <button onClick={handleAdd} disabled={sending || !texte.trim()} aria-label="Ajouter la tâche"
                className="w-11 h-11 rounded-full bg-[var(--color-brand)] grid place-items-center disabled:opacity-40 active:scale-90 transition-transform flex-shrink-0">
                <span aria-hidden="true" className="material-symbols-outlined text-white" style={{ fontSize: '22px' }}>
                  {sending ? 'hourglass_top' : 'add'}
                </span>
              </button>
            </div>
          </div>

          {/* Fiche détail — assigné / projet / contact / calendrier */}
          {detail && (
            <Sheet onClose={() => setDetailId(null)}>
              <input value={editTexte} onChange={e => setEditTexte(e.target.value)}
                onBlur={() => { if (editTexte.trim() && editTexte !== detail.texte) patchTask(detail.id, { texte: editTexte.trim() }) }}
                className="w-full bg-transparent outline-none text-lg font-bold border-b border-[color-mix(in_oklab,var(--ink)_10%,transparent)] pb-2 mb-4" />

              <div className="mb-4">
                <label className={labelCls}>Priorité</label>
                <div className="flex gap-2">
                  {(['haute', 'normale', 'basse'] as const).map(p => (
                    <button key={p} onClick={() => patchTask(detail.id, { priorite: p })}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${detail.priorite === p ? 'bg-[color-mix(in_oklab,var(--ink)_15%,transparent)] ring-1 ring-[color-mix(in_oklab,var(--ink)_30%,transparent)]' : 'bg-[color-mix(in_oklab,var(--ink)_5%,transparent)] opacity-60'}`}>
                      <span className={`w-2 h-2 rounded-full ${PRIORITE[p].dot}`} />
                      {p === 'haute' ? 'Haute' : p === 'normale' ? 'Normale' : 'Basse'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className={labelCls}>Assignée à</label>
                <div className="flex flex-wrap gap-2">
                  {team.map(m => {
                    const checked = (detail.assignees || []).some(a => a.id === m.id)
                    return (
                      <button key={m.id} onClick={() => {
                        const ids = (detail.assignees || []).map(a => a.id)
                        const next = checked ? ids.filter(id => id !== m.id) : [...ids, m.id]
                        patchTask(detail.id, { assigne_admin_ids: next })
                      }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${checked ? 'bg-[var(--color-brand)] text-white' : 'bg-[color-mix(in_oklab,var(--ink)_5%,transparent)] text-[color-mix(in_oklab,var(--ink)_60%,transparent)]'}`}>
                        {m.nom_complet}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="min-w-0">
                  <label className={labelCls}>Projet</label>
                  <select className={fieldCls + ' min-w-0'} value={detail.projet_id ?? ''} onChange={e => patchTask(detail.id, { projet_id: e.target.value ? Number(e.target.value) : null })}>
                    <option value="">— Aucun —</option>
                    {projets.map(p => <option key={p.id} value={p.id}>{p.nom_projet}</option>)}
                  </select>
                </div>
                <div className="min-w-0">
                  <label className={labelCls}>Client (sans projet)</label>
                  <select className={fieldCls + ' min-w-0'} value={!detail.projet_id && detail.client_id ? detail.client_id : ''} onChange={e => patchTask(detail.id, { client_id: e.target.value ? Number(e.target.value) : null })}>
                    <option value="">— Aucun —</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.nom_complet}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className={labelCls}>Échéance</label>
                <button type="button" onClick={() => {
                  const el = dateInputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null
                  if (!el) return
                  if (typeof el.showPicker === 'function') { try { el.showPicker() } catch { el.click() } }
                  else el.click()
                }}
                  className={fieldCls + ' text-left'}>
                  {detail.date_echeance && ISO_RE.test(detail.date_echeance)
                    ? formatDateLong(detail.date_echeance)
                    : <span className="text-[color-mix(in_oklab,var(--ink)_35%,transparent)]">Choisir une date</span>}
                </button>
                <input ref={dateInputRef} type="date" tabIndex={-1} aria-hidden="true"
                  className="sr-only"
                  value={detail.date_echeance && ISO_RE.test(detail.date_echeance) ? detail.date_echeance : ''}
                  onChange={e => patchTask(detail.id, { date_echeance: e.target.value || null })} />
              </div>

              <div className="mb-2 flex items-center justify-between">
                <label className={labelCls + ' !mb-0'}>Contact</label>
                <button onClick={() => vcardInputRef.current?.click()}
                  className="text-[11px] font-bold text-[var(--color-brand)] flex items-center gap-1">
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px' }}>upload_file</span>
                  Importer (.vcf)
                </button>
                <input ref={vcardInputRef} type="file" accept=".vcf,text/vcard" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImportVCard(f); e.target.value = '' }} />
              </div>
              <div className="space-y-2 mb-6">
                <input defaultValue={detail.contact_nom || ''} placeholder="Nom du contact" className={fieldCls}
                  key={`nom-${detail.id}`}
                  onBlur={e => { if (e.target.value !== (detail.contact_nom || '')) patchTask(detail.id, { contact_nom: e.target.value || null }) }} />
                <input defaultValue={detail.contact_telephone || ''} placeholder="Téléphone" type="tel" className={fieldCls}
                  key={`tel-${detail.id}`}
                  onBlur={e => { if (e.target.value !== (detail.contact_telephone || '')) patchTask(detail.id, { contact_telephone: e.target.value || null }) }} />
                <input defaultValue={detail.contact_courriel || ''} placeholder="Courriel" type="email" className={fieldCls}
                  key={`mail-${detail.id}`}
                  onBlur={e => { if (e.target.value !== (detail.contact_courriel || '')) patchTask(detail.id, { contact_courriel: e.target.value || null }) }} />
              </div>

              <div className="flex gap-3">
                <button onClick={() => handleDelete(detail.id)}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-full bg-[color-mix(in_oklab,var(--ink)_5%,transparent)] text-red-400 text-sm font-bold">
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                  Supprimer
                </button>
                <button onClick={() => setDetailId(null)}
                  className="flex-1 py-3 rounded-full bg-[var(--color-brand)] text-white font-extrabold text-sm">
                  Fermer
                </button>
              </div>
            </Sheet>
          )}
        </>
      )}
    </div>
  )
}
