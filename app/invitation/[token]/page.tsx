'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'

const API = process.env.NEXT_PUBLIC_API_URL || ''

interface InvitationInfo {
  email: string
  nom: string
  nom_entreprise: string
  telephone: string
  adresse_facturation: string
  ville_facturation: string
  province_facturation: string
  code_postal_facturation: string
}

function validatePassword(password: string): string[] {
  const errors: string[] = []
  if (password.length < 8)        errors.push('Au moins 8 caractères')
  if (!/[a-z]/.test(password))    errors.push('Une lettre minuscule')
  if (!/[A-Z]/.test(password))    errors.push('Une lettre majuscule')
  if (!/\d/.test(password))       errors.push('Un chiffre')
  if (!/[!@#$%^&*]/.test(password)) errors.push('Un caractère spécial (!@#$%^&*)')
  return errors
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" style={{
      minHeight: '100dvh',
      background: 'var(--color-dark-0)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-8) var(--space-4)',
    }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
          <Image src="/cos-logo-blanc.png" alt="CocktailOS" width={140} height={36} style={{ objectFit: 'contain', height: '36px', width: 'auto' }} />
        </div>
        {children}
        <p style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-dark-text-3)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>
          © {new Date().getFullYear()} CocktailOS
        </p>
      </div>
    </main>
  )
}

