'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const STEP_DEFS = [
  { num: 1, label: 'Email',      title: 'Commençons.',        sub: 'Quelle est votre adresse email?' },
  { num: 2, label: 'Identité',   title: 'Qui êtes-vous?',     sub: 'Vos informations personnelles' },
  { num: 3, label: 'Entreprise', title: 'Votre entreprise.',  sub: 'Pour les travailleurs autonomes, inscrivez votre nom' },
  { num: 4, label: 'Sécurité',   title: 'Mot de passe.',      sub: 'Choisissez un mot de passe fort' },
];

function getPasswordStrength(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)) s++;
  return s;
}

const strengthLabel = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];
const strengthColor = ['', 'var(--color-error)', 'var(--color-warning)', 'var(--color-success-62)', 'var(--color-success)'];

const inputStyle: React.CSSProperties = {
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
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  fontWeight: 700,
  color: 'var(--color-dark-text-2)',
  display: 'block',
  marginBottom: 'var(--space-2)',
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep]           = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [showPw2, setShowPw2]         = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');

  const [form, setForm] = useState({
    email:          '',
    nom_complet:    '',
    telephone:      '',
    nom_entreprise: '',
    password:       '',
    password2:      '',
  });

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step < 4) {
      const t = setTimeout(() => firstInputRef.current?.focus(), 260);
      return () => clearTimeout(t);
    }
  }, [step]);

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  }

  function next() {
    if (step === 0 && !form.email)          { setError('Adresse email requise'); return; }
    if (step === 0 && !/\S+@\S+\.\S+/.test(form.email)) { setError('Adresse email invalide'); return; }
    if (step === 1 && !form.nom_complet)    { setError('Nom complet requis'); return; }
    if (step === 2 && !form.nom_entreprise) { setError("Nom d'entreprise requis"); return; }
    setDirection('forward');
    setStep(s => s + 1);
    setError('');
  }

  function back() {
    setDirection('back');
    setStep(s => s - 1);
    setError('');
  }

  async function submit() {
    if (form.password.length < 8)                       { setError('Minimum 8 caractères'); return; }
    if (form.password !== form.password2)               { setError('Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    try {
      const res  = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setDirection('forward');
        setStep(4);
      } else {
        if (data.unconfirmed) setUnconfirmedEmail(form.email);
        setError(data.error || "Erreur lors de l'inscription");
      }
    } catch {
      setError('Erreur de connexion au serveur');
    }
    setLoading(false);
  }

  const pwStrength = getPasswordStrength(form.password);

  const slideAnim: React.CSSProperties = {
    animation: `${direction === 'forward' ? 'slideInRight' : 'slideInLeft'} 250ms cubic-bezier(0.25, 1, 0.5, 1) both`,
  };

  return (
    <main id="main-content" style={{ minHeight: '100dvh', display: 'flex', background: 'var(--color-dark-1)' }}>

      {/* ── Left panel (desktop) ── */}
      <div
        className="hidden md:flex"
        style={{
          width: '38%',
          flexShrink: 0,
          background: 'linear-gradient(170deg, var(--color-dark-0) 55%, var(--color-login-gradient-end) 100%)',
          flexDirection: 'column',
          padding: 'var(--space-8)',
          boxShadow: '1px 0 0 0 var(--color-dark-border)',
          position: 'relative',
          overflow: 'hidden',
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

        {/* Spacer — pushes content into lower half */}
        <div style={{ flex: 1 }} />

        {/* Heading + step list — anchored in lower half */}
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
            fontSize: 'clamp(2rem, 3vw, 2.75rem)',
            lineHeight: 1.08,
            color: 'var(--color-dark-text)',
            margin: '0 0 var(--space-8)',
            letterSpacing: '-0.02em',
          }}>
            Créez votre<br />
            <span style={{ color: 'var(--color-brand)' }}>compte.</span>
          </h1>

          {/* Step list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', position: 'relative' }}>
            {/* Vertical connecting line */}
            <div style={{
              position: 'absolute',
              left: '13px',
              top: '28px',
              width: '1px',
              height: 'calc(100% - 40px)',
              background: 'var(--color-dark-border)',
            }} />

            {STEP_DEFS.map((s, i) => {
              const done    = step > i || step === 4;
              const current = step === i;
              return (
                <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', position: 'relative' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: done ? 'var(--color-brand)' : current ? 'var(--color-dark-2)' : 'var(--color-dark-1)',
                    border: `1px solid ${done || current ? 'var(--color-brand)' : 'var(--color-dark-border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all var(--duration-base)',
                    zIndex: 1,
                  }}>
                    {done
                      ? <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px', color: 'white' }}>check</span>
                      : <span style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: 'var(--text-xs)',
                          color: current ? 'var(--color-brand)' : 'var(--color-dark-text-3)',
                        }}>{s.num}</span>
                    }
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: done ? 'var(--color-dark-text-2)' : current ? 'var(--color-dark-text)' : 'var(--color-dark-text-3)',
                    fontWeight: current ? 700 : 400,
                    transition: 'color var(--duration-base)',
                  }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-dark-text-3)',
          margin: 0,
          flexShrink: 0,
        }}>
          © {new Date().getFullYear()} Cocktail Média
        </p>

        {/* Watermark */}
        <div style={{
          position: 'absolute',
          bottom: '-40px',
          right: '-40px',
          width: '300px',
          height: '300px',
          opacity: 0.06,
          pointerEvents: 'none',
        }}>
          <Image src="/cos-icone-blanc.png" alt="" fill style={{ objectFit: 'contain' }} />
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
        <div className="flex md:hidden" style={{ marginBottom: 'var(--space-6)' }}>
          <Image
            src="/cos-logo-blanc.png"
            alt="CocktailOS"
            width={120}
            height={32}
            priority
            style={{ height: '22px', width: 'auto', objectFit: 'contain' }}
          />
        </div>

        {/* Mobile step dots */}
        {step < 4 && (
          <div className="flex md:hidden" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-6)', display: 'flex' }}>
            {STEP_DEFS.map((_, i) => (
              <div key={i} style={{
                width: i === step ? '20px' : '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                background: i < step ? 'var(--color-brand)' : i === step ? 'var(--color-brand)' : 'var(--color-dark-border)',
                transition: 'all var(--duration-base)',
              }} />
            ))}
          </div>
        )}

        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* ── Animated card ── */}
          <div key={step} style={slideAnim} aria-live="polite" aria-atomic="true">

            {/* Steps 0–3 */}
            {step < 4 && (
              <>
                {/* Step label */}
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-dark-text-3)',
                  margin: '0 0 var(--space-3)',
                }}>
                  Étape {step + 1} sur 4
                </p>

                {/* Heading */}
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 'var(--text-2xl)',
                  color: 'var(--color-dark-text)',
                  margin: '0 0 var(--space-2)',
                  letterSpacing: '-0.02em',
                  lineHeight: 'var(--leading-tight)',
                }}>
                  {STEP_DEFS[step].title}
                </h2>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-dark-text-2)',
                  lineHeight: 'var(--leading-normal)',
                  margin: '0 0 var(--space-12)',
                }}>
                  {STEP_DEFS[step].sub}
                </p>

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
                      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>error</span>
                      {error}
                    </div>
                    {unconfirmedEmail && (
                      <button type="button"
                        onClick={async () => {
                          if (resendStatus !== 'idle') return;
                          setResendStatus('sending');
                          try { await fetch('/api/v1/auth/resend-confirmation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email: unconfirmedEmail }) }); } catch {}
                          setResendStatus('sent');
                        }}
                        disabled={resendStatus !== 'idle'}
                        style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, cursor: resendStatus !== 'idle' ? 'default' : 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: resendStatus === 'sent' ? 'var(--color-success)' : 'var(--color-brand-text-hover)', textDecoration: resendStatus === 'idle' ? 'underline' : 'none', textUnderlineOffset: '3px' }}>
                        {resendStatus === 'idle' && '→ Renvoyer le courriel de confirmation'}
                        {resendStatus === 'sending' && 'Envoi en cours…'}
                        {resendStatus === 'sent' && '✓ Courriel envoyé — vérifiez votre boîte'}
                      </button>
                    )}
                  </div>
                )}

                {/* ── Step 0: Email ── */}
                {step === 0 && (
                  <form onSubmit={e => { e.preventDefault(); next(); }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <div>
                      <label htmlFor="email" style={labelStyle}>Adresse email</label>
                      <input
                        ref={firstInputRef}
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={e => set('email', e.target.value)}
                        placeholder="vous@exemple.com"
                        autoComplete="email"
                        required
                        style={inputStyle}
                        onFocus={e  => { e.target.style.borderColor = 'var(--color-brand)'; e.target.style.background = 'var(--color-input-focus-dark)' }}
                        onBlur={e   => { e.target.style.borderColor = 'var(--color-dark-border)'; e.target.style.background = 'var(--color-dark-2)' }}
                      />
                    </div>
                    <Btn type="submit">Continuer</Btn>
                    <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-3)', margin: 0 }}>
                      Déjà un compte?{' '}
                      <InlineLink onClick={() => router.push('/')}>Se connecter</InlineLink>
                    </p>
                  </form>
                )}

                {/* ── Step 1: Identité ── */}
                {step === 1 && (
                  <form onSubmit={e => { e.preventDefault(); next(); }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <div>
                      <label htmlFor="nom" style={labelStyle}>Nom complet</label>
                      <input
                        ref={firstInputRef}
                        id="nom"
                        type="text"
                        value={form.nom_complet}
                        onChange={e => set('nom_complet', e.target.value)}
                        placeholder="Prénom Nom"
                        autoComplete="name"
                        required
                        style={inputStyle}
                        onFocus={e => { e.target.style.borderColor = 'var(--color-brand)'; e.target.style.background = 'var(--color-input-focus-dark)' }}
                        onBlur={e  => { e.target.style.borderColor = 'var(--color-dark-border)'; e.target.style.background = 'var(--color-dark-2)' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="tel" style={labelStyle}>
                        Téléphone{' '}
                        <span style={{ fontWeight: 400, color: 'var(--color-dark-text-3)' }}>(optionnel)</span>
                      </label>
                      <input
                        id="tel"
                        type="tel"
                        value={form.telephone}
                        onChange={e => set('telephone', e.target.value)}
                        placeholder="514 000-0000"
                        autoComplete="tel"
                        style={inputStyle}
                        onFocus={e => { e.target.style.borderColor = 'var(--color-brand)'; e.target.style.background = 'var(--color-input-focus-dark)' }}
                        onBlur={e  => { e.target.style.borderColor = 'var(--color-dark-border)'; e.target.style.background = 'var(--color-dark-2)' }}
                      />
                    </div>
                    <BtnRow onBack={back}><Btn type="submit">Continuer</Btn></BtnRow>
                  </form>
                )}

                {/* ── Step 2: Entreprise ── */}
                {step === 2 && (
                  <form onSubmit={e => { e.preventDefault(); next(); }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <div>
                      <label htmlFor="entreprise" style={labelStyle}>Nom d'entreprise</label>
                      <input
                        ref={firstInputRef}
                        id="entreprise"
                        type="text"
                        value={form.nom_entreprise}
                        onChange={e => set('nom_entreprise', e.target.value)}
                        placeholder="Mon Entreprise Inc."
                        autoComplete="organization"
                        required
                        style={inputStyle}
                        onFocus={e => { e.target.style.borderColor = 'var(--color-brand)'; e.target.style.background = 'var(--color-input-focus-dark)' }}
                        onBlur={e  => { e.target.style.borderColor = 'var(--color-dark-border)'; e.target.style.background = 'var(--color-dark-2)' }}
                      />
                    </div>
                    <BtnRow onBack={back}><Btn type="submit">Continuer</Btn></BtnRow>
                  </form>
                )}

                {/* ── Step 3: Mot de passe ── */}
                {step === 3 && (
                  <form onSubmit={e => { e.preventDefault(); submit(); }} aria-busy={loading} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <div>
                      <label htmlFor="pw" style={labelStyle}>Mot de passe</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          ref={firstInputRef}
                          id="pw"
                          type={showPw ? 'text' : 'password'}
                          value={form.password}
                          onChange={e => set('password', e.target.value)}
                          placeholder="Min. 8 caractères"
                          autoComplete="new-password"
                          style={{ ...inputStyle, paddingRight: 'var(--space-12)' }}
                          onFocus={e => { e.target.style.borderColor = 'var(--color-brand)'; e.target.style.background = 'var(--color-input-focus-dark)' }}
                          onBlur={e  => { e.target.style.borderColor = 'var(--color-dark-border)'; e.target.style.background = 'var(--color-dark-2)' }}
                        />
                        <ToggleVis show={showPw} onClick={() => setShowPw(s => !s)} />
                      </div>

                      {/* Strength indicator */}
                      {form.password.length > 0 && (
                        <div style={{ marginTop: 'var(--space-2)' }}>
                          <div style={{ display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-1)' }}>
                            {[1,2,3,4].map(n => (
                              <div key={n} style={{
                                height: '3px',
                                flex: 1,
                                borderRadius: '2px',
                                background: pwStrength >= n ? strengthColor[pwStrength] : 'var(--color-dark-border)',
                                transition: 'background var(--duration-base)',
                              }} />
                            ))}
                          </div>
                          <p style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-xs)',
                            color: strengthColor[pwStrength],
                            margin: 0,
                            transition: 'color var(--duration-base)',
                          }}>
                            {strengthLabel[pwStrength]}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="pw2" style={labelStyle}>Confirmer le mot de passe</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="pw2"
                          type={showPw2 ? 'text' : 'password'}
                          value={form.password2}
                          onChange={e => set('password2', e.target.value)}
                          placeholder="Répétez le mot de passe"
                          autoComplete="new-password"
                          style={{ ...inputStyle, paddingRight: 'var(--space-12)' }}
                          onFocus={e => { e.target.style.borderColor = 'var(--color-brand)'; e.target.style.background = 'var(--color-input-focus-dark)' }}
                          onBlur={e  => { e.target.style.borderColor = 'var(--color-dark-border)'; e.target.style.background = 'var(--color-dark-2)' }}
                        />
                        <ToggleVis show={showPw2} onClick={() => setShowPw2(s => !s)} />
                      </div>
                    </div>

                    <BtnRow onBack={back} disabled={loading}>
                      <Btn type="submit" loading={loading}>Créer mon compte</Btn>
                    </BtnRow>
                  </form>
                )}
              </>
            )}

            {/* ── Step 4: Succès ── */}
            {step === 4 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--color-success-glow-2)',
                  border: '1px solid var(--color-success-glow-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-6)',
                }}>
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-success)' }}>
                    check
                  </span>
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 'var(--text-2xl)',
                  color: 'var(--color-dark-text)',
                  margin: '0 0 var(--space-3)',
                  letterSpacing: '-0.02em',
                  lineHeight: 'var(--leading-tight)',
                }}>
                  Compte créé.
                </h2>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-dark-text-2)',
                  margin: '0 0 var(--space-8)',
                  lineHeight: 'var(--leading-relaxed)',
                }}>
                  Vérifiez votre email pour confirmer votre compte avant de vous connecter.
                </p>
                <button type="button"
                  onClick={async () => {
                    if (resendStatus !== 'idle') return;
                    setResendStatus('sending');
                    try { await fetch('/api/v1/auth/resend-confirmation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email: form.email }) }); } catch {}
                    setResendStatus('sent');
                  }}
                  disabled={resendStatus !== 'idle'}
                  style={{ display: 'block', margin: '0 auto var(--space-4)', background: 'none', border: 'none', padding: 0, cursor: resendStatus !== 'idle' ? 'default' : 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: resendStatus === 'sent' ? 'var(--color-success)' : 'var(--color-brand-text-muted)', textDecoration: resendStatus === 'idle' ? 'underline' : 'none', textUnderlineOffset: '3px' }}>
                  {resendStatus === 'idle' && 'Renvoyer le courriel'}
                  {resendStatus === 'sending' && 'Envoi en cours…'}
                  {resendStatus === 'sent' && '✓ Courriel renvoyé'}
                </button>
                <Btn onClick={() => router.push('/')}>Se connecter</Btn>
              </div>
            )}

          </div>
          {/* end animated card */}

        </div>
      </div>

    </main>
  );
}

/* ── Small shared sub-components ── */

function Btn({ children, type = 'button', disabled, loading, onClick }: {
  children: React.ReactNode;
  type?: 'button' | 'submit';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const inactive = disabled || loading;
  return (
    <button
      type={type}
      disabled={inactive}
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 'var(--text-base)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'white',
        background: inactive ? 'var(--color-dark-3)' : hovered ? 'var(--color-brand-hover)' : 'var(--color-brand)',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        cursor: inactive ? 'not-allowed' : 'pointer',
        width: '100%',
        minHeight: '52px',
        transition: 'background var(--duration-fast)',
        flex: 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
          {children}
        </span>
      ) : children}
    </button>
  );
}

function BtnRow({ children, onBack, disabled }: { children: React.ReactNode; onBack: () => void; disabled?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
      <button
        type="button"
        onClick={onBack}
        disabled={disabled}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: disabled ? 'var(--color-dark-text-3)' : hovered ? 'var(--color-dark-text)' : 'var(--color-dark-text-2)',
          background: 'none',
          border: `1px solid ${hovered && !disabled ? 'var(--color-dark-text-3)' : 'var(--color-dark-border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3) var(--space-4)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          minHeight: '48px',
          transition: 'color var(--duration-fast), border-color var(--duration-fast)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          flexShrink: 0,
        }}
        aria-label="Étape précédente"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
      </button>
      {children}
    </div>
  );
}

function ToggleVis({ show, onClick }: { show: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      style={{
        position: 'absolute',
        right: 'var(--space-3)',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: hovered ? 'var(--color-dark-text)' : 'var(--color-dark-text-3)',
        display: 'flex',
        alignItems: 'center',
        padding: 'var(--space-2)',
        minHeight: '44px',
        transition: 'color var(--duration-fast)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '20px' }}>
        {show ? 'visibility_off' : 'visibility'}
      </span>
    </button>
  );
}

function InlineLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'inherit',
        color: hovered ? 'var(--color-brand-text-hover)' : 'var(--color-brand-text-muted)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        textDecoration: 'underline',
        textUnderlineOffset: '3px',
        textDecorationColor: hovered ? 'var(--color-brand-text-hover-50)' : 'var(--color-brand-text-muted-45)',
        transition: 'color var(--duration-fast), text-decoration-color var(--duration-fast)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}
