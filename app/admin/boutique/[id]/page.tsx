'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'

interface Marchand {
  id: number
  slug: string
  actif: boolean
  nom_complet: string
  nom_entreprise: string | null
  client_email: string
  square_configure: boolean
  square_location_id: string | null
  interac_configure: boolean
  interac_provider: string | null
}

interface Produit {
  id: number
  nom: string
  description: string | null
  categorie: string | null
  image_url: string | null
  actif: boolean
}

interface Variante {
  id: number
  type_unite: 'piece' | 'poids'
  attribut1: string | null
  attribut2: string | null
  prix_unitaire: string
  stock_disponible: string
  ajustable_apres_vente: boolean
}

const inputStyle: React.CSSProperties = {
  padding: '10px 14px', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-light-border)', background: 'var(--color-light-1)',
  fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text)',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', fontWeight: 700,
  letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-light-text-2)', marginBottom: 'var(--space-2)',
}

const btnStyle: React.CSSProperties = {
  background: 'var(--color-brand)', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700,
  fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textTransform: 'uppercase',
  border: 'none', padding: '10px 20px', borderRadius: 'var(--radius-full)', cursor: 'pointer',
}

function VariantesEditor({ produitId }: { produitId: number }) {
  const [variantes, setVariantes] = useState<Variante[]>([])
  const [typeUnite, setTypeUnite] = useState<'piece' | 'poids'>('piece')
  const [attribut1, setAttribut1] = useState('')
  const [attribut2, setAttribut2] = useState('')
  const [prix, setPrix]           = useState('')
  const [stock, setStock]         = useState('')
  const [ajustable, setAjustable] = useState(false)

  const load = useCallback(() => {
    fetch(`/api/v1/admin/boutique/produits/${produitId}/variantes`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .then(setVariantes)
  }, [produitId])

  useEffect(() => { load() }, [load])

  async function ajouter() {
    if (!prix) return
    await fetch(`/api/v1/admin/boutique/produits/${produitId}/variantes`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type_unite: typeUnite, attribut1: attribut1 || null, attribut2: attribut2 || null,
        prix_unitaire: Number(prix), stock_disponible: Number(stock) || 0, ajustable_apres_vente: ajustable,
      }),
    })
    setAttribut1(''); setAttribut2(''); setPrix(''); setStock(''); setAjustable(false)
    load()
  }

  async function majStock(id: number, nouveauStock: string) {
    await fetch(`/api/v1/admin/boutique/variantes/${id}`, {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock_disponible: Number(nouveauStock) || 0 }),
    })
    load()
  }

  async function supprimer(id: number) {
    await fetch(`/api/v1/admin/boutique/variantes/${id}`, { method: 'DELETE', credentials: 'include' })
    load()
  }

  return (
    <div style={{ padding: 'var(--space-4) var(--space-6)', background: 'var(--color-light-1)', borderTop: '1px solid var(--color-light-border)' }}>
      {variantes.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 'var(--space-4)' }}>
          <thead>
            <tr style={{ fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', textAlign: 'left' }}>
              <th style={{ padding: '4px 8px', fontWeight: 700 }}>Type</th>
              <th style={{ padding: '4px 8px', fontWeight: 700 }}>Attributs</th>
              <th style={{ padding: '4px 8px', fontWeight: 700 }}>Prix</th>
              <th style={{ padding: '4px 8px', fontWeight: 700 }}>Stock</th>
              <th style={{ padding: '4px 8px', fontWeight: 700 }}>Ajustable</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {variantes.map(v => (
              <tr key={v.id} style={{ fontSize: 'var(--text-sm)', borderTop: '1px solid var(--color-light-border)' }}>
                <td style={{ padding: '8px' }}>{v.type_unite === 'piece' ? 'Pièce' : 'Poids (kg)'}</td>
                <td style={{ padding: '8px' }}>{[v.attribut1, v.attribut2].filter(Boolean).join(' · ') || '—'}</td>
                <td style={{ padding: '8px' }}>{Number(v.prix_unitaire).toFixed(2)} $</td>
                <td style={{ padding: '8px' }}>
                  <input
                    type="number" step="0.001" defaultValue={v.stock_disponible}
                    onBlur={e => majStock(v.id, e.target.value)}
                    style={{ ...inputStyle, width: 90, padding: '4px 8px' }}
                  />
                </td>
                <td style={{ padding: '8px' }}>{v.type_unite === 'poids' && v.ajustable_apres_vente ? 'Oui' : '—'}</td>
                <td style={{ padding: '8px' }}>
                  <button onClick={() => supprimer(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-light-text-3)' }}>
                    <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={labelStyle}>Type</label>
          <select value={typeUnite} onChange={e => setTypeUnite(e.target.value as 'piece' | 'poids')} style={inputStyle}>
            <option value="piece">Pièce</option>
            <option value="poids">Poids (kg)</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Attribut 1</label>
          <input value={attribut1} onChange={e => setAttribut1(e.target.value)} placeholder="Grandeur / coupe" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Attribut 2</label>
          <input value={attribut2} onChange={e => setAttribut2(e.target.value)} placeholder="Couleur (optionnel)" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Prix</label>
          <input type="number" step="0.01" value={prix} onChange={e => setPrix(e.target.value)} placeholder="0.00" style={{ ...inputStyle, width: 90 }} />
        </div>
        <div>
          <label style={labelStyle}>Stock</label>
          <input type="number" step="0.001" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" style={{ ...inputStyle, width: 90 }} />
        </div>
        {typeUnite === 'poids' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--color-light-text-2)', marginBottom: 10 }}>
            <input type="checkbox" checked={ajustable} onChange={e => setAjustable(e.target.checked)} />
            Ajustable après vente
          </label>
        )}
        <button onClick={ajouter} style={btnStyle}>Ajouter variante</button>
      </div>
    </div>
  )
}

function CatalogueTab({ marchandId }: { marchandId: number }) {
  const [produits, setProduits]   = useState<Produit[]>([])
  const [ouvert, setOuvert]       = useState<number | null>(null)
  const [nom, setNom]             = useState('')
  const [categorie, setCategorie] = useState('')

  const load = useCallback(() => {
    fetch(`/api/v1/admin/boutique/marchands/${marchandId}/produits`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .then(setProduits)
  }, [marchandId])

  useEffect(() => { load() }, [load])

  async function ajouterProduit() {
    if (!nom) return
    await fetch(`/api/v1/admin/boutique/marchands/${marchandId}/produits`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, categorie: categorie || null }),
    })
    setNom(''); setCategorie('')
    load()
  }

  async function supprimerProduit(id: number) {
    await fetch(`/api/v1/admin/boutique/produits/${id}`, { method: 'DELETE', credentials: 'include' })
    load()
  }

  return (
    <div>
      <div style={{
        display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end',
        marginBottom: 'var(--space-6)', padding: 'var(--space-4)',
        background: 'var(--color-light-2)', borderRadius: 'var(--radius-md)',
      }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Nom du produit</label>
          <input value={nom} onChange={e => setNom(e.target.value)} placeholder="T-shirt, Fromage cheddar…" style={{ ...inputStyle, width: '100%' }} />
        </div>
        <div>
          <label style={labelStyle}>Catégorie</label>
          <input value={categorie} onChange={e => setCategorie(e.target.value)} placeholder="Optionnel" style={inputStyle} />
        </div>
        <button onClick={ajouterProduit} style={btnStyle}>Ajouter produit</button>
      </div>

      {produits.length === 0 ? (
        <p style={{ color: 'var(--color-light-text-3)', fontSize: 'var(--text-sm)' }}>Aucun produit encore.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {produits.map(p => (
            <div key={p.id} style={{ border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <div
                onClick={() => setOuvert(ouvert === p.id ? null : p.id)}
                style={{
                  padding: 'var(--space-4) var(--space-6)', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', cursor: 'pointer', background: 'var(--color-light-2)',
                }}
              >
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-base)', margin: 0, textTransform: 'uppercase' }}>{p.nom}</p>
                  {p.categorie && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: '2px 0 0' }}>{p.categorie}</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <button onClick={e => { e.stopPropagation(); supprimerProduit(p.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-light-text-3)' }}>
                    <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                  </button>
                  <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-light-text-3)' }}>
                    {ouvert === p.id ? 'expand_less' : 'expand_more'}
                  </span>
                </div>
              </div>
              {ouvert === p.id && <VariantesEditor produitId={p.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PaiementTab({ marchand, onUpdated }: { marchand: Marchand; onUpdated: () => void }) {
  const [squareToken, setSquareToken] = useState('')
  const [squareLocation, setSquareLocation] = useState(marchand.square_location_id || '')
  const [interacProvider, setInteracProvider] = useState(marchand.interac_provider || '')
  const [enregistrement, setEnregistrement] = useState(false)

  async function enregistrer() {
    setEnregistrement(true)
    const body: Record<string, unknown> = { square_location_id: squareLocation, interac_provider: interacProvider || null }
    if (squareToken) body.square_access_token = squareToken
    await fetch(`/api/v1/admin/boutique/marchands/${marchand.id}`, {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    setSquareToken('')
    setEnregistrement(false)
    onUpdated()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', maxWidth: 480 }}>
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', textTransform: 'uppercase', margin: '0 0 var(--space-3)' }}>Square</h3>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-4)' }}>
          {marchand.square_configure ? 'Jeton déjà configuré — laisser vide pour ne pas le changer.' : 'Aucun jeton configuré.'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div>
            <label style={labelStyle}>Access Token</label>
            <input type="password" value={squareToken} onChange={e => setSquareToken(e.target.value)} placeholder="•••••••• (sandbox)" style={{ ...inputStyle, width: '100%' }} />
          </div>
          <div>
            <label style={labelStyle}>Location ID</label>
            <input value={squareLocation} onChange={e => setSquareLocation(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', textTransform: 'uppercase', margin: '0 0 var(--space-3)' }}>Interac</h3>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: '0 0 var(--space-4)' }}>
          Fournisseur pas encore déterminé pour ce marchand — champ prêt, intégration réelle = prochaine phase.
        </p>
        <label style={labelStyle}>Fournisseur</label>
        <select value={interacProvider} onChange={e => setInteracProvider(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
          <option value="">— Aucun —</option>
          <option value="vopay">VoPay</option>
          <option value="kapcharge">Kapcharge</option>
        </select>
      </div>

      <button onClick={enregistrer} disabled={enregistrement} style={{ ...btnStyle, alignSelf: 'flex-start' }}>
        {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </div>
  )
}

interface ItemAAjuster {
  commande_item_id: number
  quantite_estimee: string
  prix_estime: string
  variante_id: number
  attribut1: string | null
  attribut2: string | null
  prix_unitaire: string
  produit_nom: string
}

interface CommandeAAjuster {
  id: number
  client_email: string
  client_nom: string | null
  client_telephone: string | null
  notes_ramassage: string | null
  statut: string
  total_estime: string
  created_at: string
  items_a_peser: ItemAAjuster[]
}

function CommandesTab({ marchandId }: { marchandId: number }) {
  const [commandes, setCommandes] = useState<CommandeAAjuster[]>([])
  const [poids, setPoids] = useState<Record<number, string>>({})
  const [enregistrement, setEnregistrement] = useState<number | null>(null)

  const load = useCallback(() => {
    fetch(`/api/v1/admin/boutique/marchands/${marchandId}/commandes-a-ajuster`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .then(setCommandes)
  }, [marchandId])

  useEffect(() => { load() }, [load])

  async function confirmerPesee(commande: CommandeAAjuster) {
    const items = commande.items_a_peser
      .map(it => ({ commande_item_id: it.commande_item_id, quantite_finale: poids[it.commande_item_id] }))
      .filter(it => it.quantite_finale !== undefined && it.quantite_finale !== '')
    if (items.length !== commande.items_a_peser.length) return
    setEnregistrement(commande.id)
    await fetch(`/api/v1/admin/boutique/commandes/${commande.id}/ajuster`, {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items.map(it => ({ ...it, quantite_finale: Number(it.quantite_finale) })) }),
    })
    setEnregistrement(null)
    load()
  }

  if (commandes.length === 0) {
    return (
      <div style={{
        background: 'var(--color-light-2)', border: '1px solid var(--color-light-border)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-12)', textAlign: 'center',
      }}>
        <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-light-text-3)', display: 'block', marginBottom: 'var(--space-3)' }}>scale</span>
        <p style={{ color: 'var(--color-light-text-3)', fontSize: 'var(--text-sm)', margin: 0 }}>Aucune commande à ajuster pour l&apos;instant.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {commandes.map(c => {
        const tousRemplis = c.items_a_peser.every(it => poids[it.commande_item_id])
        return (
          <div key={c.id} style={{ border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5) var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-base)', margin: 0 }}>
                  Commande #{c.id} — {c.client_nom || c.client_email}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: '2px 0 0' }}>
                  {c.client_email}{c.client_telephone ? ` · ${c.client_telephone}` : ''}
                </p>
                {c.notes_ramassage && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-light-text-3)', margin: '4px 0 0', fontStyle: 'italic' }}>
                    {c.notes_ramassage}
                  </p>
                )}
              </div>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-warning)', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
                {c.statut === 'en_attente_pesee' ? 'À peser' : c.statut}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              {c.items_a_peser.map(it => (
                <div key={it.commande_item_id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                  <span style={{ flex: 1 }}>
                    {it.produit_nom}{it.attribut1 ? ` — ${[it.attribut1, it.attribut2].filter(Boolean).join(' · ')}` : ''}
                  </span>
                  <span style={{ color: 'var(--color-light-text-3)', fontSize: 'var(--text-xs)' }}>
                    Estimé : {Number(it.quantite_estimee).toFixed(2)} kg ({Number(it.prix_estime).toFixed(2)} $)
                  </span>
                  <input
                    type="number" step="0.001" placeholder="Poids réel (kg)"
                    value={poids[it.commande_item_id] ?? ''}
                    onChange={e => setPoids(p => ({ ...p, [it.commande_item_id]: e.target.value }))}
                    style={{ ...inputStyle, width: 130 }}
                  />
                  {poids[it.commande_item_id] && (
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-light-text-2)', width: 70 }}>
                      {(Number(poids[it.commande_item_id]) * Number(it.prix_unitaire)).toFixed(2)} $
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => confirmerPesee(c)}
              disabled={!tousRemplis || enregistrement === c.id}
              style={{ ...btnStyle, opacity: tousRemplis ? 1 : 0.4, cursor: tousRemplis ? 'pointer' : 'not-allowed' }}
            >
              {enregistrement === c.id ? 'Enregistrement…' : 'Confirmer la pesée'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default function MarchandDetailPage() {
  const params = useParams()
  const marchandId = Number(params.id)
  const [marchand, setMarchand] = useState<Marchand | null>(null)
  const [onglet, setOnglet]     = useState<'catalogue' | 'commandes' | 'paiement'>('catalogue')

  const load = useCallback(() => {
    fetch(`/api/v1/admin/boutique/marchands/${marchandId}`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(setMarchand)
  }, [marchandId])

  useEffect(() => { load() }, [load])

  if (!marchand) return <p style={{ color: 'var(--color-light-text-3)', fontSize: 'var(--text-sm)' }}>Chargement…</p>

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-light-text)', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
        {marchand.nom_entreprise || marchand.nom_complet}
      </h1>
      <p style={{ color: 'var(--color-light-text-3)', marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-8)' }}>
        {marchand.slug} · {marchand.client_email}
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-light-border)' }}>
        {(['catalogue', 'commandes', 'paiement'] as const).map(t => (
          <button
            key={t}
            onClick={() => setOnglet(t)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '10px 4px',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              color: onglet === t ? 'var(--color-brand)' : 'var(--color-light-text-3)',
              borderBottom: onglet === t ? '2px solid var(--color-brand)' : '2px solid transparent',
              marginRight: 'var(--space-6)',
            }}
          >
            {t === 'catalogue' ? 'Catalogue & inventaire' : t === 'commandes' ? 'Commandes à ajuster' : 'Identifiants de paiement'}
          </button>
        ))}
      </div>

      {onglet === 'catalogue' && <CatalogueTab marchandId={marchand.id} />}
      {onglet === 'commandes' && <CommandesTab marchandId={marchand.id} />}
      {onglet === 'paiement' && <PaiementTab marchand={marchand} onUpdated={load} />}
    </div>
  )
}
