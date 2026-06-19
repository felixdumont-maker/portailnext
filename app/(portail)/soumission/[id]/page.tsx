'use client'

import { useState, useEffect, use, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface SoumissionOption {
  id: number; nom: string; description: string
  prix_setup: number; prix_mensuel: number; prix_horaire: number
  delai_livraison: string; conditions_paiement: string
  inclus_json: string[]
  couts_tiers_json: { service: string; cout: string; note?: string }[]
  couts_supplementaires_json: { situation: string; cout: string }[]
  scenarios_json: { titre: string; lignes: string[] }[]
  est_recommande: number; badge_texte: string
  features_json: Record<string, boolean>
  ordre: number
}
interface Soumission {
  id: number; titre: string; message_intro: string
  statut: 'envoyee' | 'acceptee' | 'refusee' | 'expiree'
  date_expiration: string; option_acceptee_id: number | null
  nom_client?: string
  pdf_path?: string
  options: SoumissionOption[]
}

function fillPlaceholders(text: string, nomComplet?: string): string {
  if (!text) return text
  const prenom = nomComplet ? nomComplet.split(' ')[0] : ''
  return text
    .replace(/\{prenom\}/gi, prenom)
    .replace(/\{nom\}/gi, nomComplet ?? '')
    .replace(/\{nom_complet\}/gi, nomComplet ?? '')
}

function fmt(n: number) {
  return n.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function daysLeft(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

const FEATURES: { key: string; label: string; inclus: string[]; tip: string }[] = [
  { key: 'site_web', label: 'Site web professionnel', inclus: ['Site web', 'site vitrine'],
    tip: 'Un site web conçu et déployé sur mesure. Performant, rapide et optimisé pour le référencement Google.' },
  { key: 'formations', label: 'Plateforme de formations', inclus: ['formations'],
    tip: 'Espace dédié permettant à votre clientèle d\'accéder à vos formations en ligne, vidéos, documents et modules de contenu.' },
  { key: 'portail_brande', label: 'Portail à votre image', inclus: ['Portail à votre image'],
    tip: 'Votre clientèle accède sur votre propre domaine avec votre logo et vos couleurs. Aucune mention de Cocktail Média.' },
  { key: 'quiz', label: 'Quiz et certifications automatisés', inclus: ['Quiz', 'certification'],
    tip: 'Vos clients répondent à des quiz après chaque formation. Le certificat PDF est généré automatiquement si le score est atteint.' },
  { key: 'crm_complet', label: 'CRM clients complet', inclus: ['CRM complet'],
    tip: 'Gérez vos clients, leur historique, leurs formations assignées et leur facturation depuis un espace centralisé et complet.' },
  { key: 'facturation', label: 'Facturation et paiements Stripe', inclus: ['Facturation', 'Stripe'],
    tip: 'Créez et envoyez des factures depuis la plateforme. Vos clients paient en ligne par carte de crédit via Stripe.' },
  { key: 'vps', label: 'Hébergement VPS dédié', inclus: ['VPS'],
    tip: 'Votre plateforme est hébergée sur un serveur privé virtuel dédié. Performances garanties et sauvegardes automatiques.' },
  { key: 'sauvegardes', label: 'Sauvegardes quotidiennes', inclus: ['Sauvegarde'],
    tip: 'Vos données sont sauvegardées automatiquement chaque jour. Restauration rapide en cas de problème.' },
  { key: 'app_surmesure', label: 'Application web sur mesure', inclus: ['sur mesure propriétaire'],
    tip: 'Une application web propriétaire développée spécifiquement pour vous, à votre image, sans contrainte de plateforme tierce.' },
  { key: 'chatbot_ia', label: 'Assistant IA 24h/7j', inclus: ['Assistant IA', 'IA disponible'],
    tip: 'Un assistant intelligent répond aux questions de vos visiteurs à toute heure, même quand vous dormez.' },
  { key: 'recommandations_ia', label: 'Recommandations IA personnalisées', inclus: ['Recommandations'],
    tip: 'La plateforme recommande automatiquement les formations les plus pertinentes à chaque client selon son profil et sa progression.' },
  { key: 'code_source', label: 'Code source propriétaire', inclus: ['propriétaire'],
    tip: 'L\'ensemble du code source de votre application vous appartient entièrement. Vous pouvez l\'héberger où vous voulez et le faire évoluer avec n\'importe quel développeur.' },
]

function getMonthlyTiersCost(opt: SoumissionOption): string | null {
  const entry = opt.couts_tiers_json.find(c => c.cout.includes('/mois'))
  return entry ? entry.cout : null
}

function getFeature(opt: SoumissionOption, key: string, inclus: string[]): boolean {
  if (opt.features_json && key in opt.features_json) return !!opt.features_json[key]
  return inclus.some(kw => opt.inclus_json.some(l => l.toLowerCase().includes(kw.toLowerCase())))
}

export default function ClientSoumissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [data, setData]               = useState<Soumission | null>(null)
  const [loading, setLoading]         = useState(true)
  const [selected, setSelected]       = useState<number | null>(null)
  const [agreed, setAgreed]           = useState(false)
  const [accepting, setAccepting]     = useState(false)
  const [accepted, setAccepted]       = useState(false)
  const [toast, setToast]             = useState<{ msg: string; ok: boolean } | null>(null)
  const [introExpanded, setIntroExpanded] = useState(false)
  const [openTip, setOpenTip]         = useState<string | null>(null)
  const [costsOpen, setCostsOpen]         = useState(false)
  const [selectedExtras, setSelectedExtras] = useState<Set<number>>(new Set())
  const detailsRef = useRef<HTMLElement>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    fetch(`/api/v1/soumission/${id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!openTip) return
    const close = () => setOpenTip(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [openTip])

  const handleAccepter = async () => {
    if (!selected || !agreed) return
    setAccepting(true)
    try {
      const res = await fetch(`/api/v1/soumission/${id}/accepter`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_option: selected,
          extras_selectionnes: selectedOpt
            ? Array.from(selectedExtras).map(i => selectedOpt.couts_supplementaires_json[i]).filter(Boolean)
            : [],
        }),
      })
      const json = await res.json()
      if (!res.ok) { showToast(json.error || 'Erreur', false); return }
      setAccepted(true)
      setData(prev => prev ? { ...prev, statut: 'acceptee', option_acceptee_id: selected } : prev)
      showToast('Proposition acceptée avec succès !')
    } catch { showToast('Erreur de connexion', false) }
    finally { setAccepting(false) }
  }

  const handleInfos = (optId: number) => {
    if (selected === optId) { setSelected(null); return }
    setSelected(optId); setAgreed(false); setCostsOpen(false); setSelectedExtras(new Set())
    setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <span className="material-symbols-outlined animate-spin" style={{ fontSize: '2.5rem', color: 'var(--color-brand)' }}>progress_activity</span>
    </div>
  )
  if (!data) return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 'var(--space-12) var(--space-6)', textAlign: 'center' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--color-light-border)', display: 'block', marginBottom: 'var(--space-4)' }}>description</span>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-light-text-3)' }}>Soumission introuvable.</p>
      <button onClick={() => router.push('/dashboard')} style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-brand)', fontWeight: 700, fontFamily: 'var(--font-body)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
        Retour au tableau de bord
      </button>
    </div>
  )

  const days          = data.date_expiration ? daysLeft(data.date_expiration) : null
  const sortedOptions = [...data.options].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
  const selectedOpt   = data.options.find(o => o.id === selected) ?? null
  const acceptedOpt   = data.option_acceptee_id ? data.options.find(o => o.id === data.option_acceptee_id) : null
  const isInteractable = data.statut === 'envoyee' && !accepted
  const INTRO_LIMIT   = 200
  const introLong     = !!(data.message_intro && data.message_intro.length > INTRO_LIMIT)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--space-6) var(--space-6) var(--space-20)' }}>

      {/* Toast */}
      {toast && (
        <div role="status" aria-live="polite" style={{
          position: 'fixed', top: 80, right: 'var(--space-6)', zIndex: 'var(--z-toast)' as never,
          background: toast.ok ? 'var(--color-success)' : 'var(--color-error)', color: 'white',
          padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--radius-full)',
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>
            {toast.ok ? 'check_circle' : 'error'}
          </span>
          {toast.msg}
        </div>
      )}

      {/* ── HERO ──────────────────────────────────────────── */}
      <header style={{ marginBottom: 'var(--space-12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
          <span style={{
            background: 'var(--color-brand)', color: 'white',
            padding: '5px 14px', borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
            fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            Proposition confidentielle
          </span>

          {data.pdf_path && (
            <a
              href={`/api/v1/soumission/${id}/pdf`}
              download
              style={{
                marginLeft: 'auto',
                display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
                padding: '6px 16px', borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-light-border-2)',
                background: 'white', color: 'var(--color-light-text-2)',
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
                textDecoration: 'none', cursor: 'pointer',
                transition: `background var(--duration-fast), border-color var(--duration-fast)`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--color-light-0)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-light-border)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'white'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-light-border-2)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>download</span>
              Télécharger PDF
            </a>
          )}

          {data.statut === 'envoyee' && days !== null && days > 0 && days <= 7 && (
            <span style={{
              background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)',
              padding: '5px 12px', borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
              border: '1px solid var(--color-warning-mid-ring)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>schedule</span>
              Expire dans {days} jour{days !== 1 ? 's' : ''}
            </span>
          )}
          {data.statut === 'envoyee' && days !== null && days <= 0 && (
            <span style={{ background: 'var(--color-error-bg)', color: 'var(--color-error-text)', padding: '5px 12px', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
              Expirée
            </span>
          )}
          {data.date_expiration && days !== null && days > 7 && (
            <span style={{ color: 'var(--color-light-text-3)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>event</span>
              Proposition valide jusqu&apos;au {new Date(data.date_expiration).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          lineHeight: 'var(--leading-tight)', letterSpacing: '-0.025em', textTransform: 'uppercase',
          color: 'var(--color-light-text)', margin: '0 0 var(--space-5)', fontWeight: 800,
          textAlign: 'center',
        }}>
          {data.titre}
        </h1>

        {data.message_intro && (
          <div style={{ maxWidth: '72ch', textAlign: 'center', margin: '0 auto' }}>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)',
              color: 'var(--color-light-text-2)', lineHeight: 'var(--leading-relaxed)', margin: 0,
              maxHeight: introLong && !introExpanded ? '6.8em' : undefined,
              overflow: introLong && !introExpanded ? 'hidden' : undefined,
            }}>
              {fillPlaceholders(data.message_intro, data.nom_client)}
            </p>
            {introLong && (
              <button onClick={() => setIntroExpanded(p => !p)} style={{
                marginTop: 'var(--space-2)', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 700,
                color: 'var(--color-brand)', padding: 0,
                display: 'flex', alignItems: 'center', gap: 'var(--space-1)', minHeight: '44px',
                margin: '0 auto',
              }}>
                {introExpanded ? 'Réduire' : 'Lire la suite'}
                <span className="material-symbols-outlined" style={{ fontSize: 16, transform: introExpanded ? 'rotate(180deg)' : 'none', transition: `transform var(--duration-base)` }}>expand_more</span>
              </button>
            )}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-8)' }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, var(--color-brand), var(--color-light-border) 60%, transparent)' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-light-text-3)', whiteSpace: 'nowrap' }}>
            {data.options.length > 1 ? 'Comparez les options' : 'Votre option'}
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-light-border)' }} />
        </div>
      </header>

      {/* Bandeau acceptee */}
      {(data.statut === 'acceptee' || accepted) && acceptedOpt && (
        <div style={{
          background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-5) var(--space-6)', marginBottom: 'var(--space-8)',
          display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--color-success)', fontVariationSettings: "'FILL' 1", flexShrink: 0 }}>check_circle</span>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-success-text)', margin: '0 0 var(--space-1)' }}>Proposition acceptée</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-success-text)', margin: '0 0 2px' }}>
              Vous avez choisi : <strong>{acceptedOpt.nom}</strong>
            </p>
            {acceptedOpt.prix_setup > 0 && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-success-text)', margin: 0 }}>
                Démarrage : <strong>{fmt(acceptedOpt.prix_setup)} $</strong>
                {acceptedOpt.prix_mensuel > 0 ? ` + ${fmt(acceptedOpt.prix_mensuel)} $/mois` : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bandeau expiree */}
      {data.statut === 'expiree' && (
        <div style={{
          background: 'var(--color-light-1)', border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4) var(--space-5)', marginBottom: 'var(--space-8)',
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: 'var(--color-light-text-3)' }}>schedule</span>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-3)', margin: 0 }}>
            Cette proposition a expiré. Contactez votre gestionnaire pour en obtenir une nouvelle.
          </p>
        </div>
      )}

      {/* ── SECTION 1 : Tableau comparatif ───────────────── */}
      {data.options.length > 0 && (
        <section style={{ marginBottom: 'var(--space-12)' }}>
          <div style={{ overflowX: 'auto', overflowY: 'visible', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-light-border)', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{
              width: '100%', borderCollapse: 'separate', borderSpacing: 0,
              minWidth: `${sortedOptions.length * 220 + 200}px`,
            }}>
              <thead>
                <tr>
                  <th scope="col" style={{
                    background: 'white', padding: 'var(--space-5)',
                    textAlign: 'left', verticalAlign: 'bottom',
                    borderBottom: '2px solid var(--color-light-border)', borderRight: '1px solid var(--color-light-border)',
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.12em',
                    color: 'var(--color-light-text-3)', minWidth: 200,
                  }}>
                    Fonctionnalités incluses
                  </th>
                  {sortedOptions.map((opt, oi) => {
                    const txS        = { total: fmt(opt.prix_setup) }
                    const isAccepted = data.option_acceptee_id === opt.id
                    const isSel      = selected === opt.id
                    const isRec      = opt.est_recommande === 1
                    const isLast     = oi === sortedOptions.length - 1
                    const highlighted = isAccepted || isSel || isRec

                    return (
                      <th key={opt.id} scope="col" style={{
                        background: isAccepted ? 'var(--color-success-bg)' : (isSel || isRec) ? 'var(--color-light-0)' : 'white',
                        borderBottom: `2px solid ${isAccepted ? 'var(--color-success)' : highlighted ? 'var(--color-brand)' : 'var(--color-light-border)'}`,
                        borderLeft: '1px solid var(--color-light-border)',
                        borderRight: isLast ? 'none' : '1px solid var(--color-light-border)',
                        padding: 'var(--space-6) var(--space-4) var(--space-5)',
                        textAlign: 'center', verticalAlign: 'top', minWidth: 220,
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <div style={{ minHeight: 20, display: 'flex', justifyContent: 'center' }}>
                            {isRec && (
                              <span style={{ background: 'var(--color-brand)', color: 'white', padding: '2px 10px', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.08em' }}>
                                Recommandé
                              </span>
                            )}
                          </div>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-light-text)', margin: 0, lineHeight: 'var(--leading-tight)' }}>
                            {opt.nom}
                          </p>
                          <div>
                            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-brand)', margin: 0, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                              {opt.prix_setup > 0 ? `${txS.total} $` : 'Sur devis'}
                            </p>
                            {opt.prix_setup > 0 && (
                              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: '2px 0 0' }}>avant taxes</p>
                            )}
                          </div>
                          {opt.prix_mensuel > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 13, color: 'var(--color-light-text-3)' }}>{opt.nom.toLowerCase().includes('web app') ? 'cloud' : 'subscriptions'}</span>
                              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 0, fontWeight: 400 }}>
                                {opt.nom.toLowerCase().includes('web app') ? '~' : ''}{fmt(opt.prix_mensuel)} $/mois ({opt.nom.toLowerCase().includes('web app') ? 'hébergement' : 'abonnement'})
                              </p>
                            </div>
                          ) : (() => {
                            const t = getMonthlyTiersCost(opt)
                            return t ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 13, color: 'var(--color-light-text-3)' }}>cloud</span>
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 0, fontWeight: 400 }}>
                                  {t} (hébergement)
                                </p>
                              </div>
                            ) : null
                          })()}
                          {opt.delai_livraison && (
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                              {opt.delai_livraison}
                            </p>
                          )}
                          <button
                            onClick={() => handleInfos(opt.id)}
                            onMouseEnter={e => { e.currentTarget.style.background = isSel ? 'var(--color-dark-2)' : 'var(--color-light-0)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = isSel ? 'var(--color-light-text)' : 'transparent' }}
                            style={{
                              marginTop: 'var(--space-1)', padding: 'var(--space-2) var(--space-5)', minHeight: '44px',
                              borderRadius: 'var(--radius-full)',
                              border: `2px solid ${isSel ? 'transparent' : 'var(--color-brand)'}`,
                              cursor: 'pointer',
                              background: isSel ? 'var(--color-light-text)' : 'transparent',
                              color: isSel ? 'white' : 'var(--color-brand)',
                              fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', fontWeight: 800,
                              letterSpacing: '0.12em', textTransform: 'uppercase',
                              transition: `background var(--duration-base), border-color var(--duration-base)`,
                              display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: isSel ? "'FILL' 1" : "'FILL' 0" }}>
                              {isSel ? 'expand_less' : 'info'}
                            </span>
                            {isSel ? 'Fermer' : 'En savoir plus'}
                          </button>
                          {isAccepted && (
                            <span style={{ padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-full)', background: 'var(--color-success-bg)', color: 'var(--color-success-text)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              Acceptée
                            </span>
                          )}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                <CompRow label="Investissement initial" bg="white">
                  {sortedOptions.map(opt => (
                    <CompCell key={opt.id} optId={opt.id} selected={selected} acceptedId={data.option_acceptee_id}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-light-text)', fontVariantNumeric: 'tabular-nums' }}>
                        {opt.prix_setup > 0 ? `${fmt(opt.prix_setup)} $` : 'Sur devis'}
                      </span>
                    </CompCell>
                  ))}
                </CompRow>
                <CompRow label="Hébergement mensuel" bg="white" icon="cloud">
                  {sortedOptions.map(opt => {
                    const isWebApp = opt.nom.toLowerCase().includes('web app')
                    const isCocktail = opt.nom.toLowerCase().includes('cocktailos')
                    const val = isCocktail ? null : (isWebApp ? `~${fmt(opt.prix_mensuel)} $/mois` : getMonthlyTiersCost(opt))
                    return (
                      <CompCell key={opt.id} optId={opt.id} selected={selected} acceptedId={data.option_acceptee_id}>
                        {val ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', fontWeight: 600 }}>{val}</span>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>selon le forfait choisi</span>
                          </div>
                        ) : (
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-3)' }}>—</span>
                        )}
                      </CompCell>
                    )
                  })}
                </CompRow>
                <CompRow label="Abonnement CocktailOS Premium+" bg="white" icon="subscriptions">
                  {sortedOptions.map(opt => {
                    const isCocktail = opt.nom.toLowerCase().includes('cocktailos')
                    const val = isCocktail && opt.prix_mensuel > 0 ? `${fmt(opt.prix_mensuel)} $/mois` : null
                    return (
                      <CompCell key={opt.id} optId={opt.id} selected={selected} acceptedId={data.option_acceptee_id}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: val ? 'var(--color-light-text)' : 'var(--color-light-text-3)', fontWeight: val ? 600 : 400 }}>
                          {val ?? '—'}
                        </span>
                      </CompCell>
                    )
                  })}
                </CompRow>
                <CompRow label="Frais de transaction" bg="white" icon="percent">
                  {sortedOptions.map(opt => {
                    const isWix = opt.nom.toLowerCase().includes('wix')
                    const stripe = opt.couts_tiers_json.find(c => c.service.toLowerCase().includes('stripe') || c.service.toLowerCase().includes('wix payments'))
                    return (
                      <CompCell key={opt.id} optId={opt.id} selected={selected} acceptedId={data.option_acceptee_id}>
                        {stripe ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text)', fontWeight: 600 }}>{stripe.cout}</span>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)' }}>{isWix ? 'Wix Payments' : 'Stripe'}</span>
                          </div>
                        ) : (
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-3)' }}>—</span>
                        )}
                      </CompCell>
                    )
                  })}
                </CompRow>
                <CompRow label="Maintenance comprise" bg="white" icon="build">
                  {sortedOptions.map(opt => {
                    const has = !!opt.features_json?.maintenance_comprise
                    return (
                      <CompCell key={opt.id} optId={opt.id} selected={selected} acceptedId={data.option_acceptee_id}>
                        {has
                          ? <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--color-success)', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          : <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--color-light-border-2)', fontVariationSettings: "'FILL' 0" }}>remove</span>
                        }
                      </CompCell>
                    )
                  })}
                </CompRow>
                <CompRow label="Maintenance en supplément" bg="var(--color-light-1)" icon="handyman">
                  {sortedOptions.map(opt => {
                    const has = !!opt.features_json?.maintenance_supplement
                    return (
                      <CompCell key={opt.id} optId={opt.id} selected={selected} acceptedId={data.option_acceptee_id}>
                        {has
                          ? <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--color-success)', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          : <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--color-light-border-2)', fontVariationSettings: "'FILL' 0" }}>remove</span>
                        }
                      </CompCell>
                    )
                  })}
                </CompRow>
                <CompRow label="Délai de réalisation" bg="white" icon="schedule">
                  {sortedOptions.map(opt => (
                    <CompCell key={opt.id} optId={opt.id} selected={selected} acceptedId={data.option_acceptee_id}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: opt.delai_livraison ? 'var(--color-light-text)' : 'var(--color-light-text-3)', fontWeight: 500 }}>
                        {opt.delai_livraison || 'Non précisé'}
                      </span>
                    </CompCell>
                  ))}
                </CompRow>
                <tr><td colSpan={sortedOptions.length + 1} style={{ height: 2, padding: 0, background: 'var(--color-light-border)' }} /></tr>
                {FEATURES.map((f, fi) => (
                  <CompRow key={f.key} label={f.label} bg={fi % 2 === 0 ? 'white' : 'var(--color-light-1)'}
                    tip={f.tip} tipKey={f.key} openTip={openTip} onTip={k => setOpenTip(prev => prev === k ? null : k)}>
                    {sortedOptions.map((opt) => {
                      const has = getFeature(opt, f.key, f.inclus)
                      return (
                        <CompCell key={opt.id} optId={opt.id} selected={selected} acceptedId={data.option_acceptee_id}>
                          {has
                            ? <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--color-success)', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            : <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--color-light-border-2)', fontVariationSettings: "'FILL' 0" }}>remove</span>
                          }
                        </CompCell>
                      )
                    })}
                  </CompRow>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── SECTION 2 : Détails option sélectionnée ──────── */}
      {selectedOpt && (
        <section ref={detailsRef} style={{
          borderTop: '2px solid var(--color-brand)',
          borderRight: '1px solid var(--color-light-border)',
          borderBottom: '1px solid var(--color-light-border)',
          borderLeft: '1px solid var(--color-light-border)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-light-2)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          marginBottom: 'var(--space-8)',
          animation: 'soumFadeIn var(--duration-slow) var(--ease-out-quart)',
        }}>

          {/* En-tete */}
          <div style={{
            background: 'var(--color-light-1)',
            padding: 'var(--space-5) var(--space-6)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-brand)' }}>
                Proposition sélectionnée
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-light-text)', margin: 0, lineHeight: 'var(--leading-tight)' }}>
                  {selectedOpt.nom}
                </h3>
                {selectedOpt.est_recommande === 1 && (
                  <span style={{ background: 'var(--color-brand)', color: 'white', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>Recommandé</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              aria-label="Fermer"
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-light-border)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              style={{
                background: 'transparent', border: '1px solid var(--color-light-border)', borderRadius: '50%',
                width: 44, height: 44, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-light-text-3)', flexShrink: 0,
                transition: `background var(--duration-fast)`,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          </div>

          {/* Description */}
          {selectedOpt.description && (
            <div style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--color-light-border)', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-light-text-2)', margin: '0 auto', lineHeight: 'var(--leading-relaxed)', maxWidth: '72ch' }}>
                {selectedOpt.description}
              </p>
            </div>
          )}

          {/* Stats strip */}
          <div style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'wrap', borderBottom: '1px solid var(--color-light-border)' }}>
            {selectedOpt.prix_setup > 0 && (
              <div style={{ flex: 1, minWidth: 130, padding: 'var(--space-4) var(--space-6)' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--color-light-text-3)', margin: '0 0 var(--space-1)' }}>Investissement initial</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-brand)', margin: '0 0 2px', lineHeight: 'var(--leading-tight)', fontVariantNumeric: 'tabular-nums' }}>{fmt(selectedOpt.prix_setup)} $</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 0 }}>avant taxes</p>
              </div>
            )}
            {selectedOpt.prix_mensuel > 0 ? (
              <>
                <div style={{ width: 1, background: 'var(--color-light-border)', flexShrink: 0, alignSelf: 'stretch' }} />
                <div style={{ flex: 1, minWidth: 130, padding: 'var(--space-4) var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--space-1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--color-light-text-3)' }}>{selectedOpt.nom.toLowerCase().includes('web app') ? 'cloud' : 'subscriptions'}</span>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--color-light-text-3)', margin: 0 }}>{selectedOpt.nom.toLowerCase().includes('web app') ? 'Hébergement VPS dédié' : 'Abonnement CocktailOS Premium+'}</p>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-light-text-3)', margin: 0, fontVariantNumeric: 'tabular-nums' }}>{selectedOpt.nom.toLowerCase().includes('web app') ? '~' : ''}{fmt(selectedOpt.prix_mensuel)} $</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 0 }}>par mois, avant taxes</p>
                </div>
              </>
            ) : (() => {
              const t = getMonthlyTiersCost(selectedOpt)
              return t ? (
                <>
                  <div style={{ width: 1, background: 'var(--color-light-border)', flexShrink: 0, alignSelf: 'stretch' }} />
                  <div style={{ flex: 1, minWidth: 130, padding: 'var(--space-4) var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--space-1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--color-light-text-3)' }}>cloud</span>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--color-light-text-3)', margin: 0 }}>Hébergement</p>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-light-text-3)', margin: 0, fontVariantNumeric: 'tabular-nums' }}>{t}</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 0 }}>payé directement au fournisseur</p>
                  </div>
                </>
              ) : null
            })()}
            {selectedOpt.delai_livraison && (
              <>
                <div style={{ width: 1, background: 'var(--color-light-border)', flexShrink: 0, alignSelf: 'stretch' }} />
                <div style={{ flex: 1, minWidth: 130, padding: 'var(--space-4) var(--space-6)' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--color-light-text-3)', margin: '0 0 var(--space-1)' }}>Délai de réalisation</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-light-text)', margin: 0, lineHeight: 'var(--leading-snug)' }}>{selectedOpt.delai_livraison}</p>
                </div>
              </>
            )}
          </div>

          {/* Prestations incluses */}
          {selectedOpt.inclus_json.length > 0 && (
            <div style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--color-light-border)' }}>
              <SectionHead icon="inventory_2" label="Prestations incluses" />
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-3) var(--space-6)' }}>
                {selectedOpt.inclus_json.map((l, li) => (
                  <li key={li} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--color-brand)', fontVariationSettings: "'FILL' 1", flexShrink: 0, marginTop: 1 }}>check</span>
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Modalites de paiement */}
          {selectedOpt.conditions_paiement && (
            <div style={{
              padding: 'var(--space-3) var(--space-6)',
              borderBottom: '1px solid var(--color-light-border)',
              background: 'var(--color-light-1)',
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-light-text-3)', flexShrink: 0 }}>receipt_long</span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-2)', margin: 0, lineHeight: 'var(--leading-relaxed)' }}>
                <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: 'var(--text-xs)', letterSpacing: '0.1em', color: 'var(--color-light-text-3)', display: 'block', marginBottom: 2 }}>Modalités de paiement</span>
                {selectedOpt.conditions_paiement}
              </p>
            </div>
          )}

          {/* Frais tiers */}
          {selectedOpt.couts_tiers_json.length > 0 && (
            <div style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--color-light-border)' }}>
              <SectionHead icon="cloud" label="Frais de services tiers mensuels" />
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-light-1)' }}>
                      {['Service', 'Coût', 'Note'].map(h => (
                        <th key={h} scope="col" style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', fontWeight: 700, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text-3)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOpt.couts_tiers_json.map((c, ci) => (
                      <tr key={ci} style={{ background: ci % 2 === 0 ? 'var(--color-light-2)' : 'var(--color-light-1)', borderTop: '1px solid var(--color-light-border)' }}>
                        <td style={{ padding: 'var(--space-3)', color: 'var(--color-light-text)', fontWeight: 500 }}>{c.service}</td>
                        <td style={{ padding: 'var(--space-3)', fontWeight: 700, color: 'var(--color-light-text)', fontVariantNumeric: 'tabular-nums' }}>{c.cout}</td>
                        <td style={{ padding: 'var(--space-3)', color: 'var(--color-light-text-3)' }}>{c.note || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Extras possibles */}
          {selectedOpt.couts_supplementaires_json.length > 0 && (
            <div style={{ borderBottom: isInteractable ? '1px solid var(--color-light-border)' : 'none' }}>
              <button
                onClick={() => setCostsOpen(p => !p)}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-light-1)' }}
                onMouseLeave={e => { e.currentTarget.style.background = costsOpen ? 'var(--color-light-1)' : 'var(--color-light-2)' }}
                style={{
                  width: '100%', padding: 'var(--space-4) var(--space-6)', minHeight: '44px',
                  background: costsOpen ? 'var(--color-light-1)' : 'var(--color-light-2)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)',
                  transition: `background var(--duration-fast)`,
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-warning)' }}>add_circle</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-light-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Extras possibles</span>
                  {selectedExtras.size > 0 && (
                    <span style={{ background: 'var(--color-brand)', color: 'white', borderRadius: 'var(--radius-full)', padding: '1px 8px', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                      {selectedExtras.size} sélectionné{selectedExtras.size > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-light-text-3)', transform: costsOpen ? 'rotate(180deg)' : 'none', transition: `transform var(--duration-base)` }}>expand_more</span>
              </button>
              {costsOpen && (
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 0, padding: 'var(--space-3) var(--space-6)', background: 'var(--color-light-1)', borderTop: '1px solid var(--color-light-border)' }}>
                    Cochez les extras qui vous intéressent pour en informer votre gestionnaire.
                  </p>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
                      <thead>
                        <tr style={{ background: 'var(--color-light-1)', borderTop: '1px solid var(--color-light-border)' }}>
                          <th scope="col" style={{ width: 44, padding: 'var(--space-2) var(--space-4)' }} />
                          {['Situation', 'Coût'].map(h => (
                            <th key={h} scope="col" style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-4)', fontWeight: 700, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-light-text-3)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOpt.couts_supplementaires_json.map((c, ci) => {
                          const checked = selectedExtras.has(ci)
                          return (
                            <tr
                              key={ci}
                              onClick={() => setSelectedExtras(prev => {
                                const next = new Set(prev)
                                next.has(ci) ? next.delete(ci) : next.add(ci)
                                return next
                              })}
                              style={{
                                background: checked ? 'var(--color-brand-8pct)' : ci % 2 === 0 ? 'var(--color-light-2)' : 'var(--color-light-1)',
                                borderTop: '1px solid var(--color-light-border)',
                                cursor: 'pointer',
                                transition: `background var(--duration-fast)`,
                              }}
                            >
                              <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center', verticalAlign: 'middle' }}>
                                <input
                                  type="checkbox"
                                  readOnly
                                  checked={checked}
                                  style={{ width: 16, height: 16, accentColor: 'var(--color-brand)', cursor: 'pointer' }}
                                />
                              </td>
                              <td style={{ padding: 'var(--space-3) var(--space-4)', color: checked ? 'var(--color-light-text)' : 'var(--color-light-text)', fontWeight: checked ? 600 : 400 }}>{c.situation}</td>
                              <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 700, color: 'var(--color-light-text)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{c.cout}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  {selectedExtras.size > 0 && (
                    <div style={{
                      padding: 'var(--space-3) var(--space-6)',
                      background: 'var(--color-brand-8pct)',
                      borderTop: '1px solid var(--color-light-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap',
                    }}>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-2)', margin: 0 }}>
                        <strong>{selectedExtras.size}</strong> extra{selectedExtras.size > 1 ? 's' : ''} sélectionné{selectedExtras.size > 1 ? 's' : ''} — votre gestionnaire en tiendra compte lors de la finalisation.
                      </p>
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedExtras(new Set()) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', textDecoration: 'underline', padding: 0 }}
                      >
                        Tout désélectionner
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Zone acceptation */}
          {isInteractable && (
            <div style={{ padding: 'var(--space-6)', background: 'var(--color-light-1)' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', cursor: 'pointer', marginBottom: 'var(--space-5)' }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  style={{ width: 18, height: 18, marginTop: 2, accentColor: 'var(--color-brand)', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text-2)', lineHeight: 'var(--leading-relaxed)' }}>
                  J&apos;ai pris connaissance et j&apos;accepte les{' '}
                  <a href="/conditions" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-brand)', textDecoration: 'underline' }}>
                    modalites de cette proposition
                  </a>.
                </span>
              </label>
              <button
                onClick={handleAccepter}
                disabled={!agreed || accepting}
                onMouseEnter={e => { if (agreed) e.currentTarget.style.background = 'var(--color-brand-hover)' }}
                onMouseLeave={e => { if (agreed) e.currentTarget.style.background = 'var(--color-brand)' }}
                style={{
                  width: '100%', padding: 'var(--space-4) var(--space-8)',
                  borderRadius: 'var(--radius-full)', border: 'none', minHeight: '56px',
                  cursor: agreed ? 'pointer' : 'not-allowed',
                  background: agreed ? 'var(--color-brand)' : 'var(--color-light-border)',
                  color: agreed ? 'white' : 'var(--color-light-text-3)',
                  fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 800,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  transition: `background var(--duration-base), color var(--duration-base)`,
                  boxShadow: agreed ? 'var(--shadow-md)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)',
                }}>
                {accepting ? (
                  <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 20 }}>progress_activity</span>Traitement en cours...</>
                ) : (
                  <><span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>task_alt</span>Accepter cette proposition</>
                )}
              </button>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: 'var(--space-3) 0 0', textAlign: 'center' }}>
                Cette acceptation constitue un engagement contractuel avec Cocktail Média.
              </p>
            </div>
          )}
        </section>
      )}

      <footer style={{
        marginTop: 'var(--space-10)',
        padding: 'var(--space-6) var(--space-4)',
        borderTop: '1px solid var(--color-light-border)',
        display: 'flex',
        gap: 'var(--space-5)',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        <a
          href="/conditions"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-light-text-3)',
            textDecoration: 'none',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-brand)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-light-text-3)')}
        >
          Conditions des propositions
        </a>
        <a
          href="/conditions#confidentialite"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-light-text-3)',
            textDecoration: 'none',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-brand)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-light-text-3)')}
        >
          Politique de confidentialite
        </a>
      </footer>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function SectionHead({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
      <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-brand)' }}>{icon}</span>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-light-text-3)', margin: 0 }}>
        {label}
      </p>
    </div>
  )
}

function CompRow({ label, bg, icon, tip, tipKey, openTip, onTip, children }: {
  label: string; bg: string; icon?: string
  tip?: string; tipKey?: string; openTip?: string | null; onTip?: (k: string) => void
  children: React.ReactNode
}) {
  const showTip = !!(tip && tipKey && openTip === tipKey)
  return (
    <tr style={{ background: bg }}>
      <td style={{
        padding: 'var(--space-3) var(--space-4)',
        borderRight: '1px solid var(--color-light-border)', borderBottom: '1px solid var(--color-light-border)',
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-light-text)',
        position: 'sticky', left: 0, background: bg,
        zIndex: showTip ? 'var(--z-dropdown)' as never : 1,
        whiteSpace: 'nowrap', overflow: 'visible',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', position: 'relative', overflow: 'visible' }}>
          {icon && <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--color-light-text-3)' }}>{icon}</span>}
          <span>{label}</span>
          {tip && tipKey && onTip && (
            <>
              <button
                onClick={e => { e.stopPropagation(); onTip(tipKey) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1, display: 'flex', lineHeight: 1, minHeight: '44px', alignItems: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--color-brand)' }}>info</span>
              </button>
              {showTip && (
                <div onClick={e => e.stopPropagation()} role="tooltip" style={{
                  position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 'var(--z-dropdown)' as never,
                  background: 'var(--color-light-text)', color: 'white',
                  padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', lineHeight: 'var(--leading-relaxed)',
                  maxWidth: 260, fontWeight: 400,
                  boxShadow: 'var(--shadow-lg)',
                  whiteSpace: 'normal',
                }}>
                  {tip}
                </div>
              )}
            </>
          )}
        </div>
      </td>
      {children}
    </tr>
  )
}

function CompCell({ optId, selected, acceptedId, children }: {
  optId: number; selected: number | null; acceptedId: number | null; children: React.ReactNode
}) {
  const isSel = selected === optId
  const isAcc = acceptedId === optId
  return (
    <td style={{
      padding: 'var(--space-3) var(--space-4)', textAlign: 'center',
      borderLeft: '1px solid var(--color-light-border)', borderBottom: '1px solid var(--color-light-border)',
      background: isAcc ? 'var(--color-success-mid-bg)' : isSel ? 'var(--color-brand-6pct)' : 'transparent',
      transition: `background var(--duration-fast)`,
    }}>
      {children}
    </td>
  )
}
