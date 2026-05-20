export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Chargement en cours…"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 'var(--space-3)',
      }}
    >
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-brand)', animation: 'loadpulse 1.2s ease-in-out infinite' }} />
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-brand)', animation: 'loadpulse 1.2s ease-in-out 0.2s infinite' }} />
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-brand)', animation: 'loadpulse 1.2s ease-in-out 0.4s infinite' }} />
      <style>{`
        @keyframes loadpulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-label="Chargement en cours…"] div { animation: none; opacity: 1; }
        }
      `}</style>
    </div>
  )
}
