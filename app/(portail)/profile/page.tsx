'use client';

import { useEffect, useRef, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface ProfileData {
  nom_complet: string;
  email: string;
  nom_entreprise: string;
  telephone: string;
  adresse_facturation: string;
  ville_facturation: string;
  province_facturation: string;
  code_postal_facturation: string;
  logo_url: string | null;
  favicon_url: string | null;
  couleur_primaire: string | null;
  couleur_secondaire: string | null;
}

const EMPTY: ProfileData = {
  nom_complet: '', email: '', nom_entreprise: '', telephone: '',
  adresse_facturation: '', ville_facturation: '', province_facturation: 'QC', code_postal_facturation: '',
  logo_url: null, favicon_url: null, couleur_primaire: '#c0321a', couleur_secondaire: '#1a1a1a',
};

function initiales(nom: string) {
  return nom.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || '—';
}

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-md)',
  padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
  background: 'var(--color-light-0)', color: 'var(--color-light-text)',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)', fontSize: '10.5px', letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'var(--color-light-text-3)', fontWeight: 800,
};

const cardStyle: React.CSSProperties = {
  background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
  borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)',
  display: 'flex', flexDirection: 'column', gap: 'var(--space-5)',
};

const cardTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-sm)',
  letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--color-light-text)',
};

function saveBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
    background: 'var(--color-brand)', color: 'white', border: 'none',
    borderRadius: 'var(--radius-full)', padding: 'var(--space-3) var(--space-6)',
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)',
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.7 : 1,
  };
}

function Field({
  label, value, onChange, type = 'text',
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <span style={labelStyle}>{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} style={inputStyle} />
    </label>
  );
}

