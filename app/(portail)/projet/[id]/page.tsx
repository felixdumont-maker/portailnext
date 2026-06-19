'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || '';

// ─── Types ───────────────────────────────────────────────────

interface ChecklistItem {
  id: number;
  nom_item: string;
  est_coche: boolean;
  requires_file: boolean;
  file_path: string | null;
  video_url: string | null;
  is_required: boolean;
  item_type: string;
  field_type: string;
  text_value: string | null;
}

interface Member { name: string; title: string; desc: string }

interface DriveFolder {
  id: string;
  name: string;
  webViewLink: string;
}

interface Projet {
  id: number;
  nom_projet: string;
  statut: string;
  is_archived: boolean;
  lien_gdrive: string | null;
  date_livraison_estimee: string | null;
  has_identite_visuelle: boolean;
  has_decision_board: boolean;
  logo_fichiers: { id: number; filename: string }[];
  items: ChecklistItem[];
  dossiers_drive: DriveFolder[];
}

// ─── Helpers ─────────────────────────────────────────────────

const STATUT_STYLES: Record<string, { bg: string; text: string }> = {
  'Documents à donner': { bg: 'var(--color-fire-bg)',    text: 'var(--color-fire-text)'  },
  'Documents reçus':    { bg: 'var(--color-info-bg-2)',   text: 'var(--color-info-text)' },
  'Travaux en cours':   { bg: 'var(--color-brand-muted)', text: 'var(--color-brand-hover)' },
  'En révision':        { bg: 'var(--color-warning-bg-2)',    text: 'var(--color-warning-mid-2)'  },
  'Finalisation':       { bg: 'var(--color-teal-bg)',   text: 'var(--color-teal-text)' },
  'Travaux terminés':   { bg: 'var(--color-success-bg-2)',   text: 'var(--color-success-text-2)' },
  'Complété':           { bg: 'var(--color-success-bg-2)',   text: 'var(--color-success-text-2)' },
  'Annulé':             { bg: 'var(--color-light-0)',   text: 'var(--color-light-text-3)' },
};

const READ_ONLY_STATUTS = new Set(['Complété', 'Annulé', 'Travaux terminés']);

function isReadOnly(projet: Projet) {
  return projet.is_archived || READ_ONLY_STATUTS.has(projet.statut);
}

function nomCourt(nom: string) {
  const parts = nom.split(' — ');
  return parts.length >= 2 ? parts[1] : nom;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── Item type classifier ─────────────────────────────────────

type ItemVariant = 'upload-pending' | 'video' | 'text-input' | 'members' | 'task' | 'done' | 'file-or-textarea' | 'color-palette' | 'review';

function hasAnyMember(tv: string | null): boolean {
  if (!tv) return false;
  try {
    const ms = JSON.parse(tv);
    return Array.isArray(ms) && ms.some((m: Member) => m.name?.trim());
  } catch { return false; }
}

function hasColorPaletteData(item: ChecklistItem): boolean {
  if (item.file_path) return true;
  if (!item.text_value) return false;
  try {
    const d = JSON.parse(item.text_value);
    return (Array.isArray(d.colors) && d.colors.length > 0) || !!d.notes?.trim();
  } catch { return !!item.text_value.trim(); }
}

function getVariant(item: ChecklistItem): ItemVariant {
  if (item.field_type === 'color-palette') return hasColorPaletteData(item) ? 'done' : 'color-palette';
  if (item.field_type === 'members') return hasAnyMember(item.text_value) ? 'done' : 'members';
  if (item.est_coche || item.file_path || item.text_value) return 'done';
  if (item.item_type === 'video' && item.video_url) return 'video';
  if (item.field_type === 'review') return 'review';
  if (item.requires_file) return 'upload-pending';
  if (item.field_type === 'file-or-textarea') return 'file-or-textarea';
  if (['text', 'textarea', 'url'].includes(item.field_type || 'check')) return 'text-input';
  return 'task';
}

// ─── Skeleton ────────────────────────────────────────────────

function SkeletonBlock({ w = '100%', h = '20px', radius = 'var(--radius-sm)' }: { w?: string; h?: string; radius?: string }) {
  return (
    <div style={{
      width: w,
      height: h,
      borderRadius: radius,
      background: 'var(--color-light-0)',
    }} />
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '0 var(--space-6)', paddingTop: 'var(--space-12)' }}>
      <SkeletonBlock w="80px" h="12px" />
      <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <SkeletonBlock w="65%" h="52px" radius="var(--radius-md)" />
        <SkeletonBlock w="120px" h="26px" radius="var(--radius-full)" />
      </div>
      <div style={{ marginTop: 'var(--space-12)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {[1, 2, 3].map(i => (
          <SkeletonBlock key={i} h="72px" radius="var(--radius-md)" />
        ))}
      </div>
    </div>
  );
}

// ─── Item components ──────────────────────────────────────────

