'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewRoadmapPage() {
  const router = useRouter();
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titre.trim()) { setError('Le nom du projet est obligatoire.'); return; }
    setLoading(true);
    const res = await fetch('/api/v1/admin/roadmaps/new', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titre, description }),
    });
    const data = await res.json();
    if (data.id) {
      router.push(`/admin/roadmaps/${data.id}`);
    } else {
      setError(data.error || 'Erreur lors de la création.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-12 md:py-24 flex flex-col items-center">

      {/* Back */}
      <div className="w-full max-w-[600px] mb-8">
        <button onClick={() => router.push('/admin/roadmaps')} className="inline-flex items-center gap-2 text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] transition-colors text-sm font-medium">
          <span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_back</span>
          ← Retour aux roadmaps
        </button>
      </div>

      {/* Header */}
      <div className="w-full max-w-[600px] mb-10">
        <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-0)] tracking-tight leading-none uppercase">
          NOUVELLE ROADMAP
        </h1>
        <p className="text-[var(--color-dark-text-2)] mt-4 text-base max-w-md">
          Configurez les détails de votre prochain projet. Définissez les jalons et partagez votre vision.
        </p>
      </div>

      {/* Form */}
      <section className="w-full max-w-[600px] bg-white rounded-xl p-8 md:p-12 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">

          {error && (
            <div className="bg-[var(--color-error-bg)] text-[var(--color-error-text)] px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)]">
              Nom du projet
            </label>
            <input
              type="text"
              value={titre}
              onChange={e => setTitre(e.target.value)}
              placeholder="Ex: Campagne marketing printemps 2026"
              className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-6 py-4 text-[var(--color-dark-0)] placeholder:text-[var(--color-dark-text-2)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)]">
                Description
              </label>
              <span className="text-xs text-[var(--color-dark-text-2)] uppercase tracking-tight">Optionnel</span>
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Décrivez les objectifs principaux de cette roadmap..."
              rows={5}
              className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-6 py-4 text-[var(--color-dark-0)] placeholder:text-[var(--color-dark-text-2)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none transition-all resize-none"
            />
          </div>

          <div className="h-px bg-[var(--color-light-0)] w-full" />

          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 order-1 md:order-2 bg-[var(--color-brand)] text-white py-4 px-8 rounded-full font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer la roadmap'}
              <span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/roadmaps')}
              className="flex-1 order-2 md:order-1 bg-[var(--color-light-0)] text-[var(--color-dark-3)] py-4 px-8 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-light-border)] transition-colors"
            >
              Annuler
            </button>
          </div>

        </form>
      </section>
    </div>
  );
}
