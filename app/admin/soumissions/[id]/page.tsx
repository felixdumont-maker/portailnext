'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

interface SoumissionOption {
  id: number; nom: string; description: string
  prix_setup: number; prix_mensuel: number; prix_horaire: number
  delai_livraison: string; conditions_paiement: string
  inclus_json: string[]; couts_tiers_json: { service: string; cout: string; note?: string }[]
  couts_supplementaires_json: { situation: string; cout: string }[]
  scenarios_json: { titre: string; lignes: string[] }[]
  est_recommande: number; badge_texte: string; ordre: number
}
interface Soumission {
  id: number; titre: string; message_intro: string
  statut: 'envoyee' | 'acceptee' | 'refusee' | 'expiree'
  date_expiration: string; created_at: string
  option_acceptee_id: number | null
  nom_client: string; email_client: string; telephone_client: string
  options: SoumissionOption[]
}

const STATUT_CONFIG = {
  envoyee:  { label: 'En attente de réponse',  bg: 'var(--color-info-bg-2)',     text: 'var(--color-info-text)'        },
  acceptee: { label: 'Acceptée',               bg: 'var(--color-success-bg-2)',  text: 'var(--color-success-text-2)'   },
  refusee:  { label: 'Déclinée',               bg: '#fee2e2',                    text: '#b91c1c'                        },
  expiree:  { label: 'Expirée',                bg: 'var(--color-light-0)',       text: 'var(--color-light-text-3)'     },
}

const TPS = 0.05, TVQ = 0.09975
function tc(n: number) {
  const t = n * TPS, q = n * TVQ
  return { tps: t.toFixed(2), tvq: q.toFixed(2), total: (n + t + q).toFixed(2) }
}