function UploadPendingItem({
  item,
  uploading,
  onUpload,
}: {
  item: ChecklistItem;
  uploading: boolean;
  onUpload: (file: File) => void;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-4)',
      padding: 'var(--space-4) var(--space-6)',
      background: 'var(--color-brand-muted)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-light-border-4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0 }}>
        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-brand)', flexShrink: 0 }}>
          upload_file
        </span>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-light-text)', display: 'block' }}>
            {item.nom_item}
          </span>
          {!item.is_required && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', fontWeight: 500 }}>
              optionnel
            </span>
          )}
        </div>
      </div>
      <label style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-4)',
        background: uploading ? 'var(--color-light-text-3)' : 'var(--color-brand)',
        color: 'white', borderRadius: 'var(--radius-full)',
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
        textTransform: 'uppercase' as const, letterSpacing: '0.06em',
        cursor: uploading ? 'default' : 'pointer', flexShrink: 0,
        minHeight: '44px', transition: `background var(--duration-fast)`, whiteSpace: 'nowrap' as const,
      }}>
        {uploading ? (
          <><span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px', animation: 'spin 1s linear infinite' }}>progress_activity</span>Envoi…</>
        ) : (
          <><span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_upward</span>Envoyer</>
        )}
        <input type="file" style={{ display: 'none' }} disabled={uploading}
          onChange={e => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }} />
      </label>
    </div>
  );
}

function VideoItem({ item }: { item: ChecklistItem }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-6)',
      background: 'var(--color-light-2)', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-light-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0 }}>
        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-light-text-2)', flexShrink: 0 }}>play_circle</span>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-light-text)', display: 'block' }}>
            {item.nom_item}
          </span>
          {!item.is_required && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>optionnel</span>
          )}
        </div>
      </div>
      <a href={item.video_url!} target="_blank" rel="noreferrer" style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-4)', background: 'var(--color-light-0)',
        color: 'var(--color-light-text)', borderRadius: 'var(--radius-full)',
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
        textTransform: 'uppercase' as const, letterSpacing: '0.06em', textDecoration: 'none',
        flexShrink: 0, minHeight: '44px', whiteSpace: 'nowrap' as const,
      }}>
        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
        Regarder
      </a>
    </div>
  );
}

function TextInputItem({
  item,
  onSave,
}: {
  item: ChecklistItem;
  onSave: (value: string) => Promise<void>;
}) {
  const [value, setValue] = useState(item.text_value || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTextarea = item.field_type === 'textarea';

  const handleChange = (v: string) => {
    setValue(v);
    setSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSaving(true);
      await onSave(v);
      setSaving(false);
      setSaved(true);
    }, 900);
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-light-text)',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    resize: 'none',
    padding: 0,
    minWidth: 0,
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      padding: 'var(--space-4) var(--space-6)',
      background: 'var(--color-light-2)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-light-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1 }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-brand)', flexShrink: 0 }}>
            {item.field_type === 'url' ? 'link' : 'edit_note'}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-light-text)' }}>
            {item.nom_item}
          </span>
          {!item.is_required && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>optionnel</span>
          )}
        </div>
        {saving && (
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-light-text-3)', animation: 'spin 1s linear infinite' }}>
            progress_activity
          </span>
        )}
        {saved && !saving && (
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-success)' }}>
            check_circle
          </span>
        )}
      </div>
      <div style={{
        display: 'flex',
        alignItems: isTextarea ? 'flex-start' : 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-3)',
        background: 'var(--color-light-0)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-light-border)',
        minHeight: isTextarea ? '80px' : '44px',
      }}>
        {isTextarea ? (
          <textarea
            value={value}
            onChange={e => handleChange(e.target.value)}
            placeholder="Entrez votre réponse…"
            rows={3}
            style={{ ...inputStyle, paddingTop: 'var(--space-1)' }}
          />
        ) : (
          <input
            type={item.field_type === 'url' ? 'url' : 'text'}
            value={value}
            onChange={e => handleChange(e.target.value)}
            placeholder={item.field_type === 'url' ? 'https://…' : 'Entrez votre réponse…'}
            style={inputStyle}
          />
        )}
      </div>
    </div>
  );
}

function FileOrTextareaItem({
  item,
  uploading,
  onUpload,
  onSave,
}: {
  item: ChecklistItem;
  uploading: boolean;
  onUpload: (file: File) => void;
  onSave: (value: string) => Promise<void>;
}) {
  const [value, setValue] = useState(item.text_value || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (v: string) => {
    setValue(v);
    setSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSaving(true);
      await onSave(v);
      setSaving(false);
      setSaved(true);
    }, 900);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
      padding: 'var(--space-4) var(--space-6)',
      background: 'var(--color-light-2)', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-light-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0 }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-brand)', flexShrink: 0 }}>description</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-light-text)' }}>
            {item.nom_item}
          </span>
          {!item.is_required && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>optionnel</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
          {saving && <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-light-text-3)', animation: 'spin 1s linear infinite' }}>progress_activity</span>}
          {saved && !saving && <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-success)' }}>check_circle</span>}
          <label style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
            padding: 'var(--space-1) var(--space-3)',
            background: uploading ? 'var(--color-light-text-3)' : 'var(--color-light-0)',
            border: '1px solid var(--color-light-border-2)',
            color: 'var(--color-light-text-2)', borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
            textTransform: 'uppercase' as const, letterSpacing: '0.06em',
            cursor: uploading ? 'default' : 'pointer', minHeight: '36px', whiteSpace: 'nowrap' as const,
          }}>
            {uploading
              ? <><span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '12px', animation: 'spin 1s linear infinite' }}>progress_activity</span>Envoi…</>
              : <><span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '12px' }}>upload_file</span>PDF</>
            }
            <input type="file" accept=".pdf,.doc,.docx,.odt" style={{ display: 'none' }} disabled={uploading}
              onChange={e => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }} />
          </label>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-light-0)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-light-border)', minHeight: '72px' }}>
        <textarea
          value={value}
          onChange={e => handleChange(e.target.value)}
          placeholder="Ou saisissez le texte directement…"
          rows={3}
          style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', background: 'transparent', border: 'none', outline: 'none', resize: 'none', padding: 0, paddingTop: 'var(--space-1)', minWidth: 0 }}
        />
      </div>
    </div>
  );
}

