'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STEPS = [
  { id: 1, title: 'Bienvenue', subtitle: 'Créez votre compte' },
  { id: 2, title: 'Qui êtes-vous?', subtitle: 'Vos informations personnelles' },
  { id: 3, title: 'Votre entreprise', subtitle: 'Informations professionnelles' },
  { id: 4, title: 'Sécurité', subtitle: 'Choisissez un mot de passe' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: '',
    nom_complet: '',
    telephone: '',
    nom_entreprise: '',
    password: '',
    password2: '',
  });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  }

  function next() {
    // Validation par étape
    if (step === 0 && !form.email) { setError('Email requis'); return; }
    if (step === 1 && !form.nom_complet) { setError('Nom requis'); return; }
    if (step === 2 && !form.nom_entreprise) { setError("Nom d'entreprise requis"); return; }
    setStep(s => s + 1);
  }

  function back() {
    setStep(s => s - 1);
    setError('');
  }

  async function submit() {
    if (form.password !== form.password2) { setError('Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    try {
      const res = await fetch('https://portail.cocktailmedia.ca/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setStep(4); // Success screen
      } else {
        setError(data.error || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
    setLoading(false);
  }

  const progress = step >= 4 ? 100 : (step / 4) * 100;

  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{background: 'radial-gradient(ellipse at top right, rgba(232,59,20,0.2) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(232,59,20,0.1) 0%, transparent 50%), #1a1a1a'}}>
      {/* Card glassmorphism */}
      <div className="w-full max-w-md relative">
        
        {/* Progress bar */}
        {step < 4 && (
          <div className="mb-6">
          
          <div className="flex justify-between mb-2 items-center">
              {STEPS.map((s, i) => (
                <img
                  key={s.id}
                  src="/cos-icone-blanc.png"
                  alt=""
                  className={`h-4 w-4 transition-all duration-500 ${
                    i <= step ? 'opacity-100 scale-110' : 'opacity-20'
                  }`}
                />
              ))}
            </div>


            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#e83b14] to-[#ff6f3d] rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Glass card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src="/cos-logo-blanc.png" 
              alt="CocktailOS" 
              className="h-8 w-auto"
            />
          </div>
          {/* Step 0 — Email */}
          {step === 0 && (
            <div className="animate-fadeIn">
              <div className="mb-8">
                <p className="text-white/60 text-sm font-medium tracking-widest uppercase mb-1">Étape 1 sur 4</p>
                <h2 className="text-white text-3xl font-bold">Bienvenue 👋</h2>
                <p className="text-white/50 mt-1">Commençons par votre email</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">Adresse email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  onClick={next}
                  className="w-full bg-gradient-to-r from-[#e83b14] to-[#ff6f3d] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continuer →
                </button>
                <p className="text-center text-white/40 text-sm">
                  Déjà un compte?{' '}
                  <button onClick={() => router.push('/')} className="text-white/70 hover:text-white underline">
                    Se connecter
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Step 1 — Nom */}
          {step === 1 && (
            <div className="animate-fadeIn">
              <div className="mb-8">
                <p className="text-white/60 text-sm font-medium tracking-widest uppercase mb-1">Étape 2 sur 4</p>
                <h2 className="text-white text-3xl font-bold">Qui êtes-vous? 🙋</h2>
                <p className="text-white/50 mt-1">Vos informations personnelles</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={form.nom_complet}
                    onChange={e => update('nom_complet', e.target.value)}
                    placeholder="Prénom Nom"
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">Téléphone <span className="text-white/30">(optionnel)</span></label>
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={e => update('telephone', e.target.value)}
                    placeholder="514-000-0000"
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="flex gap-3">
                  <button onClick={back} className="flex-1 bg-white/10 border border-white/20 text-white font-bold py-4 rounded-2xl hover:bg-white/20 transition-all">
                    ← Retour
                  </button>
                  <button onClick={next} className="flex-1 bg-gradient-to-r from-[#e83b14] to-[#ff6f3d] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all hover:scale-[1.02]">
                    Continuer →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Entreprise */}
          {step === 2 && (
            <div className="animate-fadeIn">
              <div className="mb-8">
                <p className="text-white/60 text-sm font-medium tracking-widest uppercase mb-1">Étape 3 sur 4</p>
                <h2 className="text-white text-3xl font-bold">Votre entreprise 🏢</h2>
                <p className="text-white/50 mt-1">Pour les travailleurs autonomes, inscrivez votre nom</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">Nom d'entreprise</label>
                  <input
                    type="text"
                    value={form.nom_entreprise}
                    onChange={e => update('nom_entreprise', e.target.value)}
                    placeholder="Mon Entreprise Inc."
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="flex gap-3">
                  <button onClick={back} className="flex-1 bg-white/10 border border-white/20 text-white font-bold py-4 rounded-2xl hover:bg-white/20 transition-all">
                    ← Retour
                  </button>
                  <button onClick={next} className="flex-1 bg-gradient-to-r from-[#e83b14] to-[#ff6f3d] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all hover:scale-[1.02]">
                    Continuer →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Mot de passe */}
          {step === 3 && (
            <div className="animate-fadeIn">
              <div className="mb-8">
                <p className="text-white/60 text-sm font-medium tracking-widest uppercase mb-1">Étape 4 sur 4</p>
                <h2 className="text-white text-3xl font-bold">Sécurité 🔒</h2>
                <p className="text-white/50 mt-1">Choisissez un mot de passe fort</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">Mot de passe</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    placeholder="Min. 8 caractères"
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={form.password2}
                    onChange={e => update('password2', e.target.value)}
                    placeholder="Répétez le mot de passe"
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
                  />
                </div>
                <p className="text-white/30 text-xs">Doit contenir: majuscule, minuscule, chiffre et caractère spécial (!@#$%^&*)</p>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="flex gap-3">
                  <button onClick={back} className="flex-1 bg-white/10 border border-white/20 text-white font-bold py-4 rounded-2xl hover:bg-white/20 transition-all">
                    ← Retour
                  </button>
                  <button
                    onClick={submit}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-[#e83b14] to-[#ff6f3d] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                    {loading ? 'Création...' : 'Créer mon compte'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Succès */}
          {step === 4 && (
            <div className="animate-fadeIn text-center py-8">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-white text-3xl font-bold mb-3">Compte créé!</h2>
              <p className="text-white/60 mb-8">Vérifiez votre email pour confirmer votre compte avant de vous connecter.</p>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-[#e83b14] to-[#ff6f3d] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all"
              >
                Se connecter →
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
