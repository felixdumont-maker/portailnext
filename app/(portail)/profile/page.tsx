'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Projet {
  id: number;
  nom_projet: string;
  statut: string;
}

interface Facture {
  id: number;
  numero: string;
  date_emission: string;
  total: number;
  statut: string;
  stripe_payment_url?: string;
}

interface Profile {
  nom_complet: string;
  nom_entreprise: string;
  email: string;
  projets: Projet[];
  factures: Facture[];
}

const STATUS_PROJET: Record<string, { bg: string; text: string }> = {
  'Documents à donner': { bg: 'var(--color-error-bg)', text: 'var(--color-error-text)' },
  'Documents reçus':   { bg: 'var(--color-info-bg)', text: 'var(--color-info-text)' },
  'Travaux en cours':  { bg: 'var(--color-warning-bg)', text: 'var(--color-warning-text)' },
  'En révision':       { bg: 'var(--color-warning-bg)', text: 'var(--color-warning-text)' },
  'Travaux terminés':  { bg: 'var(--color-success-bg)', text: 'var(--color-success-text)' },
  'Complété':          { bg: 'var(--color-success-bg)', text: 'var(--color-success-text)' },
  'Annulé':            { bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)' },
};

const STATUS_FACTURE: Record<string, { bg: string; text: string }> = {
  'Brouillon': { bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)' },
  'Envoyée':   { bg: 'var(--color-info-bg)', text: 'var(--color-info-text)' },
  'Payée':     { bg: 'var(--color-success-bg)', text: 'var(--color-success-text)' },
  'En retard': { bg: 'var(--color-error-bg)', text: 'var(--color-error-text)' },
};

function initiales(nom: string) {
  return nom.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/v1/profile`, { credentials: 'include' })
      .then(r => { if (r.status === 401) { router.push('/'); return null; } return r.json(); })
      .then(data => { if (data) setProfile(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: var(--color-dark-text-2), letterSpacing: '0.1em' }}>CHARGEMENT...</div>
    </div>
  );

  const data = profile || {
    nom_complet: 'Félix Dupuis',
    nom_entreprise: 'Cocktail Média',
    email: 'felix@cocktailmedia.ca',
    projets: [],
    factures: [],
  };

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '7rem', paddingBottom: '6rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>

      <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--color-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 8px 32px rgba(232,59,20,0.3)' }}>
          <span style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '3rem', paddingTop: '6px' }}>
            {initiales(data.nom_complet)}
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 10vw, 5rem)', lineHeight: 1, color: var(--color-dark-1), marginBottom: '0.5rem' }}>
          {data.nom_complet.toUpperCase()}
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: var(--color-dark-text-2), textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>
          {data.nom_entreprise}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: var(--color-dark-text-2) }}>
          {data.email}
        </p>
      </header>

      <div style={{ height: '1px', background: 'var(--color-light-border-2)', marginBottom: '2.5rem' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', letterSpacing: '0.05em', color: 'var(--color-light-text)', marginBottom: '1.25rem' }}>
            MES PROJETS
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.projets.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: var(--color-dark-text-2), fontStyle: 'italic' }}>Aucun projet pour le moment.</p>
            ) : data.projets.map(projet => {
              const nomAffiche = projet.nom_projet.split(' — ')[1] || projet.nom_projet;
              const style = STATUS_PROJET[projet.statut] || { bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)' };
              return (
                <div key={projet.id} onClick={() => router.push(`/projet/${projet.id}`)}
                  style={{ background: 'var(--color-light-1)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--color-light-border-2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-light-1)'; e.currentTarget.style.borderColor = 'transparent'; }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: var(--color-dark-1) }}>{nomAffiche.toUpperCase()}</span>
                  <span style={{ background: style.bg, color: style.text, padding: '3px 12px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                    {projet.statut}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', letterSpacing: '0.05em', color: 'var(--color-light-text)', marginBottom: '1.25rem' }}>
            MES FACTURES
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.factures.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: var(--color-dark-text-2), fontStyle: 'italic' }}>Aucune facture pour le moment.</p>
            ) : data.factures.map(facture => {
              const style = STATUS_FACTURE[facture.statut] || { bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)' };
              return (
                <div key={facture.id}
                  style={{ background: 'white', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--color-light-border-2)', gap: '12px' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: var(--color-dark-1) }}>{facture.numero}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: var(--color-dark-text-2), textTransform: 'uppercase', letterSpacing: '0.05em' }}>{facture.date_emission}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, color: var(--color-dark-1) }}>
                      {(facture.total ?? 0).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                    </span>
                    <span style={{ background: style.bg, color: style.text, padding: '2px 10px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {facture.statut}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}