function ReviewItem({
  item,
  uploading,
  onUpload,
  onSave,
  onToggle,
}: {
  item: ChecklistItem;
  uploading: boolean;
  onUpload: (file: File) => void;
  onSave: (value: string) => Promise<void>;
  onToggle: () => void;
}) {
  const [value, setValue] = useState(item.text_value || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (v: string) => {
    setValue(v);
    setSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSaving(true);
      await onSave(v);
      setSaving(false);
      setSaved(true);
    }, 900);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
      padding: 'var(--space-4) var(--space-6)',
      background: 'var(--color-light-2)', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-light-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0, cursor: 'pointer' }}>
          <input type="checkbox" checked={item.est_coche} onChange={onToggle}
            style={{ width: '20px', height: '20px', accentColor: 'var(--color-brand)', cursor: 'pointer', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-light-text)' }}>
            {item.nom_item}
          </span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
          {saving && <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-light-text-3)', animation: 'spin 1s linear infinite' }}>progress_activity</span>}
          {saved && !saving && <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-success)' }}>check_circle</span>}
          <label style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
            padding: 'var(--space-1) var(--space-3)',
            background: uploading ? 'var(--color-light-text-3)' : 'var(--color-light-0)',
            border: '1px solid var(--color-light-border-2)',
            color: 'var(--color-light-text-2)', borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
            textTransform: 'uppercase' as const, letterSpacing: '0.06em',
            cursor: uploading ? 'default' : 'pointer', minHeight: '36px', whiteSpace: 'nowrap' as const,
          }}>
            {uploading
              ? <><span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '12px', animation: 'spin 1s linear infinite' }}>progress_activity</span>Envoi…</>
              : <><span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '12px' }}>attach_file</span>Fichier</>
            }
            <input type="file" accept="image/*,.pdf,.doc,.docx" style={{ display: 'none' }} disabled={uploading}
              onChange={e => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }} />
          </label>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-light-0)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-light-border)', minHeight: '56px' }}>
        <textarea
          value={value}
          onChange={e => handleChange(e.target.value)}
          placeholder="Rien à signaler ? Cochez la case. Sinon, décrivez ici ce qui doit changer (ou joignez une image)…"
          rows={2}
          style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', background: 'transparent', border: 'none', outline: 'none', resize: 'none', padding: 0, paddingTop: 'var(--space-1)', minWidth: 0 }}
        />
      </div>
    </div>
  );
}