export default function AdminSoumissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const [data, setData]       = useState<Soumission | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting]   = useState(false)
  const [renvoi, setRenvoi]       = useState(false)
  const [renvoyee, setRenvoyee]   = useState(false)
  const [expanded, setExpanded]   = useState<number[]>([])

  useEffect(() => {
    fetch(`/api/v1/admin/soumission/${id}`, { credentials: 'include' })
      .then(r => r.json()).then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Retirer cette proposition définitivement ?')) return
    setDeleting(true)
    await fetch(`/api/v1/admin/soumission/${id}`, { method: 'DELETE', credentials: 'include' })
    router.push('/admin/soumissions')
  }

  if (loading) return <p className="text-center py-20 font-body text-[var(--color-dark-text-2)]">Chargement...</p>
  if (!data)   return <p className="text-center py-20 font-body text-[var(--color-dark-text-2)]">Soumission introuvable.</p>

  const cfg = STATUT_CONFIG[data.statut] ?? STATUT_CONFIG.expiree
  const optionAcceptee = data.option_acceptee_id
    ? data.options.find(o => o.id === data.option_acceptee_id)
    : null

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start gap-4 mb-10">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-[var(--color-light-0)] transition-colors mt-1">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-dark-text-2)]">arrow_back</span>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-body uppercase tracking-wide"
              style={{ background: cfg.bg, color: cfg.text }}
            >
              {cfg.label}
            </span>
            {data.date_expiration && (
              <span className="text-xs text-[var(--color-dark-text-2)] font-body">
                Expire le {new Date(data.date_expiration).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
          <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] uppercase tracking-tight leading-none mb-1">
            {data.titre}
          </h1>
          <p className="text-[var(--color-dark-text-2)] font-body text-sm">
            Créée le {new Date(data.created_at).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              setRenvoi(true); setRenvoyee(false)
              await fetch(`/api/v1/admin/soumission/${id}/renvoyer`, { method: 'POST', credentials: 'include' })
              setRenvoi(false); setRenvoyee(true)
              setTimeout(() => setRenvoyee(false), 4000)
            }}
            disabled={renvoi}
            className="inline-flex items-center gap-2 border border-[var(--color-light-border-2)] text-[var(--color-dark-text-2)] px-4 py-2 rounded-full text-xs font-bold uppercase font-body hover:bg-[var(--color-light-0)] transition-colors disabled:opacity-40"
          >
            {renvoi ? (
              <span aria-hidden="true" className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            ) : renvoyee ? (
              <span aria-hidden="true" className="material-symbols-outlined text-sm text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            ) : (
              <span aria-hidden="true" className="material-symbols-outlined text-sm">send</span>
            )}
            {renvoyee ? 'Transmis !' : 'Renvoyer'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-full text-xs font-bold uppercase font-body hover:bg-red-50 transition-colors disabled:opacity-40"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-sm">delete</span>
            Retirer
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">

        {/* Infos client */}
        <div className="bg-white rounded-3xl shadow-sm p-8">
          <h2 className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-5 flex items-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-sm text-[var(--color-brand)]">person</span>
            Client
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-brand)] flex items-center justify-center text-white font-display text-xl">
              {data.nom_client.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <p className="font-body font-bold text-[var(--color-dark-1)]">{data.nom_client}</p>
              <p className="font-body text-sm text-[var(--color-dark-text-2)]">{data.email_client}</p>
              {data.telephone_client && <p className="font-body text-sm text-[var(--color-dark-text-2)]">{data.telephone_client}</p>}
            </div>
          </div>
          {data.message_intro && (
            <div className="mt-5 pt-5 border-t border-[var(--color-light-0)]">
              <p className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-2">Message d&apos;introduction</p>
              <p className="font-body text-sm text-[var(--color-dark-1)] whitespace-pre-line">{data.message_intro}</p>
            </div>
          )}
        </div>

        {/* Option acceptee (si applicable) */}
        {data.statut === 'acceptee' && optionAcceptee && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <span aria-hidden="true" className="material-symbols-outlined text-emerald-600 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <h2 className="font-display text-lg uppercase tracking-wide text-emerald-800">Proposition retenue</h2>
            </div>
            <p className="font-body font-bold text-[var(--color-dark-1)] text-lg mb-2">{optionAcceptee.nom}</p>
            <div className="flex gap-6 flex-wrap">
              {optionAcceptee.prix_setup > 0 && (
                <div>
                  <p className="font-body text-xs text-[var(--color-dark-text-2)] uppercase tracking-widest">Setup</p>
                  <p className="font-display text-2xl text-emerald-700">{tc(optionAcceptee.prix_setup).total} $</p>
                  <p className="font-body text-xs text-[var(--color-dark-text-2)]">taxes incluses</p>
                </div>
              )}
              {optionAcceptee.prix_mensuel > 0 && (
                <div>
                  <p className="font-body text-xs text-[var(--color-dark-text-2)] uppercase tracking-widest">Mensuel</p>
                  <p className="font-display text-2xl text-emerald-700">{tc(optionAcceptee.prix_mensuel).total} $/mois</p>
                  <p className="font-body text-xs text-[var(--color-dark-text-2)]">taxes incluses</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toutes les options */}
        <div className="flex flex-col gap-4">
          <h2 className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] flex items-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-sm text-[var(--color-brand)]">list_alt</span>
            Options ({data.options.length})
          </h2>

          {data.options.map(opt => {
            const isOpen = expanded.includes(opt.id)
            const isChosen = opt.id === data.option_acceptee_id
            const txSetup   = tc(opt.prix_setup)
            const txMensuel = tc(opt.prix_mensuel)
            return (
              <div key={opt.id} className={`bg-white rounded-3xl shadow-sm overflow-hidden ${isChosen ? 'ring-2 ring-emerald-400' : ''}`}>
                <button
                  type="button"
                  onClick={() => setExpanded(prev => prev.includes(opt.id) ? prev.filter(v => v !== opt.id) : [...prev, opt.id])}
                  className="w-full flex items-center justify-between px-8 py-5 hover:bg-[var(--color-light-0)] transition-colors"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-body font-bold text-[var(--color-dark-1)]">{opt.nom}</span>
                    {isChosen && (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full font-body">
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Retenue
                      </span>
                    )}
                    {opt.est_recommande === 1 && (
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full font-body">Recommandé</span>
                    )}
                    {opt.badge_texte && (
                      <span className="bg-[var(--color-brand)] text-white text-xs font-bold px-2 py-0.5 rounded-full font-body">{opt.badge_texte}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {opt.prix_setup > 0 && (
                      <span className="font-display text-base text-[var(--color-brand)]">{txSetup.total} $ TTC</span>
                    )}
                    {opt.prix_mensuel > 0 && (
                      <span className="font-body text-sm text-[var(--color-dark-text-2)]">+ {txMensuel.total} $/mois</span>
                    )}
                    <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-dark-text-2)]" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      expand_more
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-8 pb-8 border-t border-[var(--color-light-0)] flex flex-col gap-6 pt-6">

                    {opt.description && (
                      <p className="font-body text-sm text-[var(--color-dark-text-2)]">{opt.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {opt.prix_setup > 0 && (
                        <InfoCard label="Démarrage" value={`${txSetup.total} $`} sub="TPS + TVQ incluses" />
                      )}
                      {opt.prix_mensuel > 0 && (
                        <InfoCard label="Mensuel" value={`${txMensuel.total} $/mois`} sub="TPS + TVQ incluses" />
                      )}
                      {opt.prix_horaire > 0 && (
                        <InfoCard label="Horaire" value={`${opt.prix_horaire} $/h`} />
                      )}
                      {opt.delai_livraison && (
                        <InfoCard label="Delai" value={opt.delai_livraison} />
                      )}
                      {opt.conditions_paiement && (
                        <InfoCard label="Paiement" value={opt.conditions_paiement} />
                      )}
                    </div>

                    {opt.inclus_json.length > 0 && (
                      <div>
                        <p className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-3">Prestations incluses</p>
                        <ul className="flex flex-col gap-1.5">
                          {opt.inclus_json.map((line, li) => (
                            <li key={li} className="flex items-start gap-2 font-body text-sm text-[var(--color-dark-1)]">
                              <span aria-hidden="true" className="material-symbols-outlined text-emerald-500 text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              {line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {opt.couts_tiers_json.length > 0 && (
                      <div>
                        <p className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-3">Frais de services tiers mensuels</p>
                        <table className="w-full text-sm font-body border-collapse">
                          <thead><tr className="bg-[var(--color-light-0)]">
                            <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-[var(--color-dark-text-2)]">Service</th>
                            <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-[var(--color-dark-text-2)]">Cout</th>
                            <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-[var(--color-dark-text-2)]">Note</th>
                          </tr></thead>
                          <tbody>{opt.couts_tiers_json.map((c, ci) => (
                            <tr key={ci} className="border-t border-[var(--color-light-0)]">
                              <td className="px-3 py-2 text-[var(--color-dark-1)]">{c.service}</td>
                              <td className="px-3 py-2 font-bold text-[var(--color-dark-1)]">{c.cout}</td>
                              <td className="px-3 py-2 text-[var(--color-dark-text-2)]">{c.note}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    )}

                    {opt.couts_supplementaires_json.length > 0 && (
                      <div>
                        <p className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-3">Extras possibles</p>
                        <table className="w-full text-sm font-body border-collapse">
                          <thead><tr className="bg-[var(--color-light-0)]">
                            <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-[var(--color-dark-text-2)]">Situation</th>
                            <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-[var(--color-dark-text-2)]">Cout</th>
                          </tr></thead>
                          <tbody>{opt.couts_supplementaires_json.map((c, ci) => (
                            <tr key={ci} className="border-t border-[var(--color-light-0)]">
                              <td className="px-3 py-2 text-[var(--color-dark-1)]">{c.situation}</td>
                              <td className="px-3 py-2 font-bold text-[var(--color-dark-1)]">{c.cout}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    )}

                    {opt.scenarios_json.length > 0 && (
                      <div>
                        <p className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] mb-3">Projections mensuelles</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {opt.scenarios_json.map((sc, si) => (
                            <div key={si} className="bg-[var(--color-light-0)] rounded-2xl p-4">
                              <p className="font-body font-bold text-sm text-[var(--color-dark-1)] mb-2">{sc.titre}</p>
                              <ul className="flex flex-col gap-1">
                                {sc.lignes.map((l, li) => (
                                  <li key={li} className="font-body text-xs text-[var(--color-dark-text-2)]">{l}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[var(--color-light-0)] rounded-2xl p-4">
      <p className="font-body text-xs uppercase tracking-widest text-[var(--color-dark-text-2)] mb-1">{label}</p>
      <p className="font-display text-lg text-[var(--color-dark-1)]">{value}</p>
      {sub && <p className="font-body text-xs text-[var(--color-dark-text-2)] mt-0.5">{sub}</p>}
    </div>
  )
}
