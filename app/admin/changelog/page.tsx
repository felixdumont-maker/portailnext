'use client';

import { useEffect, useMemo, useState } from 'react';

interface ChangelogEntry {
  id: string;
  date: string;
  session: string;
  category: string;
  module: string;
  description: string;
  files_modified: string[];
  author: string;
}

const MODULES = ['Auth', 'Clients', 'Projets', 'Services', 'Pigiste', 'Factures', 'Drive', 'Calendar', 'Email', 'Infrastructure', 'UX'];
const CATEGORIES = ['feature', 'fix', 'refactor', 'security', 'db', 'ui'];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  feature:    { bg: '#e6f4ea', text: '#1e7d34', label: 'Feature' },
  fix:        { bg: '#fce8e6', text: '#c5221f', label: 'Fix' },
  ui:         { bg: '#e8f0fe', text: '#1a56db', label: 'UI' },
  refactor:   { bg: '#fef3e0', text: '#b5640d', label: 'Refactor' },
  security:   { bg: '#fbe4e6', text: '#7f1d2b', label: 'Security' },
  db:         { bg: '#f1e6fb', text: '#6b21a8', label: 'DB' },
  infrastructure: { bg: '#e9e7e4', text: '#5a554f', label: 'Infrastructure' },
};

function categoryStyle(category: string) {
  return CATEGORY_STYLES[category.toLowerCase()] ?? { bg: '#e9e7e4', text: '#5a554f', label: category };
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState<string>('Tous');
  const [categoryFilter, setCategoryFilter] = useState<string>('Tous');

  useEffect(() => {
    fetch('/api/v1/admin/changelog', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setEntries(data.entries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (moduleFilter !== 'Tous' && e.module !== moduleFilter) return false;
      if (categoryFilter !== 'Tous' && e.category !== categoryFilter) return false;
      return true;
    });
  }, [entries, moduleFilter, categoryFilter]);

  const groupes = useMemo(() => {
    const map = new Map<string, ChangelogEntry[]>();
    for (const entry of filtered) {
      const key = entry.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  function PillFilter({ options, active, onSelect }: { options: string[]; active: string; onSelect: (v: string) => void }) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {['Tous', ...options].map(opt => {
          const isActive = active === opt;
          return (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.72rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: isActive ? 'white' : 'var(--color-dark-text-2)',
                background: isActive ? 'var(--color-brand)' : 'white',
                border: '1px solid #e0d9d3',
                borderRadius: '999px',
                padding: '8px 18px',
                cursor: 'pointer',
                transition: 'background var(--duration-fast), color var(--duration-fast)',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', paddingTop: '40px', paddingBottom: '120px' }}>

      {/* En-tête */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          color: '#2b2b2b',
          margin: 0,
        }}>
          Changelog
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#9a9490', marginTop: '8px' }}>
          Historique des sessions de développement de CocktailOS.
        </p>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a9490', marginBottom: '10px' }}>
            Module
          </p>
          <PillFilter options={MODULES} active={moduleFilter} onSelect={setModuleFilter} />
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a9490', marginBottom: '10px' }}>
            Catégorie
          </p>
          <PillFilter options={CATEGORIES} active={categoryFilter} onSelect={setCategoryFilter} />
        </div>
      </div>

      {/* État de chargement */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div style={{
            width: '32px', height: '32px',
            border: '2px solid #e83b14',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
        </div>
      )}

      {/* État vide */}
      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '64px 24px',
          background: 'white',
          borderRadius: '24px',
          border: '1px solid #e0d9d3',
        }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '32px', color: '#9a9490' }}>history_toggle_off</span>
          <p style={{ fontFamily: 'var(--font-body)', color: '#9a9490', marginTop: '12px' }}>
            Aucune entrée de changelog pour ces filtres.
          </p>
        </div>
      )}

      {/* Timeline verticale */}
      {!loading && groupes.length > 0 && (
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: '7px',
            top: '8px',
            bottom: '8px',
            width: '2px',
            background: '#e0d9d3',
          }} />

          {groupes.map(([date, dayEntries]) => (
            <div key={date} style={{ marginBottom: '40px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{
                  width: '16px', height: '16px',
                  borderRadius: '50%',
                  background: '#e83b14',
                  border: '3px solid #FAF7F3',
                  boxShadow: '0 0 0 1px #e0d9d3',
                  flexShrink: 0,
                  zIndex: 1,
                }} />
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.95rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#2b2b2b',
                  margin: 0,
                }}>
                  {formatDate(date)}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginLeft: '40px' }}>
                {dayEntries.map(entry => {
                  const style = categoryStyle(entry.category);
                  return (
                    <div key={entry.id} style={{
                      background: 'white',
                      borderRadius: '24px',
                      border: '1px solid #e0d9d3',
                      padding: '24px',
                    }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.68rem',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: style.text,
                          background: style.bg,
                          borderRadius: '999px',
                          padding: '5px 14px',
                        }}>
                          {style.label}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.68rem',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: '#5a554f',
                          background: '#fff4e9',
                          border: '1px solid #e0d9d3',
                          borderRadius: '999px',
                          padding: '5px 14px',
                        }}>
                          {entry.module}
                        </span>
                      </div>

                      {entry.session && (
                        <h3 style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.05rem',
                          letterSpacing: '0.01em',
                          color: '#2b2b2b',
                          margin: '0 0 6px',
                        }}>
                          {entry.session}
                        </h3>
                      )}

                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: '#5a554f', lineHeight: 1.5, margin: '0 0 14px' }}>
                        {entry.description}
                      </p>

                      {entry.files_modified?.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9490', marginBottom: '6px' }}>
                            Fichiers modifiés
                          </p>
                          <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {entry.files_modified.map(file => (
                              <li key={file} style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#5a554f' }}>
                                {file}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.76rem', color: '#9a9490', margin: 0 }}>
                        Par {entry.author}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
