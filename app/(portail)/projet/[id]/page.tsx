'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IdentiteVisuelleContent } from './identite-visuelle/IdentiteVisuelleContent';
import { statutMeta, pipelineStepIndex } from '@/lib/statuts';

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
  is_revision: boolean;
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
  pipeline_steps: string[];
  progress_pct: number;
  is_archived: boolean;
  lien_gdrive: string | null;
  lien_site_test: string | null;
  date_livraison_estimee: string | null;
  has_identite_visuelle: boolean;
  has_decision_board: boolean;
  logo_fichiers: { id: number; filename: string }[];
  items: ChecklistItem[];
  dossiers_drive: DriveFolder[];
}

// ─── Helpers ─────────────────────────────────────────────────

const READ_ONLY_STATUTS = new Set(['Complété', 'Annulé', 'Travaux terminés']);

function isReadOnly(projet: Projet) {
  return projet.is_archived || READ_ONLY_STATUTS.has(projet.statut);
}

const DEFAULT_PIPELINE = ['Documents à donner', 'Documents reçus', 'Travaux en cours', 'En révision', 'Complété'];

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

// `keepEditing` : tant que l'utilisateur a le focus dans la carte, on ne la
// bascule pas en "done" — sinon une sauvegarde auto en cours de frappe (ex.
// nom d'un membre d'équipe rempli avant le rôle) éjecte la carte de la vue
// active et fait perdre ce qui n'est pas encore tapé.
function getVariant(item: ChecklistItem, keepEditing = false): ItemVariant {
  if (item.field_type === 'color-palette') return (!keepEditing && hasColorPaletteData(item)) ? 'done' : 'color-palette';
  if (item.field_type === 'members') return (!keepEditing && hasAnyMember(item.text_value)) ? 'done' : 'members';
  if (!keepEditing && (item.est_coche || item.file_path || item.text_value)) return 'done';
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

// Garde une carte "active" tant que le focus reste dedans, pour éviter
// qu'elle ne soit éjectée vers "Complété" pendant que l'utilisateur y tape.
function activityHandlers(onActiveChange?: (active: boolean) => void) {
  return {
    onFocus: () => onActiveChange?.(true),
    onBlur: (e: React.FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) onActiveChange?.(false);
    },
  };
}

// Envoi manuel plutôt qu'auto-save : l'utilisateur tape à son rythme, rien n'est
// transmis tant qu'il n'a pas cliqué la flèche — plus rien ne se sauvegarde (et donc
// ne peut faire disparaître la carte) pendant qu'il est encore en train d'écrire.
function useSendable(serialized: string, initial: string, onSave: (value: string) => Promise<void>) {
  const [savedSnapshot, setSavedSnapshot] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const dirty = serialized !== savedSnapshot;

  const send = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    await onSave(serialized);
    setSaving(false);
    setSavedSnapshot(serialized);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  return { dirty, saving, justSaved, send };
}

function SendButton({ dirty, saving, justSaved, onSend }: { dirty: boolean; saving: boolean; justSaved: boolean; onSend: () => void }) {
  const disabled = saving || !dirty;
  return (
    <button
      type="button"
      onClick={onSend}
      disabled={disabled}
      title={dirty ? 'Envoyer' : justSaved ? 'Envoyé' : 'Rien à envoyer'}
      style={{
        flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        background: justSaved ? 'var(--color-success)' : dirty && !saving ? 'var(--color-brand)' : 'var(--color-light-border)',
        color: justSaved || (dirty && !saving) ? 'white' : 'var(--color-light-text-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background var(--duration-fast)',
      }}
    >
      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px', animation: saving ? 'spin 1s linear infinite' : 'none' }}>
        {saving ? 'progress_activity' : justSaved ? 'check' : 'arrow_upward'}
      </span>
    </button>
  );
}

