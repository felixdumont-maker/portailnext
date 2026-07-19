// Source unique de vérité pour le type Task/todo et son formatage de date côté front —
// remplace les interfaces quasi identiques dupliquées dans admin/page.tsx (TodoPerso),
// taches/page.tsx (Task) et admin/client/[id]/page.tsx (Todo). Les trois surfaces lisent
// la même requête backend partagée (_todos_query, app.py) ; seuls les champs réellement
// utilisés par chaque page varient, d'où les champs optionnels ci-dessous.
export interface Task {
  id: number
  texte: string
  est_coche: number
  priorite: string
  is_titre?: number
  parent_titre_id?: number | null
  date_echeance?: string | null
  calendar_event_id?: string | null
  projet_id?: number | null
  projet_nom?: string | null
  client_id?: number | null
  // COALESCE(t.client_id, p.id_client) côté backend — le client "effectif" d'une tâche,
  // qu'elle soit assignée directement à un client ou via son projet.
  client_id_effectif?: number | null
  client_nom?: string | null
  contact_nom?: string | null
  contact_telephone?: string | null
  contact_courriel?: string | null
  created_at?: string
  assignees?: { id: number; nom_complet: string }[]
}

// Casse d'origine (PWA) : "18 juil.". Le dashboard desktop l'affiche en majuscules —
// appliquer .toUpperCase() au call site plutôt que dupliquer la fonction pour ça.
export function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' })
}

export function formatDateLong(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })
}

export type Bucket = 'retard' | 'aujourdhui' | 'avenir' | 'sans_date'

export const BUCKET_LABEL: Record<Bucket, string> = {
  retard: 'En retard',
  aujourdhui: "Aujourd'hui",
  avenir: 'À venir',
  sans_date: 'Sans date',
}
export const BUCKET_ORDER: Bucket[] = ['retard', 'aujourdhui', 'avenir', 'sans_date']

export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const todayISO = () => new Date().toISOString().slice(0, 10)

export function bucketOf(dateEcheance: string | null | undefined): Bucket {
  if (!dateEcheance || !ISO_DATE_RE.test(dateEcheance)) return 'sans_date'
  const today = todayISO()
  if (dateEcheance < today) return 'retard'
  if (dateEcheance === today) return 'aujourdhui'
  return 'avenir'
}

// Lecture minimale d'une fiche contact .vcf (FN / TEL / EMAIL) — partagée depuis
// l'app Contacts iOS via "Enregistrer dans Fichiers" puis importée ici.
export function parseVCard(text: string): { nom: string; telephone: string; courriel: string } {
  let nom = '', telephone = '', courriel = ''
  for (const raw of text.split(/\r\n|\r|\n/)) {
    const idx = raw.indexOf(':')
    if (idx < 0) continue
    const key = raw.slice(0, idx).toUpperCase()
    const val = raw.slice(idx + 1).trim()
    if (key.startsWith('FN') && !nom) nom = val
    else if (key.startsWith('TEL') && !telephone) telephone = val
    else if (key.startsWith('EMAIL') && !courriel) courriel = val
  }
  return { nom, telephone, courriel }
}
