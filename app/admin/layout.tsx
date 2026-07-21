'use client'

import { useEffect, useState } from 'react'
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
    label: 'Comptabilité', icon: 'account_balance_wallet',
    children: [
      { label: 'Factures',  icon: 'request_quote', href: '/admin/factures' },
      { label: 'À valider', icon: 'inbox',       href: '/admin/comptabilite/a-valider' },
      { label: 'Revenus',   icon: 'trending_up', href: '/admin/comptabilite/revenus'   },
      { label: 'Dépenses',  icon: 'payments',    href: '/admin/comptabilite/depenses'  },
      { label: 'État des résultats', icon: 'summarize', href: '/admin/comptabilite/bilan' },
      { label: 'Taxes',     icon: 'receipt_long', href: '/admin/comptabilite/taxes' },
    ],
  },
  {
    label: 'Contenu', icon: 'folder_special',
    children: [
      { label: 'Sites',         icon: 'web',         href: '/admin/sites'                 },
      { label: 'Boutique',      icon: 'storefront',  href: '/admin/boutique'              },
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
  info: 'info', todo: 'checklist',
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
  const [user, setUser]                     = useState<AdminUser | null>(null)
  const [accountOpen, setAccountOpen]       = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [collapsed, setCollapsed]           = useState(false)
  const [openGroups, setOpenGroups]         = useState<Set<string>>(() => {
    const s = new Set<string>()
    NAV_GROUPS.forEach(g => { if (g.children && isGroupActive(g, pathname)) s.add(g.label) })
    return s
  })

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

  // Restaure la préférence de repli de la sidebar
  useEffect(() => {
    try { if (localStorage.getItem('admin-sidebar-collapsed') === '1') setCollapsed(true) } catch {}
  }, [])

  // Garde le groupe actif ouvert lors de la navigation
  useEffect(() => {
    NAV_GROUPS.forEach(g => {
      if (g.children && isGroupActive(g, pathname)) {
        setOpenGroups(prev => (prev.has(g.label) ? prev : new Set(prev).add(g.label)))
      }
    })
  }, [pathname])

  const initiales = user?.nom
    ? user.nom.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'

  function logout() {
    fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' })
      .then(() => router.push('/'))
  }

  function setCollapsedPersist(v: boolean) {
    setCollapsed(v)
    try { localStorage.setItem('admin-sidebar-collapsed', v ? '1' : '0') } catch {}
  }
  function toggleCollapse() { setCollapsedPersist(!collapsed) }

  function toggleGroup(label: string) {
    setOpenGroups(prev => {
      const n = new Set(prev)
      if (n.has(label)) n.delete(label); else n.add(label)
      return n
    })
  }

  // Style commun d'un item de nav de la sidebar (dépend de `collapsed`)
  const navItemStyle = (active: boolean, strong: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
    justifyContent: collapsed ? 'center' : 'flex-start',
    padding: collapsed ? '10px 0' : '9px 12px',
    width: '100%', minHeight: '40px',
    borderRadius: 'var(--radius-md)',
    border: 'none', cursor: 'pointer',
    color: active ? 'white' : 'var(--color-dark-text-2)',
    background: active ? (strong ? 'var(--color-brand)' : 'rgba(255,255,255,0.06)') : 'transparent',
    textDecoration: 'none',
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.02em',
    transition: 'background var(--duration-fast), color var(--duration-fast)',
  })
  const hoverOn  = (active: boolean) => (e: React.MouseEvent<HTMLElement>) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }
  const hoverOff = (active: boolean) => (e: React.MouseEvent<HTMLElement>) => { if (!active) e.currentTarget.style.background = 'transparent' }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-light-1)',
      ['--admin-sidebar-w' as string]: collapsed ? '54px' : '220px',
    } as React.CSSProperties}>

      {/* marge du contenu = largeur sidebar (desktop uniquement) */}
      <style>{`
        #main-content {
          margin-left: 0;
          padding: var(--space-6);
          padding-bottom: 72px;
          transition: margin-left var(--duration-base) var(--ease-out-quart);
        }
        @media (min-width: 768px) {
          #main-content {
            margin-left: var(--admin-sidebar-w, 220px);
            padding-bottom: var(--space-8);
          }
        }
      `}</style>

      {/* ── Desktop sidebar — verticale collapsible ── */}
      <aside
        aria-label="Navigation admin"
        className="hidden md:flex"
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          zIndex: 'var(--z-sticky)' as never,
          width: collapsed ? '54px' : '220px',
          flexDirection: 'column',
          background: 'var(--color-dark-1)',
          borderRight: '1px solid var(--color-dark-border)',
          transition: 'width var(--duration-base) var(--ease-out-quart)',
          overflow: 'hidden',
        }}
      >
        {/* Header : logo + toggle collapse */}
        <div style={{
          display: 'flex',
          flexDirection: collapsed ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: collapsed ? 'var(--space-2)' : 0,
          padding: collapsed ? 'var(--space-4) 0' : 'var(--space-4)',
          minHeight: '60px',
          borderBottom: '1px solid var(--color-dark-border)',
        }}>
          <button
            onClick={() => router.push('/admin')}
            aria-label="Dashboard"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
          >
            <Image
              src={collapsed ? '/cos-icone-blanc.png' : '/cos-logo-blanc.png'}
              alt="CocktailOS"
              width={collapsed ? 26 : 110}
              height={collapsed ? 26 : 28}
              loading="eager"
              style={{ objectFit: 'contain', height: collapsed ? '24px' : '22px', width: 'auto' }}
            />
          </button>
          <button
            onClick={toggleCollapse}
            aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-dark-text-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '30px', height: '30px', borderRadius: 'var(--radius-sm)',
              transition: 'color var(--duration-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-dark-text-2)')}
          >
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {collapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        {/* Nav groups */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 'var(--space-3) var(--space-2)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_GROUPS.map(group => {
            const active = isGroupActive(group, pathname)

            /* ── Lien simple (Dashboard) ── */
            if (!group.children) {
              return (
                <Link
                  key={group.label}
                  href={group.href!}
                  title={collapsed ? group.label : undefined}
                  style={navItemStyle(active, true)}
                  onMouseEnter={hoverOn(active)}
                  onMouseLeave={hoverOff(active)}
                >
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '22px', flexShrink: 0 }}>{group.icon}</span>
                  {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.label}</span>}
                </Link>
              )
            }

            /* ── Groupe avec enfants (expand/collapse au clic) ── */
            const open = openGroups.has(group.label)
            return (
              <div key={group.label}>
                <button
                  aria-expanded={open}
                  title={collapsed ? group.label : undefined}
                  onClick={() => {
                    if (collapsed) {
                      setCollapsedPersist(false)
                      setOpenGroups(prev => new Set(prev).add(group.label))
                    } else {
                      toggleGroup(group.label)
                    }
                  }}
                  style={navItemStyle(active, false)}
                  onMouseEnter={hoverOn(active)}
                  onMouseLeave={hoverOff(active)}
                >
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '22px', flexShrink: 0 }}>{group.icon}</span>
                  {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.label}</span>}
                  {!collapsed && (
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined"
                      style={{ fontSize: '18px', marginLeft: 'auto', opacity: 0.6, transition: 'transform var(--duration-fast)', transform: open ? 'rotate(180deg)' : 'none' }}
                    >
                      expand_more
                    </span>
                  )}
                </button>

                {open && !collapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', margin: '2px 0 var(--space-1)' }}>
                    {group.children.map(child => {
                      const childActive = pathname.startsWith(child.href)
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                            padding: '8px 10px 8px 42px',
                            borderRadius: 'var(--radius-sm)',
                            color: childActive ? 'var(--color-brand)' : 'var(--color-dark-text-2)',
                            textDecoration: 'none',
                            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: childActive ? 700 : 400,
                            background: childActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                            transition: 'background var(--duration-fast), color var(--duration-fast)',
                          }}
                          onMouseEnter={e => { if (!childActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
                          onMouseLeave={e => { if (!childActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                        >
                          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>{child.icon}</span>
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Bas de sidebar : notifications + avatar */}
        <div style={{
          borderTop: '1px solid var(--color-dark-border)',
          padding: 'var(--space-3)',
          display: 'flex',
          flexDirection: collapsed ? 'column' : 'row',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}>
          <NotifBell />
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setAccountOpen(d => !d)}
              aria-label="Menu compte"
              aria-expanded={accountOpen}
              style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'var(--color-brand)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.75rem', color: 'white',
                transition: 'background var(--duration-fast)', flexShrink: 0,
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
                  position: 'absolute', left: 0, bottom: 'calc(100% + 10px)',
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
          {!collapsed && user && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-xs)', color: 'white', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.nom}</p>
            </div>
          )}
        </div>
      </aside>

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
      <main id="main-content">
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {children}
        </div>
      </main>

    </div>
  )
}
