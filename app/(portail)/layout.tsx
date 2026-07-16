'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, FileText, Hammer, Eye, CheckCircle2, Archive, Vote, Palette, type LucideIcon } from 'lucide-react';

const navLinks = [
  { label: 'Accueil',         icon: 'grid_view',    href: '/dashboard'    },
  { label: 'Mon site',        icon: 'web',          href: '/mon-site'     },
  { label: 'Facturation',     icon: 'receipt_long', href: '/facturation'  },
  { label: 'Profil',          icon: 'person',       href: '/profile'      },
];

function isLinkActive(href: string, pathname: string) {
  return href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
}

interface ClientNotif {
  id: number;
  message: string;
  id_projet: number;
  type: string;
  is_read: boolean;
  created_at: string;
}

const NOTIF_ICON: Record<string, LucideIcon> = {
  documents_requis:  FileText,
  travaux_en_cours:  Hammer,
  revision:          Eye,
  termine:           CheckCircle2,
  archive:           Archive,
  decision_board:    Vote,
  identite_visuelle: Palette,
  info:              Bell,
};

function tempsRelatif(iso: string): string {
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  const diff = (Date.now() - d.getTime()) / 1000;
  if (isNaN(diff)) return '';
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return `il y a ${Math.floor(diff / 86400)} j`;
}

function NotifBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ClientNotif[]>([]);
  const [unread, setUnread] = useState(0);

  async function charger() {
    try {
      const res = await fetch('/api/v1/notifications', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications || []);
      setUnread(data.unread || 0);
    } catch { /* silencieux */ }
  }

  useEffect(() => {
    charger();
    const t = setInterval(charger, 45000);
    return () => clearInterval(t);
  }, []);

  async function ouvrir(n: ClientNotif) {
    if (!n.is_read) {
      fetch(`/api/v1/notifications/${n.id}/read`, { method: 'POST', credentials: 'include' }).catch(() => {});
      setItems(prev => prev.map(i => i.id === n.id ? { ...i, is_read: true } : i));
      setUnread(u => Math.max(0, u - 1));
    }
    setOpen(false);
    if (n.id_projet) router.push(`/projet/${n.id_projet}`);
  }

  async function toutLire() {
    await fetch('/api/v1/notifications/read-all', { method: 'POST', credentials: 'include' }).catch(() => {});
    setItems(prev => prev.map(i => ({ ...i, is_read: true })));
    setUnread(0);
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
        <Bell aria-hidden="true" size={20} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px', minWidth: '16px', height: '16px',
            padding: '0 4px', borderRadius: '999px', background: 'var(--color-brand)',
            color: 'white', fontSize: '10px', fontWeight: 800, lineHeight: '16px',
            fontFamily: 'var(--font-display)', textAlign: 'center' as const,
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
            display: 'flex', flexDirection: 'column' as const,
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
            <div style={{ overflowY: 'auto' as const }}>
              {items.length === 0 && (
                <p style={{ padding: 'var(--space-5) var(--space-4)', textAlign: 'center' as const, color: 'var(--color-light-text-3)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)', margin: 0 }}>
                  Aucune notification
                </p>
              )}
              {items.map(n => {
                const Icon = NOTIF_ICON[n.type] || Bell;
                return (
                <button
                  key={n.id}
                  onClick={() => ouvrir(n)}
                  style={{
                    display: 'flex', gap: 'var(--space-3)', width: '100%', textAlign: 'left' as const,
                    padding: 'var(--space-3) var(--space-4)', border: 'none', cursor: 'pointer',
                    borderBottom: '1px solid var(--color-light-border)',
                    background: n.is_read ? 'transparent' : 'var(--color-light-1)',
                  }}
                >
                  <Icon aria-hidden="true" size={20} color="var(--color-brand)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontWeight: n.is_read ? 500 : 700, fontSize: 'var(--text-sm)', color: 'var(--color-light-text)' }}>{n.message}</span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-light-text-3)', marginTop: '2px' }}>{tempsRelatif(n.created_at)}</span>
                  </span>
                </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function PortailLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [nom, setNom]             = useState('');
  const [hasOutils, setHasOutils] = useState(false);
  const [hasEntrainement, setHasEntrainement] = useState(false);
  const [entrainementOnly, setEntrainementOnly] = useState(false);
  const [dropdown, setDropdown]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/v1/auth/me', { credentials: 'include' })
      .then(r => { if (!r.ok) { router.push('/'); return null; } return r.json(); })
      .then(data => { if (data) { setNom(data.nom); setHasOutils(!!data.has_outils); setHasEntrainement(!!data.has_entrainement); setEntrainementOnly(!!data.entrainement_only); } })
      .catch(() => router.push('/'));
  }, [router]);

  const initiales = nom
    ? nom.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '—';

  function logout() {
    fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' })
      .then(() => router.push('/'));
  }

  // Mode "entraînement seulement" : on masque le portail entreprise (Accueil/Soumissions)
  // et on garde uniquement la séance du jour + le profil.
  const links = entrainementOnly
    ? [
        { label: 'Ma séance', icon: 'fitness_center', href: '/entrainement' },
        { label: 'Profil',    icon: 'person',         href: '/profile'      },
      ]
    : [
        ...navLinks,
        ...(hasEntrainement ? [{ label: 'Entraînement', icon: 'fitness_center', href: '/entrainement' }] : []),
        ...(hasOutils ? [{ label: 'Outils', icon: 'construction', href: '/outils' }] : []),
      ];
  const homeHref = entrainementOnly ? '/entrainement' : '/dashboard';

  const navItemStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '0.78rem',
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: active ? 'white' : 'var(--color-dark-text-2)',
    textDecoration: 'none',
    padding: '6px 14px',
    borderRadius: 'var(--radius-md)',
    background: active ? 'var(--color-brand)' : 'transparent',
    transition: `color var(--duration-fast), background var(--duration-fast)`,
    minHeight: '36px',
    display: 'inline-flex',
    alignItems: 'center',
  });

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-light-1)' }}>

      {/* ── Desktop navbar — floating dark pill ── */}
      <nav
        aria-label="Navigation principale"
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
          onClick={() => router.push(homeHref)}
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
          <Link
            href={homeHref}
            style={navItemStyle(isLinkActive(homeHref, pathname))}
          >
            {entrainementOnly ? 'Ma séance' : 'Accueil'}
          </Link>

          {!entrainementOnly && (
            <Link
              href="/projets"
              style={navItemStyle(pathname.startsWith('/projets'))}
            >
              Projets
            </Link>
          )}

          {links.filter(l => l.href !== homeHref).map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={navItemStyle(isLinkActive(link.href, pathname))}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Notifications + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <NotifBell />

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
                <Link
                  href="/conditions"
                  onClick={() => setDropdown(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    color: 'var(--color-light-text-3)',
                    textDecoration: 'none',
                    fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)',
                    borderBottom: '1px solid var(--color-light-border)',
                  }}
                >
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>gavel</span>
                  Conditions d&apos;utilisation
                </Link>
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
        {links.map(link => {
          const active = isLinkActive(link.href, pathname);
          return (
            <Link key={link.href} href={link.href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '2px', padding: 'var(--space-2) var(--space-3)',
                color: active ? 'var(--color-brand)' : 'var(--color-dark-text-2)',
                textDecoration: 'none', transition: `color var(--duration-fast)`,
                minHeight: '44px', justifyContent: 'center', flex: 1,
              }}
            >
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '22px' }}>{link.icon}</span>
              <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
                {link.label}
              </span>
            </Link>
          );
        })}
        {/* Compte */}
        <button onClick={() => setMobileMenuOpen(true)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            padding: 'var(--space-2) var(--space-3)',
            color: mobileMenuOpen ? 'var(--color-brand)' : 'var(--color-dark-text-2)',
            background: 'none', border: 'none', cursor: 'pointer',
            minHeight: '44px', justifyContent: 'center', flex: 1,
          }}
        >
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '22px' }}>account_circle</span>
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>Compte</span>
        </button>
      </nav>

      {/* ── Mobile compte drawer ── */}
      {mobileMenuOpen && (
        <div className="md:hidden" style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'var(--color-dark-1)',
            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
            paddingBottom: 'calc(var(--space-4) + env(safe-area-inset-bottom, 0px))',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-3) 0 var(--space-2)' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'var(--color-dark-border)' }} />
            </div>
            {nom && (
              <div style={{ padding: 'var(--space-3) var(--space-5) var(--space-4)', borderBottom: '1px solid var(--color-dark-border)' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'white', margin: 0 }}>{nom}</p>
              </div>
            )}
            <Link href="/conditions" onClick={() => setMobileMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-5)', color: 'var(--color-dark-text-2)', textDecoration: 'none', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '20px' }}>gavel</span>
              Conditions d&apos;utilisation
            </Link>
            <div style={{ borderTop: '1px solid var(--color-dark-border)' }}>
              <button onClick={logout}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-5)', color: 'var(--color-brand)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page content */}
      <main id="main-content" className="pt-4 md:pt-20" style={{
        paddingBottom: '72px',
      }}>
        {children}
      </main>

    </div>
  );
}
