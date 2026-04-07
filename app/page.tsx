'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://portail.cocktailmedia.ca/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        router.push(data.user.is_admin ? '/admin' : '/dashboard');
      } else {
        setError(data.error || 'Erreur de connexion');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{background: 'radial-gradient(ellipse at top right, rgba(232,59,20,0.2) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(232,59,20,0.1) 0%, transparent 50%), #1a1a1a'}}
    >
      <div className="w-full max-w-sm">

        {/* Glass card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src="/cos-logo-blanc.png" alt="CocktailOS" className="h-8 w-auto" />
          </div>

          {/* Titre */}
          <div className="mb-8 text-center">
            <h2 className="text-white text-2xl font-bold mb-1">Bon retour 👋</h2>
            <p className="text-white/50 text-sm">Connectez-vous à votre portail</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-2xl px-4 py-3 mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm font-medium block mb-2">Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm font-medium block mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
              />
            </div>

            <div className="text-right">
              <button
                onClick={() => router.push('/forgot-password')}
                className="text-white/40 hover:text-white/70 text-xs transition-all"
              >
                Mot de passe oublié?
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#e83b14] to-[#ff6f3d] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'SE CONNECTER →'}
            </button>

            <p className="text-center text-white/40 text-sm pt-2">
              Pas encore de compte?{' '}
              <button
                onClick={() => router.push('/register')}
                className="text-white/70 hover:text-white underline transition-all"
              >
                Créer un compte
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs mt-6">
          Propulsé par Cocktail Média
        </p>

      </div>
    </main>
  );
}
