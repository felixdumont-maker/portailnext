'use client';

import { useRef, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export interface SanityImageRef {
  _type: 'image';
  asset: { _type: 'reference'; _ref: string };
}

// Sanity ne retourne pas d'URL directement affichable depuis l'endpoint d'upload —
// seulement l'_id de l'asset (ex: "image-abc123-800x600-jpg"). On reconstruit l'URL
// cdn.sanity.io à partir de ce format connu pour afficher un aperçu immédiat.
function assetIdToUrl(projectId: string, assetId: string): string | null {
  const m = assetId.match(/^image-([a-f0-9]+)-(\d+)x(\d+)-(\w+)$/);
  if (!m) return null;
  const [, hash, w, h, ext] = m;
  return `https://cdn.sanity.io/images/${projectId}/production/${hash}-${w}x${h}.${ext}`;
}

export function ImagePicker({
  label, value, onChange, projectId, siteId,
}: {
  label: string;
  value?: SanityImageRef | null;
  onChange: (v: SanityImageRef) => void;
  projectId: string;
  siteId: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API}/api/v1/mon-site/image?site_id=${siteId}`, {
        method: 'POST',
        credentials: 'include',
        body: form,
      });
      if (!res.ok) throw new Error();
      const ref: SanityImageRef = await res.json();
      onChange(ref);
    } catch {
      setError("Échec de l'envoi de l'image.");
    } finally {
      setUploading(false);
    }
  }

  const previewUrl = value?.asset?._ref ? assetIdToUrl(projectId, value.asset._ref) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      <label style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
        color: 'var(--color-light-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-light-border)' }} />
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-light-border)', background: 'var(--color-light-0)',
            cursor: uploading ? 'default' : 'pointer', fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-light-text)',
          }}
        >
          {uploading ? 'Envoi…' : previewUrl ? "Changer l'image" : 'Choisir une image'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      {error && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>{error}</span>}
    </div>
  );
}

export default ImagePicker;
