'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface AdminUser { nom: string; email: string; is_admin: boolean }
type NavChild = { label: string; icon: string; href: string }
type NavGroup = { label: string; icon: string; href?: string; children?: NavChild[] }

const NAV_GROUPS: NavGroup[] = [
  { label: 'Dashboard', icon: 'grid_view', href: '/admin' },
  {
    label: 'CRM', icon: 'group',
    children: [
      { label: 'Clients',  icon: 'group',       href: '/admin/clients'  },
      { label: 'Projets',  icon: 'folder_open', href: '/admin/projets'  },
      { label: 'Services', icon: 'layers',       href: '/admin/services' },
      { label: 'Ressources', icon: 'menu_book',  href: '/admin/ressources' },
    ],
  },
  {
    label: 'Équipe', icon: 'handyman',
    children: [
      { label: 'Pigistes',          icon: 'handyman',     href: '/admin/pigistes'          },
      { label: 'Mandats',           icon: 'assignment',   href: '/admin/mandats-pigistes'  },
      { label: 'Factures pigistes', icon: 'receipt_long', href: '/admin/factures-pigistes' },
      { label: 'Outils',            icon: 'widgets',      href: '/admin/outils'            },
    ],
  },
  {
    label: 'Marketing', icon: 'campaign',
    children: [
      { label: 'Marketing', icon: 'campaign', href: '/admin/marketing' },
      { label: 'Roadmaps',  icon: 'timeline', href: '/admin/roadmaps'  },
      { label: 'Changelog', icon: 'history',  href: '/admin/changelog' },
    ],
  },
  {
    label: 'Contenu', icon: 'folder_special',
    children: [
      { label: 'Sites',         icon: 'web',         href: '/admin/sites'                 },
      { label: 'Soumissions',   icon: 'description', href: '/admin/soumissions'           },
      { label: 'Templates',     icon: 'article',      href: '/admin/soumissions/templates' },
      { label: 'Conditions',    icon: 'gavel',        href: '/admin/conditions'            },
    ],
  },
]

function isGroupActive(group: NavGroup, pathname: string): boolean {
  if (group.href) return group.href === '/admin' ? pathname === '/admin' : pathname.startsWith(group.href)
  return group.children?.some(c => pathname.startsWith(c.href)) ?? false
}

interface AdminNotif {
  id: number
  type: string
  titre: string
  message: string | null
  lien: string | null
  is_read: number
  created_at: string
}

