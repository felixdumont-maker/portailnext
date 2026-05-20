export default function PigisteLoading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 'var(--space-3)',
    }}>
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: 'var(--color-brand)',
        animation: 'pulse 1.2s ease-in-out infinite',
      }} />
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: 'var(--color-brand)',
        animation: 'pulse 1.2s ease-in-out 0.2s infinite',
      }} />
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: 'var(--color-brand)',
        animation: 'pulse 1.2s ease-in-out 0.4s infinite',
      }} />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
