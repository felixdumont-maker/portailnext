'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const navLinks = [
  { label: 'Tableau de bord', icon: 'grid_view',    href: '/pigiste/dashboard' },
  { label: 'Mandats',         icon: 'work',          href: '/pigiste/mandats' },
  { label: 'Factures',        icon: 'receipt_long',  href: '/pigiste/factures' },
  { label: 'Outils',          icon: 'widgets',       href: '/pigiste/outils' },
]

function isLinkActive(href: string, pathname: string) {
  return pathname.startsWith(href)
}

export default function PigisteLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [nom, setNom]           = useState('')
  const [dropdown, setDropdown] = useState(false)

  useEffect(() => {
    fetch('/api/v1/auth/me', { credentials: 'include' })
      .then(r => { if (!r.ok) { router.push('/'); return null } return r.json() })
      .then(data => {
        if (!data) return
        if (data.role !== 'pigiste') { router.push('/'); return }
        setNom(data.nom)
      })
      .catch(() => router.push('/'))
  }, [router])

  const initiales = nom
    ? nom.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '—'

  function logout() {
    fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' })
      .then(() => router.push('/'))
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-light-1)' }}>

      {/* ── Desktop navbar — floating dark pill ── */}
      <nav
        aria-label="Navigation pigiste"
        className="hidden md:flex"
        style={{
          position: 'fixed',
          top: '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 'var(--z-sticky)' as never,
          width: 'clamp(480px, 90vw, 960px)',
          height: '52px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-4)',
          background: 'var(--color-dark-1)',
          border: '1px solid var(--color-dark-border)',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Logo */}
        <button
          onClick={() => router.push('/pigiste/dashboard')}
          aria-label="Tableau de bord"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, display: 'flex', alignItems: 'center', minHeight: '44px',
          }}
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

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {navLinks.map(link => {
            const active = isLinkActive(link.href, pathname)
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: active ? 'white' : 'var(--color-dark-text-2)',
                  textDecoration: 'none',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: active ? 'var(--color-brand)' : 'transparent',
                  transition: `color var(--duration-fast), background var(--duration-fast)`,
                  minHeight: '36px',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Avatar + dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdown(d => !d)}
            aria-label="Menu compte"
            aria-expanded={dropdown}
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'var(--color-brand)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '0.75rem', color: 'white',
              transition: `background var(--duration-fast)`,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-brand-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-brand)')}
          >
            {initiales}
          </button>

          {dropdown && (
            <>
              <div
                onClick={() => setDropdown(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-dropdown)' as never }}
              />
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                background: 'var(--color-light-2)',
                border: '1px solid var(--color-light-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden', width: '190px',
                zIndex: 'calc(var(--z-dropdown) + 1)' as never,
              }}>
                {nom && (
                  <div style={{
                    padding: 'var(--space-3) var(--space-4)',
                    borderBottom: '1px solid var(--color-light-border)',
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-body)', fontWeight: 700,
                      fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', margin: 0,
                    }}>{nom}</p>
                  </div>
                )}
                <button
                  onClick={logout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    color: 'var(--color-brand)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)',
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
          background: 'var(--color-dark-1)',
          borderTop: '1px solid var(--color-dark-border)',
        }}
      >
        {navLinks.map(link => {
          const active = isLinkActive(link.href, pathname)
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '2px', padding: 'var(--space-2) var(--space-3)',
                color: active ? 'var(--color-brand)' : 'var(--color-dark-text-2)',
                textDecoration: 'none',
                transition: `color var(--duration-fast)`,
                minHeight: '44px', justifyContent: 'center',
              }}
            >
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                {link.icon}
              </span>
              <span style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', fontFamily: 'var(--font-display)',
              }}>
                {link.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Content */}
      <main style={{
        maxWidth: '1080px', margin: '0 auto',
        padding: 'var(--space-6) var(--space-6)',
        paddingTop: '80px',
        paddingBottom: '72px',
      }}>
        {children}
      </main>
    </div>
  )
}