function MembersItem({
  item,
  onSave,
}: {
  item: ChecklistItem;
  onSave: (value: string) => Promise<void>;
}) {
  const blank: Member = { name: '', title: '', desc: '' };

  function parse(tv: string | null): Member[] {
    if (!tv) return [blank];
    try {
      const ms = JSON.parse(tv);
      if (Array.isArray(ms) && ms.length > 0) return ms;
    } catch {}
    return [blank];
  }

  const [members, setMembers] = useState<Member[]>(() => parse(item.text_value));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function schedSave(updated: Member[]) {
    setSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSaving(true);
      await onSave(JSON.stringify(updated));
      setSaving(false);
      setSaved(true);
    }, 900);
  }

  function update(idx: number, field: keyof Member, val: string) {
    const next = members.map((m, i) => i === idx ? { ...m, [field]: val } : m);
    setMembers(next);
    schedSave(next);
  }

  function addMember() {
    const next = [...members, { ...blank }];
    setMembers(next);
    schedSave(next);
  }

  function removeMember(idx: number) {
    if (members.length <= 1) return;
    const next = members.filter((_, i) => i !== idx);
    setMembers(next);
    schedSave(next);
  }

  const fieldStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-light-text)',
    background: 'white',
    border: '1px solid var(--color-light-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 12px',
    outline: 'none',
    width: '100%',
    minHeight: '36px',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
      padding: 'var(--space-4) var(--space-6)',
      background: 'var(--color-light-2)', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-light-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-brand)', flexShrink: 0 }}>group</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-light-text)' }}>
            {item.nom_item}
          </span>
          {!item.is_required && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>optionnel</span>
          )}
        </div>
        {saving && <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-light-text-3)', animation: 'spin 1s linear infinite' }}>progress_activity</span>}
        {saved && !saving && <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-success)' }}>check_circle</span>}
      </div>

      {members.map((member, idx) => (
        <div key={idx} style={{
          display: 'flex', flexDirection: 'column', gap: 'var(--space-2)',
          padding: 'var(--space-3)',
          background: 'var(--color-light-0)', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-light-border)', position: 'relative',
        }}>
          {members.length > 1 && (
            <button onClick={() => removeMember(idx)} style={{
              position: 'absolute', top: '8px', right: '8px',
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
              color: 'var(--color-light-text-3)', display: 'flex', alignItems: 'center',
            }}>
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
            </button>
          )}
          <input aria-label="Nom" type="text" placeholder="Nom" value={member.name}
            onChange={e => update(idx, 'name', e.target.value)} style={fieldStyle} />
          <input aria-label="Titre / rôle" type="text" placeholder="Titre / rôle" value={member.title}
            onChange={e => update(idx, 'title', e.target.value)} style={fieldStyle} />
          <input aria-label="Description courte" type="text" placeholder="Description courte" value={member.desc}
            onChange={e => update(idx, 'desc', e.target.value)} style={fieldStyle} />
        </div>
      ))}

      <button onClick={addMember} style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-3)',
        background: 'none', border: '1px dashed var(--color-light-border-2)',
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 600,
        color: 'var(--color-light-text-3)', cursor: 'pointer',
        textTransform: 'uppercase' as const, letterSpacing: '0.06em', alignSelf: 'flex-start',
      }}>
        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
        Ajouter un membre
      </button>
    </div>
  );
}

function ColorPaletteItem({
  item,
  uploading,
  onUpload,
  onSave,
}: {
  item: ChecklistItem;
  uploading: boolean;
  onUpload: (file: File) => void;
  onSave: (value: string) => Promise<void>;
}) {
  function parse(tv: string | null): { colors: string[]; notes: string } {
    if (!tv) return { colors: ['var(--color-dark-0)'], notes: '' };
    try {
      const d = JSON.parse(tv);
      return { colors: Array.isArray(d.colors) && d.colors.length ? d.colors : ['var(--color-dark-0)'], notes: d.notes || '' };
    } catch { return { colors: ['var(--color-dark-0)'], notes: tv }; }
  }

  const init = parse(item.text_value);
  const [colors, setColors] = useState<string[]>(init.colors);
  const [notes, setNotes] = useState(init.notes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function schedSave(c: string[], n: string) {
    setSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSaving(true);
      await onSave(JSON.stringify({ colors: c, notes: n }));
      setSaving(false);
      setSaved(true);
    }, 800);
  }

  function updateColor(idx: number, val: string) {
    const next = colors.map((c, i) => i === idx ? val : c);
    setColors(next);
    schedSave(next, notes);
  }

  function addColor() {
    const next = [...colors, '#ffffff'];
    setColors(next);
    schedSave(next, notes);
  }

  function removeColor(idx: number) {
    if (colors.length <= 1) return;
    const next = colors.filter((_, i) => i !== idx);
    setColors(next);
    schedSave(next, notes);
  }

  function handleNotes(v: string) {
    setNotes(v);
    schedSave(colors, v);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-6)', background: 'var(--color-light-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-light-border)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0 }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-brand)', flexShrink: 0 }}>palette</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-light-text)' }}>{item.nom_item}</span>
          {!item.is_required && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>optionnel</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
          {saving && <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-light-text-3)', animation: 'spin 1s linear infinite' }}>progress_activity</span>}
          {saved && !saving && <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-success)' }}>check_circle</span>}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', padding: 'var(--space-1) var(--space-3)', background: uploading ? 'var(--color-light-text-3)' : 'var(--color-light-0)', border: '1px solid var(--color-light-border-2)', color: 'var(--color-light-text-2)', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', cursor: uploading ? 'default' : 'pointer', minHeight: '36px', whiteSpace: 'nowrap' as const }}>
            {uploading
              ? <><span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '12px', animation: 'spin 1s linear infinite' }}>progress_activity</span>Envoi…</>
              : <><span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '12px' }}>image</span>Référence</>
            }
            <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} disabled={uploading} onChange={e => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }} />
          </label>
        </div>
      </div>

      {/* Color swatches */}
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'var(--space-2)', alignItems: 'center' }}>
        {colors.map((color, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-light-0)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-light-border)', padding: '4px 8px 4px 4px' }}>
            <input
              type="color"
              value={color}
              onChange={e => updateColor(idx, e.target.value)}
              style={{ width: '30px', height: '30px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0, background: 'none', flexShrink: 0 }}
            />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-2)', fontWeight: 600, letterSpacing: '0.05em', minWidth: '58px' }}>
              {color.toUpperCase()}
            </span>
            {colors.length > 1 && (
              <button onClick={() => removeColor(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--color-light-text-3)', display: 'flex', alignItems: 'center' }}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
              </button>
            )}
          </div>
        ))}
        <button onClick={addColor} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: 'var(--space-2) var(--space-3)', background: 'none', border: '1px dashed var(--color-light-border-2)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-light-text-3)', cursor: 'pointer', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
          Couleur
        </button>
      </div>

      {/* Notes */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-light-0)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-light-border)', minHeight: '56px' }}>
        <textarea
          value={notes}
          onChange={e => handleNotes(e.target.value)}
          placeholder="Décrivez vos couleurs ou nommez-les (ex : rouge pour les boutons, beige pour le fond…). Si vous ne savez pas, utilisez le bouton Référence pour envoyer une image ou un post."
          rows={2}
          style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', background: 'transparent', border: 'none', outline: 'none', resize: 'none', padding: 0, paddingTop: 'var(--space-1)', minWidth: 0 }}
        />
      </div>
    </div>
  );
}

