'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Client {
  id: number
  nom_complet: string
  nom_entreprise: string | null
  email: string
}

export default function NouveauMarchandPage() {
  const router = useRouter()
  const [clients, setClients]           = useState<Client[]>([])
  const [idClient, setIdClient]         = useState<number | ''>('')
  const [loading, setLoading]           = useState(true)
  const [submitting, setSubmitting]     = useState(false)
  const [erreur, setErreur]             = useState('')

  useEffect(() => {
    fetch('/api/v1/admin/clients', { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .then(data => { setClients(data); setLoading(false) })
  }, [])

  async function creer() {
    if (!idClient) return
    setSubmitting(true)
    setErreur('')
    const res = await fetch('/api/v1/admin/boutique/marchands', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_client: idClient }),
    })
    const data = await res.json()
    if (!res.ok) {
      setErreur(data.error || 'Erreur inconnue')
      setSubmitting(false)
      return
    }
    router.push(`/admin/boutique/${data.id}`)
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-light-text)', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: '0 0 var(--space-8)' }}>
        NOUVEAU MARCHAND
      </h1>

      {loading ? (
        <p style={{ color: 'var(--color-light-text-3)', fontSize: 'var(--text-sm)' }}>Chargement…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-light-text-2)', marginBottom: 'var(--space-2)' }}>
              Client
            </label>
            <select
              value={idClient}
              onChange={e => setIdClient(e.target.value ? Number(e.target.value) : '')}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-light-border)', background: 'var(--color-light-2)',
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-light-text)',
              }}
            >
              <option value="">— Choisir un client —</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nom_entreprise || c.nom_complet} ({c.email})
                </option>
              ))}
            </select>
          </div>

          {erreur && (
            <p style={{ color: 'var(--color-brand)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)', margin: 0 }}>{erreur}</p>
          )}

          <button
            onClick={creer}
            disabled={!idClient || submitting}
            style={{
              alignSelf: 'flex-start',
              background: idClient ? 'var(--color-brand)' : 'var(--color-light-3)',
              color: idClient ? 'white' : 'var(--color-light-text-3)',
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textTransform: 'uppercase',
              border: 'none', padding: '12px 24px', borderRadius: 'var(--radius-full)',
              cursor: idClient ? 'pointer' : 'not-allowed',
            }}
          >
            {submitting ? 'Création…' : 'Créer le marchand'}
          </button>
        </div>
      )}
    </div>
  )
}
