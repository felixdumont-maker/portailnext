// Source unique de vérité pour les statuts de projet côté front — synchronisée avec
// PHASE_CONFIG (app.py, backend). Remplace les mappings dupliqués qui existaient
// indépendamment dans admin/projets, admin/projet/[id]/edit, (portail)/projet/[id],
// (portail)/projets et (portail)/dashboard — dont deux valeurs legacy ('Finalisation',
// 'Travaux terminés') absentes des données réelles et jamais alignées avec le reste.

export interface StatutMeta {
  label: string;
  progress: number;
  pipeline: boolean;
  bg: string;
  text: string;
  dot: string;
}

export const STATUTS_CANONIQUES = [
  'En attente de rendez-vous',
  'Documents à donner',
  'Documents reçus',
  'Travaux en cours',
  'En révision',
  'Corrections en cours',
  'Complété',
  'Annulé',
] as const;

export type StatutCanonique = (typeof STATUTS_CANONIQUES)[number];

export const STATUT_META: Record<string, StatutMeta> = {
  'En attente de rendez-vous': {
    label: 'En attente de rendez-vous', progress: 0, pipeline: false,
    bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)', dot: 'var(--color-dark-text-2)',
  },
  'Documents à donner': {
    label: 'Documents à donner', progress: 15, pipeline: true,
    bg: 'var(--color-error-bg)', text: 'var(--color-error-text)', dot: 'var(--color-error)',
  },
  'Documents reçus': {
    label: 'Documents reçus', progress: 30, pipeline: true,
    bg: 'var(--color-info-bg)', text: 'var(--color-info-text)', dot: 'var(--color-info)',
  },
  'Travaux en cours': {
    label: 'Travaux en cours', progress: 45, pipeline: true,
    bg: 'var(--color-warning-bg)', text: 'var(--color-warning-text)', dot: 'var(--color-warning)',
  },
  'En révision': {
    label: 'En révision', progress: 80, pipeline: true,
    bg: 'var(--color-brand-muted)', text: 'var(--color-brand)', dot: 'var(--color-brand)',
  },
  'Corrections en cours': {
    label: 'Corrections en cours', progress: 85, pipeline: false,
    bg: 'var(--color-teal-bg)', text: 'var(--color-teal-text)', dot: 'var(--color-teal-text)',
  },
  'Complété': {
    label: 'Complété', progress: 100, pipeline: true,
    bg: 'var(--color-success-bg)', text: 'var(--color-success-text)', dot: 'var(--color-success)',
  },
  'Annulé': {
    label: 'Annulé', progress: 0, pipeline: false,
    bg: 'var(--color-light-border)', text: 'var(--color-dark-text-2)', dot: 'var(--color-dark-text-2)',
  },
};

export function statutMeta(statut: string | null | undefined): StatutMeta {
  return STATUT_META[statut || ''] || STATUT_META['Annulé'];
}

export function statutProgress(statut: string | null | undefined): number {
  return statutMeta(statut).progress;
}

export function isStatutFinal(statut: string | null | undefined): boolean {
  return statut === 'Complété' || statut === 'Annulé';
}

/** Index de l'étape courante (1-based) dans le pipeline réel du projet — pipelineSteps
 *  vient de l'API (`pipeline_steps`), déjà adapté au service (rendez-vous/documents requis
 *  ou non). Retourne 0 si le statut courant n'est pas une étape du pipeline (ex. Annulé). */
export function pipelineStepIndex(pipelineSteps: string[], statut: string | null | undefined): number {
  const idx = pipelineSteps.indexOf(statut || '');
  return idx === -1 ? 0 : idx + 1;
}