function TextInputItem({
  item,
  onSave,
  onActiveChange,
}: {
  item: ChecklistItem;
  onSave: (value: string) => Promise<void>;
  onActiveChange?: (active: boolean) => void;
}) {
  const [value, setValue] = useState(item.text_value || '');
  const isTextarea = item.field_type === 'textarea';
  const { dirty, saving, justSaved, send } = useSendable(value, item.text_value || '', onSave);

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
    <div {...activityHandlers(onActiveChange)} style={{
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
      </div>
      <div style={{
        display: 'flex',
        alignItems: isTextarea ? 'flex-end' : 'center',
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
            onChange={e => setValue(e.target.value)}
            placeholder="Entrez votre réponse…"
            rows={3}
            style={{ ...inputStyle, paddingTop: 'var(--space-1)' }}
          />
        ) : (
          <input
            type={item.field_type === 'url' ? 'url' : 'text'}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={item.field_type === 'url' ? 'https://…' : 'Entrez votre réponse…'}
            style={inputStyle}
          />
        )}
        <SendButton dirty={dirty} saving={saving} justSaved={justSaved} onSend={send} />
      </div>
    </div>
  );
}

function FileOrTextareaItem({
  item,
  uploading,
  onUpload,
  onSave,
  onActiveChange,
}: {
  item: ChecklistItem;
  uploading: boolean;
  onUpload: (file: File) => void;
  onSave: (value: string) => Promise<void>;
  onActiveChange?: (active: boolean) => void;
}) {
  const [value, setValue] = useState(item.text_value || '');
  const { dirty, saving, justSaved, send } = useSendable(value, item.text_value || '', onSave);

  return (
    <div {...activityHandlers(onActiveChange)} style={{
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
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-light-0)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-light-border)', minHeight: '72px' }}>
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Ou saisissez le texte directement…"
          rows={3}
          style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', background: 'transparent', border: 'none', outline: 'none', resize: 'none', padding: 0, paddingTop: 'var(--space-1)', minWidth: 0 }}
        />
        <SendButton dirty={dirty} saving={saving} justSaved={justSaved} onSend={send} />
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
  onActiveChange,
}: {
  item: ChecklistItem;
  uploading: boolean;
  onUpload: (file: File) => void;
  onSave: (value: string) => Promise<void>;
  onToggle: () => void;
  onActiveChange?: (active: boolean) => void;
}) {
  const [value, setValue] = useState(item.text_value || '');
  const { dirty, saving, justSaved, send } = useSendable(value, item.text_value || '', onSave);

  return (
    <div {...activityHandlers(onActiveChange)} style={{
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
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-light-0)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-light-border)', minHeight: '56px' }}>
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Rien à signaler ? Cochez la case. Sinon, décrivez ici ce qui doit changer (ou joignez une image)…"
          rows={2}
          style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', background: 'transparent', border: 'none', outline: 'none', resize: 'none', padding: 0, paddingTop: 'var(--space-1)', minWidth: 0 }}
        />
        <SendButton dirty={dirty} saving={saving} justSaved={justSaved} onSend={send} />
      </div>
    </div>
  );
}

function MembersItem({
  item,
  onSave,
  onActiveChange,
}: {
  item: ChecklistItem;
  onSave: (value: string) => Promise<void>;
  onActiveChange?: (active: boolean) => void;
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
  const { dirty, saving, justSaved, send } = useSendable(JSON.stringify(members), JSON.stringify(parse(item.text_value)), onSave);

  function update(idx: number, field: keyof Member, val: string) {
    setMembers(prev => prev.map((m, i) => i === idx ? { ...m, [field]: val } : m));
  }

  function addMember() {
    setMembers(prev => [...prev, { ...blank }]);
  }

  function removeMember(idx: number) {
    if (members.length <= 1) return;
    setMembers(prev => prev.filter((_, i) => i !== idx));
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
    <div {...activityHandlers(onActiveChange)} style={{
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
        <SendButton dirty={dirty} saving={saving} justSaved={justSaved} onSend={send} />
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
  onActiveChange,
}: {
  item: ChecklistItem;
  uploading: boolean;
  onUpload: (file: File) => void;
  onSave: (value: string) => Promise<void>;
  onActiveChange?: (active: boolean) => void;
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
  const { dirty, saving, justSaved, send } = useSendable(
    JSON.stringify({ colors, notes }),
    JSON.stringify(parse(item.text_value)),
    onSave
  );

  function updateColor(idx: number, val: string) {
    setColors(prev => prev.map((c, i) => i === idx ? val : c));
  }

  function addColor() {
    setColors(prev => [...prev, '#ffffff']);
  }

  function removeColor(idx: number) {
    if (colors.length <= 1) return;
    setColors(prev => prev.filter((_, i) => i !== idx));
  }

  return (
    <div {...activityHandlers(onActiveChange)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-6)', background: 'var(--color-light-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-light-border)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0 }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-brand)', flexShrink: 0 }}>palette</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-light-text)' }}>{item.nom_item}</span>
          {!item.is_required && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>optionnel</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', padding: 'var(--space-1) var(--space-3)', background: uploading ? 'var(--color-light-text-3)' : 'var(--color-light-0)', border: '1px solid var(--color-light-border-2)', color: 'var(--color-light-text-2)', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', cursor: uploading ? 'default' : 'pointer', minHeight: '36px', whiteSpace: 'nowrap' as const }}>
            {uploading
              ? <><span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '12px', animation: 'spin 1s linear infinite' }}>progress_activity</span>Envoi…</>
              : <><span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '12px' }}>image</span>Référence</>
            }
            <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} disabled={uploading} onChange={e => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }} />
          </label>
          <SendButton dirty={dirty} saving={saving} justSaved={justSaved} onSend={send} />
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
          onChange={e => setNotes(e.target.value)}
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

