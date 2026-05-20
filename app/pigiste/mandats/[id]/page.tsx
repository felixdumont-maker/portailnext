'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const STATUTS: Record<string, { label: string; color: string; bg: string }> = {
  'en_attente': { label: 'En attente', color: 'var(--color-light-text-3)',   bg: 'oklch(30% 0.01 50 / 0.4)' },
  'en_cours':   { label: 'En cours',   color: 'oklch(72% 0.14 72)',         bg: 'oklch(72% 0.14 72 / 0.12)' },
  'remis':      { label: 'Remis',      color: 'oklch(68% 0.12 240)',        bg: 'oklch(68% 0.12 240 / 0.12)' },
  'approuvé':   { label: 'Approuvé',   color: 'oklch(65% 0.15 145)',        bg: 'oklch(65% 0.15 145 / 0.12)' },
  'annulé':     { label: 'Annulé',     color: 'oklch(55% 0.10 25)',         bg: 'oklch(55% 0.10 25 / 0.12)' },
}

interface Livrable { id: number; filename: string; public_url: string; uploaded_at: string }
interface Mandat {
  id: number; titre: string; statut: string; description: string
  date_debut: string; date_echeance: string; montant_convenu: number
  notes_admin: string; nom_projet: string; livrables: Livrable[]
}