function TaskItem({
  item,
  readOnly,
  onToggle,
}: {
  item: ChecklistItem;
  readOnly: boolean;
  onToggle: () => void;
}) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
      padding: 'var(--space-4) var(--space-6)',
      background: 'var(--color-light-2)', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-light-border)',
      cursor: readOnly ? 'default' : 'pointer', minHeight: '56px',
    }}>
      <input type="checkbox" checked={item.est_coche} onChange={readOnly ? undefined : onToggle}
        disabled={readOnly} style={{ width: '20px', height: '20px', accentColor: 'var(--color-brand)', cursor: readOnly ? 'default' : 'pointer', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-light-text)', display: 'block' }}>
          {item.nom_item}
        </span>
        {!item.is_required && (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>optionnel</span>
        )}
      </div>
    </label>
  );
}

function DoneItem({ item, onEdit }: { item: ChecklistItem; onEdit?: () => void }) {
  let preview: string | null = null;
  let colorSwatches: string[] | null = null;

  if (item.field_type === 'color-palette' && item.text_value) {
    try {
      const d = JSON.parse(item.text_value);
      if (Array.isArray(d.colors) && d.colors.length > 0) colorSwatches = d.colors;
      if (d.notes?.trim()) preview = d.notes.length > 50 ? d.notes.slice(0, 50) + '…' : d.notes;
    } catch {}
  } else if (item.field_type === 'members' && item.text_value) {
    try {
      const ms: Member[] = JSON.parse(item.text_value);
      const names = ms.filter(m => m.name?.trim()).map(m => m.name.trim());
      if (names.length > 0) preview = names.join(', ');
    } catch {}
  } else if (item.text_value) {
    preview = item.text_value.length > 60 ? item.text_value.slice(0, 60) + '…' : item.text_value;
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
      padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-md)', opacity: 0.55,
    }}>
      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-success)', flexShrink: 0 }}>check_circle</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
          color: 'var(--color-light-text-2)', textDecoration: 'line-through',
          textDecorationColor: 'var(--color-light-border-2)', display: 'block',
        }}>
          {item.nom_item}
        </span>
        {colorSwatches && (
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' as const }}>
            {colorSwatches.map((c, i) => (
              <span key={i} style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '3px', background: c, border: '1px solid rgba(0,0,0,0.1)' }} title={c} />
            ))}
          </div>
        )}
        {preview && (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>
            {preview}
          </span>
        )}
      </div>
      {onEdit && (
        <button
          onClick={onEdit}
          title="Modifier"
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            color: 'var(--color-light-text-3)', display: 'flex', alignItems: 'center',
            flexShrink: 0, minHeight: '44px', minWidth: '44px', justifyContent: 'center',
            borderRadius: 'var(--radius-sm)', transition: 'color var(--duration-fast)',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-brand)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-light-text-3)')}
        >
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
        </button>
      )}
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
      textTransform: 'uppercase' as const, letterSpacing: '0.12em',
      color: 'var(--color-light-text-3)', margin: '0 0 var(--space-3)',
    }}>
      {children}
    </h2>
  );
}

// ─── Main page ────────────────────────────────────────────────

