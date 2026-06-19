'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const API = process.env.NEXT_PUBLIC_API_URL || ''

function validatePassword(password: string): string[] {
  const errors: string[] = []
  if (password.length < 8) errors.push('Au moins 8 caractères')
  if (!/[a-z]/.test(password)) errors.push('Une lettre minuscule')
  if (!/[A-Z]/.test(password)) errors.push('Une lettre majuscule')
  if (!/\d/.test(password)) errors.push('Un chiffre')
  if (!/[!@#$%^&*]/.test(password)) errors.push('Un caractère spécial (!@#$%^&*)')
  return errors
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const passwordErrors = validatePassword(password)
  const isStrong = passwordErrors.length === 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Token manquant. Utilisez le lien reçu par email.')
      return
    }

    if (!isStrong) {
      setError('Le mot de passe ne respecte pas les critères de sécurité.')
      return
    }

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, password }),
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push('/'), 2500)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Lien invalide ou expiré.')
      }
    } catch {
      setError('Erreur de connexion au serveur.')
    }
    setLoading(false)
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

          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'var(--color-success-glow)', border: '1px solid var(--color-success-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto var(--space-6)',
              }}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--color-success)', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', color: 'var(--color-dark-text)', margin: '0 0 var(--space-2)', letterSpacing: '-0.02em', lineHeight: 'var(--leading-tight)' }}>
                Mot de passe modifié.
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)', margin: 0 }}>Redirection vers la connexion…</p>
            </div>
          ) : (
            <>
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
                  Nouveau mot de passe.
                </h1>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)', margin: 0, lineHeight: 'var(--leading-normal)' }}>
                  Définissez un nouveau mot de passe sécurisé.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Nouveau mot de passe */}
                <div className="space-y-2">
                  <label htmlFor="rp-password" className="font-body font-bold" style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)', marginBottom: 'var(--space-2)' }}>
                    Nouveau mot de passe
                  </label>
                  <div className="relative group">
                    <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-dark-text-2)] group-focus-within:text-[var(--color-brand)] transition-colors">
                      lock
                    </span>
                    <input
                      id="rp-password"
                      type={showPasswords ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      className="w-full bg-white/5 border-none rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none font-body"
                    />
                  </div>

                  {/* Indicateurs de force */}
                  {password.length > 0 && (
                    <ul className="space-y-1 mt-2 ml-1">
                      {[
                        { label: 'Au moins 8 caractères', ok: password.length >= 8 },
                        { label: 'Lettre majuscule', ok: /[A-Z]/.test(password) },
                        { label: 'Lettre minuscule', ok: /[a-z]/.test(password) },
                        { label: 'Chiffre', ok: /\d/.test(password) },
                        { label: 'Caractère spécial (!@#$%^&*)', ok: /[!@#$%^&*]/.test(password) },
                      ].map(({ label, ok }) => (
                        <li key={label} className="flex items-center gap-2 font-body text-[11px] transition-colors" style={{ color: ok ? 'var(--color-success)' : 'var(--color-dark-text-2)' }}>
                          <span aria-hidden="true" className="material-symbols-outlined text-sm"
                            style={{ fontVariationSettings: "'FILL' 1" }}>
                            {ok ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          {label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Confirmer */}
                <div className="space-y-2">
                  <label htmlFor="rp-confirm" className="font-body font-bold" style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)', marginBottom: 'var(--space-2)' }}>
                    Confirmer le mot de passe
                  </label>
                  <div className="relative group">
                    <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-dark-text-2)] group-focus-within:text-[var(--color-brand)] transition-colors">
                      shield
                    </span>
                    <input
                      id="rp-confirm"
                      type={showPasswords ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      className="w-full bg-white/5 border-none rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none font-body"
                    />
                  </div>
                  {confirm.length > 0 && password !== confirm && (
                    <p className="font-body ml-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>
                      Les mots de passe ne correspondent pas.
                    </p>
                  )}
                </div>

                {/* Toggle afficher mots de passe */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={e => setShowPasswords(e.target.checked)}
                    className="w-4 h-4 rounded accent-[var(--color-brand)]"
                  />
                  <span className="font-body text-[12px] text-[var(--color-dark-text-2)]">
                    Afficher les mots de passe
                  </span>
                </label>

                {error && (
                  <p role="alert" className="font-body text-center" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-error)' }}>{error}</p>
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
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--color-brand-hover)' }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--color-brand)' }}
                >
                  {loading ? 'Mise à jour…' : 'Mettre à jour'}
                  {!loading && <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>}
                </button>

              </form>

              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)', textAlign: 'center', marginTop: 'var(--space-6)', marginBottom: 0 }}>
                <Link
                  href="/"
                  style={{ color: 'var(--color-dark-text-2)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}
                >
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                  Retour à la connexion
                </Link>
              </p>
            </>
          )}

        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-dark-text-3)', textAlign: 'center', marginTop: 'var(--space-12)' }}>
          © {new Date().getFullYear()} Cocktail Média
        </p>

      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
