'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Roadmap {
  id: number;
  titre: string;
  description: string;
  created_at: string;
  is_archived: number;
}

export default function RoadmapsPage() {
  const router = useRouter();
  const [actives, setActives] = useState<Roadmap[]>([]);
  const [archivees, setArchivees] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/admin/roadmaps', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setActives(data.actives || []);
        setArchivees(data.archivees || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function archiver(id: number) {
    await fetch(`/api/v1/admin/roadmaps/${id}/archive`, { method: 'POST', credentials: 'include' });
    setActives(prev => prev.filter(r => r.id !== id));
  }

  async function supprimer(id: number) {
    if (!confirm('Supprimer cette roadmap ?')) return;
    await fetch(`/api/v1/admin/roadmaps/${id}/delete`, { method: 'POST', credentials: 'include' });
    setActives(prev => prev.filter(r => r.id !== id));
  }

  async function desararchiver(id: number) {
    await fetch(`/api/v1/admin/roadmaps/${id}/unarchive`, { method: 'POST', credentials: 'include' });
    const r = archivees.find(r => r.id === id);
    if (r) {
      setArchivees(prev => prev.filter(x => x.id !== id));
      setActives(prev => [{ ...r, is_archived: 0 }, ...prev]);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-32">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <h1 className="font-display text-[var(--text-3xl)] tracking-tight leading-none uppercase text-[var(--color-dark-0)]">ROADMAPS</h1>
          <p className="text-[var(--color-dark-text-2)] mt-2 max-w-md text-sm">Planification stratégique et suivi opérationnel des projets.</p>
        </div>
        <button
          onClick={() => router.push('/admin/roadmaps/new')}
          className="bg-[var(--color-brand)] text-white px-8 py-4 rounded-full font-bold text-sm tracking-widest flex items-center gap-2 hover:bg-[var(--color-brand-hover)] transition-colors"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-lg">add</span>
          NOUVELLE ROADMAP
        </button>
      </div>

      {/* Projets en cours */}
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-xs font-bold tracking-[0.2em] text-[var(--color-dark-text-2)] uppercase">PROJETS EN COURS</h2>
          <div className="h-px flex-grow bg-[var(--color-light-0)]" />
        </div>

        {actives.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-[var(--color-light-border-2)] rounded-xl">
            <p className="text-[var(--color-dark-text-2)] mb-4">Aucun projet actif</p>
            <button onClick={() => router.push('/admin/roadmaps/new')} className="bg-[var(--color-brand)] text-white px-6 py-3 rounded-full text-sm font-bold tracking-widest">
              + NOUVELLE ROADMAP
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {actives.map(r => (
              <div key={r.id} className="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center gap-6 border border-transparent hover:border-[var(--color-light-border-2)] transition-all">
                <div className="flex items-center gap-4 flex-grow">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-warning)] shrink-0" />
                  <div>
                    <h3 className="font-bold text-base text-[var(--color-dark-0)]">{r.titre}</h3>
                    {r.description && <p className="text-sm text-[var(--color-dark-text-2)] line-clamp-1 mt-0.5">{r.description}</p>}
                    <p className="text-xs text-[var(--color-dark-text-2)] mt-1">Créée le {r.created_at?.slice(0, 10)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push(`/admin/roadmaps/${r.id}`)}
                    className="bg-[var(--color-light-0)] hover:bg-[var(--color-dark-1)] hover:text-white px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all flex items-center gap-2"
                  >
                    Ouvrir <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                  <button onClick={() => archiver(r.id)} className="text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] text-xs font-bold tracking-wide transition-colors">
                    Archiver
                  </button>
                  <button onClick={() => supprimer(r.id)} className="text-[#ccc] hover:text-red-500 transition-colors">
                    <span aria-hidden="true" className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Archivées */}
      {archivees.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xs font-bold tracking-[0.2em] text-[var(--color-dark-text-2)] uppercase">ARCHIVÉS</h2>
            <div className="h-px flex-grow bg-[var(--color-light-0)]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {archivees.map(r => (
              <div key={r.id} className="bg-[var(--color-light-1)] p-5 rounded-xl flex items-center justify-between opacity-70">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#ccc5c1]" />
                  <h3 className="text-sm font-bold text-[var(--color-dark-text-2)] uppercase tracking-tight">{r.titre}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => router.push(`/admin/roadmaps/${r.id}`)} className="text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] hover:text-[var(--color-dark-0)]">Voir</button>
                  <button onClick={() => desararchiver(r.id)} className="text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)]">Désarchiver</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
