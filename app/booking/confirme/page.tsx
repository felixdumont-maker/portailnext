'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

function fmtUtcForCal(iso: string) {
  return iso.replace(/[-:.]/g, '').slice(0, 15) + 'Z'
}

function googleCalUrl(start: string, end: string, meet: string) {
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: 'Réunion — Cocktail Média',
    dates: `${fmtUtcForCal(start)}/${fmtUtcForCal(end)}`,
    details: meet ? `Rejoignez la réunion Google Meet : ${meet}` : 'Réunion Cocktail Média',
    location: meet || '',
  })
  return `https://calendar.google.com/calendar/render?${p}`
}

function outlookUrl(start: string, end: string, meet: string) {
  const p = new URLSearchParams({
    path: '/calendar/action/compose', rru: 'addevent',
    startdt: start.endsWith('Z') ? start : start + 'Z',
    enddt:   end.endsWith('Z')   ? end   : end   + 'Z',
    subject: 'Réunion — Cocktail Média',
    body: meet ? `Rejoignez la réunion Google Meet : ${meet}` : 'Réunion Cocktail Média',
    location: meet || '',
  })
  return `https://outlook.live.com/owa/?${p}`
}

const BTN_BASE: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '11px 20px', borderRadius: '8px', border: '1.5px solid #d8d3cc',
  background: '#fff', fontFamily: 'Montserrat, sans-serif',
  fontSize: '13px', fontWeight: 700, color: '#2b2b2b',
  textDecoration: 'none', cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
}

function ConfirmationContent() {
  const params   = useSearchParams()
  const nom      = params.get('nom') || ''
  const creneau  = params.get('creneau') || ''
  const meetLink = params.get('meet') || ''
  const rdvId    = params.get('rdv') || ''
  const startUtc = params.get('start') || ''
  const endUtc   = params.get('end') || ''

  const hasCalData = startUtc && endUtc
  const icsUrl     = rdvId ? `/api/v1/rendez-vous/${rdvId}/ics` : null

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

        {/* Icône */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: '#dcfce7', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#16a34a' }}>
            event_available
          </span>
        </div>

        <h1 style={{
          fontFamily: "'Bebas Neue', Impact, sans-serif",
          fontSize: '30px', letterSpacing: '2px', color: '#2b2b2b',
          textTransform: 'uppercase', margin: '0 0 16px',
        }}>
          Rendez-vous confirmé !
        </h1>

        {/* Créneau */}
        {creneau && (
          <div style={{
            background: '#fff', border: '2px solid #e83b14', borderRadius: '10px',
            padding: '14px 24px', margin: '0 auto 24px', maxWidth: '340px',
          }}>
            <p style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: '10px', color: '#e83b14',
              textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, margin: '0 0 4px',
            }}>Votre créneau</p>
            <p style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '20px',
              letterSpacing: '1px', color: '#2b2b2b', textTransform: 'uppercase', margin: 0,
            }}>
              {creneau}
            </p>
          </div>
        )}

        {/* Boutons ajouter à l'agenda */}
        {hasCalData && (
          <div style={{ marginBottom: '28px' }}>
            <p style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: '11px', color: '#888',
              textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, marginBottom: '12px',
            }}>
              Ajouter à mon agenda
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              <a href={googleCalUrl(startUtc, endUtc, meetLink)} target="_blank" rel="noopener noreferrer" style={BTN_BASE}>
                📅 Google Calendar
              </a>
              <a href={outlookUrl(startUtc, endUtc, meetLink)} target="_blank" rel="noopener noreferrer" style={BTN_BASE}>
                📆 Outlook
              </a>
              {icsUrl && (
                <a href={icsUrl} style={BTN_BASE}>
                  ⬇ Apple / .ics
                </a>
              )}
            </div>
          </div>
        )}

        {/* Lien Meet */}
        {meetLink && (
          <div style={{ marginBottom: '28px' }}>
            <a href={meetLink} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '13px 28px', background: '#1a73e8', borderRadius: '50px',
              fontFamily: 'Montserrat, sans-serif', fontSize: '14px', fontWeight: 700,
              color: '#fff', textDecoration: 'none',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M15 8v8H9V8h6m1-2H8c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1zm4 5.5v-1l2-2v6l-2-2v-1z"/>
              </svg>
              Rejoindre la réunion Google Meet
            </a>
          </div>
        )}

        <p style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: '#888',
          marginBottom: '28px', lineHeight: '1.6',
        }}>
          {nom ? `Merci ${nom} !` : 'Merci !'} Une invitation a aussi été envoyée à votre adresse courriel.
        </p>

        <Link href="/dashboard">
          <span style={{
            display: 'inline-block', padding: '13px 32px', background: '#e83b14',
            borderRadius: '50px', fontFamily: "'Bebas Neue', Impact, sans-serif",
            fontSize: '16px', letterSpacing: '2px', color: '#fff',
            textDecoration: 'none', textTransform: 'uppercase',
          }}>
            Accéder à mon portail
          </span>
        </Link>

      </div>
    </div>
  )
}

export default function BookingConfirmePage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  )
}
