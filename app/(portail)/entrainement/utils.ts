// Helpers de dates/clé/série pour l'entraînement.

const TZ = 'America/Toronto'

/** Date locale du jour au format YYYY-MM-DD (fuseau Québec). */
export function todayISO(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())
}

/** Nom du jour de semaine en français minuscule, ex. "lundi". */
export function todayWeekday(): string {
  return new Intl.DateTimeFormat('fr-CA', { timeZone: TZ, weekday: 'long' })
    .format(new Date())
    .toLowerCase()
}

/** Normalise une chaîne (minuscule, sans accents) pour comparer des noms de jours. */
export function normJour(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim()
}

/** Clé stable d'un exercice dans un plan donné (basée sur sa position). */
export function exerciceKey(jourIndex: number, exoIndex: number): string {
  return `j${jourIndex}-e${exoIndex}`
}

/**
 * Série (streak) = nombre de jours consécutifs, en remontant depuis aujourd'hui
 * (ou hier si rien encore aujourd'hui), où au moins un exercice a été coché.
 */
export function computeStreak(dates: Set<string>): number {
  if (dates.size === 0) return 0
  const fmt = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d)
  const cursor = new Date()
  // Si rien aujourd'hui, on autorise un départ "hier" pour ne pas casser la série en cours de journée.
  if (!dates.has(fmt(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!dates.has(fmt(cursor))) return 0
  }
  let streak = 0
  while (dates.has(fmt(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
