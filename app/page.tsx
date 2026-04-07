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

  const res = await fetch('https://portail.cocktailmedia.ca/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      if (data.user.is_admin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(data.error || 'Erreur de connexion');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fff4e9]">
      <div className="bg-white border border-[#e0d9d3] rounded-lg shadow-md p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-[#2b2b2b] mb-8">
          PORTAIL CLIENT
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-[#e0d9d3] rounded px-3 py-2 bg-[#fff4e9] focus:outline-none focus:border-[#e83b14]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-[#e0d9d3] rounded px-3 py-2 bg-[#fff4e9] focus:outline-none focus:border-[#e83b14]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e83b14] text-white font-bold py-3 rounded hover:bg-[#d4310d] transition disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'SE CONNECTER'}
          </button>
        </form>
      </div>
    </main>
  );
}
