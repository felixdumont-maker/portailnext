'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

function ForceChangePasswordModal({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [newPassword, setNewPassword]     = useState('');
  const [confirm, setConfirm]             = useState('');
  const [showNew, setShowNew]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (newPassword !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(redirectTo);
      } else {
        setError(data.error || 'Erreur lors du changement.');
        setLoading(false);
      }
    } catch {
      setError('Impossible de joindre le serveur.');
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--color-dark-2)',
    border: '1px solid var(--color-dark-border)', borderRadius: 'var(--radius-md)',
    padding: '12px 14px', color: 'var(--color-dark-text)',
    fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-4)',
    }}>
      <div style={{
        background: 'var(--color-dark-1)', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-dark-border)',
        padding: 'var(--space-8)', width: '100%', maxWidth: '420px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto var(--space-4)',
            background: 'rgba(var(--color-brand-rgb), 0.12)',
            border: '1px solid rgba(var(--color-brand-rgb), 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--color-brand)', fontVariationSettings: "'FILL' 1" }}>lock_reset</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--color-dark-text)', margin: '0 0 var(--space-2)', letterSpacing: '-0.02em' }}>
            Choisissez votre mot de passe
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)', margin: 0, lineHeight: 'var(--leading-relaxed)' }}>
            Votre compte utilise un mot de passe temporaire. Veuillez en choisir un nouveau pour continuer.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ position: 'relative' }}>
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
              required
              autoFocus
              style={{ ...inputStyle, paddingRight: '44px' }}
            />
            <button type="button" onClick={() => setShowNew(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-dark-text-2)', padding: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{showNew ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Confirmer le mot de passe"
              required
              style={{ ...inputStyle, paddingRight: '44px' }}
            />
            <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-dark-text-2)', padding: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{showConfirm ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-dark-text-3)', margin: '0' }}>
            Min. 8 caractères · majuscule · minuscule · chiffre · caractère spécial
          </p>

          {error && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-error)', margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !newPassword || !confirm}
            style={{
              marginTop: 'var(--space-2)',
              minHeight: '52px', borderRadius: 'var(--radius-md)',
              background: 'var(--color-brand)', color: 'white', border: 'none',
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'var(--text-base)', letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: loading || !newPassword || !confirm ? 'not-allowed' : 'pointer',
              opacity: loading || !newPassword || !confirm ? 0.5 : 1,
              transition: 'opacity var(--duration-fast)',
            }}
          >
            {loading ? 'Enregistrement…' : 'Enregistrer et accéder au portail'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [showPassword, setShowPassword]     = useState(false);
  const [error, setError]                   = useState('');
  const [loading, setLoading]               = useState(false);
  const [emailUnconfirmed, setEmailUnconfirmed] = useState(false);
  const [resendStatus, setResendStatus]     = useState<'idle' | 'sending' | 'sent'>('idle');
  const [forceChangeRedirect, setForceChangeRedirect] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEmailUnconfirmed(false);
    try {
      const res  = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        const dest = data.user.role === 'pigiste' ? '/pigiste/dashboard' : (data.user.is_admin ? '/admin' : '/dashboard');
        if (data.force_password_change) {
          setForceChangeRedirect(dest);
        } else {
          router.push(dest);
        }
      } else {
        if (res.status === 403 && data.error?.toLowerCase().includes('confirmé')) {
          setEmailUnconfirmed(true);
        }
        setError(data.error || 'Identifiants incorrects.');
      }
    } catch {
      setError('Impossible de joindre le serveur.');
      setLoading(false);
    }
  }

  async function handleResendConfirmation() {
    if (resendStatus !== 'idle') return;
    setResendStatus('sending');
    try {
      await fetch('/api/v1/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      setResendStatus('sent');
    } catch {
      setResendStatus('idle');
    }
  }

  return (
    <>
    {forceChangeRedirect && <ForceChangePasswordModal redirectTo={forceChangeRedirect} />}
    <main id="main-content" style={{
      minHeight: '100dvh',
      display: 'flex',
      background: 'var(--color-dark-1)',
    }}>
      {/* h1 sr-only pour la hiérarchie mobile (le panel gauche avec h1 est hidden md:flex) */}
      <h1 className="sr-only">CocktailOS — Portail Client</h1>

      {/* ── Left panel — brand statement (desktop only) ── */}
      <div
        className="hidden md:flex"
        style={{
          width: '45%',
          flexShrink: 0,
          background: 'linear-gradient(170deg, var(--color-dark-0) 55%, var(--color-login-gradient-end) 100%)',
          flexDirection: 'column',
          padding: 'var(--space-8)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '1px 0 0 0 var(--color-dark-border)',
        }}
      >
        {/* Logo — pinned top */}
        <Image
          src="/cos-logo-blanc.png"
          alt="CocktailOS"
          width={120}
          height={32}
          priority
          style={{ height: '22px', width: 'auto', objectFit: 'contain', flexShrink: 0 }}
        />

        {/* Spacer — pushes headline into lower third */}
        <div style={{ flex: 1 }} />

        {/* Headline — anchored in lower half */}
        <div style={{ paddingBottom: 'var(--space-12)' }}>
          <div style={{
            width: '32px',
            height: '3px',
            background: 'var(--color-brand)',
            borderRadius: '2px',
            marginBottom: 'var(--space-6)',
          }} />
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(2.4rem, 3.6vw, 3.25rem)',
            lineHeight: 1.08,
            color: 'var(--color-dark-text)',
            margin: '0 0 var(--space-6)',
            letterSpacing: '-0.02em',
          }}>
            Votre projet,<br />
            <span style={{ color: 'var(--color-brand)' }}>suivi.</span>
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-dark-text-2)',
            lineHeight: 'var(--leading-relaxed)',
            maxWidth: '34ch',
            margin: 0,
          }}>
            Accédez à vos livrables, suivez l'avancement et échangez avec l'équipe Cocktail Média.
          </p>
        </div>

        {/* Footer */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-dark-text-3)',
          margin: 0,
          flexShrink: 0,
        }}>
          © {new Date().getFullYear()} Cocktail Média
        </p>

        {/* Watermark — large icon at low opacity */}
        <div style={{
          position: 'absolute',
          bottom: '-40px',
          right: '-40px',
          width: '300px',
          height: '300px',
          opacity: 0.06,
          pointerEvents: 'none',
        }}>
          <Image
            src="/cos-icone-blanc.png"
            alt=""
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8) var(--space-6)',
      }}>

        {/* Mobile logo */}
        <div className="flex md:hidden" style={{ marginBottom: 'var(--space-8)' }}>
          <Image
            src="/cos-logo-blanc.png"
            alt="CocktailOS"
            width={120}
            height={32}
            priority
            style={{ height: '22px', width: 'auto', objectFit: 'contain' }}
          />
        </div>

        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Heading */}
          <div style={{ marginBottom: 'var(--space-12)' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'var(--text-2xl)',
              color: 'var(--color-dark-text)',
              margin: '0 0 var(--space-2)',
              letterSpacing: '-0.02em',
              lineHeight: 'var(--leading-tight)',
            }}>
              Bon retour.
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-dark-text-2)',
              lineHeight: 'var(--leading-normal)',
              margin: 0,
            }}>
              Connectez-vous à votre portail
            </p>
          </div>

          {/* Error */}
          {error && (
            <div role="alert" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              background: 'var(--color-error-glow)',
              border: '1px solid var(--color-error-border)',
              color: 'var(--color-brand-text-muted)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3) var(--space-4)',
              marginBottom: 'var(--space-4)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-normal)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>
                  error
                </span>
                {error}
              </div>
              {emailUnconfirmed && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resendStatus !== 'idle'}
                  style={{
                    marginTop: 'var(--space-1)',
                    alignSelf: 'flex-start',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: resendStatus !== 'idle' ? 'default' : 'pointer',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    color: resendStatus === 'sent' ? 'var(--color-success)' : 'var(--color-brand-text-hover)',
                    textDecoration: resendStatus === 'idle' ? 'underline' : 'none',
                    textUnderlineOffset: '3px',
                  }}
                >
                  {resendStatus === 'idle' && '→ Renvoyer le courriel de confirmation'}
                  {resendStatus === 'sending' && 'Envoi en cours…'}
                  {resendStatus === 'sent' && '✓ Courriel envoyé — vérifiez votre boîte'}
                </button>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} noValidate aria-busy={loading} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
          }}>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label
                htmlFor="email"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  color: 'var(--color-dark-text-2)',
                }}
              >
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                autoFocus
                autoComplete="email"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-dark-text)',
                  background: 'var(--color-dark-2)',
                  border: '1px solid var(--color-dark-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3) var(--space-4)',
                  outline: 'none',
                  transition: 'border-color var(--duration-fast), background var(--duration-fast)',
                  width: '100%',
                  minHeight: '48px',
                  colorScheme: 'dark',
                }}
                onFocus={e  => { e.target.style.borderColor = 'var(--color-brand)'; e.target.style.background = 'var(--color-input-focus-dark)' }}
                onBlur={e   => { e.target.style.borderColor = 'var(--color-dark-border)'; e.target.style.background = 'var(--color-dark-2)' }}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label
                  htmlFor="password"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 700,
                    color: 'var(--color-dark-text-2)',
                  }}
                >
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-brand-text-muted)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'color var(--duration-fast)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-brand-text-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-brand-text-muted)')}
                >
                  Mot de passe oublié?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-dark-text)',
                    background: 'var(--color-dark-2)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3) 52px var(--space-3) var(--space-4)',
                    outline: 'none',
                    transition: 'border-color var(--duration-fast), background var(--duration-fast)',
                    width: '100%',
                    minHeight: '48px',
                    colorScheme: 'dark',
                  }}
                  onFocus={e  => { e.target.style.borderColor = 'var(--color-brand)'; e.target.style.background = 'var(--color-input-focus-dark)' }}
                  onBlur={e   => { e.target.style.borderColor = 'var(--color-dark-border)'; e.target.style.background = 'var(--color-dark-2)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  style={{
                    position: 'absolute',
                    right: 'var(--space-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-dark-text-3)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 'var(--space-2)',
                    minHeight: '44px',
                    transition: 'color var(--duration-fast)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-dark-text)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-dark-text-3)')}
                >
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'var(--text-base)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'white',
                background: loading ? 'var(--color-dark-3)' : 'var(--color-brand)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                cursor: loading ? 'not-allowed' : 'pointer',
                width: '100%',
                minHeight: '52px',
                transition: 'background var(--duration-fast)',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--color-brand-hover)' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = loading ? 'var(--color-dark-3)' : 'var(--color-brand)' }}
            >
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', justifyContent: 'center' }}>
                  <span className="animate-spin" style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.25)',
                    borderTopColor: 'white',
                    flexShrink: 0,
                  }} />
                  Connexion…
                </span>
              ) : 'Se connecter'}
            </button>
          </form>

          {/* Register */}
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-dark-text-2)',
            lineHeight: 'var(--leading-normal)',
            textAlign: 'center',
            marginTop: 'var(--space-6)',
            marginBottom: 0,
          }}>
            Pas encore de compte?{' '}
            <button
              type="button"
              onClick={() => router.push('/register')}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-brand-text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                textDecorationColor: 'color-mix(in oklch, var(--color-brand-text-muted) 45%, transparent)',
                transition: 'color var(--duration-fast), text-decoration-color var(--duration-fast)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--color-brand-text-hover)'
                e.currentTarget.style.textDecorationColor = 'color-mix(in oklch, var(--color-brand-text-hover) 50%, transparent)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--color-brand-text-muted)'
                e.currentTarget.style.textDecorationColor = 'color-mix(in oklch, var(--color-brand-text-muted) 45%, transparent)'
              }}
            >
              Créer un compte
            </button>
          </p>

        </div>
      </div>

    </main>
    </>
  );
}