function Stepper({ currentStep, steps }: { currentStep: number; steps: string[] }) {
  return (
    <div style={{
      background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
      borderRadius: 'var(--radius-lg)', padding: 'var(--space-6) var(--space-8)', marginBottom: 'var(--space-6)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {steps.map((label, i) => {
          const num = i + 1;
          const done = num < currentStep;
          const active = num === currentStep;
          return (
            <Fragment key={label}>
              <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 'var(--space-2)', flex: 1, minWidth: 0 }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                  background: done ? 'var(--color-success)' : active ? 'var(--color-brand)' : 'var(--color-light-1)',
                  color: done || active ? 'white' : 'var(--color-light-text-3)',
                  border: done || active ? 'none' : '1px solid var(--color-light-border-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-sm)',
                }}>
                  {done
                    ? <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
                    : num}
                </div>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.04em',
                  textTransform: 'uppercase' as const, textAlign: 'center' as const,
                  color: active ? 'var(--color-light-text)' : 'var(--color-light-text-3)',
                }}>
                  {label}
                </span>
              </div>
              {num < steps.length && (
                <div style={{ flex: 1, height: '2px', minWidth: '12px', margin: '17px 6px 0', background: done ? 'var(--color-success)' : 'var(--color-light-border)' }} />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

function FichierDropzone({ uploading, sent, onUpload }: { uploading: boolean; sent: boolean; onUpload: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) onUpload(f); }}
        style={{
          border: `1.5px dashed ${dragOver ? 'var(--color-brand)' : 'var(--color-light-border-2)'}`,
          borderRadius: 'var(--radius-md)', padding: 'var(--space-6)', textAlign: 'center' as const,
          color: 'var(--color-light-text-3)', cursor: 'pointer',
          background: dragOver ? 'var(--color-brand-6pct)' : 'transparent',
          transition: `border-color var(--duration-fast), background var(--duration-fast)`,
        }}
      >
        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '26px', display: 'block', marginBottom: 'var(--space-1)' }}>
          {uploading ? 'progress_activity' : 'upload_file'}
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
          {uploading ? 'Envoi…' : 'Déposer un ou plusieurs fichiers'}
        </span>
        <input ref={inputRef} type="file" hidden disabled={uploading}
          onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
      </div>
      {sent && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-success)', margin: 'var(--space-2) 0 0' }}>
          Fichier envoyé ✓
        </p>
      )}
    </div>
  );
}