function InvitationForm() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [info, setInfo] = useState<InvitationInfo | null>(null)
  const [tokenError, setTokenError] = useState('')
  const [loadingInfo, setLoadingInfo] = useState(true)

  // Champs profil
  const [nomEntreprise, setNomEntreprise] = useState('')
  const [telephone, setTelephone] = useState('')
  const [adresse, setAdresse] = useState('')
  const [ville, setVille] = useState('')
  const [province, setProvince] = useState('Québec')
  const [codePostal, setCodePostal] = useState('')

  // Mot de passe
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const passwordErrors = validatePassword(password)
  const isStrong = passwordErrors.length === 0

  useEffect(() => {
    fetch(`${API}/api/v1/auth/invitation-info/${token}`, { credentials: 'include' })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) { setTokenError(data.error || 'Lien invalide'); return }
        setInfo(data)
        setNomEntreprise(data.nom_entreprise)
        setTelephone(data.telephone)
        setAdresse(data.adresse_facturation)
        setVille(data.ville_facturation)
        setProvince(data.province_facturation || 'Québec')
        setCodePostal(data.code_postal_facturation)
      })
      .catch(() => setTokenError('Erreur de connexion au serveur.'))
      .finally(() => setLoadingInfo(false))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!isStrong) { setError('Le mot de passe ne respecte pas les critères de sécurité.'); return }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }

    setLoading(true)
    try {
      const res = await fetch(`${API}/api/v1/auth/accept-invitation`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
          nom_entreprise: nomEntreprise,
          telephone,
          adresse_facturation: adresse,
          ville_facturation: ville,
          province_facturation: province,
          code_postal_facturation: codePostal,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Une erreur est survenue.'); setLoading(false); return }
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch {
      setError('Erreur de connexion au serveur.')
      setLoading(false)
    }
  }

  // ── Chargement ──
  if (loadingInfo) return (
    <Wrapper>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)', textAlign: 'center' }}>Vérification du lien…</p>
    </Wrapper>
  )

  // ── Token invalide / déjà utilisé ──
  if (tokenError) return (
    <Wrapper>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', background: 'var(--color-error-glow)', border: '1px solid var(--color-error-border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)' }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ color: 'var(--color-error)', fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>error</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', color: 'var(--color-dark-text)', letterSpacing: '-0.02em', lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-2)' }}>Lien invalide.</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-6)' }}>{tokenError}</p>
        <a href="/" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-dark-text-2)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
          Retour à la connexion
        </a>
      </div>
    </Wrapper>
  )

  // ── Succès ──
  if (success) return (
    <Wrapper>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', background: 'var(--color-success-glow)', border: '1px solid var(--color-success-border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)' }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ color: 'var(--color-success)', fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', color: 'var(--color-dark-text)', letterSpacing: '-0.02em', lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-2)' }}>Compte activé.</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
          Bienvenue, {info?.nom}. Redirection vers votre portail…
        </p>
      </div>
    </Wrapper>
  )

  // ── Formulaire principal ──
  const card: React.CSSProperties = {
    background: 'var(--color-dark-2)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-8)',
    border: '1px solid var(--color-dark-border)',
  }
  const label: React.CSSProperties = {
    display: 'block', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
    color: 'var(--color-dark-text-2)', marginBottom: 'var(--space-2)',
  }
  const input: React.CSSProperties = {
    width: '100%', padding: 'var(--space-3) var(--space-4)',
    background: 'var(--color-dark-2)',
    border: '1px solid var(--color-dark-border)', borderRadius: 'var(--radius-md)',
    color: 'var(--color-dark-text)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
    outline: 'none', boxSizing: 'border-box', minHeight: '44px',
    transition: 'border-color var(--duration-fast), background var(--duration-fast)',
  }
  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--color-brand)'
    e.target.style.background = 'var(--color-input-focus-dark)'
  }
  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--color-dark-border)'
    e.target.style.background = 'var(--color-dark-2)'
  }
  const row: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }

  return (
    <Wrapper>
      <div style={card}>
        {/* En-tête */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', color: 'var(--color-dark-text)', letterSpacing: '-0.02em', lineHeight: 'var(--leading-tight)', marginBottom: 'var(--space-2)' }}>
            Bienvenue, {(info?.nom || '').split(' ')[0]}.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)', lineHeight: 'var(--leading-normal)', margin: '0 0 var(--space-3)' }}>
            Complétez votre profil et créez votre mot de passe pour accéder à votre portail client.
          </p>
          <div style={{ padding: 'var(--space-2) var(--space-3)', background: 'var(--color-error-glow)', borderRadius: 'var(--radius-sm)', display: 'inline-block' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-brand-text-muted)', fontWeight: 600 }}>{info?.email}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ─ Section Entreprise ─ */}
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-dark-text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-dark-border)' }}>
            Votre entreprise
          </h2>

          <div style={{ ...row, marginBottom: 'var(--space-4)' }}>
            <div>
              <label htmlFor="inv-entreprise" style={label}>Nom de l'entreprise</label>
              <input id="inv-entreprise" style={input} type="text" value={nomEntreprise} onChange={e => setNomEntreprise(e.target.value)} placeholder="Acme inc." onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label htmlFor="inv-telephone" style={label}>Téléphone</label>
              <input id="inv-telephone" style={input} type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="819 000-0000" onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label htmlFor="inv-adresse" style={label}>Adresse de facturation</label>
            <input id="inv-adresse" style={input} type="text" value={adresse} onChange={e => setAdresse(e.target.value)} placeholder="123 rue Exemple" onFocus={inputFocus} onBlur={inputBlur} />
          </div>

          <div style={{ ...row, marginBottom: 'var(--space-4)' }}>
            <div>
              <label htmlFor="inv-ville" style={label}>Ville</label>
              <input id="inv-ville" style={input} type="text" value={ville} onChange={e => setVille(e.target.value)} placeholder="Trois-Rivières" onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label htmlFor="inv-province" style={label}>Province</label>
              <input id="inv-province" style={input} type="text" value={province} onChange={e => setProvince(e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-8)' }}>
            <label htmlFor="inv-codepostal" style={label}>Code postal</label>
            <input id="inv-codepostal" style={{ ...input, maxWidth: '180px' }} type="text" value={codePostal} onChange={e => setCodePostal(e.target.value)} placeholder="G8V 1X4" onFocus={inputFocus} onBlur={inputBlur} />
          </div>

          {/* ─ Section Mot de passe ─ */}
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-dark-text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-dark-border)' }}>
            Votre mot de passe
          </h2>

          <div style={{ ...row, marginBottom: 'var(--space-3)' }}>
            <div>
              <label htmlFor="inv-password" style={label}>Mot de passe</label>
              <input id="inv-password" style={input} type={showPasswords ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label htmlFor="inv-confirm" style={label}>Confirmer</label>
              <input id="inv-confirm" style={input} type={showPasswords ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          </div>

          {/* Indicateurs de force */}
          {password.length > 0 && (
            <ul style={{ margin: '0 0 0.75rem', padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              {[
                { label: '8 caractères min.', ok: password.length >= 8 },
                { label: 'Majuscule',          ok: /[A-Z]/.test(password) },
                { label: 'Minuscule',          ok: /[a-z]/.test(password) },
                { label: 'Chiffre',            ok: /\d/.test(password) },
                { label: 'Caractère spécial',  ok: /[!@#$%^&*]/.test(password) },
              ].map(({ label: l, ok }) => (
                <li key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)', fontSize: '11px', color: ok ? 'var(--color-success)' : 'var(--color-dark-text-2)', transition: 'color 0.2s' }}>
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: ok ? "'FILL' 1" : "'FILL' 0" }}>
                    {ok ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  {l}
                </li>
              ))}
            </ul>
          )}

          {/* Confirmation mismatch */}
          {confirm.length > 0 && password !== confirm && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-error)', marginBottom: '0.75rem' }}>
              Les mots de passe ne correspondent pas.
            </p>
          )}

          {/* Toggle afficher */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '1.5rem' }}>
            <input type="checkbox" checked={showPasswords} onChange={e => setShowPasswords(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--color-brand)' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-dark-text-2)' }}>Afficher les mots de passe</span>
          </label>

          {/* Erreur globale */}
          {error && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-error)', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>
          )}

          {/* Bouton submit */}
          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: 'var(--space-4)',
              background: loading ? 'var(--color-dark-3)' : 'var(--color-brand)',
              color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'var(--text-base)', letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              minHeight: '52px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
              transition: 'background var(--duration-fast)',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--color-brand-hover)' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--color-brand)' }}
          >
            {loading ? 'Activation…' : 'Activer mon compte'}
          </button>

        </form>
      </div>
    </Wrapper>
  )
}

export default function InvitationPage() {
  return (
    <Suspense>
      <InvitationForm />
    </Suspense>
  )
}