export default function ProjetDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [projet, setProjet] = useState<Projet | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [addingUpload, setAddingUpload] = useState<string | null>(null);
  const [editingIds, setEditingIds] = useState<Set<number>>(new Set());

  function toggleEditing(itemId: number) {
    setEditingIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId); else next.add(itemId);
      return next;
    });
  }

  useEffect(() => {
    fetch(`${API}/api/v1/projet/${id}`, { credentials: 'include' })
      .then(r => {
        if (r.status === 401) { router.push('/'); return null; }
        return r.json();
      })
      .then(data => {
        if (data && !data.error) setProjet(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function toggleItem(itemId: number) {
    setProjet(prev => {
      if (!prev) return prev;
      return { ...prev, items: prev.items.map(i => i.id === itemId ? { ...i, est_coche: !i.est_coche } : i) };
    });
    await fetch(`${API}/api/v1/item/toggle/${itemId}`, { method: 'POST', credentials: 'include' });
  }

  async function uploadFile(itemId: number, file: File, onDone?: () => void) {
    setUploading(itemId);
    const form = new FormData();
    form.append('file', file);
    const r = await fetch(`${API}/api/v1/item/upload/${itemId}`, {
      method: 'POST', credentials: 'include', body: form,
    });
    if (r.ok) {
      const data = await r.json();
      setProjet(prev => {
        if (!prev) return prev;
        return { ...prev, items: prev.items.map(i => i.id === itemId ? { ...i, file_path: data.file_path, est_coche: true } : i) };
      });
      onDone?.();
    }
    setUploading(null);
  }

  async function addUploadItem(nomBase: string) {
    setAddingUpload(nomBase);
    const r = await fetch(`${API}/api/v1/projet/${id}/ajouter_upload`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom_base: nomBase }),
    });
    if (r.ok) {
      const newItem: ChecklistItem = await r.json();
      setProjet(prev => prev ? { ...prev, items: [...prev.items, newItem] } : prev);
    }
    setAddingUpload(null);
  }

  async function saveText(itemId: number, value: string) {
    const r = await fetch(`${API}/api/v1/item/text/${itemId}`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text_value: value }),
    });
    if (r.ok) {
      const data = await r.json();
      setProjet(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map(i =>
            i.id === itemId ? { ...i, text_value: data.text_value, est_coche: data.est_coche } : i
          ),
        };
      });
    }
  }

  // ── Render states ──────────────────────────────────────────

  if (loading) return <LoadingSkeleton />;

  if (!projet) return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-light-text-3)', marginBottom: 'var(--space-4)' }}>
        Projet introuvable.
      </p>
      <button onClick={() => router.push('/dashboard')} style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-brand)',
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      }}>
        ← Retour au tableau de bord
      </button>
    </div>
  );

  // ── Derived state ──────────────────────────────────────────

  const readOnly = isReadOnly(projet);
  const badge = STATUT_STYLES[projet.statut] || STATUT_STYLES['Annulé'];
  const pendingItems = projet.items.filter(i => getVariant(i) !== 'done');
  const doneItems = projet.items.filter(i => getVariant(i) === 'done');
  const total = projet.items.length;
  const done = doneItems.length;

  // Progression combinée : pipeline (étape) + checklist
  const STATUT_BASE: Record<string, number> = {
    'Documents à donner':        0,   // checklist drive cette étape
    'En attente de rendez-vous': 25,
    'Documents reçus':           40,
    'Travaux en cours':          60,
    'En révision':               80,
    'Complété':                  100,
    'Travaux terminés':          90,
    'Annulé':                    0,
  };
  const statut = projet.statut;
  const basePct = STATUT_BASE[statut] ?? 0;
  const checklistPct = total > 0 ? Math.round((done / total) * 100) : 0;
  // Pendant "Documents à donner", la barre reflète la checklist (max 35%)
  // Pour les autres étapes, le statut est la source principale + bonus checklist
  const pct = statut === 'Complété'
    ? 100
    : statut === 'Documents à donner'
      ? Math.max(Math.round(checklistPct * 0.35), total > 0 ? 5 : 0)
      : Math.min(basePct + (total > 0 ? Math.round(checklistPct * 0.15) : 0), 99);
  const allDone = pct === 100;

  // ── Page ───────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '0 var(--space-6)', paddingTop: 'var(--space-10)' }}>

      {/* Breadcrumb */}
      <button onClick={() => router.push('/dashboard')} style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase' as const,
        color: 'var(--color-light-text-3)', background: 'none', border: 'none',
        cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center',
        gap: 'var(--space-2)', marginBottom: 'var(--space-8)', minHeight: '44px',
        transition: `color var(--duration-fast)`,
      }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-light-text)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-light-text-3)')}
      >
        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
        Mes projets
      </button>

      {/* Header */}
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-3xl)',
          lineHeight: 1.0, letterSpacing: '-0.025em', textTransform: 'uppercase' as const,
          color: 'var(--color-light-text)', margin: '0 0 var(--space-4)',
        }}>
          {nomCourt(projet.nom_projet)}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{
            background: badge.bg, color: badge.text, padding: '4px 12px',
            borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)', fontWeight: 700,
            textTransform: 'uppercase' as const, letterSpacing: '0.05em', whiteSpace: 'nowrap' as const,
          }}>
            {projet.statut}
          </span>
          {projet.date_livraison_estimee && (
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
              color: 'var(--color-light-text-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
            }}>
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
              Livraison {formatDate(projet.date_livraison_estimee)}
            </span>
          )}
        </div>
      </header>

      {/* Sub-page navigation */}
      {(projet.has_identite_visuelle || projet.has_decision_board) && (
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
          {projet.has_identite_visuelle && (
            <a href={`/projet/${projet.id}/identite-visuelle`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)', background: 'var(--color-light-2)',
              border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 600,
              color: 'var(--color-light-text)', textDecoration: 'none', minHeight: '36px',
              transition: `border-color var(--duration-fast), background var(--duration-fast)`,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-light-border-2)'; e.currentTarget.style.background = 'var(--color-light-0)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-light-border)'; e.currentTarget.style.background = 'var(--color-light-2)'; }}
            >
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-brand)' }}>palette</span>
              Identité visuelle
            </a>
          )}
          {projet.has_decision_board && (
            <a href={`/projet/${projet.id}/decision-board`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)', background: 'var(--color-light-2)',
              border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 600,
              color: 'var(--color-light-text)', textDecoration: 'none', minHeight: '36px',
              transition: `border-color var(--duration-fast), background var(--duration-fast)`,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-light-border-2)'; e.currentTarget.style.background = 'var(--color-light-0)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-light-border)'; e.currentTarget.style.background = 'var(--color-light-2)'; }}
            >
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-brand)' }}>how_to_vote</span>
              Tableau de décision
            </a>
          )}
        </div>
      )}

      {/* À FAIRE — pending items */}
      {!readOnly && pendingItems.length > 0 && (
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <SectionLabel>À remplir</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-2)' }}>
            {pendingItems.map(item => {
              const variant = getVariant(item);
              if (variant === 'upload-pending') return (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-1)' }}>
                  <UploadPendingItem item={item} uploading={uploading === item.id}
                    onUpload={file => uploadFile(item.id, file)} />
                  <button
                    onClick={() => addUploadItem(item.nom_item)}
                    disabled={addingUpload === item.nom_item}
                    style={{
                      alignSelf: 'flex-start' as const,
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px',
                      fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 600,
                      color: 'var(--color-light-text-3)',
                      textTransform: 'uppercase' as const, letterSpacing: '0.08em',
                      transition: 'color var(--duration-fast)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-brand)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-light-text-3)')}
                  >
                    <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
                    {addingUpload === item.nom_item ? 'Ajout…' : 'Ajouter'}
                  </button>
                </div>
              );
              if (variant === 'video') return <VideoItem key={item.id} item={item} />;
              if (variant === 'text-input') return (
                <TextInputItem key={item.id} item={item} onSave={v => saveText(item.id, v)} />
              );
              if (variant === 'file-or-textarea') return (
                <FileOrTextareaItem key={item.id} item={item} uploading={uploading === item.id}
                  onUpload={file => uploadFile(item.id, file)} onSave={v => saveText(item.id, v)} />
              );
              if (variant === 'review') return (
                <ReviewItem key={item.id} item={item} uploading={uploading === item.id}
                  onUpload={file => uploadFile(item.id, file)} onSave={v => saveText(item.id, v)}
                  onToggle={() => toggleItem(item.id)} />
              );
              if (variant === 'members') return (
                <MembersItem key={item.id} item={item} onSave={v => saveText(item.id, v)} />
              );
              if (variant === 'color-palette') return (
                <ColorPaletteItem key={item.id} item={item} uploading={uploading === item.id}
                  onUpload={file => uploadFile(item.id, file)} onSave={v => saveText(item.id, v)} />
              );
              return <TaskItem key={item.id} item={item} readOnly={false} onToggle={() => toggleItem(item.id)} />;
            })}
          </div>
        </section>
      )}

      {/* Progress */}
      {total > 0 && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-2)' }}>
            {allDone ? (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-success)', fontWeight: 600 }}>
                Tout est en ordre.
              </span>
            ) : (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--color-light-text-3)' }}>
                Progression
              </span>
            )}
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 700, color: allDone ? 'var(--color-success)' : 'var(--color-light-text)', fontVariantNumeric: 'tabular-nums' }}>
              {pct}%
            </span>
          </div>
          <div style={{ height: '4px', background: 'var(--color-light-0)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '100%', background: allDone ? 'var(--color-success)' : 'var(--color-brand)', borderRadius: 'var(--radius-full)', transform: `scaleX(${pct / 100})`, transformOrigin: 'left', transition: `transform var(--duration-slow) var(--ease-out-quart)` }} />
          </div>
        </div>
      )}

      {/* COMPLÉTÉ — done items */}
      {doneItems.length > 0 && (
        <section style={{ marginBottom: 'var(--space-8)' }}>
          {pendingItems.length > 0 && <SectionLabel>Complété</SectionLabel>}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-1)' }}>
            {doneItems.map(item => {
              const isEditing = !readOnly && editingIds.has(item.id);

              if (isEditing) {
                const closeBtn = (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-1)' }}>
                    <button
                      onClick={() => toggleEditing(item.id)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '4px 8px', fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-xs)', fontWeight: 700,
                        textTransform: 'uppercase' as const, letterSpacing: '0.08em',
                        color: 'var(--color-light-text-3)', transition: 'color var(--duration-fast)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-light-text)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-light-text-3)')}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
                      Fermer
                    </button>
                  </div>
                );

                let editComponent: React.ReactNode = null;
                if (item.field_type === 'color-palette') {
                  editComponent = <ColorPaletteItem item={item} uploading={uploading === item.id}
                    onUpload={file => uploadFile(item.id, file)} onSave={v => saveText(item.id, v)} />;
                } else if (item.field_type === 'members') {
                  editComponent = <MembersItem item={item} onSave={v => saveText(item.id, v)} />;
                } else if (item.field_type === 'file-or-textarea') {
                  editComponent = <FileOrTextareaItem item={item} uploading={uploading === item.id}
                    onUpload={file => uploadFile(item.id, file)} onSave={v => saveText(item.id, v)} />;
                } else if (item.field_type === 'review') {
                  editComponent = <ReviewItem item={item} uploading={uploading === item.id}
                    onUpload={file => uploadFile(item.id, file)} onSave={v => saveText(item.id, v)}
                    onToggle={() => toggleItem(item.id)} />;
                } else if (['text', 'textarea', 'url'].includes(item.field_type || '')) {
                  editComponent = <TextInputItem item={item} onSave={v => saveText(item.id, v)} />;
                } else if (item.requires_file) {
                  editComponent = <UploadPendingItem item={item} uploading={uploading === item.id}
                    onUpload={file => uploadFile(item.id, file, () => toggleEditing(item.id))} />;
                } else {
                  editComponent = <TaskItem item={item} readOnly={false} onToggle={() => toggleItem(item.id)} />;
                }

                return (
                  <div key={item.id} style={{ marginBottom: 'var(--space-1)' }}>
                    {closeBtn}
                    {editComponent}
                  </div>
                );
              }

              return (
                <div key={item.id}>
                  <DoneItem item={item} onEdit={readOnly ? undefined : () => toggleEditing(item.id)} />
                  {item.requires_file && !readOnly && (
                    <button
                      onClick={() => addUploadItem(item.nom_item)}
                      disabled={addingUpload === item.nom_item}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '2px 2px 2px 30px',
                        fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 600,
                        color: 'var(--color-light-text-3)',
                        textTransform: 'uppercase' as const, letterSpacing: '0.08em',
                        transition: 'color var(--duration-fast)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-brand)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-light-text-3)')}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
                      {addingUpload === item.nom_item ? 'Ajout…' : 'Ajouter'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Read-only checklist */}
      {readOnly && projet.items.length > 0 && (
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <SectionLabel>Documents</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-2)' }}>
            {projet.items.map(item => {
              const variant = getVariant(item);
              if (variant === 'video') return <VideoItem key={item.id} item={item} />;
              if (variant === 'done') return <DoneItem key={item.id} item={item} />;
              return <TaskItem key={item.id} item={item} readOnly={true} onToggle={() => {}} />;
            })}
          </div>
        </section>
      )}

      {/* Dossiers Drive */}
      {projet.dossiers_drive && projet.dossiers_drive.filter(f =>
        !f.name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes('identit')
      ).length > 0 && (
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <SectionLabel>Dossiers</SectionLabel>
          <div style={{ display: 'flex', gap: 'var(--space-3)', overflowX: 'auto' as const, paddingBottom: 'var(--space-2)' }}>
            {projet.dossiers_drive.filter(f =>
              !f.name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes('identit')
            ).map(folder => (
              <a key={folder.id} href={folder.webViewLink} target="_blank" rel="noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)', background: 'var(--color-light-2)',
                border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-md)',
                textDecoration: 'none', flexShrink: 0, minHeight: '52px',
                transition: `border-color var(--duration-fast), background var(--duration-fast)`,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-light-border-2)'; e.currentTarget.style.background = 'var(--color-light-0)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-light-border)'; e.currentTarget.style.background = 'var(--color-light-2)'; }}
              >
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-brand)', flexShrink: 0 }}>folder</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-light-text)', whiteSpace: 'nowrap' as const }}>
                  {folder.name}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Google Drive CTA */}
      {projet.lien_gdrive && (
        <div style={{ paddingTop: 'var(--space-4)' }}>
          <a href={projet.lien_gdrive} target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-6)', background: 'var(--color-light-2)',
            border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600,
            color: 'var(--color-light-text)', textDecoration: 'none', minHeight: '48px',
            transition: `border-color var(--duration-fast), background var(--duration-fast)`,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-light-border-2)'; e.currentTarget.style.background = 'var(--color-light-0)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-light-border)'; e.currentTarget.style.background = 'var(--color-light-2)'; }}
          >
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-brand)' }}>drive_folder_upload</span>
            Voir dans Google Drive
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-light-text-3)' }}>open_in_new</span>
          </a>
        </div>
      )}

      {/* Logo vectorisé */}
      {projet.logo_fichiers && projet.logo_fichiers.length > 0 && (
        <div style={{ paddingTop: 'var(--space-4)', display: 'flex', flexWrap: 'wrap' as const, gap: 'var(--space-3)' }}>
          {projet.logo_fichiers.map(f => (
            <a key={f.id} href={`${API}/api/v1/projet/${id}/logo/${f.id}`} target="_blank" rel="noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-6)', background: 'var(--color-light-2)',
              border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600,
              color: 'var(--color-light-text)', textDecoration: 'none', minHeight: '48px',
              transition: `border-color var(--duration-fast), background var(--duration-fast)`,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-light-border-2)'; e.currentTarget.style.background = 'var(--color-light-0)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-light-border)'; e.currentTarget.style.background = 'var(--color-light-2)'; }}
            >
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-brand)' }}>download</span>
              {f.filename}
            </a>
          ))}
        </div>
      )}

    </div>
  );
}
