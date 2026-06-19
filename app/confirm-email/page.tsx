'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || ''

function ResendForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleResend(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || status !== 'idle') return
    setStatus('sending')
    try {
      await fetch(`${API}/api/v1/auth/resend-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-success)', margin: '0 0 var(--space-4)', textAlign: 'center' }}>
        ✓ Si cette adresse est associée à un compte non confirmé, un nouveau lien vient d&apos;être envoyé.
      </p>
    )
  }

  return (
    <form onSubmit={handleResend} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Votre adresse courriel"
        required
        style={{
          background: 'var(--color-dark-2)',
          border: '1px solid var(--color-dark-border)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-dark-text)',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
      <button
        type="submit"
        disabled={status === 'sending' || !email.trim()}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
          minHeight: '44px',
          background: 'var(--color-brand)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-body)', fontWeight: 700,
          fontSize: 'var(--text-sm)',
          border: 'none', cursor: 'pointer',
          opacity: status === 'sending' || !email.trim() ? 0.5 : 1,
          transition: 'opacity var(--duration-fast)',
        }}
      >
        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>mail</span>
        {status === 'sending' ? 'Envoi…' : 'Renvoyer le lien de confirmation'}
      </button>
      {status === 'error' && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-error)', margin: 0, textAlign: 'center' }}>
          Erreur réseau — réessayez.
        </p>
      )}
    </form>
  )
}

function ConfirmEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'already_confirmed' | 'expired' | 'error'>('loading')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    fetch(`${API}/api/v1/auth/confirm-email/${token}`, { credentials: 'include' })
      .then(async res => {
        if (res.ok) {
          const data = await res.json()
          setStatus(data.already_confirmed ? 'already_confirmed' : 'success')
        } else {
          const data = await res.json().catch(() => ({}))
          if (data.error === 'already_confirmed') setStatus('already_confirmed')
          else if (data.error === 'expired') setStatus('expired')
          else setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [token])

  const iconStyle: React.CSSProperties = {
    width: '48px', height: '48px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto var(--space-6)',
  }

  const btnPrimary: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
    width: '100%', minHeight: '52px',
    background: 'var(--color-brand)',
    color: 'white',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-display)', fontWeight: 700,
    fontSize: 'var(--text-base)', letterSpacing: '0.08em', textTransform: 'uppercase',
    textDecoration: 'none',
    transition: 'background var(--duration-fast)',
  }

  const btnSecondary: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '48px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-dark-border)',
    fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 700,
    color: 'var(--color-dark-text-2)', textDecoration: 'none',
    transition: 'background var(--duration-fast), color var(--duration-fast)',
  }

  return (
    <main
      id="main-content"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
        background: 'var(--color-dark-1)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px' }}>

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

        <div aria-live="polite" aria-atomic="true">

          {status === 'loading' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...iconStyle, background: 'var(--color-dark-2)' }} className="animate-pulse">
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--color-dark-text-3)' }}>hourglass_empty</span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)', margin: 0 }}>
                Vérification en cours…
              </p>
            </div>
          )}

          {status === 'success' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...iconStyle, background: 'var(--color-success-glow)', border: '1px solid var(--color-success-border)' }}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--color-success)', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', color: 'var(--color-dark-text)', margin: '0 0 var(--space-2)', letterSpacing: '-0.02em', lineHeight: 'var(--leading-tight)' }}>
                Compte confirmé.
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)', margin: '0 0 var(--space-8)', lineHeight: 'var(--leading-relaxed)' }}>
                Votre compte est maintenant actif.
              </p>
              <Link href="/" style={btnPrimary}>
                Accéder au portail
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
              </Link>
            </div>
          )}

          {status === 'already_confirmed' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...iconStyle, background: 'var(--color-success-glow)', border: '1px solid var(--color-success-border)' }}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--color-success)', fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', color: 'var(--color-dark-text)', margin: '0 0 var(--space-2)', letterSpacing: '-0.02em', lineHeight: 'var(--leading-tight)' }}>
                Compte déjà actif.
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)', margin: '0 0 var(--space-8)', lineHeight: 'var(--leading-relaxed)' }}>
                Votre compte est déjà confirmé. Vous pouvez vous connecter directement.
              </p>
              <Link href="/" style={btnPrimary}>
                Se connecter
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
              </Link>
            </div>
          )}

          {(status === 'expired' || status === 'error') && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...iconStyle, background: 'var(--color-error-glow)', border: '1px solid var(--color-error-border)' }}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--color-error)', fontVariationSettings: "'FILL' 1" }}>cancel</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', color: 'var(--color-dark-text)', margin: '0 0 var(--space-2)', letterSpacing: '-0.02em', lineHeight: 'var(--leading-tight)' }}>
                {status === 'expired' ? 'Lien expiré.' : 'Lien invalide.'}
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)', margin: '0 0 var(--space-6)', lineHeight: 'var(--leading-relaxed)' }}>
                Entrez votre adresse courriel pour recevoir un nouveau lien.
              </p>
              <ResendForm />
              <Link
                href="/"
                style={btnSecondary}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-dark-2)'; e.currentTarget.style.color = 'var(--color-dark-text)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-dark-text-2)' }}
              >
                Retour à la connexion
              </Link>
            </div>
          )}

        </div>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-dark-text-3)', textAlign: 'center', marginTop: 'var(--space-12)' }}>
          © {new Date().getFullYear()} Cocktail Média
        </p>

      </div>
    </main>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense>
      <ConfirmEmailContent />
    </Suspense>
  )
}