function tempsRelatif(iso: string): string {
  // created_at est en UTC (CURRENT_TIMESTAMP SQLite) : "2026-07-02 14:38:00"
  const d = new Date(iso.replace(' ', 'T') + 'Z')
  const diff = (Date.now() - d.getTime()) / 1000
  if (isNaN(diff)) return ''
  if (diff < 60) return "à l'instant"
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`
  return `il y a ${Math.floor(diff / 86400)} j`
}

const NOTIF_ICON: Record<string, string> = {
  info: 'info', todo: 'checklist', todoist: 'add_task',
  assignation: 'person_add', facture: 'receipt_long', agenda: 'event',
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

function NotifBell() {
  const router = useRouter()
  const [open, setOpen]       = useState(false)
  const [items, setItems]     = useState<AdminNotif[]>([])
  const [unread, setUnread]   = useState(0)
  const [pushOn, setPushOn]   = useState(false)
  const [pushBusy, setPushBusy] = useState(false)
  const pushSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window

  useEffect(() => {
    if (!pushSupported) return
    navigator.serviceWorker.getRegistration().then(reg => {
      reg?.pushManager.getSubscription().then(sub => setPushOn(!!sub))
    })
  }, [pushSupported])

  async function activerPush() {
    if (!pushSupported || pushBusy) return
    setPushBusy(true)
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setPushBusy(false); return }
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const keyRes = await fetch('/api/v1/admin/push/vapid-public-key', { credentials: 'include' })
      const { key } = await keyRes.json()
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      })
      await fetch('/api/v1/admin/push/subscribe', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
      setPushOn(true)
    } catch (e) { console.error('push subscribe', e) }
    setPushBusy(false)
  }

  async function desactiverPush() {
    if (pushBusy) return
    setPushBusy(true)
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      const sub = await reg?.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/v1/admin/push/unsubscribe', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setPushOn(false)
    } catch (e) { console.error('push unsubscribe', e) }
    setPushBusy(false)
  }

  async function charger() {
    try {
      const res = await fetch('/api/v1/admin/notifications', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      setItems(data.items || [])
      setUnread(data.unread || 0)
    } catch { /* silencieux */ }
  }

  useEffect(() => {
    charger()
    const t = setInterval(charger, 45000)
    return () => clearInterval(t)
  }, [])

  async function ouvrir(n: AdminNotif) {
    if (!n.is_read) {
      fetch(`/api/v1/admin/notifications/${n.id}/read`, { method: 'POST', credentials: 'include' }).catch(() => {})
      setItems(prev => prev.map(i => i.id === n.id ? { ...i, is_read: 1 } : i))
      setUnread(u => Math.max(0, u - 1))
    }
    setOpen(false)
    if (n.lien) router.push(n.lien)
  }

  async function toutLire() {
    await fetch('/api/v1/admin/notifications/read-all', { method: 'POST', credentials: 'include' }).catch(() => {})
    setItems(prev => prev.map(i => ({ ...i, is_read: 1 })))
    setUnread(0)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={`Notifications${unread ? ` (${unread} non lues)` : ''}`}
        aria-expanded={open}
        style={{
          width: '34px', height: '34px', borderRadius: '50%',
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', position: 'relative',
        }}
      >
        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '22px' }}>notifications</span>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px', minWidth: '16px', height: '16px',
            padding: '0 4px', borderRadius: '999px', background: 'var(--color-brand)',
            color: 'white', fontSize: '10px', fontWeight: 800, lineHeight: '16px',
            fontFamily: 'var(--font-display)', textAlign: 'center',
          }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-dropdown)' as never }} />
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 10px)',
            background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
            overflow: 'hidden', width: '320px', maxHeight: '420px',
            display: 'flex', flexDirection: 'column',
            zIndex: 'calc(var(--z-dropdown) + 1)' as never,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-light-border)',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--color-light-text)' }}>Notifications</span>
              {unread > 0 && (
                <button onClick={toutLire} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-brand)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-body)', fontWeight: 600,
                }}>Tout marquer lu</button>
              )}
            </div>
            <div style={{ overflowY: 'auto' }}>
              {items.length === 0 && (
                <p style={{ padding: 'var(--space-5) var(--space-4)', textAlign: 'center', color: 'var(--color-light-text-3)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)', margin: 0 }}>
                  Aucune notification
                </p>
              )}
              {items.map(n => (
                <button
                  key={n.id}
                  onClick={() => ouvrir(n)}
                  style={{
                    display: 'flex', gap: 'var(--space-3)', width: '100%', textAlign: 'left',
                    padding: 'var(--space-3) var(--space-4)', border: 'none', cursor: 'pointer',
                    borderBottom: '1px solid var(--color-light-border)',
                    background: n.is_read ? 'transparent' : 'var(--color-light-1)',
                  }}
                >
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-brand)', flexShrink: 0 }}>
                    {NOTIF_ICON[n.type] || 'notifications'}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontWeight: n.is_read ? 500 : 700, fontSize: 'var(--text-sm)', color: 'var(--color-light-text)' }}>{n.titre}</span>
                    {n.message && <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</span>}
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-light-text-3)', marginTop: '2px' }}>{tempsRelatif(n.created_at)}</span>
                  </span>
                </button>
              ))}
            </div>
            {pushSupported && (
              <button
                onClick={pushOn ? desactiverPush : activerPush}
                disabled={pushBusy}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)', justifyContent: 'center',
                  padding: 'var(--space-3)', borderTop: '1px solid var(--color-light-border)',
                  background: 'none', border: 'none', borderTopStyle: 'solid', cursor: 'pointer',
                  color: pushOn ? 'var(--color-brand)' : 'var(--color-light-text-3)',
                  fontSize: 'var(--text-xs)', fontFamily: 'var(--font-body)', fontWeight: 600, width: '100%',
                  opacity: pushBusy ? 0.5 : 1,
                }}
              >
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {pushOn ? 'notifications_active' : 'notifications_off'}
                </span>
                {pushOn ? 'Notifications téléphone activées' : 'Activer les notifications téléphone'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [user, setUser]             = useState<AdminUser | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [openGroup, setOpenGroup]   = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch('/api/v1/auth/me', { credentials: 'include' })
      .then(res => { if (!res.ok) { router.push('/'); return null } return res.json() })
      .then(data => {
        if (!data) return
        if (!data.is_admin) { router.push('/dashboard'); return }
        setUser(data)
      })
      .catch(() => router.push('/'))
  }, [router])

  const initiales = user?.nom
    ? user.nom.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'

  function logout() {
    fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' })
      .then(() => router.push('/'))
  }

  function showGroup(label: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenGroup(label)
  }
  function hideGroup() {
    closeTimer.current = setTimeout(() => setOpenGroup(null), 150)
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-light-1)' }}>

      {/* ── Desktop navbar — floating dark pill ── */}
      <nav
        aria-label="Navigation admin"
        className="hidden md:flex"
        style={{
          position: 'fixed',
          top: '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 'var(--z-sticky)' as never,
          width: 'clamp(420px, 72vw, 780px)',
          height: '52px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-5)',
          background: 'var(--color-dark-1)',
          border: '1px solid var(--color-dark-border)',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Logo */}
        <button
          onClick={() => router.push('/admin')}
          aria-label="Dashboard"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', minHeight: '44px' }}
        >
          <Image
            src="/cos-logo-blanc.png"
            alt="CocktailOS"
            width={110}
            height={28}
            loading="eager"
            style={{ objectFit: 'contain', height: '22px', width: 'auto' }}
          />
        </button>

        {/* Nav groups */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {NAV_GROUPS.map(group => {
            const isActive = isGroupActive(group, pathname)
            const isOpen   = openGroup === group.label

            /* ── Solo link (Dashboard) ── */
            if (!group.children) {
              return (
                <Link
                  key={group.label}
                  href={group.href!}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: isActive ? 'white' : 'var(--color-dark-text-2)',
                    textDecoration: 'none',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'var(--color-brand)' : 'transparent',
                    transition: 'color var(--duration-fast), background var(--duration-fast)',
                    minHeight: '36px',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {group.label}
                </Link>
              )
            }

            /* ── Group with dropdown ── */
            return (
              <div
                key={group.label}
                style={{ position: 'relative' }}
                onMouseEnter={() => showGroup(group.label)}
                onMouseLeave={hideGroup}
              >
                <button
                  aria-expanded={isOpen}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: isActive ? 'white' : 'var(--color-dark-text-2)',
                    background: isActive
                      ? 'var(--color-brand)'
                      : isOpen
                        ? 'rgba(255,255,255,0.07)'
                        : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    transition: 'color var(--duration-fast), background var(--duration-fast)',
                    minHeight: '36px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  {group.label}
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '15px',
                      opacity: 0.65,
                      transition: 'transform var(--duration-fast)',
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                    }}
                  >
                    expand_more
                  </span>
                </button>

                {/* Dropdown panel */}
                {isOpen && (
                  <div
                    onMouseEnter={() => showGroup(group.label)}
                    onMouseLeave={hideGroup}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--color-dark-1)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-xl)',
                      overflow: 'hidden',
                      minWidth: '170px',
                      zIndex: 200,
                      padding: 'var(--space-1) 0',
                    }}
                  >
                    {group.children.map(child => {
                      const childActive = pathname.startsWith(child.href)
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpenGroup(null)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-3)',
                            padding: '9px 16px',
                            color: childActive ? 'var(--color-brand)' : 'var(--color-dark-text-2)',
                            textDecoration: 'none',
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: childActive ? 700 : 400,
                            background: childActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                            whiteSpace: 'nowrap',
                            transition: 'background var(--duration-fast), color var(--duration-fast)',
                          }}
                          onMouseEnter={e => {
                            if (!childActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'
                          }}
                          onMouseLeave={e => {
                            if (!childActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
                          }}
                        >
                          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            {child.icon}
                          </span>
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Notifications + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <NotifBell />
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setAccountOpen(d => !d)}
            aria-label="Menu compte"
            aria-expanded={accountOpen}
            style={{
              width: '34px', height: '34px',
              borderRadius: '50%',
              background: 'var(--color-brand)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '0.75rem', color: 'white',
              transition: 'background var(--duration-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-brand-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-brand)')}
          >
            {initiales}
          </button>

          {accountOpen && (
            <>
              <div
                onClick={() => setAccountOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-dropdown)' as never }}
              />
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
                borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
                overflow: 'hidden', width: '190px',
                zIndex: 'calc(var(--z-dropdown) + 1)' as never,
              }}>
                {user && (
                  <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-light-border)' }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', margin: 0 }}>{user.nom}</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 0 }}>{user.email}</p>
                  </div>
                )}
                <button
                  onClick={logout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    color: 'var(--color-brand)', background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)',
                    width: '100%', textAlign: 'left',
                  }}
                >
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                  Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
        </div>
      </nav>

      {/* ── Mobile navbar — bottom tabs ── */}
      <nav
        aria-label="Navigation"
        className="flex md:hidden"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          zIndex: 'var(--z-sticky)' as never,
          justifyContent: 'space-around', alignItems: 'center',
          padding: 'var(--space-1) 0',
          paddingBottom: 'calc(var(--space-1) + env(safe-area-inset-bottom, 0px))',
          background: 'var(--color-dark-1)', borderTop: '1px solid var(--color-dark-border)',
        }}
      >
        {[
          { label: 'Dashboard', icon: 'grid_view',    href: '/admin' },
          { label: 'Projets',   icon: 'folder_open',  href: '/admin/projets' },
          { label: 'Clients',   icon: 'group',         href: '/admin/clients' },
          { label: 'Nouveau',   icon: 'add_circle',    href: '/admin/projets/new' },
        ].map(tab => {
          const isActive = tab.href === '/admin' ? pathname === '/admin' : pathname.startsWith(tab.href)
          return (
            <Link key={tab.href} href={tab.href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                padding: 'var(--space-2) var(--space-3)',
                color: isActive ? 'var(--color-brand)' : 'var(--color-dark-text-2)',
                textDecoration: 'none', transition: 'color var(--duration-fast)',
                minHeight: '44px', justifyContent: 'center', flex: 1,
              }}
            >
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '22px' }}>{tab.icon}</span>
              <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
                {tab.label}
              </span>
            </Link>
          )
        })}
        <button
          onClick={() => setMobileMenuOpen(true)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            padding: 'var(--space-2) var(--space-3)',
            color: mobileMenuOpen ? 'var(--color-brand)' : 'var(--color-dark-text-2)',
            background: 'none', border: 'none', cursor: 'pointer',
            minHeight: '44px', justifyContent: 'center', flex: 1,
          }}
        >
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '22px' }}>menu</span>
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>Menu</span>
        </button>
      </nav>

      {/* ── Mobile drawer — tous les liens ── */}
      {mobileMenuOpen && (
        <div className="md:hidden" style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          {/* Backdrop */}
          <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          {/* Drawer */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'var(--color-dark-1)',
            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
            paddingBottom: 'calc(var(--space-4) + env(safe-area-inset-bottom, 0px))',
            maxHeight: '85dvh', overflowY: 'auto',
          }}>
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-3) 0 var(--space-2)' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'var(--color-dark-border)' }} />
            </div>
            {/* User */}
            {user && (
              <div style={{ padding: 'var(--space-3) var(--space-5) var(--space-4)', borderBottom: '1px solid var(--color-dark-border)' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'white', margin: 0 }}>{user.nom}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-dark-text-2)', margin: 0 }}>{user.email}</p>
              </div>
            )}
            {/* All nav links */}
            {NAV_GROUPS.map(group => (
              <div key={group.label}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-dark-text-2)', padding: 'var(--space-4) var(--space-5) var(--space-1)', margin: 0 }}>
                  {group.label}
                </p>
                {group.children ? group.children.map(child => {
                  const isActive = pathname.startsWith(child.href)
                  return (
                    <Link key={child.href} href={child.href} onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                        padding: 'var(--space-3) var(--space-5)',
                        color: isActive ? 'var(--color-brand)' : 'var(--color-dark-text-2)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: isActive ? 700 : 400,
                        background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                      }}>
                      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '20px' }}>{child.icon}</span>
                      {child.label}
                    </Link>
                  )
                }) : (
                  <Link href={group.href!} onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                      padding: 'var(--space-3) var(--space-5)',
                      color: (group.href === '/admin' ? pathname === '/admin' : pathname.startsWith(group.href!)) ? 'var(--color-brand)' : 'var(--color-dark-text-2)',
                      textDecoration: 'none',
                      fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                    }}>
                    <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '20px' }}>{group.icon}</span>
                    {group.label}
                  </Link>
                )}
              </div>
            ))}
            {/* Déconnexion */}
            <div style={{ borderTop: '1px solid var(--color-dark-border)', margin: 'var(--space-2) 0 0' }}>
              <button onClick={logout}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-4) var(--space-5)',
                  color: 'var(--color-brand)', background: 'none', border: 'none',
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                }}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <main id="main-content" style={{
        paddingTop: '80px',
        paddingBottom: '72px',
        paddingLeft: 'var(--space-6)',
        paddingRight: 'var(--space-6)',
      }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          {children}
        </div>
      </main>

    </div>
  )
}
