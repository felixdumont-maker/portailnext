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
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(circle at center, var(--color-dark-0) 0%, var(--color-dark-0) 100%)' }}
    >
      <div className="fixed -bottom-24 -left-24 w-64 h-64 bg-[var(--color-brand)]/20 blur-[120px] rounded-full -z-10" />
      <div className="fixed -top-24 -right-24 w-64 h-64 bg-[var(--color-brand)]/10 blur-[120px] rounded-full -z-10" />

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image
            src="/cos-logo-blanc.png"
            alt="CocktailOS"
            width={160}
            height={40}
            className="object-contain h-10 w-auto"
          />
        </div>

        {/* Card */}
        <div className="bg-[var(--color-dark-1)]/60 backdrop-blur-2xl rounded-3xl p-8 md:p-10 shadow-2xl border border-white/5">

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <span aria-hidden="true" className="material-symbols-outlined text-green-400 text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h2 className="font-display text-3xl text-white mb-2">MOT DE PASSE MODIFIÉ</h2>
              <p className="text-[var(--color-dark-text-2)] font-body text-sm">Redirection vers la connexion...</p>
            </div>
          ) : (
            <>
              <header className="mb-8 text-center">
                <h1 className="font-display text-4xl text-white tracking-wide mb-2">
                  NOUVEAU MOT DE PASSE
                </h1>
                <p className="font-body text-[var(--color-dark-text-2)] text-sm">
                  Définissez un nouveau mot de passe sécurisé.
                </p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Nouveau mot de passe */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--color-dark-text-2)] ml-1 font-body font-bold">
                    Nouveau mot de passe
                  </label>
                  <div className="relative group">
                    <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-dark-text-2)] group-focus-within:text-[var(--color-brand)] transition-colors">
                      lock
                    </span>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
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
                        <li key={label} className={`flex items-center gap-2 font-body text-[11px] transition-colors ${ok ? 'text-green-400' : 'text-[var(--color-dark-text-2)]'}`}>
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
                  <label className="text-[10px] uppercase tracking-widest text-[var(--color-dark-text-2)] ml-1 font-body font-bold">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative group">
                    <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-dark-text-2)] group-focus-within:text-[var(--color-brand)] transition-colors">
                      shield
                    </span>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-white/5 border-none rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none font-body"
                    />
                  </div>
                  {confirm.length > 0 && password !== confirm && (
                    <p className="text-red-400 text-[11px] font-body ml-1">
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
                    className="w-4 h-4 rounded accent-['var(--color-brand)']"
                  />
                  <span className="font-body text-[12px] text-[var(--color-dark-text-2)]">
                    Afficher les mots de passe
                  </span>
                </label>

                {error && (
                  <p className="text-red-400 text-sm font-body text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-tr from-[var(--color-brand-hover)] to-[var(--color-brand)] text-white font-display text-xl py-4 rounded-xl tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                >
                  {loading ? 'RÉINITIALISATION...' : 'METTRE À JOUR'}
                  {!loading && <span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_forward</span>}
                </button>

              </form>

              <div className="mt-8 text-center">
                <Link href="/"
                  className="inline-flex items-center gap-2 font-body text-[var(--color-dark-text-2)] text-sm hover:text-white transition-colors group">
                  <span aria-hidden="true" className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">
                    arrow_back
                  </span>
                  Retour à la connexion
                </Link>
              </div>
            </>
          )}

        </div>

        <footer className="mt-6 text-center">
          <p className="text-[10px] text-white/20 tracking-widest font-body uppercase">
            © 2026 CocktailOS — Portail Client
          </p>
        </footer>

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
