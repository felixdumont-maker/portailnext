// Contrat de données d'un plan d'entraînement.
// La source (seed en dur aujourd'hui, éditeur admin demain) écrit ce même JSON
// dans entrainement_plans.contenu_json — l'affichage ne change pas.

export interface Exercice {
  nom: string
  duree?: string      // ex. "10 min"
  series?: string     // ex. "2 × 30 sec"
  consigne?: string   // conseil / rappel doux
  video?: string      // lien démonstration (optionnel)
  images?: string[]   // 2 images (départ/arrivée) → animation cross-fade du mouvement
  lottie?: string     // chemin d'un Lottie JSON illustré (prioritaire sur images)
}

export interface Jour {
  jour: string        // "Lundi", "Mardi"… (ou "Jour 1")
  focus?: string      // thème du jour, ex. "Mobilité douce"
  intro?: string      // consigne d'ouverture du jour (échauffement, progression…)
  repos?: boolean     // jour de repos (pas d'exercices à cocher)
  exercices: Exercice[]
}

export interface BlocSecurite {
  titre: string
  texte: string
}

export interface Contenu {
  principe?: string          // principe directeur, mis en avant en intro
  jours: Jour[]
  securite?: BlocSecurite[]  // règles de sécurité importantes (affichées bien visibles)
  avertissement?: string     // petit rappel de bas de page (ex. « pas un avis médical »)
}

export interface Plan {
  id: number
  titre: string | null
  note: string | null
  contenu: Contenu
  created_at: string | null
}

export interface ProgressEntry {
  exercice_key: string
  date: string        // YYYY-MM-DD
}
