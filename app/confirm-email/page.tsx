'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

function ConfirmEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    fetch(`/api/v1/auth/confirm-email/${token}`, { credentials: 'include' })
      .then(res => res.ok ? setStatus('success') : setStatus('error'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(circle at center, var(--color-dark-0) 0%, var(--color-dark-0) 100%)' }}
    >
      {/* Halos */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-[var(--color-brand)] rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[var(--color-dark-0)] rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">

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
        <div className="bg-[var(--color-dark-1)]/80 backdrop-blur-xl rounded-3xl p-10 text-center shadow-2xl">

          {status === 'loading' && (
            <div className="py-8">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <span aria-hidden="true" className="material-symbols-outlined text-white/40 text-4xl">hourglass_empty</span>
              </div>
              <p className="text-[var(--color-dark-text-2)] font-body">Vérification en cours...</p>
            </div>
          )}

          {status === 'success' && (
            <>
              <div className="mb-8 flex justify-center">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                  <span aria-hidden="true" className="material-symbols-outlined text-5xl text-emerald-500"
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
              </div>
              <h2 className="font-display text-5xl text-white mb-4 tracking-wide">
                EMAIL CONFIRMÉ
              </h2>
              <p className="font-body text-[var(--color-dark-text-2)] text-lg mb-10 leading-relaxed">
                Votre compte est maintenant actif.
              </p>
              <Link href="/"
                className="w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] py-5 rounded-xl font-display text-xl text-white tracking-widest transition-all flex items-center justify-center gap-3 group shadow-lg">
                ACCÉDER AU PORTAIL
                <span aria-hidden="true" className="material-symbols-outlined text-2xl group-hover:translate-x-1 transition-transform">
                  arrow_right_alt
                </span>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-8 flex justify-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                  <span aria-hidden="true" className="material-symbols-outlined text-5xl text-red-400"
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                    cancel
                  </span>
                </div>
              </div>
              <h2 className="font-display text-5xl text-white mb-4 tracking-wide">
                LIEN INVALIDE
              </h2>
              <p className="font-body text-[var(--color-dark-text-2)] text-lg mb-10 leading-relaxed">
                Ce lien est expiré ou invalide. Veuillez vous réinscrire.
              </p>
              <Link href="/"
                className="w-full bg-[var(--color-dark-1)] border border-white/10 hover:bg-white/10 py-5 rounded-xl font-display text-xl text-white tracking-widest transition-all flex items-center justify-center gap-3">
                RETOUR À LA CONNEXION
              </Link>
            </>
          )}

        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] uppercase tracking-widest text-white/20 font-body">
            © 2024 CocktailOS — Portail Client
          </p>
        </div>

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