function ContactModal({ projetId, nomProjet, onClose, onSent }: { projetId: string | string[] | undefined; nomProjet: string; onClose: () => void; onSent: () => void }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function envoyer() {
    if (!message.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/v1/projet/${projetId}/contact`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });
      if (!res.ok) throw new Error();
      onSent();
      onClose();
    } catch {
      setError("Erreur lors de l'envoi. Réessayez.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'oklch(15% 0.01 40 / 0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 'var(--z-modal)' as never, padding: 'var(--space-6)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--color-light-2)', borderRadius: 'var(--radius-lg)',
        width: '100%', maxWidth: '460px', boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--color-light-border)',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg)', letterSpacing: '-0.01em', color: 'var(--color-light-text)' }}>
            Contacter mon équipe
          </span>
          <button onClick={onClose} aria-label="Fermer" style={{ background: 'none', border: 'none', color: 'var(--color-light-text-3)', cursor: 'pointer', display: 'flex', padding: 'var(--space-1)' }}>
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
          </button>
        </div>
        <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-4)' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>
            Projet <strong style={{ color: 'var(--color-light-text)' }}>{nomProjet}</strong>
          </div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            placeholder="Votre question ou commentaire…"
            style={{
              width: '100%', border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
              background: 'var(--color-light-0)', color: 'var(--color-light-text)', resize: 'vertical' as const,
            }}
          />
          {error && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>{error}</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', padding: 'var(--space-5) var(--space-6)', borderTop: '1px solid var(--color-light-border)' }}>
          <button onClick={onClose} style={{
            background: 'var(--color-light-1)', color: 'var(--color-light-text-2)', border: '1px solid var(--color-light-border)',
            borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-5)',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer',
          }}>
            Annuler
          </button>
          <button onClick={envoyer} disabled={sending || !message.trim()} style={{
            background: 'var(--color-brand)', color: 'white', border: 'none',
            borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-6)',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)',
            cursor: sending || !message.trim() ? 'default' : 'pointer', opacity: sending || !message.trim() ? 0.7 : 1,
          }}>
            {sending ? 'Envoi…' : 'Envoyer'}
          </button>
        </div>
      </div>
    </div>
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
  const [activeIds, setActiveIds] = useState<Set<number>>(new Set());
  const [uploadingFichier, setUploadingFichier] = useState(false);
  const [fichierSent, setFichierSent] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [showIV, setShowIV] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showRevisionDone, setShowRevisionDone] = useState(false);

  function toggleEditing(itemId: number) {
    setEditingIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId); else next.add(itemId);
      return next;
    });
  }

  function setItemActive(itemId: number, active: boolean) {
    setActiveIds(prev => {
      if (active === prev.has(itemId)) return prev;
      const next = new Set(prev);
      if (active) next.add(itemId); else next.delete(itemId);
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

  async function uploadFichierGeneral(file: File) {
    setUploadingFichier(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const r = await fetch(`${API}/api/v1/projet/${id}/upload-fichier`, { method: 'POST', credentials: 'include', body: form });
      if (r.ok) { setFichierSent(true); setTimeout(() => setFichierSent(false), 2500); }
    } finally {
      setUploadingFichier(false);
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
  const badge = statutMeta(projet.statut);
  const pipelineSteps = projet.pipeline_steps && projet.pipeline_steps.length > 0 ? projet.pipeline_steps : DEFAULT_PIPELINE;
  const isItemDone = (i: ChecklistItem) => getVariant(i, activeIds.has(i.id)) === 'done';
  const total = projet.items.length;
  const done = projet.items.filter(isItemDone).length;

  // Items de révision : sortis de la checklist générique pour vivre dans leur
  // propre section dédiée (voir plus bas), plus visible et moins facile à manquer.
  const revisionItems = projet.items.filter(i => i.is_revision);
  const revisionPending = revisionItems.filter(i => !isItemDone(i));
  const revisionDone = revisionItems.filter(isItemDone);
  const nonRevisionItems = readOnly ? projet.items : projet.items.filter(i => !i.is_revision);
  const pendingItems = nonRevisionItems.filter(i => !isItemDone(i));
  const doneItems = nonRevisionItems.filter(isItemDone);

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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 var(--space-6)', paddingTop: 'var(--space-10)' }}>

      {/* Breadcrumb */}
      <button onClick={() => router.push('/dashboard')} style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase' as const,
        color: 'var(--color-light-text-3)', background: 'none', border: 'none',
        cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center',
        gap: 'var(--space-2)', marginBottom: 'var(--space-4)', minHeight: '44px',
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

      {projet.statut !== 'Annulé' && <Stepper currentStep={pipelineStepIndex(pipelineSteps, projet.statut) || 1} steps={pipelineSteps} />}

      {/* Révision — section dédiée, visible avant tout le reste tant qu'il reste des
          points à réviser, pour qu'elle ne se perde pas dans la checklist générale. */}
      {!readOnly && revisionItems.length > 0 && (
        <section style={{
          marginBottom: 'var(--space-8)', background: 'var(--color-brand-muted)',
          border: '1px solid var(--color-brand)', borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6) var(--space-8)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--color-brand)' }}>rate_review</span>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg)',
              textTransform: 'uppercase' as const, letterSpacing: '-0.01em', color: 'var(--color-light-text)', margin: 0,
            }}>
              {revisionPending.length > 0 ? 'Révision de votre site' : 'Révision complétée'}
            </h2>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-2)', margin: '0 0 var(--space-5)', maxWidth: '560px' }}>
            {revisionPending.length > 0
              ? 'Vérifiez chaque point ci-dessous. Cochez « rien à signaler » si c’est bon, ou décrivez ce qui doit changer.'
              : 'Merci ! Vos réponses ont été transmises à notre équipe, qui s’occupe des corrections demandées.'}
          </p>
          {projet.lien_site_test && (
            <a href={projet.lien_site_test} target="_blank" rel="noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-6)', background: 'var(--color-brand)',
              color: 'white', borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
              textTransform: 'uppercase' as const, letterSpacing: '0.06em', textDecoration: 'none',
              marginBottom: 'var(--space-5)', minHeight: '44px',
            }}>
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
              Voir mon site
            </a>
          )}

          {revisionPending.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-2)' }}>
              {revisionPending.map(item => (
                <ReviewItem key={item.id} item={item} uploading={uploading === item.id}
                  onUpload={file => uploadFile(item.id, file)} onSave={v => saveText(item.id, v)}
                  onToggle={() => toggleItem(item.id)}
                  onActiveChange={active => setItemActive(item.id, active)} />
              ))}
            </div>
          )}

          {revisionDone.length > 0 && (
            <div style={{ marginTop: revisionPending.length > 0 ? 'var(--space-4)' : 0 }}>
              <button
                onClick={() => setShowRevisionDone(v => !v)}
                aria-expanded={showRevisionDone}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px',
                  marginBottom: 'var(--space-3)', minHeight: '32px',
                  color: 'var(--color-light-text-3)', transition: 'color var(--duration-fast)',
                }}
              >
                <span aria-hidden="true" className="material-symbols-outlined" style={{
                  fontSize: '18px', transform: showRevisionDone ? 'rotate(180deg)' : 'none',
                  transition: `transform var(--duration-base) var(--ease-out-quart)`,
                }}>
                  expand_more
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>
                  {showRevisionDone ? 'Masquer' : 'Voir'} vérifié ({revisionDone.length})
                </span>
              </button>
              {showRevisionDone && (
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-1)' }}>
                  {revisionDone.map(item => <DoneItem key={item.id} item={item} />)}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Sub-page navigation */}
      {projet.has_decision_board && (
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 'var(--space-6)', alignItems: 'start' }}>
      <div style={{ minWidth: 0 }}>

      {/* À FAIRE — pending items */}
      {!readOnly && pendingItems.length > 0 && (
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <SectionLabel>À remplir</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-2)' }}>
            {pendingItems.map(item => {
              const variant = getVariant(item, activeIds.has(item.id));
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
                <TextInputItem key={item.id} item={item} onSave={v => saveText(item.id, v)}
                  onActiveChange={active => setItemActive(item.id, active)} />
              );
              if (variant === 'file-or-textarea') return (
                <FileOrTextareaItem key={item.id} item={item} uploading={uploading === item.id}
                  onUpload={file => uploadFile(item.id, file)} onSave={v => saveText(item.id, v)}
                  onActiveChange={active => setItemActive(item.id, active)} />
              );
              if (variant === 'review') return (
                <ReviewItem key={item.id} item={item} uploading={uploading === item.id}
                  onUpload={file => uploadFile(item.id, file)} onSave={v => saveText(item.id, v)}
                  onToggle={() => toggleItem(item.id)}
                  onActiveChange={active => setItemActive(item.id, active)} />
              );
              if (variant === 'members') return (
                <MembersItem key={item.id} item={item} onSave={v => saveText(item.id, v)}
                  onActiveChange={active => setItemActive(item.id, active)} />
              );
              if (variant === 'color-palette') return (
                <ColorPaletteItem key={item.id} item={item} uploading={uploading === item.id}
                  onUpload={file => uploadFile(item.id, file)} onSave={v => saveText(item.id, v)}
                  onActiveChange={active => setItemActive(item.id, active)} />
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

      {/* COMPLÉTÉ — done items (rétractable) */}
      {doneItems.length > 0 && (
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <button
            onClick={() => setShowComplete(v => !v)}
            aria-expanded={showComplete}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px',
              marginBottom: 'var(--space-3)', minHeight: '32px',
              color: 'var(--color-light-text-3)', transition: 'color var(--duration-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-light-text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-light-text-3)')}
          >
            <span aria-hidden="true" className="material-symbols-outlined" style={{
              fontSize: '18px', transform: showComplete ? 'rotate(180deg)' : 'none',
              transition: `transform var(--duration-base) var(--ease-out-quart)`,
            }}>
              expand_more
            </span>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
              textTransform: 'uppercase' as const, letterSpacing: '0.12em',
            }}>
              {showComplete ? 'Masquer' : 'Voir'} complété ({doneItems.length})
            </span>
          </button>
          {showComplete && (
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
          )}
        </section>
      )}

      {/* Read-only checklist — items non complétés seulement (les complétés sont dans la section COMPLÉTÉ ci-dessus, déjà rétractable) */}
      {readOnly && pendingItems.length > 0 && (
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <SectionLabel>Documents</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-2)' }}>
            {pendingItems.map(item => {
              const variant = getVariant(item);
              if (variant === 'video') return <VideoItem key={item.id} item={item} />;
              return <TaskItem key={item.id} item={item} readOnly={true} onToggle={() => {}} />;
            })}
          </div>
        </section>
      )}

      {/* Fichiers du projet */}
      <section style={{
        marginBottom: 'var(--space-8)', background: 'var(--color-light-2)',
        border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)', display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-4)',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-sm)',
          letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'var(--color-light-text)',
        }}>
          Fichiers du projet
        </div>

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

        {!readOnly && (
          <div style={{ paddingTop: 'var(--space-2)' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', marginBottom: 'var(--space-3)' }}>
              Déposez vos fichiers de référence (logo, textes, photos…) — ils seront ajoutés au dossier du projet.
            </div>
            <FichierDropzone uploading={uploadingFichier} sent={fichierSent} onUpload={uploadFichierGeneral} />
          </div>
        )}
      </section>

      </div>

      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-5)' }}>
        <div style={{
          background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)',
        }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '10.5px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--color-light-text-3)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            Échéance livrable
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--color-light-text)', marginBottom: 'var(--space-5)' }}>
            {projet.date_livraison_estimee ? formatDate(projet.date_livraison_estimee) : '—'}
          </div>
          {total > 0 && (
            <>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '10.5px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--color-light-text-3)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                Progression checklist
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--color-light-text)' }}>
                  {done}/{total}
                </span>
                <div style={{ flex: 1, height: '6px', borderRadius: 'var(--radius-full)', background: 'var(--color-light-0)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${total > 0 ? Math.round((done / total) * 100) : 0}%`, background: 'var(--color-success)', borderRadius: 'var(--radius-full)', transition: `width var(--duration-slow) var(--ease-out-quart)` }} />
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{
          background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-sm)',
            letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'var(--color-light-text)', marginBottom: 'var(--space-4)',
          }}>
            Une question sur ce projet?
          </div>
          <button onClick={() => setShowContact(true)} style={{
            display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
            background: 'var(--color-brand)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-5)', fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 'var(--text-sm)', cursor: 'pointer', minHeight: '44px',
          }}>
            Contacter mon équipe
          </button>
          {contactSent && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-success)', margin: 'var(--space-3) 0 0', textAlign: 'center' as const }}>
              Message envoyé ✓
            </p>
          )}
        </div>
      </div>

      </div>

      {projet.has_identite_visuelle && (
        <div style={{ marginTop: 'var(--space-8)' }}>
          <button
            onClick={() => setShowIV(v => !v)}
            aria-expanded={showIV}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-4)', width: '100%',
              background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
              borderRadius: showIV ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)',
              padding: 'var(--space-5) var(--space-6)', cursor: 'pointer', textAlign: 'left' as const,
              transition: `border-color var(--duration-fast)`,
            }}
          >
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--color-brand)', flexShrink: 0 }}>palette</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-sm)', letterSpacing: '0.02em', color: 'var(--color-light-text)' }}>
                Identité visuelle
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', marginTop: '2px' }}>
                Palette, logos, typographie et assets de votre marque
              </div>
            </div>
            <span aria-hidden="true" className="material-symbols-outlined" style={{
              fontSize: '22px', color: 'var(--color-light-text-3)', flexShrink: 0,
              transform: showIV ? 'rotate(180deg)' : 'none', transition: `transform var(--duration-fast)`,
            }}>
              expand_more
            </span>
          </button>
          {showIV && (
            <div style={{
              background: 'var(--color-light-1)', border: '1px solid var(--color-light-border)', borderTop: 'none',
              borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', padding: 'var(--space-8)',
            }}>
              <IdentiteVisuelleContent projetId={id} />
            </div>
          )}
        </div>
      )}

      {showContact && (
        <ContactModal
          projetId={id}
          nomProjet={nomCourt(projet.nom_projet)}
          onClose={() => setShowContact(false)}
          onSent={() => { setContactSent(true); setTimeout(() => setContactSent(false), 2500); }}
        />
      )}

    </div>
  );
}
