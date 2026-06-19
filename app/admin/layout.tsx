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

        {/* Avatar + account dropdown */}
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