export default function PigisteMandatDetail() {
  const { id }    = useParams<{ id: string }>()
  const router    = useRouter()
  const [m, setM] = useState<Mandat | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragging,  setDragging]  = useState(false)
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok }); setTimeout(() => setToast(null), 3500)
  }

  const load = () => fetch(`/api/v1/pigiste/mandats/${id}`, { credentials: 'include' })
    .then(r => { if (!r.ok) { router.push('/pigiste/mandats'); return null } return r.json() })
    .then(data => { if (data) setM(data) })

  useEffect(() => { load() }, [id])

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files.length) return
    setUploading(true)
    const fd = new FormData()
    Array.from(files).forEach(f => fd.append('fichiers', f))
    try {
      const res  = await fetch(`/api/v1/pigiste/mandats/${id}/remettre`, { method: 'POST', credentials: 'include', body: fd })
      const data = await res.json()
      if (!res.ok || !data.ok) { showToast(data.error || 'Erreur upload', false); return }
      showToast(`${data.livrables.length} fichier(s) déposé(s).`)
      load()
    } catch { showToast('Erreur de connexion', false) }
    finally   { setUploading(false) }
  }

  if (!m) return (
    <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-light-text-3)', paddingTop: 'var(--space-8)' }}>Chargement…</p>
  )

  const s = STATUTS[m.statut] ?? STATUTS['en_attente']
  const peutRemettre = !['approuvé', 'annulé'].includes(m.statut)

  return (
    <>
      <style>{`
        @keyframes pg-fade-up { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @media (prefers-reduced-motion:reduce) { .pg-anim { animation:none !important } }
      `}</style>

      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 'var(--z-toast)' as never,
          padding: '12px 18px', borderRadius: 'var(--radius-md)',
          background: toast.ok ? 'oklch(65% 0.15 145)' : 'oklch(54% 0.20 25)',
          color: 'white', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
        }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      <div className="pg-anim" style={{ maxWidth: '680px', animation: 'pg-fade-up 350ms var(--ease-out-quart) both' }}>

        <Link href="/pigiste/mandats" style={{
          display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
          color: 'var(--color-light-text-3)', textDecoration: 'none',
          marginBottom: 'var(--space-8)',
          transition: `color var(--duration-fast)`,
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-light-text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-light-text-3)')}
        >
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
          Retour aux mandats
        </Link>

        {/* Titre + statut */}
        <div style={{ marginBottom: 'var(--space-10)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
              padding: '4px 10px', borderRadius: 'var(--radius-full)',
              background: s.bg, color: s.color,
            }}>{s.label}</span>
            {m.nom_projet && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>{m.nom_projet}</span>
            )}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.0,
            letterSpacing: '-0.02em', color: 'var(--color-light-text)', margin: 0,
          }}>{m.titre}</h1>
        </div>

        {/* Info row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 'var(--space-6)', padding: 'var(--space-6) 0',
          borderTop: '1px solid var(--color-light-border)',
          borderBottom: '1px solid var(--color-light-border)',
          marginBottom: 'var(--space-8)',
        }}>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-2)' }}>Montant convenu</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-light-text)', margin: 0, lineHeight: 1 }}>
              {m.montant_convenu.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
            </p>
          </div>
          {m.date_debut && <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-2)' }}>Début</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-light-text)', margin: 0 }}>{m.date_debut}</p>
          </div>}
          {m.date_echeance && <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-2)' }}>Échéance</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-light-text)', margin: 0 }}>{m.date_echeance}</p>
          </div>}
        </div>

        {/* Description */}
        {m.description && (
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-3)' }}>Description</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-light-text-2)', margin: 0, lineHeight: 'var(--leading-relaxed)', maxWidth: '65ch', whiteSpace: 'pre-wrap' }}>{m.description}</p>
          </div>
        )}

        {/* Note admin */}
        {m.notes_admin && (
          <div style={{
            marginBottom: 'var(--space-8)',
            padding: 'var(--space-4)',
            background: 'oklch(52% 0.21 32 / 0.08)',
            borderRadius: 'var(--radius-md)',
            outline: '1px solid oklch(52% 0.21 32 / 0.2)',
          }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brand)', margin: '0 0 var(--space-2)' }}>Note de Cocktail Média</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-2)', margin: 0, lineHeight: 'var(--leading-relaxed)' }}>{m.notes_admin}</p>
          </div>
        )}

        {/* Livrables */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-4)' }}>
            Livrables remis · {m.livrables.length}
          </p>

          {m.livrables.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              {m.livrables.map(l => (
                <div key={l.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--color-light-border)', borderRadius: 'var(--radius-sm)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-light-text-3)' }}>description</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', fontWeight: 500 }}>{l.filename}</span>
                  </div>
                  {l.public_url && (
                    <a href={l.public_url} target="_blank" rel="noopener noreferrer" style={{
                      fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
                      color: 'var(--color-brand)', textDecoration: 'none',
                    }}>Voir →</a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload zone */}
          {peutRemettre && (
            <>
              <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={e => handleUpload(e.target.files)} />
              <div
                onClick={() => !uploading && fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files) }}
                style={{
                  padding: 'var(--space-8)',
                  borderRadius: 'var(--radius-md)',
                  background: dragging ? 'oklch(52% 0.21 32 / 0.1)' : 'transparent',
                  outline: `2px dashed ${dragging ? 'var(--color-brand)' : 'var(--color-light-border)'}`,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)',
                  transition: `background var(--duration-fast), outline-color var(--duration-fast)`,
                  textAlign: 'center',
                }}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '28px', color: dragging ? 'var(--color-brand)' : 'var(--color-light-text-3)' }}>
                  {uploading ? 'hourglass_empty' : 'upload'}
                </span>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: dragging ? 'var(--color-brand)' : 'var(--color-light-text-2)', margin: '0 0 4px', fontWeight: 500 }}>
                    {uploading ? 'Envoi en cours…' : 'Déposer des fichiers ici'}
                  </p>
                  {!uploading && <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-light-text-3)', margin: 0 }}>ou cliquer pour parcourir</p>}
                </div>
              </div>
            </>
          )}
        </div>

        {/* CTA facture */}
        {m.statut === 'approuvé' && (
          <Link href={`/pigiste/factures/new?mandat=${m.id}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)',
            background: 'var(--color-brand)', color: 'white', textDecoration: 'none',
            borderRadius: 'var(--radius-full)', padding: '12px 24px',
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700,
            letterSpacing: '0.04em', transition: `background var(--duration-fast)`,
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-brand-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-brand)')}
          >
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '18px' }}>receipt_long</span>
            Créer la facture
          </Link>
        )}

      </div>
    </>
  )
}
