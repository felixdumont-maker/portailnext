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
    <div style={{
      minHeight: '100dvh', margin: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '1.5rem',
      background: `radial-gradient(circle at 50% 50%, rgba(232,59,20,0.15) 0%, transparent 50%),
                   radial-gradient(circle at 0% 0%, rgba(61,6,0,0.4) 0%, transparent 50%),
                   radial-gradient(circle at 100% 100%, rgba(28,28,26,1) 0%, #000 100%)`,
      backgroundColor: 'var(--color-dark-0)',
    }}>
      <main style={{ width: '100%', maxWidth: '450px', position: 'relative', zIndex: 10 }}>

        {/* Card */}
        <div style={{
          background: 'rgba(28,28,26,0.7)', backdropFilter: 'blur(40px)',
          borderRadius: '24px', padding: '3rem 2.5rem',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 40px 80px -15px rgba(0,0,0,0.7)',
          position: 'relative', overflow: 'hidden',
        }}>

          {/* Déco blur */}
          <div style={{ position: 'absolute', bottom: '-4rem', right: '-4rem', width: '12rem', height: '12rem', background: 'rgba(232,59,20,0.15)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '-4rem', left: '-4rem', width: '8rem', height: '8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />

          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--color-brand)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 0 32px rgba(232,59,20,0.4)' }}>
              <Image src="/cos-icone-blanc.png" alt="CocktailOS" width={32} height={32} style={{ objectFit: 'contain' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', letterSpacing: '0.2em', color: 'white' }}>COCKTAILOS</span>
          </div>

          {!sent ? (
            <>
              {/* Titre */}
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', color: 'white', letterSpacing: '0.1em', lineHeight: 1, marginBottom: '1rem' }}>
                  MOT DE PASSE OUBLIÉ
                </h1>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-dark-text-2)', lineHeight: 1.6, maxWidth: '280px', margin: '0 auto' }}>
                  Entrez votre email pour recevoir un lien de réinitialisation
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-dark-text-2)', marginBottom: '8px' }}>
                    Adresse email
                  </label>
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="nom@entreprise.com"
                    style={{ width: '100%', padding: '14px 18px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                {error && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-error)', textAlign: 'center', margin: '0' }}>
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading}
                  style={{ width: '100%', padding: '1.1rem', background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-hover))', color: 'white', border: 'none', borderRadius: '999px', fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.15em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'ENVOI...' : 'ENVOYER LE LIEN →'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'white', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>EMAIL ENVOYÉ</h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-dark-text-2)', lineHeight: 1.6 }}>
                Si un compte existe avec cette adresse, vous recevrez un lien sous peu.
              </p>
            </div>
          )}

          {/* Lien retour */}
          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <Link href="/" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, color: 'var(--color-dark-text-2)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              ← Retour à la connexion
            </Link>
          </div>

        </div>

        {/* Footer */}
        <p style={{ marginTop: '2rem', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'var(--color-dark-2)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>
          © 2026 CocktailOS
        </p>
      </main>
    </div>
  );
}
