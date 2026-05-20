import * as Sentry from '@sentry/nextjs'

// ⚠️  Ajouter NEXT_PUBLIC_SENTRY_DSN dans .env.local
// Obtenir le DSN sur https://sentry.io → Project → Settings → Client Keys
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Capture 10% des transactions en prod pour les perf metrics
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Replay session sur les erreurs (1% normal, 100% sur erreur)
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.replayIntegration(),
    ],

    // Ne pas envoyer en dev local
    enabled: process.env.NODE_ENV === 'production',
  })
}
