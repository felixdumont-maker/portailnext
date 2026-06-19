'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const STATUT_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  en_attente: { bg: 'var(--color-light-border)',  text: 'var(--color-dark-text-2)', label: 'En attente' },
  en_cours:   { bg: 'var(--color-warning-bg)',    text: 'var(--color-warning-text)', label: 'En cours' },
  remis:      { bg: 'var(--color-info-bg)',        text: 'var(--color-info-text)', label: 'Remis' },
  approuvé:   { bg: 'var(--color-success-bg)',    text: 'var(--color-success-text)', label: 'Approuvé' },
  annulé:     { bg: 'var(--color-error-bg)',      text: 'var(--color-error-text)', label: 'Annulé' },
}

interface Livrable {
  id: number
  filename: string
  public_url: string
  drive_file_id: string | null
  uploaded_at: string
}

interface Mandat {
  id: number
  titre: string
  statut: string
  description: string | null
  notes_admin: string | null
  montant_convenu: number
  date_debut: string | null
  date_echeance: string | null
  id_pigiste: number
  nom_pigiste: string
  id_projet: number | null
  nom_projet: string | null
  livrables: Livrable[]
}

export default function AdminMandatDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [mandat, setMandat]               = useState<Mandat | null>(null)
  const [approving, setApproving]         = useState(false)
  const [correcting, setCorrecting]       = useState(false)
  const [noteCorrection, setNoteCorrection] = useState('')
  const [showCorrection, setShowCorrection] = useState(false)
  const [toast, setToast]                 = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500) }

  const load = () =>
    fetch(`/api/v1/admin/mandats-pigistes/${id}`, { credentials: 'include' })
      .then(r => { if (!r.ok) { router.push('/admin/mandats-pigistes'); return null } return r.json() })
      .then(data => { if (data) setMandat(data) })

  useEffect(() => { load() }, [id])

  const handleApprouver = async () => {
    setApproving(true)
    try {
      const res = await fetch(`/api/v1/admin/mandats-pigistes/${id}/approuver`, {
        method: 'POST', credentials: 'include',
      })
      if (res.ok) { showToast('Mandat approuvé.'); load() }
      else showToast('Erreur lors de l\'approbation', false)
    } catch { showToast('Erreur de connexion', false) }
    finally { setApproving(false) }
  }

  const handleCorrections = async () => {
    if (!noteCorrection.trim()) { showToast('Veuillez décrire les corrections demandées.', false); return }
    setCorrecting(true)
    try {
      const res = await fetch(`/api/v1/admin/mandats-pigistes/${id}/corrections`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: noteCorrection }),
      })
      if (res.ok) { showToast('Corrections envoyées au pigiste.'); setShowCorrection(false); setNoteCorrection(''); load() }
      else showToast('Erreur lors de l\'envoi', false)
    } catch { showToast('Erreur de connexion', false) }
    finally { setCorrecting(false) }
  }

  if (!mandat) return <p className="text-[var(--color-dark-text-2)] font-body p-8">Chargement...</p>

  const style = STATUT_STYLE[mandat.statut] ?? { bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)', label: mandat.statut }

  const fmt = (d: string | null) => d
    ? new Date(d).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="max-w-5xl mx-auto">
      {toast && (
        <div role="status" aria-live="polite" aria-atomic="true"
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-3 ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            {toast.ok ? 'check_circle' : 'error'}
          </span>
          {toast.msg}
        </div>
      )}

      <Link href="/admin/mandats-pigistes"
        className="flex items-center gap-2 text-[var(--color-dark-text-2)] mb-6 hover:text-[var(--color-dark-1)] transition-colors font-body text-sm">
        <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_back</span>
        Retour aux mandats
      </Link>

      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <span className="text-[var(--color-brand)] font-bold tracking-widest text-xs uppercase mb-2 block font-body">
              MANDAT PIGISTE
            </span>
            <h1 className="font-display text-[var(--text-2xl)] text-[var(--color-dark-1)] leading-tight">
              {mandat.titre}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <Link href={`/admin/pigistes/${mandat.id_pigiste}`}
                className="flex items-center gap-1.5 font-body text-sm text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)] transition-colors">
                <span aria-hidden="true" className="material-symbols-outlined text-sm">person</span>
                {mandat.nom_pigiste}
              </Link>
              {mandat.nom_projet && (
                <span className="flex items-center gap-1.5 font-body text-sm text-[var(--color-dark-text-2)]">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">folder</span>
                  {mandat.nom_projet}
                </span>
              )}
            </div>
          </div>
          <span className="px-4 py-2 rounded-full text-xs font-bold font-body uppercase flex-shrink-0"
            style={{ background: style.bg, color: style.text }}>
            {style.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Montant + dates */}
        <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="font-display text-[var(--text-lg)] text-[var(--color-dark-1)]">MONTANT</h2>
          <p className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] leading-none">
            {mandat.montant_convenu.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
          </p>
          <div className="border-t border-[var(--color-light-0)] pt-4 space-y-2">
            <div className="flex justify-between font-body text-sm">
              <span className="text-[var(--color-dark-text-2)]">Début</span>
              <span className="font-semibold text-[var(--color-dark-1)]">{fmt(mandat.date_debut)}</span>
            </div>
            <div className="flex justify-between font-body text-sm">
              <span className="text-[var(--color-dark-text-2)]">Échéance</span>
              <span className="font-semibold text-[var(--color-dark-1)]">{fmt(mandat.date_echeance)}</span>
            </div>
          </div>
        </div>

        {/* Description + notes admin */}
        <div className="bg-white rounded-3xl p-6 shadow-sm lg:col-span-2">
          <h2 className="font-display text-[var(--text-lg)] text-[var(--color-dark-1)] mb-3">DESCRIPTION</h2>
          {mandat.description ? (
            <p className="font-body text-sm text-[var(--color-dark-text-2)] whitespace-pre-wrap leading-relaxed">
              {mandat.description}
            </p>
          ) : (
            <p className="font-body text-sm text-[var(--color-dark-text-2)] opacity-40 italic">Aucune description.</p>
          )}
          {mandat.notes_admin && (
            <div className="mt-4 pt-4 border-t border-[var(--color-light-0)]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand)] font-body mb-2">Notes admin</p>
              <p className="font-body text-sm text-[var(--color-dark-text-2)] whitespace-pre-wrap leading-relaxed">
                {mandat.notes_admin}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Livrables */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mb-4">
        <h2 className="font-display text-[var(--text-xl)] text-[var(--color-dark-1)] mb-5">LIVRABLES</h2>
        {mandat.livrables.length === 0 ? (
          <div className="flex items-center gap-3 py-4 text-[var(--color-dark-text-2)]">
            <span aria-hidden="true" className="material-symbols-outlined opacity-30">inbox</span>
            <p className="font-body text-sm">Aucun livrable soumis par le pigiste.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {mandat.livrables.map(l => {
              const viewUrl = l.drive_file_id
                ? `https://drive.google.com/file/d/${l.drive_file_id}/view`
                : l.public_url
              const ext = l.filename.split('.').pop()?.toLowerCase() ?? ''
              const isImage = ['jpg','jpeg','png','gif','webp','svg'].includes(ext)
              return (
                <div key={l.id} className="flex items-center gap-4 p-4 bg-[var(--color-light-1)] rounded-2xl">
                  <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)] flex-shrink-0">
                    {isImage ? 'image' : ext === 'pdf' ? 'picture_as_pdf' : ext === 'mp4' || ext === 'mov' ? 'videocam' : 'attach_file'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-bold text-sm text-[var(--color-dark-1)] truncate">{l.filename}</p>
                    <p className="font-body text-xs text-[var(--color-dark-text-2)]">
                      {l.uploaded_at
                        ? new Date(l.uploaded_at.replace(' ', 'T')).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </p>
                  </div>
                  <a href={viewUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[var(--color-brand)] font-body text-xs font-bold uppercase hover:underline flex-shrink-0">
                    <span aria-hidden="true" className="material-symbols-outlined text-sm">open_in_new</span>
                    Ouvrir
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Actions selon statut */}
      {(mandat.statut === 'remis' || mandat.statut === 'en_cours') && (
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-4">
          <h2 className="font-display text-[var(--text-xl)] text-[var(--color-dark-1)] mb-5">ACTIONS</h2>
          <div className="flex flex-col gap-4">

            {/* Approuver — uniquement si remis */}
            {mandat.statut === 'remis' && (
              <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-success-bg)] rounded-2xl">
                <div>
                  <p className="font-body font-bold text-sm text-[var(--color-success-text)]">Le pigiste a remis son travail</p>
                  <p className="font-body text-xs text-[var(--color-success-text)] opacity-70">Approuvez pour valider et déclencher la facturation.</p>
                </div>
                <button
                  onClick={handleApprouver}
                  disabled={approving}
                  className="flex-shrink-0 bg-[var(--color-success-text)] text-white font-body font-bold px-6 py-3 rounded-full text-sm uppercase tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {approving ? 'Approbation…' : 'Approuver'}
                </button>
              </div>
            )}

            {/* Demander corrections */}
            <div className="p-4 bg-[var(--color-light-1)] rounded-2xl">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <p className="font-body font-bold text-sm text-[var(--color-dark-1)]">Demander des corrections</p>
                  <p className="font-body text-xs text-[var(--color-dark-text-2)]">Le pigiste recevra vos notes et le mandat repassera en cours.</p>
                </div>
                <button
                  onClick={() => setShowCorrection(v => !v)}
                  className="flex-shrink-0 bg-[var(--color-light-0)] border border-[var(--color-light-border-2)] text-[var(--color-dark-1)] font-body font-bold px-5 py-2.5 rounded-full text-xs uppercase tracking-wide hover:bg-[var(--color-light-border)] transition-colors"
                >
                  {showCorrection ? 'Annuler' : 'Rédiger'}
                </button>
              </div>
              {showCorrection && (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={noteCorrection}
                    onChange={e => setNoteCorrection(e.target.value)}
                    placeholder="Décrivez les corrections souhaitées..."
                    aria-label="Notes de correction"
                    rows={4}
                    className="w-full bg-white border border-[var(--color-light-border-2)] rounded-xl px-4 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40 resize-none"
                  />
                  <button
                    onClick={handleCorrections}
                    disabled={correcting || !noteCorrection.trim()}
                    className="self-end bg-[var(--color-brand)] text-white font-body font-bold px-6 py-3 rounded-full text-sm uppercase tracking-wide hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-50"
                  >
                    {correcting ? 'Envoi…' : 'Envoyer les corrections'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer liens rapides */}
      <div className="flex flex-wrap gap-3 pt-2">
        <Link href={`/admin/pigistes/${mandat.id_pigiste}`}
          className="inline-flex items-center gap-2 bg-[var(--color-light-1)] text-[var(--color-dark-1)] px-5 py-3 rounded-full font-body font-bold text-xs uppercase tracking-wide hover:bg-[var(--color-light-0)] transition-colors border border-[var(--color-light-border)]">
          <span aria-hidden="true" className="material-symbols-outlined text-sm">person</span>
          Fiche pigiste
        </Link>
        {mandat.id_projet && (
          <Link href={`/admin/projet/${mandat.id_projet}`}
            className="inline-flex items-center gap-2 bg-[var(--color-light-1)] text-[var(--color-dark-1)] px-5 py-3 rounded-full font-body font-bold text-xs uppercase tracking-wide hover:bg-[var(--color-light-0)] transition-colors border border-[var(--color-light-border)]">
            <span aria-hidden="true" className="material-symbols-outlined text-sm">folder</span>
            Voir le projet
          </Link>
        )}
      </div>
    </div>
  )
}
