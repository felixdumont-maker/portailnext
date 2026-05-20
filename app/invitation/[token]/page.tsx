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

  // ── Layout wrapper commun ──
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div style={{
      minHeight: '100dvh',
      background: `radial-gradient(circle at 60% 20%, rgba(232,59,20,0.12) 0%, transparent 50%),
                   radial-gradient(circle at 0% 100%, rgba(61,6,0,0.35) 0%, transparent 50%),
                   linear-gradient(160deg, var(--color-dark-0) 0%, 'var(--color-dark-0)' 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <Image src="/cos-logo-blanc.png" alt="CocktailOS" width={140} height={36} style={{ objectFit: 'contain', height: '36px', width: 'auto' }} />
        </div>
        {children}
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'var(--color-dark-2)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>
          © 2026 CocktailOS
        </p>
      </div>
    </div>
  )

  // ── Chargement ──
  if (loadingInfo) return (
    <Wrapper>
      <div style={{ background: 'rgba(28,28,26,0.7)', backdropFilter: 'blur(40px)', borderRadius: '24px', padding: '3rem', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-dark-text-2)', fontSize: '14px' }}>Vérification du lien...</p>
      </div>
    </Wrapper>
  )

  // ── Token invalide / déjà utilisé ──
  if (tokenError) return (
    <Wrapper>
      <div style={{ background: 'rgba(28,28,26,0.7)', backdropFilter: 'blur(40px)', borderRadius: '24px', padding: '3rem 2.5rem', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', background: 'rgba(239,68,68,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ color: 'var(--color-error)', fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>error</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'white', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>LIEN INVALIDE</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-dark-text-2)', lineHeight: 1.6 }}>{tokenError}</p>
        <a href="/" style={{ display: 'inline-block', marginTop: '1.5rem', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, color: 'var(--color-dark-text-2)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          ← Retour à la connexion
        </a>
      </div>
    </Wrapper>
  )

  // ── Succès ──
  if (success) return (
    <Wrapper>
      <div style={{ background: 'rgba(28,28,26,0.7)', backdropFilter: 'blur(40px)', borderRadius: '24px', padding: '3rem 2.5rem', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', background: 'rgba(34,197,94,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ color: 'var(--color-success)', fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', color: 'white', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>COMPTE ACTIVÉ !</h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-dark-text-2)', lineHeight: 1.6 }}>
          Bienvenue, {info?.nom}. Redirection vers votre portail...
        </p>
      </div>
    </Wrapper>
  )

  // ── Formulaire principal ──
  const card: React.CSSProperties = {
    background: 'rgba(28,28,26,0.7)', backdropFilter: 'blur(40px)',
    borderRadius: '24px', padding: '2.5rem', border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 40px 80px -15px rgba(0,0,0,0.7)',
  }
  const label: React.CSSProperties = {
    display: 'block', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-dark-text-2)', marginBottom: '6px',
  }
  const input: React.CSSProperties = {
    width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.35)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
    color: 'white', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  }
  const row: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }

  return (
    <Wrapper>
      <div style={card}>
        {/* En-tête */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', color: 'white', letterSpacing: '0.1em', lineHeight: 1, marginBottom: '0.5rem' }}>
            BIENVENUE, {(info?.nom || '').toUpperCase().split(' ')[0]} !
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-dark-text-2)', lineHeight: 1.6 }}>
            Complétez votre profil et créez votre mot de passe pour accéder à votre portail client.
          </p>
          <div style={{ marginTop: '0.75rem', padding: '8px 14px', background: 'rgba(232,59,20,0.08)', borderRadius: '8px', display: 'inline-block' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-brand)', fontWeight: 600 }}>{info?.email}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ─ Section Entreprise ─ */}
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--color-dark-text-2)', letterSpacing: '0.15em', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            VOTRE ENTREPRISE
          </p>

          <div style={{ ...row, marginBottom: '1rem' }}>
            <div>
              <label style={label}>Nom de l'entreprise</label>
              <input style={input} type="text" value={nomEntreprise} onChange={e => setNomEntreprise(e.target.value)} placeholder="Acme inc." />
            </div>
            <div>
              <label style={label}>Téléphone</label>
              <input style={input} type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="819 000-0000" />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={label}>Adresse de facturation</label>
            <input style={input} type="text" value={adresse} onChange={e => setAdresse(e.target.value)} placeholder="123 rue Exemple" />
          </div>

          <div style={{ ...row, marginBottom: '1rem' }}>
            <div>
              <label style={label}>Ville</label>
              <input style={input} type="text" value={ville} onChange={e => setVille(e.target.value)} placeholder="Trois-Rivières" />
            </div>
            <div>
              <label style={label}>Province</label>
              <input style={input} type="text" value={province} onChange={e => setProvince(e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={label}>Code postal</label>
            <input style={{ ...input, maxWidth: '180px' }} type="text" value={codePostal} onChange={e => setCodePostal(e.target.value)} placeholder="G8V 1X4" />
          </div>

          {/* ─ Section Mot de passe ─ */}
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--color-dark-text-2)', letterSpacing: '0.15em', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            VOTRE MOT DE PASSE
          </p>

          <div style={{ ...row, marginBottom: '0.75rem' }}>
            <div>
              <label style={label}>Mot de passe</label>
              <input style={input} type={showPasswords ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <div>
              <label style={label}>Confirmer</label>
              <input style={input} type={showPasswords ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required />
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
              width: '100%', padding: '1.1rem',
              background: loading ? 'rgba(232,59,20,0.5)' : 'linear-gradient(135deg, var(--color-brand), var(--color-brand-hover))',
              color: 'white', border: 'none', borderRadius: '999px',
              fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.15em',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}>
            {loading ? 'ACTIVATION...' : 'ACTIVER MON COMPTE →'}
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
