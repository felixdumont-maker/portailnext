'use client';

import { useEffect, useState } from 'react';
import { ImagePicker, type SanityImageRef } from './ImagePicker';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export interface SubFieldConfig {
  key: string;
  label: string;
  kind?: 'text' | 'textarea' | 'boolean';
}

export interface CollectionFieldConfig {
  key: string;
  label: string;
  kind: 'text' | 'textarea' | 'number' | 'boolean' | 'image' | 'tags' | 'list' | 'repeater';
  subFields?: SubFieldConfig[];
}

type Item = Record<string, unknown> & { _id: string; ordre?: number };

const rowInputStyle: React.CSSProperties = {
  flex: 1, fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
  color: 'var(--color-light-text)', background: 'transparent', border: 'none',
  outline: 'none', resize: 'none', width: '100%', padding: 0,
};

const fieldLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
  color: 'var(--color-light-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em',
};

function ListField({ label, value, onChange }: { label: string; value?: string[]; onChange: (v: string[]) => void }) {
  const text = (value || []).join('\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      <label style={fieldLabelStyle}>{label}</label>
      <div style={{
        display: 'flex', alignItems: 'flex-start', padding: 'var(--space-2) var(--space-3)',
        background: 'var(--color-light-0)', borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-light-border)', minHeight: '96px',
      }}>
        <textarea
          rows={4}
          placeholder="Un élément par ligne"
          value={text}
          onChange={e => onChange(e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
          style={{ ...rowInputStyle, paddingTop: 'var(--space-1)' }}
        />
      </div>
    </div>
  );
}

function RepeaterField({
  label, subFields, value, onChange,
}: { label: string; subFields: SubFieldConfig[]; value?: Record<string, unknown>[]; onChange: (v: Record<string, unknown>[]) => void }) {
  const rows = value || [];

  function updateRow(i: number, key: string, v: unknown) {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)));
  }
  function addRow() {
    onChange([...rows, {}]);
  }
  function removeRow(i: number) {
    onChange(rows.filter((_, idx) => idx !== i));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={fieldLabelStyle}>{label}</label>
        <button
          type="button"
          onClick={addRow}
          style={{
            padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-light-border)',
            background: 'transparent', color: 'var(--color-brand)', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          + Ajouter
        </button>
      </div>
      {rows.length === 0 && (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>Aucun élément.</span>
      )}
      {rows.map((row, i) => (
        <div key={i} style={{
          border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', background: 'var(--color-light-0)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => removeRow(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }} aria-label="Supprimer">✕</button>
          </div>
          {subFields.map(sf => sf.kind === 'boolean' ? (
            <label key={sf.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text)' }}>
              <input type="checkbox" checked={Boolean(row[sf.key])} onChange={e => updateRow(i, sf.key, e.target.checked)} />
              {sf.label}
            </label>
          ) : (
            <div key={sf.key} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <label style={fieldLabelStyle}>{sf.label}</label>
              <div style={{
                display: 'flex', alignItems: sf.kind === 'textarea' ? 'flex-start' : 'center',
                padding: 'var(--space-2) var(--space-3)', background: 'var(--color-light-2)',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-light-border)',
                minHeight: sf.kind === 'textarea' ? '60px' : '40px',
              }}>
                {sf.kind === 'textarea' ? (
                  <textarea rows={2} value={(row[sf.key] as string) || ''} onChange={e => updateRow(i, sf.key, e.target.value)} style={{ ...rowInputStyle, paddingTop: 'var(--space-1)' }} />
                ) : (
                  <input type="text" value={(row[sf.key] as string) || ''} onChange={e => updateRow(i, sf.key, e.target.value)} style={rowInputStyle} />
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function FieldInput({ cfg, value, onChange }: { cfg: CollectionFieldConfig; value: unknown; onChange: (v: unknown) => void }) {
  if (cfg.kind === 'boolean') {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text)' }}>
        <input type="checkbox" checked={Boolean(value)} onChange={e => onChange(e.target.checked)} />
        {cfg.label}
      </label>
    );
  }
  const wrapStyle: React.CSSProperties = {
    display: 'flex', alignItems: cfg.kind === 'textarea' ? 'flex-start' : 'center',
    padding: 'var(--space-2) var(--space-3)', background: 'var(--color-light-0)',
    borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-light-border)',
    minHeight: cfg.kind === 'textarea' ? '72px' : '40px',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      <label style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-light-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {cfg.label}
      </label>
      <div style={wrapStyle}>
        {cfg.kind === 'textarea' ? (
          <textarea rows={3} value={(value as string) || ''} onChange={e => onChange(e.target.value)} style={{ ...rowInputStyle, paddingTop: 'var(--space-1)' }} />
        ) : cfg.kind === 'number' ? (
          <input type="number" value={(value as number) ?? ''} onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))} style={rowInputStyle} />
        ) : cfg.kind === 'tags' ? (
          <input
            type="text"
            placeholder="séparés par des virgules"
            value={Array.isArray(value) ? (value as string[]).join(', ') : ''}
            onChange={e => onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            style={rowInputStyle}
          />
        ) : (
          <input type="text" value={(value as string) || ''} onChange={e => onChange(e.target.value)} style={rowInputStyle} />
        )}
      </div>
    </div>
  );
}

export function CollectionEditor({
  docType, title, fields, titleField, sanityProjectId, siteId,
}: {
  docType: string;
  title: string;
  fields: CollectionFieldConfig[];
  titleField: string;
  sanityProjectId: string;
  siteId: number;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Item>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/mon-site/collection/${docType}?site_id=${siteId}`, { credentials: 'include' });
      const data: Item[] = res.ok ? await res.json() : [];
      setItems(data);
      setDrafts(Object.fromEntries(data.map(d => [d._id, d])));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [docType, siteId]);

  async function handleAdd() {
    setError('');
    const res = await fetch(`${API}/api/v1/mon-site/collection/${docType}?site_id=${siteId}`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) { setError("Erreur lors de l'ajout."); return; }
    const { id } = await res.json();
    await load();
    setOpenId(id);
  }

  async function handleSave(id: string) {
    setSavingId(id);
    setError('');
    const draft = drafts[id] || {};
    const body: Record<string, unknown> = {};
    for (const f of fields) body[f.key] = draft[f.key];
    const res = await fetch(`${API}/api/v1/mon-site/collection/${docType}/${id}?site_id=${siteId}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSavingId(null);
    if (!res.ok) { setError("Erreur lors de l'enregistrement."); return; }
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet élément ?')) return;
    setError('');
    const res = await fetch(`${API}/api/v1/mon-site/collection/${docType}/${id}?site_id=${siteId}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) { setError('Erreur lors de la suppression.'); return; }
    await load();
  }

  async function handleMove(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setItems(reordered);
    await fetch(`${API}/api/v1/mon-site/collection/${docType}/reorder?site_id=${siteId}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: reordered.map(r => r._id) }),
    });
    await load();
  }

  return (
    <section style={{
      background: 'var(--color-light-2)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
      border: '1px solid var(--color-light-border)', padding: 'var(--space-6)',
      display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-light-text)', margin: 0 }}>{title}</h2>
        <button
          onClick={handleAdd}
          style={{
            padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)', border: 'none',
            background: 'var(--color-brand)', color: 'white', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          + Ajouter
        </button>
      </div>

      {error && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>{error}</span>}

      {loading ? (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-3)' }}>Chargement…</span>
      ) : items.length === 0 ? (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-3)' }}>Aucun élément pour l&apos;instant.</span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {items.map((item, i) => {
            const draft = drafts[item._id] || item;
            const isOpen = openId === item._id;
            const rawHeading = (draft[titleField] as string) || 'Nouvel élément';
            const heading = rawHeading.length > 80 ? `${rawHeading.slice(0, 80)}…` : rawHeading;
            return (
              <div key={item._id} style={{ border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-light-0)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', cursor: 'pointer' }}
                  onClick={() => setOpenId(isOpen ? null : item._id)}>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-light-text)' }}>{heading}</span>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleMove(i, -1)} disabled={i === 0} style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.3 : 1 }} aria-label="Monter">↑</button>
                    <button onClick={() => handleMove(i, 1)} disabled={i === items.length - 1} style={{ background: 'none', border: 'none', cursor: i === items.length - 1 ? 'default' : 'pointer', opacity: i === items.length - 1 ? 0.3 : 1 }} aria-label="Descendre">↓</button>
                    <button onClick={() => handleDelete(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }} aria-label="Supprimer">✕</button>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ padding: '0 var(--space-4) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {fields.map(f => f.kind === 'image' ? (
                      <ImagePicker
                        key={f.key}
                        label={f.label}
                        projectId={sanityProjectId}
                        siteId={siteId}
                        value={draft[f.key] as SanityImageRef | undefined}
                        onChange={v => setDrafts(p => ({ ...p, [item._id]: { ...p[item._id], [f.key]: v } }))}
                      />
                    ) : f.kind === 'list' ? (
                      <ListField
                        key={f.key}
                        label={f.label}
                        value={draft[f.key] as string[] | undefined}
                        onChange={v => setDrafts(p => ({ ...p, [item._id]: { ...p[item._id], [f.key]: v } }))}
                      />
                    ) : f.kind === 'repeater' ? (
                      <RepeaterField
                        key={f.key}
                        label={f.label}
                        subFields={f.subFields || []}
                        value={draft[f.key] as Record<string, unknown>[] | undefined}
                        onChange={v => setDrafts(p => ({ ...p, [item._id]: { ...p[item._id], [f.key]: v } }))}
                      />
                    ) : (
                      <FieldInput
                        key={f.key}
                        cfg={f}
                        value={draft[f.key]}
                        onChange={v => setDrafts(p => ({ ...p, [item._id]: { ...p[item._id], [f.key]: v } }))}
                      />
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleSave(item._id)}
                        disabled={savingId === item._id}
                        style={{
                          padding: 'var(--space-2) var(--space-5)', borderRadius: 'var(--radius-full)', border: 'none',
                          background: 'var(--color-brand)', color: 'white', cursor: 'pointer',
                          fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', fontWeight: 800,
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}
                      >
                        {savingId === item._id ? 'Enregistrement…' : 'Enregistrer'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default CollectionEditor;
