'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NouveauClientPage() {
  const router = useRouter();

  const [nomComplet, setNomComplet] = useState('');
  const [email, setEmail] = useState('');
  const [nomEntreprise, setNomEntreprise] = useState('');
  const [telephone, setTelephone] = useState('');
  const [statutRelation, setStatutRelation] = useState<'actif' | 'prospect'>('actif');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!nomComplet.trim()) { setError('Le nom complet est obligatoire.'); return; }
    if (!email.trim()) { setError("L'email est obligatoire."); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/client/add', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom_complet: nomComplet.trim(),
          email: email.trim().toLowerCase(),
          nom_entreprise: nomEntreprise.trim() || null,
          telephone: telephone.trim() || null,
          statut_relation: statutRelation,
        }),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/admin/client/${data.id}`);
      } else {
        setError(data.error || 'Erreur lors de la création.');
        setLoading(false);
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-12 md:py-24 flex flex-col items-center">

      {/* Retour */}
      <div className="w-full max-w-[600px] mb-8">
        <button
          onClick={() => router.push('/admin/clients')}
          className="inline-flex items-center gap-2 text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] transition-colors text-sm font-medium"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_back</span>
          ← Retour aux clients
        </button>
      </div>

      {/* En-tête */}
      <div className="w-full max-w-[600px] mb-10">
        <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-0)] tracking-tight leading-none uppercase">
          NOUVEAU CLIENT
        </h1>
        <p className="text-[var(--color-dark-text-2)] mt-4 text-base max-w-md">
          {statutRelation === 'prospect'
            ? "Ajoutez un prospect à votre pipeline. Aucun compte ni dossier n'est créé tant qu'il n'est pas promu client actif."
            : 'Le client recevra une invitation par email pour créer son mot de passe et accéder au portail.'}
        </p>
      </div>

      {/* Formulaire */}
      <section className="w-full max-w-[600px] bg-white rounded-xl p-8 md:p-12 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">

          {error && (
            <div className="bg-[var(--color-error-bg)] text-[var(--color-error-text)] px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {/* Type */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)]">
              Type
            </label>
            <div className="flex bg-[var(--color-light-0)] rounded-lg p-1">
              <button
                type="button"
                onClick={() => setStatutRelation('prospect')}
                className={`flex-1 py-3 rounded-md font-bold text-sm transition-colors ${statutRelation === 'prospect' ? 'bg-white shadow-sm text-[var(--color-dark-0)]' : 'text-[var(--color-dark-text-2)]'}`}
              >
                Prospect
              </button>
              <button
                type="button"
                onClick={() => setStatutRelation('actif')}
                className={`flex-1 py-3 rounded-md font-bold text-sm transition-colors ${statutRelation === 'actif' ? 'bg-white shadow-sm text-[var(--color-dark-0)]' : 'text-[var(--color-dark-text-2)]'}`}
              >
                Client actif
              </button>
            </div>
          </div>

          <div className="h-px bg-[var(--color-light-0)] w-full" />

          {/* Nom complet */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)]">
              Nom complet <span className="text-[var(--color-brand)]">*</span>
            </label>
            <input
              type="text"
              value={nomComplet}
              onChange={e => setNomComplet(e.target.value)}
              placeholder="Marie Tremblay"
              required
              className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-6 py-4 text-[var(--color-dark-0)] placeholder:text-[var(--color-dark-text-2)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none transition-all"
            />
          </div>

          {/* Email */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)]">
              Adresse email <span className="text-[var(--color-brand)]">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="marie@entreprise.com"
              required
              className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-6 py-4 text-[var(--color-dark-0)] placeholder:text-[var(--color-dark-text-2)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none transition-all"
            />
          </div>

          <div className="h-px bg-[var(--color-light-0)] w-full" />

          {/* Nom d'entreprise */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)]">
                Nom d&apos;entreprise
              </label>
              <span className="text-xs text-[var(--color-dark-text-2)] uppercase tracking-tight">Optionnel</span>
            </div>
            <input
              type="text"
              value={nomEntreprise}
              onChange={e => setNomEntreprise(e.target.value)}
              placeholder="Acme inc."
              className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-6 py-4 text-[var(--color-dark-0)] placeholder:text-[var(--color-dark-text-2)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none transition-all"
            />
          </div>

          {/* Téléphone */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-light-text-2)]">
                Téléphone
              </label>
              <span className="text-xs text-[var(--color-dark-text-2)] uppercase tracking-tight">Optionnel</span>
            </div>
            <input
              type="tel"
              value={telephone}
              onChange={e => setTelephone(e.target.value)}
              placeholder="819 555-0000"
              className="w-full bg-[var(--color-light-0)] border-none rounded-lg px-6 py-4 text-[var(--color-dark-0)] placeholder:text-[var(--color-dark-text-2)] focus:ring-2 focus:ring-[var(--color-brand)]/40 outline-none transition-all"
            />
          </div>

          <div className="h-px bg-[var(--color-light-0)] w-full" />

          {/* Note invitation */}
          {statutRelation === 'actif' ? (
            <div className="flex items-start gap-3 bg-[var(--color-light-1)] rounded-lg px-5 py-4">
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)] text-xl mt-0.5">mail</span>
              <p className="text-sm text-[var(--color-dark-text-2)]">
                Une invitation sera envoyée à <strong>{email || "l'adresse email indiquée"}</strong> pour que le client crée son mot de passe.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-3 bg-[var(--color-light-1)] rounded-lg px-5 py-4">
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)] text-xl mt-0.5">timeline</span>
              <p className="text-sm text-[var(--color-dark-text-2)]">
                Il apparaîtra dans la colonne <strong>Prospect</strong> du pipeline. Vous pourrez le promouvoir en client actif à tout moment.
              </p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 order-1 md:order-2 bg-[var(--color-brand)] text-white py-4 px-8 rounded-full font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-50"
            >
              {loading ? 'Création en cours…' : statutRelation === 'prospect' ? 'Ajouter le prospect' : 'Créer le client'}
              {!loading && <span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_forward</span>}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/clients')}
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
