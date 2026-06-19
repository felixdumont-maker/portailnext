'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Une erreur est survenue. Veuillez réessayer.');
      } else {
        setSent(true);
      }
    } catch {
      setError('Erreur de connexion au serveur.');
    }
    setLoading(false);
  }

  return (
    <main id="main-content" style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-6)',
      background: 'var(--color-dark-1)',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
          <Image
            src="/cos-logo-blanc.png"
            alt="CocktailOS"
            width={120}
            height={32}
            priority
            style={{ height: '22px', width: 'auto', objectFit: 'contain' }}
          />
        </div>

        {!sent ? (
          <>
            {/* Heading */}
            <div style={{ marginBottom: 'var(--space-12)' }}>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 'var(--text-2xl)',
                color: 'var(--color-dark-text)',
                margin: '0 0 var(--space-2)',
                letterSpacing: '-0.02em',
                lineHeight: 'var(--leading-tight)',
              }}>
                Mot de passe oublié.
              </h1>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-dark-text-2)',
                lineHeight: 'var(--leading-normal)',
                margin: 0,
              }}>
                Entrez votre email pour recevoir un lien de réinitialisation.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label htmlFor="fp-email" style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  color: 'var(--color-dark-text-2)',
                }}>
                  Adresse email
                </label>
                <input
                  id="fp-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                  autoFocus
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-dark-text)',
                    background: 'var(--color-dark-2)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3) var(--space-4)',
                    outline: 'none',
                    width: '100%',
                    minHeight: '48px',
                    colorScheme: 'dark',
                    transition: 'border-color var(--duration-fast), background var(--duration-fast)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-brand)'; e.target.style.background = 'var(--color-input-focus-dark)' }}
                  onBlur={e  => { e.target.style.borderColor = 'var(--color-dark-border)'; e.target.style.background = 'var(--color-dark-2)' }}
                />
              </div>

              {error && (
                <p role="alert" style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-error)',
                  margin: 0,
                }}>
                  {error}
                </p>
              )}

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
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--color-brand)' }}
              >
                {loading ? 'Envoi en cours…' : 'Envoyer le lien'}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Sent state */}
            <div style={{ marginBottom: 'var(--space-12)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--color-success-glow)',
                border: '1px solid var(--color-success-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-6)',
              }}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--color-success)' }}>
                  mail
                </span>
              </div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 'var(--text-2xl)',
                color: 'var(--color-dark-text)',
                margin: '0 0 var(--space-2)',
                letterSpacing: '-0.02em',
                lineHeight: 'var(--leading-tight)',
              }}>
                Courriel envoyé.
              </h1>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-dark-text-2)',
                lineHeight: 'var(--leading-relaxed)',
                margin: 0,
              }}>
                Si un compte existe avec <strong style={{ color: 'var(--color-dark-text)' }}>{email}</strong>, vous recevrez un lien sous peu.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setSent(false); setEmail(''); }}
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
              }}
            >
              Modifier l&apos;adresse email
            </button>
          </>
        )}

        {/* Back link */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-dark-text-2)',
          textAlign: 'center',
          marginTop: 'var(--space-6)',
          marginBottom: 0,
        }}>
          <Link
            href="/"
            style={{
              color: 'var(--color-dark-text-2)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
            }}
          >
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
            Retour à la connexion
          </Link>
        </p>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-dark-text-3)',
          textAlign: 'center',
          marginTop: 'var(--space-12)',
        }}>
          © {new Date().getFullYear()} Cocktail Média
        </p>

      </div>
    </main>
  );
}
