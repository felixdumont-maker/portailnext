'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'

const BTN_BASE: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '13px 32px', borderRadius: '50px', border: 'none',
  background: '#e83b14', fontFamily: "'Bebas Neue', Impact, sans-serif",
  fontSize: '16px', letterSpacing: '2px', color: '#fff',
  textTransform: 'uppercase', cursor: 'pointer',
}

function LocalisationContent() {
  const params  = useSearchParams()
  const router  = useRouter()
  const token   = params.get('token') || ''
  const nom     = params.get('nom') || ''
  const service = params.get('service') || ''
  const creneau = params.get('creneau') || ''

  const [adresse, setAdresse] = useState('')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur]   = useState('')

  async function confirmer() {
    if (!adresse.trim()) {
      setErreur("Veuillez indiquer l'adresse où se déroulera la séance.")
      return
    }
    setErreur('')
    setLoading(true)
    try {
      const res = await fetch('/api/v1/booking/confirm-service/finaliser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, localisation: adresse.trim() }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setErreur(data.error || 'Une erreur est survenue. Veuillez réessayer.')
        setLoading(false)
        return
      }
      const p = new URLSearchParams({
        nom: data.nom || nom,
        creneau: data.creneau || creneau,
        meet: data.meet || '',
        rdv: String(data.rdv || ''),
        start: data.start || '',
        end: data.end || '',
      })
      router.push(`/booking/confirme?${p}`)
    } catch {
      setErreur('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf7f3] flex items-center justify-center p-6">
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ marginBottom: '36px' }}>
          <span style={{
            fontFamily: "'Bebas Neue', Impact, sans-serif",
            fontSize: '22px', letterSpacing: '4px', color: '#e83b14',
          }}>
            Cocktail Média
          </span>
        </div>

        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: '#fff4e9', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#e83b14' }}>
            location_on
          </span>
        </div>

        <h1 style={{
          fontFamily: "'Bebas Neue', Impact, sans-serif",
          fontSize: '28px', letterSpacing: '2px', color: '#2b2b2b',
          textTransform: 'uppercase', margin: '0 0 12px',
        }}>
          Où aura lieu la séance ?
        </h1>

        <p style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: '#888',
          marginBottom: '24px', lineHeight: '1.6',
        }}>
          {nom ? `Bonjour ${nom}, encore` : 'Encore'} une étape avant de confirmer
          {service ? <> votre séance « <strong>{service}</strong> »</> : ' votre rendez-vous'}
          {creneau ? <> du <strong>{creneau}</strong></> : ''} :
          indiquez l&apos;adresse où nous devrons nous présenter.
        </p>

        <div style={{ textAlign: 'left', marginBottom: '8px' }}>
          <label style={{
            display: 'block', fontFamily: 'Montserrat, sans-serif', fontSize: '11px',
            color: '#888', textTransform: 'uppercase', letterSpacing: '1.5px',
            fontWeight: 700, marginBottom: '8px',
          }}>
            Adresse de la séance
          </label>
          <input
            type="text"
            value={adresse}
            onChange={e => setAdresse(e.target.value)}
            placeholder="123 rue Exemple, Trois-Rivières"
            style={{
              width: '100%', padding: '14px 16px', borderRadius: '10px',
              border: '1.5px solid #d8d3cc', fontFamily: 'Montserrat, sans-serif',
              fontSize: '14px', color: '#2b2b2b', boxSizing: 'border-box',
            }}
          />
        </div>

        {erreur && (
          <p style={{ color: '#c5221f', fontFamily: 'Montserrat, sans-serif', fontSize: '13px', margin: '8px 0 0' }}>
            {erreur}
          </p>
        )}

        <div style={{ marginTop: '28px' }}>
          <button onClick={confirmer} disabled={loading} style={{ ...BTN_BASE, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Confirmation…' : 'Confirmer ma réservation'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default function BookingLocalisationPage() {
  return (
    <Suspense>
      <LocalisationContent />
    </Suspense>
  )
}