function AssetDropZone({
  label, hint, previewUrl, width, height, onUpload, uploading,
}: {
  label: string; hint: string; previewUrl: string | null; width: string; height: string;
  onUpload: (file: File) => void; uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div>
      <div style={{ ...labelStyle, marginBottom: 'var(--space-2)' }}>{label}</div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault(); setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onUpload(f);
        }}
        style={{
          width, height, borderRadius: 'var(--radius-md)', overflow: 'hidden',
          background: previewUrl ? 'var(--color-light-1)' : 'var(--color-light-1)',
          border: `1px dashed ${dragOver ? 'var(--color-brand)' : 'var(--color-light-border-2)'}`,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)',
            textAlign: 'center', padding: 'var(--space-4)',
          }}>
            {uploading ? 'Envoi…' : hint}
          </span>
        )}
        {uploading && previewUrl && (
          <div style={{
            position: 'absolute', inset: 0, background: 'oklch(15% 0.01 40 / 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '22px', color: 'white', animation: 'spin 1s linear infinite' }}>progress_activity</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/svg+xml,image/webp,image/x-icon,image/jpeg"
          hidden
          onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }}
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'infos' | 'docs'>('infos');
  const [form, setForm] = useState<ProfileData>(EMPTY);

  const [savingInfos, setSavingInfos] = useState(false);
  const [savedInfos, setSavedInfos] = useState(false);

  const [pw, setPw] = useState({ actuel: '', nouveau: '', confirmer: '' });
  const [pwError, setPwError] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [savedPw, setSavedPw] = useState(false);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docSent, setDocSent] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [savingBrand, setSavingBrand] = useState(false);
  const [savedBrand, setSavedBrand] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/v1/profile`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setForm(f => ({ ...f, ...d })); })
      .finally(() => setLoading(false));
  }, []);

  async function saveInfos() {
    setSavingInfos(true);
    try {
      const res = await fetch(`${API}/api/v1/profile/update`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom_complet: form.nom_complet, telephone: form.telephone, nom_entreprise: form.nom_entreprise,
          adresse_facturation: form.adresse_facturation, ville_facturation: form.ville_facturation,
          province_facturation: form.province_facturation, code_postal_facturation: form.code_postal_facturation,
        }),
      });
      if (res.ok) { setSavedInfos(true); setTimeout(() => setSavedInfos(false), 1800); }
    } finally {
      setSavingInfos(false);
    }
  }

  const pwMismatch = !!(pw.nouveau && pw.confirmer && pw.nouveau !== pw.confirmer);

  async function changerMotDePasse() {
    if (!pw.nouveau || pwMismatch) return;
    setSavingPw(true);
    setPwError('');
    try {
      const res = await fetch(`${API}/api/v1/auth/change-password`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: pw.actuel, password: pw.nouveau }),
      });
      const data = await res.json();
      if (!res.ok) { setPwError(data.error || 'Erreur.'); return; }
      setPw({ actuel: '', nouveau: '', confirmer: '' });
      setSavedPw(true);
      setTimeout(() => setSavedPw(false), 1800);
    } catch {
      setPwError('Erreur de connexion.');
    } finally {
      setSavingPw(false);
    }
  }

  async function uploadAsset(file: File, type: 'logo' | 'favicon' | 'document') {
    const setUploading = type === 'logo' ? setUploadingLogo : type === 'favicon' ? setUploadingFavicon : setUploadingDoc;
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('type', type);
      const res = await fetch(`${API}/api/v1/profile/upload-asset`, { method: 'POST', credentials: 'include', body });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (type === 'logo') setForm(f => ({ ...f, logo_url: data.url }));
      if (type === 'favicon') setForm(f => ({ ...f, favicon_url: data.url }));
      if (type === 'document') { setDocSent(true); setTimeout(() => setDocSent(false), 2500); }
    } catch {
      // Échec silencieux — le champ reste inchangé, l'utilisateur peut réessayer.
    } finally {
      setUploading(false);
    }
  }

  async function saveBrand() {
    setSavingBrand(true);
    try {
      const res = await fetch(`${API}/api/v1/profile/brand`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couleur_primaire: form.couleur_primaire, couleur_secondaire: form.couleur_secondaire }),
      });
      if (res.ok) { setSavedBrand(true); setTimeout(() => setSavedBrand(false), 1800); }
    } finally {
      setSavingBrand(false);
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60dvh' }}>
      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-light-border-2)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
    </div>
  );

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', paddingTop: 'var(--space-12)', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontFamily: 'var(--font-display)', color: 'white', fontWeight: 800, fontSize: 'var(--text-lg)' }}>
            {initiales(form.nom_complet)}
          </span>
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px',
            letterSpacing: '-0.03em', color: 'var(--color-light-text)', margin: '0 0 4px',
          }}>
            {form.nom_complet || '—'}
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-3)', margin: 0 }}>
            {form.email}
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        {(['infos', 'docs'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--radius-full)',
              border: `1px solid ${tab === t ? 'var(--color-brand)' : 'var(--color-light-border)'}`,
              cursor: 'pointer', background: tab === t ? 'var(--color-brand)' : 'var(--color-light-2)',
              color: tab === t ? 'white' : 'var(--color-light-text-2)',
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', whiteSpace: 'nowrap',
            }}
          >
            {t === 'infos' ? 'Informations personnelles' : 'Documents de marque'}
          </button>
        ))}
      </div>

      {tab === 'infos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          <section style={cardStyle}>
            <div style={cardTitleStyle}>Coordonnées</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
              <Field label="Nom légal" value={form.nom_complet} onChange={v => setForm(f => ({ ...f, nom_complet: v }))} />
              <Field label="Courriel" value={form.email} onChange={() => {}} type="email" />
              <Field label="Téléphone" value={form.telephone || ''} onChange={v => setForm(f => ({ ...f, telephone: v }))} type="tel" />
              <Field label="Entreprise" value={form.nom_entreprise || ''} onChange={v => setForm(f => ({ ...f, nom_entreprise: v }))} />
            </div>
            <Field label="Adresse" value={form.adresse_facturation || ''} onChange={v => setForm(f => ({ ...f, adresse_facturation: v }))} />
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 1fr', gap: 'var(--space-4)' }}>
              <Field label="Ville" value={form.ville_facturation || ''} onChange={v => setForm(f => ({ ...f, ville_facturation: v }))} />
              <Field label="Province" value={form.province_facturation || ''} onChange={v => setForm(f => ({ ...f, province_facturation: v }))} />
              <Field label="Code postal" value={form.code_postal_facturation || ''} onChange={v => setForm(f => ({ ...f, code_postal_facturation: v }))} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--space-3)' }}>
              {savedInfos && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-success)' }}>Enregistré ✓</span>}
              <button onClick={saveInfos} disabled={savingInfos} style={saveBtnStyle(savingInfos)}>
                {savingInfos ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </section>

          <section style={cardStyle}>
            <div style={cardTitleStyle}>Sécurité</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              <Field label="Mot de passe actuel" value={pw.actuel} onChange={v => setPw(p => ({ ...p, actuel: v }))} type="password" />
              <Field label="Nouveau mot de passe" value={pw.nouveau} onChange={v => setPw(p => ({ ...p, nouveau: v }))} type="password" />
              <Field label="Confirmer" value={pw.confirmer} onChange={v => setPw(p => ({ ...p, confirmer: v }))} type="password" />
            </div>
            {pwMismatch && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-error)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
                Les mots de passe ne correspondent pas.
              </div>
            )}
            {pwError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-error)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
                {pwError}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--space-3)' }}>
              {savedPw && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-success)' }}>Mot de passe changé ✓</span>}
              <button
                onClick={changerMotDePasse}
                disabled={savingPw || !pw.actuel || !pw.nouveau || pwMismatch}
                style={saveBtnStyle(savingPw || !pw.actuel || !pw.nouveau || pwMismatch)}
              >
                {savingPw ? 'Envoi…' : 'Changer le mot de passe'}
              </button>
            </div>
          </section>

        </div>
      )}

      {tab === 'docs' && (
        <section style={cardStyle}>
          <div>
            <div style={{ ...cardTitleStyle, marginBottom: '4px' }}>Logo</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>
              Utilisé sur votre site, vos réseaux sociaux et vos documents.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-4)' }}>
            <AssetDropZone
              label="Logo principal" hint="Glissez votre logo (PNG/SVG)"
              previewUrl={form.logo_url} width="100%" height="140px"
              uploading={uploadingLogo} onUpload={f => uploadAsset(f, 'logo')}
            />
            <div style={{ maxWidth: '140px' }}>
              <AssetDropZone
                label="Icône / favicon" hint="Glissez une icône carrée"
                previewUrl={form.favicon_url} width="140px" height="140px"
                uploading={uploadingFavicon} onUpload={f => uploadAsset(f, 'favicon')}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-light-border)' }} />

          <div>
            <div style={{ ...cardTitleStyle, marginBottom: '4px' }}>Couleurs de marque</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>
              Utilisées pour personnaliser votre site et vos documents générés.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
            {([
              { key: 'couleur_primaire' as const, label: 'Primaire' },
              { key: 'couleur_secondaire' as const, label: 'Secondaire' },
            ]).map(c => (
              <label key={c.key} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignItems: 'center' }}>
                <div style={{
                  position: 'relative', width: '52px', height: '52px', borderRadius: '50%',
                  border: '2px solid var(--color-light-border)', overflow: 'hidden',
                }}>
                  <input
                    type="color"
                    value={form[c.key] || '#c0321a'}
                    onChange={e => setForm(f => ({ ...f, [c.key]: e.target.value }))}
                    style={{ position: 'absolute', inset: '-4px', width: 'calc(100% + 8px)', height: 'calc(100% + 8px)', border: 'none', cursor: 'pointer', padding: 0 }}
                  />
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-light-text-3)', fontWeight: 700 }}>{c.label}</span>
              </label>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--color-light-border)' }} />

          <div>
            <div style={{ ...cardTitleStyle, marginBottom: '4px' }}>Autres documents</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>
              Charte graphique, polices, ou tout autre fichier de référence pour votre équipe.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              onClick={() => docInputRef.current?.click()}
              disabled={uploadingDoc}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
                background: 'var(--color-light-1)', border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-5)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)',
                color: 'var(--color-light-text)', cursor: uploadingDoc ? 'default' : 'pointer', width: 'fit-content',
              }}
            >
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-brand)' }}>upload_file</span>
              {uploadingDoc ? 'Envoi…' : 'Téléverser un document'}
            </button>
            {docSent && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-success)' }}>Envoyé dans votre dossier Drive ✓</span>}
            <input
              ref={docInputRef}
              type="file"
              hidden
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadAsset(f, 'document'); }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--space-3)', paddingTop: 'var(--space-1)' }}>
            {savedBrand && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-success)' }}>Enregistré ✓</span>}
            <button onClick={saveBrand} disabled={savingBrand} style={saveBtnStyle(savingBrand)}>
              {savingBrand ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </section>
      )}

    </main>
  );
}
